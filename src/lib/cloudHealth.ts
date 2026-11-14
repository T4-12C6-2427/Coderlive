import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import {
  auth,
  db,
  rtdb,
  rtdbUrl,
  normalizeRealtimeDatabaseUrl,
  firebaseConfig,
  isFirebaseConfigValid,
  firestorePersistenceMode,
  firestorePersistenceError,
} from './firebase';
import { getActiveCollabSessionMetrics } from './CollabProvider';
import { User } from 'firebase/auth';
import { getUserDiagnosticLabel } from './usernameAuth';

export interface CloudCheckItem {
  id: string;
  name: string;
  status: 'success' | 'warning' | 'error' | 'running';
  details: string;
  recommendation?: string;
}

export interface CloudDiagnosticResult {
  timestamp: string;
  domain: string;
  projectId: string;
  databaseId: string;
  overallStatus: 'healthy' | 'warning' | 'error';
  checks: CloudCheckItem[];
  reportText: string;
}

/**
 * Kiểm tra toàn diện kết nối đám mây Firebase (Auth, Firestore, Config, Domain)
 */
export async function runCloudDiagnostic(currentUser: User | null): Promise<CloudDiagnosticResult> {
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  const projectId = (firebaseConfig as any)?.projectId || 'Chưa cấu hình';
  const databaseId = (firebaseConfig as any)?.firestoreDatabaseId || '(mặc định)';
  const now = new Date().toLocaleString('vi-VN');

  const checks: CloudCheckItem[] = [];

  // 1. Kiểm tra cấu hình Firebase
  const hasApiKey = Boolean(firebaseConfig?.apiKey);
  const hasAuthDomain = Boolean((firebaseConfig as any)?.authDomain);
  const hasProjectId = Boolean(projectId && projectId !== 'remixed-project-id');
  const hasAppId = Boolean((firebaseConfig as any)?.appId);

  const envRtdbUrl = String((import.meta as any).env?.VITE_FIREBASE_DATABASE_URL || '').trim();
  const hasInvalidEnvRtdbUrl = Boolean(envRtdbUrl) && !normalizeRealtimeDatabaseUrl(envRtdbUrl);
  const configRtdbUrl = String(firebaseConfig?.databaseURL || '').trim();
  const configuredRtdbUrl = rtdbUrl || '';

  if (isFirebaseConfigValid && hasApiKey && hasAuthDomain && hasProjectId && hasAppId) {
    checks.push({
      id: 'config',
      name: 'Cấu hình Firebase (firebase-applet-config.json)',
      status: 'success',
      details: `Đầy đủ: apiKey, authDomain, projectId (${projectId}), appId${configuredRtdbUrl || configRtdbUrl ? ', databaseURL' : ''}.`,
    });
  } else {
    const missing: string[] = [];
    if (!hasApiKey) missing.push('apiKey');
    if (!hasAuthDomain) missing.push('authDomain');
    if (!hasProjectId) missing.push('projectId');
    if (!hasAppId) missing.push('appId');

    checks.push({
      id: 'config',
      name: 'Cấu hình Firebase (firebase-applet-config.json)',
      status: 'error',
      details: `Thiếu các trường: ${missing.join(', ')}.`,
      recommendation: 'Cần cập nhật firebase-applet-config.json với thông tin project hợp lệ.',
    });
  }

  // 2. Kiểm tra tên miền hiện tại (Domain check)
  const isLocal = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
  const authDomainVal = (firebaseConfig as any)?.authDomain || '';
  checks.push({
    id: 'domain',
    name: 'Tên miền hiện tại & Cấp quyền (Authorized Domains)',
    status: 'success',
    details: `Tên miền: ${currentDomain} (AuthDomain cấu hình: ${authDomainVal || 'chưa có'}).`,
    recommendation: 'Nếu gặp lỗi unauthorized-domain, hãy thêm tên miền này vào Firebase Console > Authentication > Settings > Authorized domains.',
  });

  // 3. Kiểm tra khả năng kết nối Auth & Phương thức Email/Mật khẩu
  if (!auth) {
    checks.push({
      id: 'auth_connection',
      name: 'Máy chủ Firebase Authentication',
      status: 'error',
      details: 'Đối tượng Auth chưa được khởi tạo.',
      recommendation: 'Kiểm tra cấu hình Firebase.',
    });
    checks.push({
      id: 'email_password_provider',
      name: 'Phương thức Đăng ký Email/Mật khẩu',
      status: 'error',
      details: 'Không thể kiểm tra do Auth chưa khởi tạo.',
    });
  } else {
    // Thử nghiệm probe an toàn để xác minh phương thức Email/Password
    try {
      await signInWithEmailAndPassword(auth, 'probe-check-status-never-exists@domain.invalid', 'probe-pass-check-123456');
      // Nếu thành công (không bao giờ xảy ra với tài khoản giả này)
      checks.push({
        id: 'auth_connection',
        name: 'Máy chủ Firebase Authentication',
        status: 'success',
        details: 'Máy chủ Authentication đã kết nối và phản hồi bình thường.',
      });
      checks.push({
        id: 'email_password_provider',
        name: 'Phương thức Đăng ký Email/Mật khẩu',
        status: 'success',
        details: 'Phương thức Email/Mật khẩu đã được bật và sẵn sàng nhận đăng ký.',
      });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        checks.push({
          id: 'auth_connection',
          name: 'Máy chủ Firebase Authentication',
          status: 'success',
          details: 'Máy chủ Auth kết nối bình thường.',
        });
        checks.push({
          id: 'email_password_provider',
          name: 'Phương thức Đăng ký Email/Mật khẩu',
          status: 'error',
          details: 'Phương thức Email/Password CHƯA ĐƯỢC BẬT trong Firebase Console (mã: auth/operation-not-allowed).',
          recommendation: 'Vào Firebase Console > Authentication > Sign-in method > Nhấp Email/Password > Bật (Enable) > Lưu.',
        });
      } else if (code === 'auth/unauthorized-domain') {
        checks.push({
          id: 'auth_connection',
          name: 'Máy chủ Firebase Authentication',
          status: 'warning',
          details: `Tên miền "${currentDomain}" chưa được thêm vào Authorized domains (mã: auth/unauthorized-domain).`,
          recommendation: 'Vào Firebase Console > Authentication > Settings > Authorized domains > Thêm tên miền này.',
        });
        checks.push({
          id: 'email_password_provider',
          name: 'Phương thức Đăng ký Email/Mật khẩu',
          status: 'warning',
          details: 'Chưa thể xác nhận do tên miền bị chặn.',
        });
      } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        checks.push({
          id: 'auth_connection',
          name: 'Máy chủ Firebase Authentication',
          status: 'success',
          details: 'Máy chủ Auth phản hồi chính xác và xác thực đang hoạt động.',
        });
        checks.push({
          id: 'email_password_provider',
          name: 'Phương thức Đăng ký Tên đăng nhập & Email/Mật khẩu',
          status: 'success',
          details: 'Phương thức Email/Mật khẩu đã được bật (sẵn sàng cho cả tài khoản Tên đăng nhập và Email).',
        });
      } else if (code === 'auth/network-request-failed') {
        checks.push({
          id: 'auth_connection',
          name: 'Máy chủ Firebase Authentication',
          status: 'error',
          details: 'Lỗi kết nối mạng (auth/network-request-failed).',
          recommendation: 'Kiểm tra đường truyền Internet của bạn.',
        });
        checks.push({
          id: 'email_password_provider',
          name: 'Phương thức Đăng ký Email/Mật khẩu',
          status: 'warning',
          details: 'Không thể kiểm tra do mạng gián đoạn.',
        });
      } else {
        checks.push({
          id: 'auth_connection',
          name: 'Máy chủ Firebase Authentication',
          status: 'success',
          details: `Máy chủ phản hồi với mã: ${code}`,
        });
        checks.push({
          id: 'email_password_provider',
          name: 'Phương thức Đăng ký Email/Mật khẩu',
          status: 'success',
          details: `Đã phản hồi (mã: ${code}).`,
        });
      }
    }
  }

  // 4. Kiểm tra Firestore Database & Quyền Ghi / Đọc
  if (!db) {
    checks.push({
      id: 'firestore_connection',
      name: 'Cơ sở dữ liệu Cloud Firestore',
      status: 'error',
      details: 'Đối tượng Firestore chưa được khởi tạo.',
      recommendation: 'Kiểm tra cấu hình cơ sở dữ liệu và firestoreDatabaseId.',
    });
  } else if (currentUser) {
    // Người dùng đã đăng nhập -> kiểm tra thực tế đọc & ghi tài liệu sức khỏe
    try {
      const healthDocRef = doc(db, 'users', currentUser.uid);
      const testTimestamp = new Date().toISOString();
      await setDoc(healthDocRef, { _lastHealthCheck: testTimestamp }, { merge: true });
      const snap = await getDoc(healthDocRef);
      if (snap.exists()) {
        checks.push({
          id: 'firestore_connection',
          name: 'Cloud Firestore (Đọc & Ghi thực tế)',
          status: 'success',
          details: `Kết nối thành công! Đã ghi và đọc thử nghiệm thành công tại users/${currentUser.uid}.`,
        });
      } else {
        checks.push({
          id: 'firestore_connection',
          name: 'Cloud Firestore (Đọc & Ghi thực tế)',
          status: 'warning',
          details: 'Ghi không báo lỗi nhưng không tìm thấy dữ liệu đọc lại.',
        });
      }
    } catch (fsErr: any) {
      const code = fsErr?.code || fsErr?.message || '';
      if (code.includes('permission-denied') || fsErr?.message?.includes('insufficient permissions')) {
        checks.push({
          id: 'firestore_connection',
          name: 'Cloud Firestore (Quyền truy cập Rules)',
          status: 'error',
          details: 'Bị từ chối quyền ghi/đọc (mã: permission-denied). Firestore Rules đang chặn ghi vào users/{uid}.',
          recommendation: 'Cần cập nhật và xuất bản (Publish) lại Firestore Rules cho phép users/{userId} và users/{userId}/{document=**}.',
        });
      } else if (code.includes('not-found') || fsErr?.message?.includes('not found')) {
        checks.push({
          id: 'firestore_connection',
          name: 'Cloud Firestore (Cơ sở dữ liệu)',
          status: 'error',
          details: `Cơ sở dữ liệu "${databaseId}" chưa được tạo trong Firebase project ${projectId}.`,
          recommendation: 'Vào Firebase Console > Firestore Database và nhấn Create Database.',
        });
      } else {
        checks.push({
          id: 'firestore_connection',
          name: 'Cloud Firestore (Kết nối)',
          status: 'warning',
          details: `Lỗi kết nối Firestore: ${fsErr?.message || code}`,
          recommendation: 'Kiểm tra trạng thái mạng hoặc phân quyền cơ sở dữ liệu.',
        });
      }
    }
  } else {
    // Khách chưa đăng nhập -> kiểm tra kết nối cơ bản
    try {
      const testDocRef = doc(db, 'test', 'connection');
      await getDoc(testDocRef);
      checks.push({
        id: 'firestore_connection',
        name: 'Cloud Firestore (Chế độ Khách)',
        status: 'success',
        details: 'Cơ sở dữ liệu Firestore đã kết nối và phản hồi. (Để kiểm tra quyền ghi tài khoản, vui lòng đăng nhập).',
      });
    } catch (fsErr: any) {
      const code = fsErr?.code || fsErr?.message || '';
      if (code.includes('permission-denied')) {
        // permission-denied chứng tỏ database tồn tại và rules đang đánh giá
        checks.push({
          id: 'firestore_connection',
          name: 'Cloud Firestore (Chế độ Khách)',
          status: 'success',
          details: 'Cơ sở dữ liệu Firestore trực tuyến và bảo vệ bởi Security Rules.',
        });
      } else if (code.includes('not-found')) {
        checks.push({
          id: 'firestore_connection',
          name: 'Cloud Firestore (Cơ sở dữ liệu)',
          status: 'error',
          details: `Không tìm thấy cơ sở dữ liệu "${databaseId}" trong project ${projectId}.`,
          recommendation: 'Vào Firebase Console > Firestore Database để tạo cơ sở dữ liệu.',
        });
      } else {
        checks.push({
          id: 'firestore_connection',
          name: 'Cloud Firestore (Chế độ Khách)',
          status: 'warning',
          details: `Phản hồi Firestore: ${code}`,
        });
      }
    }
  }

  // 5. Kiểm tra Firebase Realtime Database (Hiện diện trực tuyến)
  const rtdbInstance = rtdb;

  if (!rtdbInstance || !configuredRtdbUrl) {
    checks.push({
      id: 'rtdb_connection',
      name: 'Firebase Realtime Database (Hiện diện trực tuyến)',
      status: 'warning',
      details: hasInvalidEnvRtdbUrl
        ? 'Biến môi trường VITE_FIREBASE_DATABASE_URL đang chứa liên kết không hợp lệ (ví dụ URL trang quản trị Console thay vì URL gốc *.firebasedatabase.app).'
        : 'Chưa cấu hình URL Realtime Database (VITE_FIREBASE_DATABASE_URL hoặc databaseURL). Các dự án nhóm vẫn đồng bộ mã qua Firestore, nhưng con trỏ & danh sách trực tuyến cần Realtime Database.',
      recommendation:
        'Dùng URL gốc dạng https://<project>-default-rtdb.<region>.firebasedatabase.app (không kèm đường dẫn con) trong firebase-applet-config.json hoặc VITE_FIREBASE_DATABASE_URL.',
    });
  } else {
    const connected = await new Promise<boolean>((resolve) => {
      let settled = false;
      let unsub: (() => void) | null = null;
      const cleanup = () => {
        if (unsub) {
          unsub();
          unsub = null;
        }
      };
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          resolve(false);
        }
      }, 5000);
      const connRef = ref(rtdbInstance, '.info/connected');
      unsub = onValue(
        connRef,
        (snap) => {
          if (snap.val() === true && !settled) {
            settled = true;
            clearTimeout(timer);
            setTimeout(cleanup, 0);
            resolve(true);
          }
        },
        () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            setTimeout(cleanup, 0);
            resolve(false);
          }
        }
      );
    });

    if (connected) {
      checks.push({
        id: 'rtdb_connection',
        name: 'Firebase Realtime Database (Hiện diện trực tuyến)',
        status: 'success',
        details: `Đã kết nối Realtime Database (${configuredRtdbUrl}).`,
      });
    } else {
      checks.push({
        id: 'rtdb_connection',
        name: 'Firebase Realtime Database (Hiện diện trực tuyến)',
        status: 'warning',
        details: `Chưa nhận được phản hồi kết nối từ ${configuredRtdbUrl} trong 5 giây.`,
        recommendation:
          'Kiểm tra xem Realtime Database đã được tạo đúng vùng và URL VITE_FIREBASE_DATABASE_URL / databaseURL có chính xác hay chưa.',
      });
    }
  }

  // 6. Kiểm tra bộ nhớ đệm ngoại tuyến Firestore đa tab & hiệu suất đồng bộ nhóm
  if (firestorePersistenceMode === 'persistent-multi-tab') {
    checks.push({
      id: 'firestore_persistence',
      name: 'Bộ nhớ đệm cục bộ Firestore (Đa tab IndexedDB)',
      status: 'success',
      details:
        'Đã bật bộ nhớ đệm IndexedDB đa tab cho phép mở lại bản chụp tức thì và giữ hàng đợi ngoại tuyến.',
    });
  } else if (firestorePersistenceMode === 'memory-fallback') {
    checks.push({
      id: 'firestore_persistence',
      name: 'Bộ nhớ đệm cục bộ Firestore (Chế độ dự phòng bộ nhớ)',
      status: 'warning',
      details: `Trình duyệt không hỗ trợ hoặc đang chặn IndexedDB (${firestorePersistenceError || 'chế độ ẩn danh'}). Hệ thống tự động dùng bộ nhớ tạm và localStorage dự phòng.`,
    });
  }

  const collabMetrics = getActiveCollabSessionMetrics();
  if (collabMetrics) {
    checks.push({
      id: 'collab_sync_metrics',
      name: 'Thống kê đồng bộ phiên làm việc nhóm hiện tại',
      status: collabMetrics.writesCount >= 250 ? 'warning' : 'success',
      details: `Đọc: ${collabMetrics.readsCount} lượt (${Math.round(collabMetrics.bytesRead / 1024)} KB) • Ghi: ${collabMetrics.writesCount} lượt (${collabMetrics.chunkWritesCount} gói cập nhật, ${collabMetrics.snapshotWritesCount} bản chụp) • Nén gọn: ${collabMetrics.compactionsCount} lần.`,
    });
  }

  // Đánh giá tổng quan
  let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
  if (checks.some((c) => c.status === 'error')) {
    overallStatus = 'error';
  } else if (checks.some((c) => c.status === 'warning')) {
    overallStatus = 'warning';
  }

  // Tạo nội dung báo cáo văn bản để sao chép
  const reportLines = [
    '========================================',
    'BÁO CÁO KIỂM TRA KẾT NỐI ĐÁM MÂY (Coderlive)',
    '========================================',
    `Thời gian kiểm tra: ${now}`,
    `Tên miền hiện tại: ${currentDomain}`,
    `Firebase Project ID: ${projectId}`,
    `Firestore Database ID: ${databaseId}`,
    `Realtime Database URL: ${configuredRtdbUrl || '(chưa cấu hình)'}`,
    `Trạng thái người dùng: ${currentUser ? `Đã đăng nhập (${getUserDiagnosticLabel(currentUser)})` : 'Khách (Guest)'}`,
    `Đánh giá chung: ${overallStatus === 'healthy' ? '✓ TẤT CẢ HOẠT ĐỘNG TỐT' : overallStatus === 'warning' ? '⚠ CẦN LƯU Ý' : '✗ CÓ LỖI CẦN CẤU HÌNH'}`,
    '',
    'CHI TIẾT KIỂM TRA:',
  ];

  checks.forEach((chk) => {
    const symbol = chk.status === 'success' ? '[✓]' : chk.status === 'warning' ? '[⚠]' : '[✗]';
    reportLines.push(`${symbol} ${chk.name}`);
    reportLines.push(`    Chi tiết: ${chk.details}`);
    if (chk.recommendation) {
      reportLines.push(`    Khuyến nghị: ${chk.recommendation}`);
    }
  });

  reportLines.push('');
  reportLines.push('========================================');

  return {
    timestamp: now,
    domain: currentDomain,
    projectId,
    databaseId,
    overallStatus,
    checks,
    reportText: reportLines.join('\n'),
  };
}
