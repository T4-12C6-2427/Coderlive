import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        // Return focus to trigger element
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          setTimeout(() => {
            previousActiveElementRef.current?.focus();
          }, 0);
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
  }[maxWidth];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 pt-[max(0.75rem,var(--safe-top))] sm:pb-[max(0.75rem,var(--safe-bottom))] sm:pl-[max(0.75rem,var(--safe-left))] sm:pr-[max(0.75rem,var(--safe-right))] bg-overlay backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-full ${maxWidthClasses} max-h-viewport-92 sm:max-h-viewport-90 pb-safe sm:pb-0 flex flex-col bg-elevated glass-panel border-t sm:border border-default rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 ${className}`}
      >
        <div className="sm:hidden flex justify-center pt-2 pb-0.5 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" />
        </div>
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-subtle flex-shrink-0">
            <div className="min-w-0">
              {title && <h3 className="text-sm font-semibold text-primary truncate">{title}</h3>}
              {description && <p className="text-xs text-secondary mt-0.5">{description}</p>}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="touch-target inline-flex items-center justify-center p-1 text-muted hover:text-primary rounded-[var(--radius-sm)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer flex-shrink-0"
                title="Đóng"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain flex-1 min-h-0">{children}</div>
      </div>
    </div>,
    document.body
  );
};
