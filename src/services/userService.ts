import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import {
  AuthAccountType,
  getAccountIdentity,
  isSyntheticUsernameEmail,
  UserLikeForIdentity,
} from '../lib/usernameAuth';

export interface UserDocumentData {
  userId: string;
  email: string;
  displayName: string;
  authType?: AuthAccountType;
  username?: string;
  createdAt?: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface EnsureUserDocumentOptions {
  authType?: AuthAccountType;
  username?: string;
}

type EnsureUserInput =
  | User
  | (UserLikeForIdentity & {
      uid: string;
    })
  | string;

// In-memory set to prevent multiple duplicate background retry loops for the same uid
const activeRetryUids = new Set<string>();

/**
 * Đảm bảo tài liệu người dùng (profile/defaults) tồn tại trên Firestore.
 * Hàm này có tính bất biến (idempotent), sử dụng setDoc với { merge: true }
 * để không ghi đè dữ liệu có sẵn (như themeSettings hay preferences).
 */
export async function ensureUserDocument(
  userOrUid: EnsureUserInput,
  options?: EnsureUserDocumentOptions
): Promise<void> {
  if (!db) {
    throw new Error('Firestore chưa được khởi tạo hoặc không khả dụng.');
  }

  const uid = typeof userOrUid === 'string' ? userOrUid : userOrUid.uid;
  const identity = typeof userOrUid !== 'string' ? getAccountIdentity(userOrUid) : null;
  const publicEmail = identity?.publicEmail || '';
  const resolvedUsername = options?.username || identity?.username || undefined;
  const inferredAuthType: AuthAccountType | undefined = options?.authType || identity?.primaryType;

  const displayName =
    typeof userOrUid !== 'string' && userOrUid.displayName
      ? userOrUid.displayName
      : resolvedUsername
      ? resolvedUsername
      : publicEmail
      ? publicEmail.split('@')[0]
      : 'Lập trình viên';

  const userDocRef = doc(db, 'users', uid);
  const now = new Date().toISOString();

  try {
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      // Tài liệu chưa tồn tại -> tạo mới với các trường mặc định
      const newDoc: UserDocumentData = {
        userId: uid,
        email: publicEmail,
        displayName: displayName || 'Lập trình viên',
        ...(inferredAuthType ? { authType: inferredAuthType } : {}),
        ...(resolvedUsername ? { username: resolvedUsername } : {}),
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };
      await setDoc(userDocRef, newDoc, { merge: true });
      console.log(`[Firestore:profile] Đã tạo thành công tài liệu người dùng mới cho ${uid}`);
    } else {
      // Tài liệu đã có -> cập nhật lastLoginAt và updatedAt
      const updateData: Partial<UserDocumentData> = {
        userId: uid,
        lastLoginAt: now,
        updatedAt: now,
      };
      // Bổ sung email công khai / displayName / authType / username nếu thiếu hoặc cần đồng bộ
      const existingData = snap.data();
      if (!existingData.email && publicEmail) {
        updateData.email = publicEmail;
      } else if (typeof existingData.email === 'string' && isSyntheticUsernameEmail(existingData.email)) {
        updateData.email = publicEmail;
      }
      if (!existingData.displayName && displayName) {
        updateData.displayName = displayName;
      }
      if (!existingData.authType && inferredAuthType) {
        updateData.authType = inferredAuthType;
      } else if (options?.authType && existingData.authType !== 'username') {
        updateData.authType = options.authType;
      }
      if (!existingData.username && resolvedUsername) {
        updateData.username = resolvedUsername;
      }

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
  user: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    providerData?: ReadonlyArray<{ providerId?: string | null }>;
  },
  onSuccess?: () => void,
  onFinalFailure?: (err: unknown) => void,
  options?: EnsureUserDocumentOptions
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
      await ensureUserDocument(user, options);
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
