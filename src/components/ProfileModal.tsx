import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Calendar, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const createdAt = currentUser.metadata.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Không xác định';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      await updateUserProfile(displayName.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật tên hiển thị');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe pl-safe pr-safe bg-overlay backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto overscroll-contain">
      <div
        className="w-full max-w-md max-h-viewport-90 overflow-y-auto overscroll-contain bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] p-5 sm:p-6 text-primary relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="touch-target absolute top-3 right-3 p-2 text-muted hover:text-primary rounded-[var(--radius-sm)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-accent text-accent-on flex items-center justify-center text-lg font-bold shadow-xs flex-shrink-0">
            {currentUser.displayName
              ? currentUser.displayName.charAt(0).toUpperCase()
              : currentUser.email
              ? currentUser.email.charAt(0).toUpperCase()
              : <UserIcon className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-primary">Hồ sơ tài khoản</h3>
            <p className="text-xs text-secondary">Thông tin tài khoản của bạn</p>
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Email */}
          <div>
            <label className="block text-secondary font-semibold mb-1">Địa chỉ Email</label>
            <div className="flex items-center gap-2 p-2.5 bg-input border border-default rounded-[var(--radius-sm)] text-primary min-w-0">
              <Mail className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="font-mono truncate select-all min-w-0">{currentUser.email}</span>
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label className="block text-secondary font-semibold mb-1">Tên hiển thị</label>
            <div className="flex items-center touch-gap gap-2">
              <input
                type="text"
                autoComplete="name"
                enterKeyHint="done"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị của bạn..."
                maxLength={40}
                className="flex-1 min-w-0 h-11 sm:h-9 px-3 py-2 bg-input border border-default rounded-[var(--radius-sm)] text-primary placeholder-muted focus:outline-none focus:border-[var(--accent-base)] focus:ring-1 focus:ring-[var(--accent-base)] transition-all text-xs"
              />
              <button
                type="submit"
                disabled={isSaving || displayName.trim() === (currentUser.displayName || '')}
                className="touch-target-h h-11 sm:h-9 px-3.5 rounded-[var(--radius-sm)] bg-accent hover:bg-[var(--accent-hover)] disabled:opacity-40 text-accent-on font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent-on" />
                    <span>Đã lưu!</span>
                  </>
                ) : (
                  <span>Lưu</span>
                )}
              </button>
            </div>
            {error && <p className="text-danger text-[11px] mt-1">{error}</p>}
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
              onClick={onClose}
              className="touch-target-h px-4 py-2 rounded-[var(--radius-sm)] bg-panel hover:bg-app text-secondary hover:text-primary text-xs font-semibold transition-colors cursor-pointer border border-default"
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
