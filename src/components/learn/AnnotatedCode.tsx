import React, { useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import { LineNote } from '../../types/learning';
import { useIsTouch } from '../../hooks/useViewport';

interface AnnotatedCodeProps {
  code: string;
  lineNotes: LineNote[];
  theme: 'dark' | 'light';
}

export const AnnotatedCode: React.FC<AnnotatedCodeProps> = ({ code, lineNotes }) => {
  const isTouch = useIsTouch();
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const lines = code.split('\n');

  const notesMap = new Map<number, LineNote>();
  lineNotes.forEach((n) => notesMap.set(n.line, n));

  const activeLine = selectedLine ?? (isTouch ? null : hoveredLine);
  const activeNote = activeLine ? notesMap.get(activeLine) : null;

  return (
    <div className="space-y-3 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span className="flex items-center gap-1.5 font-medium text-secondary min-w-0">
          <Info className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span>
            {isTouch
              ? 'Chạm vào từng dòng mã có chấm tròn để xem giải thích:'
              : 'Nhấp hoặc rê chuột vào từng dòng mã để xem giải thích chi tiết:'}
          </span>
        </span>
        <span className="text-[11px] text-muted font-mono flex-shrink-0">
          {lines.length} dòng
        </span>
      </div>

      <div className="rounded-[var(--radius-md)] border border-default font-mono text-xs overflow-hidden bg-[var(--code-bg)] text-primary transition-colors">
        <div className="p-2 overflow-x-auto overscroll-contain">
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const hasNote = notesMap.has(lineNum);
            const isTargeted = activeLine === lineNum;

            return (
              <div
                key={lineNum}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedLine(selectedLine === lineNum ? null : lineNum);
                  }
                }}
                onClick={() => setSelectedLine(selectedLine === lineNum ? null : lineNum)}
                onMouseEnter={!isTouch ? () => setHoveredLine(lineNum) : undefined}
                onMouseLeave={!isTouch ? () => setHoveredLine(null) : undefined}
                className={`flex items-center px-2 py-2 sm:py-0.5 min-h-[36px] sm:min-h-0 rounded-[var(--radius-sm)] cursor-pointer transition-all ${
                  isTargeted
                    ? 'bg-accent-soft text-primary font-semibold ring-1 ring-[var(--accent-base)]/50'
                    : hasNote
                    ? 'hover:bg-hover text-secondary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {/* Line number marker */}
                <span className="w-9 select-none text-[11px] text-muted font-mono flex items-center gap-1 flex-shrink-0">
                  <span>{lineNum}</span>
                  {hasNote && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isTargeted ? 'bg-warning animate-pulse' : 'bg-accent'}`} />
                  )}
                </span>

                {/* Code line */}
                <span className="flex-1 whitespace-pre">{lineText || ' '}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Line Note explanation card */}
      {activeNote ? (
        <div className="p-3.5 rounded-[var(--radius-md)] bg-accent-soft border border-[var(--accent-base)]/40 text-xs flex items-start gap-3 animate-in fade-in duration-150">
          <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-panel border border-subtle flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-accent font-mono">
                Dòng {activeNote.line}:
              </span>
              {activeNote.tag && (
                <span className="px-1.5 py-0.2 rounded bg-panel text-accent font-mono text-[10px] border border-subtle">
                  {activeNote.tag}
                </span>
              )}
            </div>
            <p className="text-primary leading-relaxed text-sm break-words">
              {activeNote.note}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-[var(--radius-sm)] bg-panel border border-subtle text-[11px] text-muted text-center">
          💡 Gợi ý: Chạm vào một dòng có dấu chấm tròn để đọc ý nghĩa chi tiết.
        </div>
      )}
    </div>
  );
};
