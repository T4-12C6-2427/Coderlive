import React from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (val: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  className = '',
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: 'h-7 p-0.5 text-xs',
    md: 'h-8 p-1 text-xs',
  }[size];

  const itemSizeClasses = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1',
  }[size];

  return (
    <div
      role="tablist"
      className={`touch-gap inline-flex items-center max-w-full overflow-x-auto no-scrollbar bg-[var(--border-subtle)] border border-default rounded-[var(--radius-sm)] select-none ${sizeClasses} ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            className={`touch-target-h inline-flex items-center gap-1.5 font-medium rounded-[calc(var(--radius-sm)-2px)] transition-all cursor-pointer whitespace-nowrap outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-base)] ${itemSizeClasses} ${
              isSelected
                ? 'bg-elevated text-primary shadow-[var(--shadow-subtle)]'
                : 'text-secondary hover:text-primary'
            }`}
          >
            {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export interface TabItem<T extends string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}: TabsProps<T>) {
  if (variant === 'pill') {
    return (
      <div className={`touch-gap flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`touch-target-h flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/30 font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)] border border-transparent'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--border-subtle)] text-muted">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`touch-gap flex items-center gap-4 border-b border-subtle overflow-x-auto no-scrollbar max-w-full ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`touch-target-h relative flex items-center gap-1.5 pb-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isActive ? 'text-primary font-semibold' : 'text-secondary hover:text-primary'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--border-subtle)] text-muted">
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-in fade-in duration-150" />
            )}
          </button>
        );
      })}
    </div>
  );
}
