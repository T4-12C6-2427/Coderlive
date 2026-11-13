import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { CommonMistake } from '../../types/learning';

interface MistakeBoxProps {
  mistakes: CommonMistake[];
}

export const MistakeBox: React.FC<MistakeBoxProps> = ({ mistakes }) => {
  if (!mistakes || mistakes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-warning">
        <AlertTriangle className="w-4 h-4 text-warning" />
        <span>Lỗi thường gặp cần tránh:</span>
      </div>

      <div className="space-y-4">
        {mistakes.map((m, idx) => (
          <div
            key={idx}
            className="p-4 rounded-[var(--radius-md)] bg-elevated border border-[var(--color-warning)]/30 space-y-3"
          >
            <div>
              <h4 className="text-sm font-semibold text-primary flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-warning-soft text-warning flex items-center justify-center text-xs font-mono flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="min-w-0 break-words">{m.title}</span>
              </h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {m.description}
              </p>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {/* Wrong Code */}
              <div className="p-3 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 text-danger">
                <div className="flex items-center gap-1.5 text-danger font-bold mb-1.5 text-[11px] select-none">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cách viết sai ✗</span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap">{m.wrongCode}</pre>
              </div>

              {/* Correct Code */}
              <div className="p-3 rounded-[var(--radius-sm)] bg-success-soft border border-[var(--color-success)]/30 text-success">
                <div className="flex items-center gap-1.5 text-success font-bold mb-1.5 text-[11px] select-none">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cách viết đúng ✓</span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap">{m.correctCode}</pre>
              </div>
            </div>

            {/* Explanation */}
            <p className="text-xs text-secondary bg-panel p-2.5 rounded-[var(--radius-sm)] border border-subtle leading-relaxed">
              💡 <strong className="text-accent">Lời khuyên:</strong> {m.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
