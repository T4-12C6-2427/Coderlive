import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Copy, ExternalLink, Check, Code2, Terminal, Eye } from 'lucide-react';
import { runInWorker, buildSandboxedDomHtml, RunnerLog } from '../../lib/jsRunner';
import { ConsolePanel } from './ConsolePanel';
import { useIsTouch } from '../../hooks/useViewport';

interface CodeRunnerProps {
  initialCode: string;
  isDomLesson?: boolean;
  initialHtml?: string;
  onOpenInEditor?: (code: string) => void;
  theme?: 'dark' | 'light';
  title?: string;
}

export const CodeRunner: React.FC<CodeRunnerProps> = ({
  initialCode,
  isDomLesson = false,
  initialHtml = '<div id="app"></div>',
  onOpenInEditor,
  theme = 'dark',
  title = 'Thử chạy & chỉnh sửa mã nguồn JavaScript',
}) => {
  const isTouch = useIsTouch();
  const [code, setCode] = useState<string>(initialCode);
  const [logs, setLogs] = useState<RunnerLog[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'both' | 'code' | 'output'>('both');
  const [sandboxKey, setSandboxKey] = useState<number>(0);

  // Iframe ref for DOM lessons
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activeWorkerAbortRef = useRef<boolean>(false);

  // Synchronize when initialCode changes (e.g., navigating to another lesson)
  useEffect(() => {
    setCode(initialCode);
    setLogs([]);
    setIsRunning(false);
    setSandboxKey((k) => k + 1);
  }, [initialCode]);

  // Initialize or reset DOM iframe content when lesson or sandboxKey changes
  useEffect(() => {
    if (isDomLesson && iframeRef.current) {
      iframeRef.current.srcdoc = buildSandboxedDomHtml('// Sẵn sàng chạy', initialHtml);
    }
  }, [isDomLesson, initialHtml, sandboxKey]);

  // Listen for iframe messages in DOM lessons
  useEffect(() => {
    if (!isDomLesson) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.source === 'coderlive-js-runner') {
        const newLog: RunnerLog = {
          id: Math.random().toString(36).substring(2, 9),
          type: e.data.type || 'log',
          text: e.data.text || '',
          line: e.data.line,
          time: new Date().toLocaleTimeString('vi-VN'),
        };
        setLogs((prev) => [...prev, newLog]);
        if (e.data.type === 'error') {
          setIsRunning(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isDomLesson]);

  // Execute Code
  const handleRun = async () => {
    if (activeTab === 'code') {
      setActiveTab('output');
    }
    setIsRunning(true);
    setLogs([
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'info',
        text: '▶ Bắt đầu chạy mã...',
        time: new Date().toLocaleTimeString('vi-VN'),
      },
    ]);

    if (!isDomLesson) {
      // Worker mode (Lessons 1-8)
      activeWorkerAbortRef.current = false;
      const result = await runInWorker(code, 3000);
      if (!activeWorkerAbortRef.current) {
        setLogs(result.logs);
        setIsRunning(false);
      }
    } else {
      // Sandboxed Iframe mode (Lessons 9-12)
      setSandboxKey((k) => k + 1);
      setTimeout(() => {
        if (iframeRef.current) {
          const fullDoc = buildSandboxedDomHtml(code, initialHtml);
          iframeRef.current.srcdoc = fullDoc;
        }
        setIsRunning(false);
      }, 50);
    }
  };

  // Stop / Reset
  const handleStop = () => {
    activeWorkerAbortRef.current = true;
    setIsRunning(false);

    if (isDomLesson) {
      setSandboxKey((k) => k + 1);
    }

    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'warn',
        text: '■ Đã dừng thực thi mã.',
        time: new Date().toLocaleTimeString('vi-VN'),
      },
    ]);
  };

  // Reset to initial code
  const handleReset = () => {
    activeWorkerAbortRef.current = true;
    setIsRunning(false);
    setCode(initialCode);
    setLogs([]);
    setSandboxKey((k) => k + 1);
  };

  // Copy code
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-default overflow-hidden shadow-xs bg-panel transition-all">
      {/* Top Action Bar */}
      <div className="px-4 py-2.5 border-b border-subtle bg-elevated flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-warning" />
          <span className="text-xs font-bold tracking-tight text-primary">
            {title}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-[var(--radius-sm)] font-semibold bg-warning-soft text-warning border border-[var(--color-warning)]/30">
            {isDomLesson ? 'DOM + Console' : 'Console Runner'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="touch-gap flex flex-wrap items-center gap-1.5">
          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="touch-target-h flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] bg-success hover:opacity-90 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title={isTouch ? undefined : 'Thực thi mã JavaScript'}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Chạy</span>
          </button>

          {/* Stop button */}
          <button
            onClick={handleStop}
            className="touch-target-h flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] text-danger hover:opacity-90 bg-danger-soft border border-[var(--color-danger)]/30 transition-all cursor-pointer"
            title={isTouch ? undefined : 'Dừng thực thi mã nguồn'}
            aria-label="Dừng thực thi"
          >
            <Square className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Dừng</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="touch-target p-1.5 flex items-center justify-center text-muted hover:text-primary hover:bg-hover rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            title={isTouch ? undefined : 'Đặt lại mã ban đầu'}
            aria-label="Đặt lại mã ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-subtle mx-0.5 hidden sm:block" />

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="touch-target p-1.5 flex items-center justify-center text-muted hover:text-success hover:bg-hover rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            title={isTouch ? undefined : 'Sao chép mã'}
            aria-label="Sao chép mã"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Open in Editor button */}
          {onOpenInEditor && (
            <button
              onClick={() => onOpenInEditor(code)}
              className="touch-target-h flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-accent hover:opacity-90 text-[var(--text-on-accent)] transition-all shadow-xs cursor-pointer"
              title={isTouch ? undefined : 'Mở trong trình soạn thảo 3 tab chính'}
              aria-label="Mở trong trình soạn thảo chính"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden md:inline">Mở trong Editor</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile/Tablet View Switcher (<lg) */}
      <div className="lg:hidden px-3 py-1.5 border-b border-subtle bg-panel flex items-center justify-between gap-2">
        <div className="inline-flex items-center p-0.5 rounded-[var(--radius-sm)] bg-elevated border border-default w-full">
          {[
            { id: 'both' as const, label: 'Cả hai' },
            { id: 'code' as const, label: 'Mã nguồn' },
            { id: 'output' as const, label: `Kết quả${logs.length > 0 ? ` (${logs.length})` : ''}` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`touch-target-h flex-1 px-2.5 py-1 rounded-[var(--radius-xs)] text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-accent text-[var(--text-on-accent)] shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
        {/* Left: Code Editor Area */}
        <div
          className={`${
            activeTab === 'output' ? 'hidden lg:flex' : 'flex'
          } flex-col min-h-[200px] sm:min-h-[220px] max-h-[340px] bg-[var(--code-bg)] font-mono text-xs`}
        >
          <div className="px-3 py-1.5 bg-panel border-b border-subtle flex items-center justify-between text-[11px] text-muted font-sans">
            <span>Mã JavaScript (Có thể chỉnh sửa)</span>
            <span className="shortcut-hint text-[10px] text-muted">Ctrl+Enter để chạy</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRun();
              }
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full flex-1 p-3.5 bg-transparent text-primary placeholder:text-muted resize-none focus:outline-none overscroll-contain font-mono text-xs leading-relaxed selection:bg-[var(--accent-base)]/40"
            rows={9}
          />
        </div>

        {/* Right: Output Area (Console or Split DOM/Console) */}
        <div
          className={`${
            activeTab === 'code' ? 'hidden lg:flex' : 'flex'
          } flex-col min-h-[220px] max-h-[360px] bg-[var(--code-bg)] overflow-hidden`}
        >
          {isDomLesson ? (
            <div className="flex-1 flex flex-col h-full divide-y divide-[var(--border-subtle)]">
              {/* Rendered DOM Page (Top) */}
              <div className="h-1/2 flex flex-col bg-white">
                <div className="px-3 py-1 bg-panel border-b border-subtle flex items-center gap-1.5 text-[11px] text-secondary font-medium font-sans">
                  <Eye className="w-3 h-3 text-accent" />
                  <span>Trang HTML kết quả</span>
                </div>
                <iframe
                  key={`dom-preview-${sandboxKey}`}
                  ref={iframeRef}
                  sandbox="allow-scripts"
                  className="w-full flex-1 border-0 bg-white"
                  title="DOM Preview"
                />
              </div>

              {/* Console Panel (Bottom) */}
              <div className="h-1/2 flex flex-col">
                <ConsolePanel
                  logs={logs}
                  onClear={() => setLogs([])}
                  isRunning={isRunning}
                  theme={theme}
                  title="Console Đầu Ra"
                />
              </div>
            </div>
          ) : (
            // Full Console Panel (Lessons 1-8)
            <ConsolePanel
              logs={logs}
              onClear={() => setLogs([])}
              isRunning={isRunning}
              theme={theme}
            />
          )}
        </div>
      </div>
    </div>
  );
};
