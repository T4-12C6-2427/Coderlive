import React, { useEffect, useState } from 'react';
import { X, AlertCircle, Loader2, Cloud, Users, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth, getVietnameseAuthErrorMessage } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onWarning?: (msg: string) => void;
  onSuccess?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onWarning,
  onSuccess,
}) => {
  const { loginWithGoogle, isFirebaseAvailable } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setErrorCode(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;

    setError(null);
    setErrorCode(null);
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
      setErrorCode(code);
      setError(getVietnameseAuthErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe pl-safe pr-safe bg-overlay backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain"
      onClick={() => {
        if (!googleLoading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md max-h-viewport-90 overflow-y-auto overscroll-contain p-5 sm:p-6 bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={googleLoading}
          className="touch-target absolute top-3 right-3 p-2 text-muted hover:text-primary hover:bg-[var(--border-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Header */}
        <div className="flex touch-gap border-b border-subtle mb-5 pr-8">
          <button
            type="button"
            disabled={googleLoading}
            onClick={() => {
              setError(null);
              setErrorCode(null);
              setMode('login');
            }}
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
            disabled={googleLoading}
            onClick={() => {
              setError(null);
              setErrorCode(null);
              setMode('signup');
            }}
            className={`touch-target-h pb-3 text-sm font-semibold transition-all relative flex-1 text-center cursor-pointer ${
              mode === 'signup'
                ? 'text-accent border-b-2 border-[var(--accent-base)]'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h3 className="text-xl font-bold text-primary">
            {mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản nhanh chóng'}
          </h3>
          <p className="text-xs text-secondary mt-1.5 leading-relaxed">
            {mode === 'login'
              ? 'Đăng nhập bằng tài khoản Google để đồng bộ các dự án HTML/CSS/JS của bạn trên mọi thiết bị.'
              : 'Chỉ với 1 chạm qua Google, tài khoản của bạn sẽ được tạo tự động để lưu trữ và cộng tác nhóm.'}
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-5 space-y-2.5 p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle text-xs">
          <div className="flex items-start gap-2.5">
            <Cloud className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-primary">Lưu trữ & đồng bộ đám mây</p>
              <p className="text-[11px] text-secondary mt-0.5">
                Không giới hạn dự án cá nhân, tự động lưu và chia sẻ liên kết công khai.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Users className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-primary">Cộng tác nhóm thời gian thực</p>
              <p className="text-[11px] text-secondary mt-0.5">
                Mời thành viên cùng chỉnh sửa mã nguồn, bình luận theo dòng và trò chuyện trực tiếp.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <GraduationCap className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-primary">Lưu tiến trình học tập</p>
              <p className="text-[11px] text-secondary mt-0.5">
                Tự động gộp và đồng bộ các bài học HTML, CSS, JavaScript đã hoàn thành.
              </p>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-danger-soft border border-danger/30 text-danger text-xs animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed flex-1">
                <span>{error}</span>
                {errorCode && !error.includes(errorCode) && (
                  <div className="text-[10px] text-danger/80 font-mono mt-0.5">
                    Mã lỗi: {errorCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!isFirebaseAvailable && (
          <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-warning-soft border border-[var(--color-warning)]/30 text-warning text-xs">
            Dịch vụ xác thực đám mây hiện chưa sẵn sàng. Bạn vẫn có thể tiếp tục sử dụng ở chế độ Khách.
          </div>
        )}

        {/* Primary Google Sign In button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || !isFirebaseAvailable}
          className="touch-target-h w-full py-3 px-4 rounded-[var(--radius-md)] font-semibold text-sm text-primary bg-panel hover:bg-app border border-default hover:border-[var(--accent-base)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
        >
          {googleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Đang kết nối Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
              <span>
                {mode === 'signup' ? 'Đăng ký với Google' : 'Tiếp tục với Google'}
              </span>
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-success flex-shrink-0" />
          <span>Xác thực an toàn qua Google OAuth 2.0 — tự động tạo tài khoản nếu bạn là người dùng mới.</span>
        </div>
      </div>
    </div>
  );
};
