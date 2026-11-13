import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Size tokens
    const sizeClasses = {
      xs: 'h-6 px-2 text-[11px] gap-1 rounded-[var(--radius-xs)]',
      sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-[var(--radius-sm)]',
      md: 'h-8 px-3 text-xs font-medium gap-1.5 rounded-[var(--radius-sm)]',
      lg: 'h-9 px-4 text-sm font-medium gap-2 rounded-[var(--radius-md)]',
    }[size];

    // Variant tokens
    const variantClasses = {
      primary:
        'bg-accent text-accent-on hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] border border-transparent shadow-[var(--shadow-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]',
      secondary:
        'bg-elevated text-primary hover:bg-[var(--border-subtle)] active:bg-[var(--border-default)] border border-default shadow-[var(--shadow-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]',
      ghost:
        'bg-transparent text-secondary hover:text-primary hover:bg-[var(--border-subtle)] active:bg-[var(--border-default)] border border-transparent focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]',
      danger:
        'bg-[var(--color-danger-soft)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white border border-transparent focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]',
      icon:
        'p-1.5 bg-transparent text-secondary hover:text-primary hover:bg-[var(--border-subtle)] border border-transparent rounded-[var(--radius-sm)]',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`touch-target inline-flex items-center justify-center font-medium transition-all select-none whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] outline-none focus-visible:outline-none ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
