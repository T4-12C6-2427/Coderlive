import React, { useState } from 'react';
import { Share2, X, Copy, Check, Globe, Lock, ShieldCheck } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isShared: boolean;
  shareUrl: string;
  onToggleShare: (shared: boolean) => Promise<void>;
  projectTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  isShared,
  shareUrl,
  onToggleShare,
  projectTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);
      await onToggleShare(!isShared);
    } catch (err) {
      console.error('Lỗi thay đổi trạng thái chia sẻ:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe pl-safe pr-safe bg-overlay backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain">
      <div
        className="relative w-full max-w-md max-h-viewport-90 overflow-y-auto overscroll-contain p-5 sm:p-6 bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="touch-target absolute top-3 right-3 p-2 text-muted hover:text-primary hover:bg-[var(--border-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-accent-soft text-accent border border-[var(--accent-base)]/30 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-primary">Chia sẻ dự án</h3>
            <p className="text-xs text-secondary truncate">{projectTitle}</p>
          </div>
        </div>

        {/* Toggle Share State */}
        <div className="p-4 rounded-[var(--radius-md)] bg-panel border border-default mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-[var(--radius-sm)] flex-shrink-0 ${isShared ? 'bg-success-soft text-success' : 'bg-app text-muted'}`}>
              {isShared ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">
                {isShared ? 'Đang chia sẻ công khai' : 'Dự án riêng tư'}
              </p>
              <p className="text-xs text-secondary mt-0.5">
                {isShared
                  ? 'Bất kỳ ai có liên kết đều có thể xem trang'
                  : 'Chỉ bạn mới có quyền xem dự án này'}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isShared}
            aria-label={isShared ? 'Tắt chia sẻ công khai' : 'Bật chia sẻ công khai'}
            disabled={loading}
            onClick={handleToggle}
            className={`touch-hit-expand relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
              isShared ? 'bg-accent' : 'bg-[var(--border-strong)]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isShared ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Share Link Input when enabled */}
        {isShared ? (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Liên kết chia sẻ (Chỉ đọc)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center touch-gap gap-2">
                <input
                  type="url"
                  inputMode="url"
                  readOnly
                  value={shareUrl}
                  className="flex-1 min-w-0 h-11 sm:h-9 px-3 py-2 bg-input border border-default rounded-[var(--radius-sm)] text-xs text-accent font-mono focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`touch-target-h w-full sm:w-auto px-3 py-2 rounded-[var(--radius-sm)] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    copied
                      ? 'bg-success text-white'
                      : 'bg-accent hover:bg-[var(--accent-hover)] text-accent-on'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 bg-panel rounded-[var(--radius-md)] border border-default text-xs text-secondary space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-primary">
                <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                <span>Bảo mật dữ liệu:</span>
              </div>
              <p className="leading-relaxed">
                Người mở liên kết chỉ có quyền <strong>xem trước và xem mã nguồn ở chế độ chỉ đọc</strong>. Họ không thể sửa đổi tệp gốc của bạn, nhưng có thể nhấn nút <strong>&quot;Sao chép về tài khoản của tôi&quot; (Fork)</strong> để phát triển tiếp.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-[var(--radius-md)] bg-panel border border-default text-xs text-secondary text-center mb-4">
            Bật tính năng chia sẻ ở trên để nhận liên kết xem trực tiếp và chia sẻ với bạn bè.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="touch-target-h px-4 py-2 text-xs font-medium text-secondary hover:text-primary bg-panel hover:bg-elevated rounded-[var(--radius-sm)] transition-colors border border-default cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
