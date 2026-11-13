import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, Terminal, RotateCcw } from 'lucide-react';
import { PredictionChallenge } from '../../types/learning';

interface PredictionBlockProps {
  predictions: PredictionChallenge[];
  theme?: 'dark' | 'light';
}

export const PredictionBlock: React.FC<PredictionBlockProps> = ({
  predictions,
  theme = 'dark',
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [checkedStatus, setCheckedStatus] = useState<Record<string, boolean>>({});

  if (!predictions || predictions.length === 0) return null;

  const handleSelect = (challengeId: string, optionIdx: number) => {
    if (checkedStatus[challengeId]) return; // Đã kiểm tra thì không đổi
    setSelectedAnswers((prev) => ({ ...prev, [challengeId]: optionIdx }));
  };

  const handleCheck = (challengeId: string) => {
    setCheckedStatus((prev) => ({ ...prev, [challengeId]: true }));
  };

  const handleReset = (challengeId: string) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[challengeId];
      return copy;
    });
    setCheckedStatus((prev) => {
      const copy = { ...prev };
      delete copy[challengeId];
      return copy;
    });
  };

  return (
    <div className="space-y-4 my-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-warning" />
        <h3 className="text-sm font-bold text-primary">
          Đoán xem kết quả là gì? (Prediction Challenge)
        </h3>
      </div>

      <div className="space-y-4">
        {predictions.map((p, pIdx) => {
          const selected = selectedAnswers[p.id];
          const isChecked = checkedStatus[p.id];
          const isCorrect = isChecked && selected === p.correctIndex;
          const isWrong = isChecked && selected !== p.correctIndex;

          return (
            <div
              key={p.id}
              className="rounded-[var(--radius-lg)] border border-default p-4 sm:p-5 bg-panel transition-all"
            >
              {/* Question & Snippet */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-warning-soft text-warning flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {pIdx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-primary min-w-0 break-words">
                    {p.question}
                  </span>
                </div>

                {isChecked && (
                  <button
                    onClick={() => handleReset(p.id)}
                    className="touch-target p-1.5 text-muted hover:text-primary rounded transition-colors text-xs flex items-center justify-center gap-1 cursor-pointer flex-shrink-0"
                    aria-label="Thử lại"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Làm lại</span>
                  </button>
                )}
              </div>

              {/* Code Snippet Box */}
              <div className="bg-[var(--code-bg)] p-3 rounded-[var(--radius-md)] border border-default font-mono text-xs text-warning mb-3 overflow-x-auto overscroll-contain whitespace-pre">
                {p.snippet}
              </div>

              {/* Options */}
              <div className="touch-gap grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {p.options.map((option, optIdx) => {
                  const isOptSelected = selected === optIdx;
                  let optStyle = 'border-default bg-elevated text-secondary hover:bg-hover';

                  if (isChecked) {
                    if (optIdx === p.correctIndex) {
                      optStyle = 'border-[var(--color-success)] bg-success-soft text-success font-semibold ring-1 ring-[var(--color-success)]';
                    } else if (isOptSelected && !isCorrect) {
                      optStyle = 'border-[var(--color-danger)] bg-danger-soft text-danger font-semibold';
                    } else {
                      optStyle = 'border-subtle bg-panel text-muted opacity-60';
                    }
                  } else if (isOptSelected) {
                    optStyle = 'border-[var(--accent-base)] bg-accent-soft text-accent ring-1 ring-[var(--accent-base)]';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(p.id, optIdx)}
                      disabled={isChecked}
                      className={`touch-target-h text-left p-2.5 rounded-[var(--radius-sm)] border text-xs font-mono transition-all flex items-center justify-between gap-2 cursor-pointer ${optStyle}`}
                    >
                      <span className="min-w-0 break-words">{option}</span>
                      {isChecked && optIdx === p.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 ml-2" />
                      )}
                      {isChecked && isOptSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-danger flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Check Button & Feedback */}
              {!isChecked ? (
                <button
                  onClick={() => handleCheck(p.id)}
                  disabled={selected === undefined}
                  className="touch-target-h w-full sm:w-auto px-4 py-2 rounded-[var(--radius-sm)] bg-accent hover:opacity-90 disabled:opacity-40 text-[var(--text-on-accent)] text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Kiểm tra kết quả thực tế</span>
                </button>
              ) : (
                <div className={`p-3 rounded-[var(--radius-sm)] border text-xs leading-relaxed transition-all ${
                  isCorrect
                    ? 'bg-success-soft border-[var(--color-success)]/40 text-success'
                    : 'bg-danger-soft border-[var(--color-danger)]/40 text-danger'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>Chính xác! Bạn suy luận rất chuẩn!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-danger" />
                        <span>Chưa chính xác! Hãy quan sát kỹ kết quả thực tế:</span>
                      </>
                    )}
                  </div>
                  <p className="text-primary font-sans">{p.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
