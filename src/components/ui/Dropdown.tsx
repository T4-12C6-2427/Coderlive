import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useIsMobile } from '../../hooks/useViewport';

export interface DropdownItem {
  id: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect: () => void;
}

export interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  items: DropdownItem[];
  title?: React.ReactNode;
  ariaLabel?: string;
  align?: 'left' | 'right';
  minWidth?: number;
  restoreFocusOnClose?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
  items,
  title,
  ariaLabel,
  align = 'left',
  minWidth = 200,
  restoreFocusOnClose = true,
}) => {
  const isMobile = useIsMobile();
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'bottom' | 'top' }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  // Compute viewport-safe popover coordinates on desktop/tablet
  useLayoutEffect(() => {
    if (!isOpen || isMobile) return;

    const updatePosition = () => {
      const triggerEl = triggerRef.current;
      if (!triggerEl) return;

      const rect = triggerEl.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();
      const menuWidth = menuRect?.width || minWidth;
      const menuHeight = menuRect?.height || Math.max(80, items.length * 42 + (title ? 32 : 12));
      const margin = 12;

      let left = align === 'right' ? rect.right - menuWidth : rect.left;
      left = Math.max(margin, Math.min(left, window.innerWidth - menuWidth - margin));

      const spaceBelow = window.innerHeight - rect.bottom - margin;
      const spaceAbove = rect.top - margin;
      const shouldFlipTop = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      const top = shouldFlipTop
        ? Math.max(margin, rect.top - menuHeight - 6)
        : Math.min(rect.bottom + 6, Math.max(margin, window.innerHeight - menuHeight - margin));

      setCoords({
        top,
        left,
        placement: shouldFlipTop ? 'top' : 'bottom',
      });
    };

    updatePosition();
    const rafId = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, isMobile, triggerRef, align, minWidth, items.length, title]);

  // Focus first enabled item when opening
  useEffect(() => {
    if (!isOpen) return;
    const rafId = requestAnimationFrame(() => {
      const firstEnabledIdx = items.findIndex((item) => !item.disabled);
      if (firstEnabledIdx >= 0) {
        itemRefs.current[firstEnabledIdx]?.focus();
      } else {
        menuRef.current?.focus();
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, items]);

  // Outside pointerdown & Escape handling
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        if (restoreFocusOnClose) {
          requestAnimationFrame(() => triggerRef.current?.focus());
        }
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef, restoreFocusOnClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const moveFocus = (direction: 1 | -1) => {
    const enabledIndices = items
      .map((item, idx) => (!item.disabled ? idx : -1))
      .filter((idx) => idx !== -1);
    if (enabledIndices.length === 0) return;

    const activeEl = document.activeElement;
    const currentIdx = itemRefs.current.findIndex((el) => el === activeEl);
    const pos = enabledIndices.indexOf(currentIdx);
    const nextPos =
      pos === -1
        ? direction === 1
          ? 0
          : enabledIndices.length - 1
        : (pos + direction + enabledIndices.length) % enabledIndices.length;

    itemRefs.current[enabledIndices[nextPos]]?.focus();
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveFocus(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveFocus(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const first = items.findIndex((i) => !i.disabled);
      if (first >= 0) itemRefs.current[first]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      for (let i = items.length - 1; i >= 0; i--) {
        if (!items[i].disabled) {
          itemRefs.current[i]?.focus();
          break;
        }
      }
    } else if (e.key === 'Tab') {
      onClose();
    }
  };

  const renderMenuItems = (mobileSheet: boolean) => (
    <div className={mobileSheet ? 'p-2 pb-safe space-y-1' : 'p-1 space-y-0.5'}>
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          onClick={() => {
            if (item.disabled) return;
            onClose();
            item.onSelect();
          }}
          className={`w-full flex items-center justify-between gap-3 text-left rounded-[var(--radius-sm)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer ${
            mobileSheet ? 'min-h-[48px] px-3.5 py-2.5 text-sm' : 'min-h-[34px] px-2.5 py-1.5 text-xs'
          } ${
            item.danger
              ? 'text-danger hover:bg-danger-soft focus-visible:bg-danger-soft'
              : 'text-primary hover:bg-[var(--border-subtle)] focus-visible:bg-[var(--border-subtle)]'
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            {item.icon && <span className="flex-shrink-0 flex items-center">{item.icon}</span>}
            <span className="font-medium truncate">{item.label}</span>
          </span>
          {item.hint && (
            <span className="text-[11px] text-muted flex-shrink-0">{item.hint}</span>
          )}
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return createPortal(
      <div
        className="fixed inset-0 z-[99999] flex items-end justify-center bg-overlay backdrop-blur-xs animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          ref={menuRef}
          role="menu"
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-full bg-elevated glass-panel border-t border-default rounded-t-[var(--radius-xl)] shadow-[var(--shadow-overlay)] text-primary overflow-hidden animate-in slide-in-from-bottom duration-200"
        >
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" />
          </div>
          {title && (
            <div className="px-4 py-2 border-b border-subtle flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-primary">{title}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng menu"
                className="min-w-[44px] min-h-[44px] -mr-2 inline-flex items-center justify-center text-muted hover:text-primary rounded-[var(--radius-sm)] cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
          {renderMenuItems(true)}
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={handleMenuKeyDown}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        minWidth: `${minWidth}px`,
        zIndex: 99999,
      }}
      className={`max-w-[calc(100vw-24px)] bg-elevated glass-panel border border-default rounded-[var(--radius-md)] shadow-[var(--shadow-overlay)] text-primary select-none animate-in fade-in zoom-in-95 duration-150 ${
        coords.placement === 'top' ? 'origin-bottom' : 'origin-top'
      }`}
    >
      {title && (
        <div className="px-3 py-1.5 border-b border-subtle text-[11px] font-semibold text-muted uppercase tracking-wider">
          {title}
        </div>
      )}
      {renderMenuItems(false)}
    </div>,
    document.body
  );
};
