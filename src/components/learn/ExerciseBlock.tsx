import React, { useState } from 'react';
import { Target, Play, Lightbulb, CheckCircle2, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import { LessonExercise } from '../../types/learning';
import { runInWorker, RunnerLog } from '../../lib/jsRunner';
import { useIsTouch } from '../../hooks/useViewport';

interface ExerciseBlockProps {
  exercise: LessonExercise;
  theme?: 'dark' | 'light';
}

export const ExerciseBlock: React.FC<ExerciseBlockProps> = ({
  exercise,
  theme = 'dark',
}) => {
  const isTouch = useIsTouch();
  const [code, setCode] = useState<string>(exercise.starterCode);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);
  const [outputLogs, setOutputLogs] = useState<RunnerLog[]>([]);

  React.useEffect(() => {
    setCode(exercise.starterCode);
    setValidationResult(null);
    setOutputLogs([]);
    setShowHint(false);
  }, [exercise]);

  const handleRunAndCheck = async () => {
    setIsRunning(true);
    setValidationResult(null);

    try {
      const result = await runInWorker(code, 3000);
      setOutputLogs(result.logs);

      const logTexts = result.logs.map((l) => l.text);
      const validation = exercise.validate(logTexts, code);
      setValidationResult(validation);
    } catch (err: any) {
      setValidationResult({
        passed: false,
        message: `Mã bị lỗi: ${err.message}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(exercise.starterCode);
    setValidationResult(null);
    setOutputLogs([]);
    setShowHint(false);
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-default p-4 sm:p-5 my-6 bg-panel transition-all">
      {/* Exercise Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-[var(--radius-sm)] bg-success-soft text-success border border-[var(--color-success)]/30">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary">
              Bài tập nhỏ thực hành (Hands-on Challenge)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Tự tay viết code và kiểm tra kết quả ngay lập tức
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="touch-target p-1.5 text-muted hover:text-primary rounded-[var(--radius-sm)] hover:bg-hover transition-colors text-xs flex items-center justify-center gap-1 cursor-pointer"
          title={isTouch ? undefined : 'Đặt lại bài tập'}
          aria-label="Đặt lại bài tập"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Làm lại</span>
        </button>
      </div>

      {/* Prompt Card */}
      <div className="p-3.5 rounded-[var(--radius-md)] bg-elevated border border-default text-xs text-secondary leading-relaxed mb-3">
        <span className="font-bold text-warning">Nhiệm vụ: </span>
        <span>{exercise.prompt}</span>
        {exercise.expectedOutputDesc && (
          <div className="mt-2 text-[11px] text-muted bg-panel p-2 rounded-[var(--radius-sm)] border border-subtle">
            <span className="font-semibold text-primary">Kết quả kỳ vọng: </span>
            <code className="text-success font-mono">{exercise.expectedOutputDesc}</code>
          </div>
        )}
      </div>

      {/* Code Editor for Exercise */}
      <div className="bg-[var(--code-bg)] rounded-[var(--radius-md)] border border-default overflow-hidden mb-3 font-mono text-xs">
        <div className="px-3 py-1.5 bg-panel border-b border-subtle flex items-center justify-between text-[11px] text-muted font-sans">
          <span>Viết mã của bạn vào đây:</span>
          <span className="shortcut-hint text-[10px] text-muted">Ctrl+Enter để kiểm tra</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleRunAndCheck();
            }
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full p-3 bg-transparent text-primary placeholder:text-muted resize-none focus:outline-none overscroll-contain font-mono text-xs leading-relaxed"
          rows={5}
        />
      </div>

      {/* Action Buttons: Run & Hint */}
      <div className="touch-gap flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={handleRunAndCheck}
          disabled={isRunning}
          className="touch-target-h flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] bg-success hover:opacity-90 active:scale-95 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Đang kiểm tra...' : 'Kiểm tra kết quả'}</span>
        </button>

        <button
          onClick={() => setShowHint(!showHint)}
          className="touch-target-h flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] bg-elevated hover:bg-hover text-warning text-xs font-medium border border-default transition-all cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5 text-warning" />
          <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
        </button>
      </div>

      {/* Hint Box */}
      {showHint && (
        <div className="p-3 rounded-[var(--radius-md)] bg-warning-soft border border-[var(--color-warning)]/30 text-xs text-warning mb-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <Lightbulb className="w-4 h-4 text-warning" />
            <span>Gợi ý cách làm:</span>
          </div>
          <p className="leading-relaxed font-sans">{exercise.hint}</p>
        </div>
      )}

      {/* Validation Result Box */}
      {validationResult && (
        <div className={`p-4 rounded-[var(--radius-md)] border text-xs leading-relaxed transition-all ${
          validationResult.passed
            ? 'bg-success-soft border-[var(--color-success)]/50 text-success shadow-xs'
            : 'bg-danger-soft border-[var(--color-danger)]/50 text-danger'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm mb-1">
            {validationResult.passed ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-success">Tuyệt vời! Bạn đã vượt qua bài tập này!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-danger" />
                <span className="text-danger">Chưa đạt yêu cầu! Hãy thử lại một chút nhé:</span>
              </>
            )}
          </div>
          <p className="font-sans text-primary mt-1">{validationResult.message}</p>

          {/* Quick preview of output logs if any */}
          {outputLogs.length > 0 && (
            <div className="mt-2 pt-2 border-t border-subtle">
              <span className="text-[11px] text-muted font-semibold">Console thực tế in ra:</span>
              <div className="mt-1 font-mono text-[11px] text-secondary space-y-0.5">
                {outputLogs.map((l) => (
                  <div key={l.id} className="truncate">
                    &gt; {l.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
