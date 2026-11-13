import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseAvailable, isFirebaseConfigValid } from '../lib/firebase';
import { ensureUserDocument, retryEnsureUserDocumentInBackground } from '../services/userService';

export interface SignUpResult {
  user: User;
  accountCreated: boolean;
  syncPending: boolean;
  firestoreError?: unknown;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirebaseAvailable: boolean;
  isFirebaseConfigValid: boolean;
  loginWithGoogle: () => Promise<SignUpResult>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Trả về thông báo lỗi tiếng Việt tương ứng cho từng mã lỗi Firebase Auth & Firestore.
 * Tuyệt đối không che giấu mã lỗi đối với các mã chưa xác định.
 */
export function getVietnameseAuthErrorMessage(errorOrCode: any): string {
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
    case 'auth/operation-not-allowed':
      return 'Phương thức đăng nhập này chưa được bật trong Firebase.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
    case 'auth/too-many-requests':
      return 'Quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.';
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
    case 'auth/invalid-credential':
      return 'Thông tin xác thực không hợp lệ hoặc đã hết hạn.';
    case 'permission-denied':
      return 'Không có quyền ghi dữ liệu. Kiểm tra Firestore Rules.';
    case 'unavailable':
      return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
    case 'failed-precondition':
      return 'Yêu cầu không thể thực hiện do tiền điều kiện cơ sở liệu không thỏa mãn.';
    case 'not-found':
      return 'Không tìm thấy tài nguyên hoặc cơ sở dữ liệu chưa được khởi tạo (database not created).';
    default:
      if (typeof code === 'string' && code.trim().length > 0) {
        return `Lỗi không xác định (mã: ${code})`;
      }
      return 'Lỗi không xác định (mã: unknown)';
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth || !isFirebaseAvailable) {
      setLoading(false);
      return;
    }

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
      ensureUserDocument({ uid: auth.currentUser.uid, displayName, email: auth.currentUser.email }).catch((err) => {
        console.warn('[Firestore:profile] Lỗi cập nhật tên trên Firestore:', err);
      });
      // Force refresh local user state
      setCurrentUser(Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser, { displayName }));
    } catch (err: any) {
      console.warn('[Auth:updateProfile] Lỗi cập nhật hồ sơ:', err?.code, err?.message);
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    isFirebaseAvailable,
    isFirebaseConfigValid,
    loginWithGoogle,
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
