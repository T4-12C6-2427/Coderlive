import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { User } from 'firebase/auth';
import {
  AuthAccountType,
  getAccountIdentity,
  getVerifiedPublicEmail,
  isSyntheticUsernameEmail,
  UserLikeForIdentity,
} from '../lib/usernameAuth';
import { PublicUserProfile, UserPrivacySettings, UserSearchResult } from '../types';

export const DEFAULT_USER_PRIVACY_SETTINGS: UserPrivacySettings = {
  allowProfileSearch: false,
  allowEmailSearch: false,
  acceptDirectInvites: true,
};

export interface UserDocumentData {
  userId: string;
  email: string;
  displayName: string;
  authType?: AuthAccountType;
  username?: string;
  photoURL?: string | null;
  privacy?: UserPrivacySettings;
  indexedEmailHash?: string | null;
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

export function normalizeUserPrivacySettings(raw: any): UserPrivacySettings {
  return {
    allowProfileSearch: Boolean(raw?.allowProfileSearch),
    allowEmailSearch: Boolean(raw?.allowEmailSearch),
    acceptDirectInvites: raw?.acceptDirectInvites !== false,
  };
}

/**
 * Băm email chuẩn hóa (lowercase + trim) bằng SHA-256 để tra cứu chính xác 1-1 mà không lộ email thô trong document ID.
 */
export async function hashEmailForLookup(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || isSyntheticUsernameEmail(normalized) || !normalized.includes('@')) {
    return null;
  }
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return null;
  }
  const encoded = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function sanitizePublicDisplayName(
  rawName: string | null | undefined,
  username?: string | null,
  publicEmail?: string | null
): string {
  const trimmed = (rawName || '').trim();
  if (trimmed && !isSyntheticUsernameEmail(trimmed) && !trimmed.includes('@users.coderlive.app')) {
    return trimmed.slice(0, 100);
  }
  if (username) return username.slice(0, 100);
  if (publicEmail) return publicEmail.split('@')[0].slice(0, 100);
  return 'Lập trình viên';
}

/**
 * Đồng bộ hồ sơ tìm kiếm công khai (`publicProfiles/{uid}`) và bảng tra cứu email xác minh (`emailLookup/{hash}`).
 * Tuyệt đối không bao giờ lưu email ảo `@users.coderlive.app`.
 */
export async function syncPublicDiscoveryProfile(
  userLike: UserLikeForIdentity & { uid: string },
  privacy: UserPrivacySettings,
  options?: {
    usernameOverride?: string;
    previousIndexedEmailHash?: string | null;
  }
): Promise<string | null> {
  if (!db) return null;

  const uid = userLike.uid;
  const now = new Date().toISOString();
  const identity = getAccountIdentity(userLike);
  const resolvedUsername = (options?.usernameOverride || identity.username || '').trim() || null;
  const verifiedEmail = getVerifiedPublicEmail(userLike);
  const safeDisplayName = sanitizePublicDisplayName(
    userLike.displayName,
    resolvedUsername,
    identity.publicEmail
  );

  const effectiveAllowEmailSearch = Boolean(verifiedEmail && privacy.allowEmailSearch);
  const publicProfilePayload: PublicUserProfile = {
    uid,
    displayName: safeDisplayName,
    displayNameLower: safeDisplayName.toLowerCase(),
    username: resolvedUsername,
    usernameLower: resolvedUsername ? resolvedUsername.toLowerCase() : null,
    photoURL: typeof userLike.photoURL === 'string' && userLike.photoURL.length <= 1024 ? userLike.photoURL : null,
    hasVerifiedEmail: Boolean(verifiedEmail),
    allowProfileSearch: Boolean(privacy.allowProfileSearch),
    allowEmailSearch: effectiveAllowEmailSearch,
    acceptDirectInvites: privacy.acceptDirectInvites !== false,
    updatedAt: now,
  };

  await setDoc(doc(db, 'publicProfiles', uid), publicProfilePayload, { merge: true });

  const nextHash = effectiveAllowEmailSearch && verifiedEmail
    ? await hashEmailForLookup(verifiedEmail)
    : null;

  const prevHash = options?.previousIndexedEmailHash || null;
  if (prevHash && prevHash !== nextHash) {
    await deleteDoc(doc(db, 'emailLookup', prevHash)).catch(() => {});
  }

  if (nextHash) {
    await setDoc(doc(db, 'emailLookup', nextHash), {
      uid,
      updatedAt: now,
    });
  } else if (verifiedEmail) {
    const currentHash = await hashEmailForLookup(verifiedEmail);
    if (currentHash) {
      await deleteDoc(doc(db, 'emailLookup', currentHash)).catch(() => {});
    }
  }

  return nextHash;
}

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

  const displayName = sanitizePublicDisplayName(
    typeof userOrUid !== 'string' ? userOrUid.displayName : undefined,
    resolvedUsername,
    publicEmail
  );

  const userDocRef = doc(db, 'users', uid);
  const now = new Date().toISOString();

  try {
    const snap = await getDoc(userDocRef);
    let resolvedPrivacy = DEFAULT_USER_PRIVACY_SETTINGS;
    let previousIndexedEmailHash: string | null = null;
    let resolvedUsernameFromDoc = resolvedUsername;

    if (!snap.exists()) {
      const newDoc: UserDocumentData = {
        userId: uid,
        email: publicEmail,
        displayName: displayName || 'Lập trình viên',
        ...(inferredAuthType ? { authType: inferredAuthType } : {}),
        ...(resolvedUsername ? { username: resolvedUsername } : {}),
        privacy: resolvedPrivacy,
        indexedEmailHash: null,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };
      await setDoc(userDocRef, newDoc, { merge: true });
      console.log(`[Firestore:profile] Đã tạo thành công tài liệu người dùng mới cho ${uid}`);
    } else {
      const existingData = snap.data();
      resolvedPrivacy = normalizeUserPrivacySettings(existingData.privacy);
      previousIndexedEmailHash =
        typeof existingData.indexedEmailHash === 'string' ? existingData.indexedEmailHash : null;
      if (!resolvedUsernameFromDoc && typeof existingData.username === 'string') {
        resolvedUsernameFromDoc = existingData.username;
      }

      const updateData: Partial<UserDocumentData> = {
        userId: uid,
        lastLoginAt: now,
        updatedAt: now,
      };
      if (!existingData.email && publicEmail) {
        updateData.email = publicEmail;
      } else if (typeof existingData.email === 'string' && isSyntheticUsernameEmail(existingData.email)) {
        updateData.email = publicEmail;
      } else if (publicEmail && existingData.email !== publicEmail) {
        updateData.email = publicEmail;
      }
      if (!existingData.displayName && displayName) {
        updateData.displayName = displayName;
      } else if (typeof userOrUid !== 'string' && userOrUid.displayName) {
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
      if (!existingData.privacy) {
        updateData.privacy = resolvedPrivacy;
      }

      await setDoc(userDocRef, updateData, { merge: true });
      console.log(`[Firestore:profile] Đã xác thực và cập nhật tài liệu người dùng cho ${uid}`);
    }

    if (typeof userOrUid !== 'string') {
      const nextHash = await syncPublicDiscoveryProfile(userOrUid, resolvedPrivacy, {
        usernameOverride: resolvedUsernameFromDoc,
        previousIndexedEmailHash,
      }).catch((syncErr) => {
        console.warn('[Firestore:publicProfiles] Không thể đồng bộ hồ sơ tìm kiếm công khai:', syncErr);
        return previousIndexedEmailHash;
      });
      if (nextHash !== previousIndexedEmailHash) {
        await setDoc(userDocRef, { indexedEmailHash: nextHash ?? null }, { merge: true }).catch(() => {});
      }
    }
  } catch (error) {
    console.error(`[Firestore:profile] Lỗi khi tạo/kiểm tra tài liệu người dùng (uid: ${uid}):`, error);
    throw error;
  }
}

export async function getUserPrivacySettings(uid: string): Promise<UserPrivacySettings> {
  if (!db || !uid) return DEFAULT_USER_PRIVACY_SETTINGS;
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return normalizeUserPrivacySettings(userSnap.data().privacy);
    }
    const pubSnap = await getDoc(doc(db, 'publicProfiles', uid));
    if (pubSnap.exists()) {
      return normalizeUserPrivacySettings(pubSnap.data());
    }
    return DEFAULT_USER_PRIVACY_SETTINGS;
  } catch (error) {
    console.warn('[Firestore:privacy] Không thể đọc cài đặt quyền riêng tư:', error);
    return DEFAULT_USER_PRIVACY_SETTINGS;
  }
}

export async function updateUserPrivacySettings(
  user: User,
  nextSettings: UserPrivacySettings
): Promise<UserPrivacySettings> {
  if (!db) throw new Error('Firestore chưa được khởi tạo hoặc không khả dụng.');

  const verifiedEmail = getVerifiedPublicEmail(user);
  const sanitized: UserPrivacySettings = {
    allowProfileSearch: Boolean(nextSettings.allowProfileSearch),
    allowEmailSearch: Boolean(verifiedEmail && nextSettings.allowEmailSearch),
    acceptDirectInvites: nextSettings.acceptDirectInvites !== false,
  };

  const userDocRef = doc(db, 'users', user.uid);
  const docPath = `users/${user.uid}`;

  try {
    const snap = await getDoc(userDocRef);
    const existingData = snap.exists() ? snap.data() : {};
    const prevHash =
      typeof existingData.indexedEmailHash === 'string' ? existingData.indexedEmailHash : null;
    const usernameFromDoc =
      typeof existingData.username === 'string' ? existingData.username : undefined;

    const nextHash = await syncPublicDiscoveryProfile(user, sanitized, {
      usernameOverride: usernameFromDoc,
      previousIndexedEmailHash: prevHash,
    });

    await setDoc(
      userDocRef,
      {
        userId: user.uid,
        privacy: sanitized,
        indexedEmailHash: nextHash ?? null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return sanitized;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

function normalizePublicProfileToSearchResult(
  id: string,
  data: Record<string, any>,
  matchedBy: UserSearchResult['matchedBy']
): UserSearchResult {
  const username =
    typeof data.username === 'string' && data.username.trim() ? data.username.trim() : null;
  const displayName = sanitizePublicDisplayName(data.displayName, username, null);
  return {
    uid: String(data.uid || id),
    displayName,
    username,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    hasVerifiedEmail: Boolean(data.hasVerifiedEmail),
    acceptDirectInvites: data.acceptDirectInvites !== false,
    matchedBy,
  };
}

/**
 * Tìm kiếm người dùng hiện có để mời vào dự án nhóm:
 * - Nếu nhập đúng định dạng email (không chứa dấu @ ở đầu như @username): tra cứu chính xác O(1) qua `emailLookup/{sha256}`.
 *   Tuyệt đối bỏ qua email ảo `@users.coderlive.app` và không bao giờ liệt kê toàn bộ danh sách email.
 * - Nếu nhập `@username` hoặc tên hiển thị: tìm kiếm prefix trong `publicProfiles` có `allowProfileSearch == true`.
 */
export async function searchUsersForInvite(
  rawQuery: string,
  currentUid: string
): Promise<UserSearchResult[]> {
  if (!db) throw new Error('Firestore chưa sẵn sàng.');

  const trimmed = rawQuery.trim();
  if (trimmed.length < 2) return [];

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (looksLikeEmail) {
    const emailLower = trimmed.toLowerCase();
    if (isSyntheticUsernameEmail(emailLower)) {
      return [];
    }
    const emailHash = await hashEmailForLookup(emailLower);
    if (!emailHash) return [];

    try {
      const lookupSnap = await getDoc(doc(db, 'emailLookup', emailHash));
      if (!lookupSnap.exists()) return [];
      const targetUid = String(lookupSnap.data()?.uid || '');
      if (!targetUid || targetUid === currentUid) return [];

      const profileSnap = await getDoc(doc(db, 'publicProfiles', targetUid));
      if (!profileSnap.exists()) return [];
      const pData = profileSnap.data();
      if (!pData.allowEmailSearch || !pData.hasVerifiedEmail) return [];

      return [normalizePublicProfileToSearchResult(profileSnap.id, pData, 'email')];
    } catch (error: any) {
      if (error?.code === 'permission-denied') return [];
      handleFirestoreError(error, OperationType.GET, `emailLookup/${emailHash}`);
    }
  }

  const hadAtPrefix = trimmed.startsWith('@');
  const qLower = (hadAtPrefix ? trimmed.slice(1) : trimmed).trim().toLowerCase();
  if (qLower.length < 2) return [];

  const resultsMap = new Map<string, UserSearchResult>();

  const runIndexedQueries = async () => {
    const qUsername = query(
      collection(db!, 'publicProfiles'),
      where('allowProfileSearch', '==', true),
      where('usernameLower', '>=', qLower),
      where('usernameLower', '<=', qLower + '\uf8ff'),
      limit(12)
    );
    const snapUsername = await getDocs(qUsername);
    snapUsername.forEach((d) => {
      const data = d.data();
      if (d.id !== currentUid && data.allowProfileSearch === true) {
        resultsMap.set(d.id, normalizePublicProfileToSearchResult(d.id, data, 'username'));
      }
    });

    if (!hadAtPrefix) {
      const qName = query(
        collection(db!, 'publicProfiles'),
        where('allowProfileSearch', '==', true),
        where('displayNameLower', '>=', qLower),
        where('displayNameLower', '<=', qLower + '\uf8ff'),
        limit(12)
      );
      const snapName = await getDocs(qName);
      snapName.forEach((d) => {
        const data = d.data();
        if (d.id !== currentUid && data.allowProfileSearch === true && !resultsMap.has(d.id)) {
          resultsMap.set(d.id, normalizePublicProfileToSearchResult(d.id, data, 'name'));
        }
      });
    }
  };

  try {
    await runIndexedQueries();
  } catch (error: any) {
    if (error?.code === 'failed-precondition') {
      console.warn(
        '[Firestore:publicProfiles] Thiếu composite index cho tìm kiếm prefix, đang dùng chế độ lọc an toàn trên client.',
        error.message
      );
      const fallbackQ = query(
        collection(db, 'publicProfiles'),
        where('allowProfileSearch', '==', true),
        limit(50)
      );
      const fallbackSnap = await getDocs(fallbackQ);
      fallbackSnap.forEach((d) => {
        if (d.id === currentUid) return;
        const data = d.data();
        const usernameLower = typeof data.usernameLower === 'string' ? data.usernameLower : '';
        const nameLower = typeof data.displayNameLower === 'string' ? data.displayNameLower : '';
        if (usernameLower.startsWith(qLower) || usernameLower.includes(qLower)) {
          resultsMap.set(d.id, normalizePublicProfileToSearchResult(d.id, data, 'username'));
        } else if (!hadAtPrefix && (nameLower.startsWith(qLower) || nameLower.includes(qLower))) {
          resultsMap.set(d.id, normalizePublicProfileToSearchResult(d.id, data, 'name'));
        }
      });
    } else {
      handleFirestoreError(error, OperationType.LIST, 'publicProfiles');
    }
  }

  return Array.from(resultsMap.values())
    .sort((a, b) => {
      const aExact = a.username?.toLowerCase() === qLower ? 1 : 0;
      const bExact = b.username?.toLowerCase() === qLower ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      if (a.matchedBy !== b.matchedBy) {
        return a.matchedBy === 'username' ? -1 : 1;
      }
      return a.displayName.localeCompare(b.displayName, 'vi');
    })
    .slice(0, 15);
}

/**
 * Thử lại tự động trong nền với cơ chế Exponential Backoff (1s, 2s, 4s, tối đa 3 lần).
 * Giúp tự động hàn gắn tài khoản (self-healing) nếu quá trình lưu lên Firestore ban đầu gặp sự cố.
 */
export function retryEnsureUserDocumentInBackground(
  user: {
    uid: string;
    email?: string | null;
    emailVerified?: boolean;
    displayName?: string | null;
    photoURL?: string | null;
    providerData?: ReadonlyArray<{ providerId?: string | null; email?: string | null }>;
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
