import React, { useState } from 'react';
import { PlayCircle, SkipForward, SkipBack, RotateCcw, Variable, Info } from 'lucide-react';
import { StepSnapshot } from '../../types/learning';
import { useIsTouch } from '../../hooks/useViewport';

interface StepThroughProps {
  code: string;
  steps: StepSnapshot[];
  theme?: 'dark' | 'light';
}

export const StepThrough: React.FC<StepThroughProps> = ({
  code,
  steps,
}) => {
  const isTouch = useIsTouch();
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  if (!steps || steps.length === 0) return null;

  const currentStep = steps[currentStepIdx] || steps[0];
  const codeLines = code.split('\n');

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
  };

  const formatVarValue = (val: any): string => {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val}"`;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const getVarTypeColor = (val: any): string => {
    if (typeof val === 'number') return 'text-warning bg-warning-soft border-[var(--color-warning)]/30';
    if (typeof val === 'string') return 'text-success bg-success-soft border-[var(--color-success)]/30';
    if (typeof val === 'boolean') return 'text-accent bg-accent-soft border-[var(--accent-base)]/30';
    if (val === undefined || val === null) return 'text-muted bg-panel border-subtle';
    return 'text-accent bg-accent-soft border-[var(--accent-base)]/30';
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-default p-4 sm:p-5 bg-panel transition-all">
      {/* Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-[var(--radius-sm)] bg-accent-soft text-accent border border-[var(--accent-base)]/30">
            <PlayCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-primary">
              Chạy từng bước (Step-by-step Execution)
            </h4>
            <p className="text-[11px] text-muted">
              Quan sát máy tính thực thi từng dòng và giá trị của các biến thay đổi như thế nào
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="touch-gap flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-[var(--radius-sm)] bg-elevated text-accent font-mono border border-subtle">
            Bước {currentStepIdx + 1} / {steps.length}
          </span>

          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="touch-target p-1.5 flex items-center justify-center rounded-[var(--radius-sm)] bg-elevated hover:bg-hover text-secondary hover:text-primary disabled:opacity-40 transition-colors border border-default cursor-pointer"
            title={isTouch ? undefined : 'Bước trước'}
            aria-label="Bước trước"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIdx === steps.length - 1}
            className="touch-target-h flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-sm)] bg-accent hover:opacity-90 text-[var(--text-on-accent)] text-xs font-semibold disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
            title={isTouch ? undefined : 'Bước tiếp theo'}
          >
            <span>Bước tiếp</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="touch-target p-1.5 flex items-center justify-center rounded-[var(--radius-sm)] text-muted hover:text-primary hover:bg-hover transition-colors cursor-pointer"
            title={isTouch ? undefined : 'Bắt đầu lại từ bước 1'}
            aria-label="Bắt đầu lại từ bước 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Code Highlight + Variables Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-w-0">
        {/* Left: Code Lines with active line highlight */}
        <div className="lg:col-span-7 min-w-0 bg-[var(--code-bg)] rounded-[var(--radius-md)] p-3 border border-default font-mono text-xs overflow-x-auto overscroll-contain">
          {codeLines.map((line, idx) => {
            const lineNum = idx + 1;
            const isCurrentLine = lineNum === currentStep.line;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 py-0.5 px-2 rounded-[var(--radius-sm)] transition-all ${
                  isCurrentLine
                    ? 'bg-accent-soft text-primary font-semibold ring-1 ring-[var(--accent-base)]'
                    : 'text-muted hover:bg-hover'
                }`}
              >
                <span className={`w-6 text-right select-none text-[11px] ${
                  isCurrentLine ? 'text-accent font-bold' : 'text-muted'
                }`}>
                  {lineNum}
                </span>
                <span className="flex-1 whitespace-pre">{line || ' '}</span>
                {isCurrentLine && (
                  <span className="text-[10px] uppercase font-sans tracking-wider px-1.5 py-0.2 rounded bg-accent text-[var(--text-on-accent)] select-none">
                    Đang chạy
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Variables & Explanation */}
        <div className="lg:col-span-5 min-w-0 flex flex-col gap-3">
          {/* Explanation Card */}
          <div className="p-3 rounded-[var(--radius-md)] bg-elevated border border-default">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-warning mb-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Điều gì đang xảy ra:</span>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              {currentStep.explanation}
            </p>
          </div>

          {/* Variables Snapshot Table */}
          <div className="flex-1 p-3 rounded-[var(--radius-md)] bg-[var(--code-bg)] border border-default flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2 select-none">
              <Variable className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>Giá trị các biến tại bước này:</span>
            </div>

            {Object.keys(currentStep.variables).length === 0 ? (
              <p className="text-xs text-muted italic py-2">
                Chưa có biến nào được tạo hoặc thay đổi tại bước này.
              </p>
            ) : (
              <div className="space-y-1.5 overflow-y-auto overscroll-contain max-h-[140px] pr-1">
                {Object.entries(currentStep.variables).map(([name, val]) => (
                  <div
                    key={name}
                    className="flex flex-wrap items-center justify-between gap-2 py-1 px-2.5 rounded-[var(--radius-sm)] bg-panel border border-subtle text-xs font-mono"
                  >
                    <span className="text-accent font-semibold">{name}</span>
                    <span className={`px-2 py-0.5 rounded border text-[11px] break-all max-w-full ${getVarTypeColor(val)}`}>
                      {formatVarValue(val)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
