import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';

export interface UserDocumentData {
  userId: string;
  email: string;
  displayName: string;
  createdAt?: string;
  updatedAt: string;
  lastLoginAt: string;
}

// In-memory set to prevent multiple duplicate background retry loops for the same uid
const activeRetryUids = new Set<string>();

/**
 * Đảm bảo tài liệu người dùng (profile/defaults) tồn tại trên Firestore.
 * Hàm này có tính bất biến (idempotent), sử dụng setDoc với { merge: true }
 * để không ghi đè dữ liệu có sẵn (như themeSettings hay preferences).
 */
export async function ensureUserDocument(
  userOrUid: User | { uid: string; email?: string | null; displayName?: string | null } | string
): Promise<void> {
  if (!db) {
    throw new Error('Firestore chưa được khởi tạo hoặc không khả dụng.');
  }

  const uid = typeof userOrUid === 'string' ? userOrUid : userOrUid.uid;
  const email = typeof userOrUid !== 'string' && userOrUid.email ? userOrUid.email : '';
  const displayName =
    typeof userOrUid !== 'string' && userOrUid.displayName
      ? userOrUid.displayName
      : email
      ? email.split('@')[0]
      : 'Lập trình viên';

  const userDocRef = doc(db, 'users', uid);
  const now = new Date().toISOString();

  try {
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      // Tài liệu chưa tồn tại -> tạo mới với các trường mặc định
      const newDoc: UserDocumentData = {
        userId: uid,
        email: email || '',
        displayName: displayName || 'Lập trình viên',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };
      await setDoc(userDocRef, newDoc, { merge: true });
      console.log(`[Firestore:profile] Đã tạo thành công tài liệu người dùng mới cho ${uid} (${email})`);
    } else {
      // Tài liệu đã có -> cập nhật lastLoginAt và updatedAt
      const updateData: Partial<UserDocumentData> = {
        userId: uid,
        lastLoginAt: now,
        updatedAt: now,
      };
      // Bổ sung email / displayName nếu tài liệu trước đó bị thiếu
      const existingData = snap.data();
      if (!existingData.email && email) updateData.email = email;
      if (!existingData.displayName && displayName) updateData.displayName = displayName;

      await setDoc(userDocRef, updateData, { merge: true });
      console.log(`[Firestore:profile] Đã xác thực và cập nhật tài liệu người dùng cho ${uid}`);
    }
  } catch (error) {
    console.error(`[Firestore:profile] Lỗi khi tạo/kiểm tra tài liệu người dùng (uid: ${uid}):`, error);
    throw error;
  }
}

/**
 * Thử lại tự động trong nền với cơ chế Exponential Backoff (1s, 2s, 4s, tối đa 3 lần).
 * Giúp tự động hàn gắn tài khoản (self-healing) nếu quá trình lưu lên Firestore ban đầu gặp sự cố.
 */
export function retryEnsureUserDocumentInBackground(
  user: { uid: string; email?: string | null; displayName?: string | null },
  onSuccess?: () => void,
  onFinalFailure?: (err: unknown) => void
): void {
  const uid = user.uid;
  if (activeRetryUids.has(uid)) {
    return; // Đang có tác vụ thử lại cho tài khoản này
  }

  activeRetryUids.add(uid);
  const delays = [1000, 2000, 4000]; // 1s, 2s, 4s
  let attempt = 0;

  const attemptRetry = async () => {
    attempt++;
    console.log(`[Firestore:profile] Đang thử lại đồng bộ dữ liệu người dùng lần ${attempt}/3 cho ${uid}...`);
    try {
      await ensureUserDocument(user);
      activeRetryUids.delete(uid);
      console.log(`[Firestore:profile] Tự động đồng bộ tài liệu người dùng thành công ở lần ${attempt}!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn(`[Firestore:profile] Lần thử lại ${attempt}/3 thất bại:`, err);
      if (attempt < delays.length) {
        setTimeout(attemptRetry, delays[attempt]);
      } else {
        activeRetryUids.delete(uid);
        console.error(`[Firestore:profile] Đã thử lại 3 lần nhưng chưa đồng bộ được cho ${uid}. Sẽ tự động thử lại khi đăng nhập tiếp theo.`, err);
        if (onFinalFailure) onFinalFailure(err);
      }
    }
  };

  setTimeout(attemptRetry, delays[0]);
}
