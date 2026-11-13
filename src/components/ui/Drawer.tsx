import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  showCloseButton?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  position = 'right',
  title,
  description,
  children,
  width = 'w-full sm:w-96',
  showCloseButton = true,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = position === 'left' ? 'left-0' : 'right-0';
  const slideAnimation =
    position === 'left'
      ? 'animate-in slide-in-from-left duration-250 ease-out'
      : 'animate-in slide-in-from-right duration-250 ease-out';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex bg-overlay backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 ${positionClasses} h-viewport ${width} max-w-[100vw] pt-safe pb-safe ${
          position === 'left' ? 'pl-safe border-r' : 'pr-safe border-l'
        } bg-panel glass-panel border-default shadow-[var(--shadow-overlay)] text-primary flex flex-col z-50 ${slideAnimation}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 min-h-[52px] py-2 border-b border-subtle flex-shrink-0">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-primary truncate">{title}</h3>}
            {description && <p className="text-xs text-secondary mt-0.5">{description}</p>}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="touch-target inline-flex items-center justify-center p-1.5 text-muted hover:text-primary rounded-[var(--radius-sm)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer flex-shrink-0"
              title="Đóng"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
};
