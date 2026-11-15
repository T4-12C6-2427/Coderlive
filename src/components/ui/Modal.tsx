import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  fullScreenMobile?: boolean;
  showCloseButton?: boolean;
  className?: string;
  bodyClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  fullScreenMobile = false,
  showCloseButton = true,
  className = '',
  bodyClassName = 'p-4 sm:p-5 overflow-y-auto overscroll-contain flex-1 min-h-0',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const initialFocusTimer = setTimeout(() => {
        if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
          modalRef.current.focus();
        }
      }, 90);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && modalRef.current) {
          const rawFocusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
          );
          const focusableElements = Array.from(rawFocusable).filter(
            (el) => el.getClientRects().length > 0
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(initialFocusTimer);
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
    full: '',
  }[maxWidth];

  const backdropLayoutClass = fullScreenMobile
    ? 'items-stretch md:items-center justify-center p-0 md:p-4'
    : 'items-end sm:items-center justify-center p-0 sm:p-4 pt-[max(0.75rem,var(--safe-top))] sm:pb-[max(0.75rem,var(--safe-bottom))] sm:pl-[max(0.75rem,var(--safe-left))] sm:pr-[max(0.75rem,var(--safe-right))]';

  const panelBaseClass = fullScreenMobile
    ? 'w-full h-[100dvh] max-h-[100dvh] md:h-auto rounded-none border-0 md:border md:rounded-[var(--radius-xl)] pt-safe pb-safe pl-safe pr-safe md:p-0'
    : `w-full max-w-full ${maxWidthClasses} max-h-viewport-92 sm:max-h-viewport-90 pb-safe sm:pb-0 border-t sm:border rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-lg)]`;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className={`fixed inset-0 z-[60] flex ${backdropLayoutClass} bg-overlay backdrop-blur-sm animate-in fade-in duration-150`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`${panelBaseClass} flex flex-col bg-elevated glass-panel border-default shadow-[var(--shadow-overlay)] text-primary overflow-hidden outline-none animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 ${className}`}
      >
        {!fullScreenMobile && (
          <div className="sm:hidden flex justify-center pt-2 pb-0.5 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" />
          </div>
        )}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-subtle flex-shrink-0">
            <div className="min-w-0">
              {title && (
                <h3 id={titleId} className="text-sm sm:text-base font-semibold text-primary truncate">
                  {title}
                </h3>
              )}
              {description && (
                <p id={descId} className="text-xs text-secondary mt-0.5 truncate">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 touch-target inline-flex items-center justify-center p-1.5 text-muted hover:text-primary rounded-[var(--radius-sm)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
                title="Đóng"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}
        <div className={bodyClassName}>{children}</div>
        {footer && (
          <div className="px-4 sm:px-6 py-3 border-t border-subtle bg-elevated flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
