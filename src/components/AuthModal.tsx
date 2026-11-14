import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, getVietnameseAuthErrorMessage } from '../contexts/AuthContext';
import {
  evaluatePasswordStrength,
  isSyntheticUsernameEmail,
  validateUsername,
} from '../lib/usernameAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onWarning?: (msg: string) => void;
  onSuccess?: (msg: string) => void;
}

const SUPPRESS_RAW_CODE_SET = new Set([
  'auth/invalid-credential',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/email-already-in-use',
  'auth/weak-password',
  'auth/invalid-email',
  'auth/invalid-username',
  'auth/missing-password',
  'auth/too-many-requests',
]);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onWarning,
  onSuccess,
}) => {
  const {
    loginWithGoogle,
    signupWithUsername,
    signupWithEmail,
    loginWithIdentifier,
    sendPasswordReset,
    isFirebaseAvailable,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [signupMethod, setSignupMethod] = useState<'username' | 'email'>('username');

  // Loading states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign-up fields (Username)
  const [signupUsername, setSignupUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [acceptedNoRecoveryWarning, setAcceptedNoRecoveryWarning] = useState(false);

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState<{
    type: 'info' | 'success';
    message: string;
    suggestGoogle?: boolean;
  } | null>(null);

  const loginInputRef = useRef<HTMLInputElement>(null);
  const signupUsernameInputRef = useRef<HTMLInputElement>(null);
  const signupEmailInputRef = useRef<HTMLInputElement>(null);

  const isBusy = googleLoading || formLoading || resetLoading;

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setErrorCode(null);
      setForgotNotice(null);
      setShowLoginPassword(false);
      setShowSignupPassword(false);
      setShowSignupConfirm(false);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      if (mode === 'login') {
        loginInputRef.current?.focus();
      } else if (signupMethod === 'username') {
        signupUsernameInputRef.current?.focus();
      } else {
        signupEmailInputRef.current?.focus();
      }
    }, 30);
    return () => window.clearTimeout(timer);
  }, [isOpen, mode, signupMethod]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBusy, onClose]);

  if (!isOpen) return null;

  const usernameValidation = validateUsername(signupUsername);
  const passwordStrength = evaluatePasswordStrength(signupPassword);
  const passwordsMatch = signupPassword === signupConfirmPassword;
  const emailValid =
    signupEmail.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim()) &&
    !isSyntheticUsernameEmail(signupEmail.trim());

  const handleModeChange = (nextMode: 'login' | 'signup') => {
    if (isBusy) return;
    setMode(nextMode);
    setError(null);
    setErrorCode(null);
    setForgotNotice(null);
  };

  const handleSignupMethodChange = (nextMethod: 'username' | 'email') => {
    if (isBusy) return;
    setSignupMethod(nextMethod);
    setError(null);
    setErrorCode(null);
  };

  const handleGoogleSignIn = async () => {
    if (isBusy || !isFirebaseAvailable) return;

    setError(null);
    setErrorCode(null);
    setForgotNotice(null);
    try {
      setGoogleLoading(true);
      const result = await loginWithGoogle();
      onClose();
      if (result.syncPending) {
        onWarning?.('Đã đăng nhập thành công, nhưng chưa đồng bộ được dữ liệu lên đám mây. Sẽ thử lại tự động.');
      } else {
        onSuccess?.(
          mode === 'signup'
            ? 'Tạo tài khoản và đăng nhập với Google thành công!'
            : 'Đăng nhập với Google thành công!'
        );
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/redirect-initiated') {
        return;
      }
      setErrorCode(code);
      setError(getVietnameseAuthErrorMessage(err, { mode, method: 'google' }));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy || !isFirebaseAvailable) return;

    setError(null);
    setErrorCode(null);
    setForgotNotice(null);

    if (!loginIdentifier.trim()) {
      setError('Vui lòng nhập tên đăng nhập hoặc email.');
      loginInputRef.current?.focus();
      return;
    }

    if (!loginPassword) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      setFormLoading(true);
      const result = await loginWithIdentifier(loginIdentifier, loginPassword);
      onClose();
      if (result.syncPending) {
        onWarning?.('Đã đăng nhập thành công, nhưng chưa đồng bộ được dữ liệu lên đám mây. Sẽ thử lại tự động.');
      } else {
        onSuccess?.('Đăng nhập thành công!');
      }
    } catch (err: any) {
      const code = (err?.code || '').toLowerCase();
      setErrorCode(code);
      setError(getVietnameseAuthErrorMessage(err, { mode: 'login' }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isBusy || !isFirebaseAvailable) return;

    setError(null);
    setErrorCode(null);
    setForgotNotice(null);

    const trimmed = loginIdentifier.trim();
    if (!trimmed.includes('@')) {
      setForgotNotice({
        type: 'info',
        message:
          'Tài khoản tên đăng nhập không đặt lại được bằng email. Nếu bạn đã liên kết Google, hãy đăng nhập bằng Google.',
        suggestGoogle: true,
      });
      return;
    }

    if (isSyntheticUsernameEmail(trimmed) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Định dạng email không hợp lệ.');
      return;
    }

    try {
      setResetLoading(true);
      await sendPasswordReset(trimmed);
      setForgotNotice({
        type: 'success',
        message: 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến hoặc mục Spam.',
      });
    } catch (err: any) {
      const code = (err?.code || '').toLowerCase();
      setErrorCode(code);
      setError(getVietnameseAuthErrorMessage(err, { mode: 'login', method: 'email' }));
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy || !isFirebaseAvailable) return;

    setError(null);
    setErrorCode(null);

    if (signupMethod === 'username') {
      setUsernameTouched(true);
      setConfirmTouched(true);

      if (!usernameValidation.valid) {
        setError(usernameValidation.error || 'Tên đăng nhập không hợp lệ.');
        signupUsernameInputRef.current?.focus();
        return;
      }

      if (signupPassword.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }

      if (!passwordsMatch) {
        setError('Mật khẩu nhập lại chưa khớp.');
        return;
      }

      if (!acceptedNoRecoveryWarning) {
        setError('Vui lòng tích chọn "Tôi đã hiểu" để xác nhận lưu ý về khôi phục mật khẩu.');
        return;
      }

      try {
        setFormLoading(true);
        const result = await signupWithUsername(signupUsername, signupPassword);
        onClose();
        if (result.syncPending) {
          onWarning?.('Đã tạo tài khoản thành công, nhưng chưa đồng bộ được hồ sơ lên đám mây. Sẽ thử lại tự động.');
        } else {
          onSuccess?.(`Tạo tài khoản @${usernameValidation.normalized} thành công!`);
        }
      } catch (err: any) {
        const code = (err?.code || '').toLowerCase();
        setErrorCode(code);
        setError(getVietnameseAuthErrorMessage(err, { mode: 'signup', method: 'username' }));
      } finally {
        setFormLoading(false);
      }
      return;
    }

    // Email sign-up
    setEmailTouched(true);
    setConfirmTouched(true);

    if (!emailValid) {
      setError('Định dạng email không hợp lệ.');
      signupEmailInputRef.current?.focus();
      return;
    }

    if (signupPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (!passwordsMatch) {
      setError('Mật khẩu nhập lại chưa khớp.');
      return;
    }

    try {
      setFormLoading(true);
      const result = await signupWithEmail(signupEmail, signupPassword);
      onClose();
      if (result.syncPending) {
        onWarning?.('Đã tạo tài khoản thành công, nhưng chưa đồng bộ được hồ sơ lên đám mây. Sẽ thử lại tự động.');
      } else {
        onSuccess?.('Tạo tài khoản và đăng nhập thành công!');
      }
    } catch (err: any) {
      const code = (err?.code || '').toLowerCase();
      setErrorCode(code);
      setError(getVietnameseAuthErrorMessage(err, { mode: 'signup', method: 'email' }));
    } finally {
      setFormLoading(false);
    }
  };

  const strengthBarColors: Record<number, string> = {
    0: 'bg-[var(--border-default)]',
    1: 'bg-[var(--color-danger)]',
    2: 'bg-[var(--color-warning)]',
    3: 'bg-[var(--accent-base)]',
    4: 'bg-[var(--color-success)]',
  };

  const strengthTextColors: Record<number, string> = {
    0: 'text-muted',
    1: 'text-danger',
    2: 'text-warning',
    3: 'text-accent',
    4: 'text-success',
  };

  const showRawErrorCode =
    Boolean(errorCode) &&
    !SUPPRESS_RAW_CODE_SET.has((errorCode || '').toLowerCase()) &&
    !error?.includes(errorCode || '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 pt-safe pb-safe pl-safe pr-safe bg-overlay backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain"
      onClick={() => {
        if (!isBusy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md max-sm:h-full max-sm:max-w-full max-sm:rounded-none max-sm:border-0 sm:max-h-viewport-90 overflow-y-auto overscroll-contain p-5 sm:p-6 bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="touch-target absolute top-3 right-3 p-2 text-muted hover:text-primary hover:bg-[var(--border-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Primary Mode Tabs: Đăng nhập / Đăng ký */}
        <div role="tablist" aria-label="Chế độ xác thực" className="flex touch-gap border-b border-subtle mb-4 pr-8">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            disabled={isBusy}
            onClick={() => handleModeChange('login')}
            className={`touch-target-h pb-3 text-sm font-semibold transition-all relative flex-1 text-center cursor-pointer ${
              mode === 'login'
                ? 'text-accent border-b-2 border-[var(--accent-base)]'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            disabled={isBusy}
            onClick={() => handleModeChange('signup')}
            className={`touch-target-h pb-3 text-sm font-semibold transition-all relative flex-1 text-center cursor-pointer ${
              mode === 'signup'
                ? 'text-accent border-b-2 border-[var(--accent-base)]'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h3 id="auth-modal-title" className="text-lg sm:text-xl font-bold text-primary">
            {mode === 'login' ? 'Đăng nhập vào Coderlive' : 'Tạo tài khoản Coderlive'}
          </h3>
          <p className="text-xs text-secondary mt-1 leading-relaxed">
            {mode === 'login'
              ? 'Đồng bộ dự án, tiến trình học tập và cộng tác nhóm thời gian thực.'
              : 'Chọn đăng ký nhanh với Google, tên đăng nhập hoặc email của bạn.'}
          </p>
        </div>

        {!isFirebaseAvailable && (
          <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-warning-soft border border-[var(--color-warning)]/30 text-warning text-xs">
            Dịch vụ xác thực đám mây hiện chưa sẵn sàng. Bạn vẫn có thể tiếp tục sử dụng ở chế độ Khách.
          </div>
        )}

        {/* Prominent Google button at top of EACH tab */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isBusy || !isFirebaseAvailable}
          className="touch-target-h min-h-[44px] w-full py-2.5 px-4 rounded-[var(--radius-md)] font-semibold text-sm text-primary bg-panel hover:bg-app border border-default hover:border-[var(--accent-base)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
        >
          {googleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Đang kết nối Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{mode === 'signup' ? 'Đăng ký với Google' : 'Đăng nhập với Google'}</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border-subtle)]" />
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider">hoặc</span>
          <div className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

        {/* Error Notification */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-[var(--radius-md)] bg-danger-soft border border-danger/30 text-danger text-xs animate-in fade-in"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed flex-1">
                <span>{error}</span>
                {showRawErrorCode && (
                  <div className="text-[10px] text-danger/80 font-mono mt-0.5">
                    Mã lỗi: {errorCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Smart "Quên mật khẩu?" Notice */}
        {forgotNotice && (
          <div
            role="status"
            className={`mb-4 p-3 rounded-[var(--radius-md)] border text-xs animate-in fade-in ${
              forgotNotice.type === 'success'
                ? 'bg-[var(--color-success-soft,var(--accent-soft))] border-[var(--color-success)]/30 text-primary'
                : 'bg-panel border-default text-secondary'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {forgotNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed space-y-2">
                <p>{forgotNotice.message}</p>
                {forgotNotice.suggestGoogle && (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isBusy || !isFirebaseAvailable}
                    className="touch-target-h min-h-[36px] px-3 py-1.5 rounded-[var(--radius-sm)] bg-elevated hover:bg-app border border-default hover:border-[var(--accent-base)] text-xs font-semibold text-primary transition-colors cursor-pointer"
                  >
                    Đăng nhập với Google
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5">
            <div>
              <label htmlFor="auth-login-identifier" className="block text-xs font-medium text-secondary mb-1.5">
                Tên đăng nhập hoặc email
              </label>
              <input
                ref={loginInputRef}
                id="auth-login-identifier"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={isBusy || !isFirebaseAvailable}
                value={loginIdentifier}
                onChange={(e) => {
                  setLoginIdentifier(e.target.value);
                  if (error) setError(null);
                  if (forgotNotice) setForgotNotice(null);
                }}
                placeholder="vd: lan.nguyen_01 hoặc ten@example.com"
                className="w-full min-h-[44px] px-3 py-2 text-base sm:text-xs bg-panel border border-default rounded-[var(--radius-md)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent-base)] transition-colors disabled:opacity-60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-login-password" className="block text-xs font-medium text-secondary">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isBusy || !isFirebaseAvailable}
                  className="text-[11px] font-medium text-accent hover:underline cursor-pointer disabled:opacity-50 py-0.5"
                >
                  {resetLoading ? 'Đang xử lý...' : 'Quên mật khẩu?'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="auth-login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isBusy || !isFirebaseAvailable}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Nhập mật khẩu"
                  className="w-full min-h-[44px] pl-3 pr-11 py-2 text-base sm:text-xs bg-panel border border-default rounded-[var(--radius-md)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent-base)] transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  disabled={isBusy}
                  aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="touch-target absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-primary rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isBusy || !isFirebaseAvailable}
              className="touch-target-h min-h-[44px] w-full py-2.5 px-4 rounded-[var(--radius-md)] font-semibold text-sm bg-accent hover:bg-[var(--accent-hover)] text-accent-on transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs mt-1"
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>
        ) : (
          /* SIGN-UP FORM */
          <form onSubmit={handleSignupSubmit} noValidate className="space-y-3.5">
            {/* Segmented Control: Tên đăng nhập | Email */}
            <div
              role="tablist"
              aria-label="Phương thức đăng ký"
              className="grid grid-cols-2 gap-1 p-1 rounded-[var(--radius-md)] bg-panel border border-subtle"
            >
              <button
                type="button"
                role="tab"
                aria-selected={signupMethod === 'username'}
                disabled={isBusy}
                onClick={() => handleSignupMethodChange('username')}
                className={`min-h-[38px] px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer ${
                  signupMethod === 'username'
                    ? 'bg-elevated text-primary border border-default shadow-xs'
                    : 'text-secondary hover:text-primary border border-transparent'
                }`}
              >
                Tên đăng nhập
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={signupMethod === 'email'}
                disabled={isBusy}
                onClick={() => handleSignupMethodChange('email')}
                className={`min-h-[38px] px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer ${
                  signupMethod === 'email'
                    ? 'bg-elevated text-primary border border-default shadow-xs'
                    : 'text-secondary hover:text-primary border border-transparent'
                }`}
              >
                Email
              </button>
            </div>

            {signupMethod === 'username' ? (
              <div>
                <label htmlFor="auth-signup-username" className="block text-xs font-medium text-secondary mb-1.5">
                  Tên đăng nhập
                </label>
                <input
                  ref={signupUsernameInputRef}
                  id="auth-signup-username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={20}
                  disabled={isBusy || !isFirebaseAvailable}
                  value={signupUsername}
                  onChange={(e) => {
                    setSignupUsername(e.target.value);
                    if (!usernameTouched && e.target.value.length > 0) setUsernameTouched(true);
                    if (error) setError(null);
                  }}
                  onBlur={() => setUsernameTouched(true)}
                  placeholder="vd: lan.nguyen_01"
                  className={`w-full min-h-[44px] px-3 py-2 text-base sm:text-xs bg-panel border rounded-[var(--radius-md)] text-primary placeholder:text-muted focus:outline-none transition-colors disabled:opacity-60 ${
                    usernameTouched && signupUsername.length > 0 && !usernameValidation.valid
                      ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
                      : 'border-default focus:border-[var(--accent-base)]'
                  }`}
                />
                {usernameTouched && signupUsername.length > 0 ? (
                  usernameValidation.valid ? (
                    <p className="text-[11px] text-success mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Hợp lệ
                        {signupUsername.trim() !== usernameValidation.normalized
                          ? ` (sẽ lưu thành @${usernameValidation.normalized})`
                          : ` (@${usernameValidation.normalized})`}
                      </span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-danger mt-1.5 leading-relaxed">
                      {usernameValidation.error}
                    </p>
                  )
                ) : (
                  <p className="text-[11px] text-muted mt-1.5 leading-relaxed">
                    Dài 3–20 ký tự, gồm chữ cái (a-z), số (0-9), dấu chấm (.), gạch dưới (_), gạch nối (-); bắt đầu bằng chữ hoặc số.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="auth-signup-email" className="block text-xs font-medium text-secondary mb-1.5">
                  Email
                </label>
                <input
                  ref={signupEmailInputRef}
                  id="auth-signup-email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={isBusy || !isFirebaseAvailable}
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="ten@example.com"
                  className={`w-full min-h-[44px] px-3 py-2 text-base sm:text-xs bg-panel border rounded-[var(--radius-md)] text-primary placeholder:text-muted focus:outline-none transition-colors disabled:opacity-60 ${
                    emailTouched && signupEmail.length > 0 && !emailValid
                      ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
                      : 'border-default focus:border-[var(--accent-base)]'
                  }`}
                />
                {emailTouched && signupEmail.length > 0 && !emailValid && (
                  <p className="text-[11px] text-danger mt-1.5">Định dạng email không hợp lệ.</p>
                )}
              </div>
            )}

            {/* Password + Strength Meter */}
            <div>
              <label htmlFor="auth-signup-password" className="block text-xs font-medium text-secondary mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="auth-signup-password"
                  type={showSignupPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isBusy || !isFirebaseAvailable}
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Ít nhất 6 ký tự (khuyên dùng 8+)"
                  className="w-full min-h-[44px] pl-3 pr-11 py-2 text-base sm:text-xs bg-panel border border-default rounded-[var(--radius-md)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent-base)] transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword((prev) => !prev)}
                  disabled={isBusy}
                  aria-label={showSignupPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="touch-target absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-primary rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              <div className="mt-2 space-y-1">
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 rounded-full transition-colors ${
                        passwordStrength.score >= level
                          ? strengthBarColors[passwordStrength.score]
                          : 'bg-[var(--border-subtle)]'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className={strengthTextColors[passwordStrength.score]}>
                    {signupPassword ? `Độ mạnh: ${passwordStrength.label}` : 'Tối thiểu 6 ký tự (khuyên dùng 8+)'}
                  </span>
                </div>
                {signupPassword.length > 0 && !passwordStrength.meetsMin && (
                  <p className="text-[11px] text-danger">{passwordStrength.hint}</p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="auth-signup-confirm" className="block text-xs font-medium text-secondary mb-1.5">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <input
                  id="auth-signup-confirm"
                  type={showSignupConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={isBusy || !isFirebaseAvailable}
                  value={signupConfirmPassword}
                  onChange={(e) => {
                    setSignupConfirmPassword(e.target.value);
                    if (!confirmTouched && e.target.value.length > 0) setConfirmTouched(true);
                    if (error) setError(null);
                  }}
                  onBlur={() => setConfirmTouched(true)}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full min-h-[44px] pl-3 pr-11 py-2 text-base sm:text-xs bg-panel border rounded-[var(--radius-md)] text-primary placeholder:text-muted focus:outline-none transition-colors disabled:opacity-60 ${
                    confirmTouched && signupConfirmPassword.length > 0 && !passwordsMatch
                      ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
                      : 'border-default focus:border-[var(--accent-base)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirm((prev) => !prev)}
                  disabled={isBusy}
                  aria-label={showSignupConfirm ? 'Ẩn mật khẩu nhập lại' : 'Hiện mật khẩu nhập lại'}
                  className="touch-target absolute right-1 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-primary rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                >
                  {showSignupConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmTouched && signupConfirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-[11px] text-danger mt-1.5">Mật khẩu nhập lại chưa khớp.</p>
              )}
            </div>

            {/* Calm Warning for Username accounts */}
            {signupMethod === 'username' && (
              <div className="p-3 rounded-[var(--radius-md)] bg-warning-soft border border-[var(--color-warning)]/30 text-xs space-y-2.5">
                <div className="flex items-start gap-2 text-primary">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-secondary">
                    Tài khoản tên đăng nhập không có email khôi phục. Nếu quên mật khẩu, bạn sẽ không đặt lại được. Hãy liên kết tài khoản Google sau khi đăng ký, hoặc chọn đăng ký bằng email.
                  </p>
                </div>
                <label className="flex items-center gap-2.5 min-h-[36px] cursor-pointer select-none text-xs font-medium text-primary">
                  <input
                    type="checkbox"
                    checked={acceptedNoRecoveryWarning}
                    disabled={isBusy}
                    onChange={(e) => {
                      setAcceptedNoRecoveryWarning(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="w-4 h-4 accent-[var(--accent-base)] rounded-[var(--radius-xs)] cursor-pointer flex-shrink-0"
                  />
                  <span>Tôi đã hiểu</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isBusy || !isFirebaseAvailable}
              className="touch-target-h min-h-[44px] w-full py-2.5 px-4 rounded-[var(--radius-md)] font-semibold text-sm bg-accent hover:bg-[var(--accent-hover)] text-accent-on transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <span>Tạo tài khoản</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-success flex-shrink-0" />
          <span>Xác thực an toàn qua Firebase Authentication.</span>
        </div>
      </div>
    </div>
  );
};
