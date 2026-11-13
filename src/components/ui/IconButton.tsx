import React, { forwardRef } from 'react';
import { Tooltip } from './Feedback';
import { useIsTouch } from '../../hooks/useViewport';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary' | 'primary' | 'danger';
  isActive?: boolean;
  tooltip?: string;
  shortcut?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = 'md',
      variant = 'ghost',
      isActive = false,
      tooltip,
      shortcut,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isTouch = useIsTouch();

    const sizeClasses = {
      xs: 'w-6 h-6 rounded-[var(--radius-xs)] text-xs',
      sm: 'w-7 h-7 rounded-[var(--radius-sm)] text-xs',
      md: 'w-8 h-8 rounded-[var(--radius-sm)] text-sm',
      lg: 'w-9 h-9 rounded-[var(--radius-md)] text-base',
    }[size];

    const variantClasses = {
      ghost: isActive
        ? 'bg-accent-soft text-accent border border-transparent'
        : 'bg-transparent text-secondary hover:text-primary hover:bg-[var(--border-subtle)] active:bg-[var(--border-default)] border border-transparent',
      secondary: isActive
        ? 'bg-accent text-accent-on border border-transparent shadow-[var(--shadow-subtle)]'
        : 'bg-elevated text-primary hover:bg-[var(--border-subtle)] active:bg-[var(--border-default)] border border-default shadow-[var(--shadow-subtle)]',
      primary:
        'bg-accent text-accent-on hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] border border-transparent shadow-[var(--shadow-subtle)]',
      danger:
        'bg-transparent text-secondary hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] border border-transparent',
    }[variant];

    const buttonEl = (
      <button
        ref={ref}
        disabled={disabled}
        title={isTouch ? undefined : tooltip}
        aria-label={tooltip || props['aria-label']}
        className={`touch-target inline-flex items-center justify-center flex-shrink-0 transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.95] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );

    if (tooltip && isTouch) {
      return (
        <Tooltip content={tooltip} shortcut={shortcut}>
          {buttonEl}
        </Tooltip>
      );
    }

    return buttonEl;
  }
);

IconButton.displayName = 'IconButton';
