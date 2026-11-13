import React from 'react';
import { CloudUpload, FolderPlus, X } from 'lucide-react';

interface GuestPromptModalProps {
  isOpen: boolean;
  onSaveAsNew: () => void;
  onDiscard: () => void;
}

export const GuestPromptModal: React.FC<GuestPromptModalProps> = ({
  isOpen,
  onSaveAsNew,
  onDiscard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe pl-safe pr-safe bg-overlay backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain">
      <div
        className="relative w-full max-w-md max-h-viewport-90 overflow-y-auto overscroll-contain p-5 sm:p-6 bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onDiscard}
          className="touch-target absolute top-3 right-3 p-2 text-muted hover:text-primary hover:bg-[var(--border-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-5 pr-8">
          <div className="p-3 rounded-[var(--radius-md)] bg-accent-soft border border-[var(--accent-base)]/30 text-accent flex-shrink-0">
            <CloudUpload className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-primary mb-1">
              Phát hiện mã nguồn hiện tại
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              Bạn có mã nguồn đang soạn thảo từ phiên khách. Bạn có muốn lưu mã này thành một dự án mới vào tài khoản của bạn không?
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mt-6">
          <button
            type="button"
            onClick={onSaveAsNew}
            className="touch-target-h w-full py-2.5 px-4 rounded-[var(--radius-sm)] font-semibold text-xs text-accent-on bg-accent hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Lưu thành dự án mới</span>
          </button>

          <button
            type="button"
            onClick={onDiscard}
            className="touch-target-h w-full py-2.5 px-4 rounded-[var(--radius-sm)] font-medium text-xs text-secondary hover:text-primary bg-panel hover:bg-elevated border border-default transition-colors cursor-pointer"
          >
            Bỏ qua &amp; giữ trình soạn thảo trống
          </button>
        </div>
      </div>
    </div>
  );
};
