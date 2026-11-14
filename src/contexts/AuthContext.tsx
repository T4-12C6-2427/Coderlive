import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  linkWithPopup,
  unlink,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseAvailable, isFirebaseConfigValid } from '../lib/firebase';
import { ensureUserDocument, retryEnsureUserDocumentInBackground } from '../services/userService';
import {
  getPasswordProviderEmail,
  isSyntheticUsernameEmail,
  parseLoginIdentifier,
  USERNAME_EMAIL_DOMAIN,
  usernameToEmail,
  validateUsername,
} from '../lib/usernameAuth';

export interface SignUpResult {
  user: User;
  accountCreated: boolean;
  syncPending: boolean;
  firestoreError?: unknown;
}

export interface AuthErrorContext {
  mode?: 'login' | 'signup' | 'change-password' | 'link';
  method?: 'username' | 'email' | 'google';
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirebaseAvailable: boolean;
  isFirebaseConfigValid: boolean;
  loginWithGoogle: () => Promise<SignUpResult>;
  signupWithUsername: (username: string, password: string) => Promise<SignUpResult>;
  signupWithEmail: (email: string, password: string) => Promise<SignUpResult>;
  loginWithIdentifier: (identifier: string, password: string) => Promise<SignUpResult>;
  sendPasswordReset: (email: string) => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function cloneAuthUser(user: User, overrides?: Partial<User>): User {
  return Object.assign(Object.create(Object.getPrototypeOf(user)), user, overrides || {});
}

function isTopLevelWindow(): boolean {
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
}

/**
 * Trả về thông báo lỗi tiếng Việt tương ứng cho từng mã lỗi Firebase Auth & Firestore.
 * Không làm lộ liệu tài khoản có tồn tại hay không khi đăng nhập sai thông tin.
 */
export function getVietnameseAuthErrorMessage(errorOrCode: any, context?: AuthErrorContext): string {
  if (!errorOrCode) return 'Lỗi không xác định (mã: unknown)';

  let code = '';
  if (typeof errorOrCode === 'string') {
    code = errorOrCode;
  } else if (errorOrCode?.code) {
    code = errorOrCode.code;
  } else if (errorOrCode?.message) {
    code = errorOrCode.message;
  }

  // Trích xuất mã dạng auth/... hoặc permission-denied nếu nằm bên trong chuỗi thông báo
  const authMatch = typeof code === 'string' ? code.match(/(auth\/[a-zA-Z0-9_-]+)/) : null;
  const firestoreMatch = typeof code === 'string' ? code.match(/(permission-denied|unavailable|failed-precondition|not-found)/i) : null;

  const resolvedCode = (authMatch ? authMatch[1] : (firestoreMatch ? firestoreMatch[1].toLowerCase() : code)).toLowerCase();

  switch (resolvedCode) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      if (context?.mode === 'change-password') {
        return 'Mật khẩu hiện tại không đúng.';
      }
      return 'Tên đăng nhập/email hoặc mật khẩu không đúng.';
    case 'auth/email-already-in-use':
      if (context?.method === 'username') {
        return 'Tên đăng nhập này đã có người dùng. Hãy chọn tên khác.';
      }
      return 'Email này đã được sử dụng cho tài khoản khác.';
    case 'auth/credential-already-in-use':
      return 'Tài khoản Google này đã được liên kết với một tài khoản Coderlive khác.';
    case 'auth/provider-already-linked':
      return 'Tài khoản này đã được liên kết với Google rồi.';
    case 'auth/no-such-provider':
      return 'Tài khoản này chưa liên kết với Google.';
    case 'auth/requires-recent-login':
      return 'Phiên đăng nhập đã lâu. Vui lòng đăng xuất và đăng nhập lại trước khi thực hiện thao tác bảo mật này.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu. Vui lòng dùng ít nhất 6 ký tự (khuyên dùng 8+ ký tự).';
    case 'auth/invalid-email':
      return 'Định dạng email không hợp lệ.';
    case 'auth/invalid-username':
      if (typeof errorOrCode?.message === 'string' && errorOrCode.message.trim().length > 0 && !errorOrCode.message.includes('auth/')) {
        return errorOrCode.message;
      }
      return 'Tên đăng nhập không hợp lệ.';
    case 'auth/missing-password':
      return 'Vui lòng nhập mật khẩu.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị tạm khóa.';
    case 'auth/operation-not-allowed':
      return 'Phương thức đăng nhập này chưa được bật trong Firebase.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
    case 'auth/too-many-requests':
      return 'Thử quá nhiều lần, vui lòng đợi ít phút.';
    case 'auth/invalid-api-key':
      return 'Khóa API Firebase không hợp lệ.';
    case 'auth/configuration-not-found':
      return 'Cấu hình Firebase Authentication không tìm thấy.';
    case 'auth/unauthorized-domain':
      return 'Tên miền hiện tại chưa được cấp quyền trong Firebase Authentication (Authorized Domains).';
    case 'auth/popup-blocked':
      return 'Cửa sổ đăng nhập bị trình duyệt chặn (Popup blocked). Vui lòng cho phép pop-up.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất.';
    case 'auth/account-exists-with-different-credential':
      return 'Email này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng email trước, rồi liên kết Google trong Hồ sơ.';
    case 'permission-denied':
      return 'Không có quyền ghi dữ liệu. Kiểm tra Firestore Rules.';
    case 'unavailable':
      return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
    case 'failed-precondition':
      return 'Yêu cầu không thể thực hiện do tiền điều kiện cơ sở liệu không thỏa mãn.';
    case 'not-found':
      return 'Không tìm thấy tài nguyên hoặc cơ sở dữ liệu chưa được khởi tạo (database not created).';
    default: {
      if (typeof code === 'string' && code.trim().length > 0) {
        const sanitized = code.replace(new RegExp(`@${USERNAME_EMAIL_DOMAIN.replace(/\./g, '\\.')}`, 'gi'), '');
        return `Lỗi không xác định (mã: ${sanitized})`;
      }
      return 'Lỗi không xác định (mã: unknown)';
    }
  }
}

function createAuthError(code: string, message?: string): Error & { code: string } {
  const err = new Error(message || code) as Error & { code: string };
  err.code = code;
  return err;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth || !isFirebaseAvailable) {
      setLoading(false);
      return;
    }

    // Xử lý kết quả đăng nhập Google redirect (trên trình duyệt di động/PWA)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          setCurrentUser(result.user);
          try {
            await ensureUserDocument(result.user);
          } catch (healErr) {
            retryEnsureUserDocumentInBackground(result.user);
          }
        }
      })
      .catch((redirectErr: any) => {
        if (redirectErr?.code && redirectErr.code !== 'auth/no-current-user') {
          console.warn('[Auth:redirectResult] Lỗi khi xử lý kết quả đăng nhập Google:', redirectErr?.code, redirectErr?.message);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Tự động đảm bảo và hàn gắn tài liệu người dùng (idempotent healing)
        try {
          await ensureUserDocument(user);
        } catch (healError) {
          console.warn('[Firestore:profile] Tự động đồng bộ tài khoản khi đăng nhập thất bại, đang xếp hàng thử lại nền:', healError);
          retryEnsureUserDocumentInBackground(user);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<SignUpResult> => {
    if (!auth) {
      throw new Error('Firebase chưa sẵn sàng');
    }

    let cred;
    try {
      cred = await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const code = err?.code || '';
      // Chỉ chuyển sang redirect khi đang ở cửa sổ top-level (tránh lỗi X-Frame-Options trong iframe)
      if (
        isTopLevelWindow() &&
        (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment')
      ) {
        await signInWithRedirect(auth, googleProvider);
        throw createAuthError('auth/redirect-initiated', 'Đang chuyển hướng sang trang đăng nhập Google...');
      }

      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        console.warn('[Auth:google] Đăng nhập Google không thành công:', code, err?.message);
      }
      throw err;
    }

    let syncPending = false;
    let fsError: unknown = null;

    try {
      await ensureUserDocument(cred.user);
    } catch (fsErr) {
      console.warn('[Firestore:profile] Lỗi khi tạo user doc sau khi đăng nhập Google:', fsErr);
      syncPending = true;
      fsError = fsErr;
      retryEnsureUserDocumentInBackground(cred.user);
    }

    return {
      user: cred.user,
      accountCreated: true,
      syncPending,
      firestoreError: fsError,
    };
  };

  const signupWithUsername = async (username: string, password: string): Promise<SignUpResult> => {
    if (!auth) {
      throw new Error('Firebase chưa sẵn sàng');
    }

    const validation = validateUsername(username);
    if (!validation.valid) {
      throw createAuthError('auth/invalid-username', validation.error || 'Tên đăng nhập không hợp lệ.');
    }

    const syntheticEmail = usernameToEmail(validation.normalized);
    const cred = await createUserWithEmailAndPassword(auth, syntheticEmail, password);

    try {
      await updateProfile(cred.user, { displayName: validation.normalized });
      setCurrentUser(cloneAuthUser(cred.user, { displayName: validation.normalized }));
    } catch (profileErr) {
      console.warn('[Auth:signupUsername] Không thể đặt displayName mặc định:', profileErr);
    }

    let syncPending = false;
    let fsError: unknown = null;

    try {
      await ensureUserDocument(cred.user, {
        authType: 'username',
        username: validation.normalized,
      });
    } catch (fsErr) {
      console.warn('[Firestore:profile] Lỗi khi tạo user doc sau khi đăng ký tên đăng nhập:', fsErr);
      syncPending = true;
      fsError = fsErr;
      retryEnsureUserDocumentInBackground(cred.user, undefined, undefined, {
        authType: 'username',
        username: validation.normalized,
      });
    }

    return {
      user: cred.user,
      accountCreated: true,
      syncPending,
      firestoreError: fsError,
    };
  };

  const signupWithEmail = async (email: string, password: string): Promise<SignUpResult> => {
    if (!auth) {
      throw new Error('Firebase chưa sẵn sàng');
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@') || isSyntheticUsernameEmail(trimmedEmail)) {
      throw createAuthError('auth/invalid-email', 'Định dạng email không hợp lệ.');
    }

    const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

    if (!cred.user.displayName) {
      const defaultName = trimmedEmail.split('@')[0] || 'Lập trình viên';
      try {
        await updateProfile(cred.user, { displayName: defaultName });
        setCurrentUser(cloneAuthUser(cred.user, { displayName: defaultName }));
      } catch (profileErr) {
        console.warn('[Auth:signupEmail] Không thể đặt displayName mặc định:', profileErr);
      }
    }

    let syncPending = false;
    let fsError: unknown = null;

    try {
      await ensureUserDocument(cred.user, { authType: 'email' });
    } catch (fsErr) {
      console.warn('[Firestore:profile] Lỗi khi tạo user doc sau khi đăng ký email:', fsErr);
      syncPending = true;
      fsError = fsErr;
      retryEnsureUserDocumentInBackground(cred.user, undefined, undefined, { authType: 'email' });
    }

    return {
      user: cred.user,
      accountCreated: true,
      syncPending,
      firestoreError: fsError,
    };
  };

  const loginWithIdentifier = async (identifier: string, password: string): Promise<SignUpResult> => {
    if (!auth) {
      throw new Error('Firebase chưa sẵn sàng');
    }

    const trimmed = identifier.trim();
    if (!trimmed) {
      throw createAuthError('auth/invalid-credential');
    }

    const parsed = parseLoginIdentifier(trimmed);

    if (parsed.kind === 'email' && isSyntheticUsernameEmail(parsed.authEmail)) {
      throw createAuthError('auth/invalid-credential');
    }

    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, parsed.authEmail, password);
    } catch (err: any) {
      if (parsed.kind === 'username' && err?.code === 'auth/invalid-email') {
        throw createAuthError('auth/invalid-credential');
      }
      throw err;
    }

    let syncPending = false;
    let fsError: unknown = null;

    try {
      await ensureUserDocument(cred.user, {
        authType: parsed.kind === 'username' ? 'username' : 'email',
        ...(parsed.kind === 'username' ? { username: parsed.normalizedInput } : {}),
      });
    } catch (fsErr) {
      console.warn('[Firestore:profile] Lỗi khi cập nhật user doc sau đăng nhập:', fsErr);
      syncPending = true;
      fsError = fsErr;
      retryEnsureUserDocumentInBackground(cred.user, undefined, undefined, {
        authType: parsed.kind === 'username' ? 'username' : 'email',
        ...(parsed.kind === 'username' ? { username: parsed.normalizedInput } : {}),
      });
    }

    return {
      user: cred.user,
      accountCreated: false,
      syncPending,
      firestoreError: fsError,
    };
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase chưa sẵn sàng');
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || isSyntheticUsernameEmail(trimmed)) {
      throw createAuthError('auth/invalid-email');
    }
    await sendPasswordResetEmail(auth, trimmed);
  };

  const linkGoogleAccount = async (): Promise<void> => {
    if (!auth || !auth.currentUser) {
      throw new Error('Chưa đăng nhập');
    }

    const result = await linkWithPopup(auth.currentUser, googleProvider);
    const googleInfo = result.user.providerData.find((p) => p.providerId === 'google.com');

    if (!result.user.photoURL && googleInfo?.photoURL) {
      try {
        await updateProfile(result.user, { photoURL: googleInfo.photoURL });
      } catch (profileErr) {
        console.warn('[Auth:linkGoogle] Không thể cập nhật ảnh đại diện Google:', profileErr);
      }
    }

    try {
      await result.user.reload();
    } catch {
      // Ignore reload failures; result.user still has updated providerData
    }

    const updatedUser = auth.currentUser || result.user;
    setCurrentUser(cloneAuthUser(updatedUser));

    ensureUserDocument(updatedUser).catch((err) => {
      console.warn('[Firestore:profile] Lỗi đồng bộ hồ sơ sau khi liên kết Google:', err);
    });
  };

  const unlinkGoogleAccount = async (): Promise<void> => {
    if (!auth || !auth.currentUser) {
      throw new Error('Chưa đăng nhập');
    }

    const otherProviders = auth.currentUser.providerData.filter((p) => p.providerId !== 'google.com');
    if (otherProviders.length === 0) {
      throw createAuthError(
        'auth/cannot-unlink-sole-provider',
        'Không thể hủy liên kết vì Google là phương thức đăng nhập duy nhất của tài khoản.'
      );
    }

    const updated = await unlink(auth.currentUser, 'google.com');
    try {
      await updated.reload();
    } catch {
      // Ignore reload failure
    }
    setCurrentUser(cloneAuthUser(auth.currentUser || updated));
  };

  const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!auth || !auth.currentUser) {
      throw new Error('Chưa đăng nhập');
    }

    const passwordEmail = getPasswordProviderEmail(auth.currentUser);
    if (!passwordEmail) {
      throw createAuthError(
        'auth/no-such-provider',
        'Tài khoản này đăng nhập bằng Google và chưa có mật khẩu riêng.'
      );
    }

    if (newPassword.length < 6) {
      throw createAuthError('auth/weak-password');
    }

    const credential = EmailAuthProvider.credential(passwordEmail, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[Auth:logout] Lỗi khi đăng xuất:', err);
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (!auth || !auth.currentUser) {
      throw new Error('Chưa đăng nhập');
    }
    try {
      await updateProfile(auth.currentUser, { displayName });
      // Cập nhật lên Firestore
      ensureUserDocument({
        uid: auth.currentUser.uid,
        displayName,
        email: auth.currentUser.email,
        providerData: auth.currentUser.providerData,
      }).catch((err) => {
        console.warn('[Firestore:profile] Lỗi cập nhật tên trên Firestore:', err);
      });
      // Force refresh local user state
      setCurrentUser(cloneAuthUser(auth.currentUser, { displayName }));
    } catch (err: any) {
      console.warn('[Auth:updateProfile] Lỗi cập nhật hồ sơ:', err?.code, err?.message);
      throw err;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isFirebaseAvailable,
    isFirebaseConfigValid,
    loginWithGoogle,
    signupWithUsername,
    signupWithEmail,
    loginWithIdentifier,
    sendPasswordReset,
    linkGoogleAccount,
    unlinkGoogleAccount,
    changeUserPassword,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
