import React, { useEffect, useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import {
  X,
  User as UserIcon,
  Mail,
  AtSign,
  Calendar,
  Check,
  Loader2,
  Link2,
  Unlink,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Send,
} from 'lucide-react';
import { getVietnameseAuthErrorMessage, useAuth } from '../contexts/AuthContext';
import {
  evaluatePasswordStrength,
  getAccountIdentity,
  getVerifiedPublicEmail,
} from '../lib/usernameAuth';
import {
  DEFAULT_USER_PRIVACY_SETTINGS,
  getUserPrivacySettings,
  updateUserPrivacySettings,
} from '../services/userService';
import { UserPrivacySettings } from '../types';
import { Switch } from './ui/Controls';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    updateUserProfile,
    linkGoogleAccount,
    unlinkGoogleAccount,
    changeUserPassword,
  } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Google linking states
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [linkFeedback, setLinkFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Privacy & Collab invite discovery states
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings>(
    DEFAULT_USER_PRIVACY_SETTINGS
  );
  const [isLoadingPrivacy, setIsLoadingPrivacy] = useState(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [privacyFeedback, setPrivacyFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSendingVerificationEmail, setIsSendingVerificationEmail] = useState(false);

  const isBusy = isSavingName || isLinkingGoogle || isChangingPassword || isSavingPrivacy;

  useEffect(() => {
    if (isOpen && currentUser) {
      setDisplayName(currentUser.displayName || '');
      setAvatarLoadError(false);
      setNameError(null);
      setNameSavedSuccess(false);
      setLinkFeedback(null);
      setConfirmUnlink(false);
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setPasswordFeedback(null);
      setPrivacyFeedback(null);

      let cancelled = false;
      setIsLoadingPrivacy(true);
      getUserPrivacySettings(currentUser.uid)
        .then((loaded) => {
          if (!cancelled) {
            setPrivacySettings(loaded);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoadingPrivacy(false);
        });
      return () => {
        cancelled = true;
      };
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [currentUser?.photoURL]);

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

  if (!isOpen || !currentUser) return null;

  const identity = getAccountIdentity(currentUser);
  const verifiedPublicEmail = getVerifiedPublicEmail(currentUser);
  const showPhoto = Boolean(currentUser.photoURL) && !avatarLoadError;
  const initialChar = identity.displayLabel.charAt(0).toUpperCase();
  const passwordStrength = evaluatePasswordStrength(newPassword);

  const createdAt = currentUser.metadata.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Không xác định';

  const authMethodSummary = (() => {
    const parts: string[] = [];
    if (identity.hasPasswordProvider) {
      parts.push(identity.username ? 'Tên đăng nhập & Mật khẩu' : 'Email & Mật khẩu');
    }
    if (identity.hasGoogleProvider) {
      parts.push('Google');
    }
    return parts.join(' • ') || 'Tài khoản Coderlive';
  })();

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError('Tên hiển thị không được để trống.');
      return;
    }
    try {
      setIsSavingName(true);
      setNameError(null);
      await updateUserProfile(trimmed);
      setNameSavedSuccess(true);
      setTimeout(() => setNameSavedSuccess(false), 2500);
    } catch (err: any) {
      setNameError(getVietnameseAuthErrorMessage(err));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (isBusy) return;
    setLinkFeedback(null);
    try {
      setIsLinkingGoogle(true);
      await linkGoogleAccount();
      setLinkFeedback({
        type: 'success',
        message: 'Đã liên kết tài khoản Google thành công! Bạn có thể đăng nhập bằng Google từ bây giờ.',
      });
    } catch (err: any) {
      setLinkFeedback({
        type: 'error',
        message: getVietnameseAuthErrorMessage(err, { mode: 'link', method: 'google' }),
      });
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (isBusy) return;
    setLinkFeedback(null);
    try {
      setIsLinkingGoogle(true);
      await unlinkGoogleAccount();
      setConfirmUnlink(false);
      setLinkFeedback({
        type: 'success',
        message: 'Đã hủy liên kết tài khoản Google.',
      });
    } catch (err: any) {
      setLinkFeedback({
        type: 'error',
        message: getVietnameseAuthErrorMessage(err, { mode: 'link', method: 'google' }),
      });
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;

    setPasswordFeedback(null);

    if (!currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordFeedback({ type: 'error', message: 'Mật khẩu mới nhập lại chưa khớp.' });
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' });
      return;
    }

    try {
      setIsChangingPassword(true);
      await changeUserPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordFeedback({
        type: 'success',
        message: 'Đã đổi mật khẩu thành công!',
      });
    } catch (err: any) {
      setPasswordFeedback({
        type: 'error',
        message: getVietnameseAuthErrorMessage(err, { mode: 'change-password' }),
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePrivacyToggle = async (patch: Partial<UserPrivacySettings>) => {
    if (!currentUser || isBusy || isLoadingPrivacy) return;
    const prev = privacySettings;
    const next: UserPrivacySettings = { ...prev, ...patch };
    setPrivacySettings(next);
    setPrivacyFeedback(null);
    setIsSavingPrivacy(true);
    try {
      const saved = await updateUserPrivacySettings(currentUser, next);
      setPrivacySettings(saved);
      setPrivacyFeedback({
        type: 'success',
        message: 'Đã lưu cài đặt quyền riêng tư.',
      });
    } catch (err: any) {
      setPrivacySettings(prev);
      setPrivacyFeedback({
        type: 'error',
        message: err?.message || 'Không thể lưu cài đặt quyền riêng tư. Vui lòng thử lại.',
      });
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!currentUser || isSendingVerificationEmail) return;
    setPrivacyFeedback(null);
    setIsSendingVerificationEmail(true);
    try {
      await sendEmailVerification(currentUser);
      setPrivacyFeedback({
        type: 'success',
        message: 'Đã gửi email xác minh. Sau khi bấm vào liên kết trong hộp thư, hãy tải lại trang để kích hoạt.',
      });
    } catch (err: any) {
      setPrivacyFeedback({
        type: 'error',
        message: getVietnameseAuthErrorMessage(err),
      });
    } finally {
      setIsSendingVerificationEmail(false);
    }
  };

  const strengthBarColors: Record<number, string> = {
    0: 'bg-[var(--border-default)]',
    1: 'bg-[var(--color-danger)]',
    2: 'bg-[var(--color-warning)]',
    3: 'bg-[var(--accent-base)]',
    4: 'bg-[var(--color-success)]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 pt-safe pb-safe pl-safe pr-safe bg-overlay backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto overscroll-contain"
      onClick={() => {
        if (!isBusy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="w-full max-w-md max-sm:h-full max-sm:max-w-full max-sm:rounded-none max-sm:border-0 sm:max-h-viewport-90 overflow-y-auto overscroll-contain bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] p-5 sm:p-6 text-primary relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="touch-target absolute top-3 right-3 p-2 text-muted hover:text-primary rounded-[var(--radius-sm)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          {showPhoto ? (
            <img
              src={currentUser.photoURL!}
              alt={identity.displayLabel}
              referrerPolicy="no-referrer"
              onError={() => setAvatarLoadError(true)}
              className="w-12 h-12 rounded-[var(--radius-md)] object-cover border border-default shadow-xs flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-accent text-accent-on flex items-center justify-center text-lg font-bold shadow-xs flex-shrink-0">
              {initialChar || <UserIcon className="w-6 h-6" />}
            </div>
          )}
          <div className="min-w-0">
            <h3 id="profile-modal-title" className="text-base font-bold text-primary truncate">
              {identity.displayLabel}
            </h3>
            <p className="text-xs text-secondary truncate">{authMethodSummary}</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Username (if username account) */}
          {identity.username && (
            <div>
              <label className="block text-secondary font-semibold mb-1">Tên đăng nhập</label>
              <div className="flex items-center gap-2 p-2.5 bg-input border border-default rounded-[var(--radius-sm)] text-primary min-w-0">
                <AtSign className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="font-mono truncate select-all min-w-0">{identity.username}</span>
              </div>
            </div>
          )}

          {/* Public Email (Google or Email account or linked Google email — NEVER synthetic email) */}
          {identity.publicEmail && (
            <div>
              <label className="block text-secondary font-semibold mb-1">
                {identity.username ? 'Email Google đã liên kết' : 'Địa chỉ Email'}
              </label>
              <div className="flex items-center gap-2 p-2.5 bg-input border border-default rounded-[var(--radius-sm)] text-primary min-w-0">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="font-mono truncate select-all min-w-0">{identity.publicEmail}</span>
              </div>
            </div>
          )}

          {/* Display Name Form */}
          <form onSubmit={handleSaveName}>
            <label htmlFor="profile-display-name" className="block text-secondary font-semibold mb-1">
              Tên hiển thị
            </label>
            <div className="flex items-center touch-gap gap-2">
              <input
                id="profile-display-name"
                type="text"
                autoComplete="name"
                enterKeyHint="done"
                disabled={isBusy}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="Nhập tên hiển thị của bạn..."
                maxLength={40}
                className="flex-1 min-w-0 min-h-[44px] sm:min-h-[36px] px-3 py-2 bg-input border border-default rounded-[var(--radius-sm)] text-primary placeholder-muted focus:outline-none focus:border-[var(--accent-base)] focus:ring-1 focus:ring-[var(--accent-base)] transition-all text-base sm:text-xs"
              />
              <button
                type="submit"
                disabled={isBusy || displayName.trim() === (currentUser.displayName || '') || !displayName.trim()}
                className="touch-target-h min-h-[44px] sm:min-h-[36px] px-3.5 rounded-[var(--radius-sm)] bg-accent hover:bg-[var(--accent-hover)] disabled:opacity-40 text-accent-on font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs"
              >
                {isSavingName ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : nameSavedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent-on" />
                    <span>Đã lưu!</span>
                  </>
                ) : (
                  <span>Lưu</span>
                )}
              </button>
            </div>
            {nameError && <p className="text-danger text-[11px] mt-1">{nameError}</p>}
          </form>

          {/* Google Linking Section */}
          <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="font-semibold text-primary">Liên kết tài khoản Google</span>
              </div>
              {identity.hasGoogleProvider && (
                <span className="text-[11px] font-medium text-success flex items-center gap-1 flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã liên kết
                </span>
              )}
            </div>

            {identity.hasGoogleProvider ? (
              <div className="space-y-2">
                <p className="text-[11px] text-secondary leading-relaxed">
                  {identity.googleEmail
                    ? `Tài khoản đã được liên kết với Google (${identity.googleEmail}).`
                    : 'Tài khoản đã được liên kết với Google.'}
                </p>

                {identity.hasPasswordProvider ? (
                  confirmUnlink ? (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-warning flex-1 min-w-[160px]">
                        Xác nhận hủy liên kết Google?
                      </span>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={handleUnlinkGoogle}
                        className="touch-target-h min-h-[36px] px-3 py-1.5 rounded-[var(--radius-sm)] bg-danger-soft hover:bg-[var(--color-danger)]/20 text-danger border border-danger/30 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isLinkingGoogle ? 'Đang xử lý...' : 'Xác nhận hủy'}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setConfirmUnlink(false)}
                        className="touch-target-h min-h-[36px] px-3 py-1.5 rounded-[var(--radius-sm)] bg-elevated hover:bg-app text-secondary border border-default text-xs font-medium transition-colors cursor-pointer"
                      >
                        Giữ lại
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        setLinkFeedback(null);
                        setConfirmUnlink(true);
                      }}
                      className="touch-target-h min-h-[38px] w-full px-3 py-2 rounded-[var(--radius-sm)] bg-elevated hover:bg-app border border-default text-secondary hover:text-primary font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Hủy liên kết Google</span>
                    </button>
                  )
                ) : (
                  <p className="text-[11px] text-muted">
                    Google hiện là phương thức đăng nhập duy nhất của tài khoản này.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-secondary leading-relaxed">
                  Liên kết Google để đăng nhập nhanh bằng 1 chạm và giúp khôi phục truy cập nếu bạn quên mật khẩu.
                </p>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleLinkGoogle}
                  className="touch-target-h min-h-[42px] w-full px-3 py-2 rounded-[var(--radius-sm)] bg-elevated hover:bg-app border border-default hover:border-[var(--accent-base)] text-primary font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLinkingGoogle ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span>Đang liên kết Google...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 text-accent" />
                      <span>Liên kết tài khoản Google</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {linkFeedback && (
              <div
                role="status"
                className={`p-2.5 rounded-[var(--radius-sm)] border text-[11px] flex items-start gap-2 ${
                  linkFeedback.type === 'success'
                    ? 'bg-[var(--color-success-soft,var(--accent-soft))] border-[var(--color-success)]/30 text-primary'
                    : 'bg-danger-soft border-danger/30 text-danger'
                }`}
              >
                {linkFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{linkFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Password Change Section (for username/email accounts) */}
          {identity.hasPasswordProvider && (
            <div className="rounded-[var(--radius-md)] bg-panel border border-subtle overflow-hidden">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setShowPasswordForm((prev) => !prev);
                  setPasswordFeedback(null);
                }}
                className="touch-target-h min-h-[44px] w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[var(--border-subtle)]/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="font-semibold text-primary">Đổi mật khẩu</span>
                </div>
                {showPasswordForm ? (
                  <ChevronUp className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </button>

              {showPasswordForm && (
                <form onSubmit={handlePasswordChangeSubmit} className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-subtle">
                  <div>
                    <label htmlFor="profile-current-pw" className="block text-[11px] font-medium text-secondary mb-1">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        id="profile-current-pw"
                        type={showCurrentPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        disabled={isBusy}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (passwordFeedback) setPasswordFeedback(null);
                        }}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="w-full min-h-[44px] sm:min-h-[36px] pl-3 pr-10 py-2 bg-input border border-default rounded-[var(--radius-sm)] text-primary placeholder-muted focus:outline-none focus:border-[var(--accent-base)] text-base sm:text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        aria-label={showCurrentPassword ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
                        className="touch-target absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-primary cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profile-new-pw" className="block text-[11px] font-medium text-secondary mb-1">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        id="profile-new-pw"
                        type={showNewPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={isBusy}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordFeedback) setPasswordFeedback(null);
                        }}
                        placeholder="Ít nhất 6 ký tự"
                        className="w-full min-h-[44px] sm:min-h-[36px] pl-3 pr-10 py-2 bg-input border border-default rounded-[var(--radius-sm)] text-primary placeholder-muted focus:outline-none focus:border-[var(--accent-base)] text-base sm:text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                        className="touch-target absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-primary cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-1.5 space-y-1">
                        <div className="grid grid-cols-4 gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 rounded-full ${
                                passwordStrength.score >= level
                                  ? strengthBarColors[passwordStrength.score]
                                  : 'bg-[var(--border-subtle)]'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-secondary">
                          Độ mạnh: {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="profile-confirm-pw" className="block text-[11px] font-medium text-secondary mb-1">
                      Nhập lại mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        id="profile-confirm-pw"
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={isBusy}
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          if (passwordFeedback) setPasswordFeedback(null);
                        }}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full min-h-[44px] sm:min-h-[36px] pl-3 pr-10 py-2 bg-input border border-default rounded-[var(--radius-sm)] text-primary placeholder-muted focus:outline-none focus:border-[var(--accent-base)] text-base sm:text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                        aria-label={showConfirmNewPassword ? 'Ẩn mật khẩu nhập lại' : 'Hiện mật khẩu nhập lại'}
                        className="touch-target absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-primary cursor-pointer"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {passwordFeedback && (
                    <div
                      role="status"
                      className={`p-2.5 rounded-[var(--radius-sm)] border text-[11px] flex items-start gap-2 ${
                        passwordFeedback.type === 'success'
                          ? 'bg-[var(--color-success-soft,var(--accent-soft))] border-[var(--color-success)]/30 text-primary'
                          : 'bg-danger-soft border-danger/30 text-danger'
                      }`}
                    >
                      {passwordFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed">{passwordFeedback.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="touch-target-h min-h-[42px] sm:min-h-[36px] w-full px-3 py-2 rounded-[var(--radius-sm)] bg-accent hover:bg-[var(--accent-hover)] text-accent-on font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang cập nhật mật khẩu...</span>
                      </>
                    ) : (
                      <span>Cập nhật mật khẩu</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Privacy & Collab Invite Settings Section */}
          <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Lock className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="font-semibold text-primary">Quyền riêng tư &amp; Lời mời dự án</span>
              </div>
              {(isLoadingPrivacy || isSavingPrivacy) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent flex-shrink-0" />
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-medium text-primary">
                    Cho phép người khác tìm thấy tôi khi mời vào dự án
                  </p>
                  <p className="text-[11px] text-muted leading-snug">
                    Hiển thị tên hiển thị{identity.username ? ` và @${identity.username}` : ''} trong kết quả tìm kiếm mời thành viên.
                  </p>
                </div>
                <Switch
                  size="sm"
                  ariaLabel="Cho phép người khác tìm thấy tôi khi mời vào dự án"
                  checked={privacySettings.allowProfileSearch}
                  disabled={isBusy || isLoadingPrivacy}
                  onChange={(checked) => handlePrivacyToggle({ allowProfileSearch: checked })}
                />
              </div>

              <div className="pt-2 border-t border-subtle flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-medium text-primary">
                    Cho phép tìm qua email đã xác minh
                  </p>
                  {verifiedPublicEmail ? (
                    <p className="text-[11px] text-muted leading-snug">
                      Chỉ khớp khi người mời nhập chính xác địa chỉ <span className="font-mono text-secondary">{verifiedPublicEmail}</span>. Không bao giờ công khai danh sách email.
                    </p>
                  ) : identity.publicEmail ? (
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-muted leading-snug">
                        Email <span className="font-mono text-secondary">{identity.publicEmail}</span> chưa được xác minh nên tính năng này đang tắt.
                      </p>
                      <button
                        type="button"
                        disabled={isSendingVerificationEmail || isBusy}
                        onClick={handleSendVerificationEmail}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {isSendingVerificationEmail ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        <span>Gửi email xác minh</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted leading-snug">
                      Chỉ khả dụng khi bạn liên kết tài khoản Google hoặc đăng ký bằng email đã xác minh.
                    </p>
                  )}
                </div>
                <Switch
                  size="sm"
                  ariaLabel="Cho phép tìm qua email đã xác minh"
                  checked={Boolean(verifiedPublicEmail && privacySettings.allowEmailSearch)}
                  disabled={!verifiedPublicEmail || isBusy || isLoadingPrivacy}
                  onChange={(checked) => handlePrivacyToggle({ allowEmailSearch: checked })}
                />
              </div>

              <div className="pt-2 border-t border-subtle flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-medium text-primary">
                    Cho phép nhận lời mời tham gia dự án nhóm
                  </p>
                  <p className="text-[11px] text-muted leading-snug">
                    Mọi lời mời luôn chờ bạn bấm Chấp nhận hoặc Từ chối trước khi tham gia.
                  </p>
                </div>
                <Switch
                  size="sm"
                  ariaLabel="Cho phép nhận lời mời tham gia dự án nhóm"
                  checked={privacySettings.acceptDirectInvites}
                  disabled={isBusy || isLoadingPrivacy}
                  onChange={(checked) => handlePrivacyToggle({ acceptDirectInvites: checked })}
                />
              </div>
            </div>

            {privacyFeedback && (
              <div
                role="status"
                className={`p-2 rounded-[var(--radius-sm)] border text-[11px] flex items-start gap-2 ${
                  privacyFeedback.type === 'success'
                    ? 'bg-[var(--color-success-soft,var(--accent-soft))] border-[var(--color-success)]/30 text-primary'
                    : 'bg-danger-soft border-danger/30 text-danger'
                }`}
              >
                {privacyFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{privacyFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Creation Date */}
          <div>
            <label className="block text-secondary font-semibold mb-1">Ngày tham gia</label>
            <div className="flex items-center gap-2 p-2.5 bg-input border border-default rounded-[var(--radius-sm)] text-secondary">
              <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
              <span>{createdAt}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={isBusy}
              onClick={onClose}
              className="touch-target-h min-h-[42px] sm:min-h-[36px] px-4 py-2 rounded-[var(--radius-sm)] bg-panel hover:bg-app text-secondary hover:text-primary text-xs font-semibold transition-colors cursor-pointer border border-default disabled:opacity-50"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
