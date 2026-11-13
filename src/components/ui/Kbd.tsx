import React from 'react';
import { useIsTouch } from '../../hooks/useViewport';

export interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  const isTouch = useIsTouch();
  if (isTouch) return null;

  return (
    <kbd
      className={`shortcut-hint inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono font-medium rounded-[var(--radius-xs)] bg-[var(--border-subtle)] text-secondary border border-default shadow-xs select-none ${className}`}
    >
      {children}
    </kbd>
  );
};
