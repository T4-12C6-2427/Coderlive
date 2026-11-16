import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Terminal,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Link2,
  ListChecks,
  LocateFixed,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  DeviceMode,
  ThemeMode,
  ConsoleMessage,
  StaticIssue,
  EditorTab,
  CollabPreviewSyncState,
} from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useIsTouch } from '../hooks/useViewport';
import {
  PreviewSourceMap,
  isExtensionOrHostUrl,
  mapPreviewLocationToTab,
} from '../lib/codeCompiler';

interface PreviewPaneProps {
  compiledSrcDoc: string;
  sourceMap: PreviewSourceMap;
  channelToken: string;
  previewCodes: { html: string; css: string; js: string };
  theme?: ThemeMode;
  onRefresh: () => void;
  refreshTrigger: number;
  isEmptyPreview?: boolean;
  consoleMessages: ConsoleMessage[];
  staticIssues: StaticIssue[];
  onRuntimeMessage: (msg: ConsoleMessage) => void;
  onClearConsole: () => void;
  onJumpToLocation?: (loc: { tab: EditorTab; line: number; col?: number }) => void;
  // Stage 4: Đồng bộ chế độ xem trước (tắt mặc định)
  isCollabMode?: boolean;
  syncPreviewEnabled?: boolean;
  onToggleSyncPreview?: () => void;
  syncedPreviewState?: CollabPreviewSyncState | null;
  currentUserId?: string;
  onPublishPreviewSync?: (device: DeviceMode, refreshNonce: number) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isPreviewBodyHidden?: boolean;
}

function formatLocationLabel(
  tab?: EditorTab | null,
  line?: number | null,
  col?: number | null
): string | null {
  if (!line && !tab) return null;
  const parts: string[] = [];
  if (tab) parts.push(tab.toUpperCase());
  if (line && line > 0) parts.push(`dòng ${line}`);
  if (col && col > 0) parts.push(`cột ${col}`);
  return parts.length > 0 ? parts.join(', ') : null;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  compiledSrcDoc,
  sourceMap,
  channelToken,
  previewCodes,
  onRefresh,
  refreshTrigger,
  isEmptyPreview = false,
  consoleMessages,
  staticIssues,
  onRuntimeMessage,
  onClearConsole,
  onJumpToLocation,
  isCollabMode = false,
  syncPreviewEnabled = false,
  onToggleSyncPreview,
  syncedPreviewState = null,
  currentUserId = '',
  onPublishPreviewSync,
  isExpanded = false,
  onToggleExpand,
  isPreviewBodyHidden = false,
}) => {
  const { settings } = useTheme();
  const isTouch = useIsTouch();
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'console' | 'issues'>('console');
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'error' | 'warn' | 'log'>('all');
  const [issuesFilter, setIssuesFilter] = useState<'all' | 'html' | 'css'>('all');
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [showReloadToast, setShowReloadToast] = useState<boolean>(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncRefreshNonceRef = useRef<number>(0);
  const lastAppliedSyncAtRef = useRef<number>(0);

  const iframeRef0 = useRef<HTMLIFrameElement>(null);
  const iframeRef1 = useRef<HTMLIFrameElement>(null);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const [slotDocs, setSlotDocs] = useState<[string, string]>(() => [compiledSrcDoc, '']);
  const [slotEpochs, setSlotEpochs] = useState<[number, number]>([0, 0]);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const activeSlotRef = useRef<0 | 1>(0);
  activeSlotRef.current = activeSlot;
  const lastManualResetSigRef = useRef<string>(`${reloadKey}:${refreshTrigger}`);
  const lastLoadedTokenRef = useRef<string>(channelToken);
  const pendingTargetRef = useRef<{ slot: 0 | 1; token: string } | null>(null);
  const pendingSwapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs ổn định để trình nghe postMessage luôn dùng sourceMap, code và token mới nhất
  const sourceMapRef = useRef(sourceMap);
  sourceMapRef.current = sourceMap;
  const previewCodesRef = useRef(previewCodes);
  previewCodesRef.current = previewCodes;
  const channelTokenRef = useRef(channelToken);
  channelTokenRef.current = channelToken;
  const onRuntimeMessageRef = useRef(onRuntimeMessage);
  onRuntimeMessageRef.current = onRuntimeMessage;

  // Double-buffering iframe: cập nhật nền ở iframe dự phòng rồi hoán đổi khi nạp xong để tránh nháy trắng
  useEffect(() => {
    const resetSig = `${reloadKey}:${refreshTrigger}`;
    if (resetSig !== lastManualResetSigRef.current) {
      lastManualResetSigRef.current = resetSig;
      if (pendingSwapTimerRef.current) {
        clearTimeout(pendingSwapTimerRef.current);
        pendingSwapTimerRef.current = null;
      }
      pendingTargetRef.current = null;
      lastLoadedTokenRef.current = channelToken;
      setActiveSlot(0);
      setSlotDocs([compiledSrcDoc, '']);
      setSlotEpochs(([e0, e1]) => [e0 + 1, e1]);
      return;
    }

    if (lastLoadedTokenRef.current === channelToken) {
      return;
    }
    lastLoadedTokenRef.current = channelToken;

    const currentActive = activeSlotRef.current;
    const standbySlot: 0 | 1 = currentActive === 0 ? 1 : 0;

    if (pendingSwapTimerRef.current) {
      clearTimeout(pendingSwapTimerRef.current);
      pendingSwapTimerRef.current = null;
    }

    pendingTargetRef.current = { slot: standbySlot, token: channelToken };
    setSlotDocs((prev) =>
      standbySlot === 0 ? [compiledSrcDoc, prev[1]] : [prev[0], compiledSrcDoc]
    );

    // Dự phòng nếu iframe mất quá lâu để kích hoạt onLoad (ví dụ tài nguyên ngoài chậm)
    const targetToken = channelToken;
    pendingSwapTimerRef.current = setTimeout(() => {
      pendingSwapTimerRef.current = null;
      if (pendingTargetRef.current?.token === targetToken) {
        pendingTargetRef.current = null;
        setActiveSlot(standbySlot);
      }
    }, 350);
  }, [compiledSrcDoc, channelToken, reloadKey, refreshTrigger]);

  useEffect(() => {
    return () => {
      if (pendingSwapTimerRef.current) {
        clearTimeout(pendingSwapTimerRef.current);
        pendingSwapTimerRef.current = null;
      }
    };
  }, []);

  const handleSlotLoad = (slot: 0 | 1) => {
    const pending = pendingTargetRef.current;
    if (!pending || pending.slot !== slot) return;
    if (pendingSwapTimerRef.current) {
      clearTimeout(pendingSwapTimerRef.current);
      pendingSwapTimerRef.current = null;
    }
    pendingTargetRef.current = null;
    setActiveSlot(slot);
  };

  // Lắng nghe postMessage từ sandbox preview iframe, xác thực chặt chẽ event.source, event.origin và channelToken
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const w0 = iframeRef0.current?.contentWindow;
      const w1 = iframeRef1.current?.contentWindow;
      if (!event.source || (event.source !== w0 && event.source !== w1)) return;

      // Iframe sandboxed không có allow-same-origin luôn có origin là chuỗi 'null'
      if (event.origin !== 'null' && event.origin !== window.location.origin) return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.source !== 'coderlive-preview') return;
      if (data.token !== channelTokenRef.current) return;

      const rawMessage = typeof data.message === 'string' ? data.message : String(data.message ?? '');
      if (isExtensionOrHostUrl(data.url) || isExtensionOrHostUrl(rawMessage)) return;

      const codes = previewCodesRef.current;
      if (!codes.html && !codes.css && !codes.js) return;
      const mapped = mapPreviewLocationToTab(
        {
          sourceType: data.sourceType,
          url: data.url,
          line: typeof data.line === 'number' ? data.line : null,
          col: typeof data.col === 'number' ? data.col : null,
          stack: typeof data.stack === 'string' ? data.stack : null,
          resourceTag: typeof data.resourceTag === 'string' ? data.resourceTag : undefined,
          resourceUrl: typeof data.resourceUrl === 'string' ? data.resourceUrl : undefined,
        },
        sourceMapRef.current,
        codes.html,
        codes.css,
        codes.js
      );

      if (mapped.isInternalOrExtension) return;

      const msgType: ConsoleMessage['type'] =
        data.type === 'error' || data.type === 'warn' || data.type === 'info' ? data.type : 'log';

      onRuntimeMessageRef.current({
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        type: msgType,
        message: rawMessage,
        tab: mapped.tab,
        line: mapped.line,
        col: mapped.col,
        stack: mapped.stack,
        sourceType: data.sourceType,
        count: 1,
        time: typeof data.time === 'string' ? data.time : new Date().toLocaleTimeString('vi-VN'),
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Áp dụng trạng thái xem trước được đồng bộ từ thành viên khác (chỉ khi người dùng bật "Đồng bộ chế độ xem trước")
  useEffect(() => {
    if (!isCollabMode || !syncPreviewEnabled || !syncedPreviewState) return;
    if (syncedPreviewState.updatedAt <= lastAppliedSyncAtRef.current) return;
    lastAppliedSyncAtRef.current = syncedPreviewState.updatedAt;

    if (syncedPreviewState.updatedByUid === currentUserId) {
      syncRefreshNonceRef.current = Math.max(
        syncRefreshNonceRef.current,
        syncedPreviewState.refreshNonce
      );
      return;
    }

    setDevice(syncedPreviewState.device);
    if (syncedPreviewState.refreshNonce > syncRefreshNonceRef.current) {
      syncRefreshNonceRef.current = syncedPreviewState.refreshNonce;
      setReloadKey((prev) => prev + 1);
      onRefresh();
    }
  }, [isCollabMode, syncPreviewEnabled, syncedPreviewState, currentUserId, onRefresh]);

  const handleSelectDevice = (nextDevice: DeviceMode) => {
    setDevice(nextDevice);
    if (isCollabMode && syncPreviewEnabled && onPublishPreviewSync) {
      onPublishPreviewSync(nextDevice, syncRefreshNonceRef.current);
    }
  };

  // Reload preview from scratch (resets JS state, counters, timers, animations)
  const handleReloadPreview = () => {
    setReloadKey((prev) => prev + 1);
    onClearConsole();
    onRefresh();

    if (isCollabMode && syncPreviewEnabled && onPublishPreviewSync) {
      syncRefreshNonceRef.current += 1;
      onPublishPreviewSync(device, syncRefreshNonceRef.current);
    }

    setShowReloadToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowReloadToast(false);
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Auto-scroll console to bottom when new message arrives
  useEffect(() => {
    if (isConsoleOpen && drawerTab === 'console' && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleMessages, isConsoleOpen, drawerTab]);

  // Counts (có tính gộp số lần lặp)
  const errorCount = useMemo(() => {
    return consoleMessages
      .filter((m) => m.type === 'error')
      .reduce((acc, m) => acc + (m.count ?? 1), 0);
  }, [consoleMessages]);

  const warnCount = useMemo(() => {
    return consoleMessages
      .filter((m) => m.type === 'warn')
      .reduce((acc, m) => acc + (m.count ?? 1), 0);
  }, [consoleMessages]);

  const htmlIssueCount = useMemo(
    () => staticIssues.filter((i) => i.category === 'html').length,
    [staticIssues]
  );

  const cssIssueCount = useMemo(
    () => staticIssues.filter((i) => i.category === 'css').length,
    [staticIssues]
  );

  // Most recent error message for banner
  const latestError = useMemo(() => {
    return [...consoleMessages].reverse().find((m) => m.type === 'error');
  }, [consoleMessages]);

  const filteredMessages = useMemo(() => {
    if (consoleFilter === 'all') return consoleMessages;
    return consoleMessages.filter((m) => m.type === consoleFilter);
  }, [consoleMessages, consoleFilter]);

  const filteredIssues = useMemo(() => {
    if (issuesFilter === 'all') return staticIssues;
    return staticIssues.filter((i) => i.category === issuesFilter);
  }, [staticIssues, issuesFilter]);

  const handleOpenTab = (targetTab: 'console' | 'issues') => {
    if (isConsoleOpen && drawerTab === targetTab) {
      setIsConsoleOpen(false);
    } else {
      setDrawerTab(targetTab);
      setIsConsoleOpen(true);
    }
  };

  const handleJumpMessage = (msg: ConsoleMessage) => {
    if (!onJumpToLocation || !msg.line) return;
    onJumpToLocation({
      tab: msg.tab || 'js',
      line: msg.line,
      col: msg.col ?? 1,
    });
  };

  const handleJumpIssue = (issue: StaticIssue) => {
    if (!onJumpToLocation) return;
    onJumpToLocation({
      tab: issue.tab,
      line: issue.line,
      col: issue.col ?? 1,
    });
  };

  const getDeviceContainerStyle = (): React.CSSProperties => {
    switch (device) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-overlay)',
          border: '1px solid var(--border-default)',
        };
      case 'tablet':
        return {
          width: '768px',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '900px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-overlay)',
          border: '1px solid var(--border-default)',
        };
      case 'desktop':
      default:
        return {
          width: '100%',
          height: '100%',
        };
    }
  };

  const getCanvasBgClass = () => {
    if (settings.previewBg === 'light') return 'bg-white';
    if (settings.previewBg === 'checker') {
      return 'bg-[linear-gradient(45deg,rgba(0,0,0,0.08)_25%,transparent_25%),linear-gradient(-45deg,rgba(0,0,0,0.08)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(0,0,0,0.08)_75%),linear-gradient(-45deg,transparent_75%,rgba(0,0,0,0.08)_75%)] bg-[size:16px_16px] bg-panel';
    }
    return 'bg-transparent';
  };

  const latestErrorLocation = latestError
    ? formatLocationLabel(latestError.tab, latestError.line, latestError.col)
    : null;

  return (
    <div
      className={`flex flex-col w-full overflow-hidden select-none relative bg-transparent text-primary ${
        isPreviewBodyHidden ? 'h-auto' : 'h-full'
      }`}
    >
      {/* Toast Notification on Reload */}
      {showReloadToast && !isPreviewBodyHidden && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-elevated text-primary border border-default shadow-elevated text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xs pointer-events-none">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          <span>Đã làm mới khung xem trước</span>
        </div>
      )}

      {/* Top Preview Sub-Header Bar */}
      <div
        className={`min-h-[44px] sm:h-11 pl-3 pr-3 py-1.5 sm:py-0 items-center justify-between gap-2 border-b border-subtle bg-elevated text-xs z-10 min-w-0 ${
          isPreviewBodyHidden ? 'hidden' : 'flex flex-wrap sm:flex-nowrap'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-1.5 font-bold min-w-0">
            <Eye className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-xs sm:text-sm tracking-tight text-primary font-semibold truncate">
              Khung xem trước
            </span>
          </div>
          <span className="text-[11px] text-muted hidden xl:inline flex-shrink-0 truncate">
            (Thời gian thực)
          </span>
        </div>

        {/* Device Switcher & Controls */}
        <div className="touch-gap flex items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0 ml-auto">
          {isCollabMode && onToggleSyncPreview && (
            <button
              type="button"
              onClick={onToggleSyncPreview}
              aria-pressed={syncPreviewEnabled}
              aria-label="Đồng bộ chế độ xem trước"
              title={
                isTouch
                  ? undefined
                  : syncPreviewEnabled
                  ? 'Đang đồng bộ khung hình & làm mới xem trước với nhóm (Console vẫn giữ riêng tư)'
                  : 'Bật đồng bộ kích thước thiết bị & nút làm mới xem trước với cả nhóm'
              }
              className={`touch-target-h h-7 px-2 rounded-[var(--radius-sm)] border text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none flex-shrink-0 ${
                syncPreviewEnabled
                  ? 'bg-accent-soft text-accent border-[var(--accent-base)]/40'
                  : 'bg-panel border-default text-secondary hover:text-primary hover:bg-elevated'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline">Đồng bộ chế độ xem trước</span>
              <span className="xl:hidden">Đồng bộ</span>
            </button>
          )}

          {/* Device Size Toggles */}
          <div className="touch-gap flex items-center gap-0.5 p-0.5 rounded-[var(--radius-sm)] border border-default bg-panel flex-shrink-0">
            <button
              type="button"
              onClick={() => handleSelectDevice('desktop')}
              className={`touch-target p-1.5 flex items-center justify-center rounded-[var(--radius-xs)] transition-all cursor-pointer ${
                device === 'desktop'
                  ? 'bg-accent text-accent-on shadow-xs font-bold'
                  : 'text-secondary hover:text-primary'
              }`}
              title={isTouch ? undefined : 'Kích thước Máy tính để bàn (100%)'}
              aria-label="Kích thước Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSelectDevice('tablet')}
              className={`touch-target p-1.5 flex items-center justify-center rounded-[var(--radius-xs)] transition-all cursor-pointer ${
                device === 'tablet'
                  ? 'bg-accent text-accent-on shadow-xs font-bold'
                  : 'text-secondary hover:text-primary'
              }`}
              title={isTouch ? undefined : 'Kích thước Máy tính bảng (768px)'}
              aria-label="Kích thước Tablet"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSelectDevice('mobile')}
              className={`touch-target p-1.5 flex items-center justify-center rounded-[var(--radius-xs)] transition-all cursor-pointer ${
                device === 'mobile'
                  ? 'bg-accent text-accent-on shadow-xs font-bold'
                  : 'text-secondary hover:text-primary'
              }`}
              title={isTouch ? undefined : 'Kích thước Điện thoại (375px)'}
              aria-label="Kích thước Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh iframe button */}
          <button
            type="button"
            onClick={handleReloadPreview}
            className="touch-target p-1.5 flex items-center justify-center rounded-[var(--radius-sm)] border border-default bg-panel hover:bg-elevated text-secondary hover:text-primary shadow-xs transition-all cursor-pointer flex-shrink-0"
            title={isTouch ? undefined : 'Làm mới xem trước'}
            aria-label="Làm mới xem trước"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Expand / Collapse Preview button */}
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-pressed={isExpanded}
              aria-label={isExpanded ? 'Thu nhỏ' : 'Phóng to khung xem trước'}
              title={
                isTouch
                  ? undefined
                  : `${isExpanded ? 'Thu nhỏ' : 'Phóng to khung xem trước'} (Ctrl+Alt+P)`
              }
              className={`hidden sm:inline-flex items-center justify-center min-w-[44px] min-h-[44px] lg:min-w-0 lg:min-h-0 lg:w-7 lg:h-7 rounded-[var(--radius-sm)] border transition-all cursor-pointer flex-shrink-0 shadow-xs focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
                isExpanded
                  ? 'bg-accent-soft text-accent border-[var(--accent-base)]/40'
                  : 'border-default bg-panel hover:bg-elevated text-secondary hover:text-primary'
              }`}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Container Area */}
      <div
        className={`flex-1 min-h-0 relative overflow-auto overscroll-contain items-center justify-center p-2 sm:p-4 transition-colors ${getCanvasBgClass()} ${
          isPreviewBodyHidden ? 'hidden' : 'flex'
        }`}
      >
        <div
          className="transition-all duration-300 overflow-hidden relative flex flex-col bg-white"
          style={getDeviceContainerStyle()}
        >
          {device === 'mobile' && (
            <div className="h-5 bg-elevated border-b border-subtle flex items-center justify-center relative">
              <div className="w-16 h-1 bg-[var(--border-strong)] rounded-full" />
              <div className="absolute right-3 w-2 h-2 rounded-full bg-[var(--border-default)]" />
            </div>
          )}

          {device !== 'desktop' && (
            <div className="absolute bottom-2 right-2 z-20 text-[10px] font-mono px-2 py-0.5 rounded-[var(--radius-xs)] bg-elevated/90 text-primary border border-default backdrop-blur-xs pointer-events-none">
              {device === 'mobile' ? '375 × 667 px' : '768 px'}
            </div>
          )}

          {isEmptyPreview && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4 text-center">
              <p className="text-xs sm:text-sm text-muted select-none">
                Gõ code ở bên trái để xem kết quả
              </p>
            </div>
          )}

          <div className="relative flex-1 w-full h-full overflow-hidden bg-white">
            <iframe
              key={`preview-slot-0-${slotEpochs[0]}`}
              ref={iframeRef0}
              srcDoc={slotDocs[0]}
              onLoad={() => handleSlotLoad(0)}
              title="Trình xem trước kết quả HTML"
              aria-hidden={activeSlot !== 0}
              tabIndex={activeSlot === 0 ? undefined : -1}
              sandbox="allow-scripts allow-modals"
              className={`w-full h-full border-0 bg-white ${
                activeSlot === 0
                  ? 'relative z-[1] opacity-100 pointer-events-auto'
                  : 'absolute inset-0 z-0 opacity-0 pointer-events-none'
              }`}
            />
            {slotDocs[1] !== '' && (
              <iframe
                key={`preview-slot-1-${slotEpochs[1]}`}
                ref={iframeRef1}
                srcDoc={slotDocs[1]}
                onLoad={() => handleSlotLoad(1)}
                title="Trình xem trước kết quả HTML (bộ đệm)"
                aria-hidden={activeSlot !== 1}
                tabIndex={activeSlot === 1 ? undefined : -1}
                sandbox="allow-scripts allow-modals"
                className={`w-full h-full border-0 bg-white ${
                  activeSlot === 1
                    ? 'relative z-[1] opacity-100 pointer-events-auto'
                    : 'absolute inset-0 z-0 opacity-0 pointer-events-none'
                }`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Friendly Error Banner with click-to-jump */}
      {!isConsoleOpen && latestError && (
        <div className="mx-3 mb-2 p-2.5 rounded-[var(--radius-md)] bg-danger-soft border border-danger/30 text-danger text-xs flex flex-wrap sm:flex-nowrap items-center justify-between shadow-elevated animate-in slide-in-from-bottom-2 gap-2">
          <button
            type="button"
            onClick={() => {
              if (latestError.line && onJumpToLocation) {
                handleJumpMessage(latestError);
              } else {
                setDrawerTab('console');
                setIsConsoleOpen(true);
              }
            }}
            className="flex items-center gap-2 overflow-hidden cursor-pointer flex-1 min-w-0 text-left"
          >
            <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
            <div className="truncate min-w-0">
              <span className="font-semibold text-danger">Lỗi: </span>
              <span>{latestError.message}</span>
              {latestErrorLocation && (
                <span className="ml-1.5 text-danger font-mono underline">
                  ({latestErrorLocation})
                </span>
              )}
            </div>
          </button>

          <div className="touch-gap flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setDrawerTab('console');
                setIsConsoleOpen(true);
              }}
              className="touch-target-h px-2 text-[11px] underline font-medium text-danger hover:opacity-80 cursor-pointer"
            >
              Mở Console ({errorCount})
            </button>
          </div>
        </div>
      )}

      {/* Bottom Console & Static Issues Panel Header */}
      <div className="border-t border-subtle select-none transition-colors bg-elevated">
        <div className="touch-target-h min-h-[40px] px-2 sm:px-3 py-1 flex items-center justify-between gap-2 min-w-0">
          {/* Drawer Mode Tabs: Console | Vấn đề */}
          <div className="touch-gap flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleOpenTab('console')}
              aria-expanded={isConsoleOpen && drawerTab === 'console'}
              className={`touch-target-h flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-xs)] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                isConsoleOpen && drawerTab === 'console'
                  ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/40'
                  : 'text-primary hover:bg-[var(--border-subtle)]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>Bảng điều khiển (Console)</span>
              {errorCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-danger-soft text-danger border border-danger/30 flex items-center gap-0.5 flex-shrink-0 tabular-nums">
                  <span>{errorCount}</span>
                  <span className="hidden sm:inline">lỗi</span>
                </span>
              )}
              {warnCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-warning-soft text-warning border border-warning/30 flex items-center gap-0.5 flex-shrink-0 tabular-nums">
                  <span>{warnCount}</span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleOpenTab('issues')}
              aria-expanded={isConsoleOpen && drawerTab === 'issues'}
              className={`touch-target-h flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-xs)] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                isConsoleOpen && drawerTab === 'issues'
                  ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/40'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5 text-warning flex-shrink-0" />
              <span>Vấn đề</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums flex-shrink-0 ${
                  staticIssues.length > 0
                    ? 'bg-warning-soft text-warning border border-warning/30'
                    : 'bg-panel text-muted border border-subtle'
                }`}
              >
                {staticIssues.length}
              </span>
            </button>
          </div>

          {/* Right controls: Collapse toggle */}
          <div className="touch-gap flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsConsoleOpen((prev) => !prev)}
              aria-label={isConsoleOpen ? 'Thu gọn bảng điều khiển' : 'Mở bảng điều khiển'}
              className="touch-target p-1.5 rounded-[var(--radius-xs)] text-muted hover:text-primary hover:bg-[var(--border-subtle)] transition-colors cursor-pointer flex items-center justify-center"
            >
              {isConsoleOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Drawer Body */}
        {isConsoleOpen && (
          <div className="h-44 sm:h-52 max-h-[45dvh] border-t border-subtle flex flex-col font-mono text-xs bg-panel text-primary">
            {drawerTab === 'console' ? (
              <>
                {/* Console Toolbar with Filter, Global Audit & Clear */}
                <div className="min-h-[36px] px-3 py-1 border-b border-subtle flex items-center justify-between gap-2 text-[11px] bg-elevated">
                  <div className="touch-gap flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setConsoleFilter('all')}
                      className={`touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        consoleFilter === 'all'
                          ? 'bg-accent text-accent-on font-medium shadow-xs'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      Tất cả ({consoleMessages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsoleFilter('error')}
                      className={`touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        consoleFilter === 'error'
                          ? 'bg-danger-soft text-danger border border-danger/40 font-semibold shadow-xs'
                          : 'text-danger hover:opacity-80'
                      }`}
                    >
                      Lỗi ({errorCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsoleFilter('warn')}
                      className={`touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        consoleFilter === 'warn'
                          ? 'bg-warning-soft text-warning border border-warning/40 font-semibold shadow-xs'
                          : 'text-warning hover:opacity-80'
                      }`}
                    >
                      Cảnh báo ({warnCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsoleFilter('log')}
                      className={`touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        consoleFilter === 'log'
                          ? 'bg-[var(--border-strong)] text-primary font-medium shadow-xs'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      Nhật ký ({consoleMessages.filter((m) => m.type === 'log').length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={onClearConsole}
                    className="touch-target-h flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] text-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                    title={isTouch ? undefined : 'Xóa toàn bộ thông báo trong bảng điều khiển'}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa sạch</span>
                  </button>
                </div>

                {/* Console Message List */}
                <div className="flex-1 overflow-auto overscroll-contain p-2 space-y-1.5 select-text">
                  {filteredMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted text-xs py-4 gap-2 text-center">
                      <CheckCircle2 className="w-6 h-6 text-success opacity-80" />
                      <span>Không có thông báo hoặc lỗi nào được ghi lại.</span>
                    </div>
                  ) : (
                    filteredMessages.map((msg) => {
                      const locLabel = formatLocationLabel(msg.tab, msg.line, msg.col);
                      const isJumpable = Boolean(msg.line && onJumpToLocation);
                      const repeatCount = msg.count ?? 1;

                      return (
                        <div
                          key={msg.id}
                          onClick={isJumpable ? () => handleJumpMessage(msg) : undefined}
                          role={isJumpable ? 'button' : undefined}
                          tabIndex={isJumpable ? 0 : undefined}
                          onKeyDown={
                            isJumpable
                              ? (e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleJumpMessage(msg);
                                  }
                                }
                              : undefined
                          }
                          title={
                            isJumpable && !isTouch
                              ? `Nhấp để nhảy đến ${locLabel || 'vị trí lỗi'} trong trình soạn thảo`
                              : undefined
                          }
                          className={`flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 px-2.5 py-1.5 rounded-[var(--radius-xs)] transition-colors ${
                            msg.type === 'error'
                              ? 'bg-danger-soft text-danger border-l-2 border-danger'
                              : msg.type === 'warn'
                              ? 'bg-warning-soft text-warning border-l-2 border-warning'
                              : 'hover:bg-[var(--border-subtle)] text-primary'
                          } ${isJumpable ? 'cursor-pointer hover:brightness-105' : ''}`}
                        >
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className="flex-shrink-0 mt-0.5">
                              {msg.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-danger" />}
                              {msg.type === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                              {msg.type === 'log' && <Terminal className="w-3.5 h-3.5 text-muted" />}
                              {msg.type === 'info' && <Info className="w-3.5 h-3.5 text-info" />}
                            </span>

                            <span className="text-[10px] text-muted flex-shrink-0 select-none pt-0.5">
                              {msg.time}
                            </span>

                            {repeatCount > 1 && (
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums flex-shrink-0 ${
                                  msg.type === 'error'
                                    ? 'bg-danger text-accent-on'
                                    : 'bg-warning text-primary'
                                }`}
                                title={`Lặp lại ${repeatCount} lần`}
                              >
                                ×{repeatCount}
                              </span>
                            )}

                            <div className="flex-1 min-w-0 break-words whitespace-pre-wrap font-mono">
                              <span>{msg.message}</span>
                              {locLabel && (
                                <span
                                  className={`ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold underline decoration-dotted ${
                                    msg.type === 'warn'
                                      ? 'bg-elevated text-warning border border-warning/30'
                                      : 'bg-elevated text-danger border border-danger/30'
                                  }`}
                                >
                                  <LocateFixed className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span>{locLabel}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={consoleBottomRef} />
                </div>
              </>
            ) : (
              <>
                {/* Static Issues ("Vấn đề") Toolbar */}
                <div className="min-h-[36px] px-3 py-1 border-b border-subtle flex items-center justify-between gap-2 text-[11px] bg-elevated font-sans">
                  <div className="touch-gap flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setIssuesFilter('all')}
                      className={`touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        issuesFilter === 'all'
                          ? 'bg-accent text-accent-on font-medium shadow-xs'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      Tất cả ({staticIssues.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIssuesFilter('html')}
                      className={`touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        issuesFilter === 'html'
                          ? 'bg-warning-soft text-warning border border-warning/40 font-semibold shadow-xs'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      HTML ({htmlIssueCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIssuesFilter('css')}
                      className={`touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        issuesFilter === 'css'
                          ? 'bg-warning-soft text-warning border border-warning/40 font-semibold shadow-xs'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      CSS ({cssIssueCount})
                    </button>
                  </div>

                  <span className="hidden sm:inline text-[10px] text-muted whitespace-nowrap flex-shrink-0">
                    Kiểm tra tĩnh tự động (DOMParser &amp; CSS)
                  </span>
                </div>

                {/* Static Issues List */}
                <div className="flex-1 overflow-auto overscroll-contain p-2 space-y-1.5 select-text">
                  {filteredIssues.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted text-xs py-4 gap-2 text-center font-sans">
                      <CheckCircle2 className="w-6 h-6 text-success opacity-80" />
                      <span>Không phát hiện gợi ý hoặc lỗi cú pháp HTML/CSS nào.</span>
                    </div>
                  ) : (
                    filteredIssues.map((issue) => {
                      const locLabel = formatLocationLabel(issue.tab, issue.line, issue.col);
                      return (
                        <div
                          key={issue.id}
                          onClick={() => handleJumpIssue(issue)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleJumpIssue(issue);
                            }
                          }}
                          title={
                            !isTouch
                              ? `Nhấp để nhảy tới ${locLabel || 'vị trí gợi ý'} trong trình soạn thảo`
                              : undefined
                          }
                          className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 px-2.5 py-1.5 rounded-[var(--radius-xs)] bg-warning-soft text-warning border-l-2 border-warning cursor-pointer hover:brightness-105 transition-all"
                        >
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
                            <span className="px-1.5 py-0.5 rounded bg-elevated text-warning border border-warning/30 text-[10px] font-bold uppercase font-sans flex-shrink-0">
                              Gợi ý
                            </span>
                            <div className="flex-1 min-w-0 break-words">
                              <div className="font-sans text-xs text-primary">
                                <span>{issue.message}</span>
                                {locLabel && (
                                  <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-elevated text-warning border border-warning/30 text-[10px] font-mono font-semibold underline decoration-dotted">
                                    <LocateFixed className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span>{locLabel}</span>
                                  </span>
                                )}
                              </div>
                              {issue.codeSnippet && (
                                <div className="mt-0.5 text-[10px] text-secondary font-mono truncate">
                                  {issue.codeSnippet}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
