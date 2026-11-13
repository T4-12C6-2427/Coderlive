import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Play,
  RotateCcw,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  Eye,
  Terminal,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { CheatEntry } from '../../types/learning';
import { CheatIllustration } from './CheatIllustration';
import { useIsTouch } from '../../hooks/useViewport';

interface CheatExampleModalProps {
  entry: CheatEntry;
  course: 'html' | 'css' | 'js';
  onClose: () => void;
  onOpenInEditor?: (code: string) => void;
}

export const CheatExampleModal: React.FC<CheatExampleModalProps> = ({
  entry,
  course,
  onClose,
  onOpenInEditor,
}) => {
  const isTouch = useIsTouch();
  const [copied, setCopied] = useState(false);
  const [activeHighlightLine, setActiveHighlightLine] = useState<number | null>(null);

  // Console state for console / mixed JS examples
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: 'log' | 'error' | 'warn' | 'info'; text: string }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const codeLines = useMemo(() => {
    return entry.example.code.split('\n');
  }, [entry.example.code]);

  // Handle copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.example.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Run JavaScript code safely for console examples
  const executeJs = () => {
    setIsRunning(true);
    const logs: Array<{ type: 'log' | 'error' | 'warn' | 'info'; text: string }> = [];

    try {
      // Create sandboxed worker or safe Function execution with intercepted console
      const customConsole = {
        log: (...args: unknown[]) => {
          logs.push({
            type: 'log',
            text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          });
        },
        warn: (...args: unknown[]) => {
          logs.push({
            type: 'warn',
            text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          });
        },
        error: (...args: unknown[]) => {
          logs.push({
            type: 'error',
            text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          });
        },
        info: (...args: unknown[]) => {
          logs.push({
            type: 'info',
            text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
          });
        },
      };

      // Wrap in isolated function scope
      const runner = new Function('console', entry.example.code);
      runner(customConsole);

      if (logs.length === 0 && entry.example.expectedOutput) {
        logs.push({
          type: 'log',
          text: Array.isArray(entry.example.expectedOutput)
            ? entry.example.expectedOutput.join('\n')
            : String(entry.example.expectedOutput),
        });
      }
      setConsoleLogs(logs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logs.push({ type: 'error', text: `Lỗi: ${msg}` });
      setConsoleLogs(logs);
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-run console example once upon modal open
  useEffect(() => {
    if (entry.example.kind === 'console' || (entry.example.kind === 'mixed' && course === 'js')) {
      executeJs();
    }
  }, [entry.id, runKey]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prepare full runnable template when user clicks "Mở trong trình soạn thảo"
  const handleOpenInEditor = () => {
    if (!onOpenInEditor) return;

    if (course === 'html') {
      const code = entry.example.code;
      // If code is already a full document, open directly
      if (code.includes('<!DOCTYPE') || code.includes('<html')) {
        onOpenInEditor(code);
      } else {
        // Wrap gracefully in standard HTML template
        const fullDoc = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ví dụ: ${entry.term}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 24px;
      line-height: 1.6;
      color: #0f172a;
    }
  </style>
</head>
<body>
  <!-- Ví dụ cho: ${entry.term} (${entry.name || entry.meaning}) -->
  ${code}
</body>
</html>`;
        onOpenInEditor(fullDoc);
      }
    } else if (course === 'css') {
      const sampleHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Ví dụ CSS: ${entry.term}</title>
  <style>
    /* CSS cần thử nghiệm: */
    ${entry.example.code}
    
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 24px;
      background: #f8fafc;
    }
  </style>
</head>
<body>
  <h2>Thử nghiệm CSS: ${entry.term}</h2>
  <div class="box">Nội dung khối mẫu</div>
</body>
</html>`;
      onOpenInEditor(sampleHtml);
    } else {
      // JavaScript: Wrap with a clean HTML harness and console viewer
      const jsHarness = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Ví dụ JS: ${entry.term}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; line-height: 1.5; }
    #console { background: #0f172a; color: #38bdf8; font-family: monospace; padding: 14px; border-radius: 8px; white-space: pre-wrap; margin-top: 16px; }
  </style>
</head>
<body>
  <h3>Chạy thử JavaScript: ${entry.term}</h3>
  <div id="output">Xem kết quả console bên dưới:</div>
  <pre id="console"></pre>

  <script>
    const con = document.getElementById('console');
    const oldLog = console.log;
    console.log = function(...args) {
      oldLog.apply(console, args);
      con.textContent += args.join(' ') + '\\n';
    };

    // Code ví dụ:
    ${entry.example.code}
  </script>
</body>
</html>`;
      onOpenInEditor(jsHarness);
    }
  };

  // Build sandboxed HTML for render preview
  const previewHtml = useMemo(() => {
    if (entry.example.kind === 'render' || (entry.example.kind === 'mixed' && course !== 'js')) {
      const code = entry.example.code;
      if (code.includes('<!DOCTYPE') || code.includes('<html')) {
        return code;
      }
      return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 16px;
      margin: 0;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.5;
    }
  </style>
</head>
<body>
${code}
</body>
</html>`;
    }
    return '';
  }, [entry.example, course]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 pt-[max(0.75rem,var(--safe-top))] sm:p-5 bg-overlay backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-3xl bg-elevated border-t sm:border border-default rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary flex flex-col max-h-viewport-92 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2 pb-0.5 flex-shrink-0 bg-panel">
          <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" />
        </div>
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-panel border-b border-subtle flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-1 rounded-[var(--radius-sm)] bg-accent text-[var(--text-on-accent)] font-mono font-bold text-xs sm:text-sm tracking-tight truncate max-w-[160px] sm:max-w-xs">
              {entry.term}
            </span>
            <div className="min-w-0">
              <h2 id="modal-title" className="font-bold text-primary text-sm sm:text-base truncate">
                {entry.name || entry.meaning}
              </h2>
            </div>
            <span className="hidden sm:inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-elevated text-muted border border-subtle font-sans font-medium whitespace-nowrap">
              {entry.category}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng tra cứu"
            className="touch-target p-1.5 rounded-[var(--radius-sm)] text-muted hover:text-primary hover:bg-hover transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-5">
          {/* Summary / Description */}
          <div className="text-xs sm:text-sm text-secondary leading-relaxed bg-panel p-3.5 rounded-[var(--radius-md)] border border-subtle">
            {entry.description || entry.meaning}
          </div>

          {/* Interactive Illustration (if available) */}
          {entry.example.illustration && (
            <div>
              <CheatIllustration illustration={entry.example.illustration} />
            </div>
          )}

          {/* Code Example Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted font-medium">
              <span className="flex items-center gap-1.5 font-semibold text-primary">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span>Mã nguồn mẫu:</span>
              </span>

              <button
                onClick={handleCopy}
                className="touch-target-h flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] bg-panel hover:bg-hover border border-subtle text-xs text-secondary hover:text-primary transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-success font-semibold">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block with Line Numbers & hover highlights */}
            <div className="rounded-[var(--radius-md)] border border-default bg-[var(--code-bg)] overflow-hidden shadow-inner font-mono text-xs">
              <div className="p-3 overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    {codeLines.map((line, idx) => {
                      const lineNum = idx + 1;
                      const isHighlighted = activeHighlightLine === lineNum;
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isHighlighted ? 'bg-accent-soft font-semibold' : 'hover:bg-panel/40'
                          }`}
                        >
                          <td className="w-8 pr-3 text-right select-none text-[11px] text-muted opacity-50 align-top">
                            {lineNum}
                          </td>
                          <td className="text-accent whitespace-pre break-normal">
                            {line || ' '}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ADAPTIVE RESULT SECTION BY KIND */}
          {entry.example.kind === 'render' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-primary">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-accent" />
                  <span>Kết quả hiển thị trên trang</span>
                </div>
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider px-1.5 py-0.5 rounded bg-panel border border-subtle">
                  Trực tiếp
                </span>
              </div>

              <div className="rounded-[var(--radius-md)] border border-default bg-white overflow-hidden shadow-xs">
                <iframe
                  key={`preview-${entry.id}`}
                  srcDoc={previewHtml}
                  title={`Kết quả: ${entry.term}`}
                  sandbox="allow-scripts"
                  className="w-full h-44 sm:h-48 border-0 bg-white"
                />
              </div>
            </div>
          )}

          {entry.example.kind === 'console' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-primary">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  <span>Kết quả chạy trong Console</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRunKey((k) => k + 1);
                      executeJs();
                    }}
                    disabled={isRunning}
                    className="touch-target-h inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] bg-accent hover:bg-accent-hover text-[var(--text-on-accent)] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Chạy lại</span>
                  </button>
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-default bg-[var(--code-bg)] text-primary p-3 font-mono text-xs min-h-[90px] max-h-48 overflow-y-auto space-y-1 shadow-inner">
                {consoleLogs.length === 0 ? (
                  <div className="text-muted italic flex items-center gap-1.5 py-2">
                    <Terminal className="w-3.5 h-3.5 text-muted" />
                    <span>Chưa có dữ liệu xuất ra Console. Nhấn "Chạy lại" để thực thi.</span>
                  </div>
                ) : (
                  consoleLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 ${
                        log.type === 'error'
                          ? 'text-danger'
                          : log.type === 'warn'
                          ? 'text-warning'
                          : 'text-accent'
                      }`}
                    >
                      <span className="text-muted select-none">&gt;</span>
                      <span className="whitespace-pre-wrap break-all">{log.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {entry.example.kind === 'explain' && (
            <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-subtle space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-secondary leading-relaxed">
                <div className="p-1 rounded-[var(--radius-sm)] bg-accent-soft text-accent flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-primary">
                    Thẻ này không hiển thị trực quan lên giao diện người dùng
                  </p>
                  <p className="text-muted text-[11px] mt-0.5">
                    Nó cung cấp siêu dữ liệu (metadata), thiết lập cấu hình nền móng, hoặc chỉ dẫn cho trình duyệt và công cụ tìm kiếm cách xử lý văn bản.
                  </p>
                </div>
              </div>
            </div>
          )}

          {entry.example.kind === 'mixed' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-primary">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-accent" />
                    <span>Kết quả tương tác trực quan</span>
                  </div>
                  {course === 'js' && (
                    <button
                      onClick={() => {
                        setRunKey((k) => k + 1);
                        executeJs();
                      }}
                      className="touch-target-h inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] bg-accent text-[var(--text-on-accent)] text-xs font-semibold cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Chạy thử</span>
                    </button>
                  )}
                </div>

                {course === 'js' ? (
                  <div className="rounded-[var(--radius-md)] border border-default bg-[var(--code-bg)] text-primary p-3 font-mono text-xs min-h-[80px] max-h-44 overflow-y-auto space-y-1">
                    {consoleLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-accent">
                        <span className="text-muted select-none">&gt;</span>
                        <span className="whitespace-pre-wrap break-all">{log.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[var(--radius-md)] border border-default bg-white overflow-hidden shadow-xs">
                    <iframe
                      key={`preview-mixed-${entry.id}`}
                      srcDoc={previewHtml}
                      title={`Kết quả: ${entry.term}`}
                      sandbox="allow-scripts"
                      className="w-full h-40 border-0 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CÁCH HOẠT ĐỘNG (Step-by-step with hover & focus highlight) */}
          {entry.example.steps && entry.example.steps.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-subtle">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Cách hoạt động: {course === 'js' ? 'JavaScript làm gì khi thực thi?' : 'Trình duyệt làm gì khi đọc mã?'}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {entry.example.steps.map((st, idx) => {
                  const targetLine = st.lines && st.lines.length > 0 ? st.lines[0] : null;
                  const isStepActive = targetLine !== null && activeHighlightLine === targetLine;
                  return (
                    <div
                      key={idx}
                      tabIndex={0}
                      role="button"
                      aria-label={`Bước ${idx + 1}: ${st.title}`}
                      onClick={() => {
                        if (targetLine !== null) {
                          setActiveHighlightLine(isStepActive ? null : targetLine);
                        }
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && targetLine !== null) {
                          e.preventDefault();
                          setActiveHighlightLine(isStepActive ? null : targetLine);
                        }
                      }}
                      onMouseEnter={!isTouch ? () => {
                        if (targetLine !== null) setActiveHighlightLine(targetLine);
                      } : undefined}
                      onMouseLeave={!isTouch ? () => setActiveHighlightLine(null) : undefined}
                      onFocus={() => {
                        if (targetLine !== null) setActiveHighlightLine(targetLine);
                      }}
                      onBlur={() => setActiveHighlightLine(null)}
                      className={`p-2.5 rounded-[var(--radius-sm)] border transition-all cursor-pointer flex items-start gap-2.5 group outline-none ${
                        isStepActive
                          ? 'bg-accent-soft border-[var(--accent-base)]/50 ring-1 ring-[var(--accent-base)]'
                          : 'bg-panel hover:bg-hover focus:bg-hover focus:ring-1 focus:ring-[var(--accent-base)] border-subtle'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border font-bold text-xs flex items-center justify-center flex-shrink-0 transition-colors ${
                        isStepActive
                          ? 'bg-accent text-[var(--text-on-accent)] border-accent'
                          : 'bg-accent-soft text-accent border-[var(--accent-base)]/30 group-hover:bg-accent group-hover:text-[var(--text-on-accent)] group-focus:bg-accent group-focus:text-[var(--text-on-accent)]'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="text-xs text-secondary leading-relaxed min-w-0">
                        <span className="font-semibold text-primary">{st.title}: </span>
                        <span>{st.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NẾU THIẾU HOẶC VIẾT SAI THÌ SAO? */}
          {entry.consequence && (
            <div className="p-3.5 rounded-[var(--radius-md)] bg-danger-soft border border-[var(--color-danger)]/30 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-danger">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Nếu thiếu hoặc viết sai thì sao?</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed pl-6">
                <span className="font-semibold text-primary">Hậu quả: </span>
                {entry.consequence}
              </p>
            </div>
          )}

          {/* LỖI SAI THƯỜNG GẶP (Nếu có) */}
          {entry.mistakes && entry.mistakes.length > 0 && (
            <div className="space-y-2">
              {entry.mistakes.map((m, mIdx) => (
                <div key={mIdx} className="p-3 rounded-[var(--radius-md)] bg-danger-soft border border-[var(--color-danger)]/30 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-danger">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Lỗi sai thường gặp #{mIdx + 1}:</span>
                  </div>
                  <div className="font-mono text-danger line-through">{m.wrong}</div>
                  <div className="font-mono text-success">{m.right}</div>
                  <p className="text-secondary">{m.why}</p>
                </div>
              ))}
            </div>
          )}

          {/* MẸO NHỚ (Analogy) */}
          {entry.analogy && (
            <div className="p-3.5 rounded-[var(--radius-md)] bg-accent-soft border border-[var(--accent-base)]/30 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-xs text-secondary leading-relaxed">
                <span className="font-bold text-primary">Mẹo nhớ thực tế: </span>
                <span>{entry.analogy}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-5 py-3 pb-[max(0.75rem,var(--safe-bottom))] bg-panel border-t border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
          <div className="shortcut-hint text-[11px] text-muted hidden sm:block">
            Nhấn <kbd className="px-1.5 py-0.5 rounded bg-elevated border border-subtle font-mono text-[10px]">Esc</kbd> để đóng nhanh.
          </div>

          <div className="flex items-center justify-end touch-gap gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="touch-target-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-panel hover:bg-hover border border-default text-xs font-semibold text-secondary hover:text-primary transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-success">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép code</span>
                </>
              )}
            </button>

            {onOpenInEditor && (
              <button
                type="button"
                onClick={handleOpenInEditor}
                className="touch-target-h inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-sm)] bg-panel hover:bg-hover border border-default text-xs font-semibold text-primary transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-accent" />
                <span>Mở trong trình soạn thảo</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="touch-target-h px-4 py-1.5 rounded-[var(--radius-sm)] bg-accent hover:bg-accent-hover text-[var(--text-on-accent)] text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
