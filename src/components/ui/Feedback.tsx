import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Kbd } from './Kbd';
import { useIsTouch } from '../../hooks/useViewport';

export interface TooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  shortcut,
  children,
  side = 'bottom',
}) => {
  const isTouch = useIsTouch();
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  };

  useEffect(() => clearTimers, []);

  const computeAndShow = (target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    let top = 0;
    let left = 0;

    if (side === 'bottom') {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2;
    } else if (side === 'top') {
      top = rect.top - 8;
      left = rect.left + rect.width / 2;
    } else if (side === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.right + 8;
    } else if (side === 'left') {
      top = rect.top + rect.height / 2;
      left = rect.left - 8;
    }

    // Clamp horizontally within viewport to avoid horizontal clipping on 360px screens
    if (typeof window !== 'undefined') {
      left = Math.max(72, Math.min(window.innerWidth - 72, left));
      top = Math.max(12, Math.min(window.innerHeight - 44, top));
    }

    setCoords({ top, left });
    setIsVisible(true);
  };

  const handleShow = (e: React.SyntheticEvent<HTMLSpanElement>) => {
    if (isTouch) return;
    computeAndShow(e.currentTarget);
  };

  const handleHide = () => {
    clearTimers();
    setIsVisible(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLSpanElement>) => {
    if (!isTouch) return;
    const target = e.currentTarget;
    clearTimers();
    longPressTimerRef.current = setTimeout(() => {
      computeAndShow(target);
      autoHideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 2200);
    }, 450);
  };

  const handleTouchCancelOrMove = () => {
    if (!isTouch) return;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (!isTouch) return;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <>
      <span
        className="inline-flex"
        onMouseEnter={handleShow}
        onMouseLeave={handleHide}
        onFocus={handleShow}
        onBlur={handleHide}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchCancelOrMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancelOrMove}
      >
        {children}
      </span>
      {isVisible &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: side === 'bottom' || side === 'top' ? 'translateX(-50%)' : 'translateY(-50%)',
              zIndex: 99999,
            }}
            className="pointer-events-none px-2.5 py-1.5 bg-elevated border border-default rounded-[var(--radius-xs)] shadow-[var(--shadow-elevated)] text-[11px] font-medium text-primary flex items-center gap-1.5 max-w-[calc(100vw-24px)] whitespace-normal text-center animate-in fade-in zoom-in-95 duration-100"
          >
            <span>{content}</span>
            {shortcut && !isTouch && <Kbd>{shortcut}</Kbd>}
          </div>,
          document.body
        )}
    </>
  );
};

export interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'info' | 'warning' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  type = 'info',
  actionLabel,
  onAction,
}) => {
  if (!isVisible) return null;

  const typeBorder = {
    success: 'border-[var(--color-success)]/40',
    info: 'border-[var(--color-info)]/40',
    warning: 'border-[var(--color-warning)]/40',
    danger: 'border-[var(--color-danger)]/40',
  }[type];

  return createPortal(
    <div className="fixed bottom-[calc(4.5rem+var(--safe-bottom))] md:bottom-[calc(1.25rem+var(--safe-bottom))] right-[calc(1rem+var(--safe-right))] left-[calc(1rem+var(--safe-left))] sm:left-auto z-[99999] flex justify-center sm:justify-end pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`px-3.5 py-2 bg-elevated border ${typeBorder} rounded-[var(--radius-sm)] shadow-[var(--shadow-elevated)] text-xs font-medium text-primary flex items-center gap-2.5 max-w-full ${
          actionLabel && onAction ? 'pointer-events-auto' : ''
        }`}
      >
        <span>{message}</span>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-2 py-0.5 rounded-[var(--radius-xs)] bg-accent-soft hover:bg-accent text-accent hover:text-accent-on border border-[var(--accent-base)]/40 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded-[var(--radius-xs)]',
    rectangular: 'h-24 w-full rounded-[var(--radius-sm)]',
    circular: 'w-10 h-10 rounded-full',
  }[variant];

  return (
    <div
      className={`animate-pulse bg-[var(--border-subtle)] ${variantClasses} ${className}`}
    />
  );
};

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 select-none ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--border-subtle)] border border-default flex items-center justify-center text-muted mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-semibold text-primary">{title}</h4>
      {description && <p className="text-xs text-secondary mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
