import React from 'react';
import { Terminal, Trash2, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { RunnerLog } from '../../lib/jsRunner';
import { useIsTouch } from '../../hooks/useViewport';

interface ConsolePanelProps {
  logs: RunnerLog[];
  onClear: () => void;
  isRunning?: boolean;
  theme?: 'dark' | 'light';
  title?: string;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  logs,
  onClear,
  isRunning = false,
  theme = 'dark',
  title = 'Bảng điều khiển (Console)',
}) => {
  const isTouch = useIsTouch();
  return (
    <div className="flex flex-col h-full rounded-[var(--radius-md)] border border-default overflow-hidden font-mono text-xs bg-[var(--code-bg)] text-primary transition-colors">
      {/* Console Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-panel border-b border-subtle flex-shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-warning" />
          <span className="font-semibold text-xs tracking-tight text-primary font-sans">
            {title}
          </span>
          {logs.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-elevated text-muted font-mono">
              {logs.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1.5 text-[11px] text-warning font-sans animate-pulse">
              <span className="w-2 h-2 rounded-full bg-warning animate-ping" />
              Đang thực thi...
            </span>
          )}
          {logs.length > 0 && (
            <button
              onClick={onClear}
              className="touch-target p-1 flex items-center justify-center rounded text-muted hover:text-danger hover:bg-hover transition-colors cursor-pointer"
              title={isTouch ? undefined : 'Xóa kết quả console'}
              aria-label="Xóa kết quả console"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-1.5 leading-relaxed font-mono">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted py-6 text-center select-none font-sans">
            <Terminal className="w-8 h-8 stroke-1 text-muted mb-2 opacity-50" />
            <p className="text-xs">Chưa có kết quả.</p>
            <p className="text-[11px] text-muted mt-0.5">Nhấp nút <strong className="text-success">▶ Chạy</strong> để xem đầu ra của mã JavaScript.</p>
          </div>
        ) : (
          logs.map((log) => {
            const isError = log.type === 'error';
            const isWarn = log.type === 'warn';
            const isInfo = log.type === 'info';

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2 py-1 px-2 rounded-[var(--radius-sm)] text-xs transition-colors ${
                  isError
                    ? 'bg-danger-soft text-danger border-l-2 border-[var(--color-danger)]'
                    : isWarn
                    ? 'bg-warning-soft text-warning border-l-2 border-[var(--color-warning)]'
                    : isInfo
                    ? 'bg-info-soft text-info border-l-2 border-[var(--color-info)]'
                    : 'text-primary hover:bg-hover'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isError ? (
                    <AlertCircle className="w-3.5 h-3.5 text-danger" />
                  ) : isWarn ? (
                    <AlertCircle className="w-3.5 h-3.5 text-warning" />
                  ) : isInfo ? (
                    <Info className="w-3.5 h-3.5 text-info" />
                  ) : (
                    <span className="text-muted font-bold select-none">&gt;</span>
                  )}
                </div>

                <div className="flex-1 overflow-x-auto whitespace-pre-wrap break-all">
                  <span>{log.text}</span>
                  {log.line && (
                    <span className="ml-2 text-[10px] text-danger bg-danger-soft px-1 py-0.5 rounded border border-[var(--color-danger)]/40 font-sans">
                      Dòng {log.line}
                    </span>
                  )}
                </div>

                {log.time && (
                  <span className="text-[10px] text-muted flex-shrink-0 select-none">
                    {log.time}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
