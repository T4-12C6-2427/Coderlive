import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../../types/learning';

interface QuizBlockProps {
  questions: QuizQuestion[];
  onComplete?: () => void;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({ questions, onComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) return null;

  const handleSelect = (qId: string, optionIdx: number) => {
    if (showResults[qId]) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    setShowResults((prev) => ({ ...prev, [qId]: true }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults({});
  };

  const answeredCount = Object.keys(showResults).length;
  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;

  return (
    <div className="p-4 sm:p-5 rounded-[var(--radius-lg)] bg-elevated border border-[var(--accent-base)]/30 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-primary">Kiểm tra nhanh kiến thức</h3>
            <p className="text-xs text-muted">Trả lời các câu hỏi để củng cố bài học</p>
          </div>
        </div>

        {answeredCount > 0 && (
          <button
            onClick={handleReset}
            className="touch-target-h flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted hover:text-primary bg-panel hover:bg-hover rounded-[var(--radius-sm)] border border-default transition-colors cursor-pointer flex-shrink-0"
            aria-label="Làm lại bài kiểm tra"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const isAnswered = showResults[q.id];
          const userChoice = selectedAnswers[q.id];
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div key={q.id} className="p-3.5 sm:p-4 rounded-[var(--radius-md)] bg-panel border border-subtle space-y-3">
              <p className="text-sm font-semibold text-primary flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-mono flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="min-w-0 break-words">{q.question}</span>
              </p>

              <div className="touch-gap flex flex-col space-y-2">
                {q.options.map((opt, optIdx) => {
                  let btnStyle = 'bg-elevated hover:bg-hover border-default text-primary';
                  let icon = null;

                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      btnStyle = 'bg-success-soft border-[var(--color-success)] text-success font-semibold ring-1 ring-[var(--color-success)]/50';
                      icon = <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />;
                    } else if (userChoice === optIdx) {
                      btnStyle = 'bg-danger-soft border-[var(--color-danger)] text-danger font-semibold';
                      icon = <XCircle className="w-4 h-4 text-danger flex-shrink-0" />;
                    } else {
                      btnStyle = 'bg-panel border-subtle text-muted opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`touch-target-h w-full text-left p-3 rounded-[var(--radius-sm)] border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                    >
                      <span className="font-mono min-w-0 break-words">{opt}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation */}
              {isAnswered && (
                <div
                  className={`p-3 rounded-[var(--radius-sm)] border text-xs leading-relaxed animate-in fade-in duration-200 ${
                    isCorrect
                      ? 'bg-success-soft border-[var(--color-success)]/40 text-success'
                      : 'bg-danger-soft border-[var(--color-danger)]/40 text-danger'
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {isCorrect ? '✓ Chính xác!' : '✗ Chưa chính xác!'}
                  </p>
                  <p className="text-secondary">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {answeredCount === questions.length && (
        <div className="p-3 bg-accent-soft border border-[var(--accent-base)]/40 rounded-[var(--radius-md)] text-center text-xs text-accent font-medium">
          🎉 Bạn đã trả lời đúng {correctCount}/{questions.length} câu hỏi!
        </div>
      )}
    </div>
  );
};
