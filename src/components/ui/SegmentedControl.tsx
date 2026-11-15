import React, { useId, useRef } from 'react';

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
  ariaLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  className = '',
  ariaLabel,
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sizeClasses = {
    sm: 'h-7 p-0.5 text-xs',
    md: 'h-8 p-1 text-xs',
  }[size];

  const itemSizeClasses = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1',
  }[size];

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (options.length === 0) return;
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (index + 1) % options.length;
    else if (e.key === 'ArrowLeft') nextIdx = (index - 1 + options.length) % options.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = options.length - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      onChange(options[nextIdx].value);
      buttonRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`touch-gap inline-flex items-center max-w-full overflow-x-auto no-scrollbar bg-[var(--border-subtle)] border border-default rounded-[var(--radius-sm)] select-none ${sizeClasses} ${className}`}
    >
      {options.map((opt, idx) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`touch-target-h inline-flex items-center gap-1.5 font-medium rounded-[calc(var(--radius-sm)-2px)] transition-all cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] ${itemSizeClasses} ${
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
  idPrefix?: string;
  ariaLabel?: string;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
  idPrefix,
  ariaLabel,
}: TabsProps<T>) {
  const autoId = useId();
  const resolvedPrefix = idPrefix || autoId;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (tabs.length === 0) return;
    let nextIdx: number | null = null;
    if (e.key === 'ArrowRight') nextIdx = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIdx = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = tabs.length - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      onChange(tabs[nextIdx].id);
      tabRefs.current[nextIdx]?.focus();
    }
  };

  if (variant === 'pill') {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={`touch-gap flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full ${className}`}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              id={`${resolvedPrefix}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${resolvedPrefix}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`touch-target-h min-h-[44px] md:min-h-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] ${
                isActive
                  ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/30 font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)] border border-transparent'
              }`}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--border-subtle)] text-muted tabular-nums">
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
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`touch-gap flex items-center gap-4 border-b border-subtle overflow-x-auto no-scrollbar max-w-full ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            type="button"
            role="tab"
            id={`${resolvedPrefix}-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`${resolvedPrefix}-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`touch-target-h min-h-[44px] md:min-h-0 relative flex items-center gap-1.5 pb-2 px-0.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap rounded-t-[var(--radius-xs)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] ${
              isActive ? 'text-primary font-semibold' : 'text-secondary hover:text-primary'
            }`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--border-subtle)] text-muted tabular-nums">
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
