import React, { useId } from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  ariaLabel?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  ariaLabel,
  disabled = false,
  size = 'md',
}) => {
  const switchSize = size === 'sm' ? 'w-8 h-4.5' : 'w-10 h-5.5';
  const thumbSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  const thumbTranslate = size === 'sm' ? (checked ? 'translate-x-3.5' : 'translate-x-0.5') : (checked ? 'translate-x-4.5' : 'translate-x-0.5');

  return (
    <label className={`touch-target-h inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`touch-hit-expand relative inline-flex items-center flex-shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] ${switchSize} ${
          checked ? 'bg-accent' : 'bg-[var(--border-strong)]'
        }`}
      >
        <span
          className={`inline-block rounded-full bg-white shadow-sm transform transition-transform ${thumbSize} ${thumbTranslate}`}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-medium text-primary">{label}</span>}
          {description && <span className="text-[11px] text-muted">{description}</span>}
        </div>
      )}
    </label>
  );
};

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
  valueDisplay?: string | number;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  valueDisplay,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || valueDisplay !== undefined) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-secondary">{label}</span>}
          {valueDisplay !== undefined && (
            <span className="font-mono text-muted text-[11px]">{valueDisplay}</span>
          )}
        </div>
      )}
      <div className="touch-target-h relative flex items-center h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 sm:h-1.5 bg-[var(--border-default)] rounded-full appearance-none cursor-pointer outline-none accent-[var(--accent-base)]"
        />
      </div>
    </div>
  );
};

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string | number> {
  value: T;
  options: SelectOption<T>[];
  onChange: (val: T) => void;
  label?: string;
  className?: string;
  selectClassName?: string;
}

export function Select<T extends string | number>({
  value,
  options,
  onChange,
  label,
  className = '',
  selectClassName = '',
}: SelectProps<T>) {
  const selectId = useId();
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className={`touch-target w-full h-8 px-3 pr-8 bg-elevated text-primary text-xs font-medium border border-default rounded-[var(--radius-sm)] appearance-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] cursor-pointer ${selectClassName}`}
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
