import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { runCloudDiagnostic, CloudDiagnosticResult } from '../lib/cloudHealth';
import { useAuth } from '../contexts/AuthContext';
import { getUserDiagnosticLabel } from '../lib/usernameAuth';

interface CloudDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudDiagnosticModal: React.FC<CloudDiagnosticModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CloudDiagnosticResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const executeDiagnostic = async () => {
    setIsRunning(true);
    try {
      const res = await runCloudDiagnostic(currentUser);
      setResult(res);
    } catch (err) {
      console.error('[Diagnostic] Lỗi khi chạy kiểm tra đám mây:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      executeDiagnostic();
      setIsCopied(false);
    }
  }, [isOpen, currentUser]);

  const handleCopyReport = () => {
    if (!result?.reportText) return;
    navigator.clipboard.writeText(result.reportText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 sm:pt-[max(0.75rem,var(--safe-top))] sm:pb-[max(0.75rem,var(--safe-bottom))] sm:pl-[max(0.75rem,var(--safe-left))] sm:pr-[max(0.75rem,var(--safe-right))] bg-overlay backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl max-h-viewport-92 sm:max-h-viewport-90 flex flex-col bg-elevated border-t sm:border border-default rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-subtle flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-[var(--radius-sm)] bg-accent-soft text-accent flex-shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-primary flex flex-wrap items-center gap-2">
                <span>Kiểm tra kết nối đám mây</span>
                {result && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      result.overallStatus === 'healthy'
                        ? 'bg-success-soft text-success border border-success/30'
                        : result.overallStatus === 'warning'
                        ? 'bg-warning-soft text-warning border border-warning/30'
                        : 'bg-danger-soft text-danger border border-danger/30'
                    }`}
                  >
                    {result.overallStatus === 'healthy'
                      ? '✓ Hoạt động tốt'
                      : result.overallStatus === 'warning'
                      ? '⚠ Cần lưu ý'
                      : '✗ Cần thiết lập'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Chẩn đoán Firebase Auth, Firestore, Realtime Database và tên miền
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="touch-target inline-flex items-center justify-center p-1.5 text-muted hover:text-primary hover:bg-[var(--border-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer flex-shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4">
          {/* Metadata container */}
          {result && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-[var(--radius-md)] bg-panel border border-default text-xs">
              <div>
                <span className="text-[10px] text-muted block uppercase font-mono">Project ID</span>
                <span className="font-semibold text-primary truncate block font-mono">
                  {result.projectId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted block uppercase font-mono">Tên miền</span>
                <span className="font-semibold text-primary truncate block font-mono">
                  {result.domain}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted block uppercase font-mono">Tài khoản</span>
                <span className="font-semibold text-primary truncate block font-mono">
                  {currentUser ? getUserDiagnosticLabel(currentUser) : 'Khách (Guest)'}
                </span>
              </div>
            </div>
          )}

          {/* List of cloud check results */}
          <div className="space-y-2.5">
            {isRunning && !result ? (
              <div className="py-12 flex flex-col items-center justify-center text-secondary gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-accent" />
                <span className="text-xs font-medium">Đang kiểm tra các dịch vụ đám mây...</span>
              </div>
            ) : (
              result?.checks.map((chk) => (
                <div
                  key={chk.id}
                  className={`p-3 rounded-[var(--radius-md)] border transition-all ${
                    chk.status === 'success'
                      ? 'bg-success-soft/20 border-success/30'
                      : chk.status === 'warning'
                      ? 'bg-warning-soft/20 border-warning/30'
                      : 'bg-danger-soft/20 border-danger/30'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {chk.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    )}
                    {chk.status === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    )}
                    {chk.status === 'error' && (
                      <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-primary">
                          {chk.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded ${
                            chk.status === 'success'
                              ? 'text-success bg-success-soft'
                              : chk.status === 'warning'
                              ? 'text-warning bg-warning-soft'
                              : 'text-danger bg-danger-soft'
                          }`}
                        >
                          {chk.status === 'success' ? '✓ Đạt' : chk.status === 'warning' ? '⚠ Lưu ý' : '✗ Lỗi'}
                        </span>
                      </div>

                      <p className="text-xs text-secondary mt-1 leading-relaxed">
                        {chk.details}
                      </p>

                      {chk.recommendation && (
                        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-primary/90 flex items-start gap-1.5 bg-elevated/40 p-2 rounded-[var(--radius-xs)]">
                          <span className="font-semibold text-accent flex-shrink-0">Hướng dẫn khắc phục:</span>
                          <span className="leading-relaxed">{chk.recommendation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between touch-gap gap-2 px-4 sm:px-6 pt-3 pb-[max(0.875rem,var(--safe-bottom))] sm:py-3.5 border-t border-subtle bg-panel/50 flex-shrink-0">
          <button
            type="button"
            onClick={executeDiagnostic}
            disabled={isRunning}
            className="touch-target-h px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium text-secondary hover:text-primary bg-elevated hover:bg-[var(--border-subtle)] border border-default transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Kiểm tra lại</span>
          </button>

          <div className="flex items-center touch-gap gap-2 ml-auto">
            <button
              type="button"
              onClick={handleCopyReport}
              disabled={!result || isRunning}
              className="touch-target-h px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium text-primary bg-elevated hover:bg-[var(--border-subtle)] border border-default transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-success">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-muted" />
                  <span>Sao chép báo cáo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="touch-target-h px-4 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold text-accent-on bg-accent hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
