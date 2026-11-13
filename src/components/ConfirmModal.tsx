import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  onConfirm,
  onCancel,
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,var(--safe-top))] pb-[max(0.75rem,var(--safe-bottom))] bg-overlay backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md max-h-viewport-90 overflow-y-auto overscroll-contain p-5 sm:p-6 bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="touch-target inline-flex items-center justify-center absolute top-3 right-3 p-1.5 text-muted hover:text-primary hover:bg-[var(--border-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer"
          title="Đóng"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-[var(--radius-md)] flex-shrink-0 ${
            isDangerous
              ? 'bg-danger-soft text-danger border border-danger/20'
              : 'bg-accent-soft text-accent border border-[var(--accent-base)]/20'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 pr-6 min-w-0">
            <h3 className="text-base font-semibold text-primary mb-1.5">{title}</h3>
            <p className="text-xs text-secondary leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="touch-gap mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="touch-target px-4 py-2 text-xs font-medium text-secondary hover:text-primary bg-panel hover:bg-elevated rounded-[var(--radius-sm)] transition-colors border border-default cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`touch-target px-4 py-2 text-xs font-medium rounded-[var(--radius-sm)] shadow-xs transition-all cursor-pointer ${
              isDangerous
                ? 'bg-danger text-white hover:opacity-90'
                : 'bg-accent text-accent-on hover:bg-[var(--accent-hover)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
