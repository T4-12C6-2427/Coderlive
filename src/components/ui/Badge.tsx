import React from 'react';

export interface BadgeProps {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded-[var(--radius-xs)]',
    md: 'text-xs px-2 py-0.5 rounded-[var(--radius-sm)]',
  }[size];

  const variantClasses = {
    default: 'bg-[var(--border-subtle)] text-secondary border border-default',
    accent: 'bg-accent-soft text-accent border border-[var(--accent-base)]/30',
    success: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/30',
    warning: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/30',
    danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/30',
    info: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info)]/30',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 font-medium select-none ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  children: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  isActive = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[var(--radius-sm)] transition-all cursor-pointer border ${
        isActive
          ? 'bg-accent-soft text-accent border-[var(--accent-base)]/40 shadow-xs'
          : 'bg-elevated text-secondary hover:text-primary border-default hover:bg-[var(--border-subtle)]'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
