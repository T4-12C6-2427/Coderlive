import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Palette,
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  Check,
  Eye,
  Sliders,
  Type,
  Shuffle,
  ShieldCheck,
  Layers,
  Wand2,
  Minimize2,
  Maximize2,
  X,
  Search,
  Download,
  Upload,
  Undo2,
  Redo2,
  FileCode,
  Image as ImageIcon,
  Flame,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Move,
  Code2,
  BoxSelect,
  Cloud,
  CheckCheck,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { Switch, Slider } from './ui/Controls';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserDiagnosticLabel } from '../lib/usernameAuth';
import {
  THEME_PRESETS,
  ACCENT_SWATCHES,
  getContrastRatio,
} from '../lib/themeEngine';
import {
  RadiusStyle,
  DensityStyle,
  SurfaceStyle,
  PersonalizeSection,
  ThemePreset,
  EffectId,
  EffectColorMode,
  EffectConfig,
  PatternType,
} from '../types/theme';
import {
  STATIC_PATTERN_DEFINITIONS,
  normalizePatternId,
  buildStaticPatternStyle,
  PatternGroup,
} from '../lib/background/patterns';
import {
  EFFECT_CATEGORIES,
  EFFECT_CATALOG,
  getActiveEffectsList,
  resolveEffectConfig,
} from '../lib/background/effectsEngine';
import {
  clearStoredBgImage,
  formatBytesVi,
  processAndStoreBgImage,
  resolveBgImageMeta,
  StoredBgImageMeta,
  subscribeBgImageChanged,
} from '../lib/background/imageStorage';
import { EffectThumbnail } from './background/EffectThumbnail';
import { PatternThumbnail } from './background/PatternThumbnail';

export interface PersonalizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerTestPattern?: () => void;
}

const STORAGE_KEY_SECTION = 'coderlive_personalize_section_v1';
const STORAGE_KEY_MINIMIZED = 'coderlive_personalize_minimized_v1';

export const PersonalizationDrawer: React.FC<PersonalizationDrawerProps> = ({
  isOpen,
  onClose,
  onTriggerTestPattern,
}) => {
  const {
    settings,
    activePreset,
    updateSettings,
    applyPreset,
    resetDefaults,
    undo,
    redo,
    canUndo,
    canRedo,
    randomizeTheme,
    exportTheme,
    importTheme,
    toggleThemeMode,
  } = useTheme();

  const { currentUser } = useAuth();

  // Navigation section
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [activeSection, setActiveSection] = useState<PersonalizeSection>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SECTION);
      if (saved) return saved as PersonalizeSection;
    } catch {}
    return 'presets';
  });

  // Minimized floating panel mode
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_MINIMIZED) === 'true';
    } catch {}
    return false;
  });

  // Floating panel drag position
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number }>({ x: 24, y: 24 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 24,
    initY: 24,
  });

  // Preset search and filter
  const [presetSearch, setPresetSearch] = useState('');
  const [presetFilter, setPresetFilter] = useState<
    'all' | 'floral' | 'animated' | 'dark' | 'light' | 'pattern' | 'contrast'
  >('all');

  // Pattern gallery group filter & active effect config editor tab
  const [patternGroupFilter, setPatternGroupFilter] = useState<'all' | PatternGroup>('all');
  const [selectedConfigEffectId, setSelectedConfigEffectId] = useState<EffectId | null>(null);

  // Export / Import dialog
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Custom background image state (Stage 4)
  const [bgImageMeta, setBgImageMeta] = useState<StoredBgImageMeta | null>(null);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);
  const [isBgUploading, setIsBgUploading] = useState(false);
  const [isBgDragging, setIsBgDragging] = useState(false);

  // Status feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Focus trap ref
  const windowRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Remember active section
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SECTION, activeSection);
    } catch {}
  }, [activeSection]);

  // Remember minimized state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MINIMIZED, String(isMinimized));
    } catch {}
  }, [isMinimized]);

  // Store trigger element for accessibility focus return
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      if (!isMinimized) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        setTimeout(() => triggerElementRef.current?.focus(), 50);
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMinimized]);

  // Keyboard navigation & Shortcuts (Esc, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc closes
      if (e.key === 'Escape') {
        if (isExportImportOpen) {
          setIsExportImportOpen(false);
          return;
        }
        onClose();
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (canUndo) {
          undo();
          showNotification('Đã hoàn tác thao tác');
        }
      }

      // Redo: Ctrl+Y or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
          showNotification('Đã làm lại thao tác');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExportImportOpen, canUndo, canRedo, undo, redo, onClose]);

  const showNotification = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Resolve custom background image metadata for thumbnail preview
  useEffect(() => {
    let cancelled = false;
    const syncMeta = async () => {
      if (!settings.customBgImage) {
        if (!cancelled) setBgImageMeta(null);
        return;
      }
      const meta = await resolveBgImageMeta(settings.customBgImage);
      if (!cancelled) setBgImageMeta(meta);
    };
    syncMeta();
    const unsub = subscribeBgImageChanged(() => {
      syncMeta();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [settings.customBgImage]);

  const handleBgFileUpload = useCallback(
    async (file: File) => {
      setBgUploadError(null);
      setIsBgUploading(true);
      try {
        const res = await processAndStoreBgImage(file);
        if (!res.ok) {
          setBgUploadError(res.error);
          return;
        }
        setBgImageMeta(res.meta);
        updateSettings({
          customBgImage: res.meta.id,
          customBgOpacity: settings.customBgOpacity ?? 0.55,
          customBgFit: settings.customBgFit || 'cover',
        });
        showNotification('Đã cập nhật ảnh nền mới!');
      } finally {
        setIsBgUploading(false);
      }
    },
    [settings.customBgOpacity, settings.customBgFit, updateSettings, showNotification]
  );

  const handleClearBgImage = useCallback(async () => {
    setBgUploadError(null);
    await clearStoredBgImage();
    setBgImageMeta(null);
    updateSettings({ customBgImage: '' });
    showNotification('Đã xóa ảnh nền tùy chỉnh');
  }, [updateSettings, showNotification]);

  // Support Ctrl+V paste of image when PersonalizationDrawer is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTextInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isTextInput && activeSection !== 'custom-bg') return;

      const items = e.clipboardData?.items;
      const files = e.clipboardData?.files;
      let pastedFile: File | null = null;

      if (files && files.length > 0) {
        pastedFile = files[0];
      } else if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === 'file') {
            const f = items[i].getAsFile();
            if (f) {
              pastedFile = f;
              break;
            }
          }
        }
      }

      if (!pastedFile) return;

      // Only intercept if it's an image or on custom-bg tab
      if (pastedFile.type.startsWith('image/') || activeSection === 'custom-bg') {
        e.preventDefault();
        if (activeSection !== 'custom-bg') {
          setActiveSection('custom-bg');
        }
        void handleBgFileUpload(pastedFile);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, activeSection, handleBgFileUpload]);

  // Dragging for floating compact panel
  const handleDragStart = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: floatingPos.x,
      initY: floatingPos.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      // Invert dx because we use right & bottom positioning
      setFloatingPos({
        x: Math.max(12, Math.min(window.innerWidth - 380, dragStartRef.current.initX - dx)),
        y: Math.max(12, Math.min(window.innerHeight - 540, dragStartRef.current.initY - dy)),
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Dynamic counts per preset category
  const presetCounts = useMemo(() => {
    const isFloralPreset = (p: ThemePreset) =>
      !!(p.categories?.includes('floral') || (p.patternType && p.patternType.startsWith('floral-')));
    const isAnimatedPreset = (p: ThemePreset) =>
      !!(p.categories?.includes('animated') || (p.activeEffects && p.activeEffects.length > 0));
    const hasPatternPreset = (p: ThemePreset) =>
      !!(p.patternType && p.patternType !== 'none');
    const isContrastPreset = (p: ThemePreset) =>
      !!(p.categories?.includes('contrast') || ['high-contrast', 'terminal', 'graphite'].includes(p.id));

    return {
      all: THEME_PRESETS.length,
      floral: THEME_PRESETS.filter(isFloralPreset).length,
      animated: THEME_PRESETS.filter(isAnimatedPreset).length,
      dark: THEME_PRESETS.filter((p) => p.type === 'dark').length,
      light: THEME_PRESETS.filter((p) => p.type === 'light').length,
      pattern: THEME_PRESETS.filter(hasPatternPreset).length,
      contrast: THEME_PRESETS.filter(isContrastPreset).length,
    };
  }, []);

  // Filtered Presets
  const filteredPresets = useMemo(() => {
    return THEME_PRESETS.filter((p) => {
      // Search text match
      const query = presetSearch.trim().toLowerCase();
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);

      if (!matchSearch) return false;

      // Category chip match
      if (presetFilter === 'all') return true;
      if (presetFilter === 'floral') {
        return !!(p.categories?.includes('floral') || (p.patternType && p.patternType.startsWith('floral-')));
      }
      if (presetFilter === 'animated') {
        return !!(p.categories?.includes('animated') || (p.activeEffects && p.activeEffects.length > 0));
      }
      if (presetFilter === 'dark') return p.type === 'dark';
      if (presetFilter === 'light') return p.type === 'light';
      if (presetFilter === 'pattern') {
        return !!(p.patternType && p.patternType !== 'none');
      }
      if (presetFilter === 'contrast') {
        return !!(p.categories?.includes('contrast') || ['high-contrast', 'terminal', 'graphite'].includes(p.id));
      }
      return true;
    });
  }, [presetSearch, presetFilter]);

  // Actions
  const handleRandomize = () => {
    randomizeTheme();
    showNotification('Đã tạo ngẫu nhiên một phong cách giao diện!');
  };

  const handleReset = () => {
    resetDefaults();
    showNotification('Đã khôi phục cài đặt mặc định');
  };

  const handleExport = () => {
    exportTheme();
    showNotification('Đã xuất cấu hình giao diện ra tệp JSON');
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) {
      setImportFeedback({ type: 'error', message: 'Vui lòng dán chuỗi JSON cấu hình.' });
      return;
    }
    const result = importTheme(importJsonText);
    if (result.success) {
      setImportFeedback({ type: 'success', message: result.message });
      showNotification('Nhập giao diện thành công!');
      setTimeout(() => {
        setIsExportImportOpen(false);
        setImportJsonText('');
        setImportFeedback(null);
      }, 1200);
    } else {
      setImportFeedback({ type: 'error', message: result.message });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        const res = importTheme(content);
        if (res.success) {
          setImportFeedback({ type: 'success', message: res.message });
          showNotification('Đã tải và áp dụng tệp giao diện thành công!');
          setTimeout(() => {
            setIsExportImportOpen(false);
            setImportFeedback(null);
          }, 1200);
        } else {
          setImportFeedback({ type: 'error', message: res.message });
        }
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const contrastRatio = getContrastRatio(settings.accentColor, activePreset.bgApp);

  // Navigation sections list
  const navSections: { id: PersonalizeSection; label: string; icon: React.ReactNode; hint: string }[] = [
    { id: 'presets', label: 'Mẫu có sẵn', icon: <Sparkles className="w-4 h-4" />, hint: `${THEME_PRESETS.length} mẫu thiết kế phong cách` },
    { id: 'accent', label: 'Màu nhấn', icon: <Palette className="w-4 h-4" />, hint: 'Bảng màu chính và phủ sắc thái' },
    { id: 'patterns', label: 'Nền & họa tiết', icon: <Layers className="w-4 h-4" />, hint: '30 họa tiết hoa văn & hình học SVG' },
    { id: 'effects', label: 'Hiệu ứng nền', icon: <Wand2 className="w-4 h-4" />, hint: 'Kết hợp hiệu ứng động & tương tác' },
    { id: 'custom-bg', label: 'Ảnh nền của bạn', icon: <ImageIcon className="w-4 h-4" />, hint: 'Tải ảnh nền tùy thích từ máy tính' },
    { id: 'editor', label: 'Trình soạn thảo', icon: <Code2 className="w-4 h-4" />, hint: 'Phông chữ, cỡ chữ, số dòng' },
    { id: 'layout', label: 'Bố cục & bo góc', icon: <BoxSelect className="w-4 h-4" />, hint: 'Độ bo viền và phong cách thẻ' },
    { id: 'typography', label: 'Chữ & mật độ', icon: <Type className="w-4 h-4" />, hint: 'Phông chữ giao diện và khoảng cách' },
    { id: 'sync', label: 'Hồ sơ & đồng bộ', icon: <Cloud className="w-4 h-4" />, hint: 'Sao lưu đám mây, xuất và nhập' },
  ];

  const activeEffectsList = getActiveEffectsList(settings);
  const currentEditingEffectId: EffectId | null =
    selectedConfigEffectId && activeEffectsList.includes(selectedConfigEffectId)
      ? selectedConfigEffectId
      : activeEffectsList[0] || null;

  const handleToggleEffect = (id: EffectId) => {
    const exists = activeEffectsList.includes(id);
    if (exists) {
      const next = activeEffectsList.filter((item) => item !== id);
      updateSettings({
        activeEffects: next,
        activeEffect: next[0] || 'none',
      });
      return;
    }
    if (activeEffectsList.length >= 3) {
      showNotification('Chỉ có thể kết hợp tối đa 3 hiệu ứng cùng lúc');
      return;
    }
    const next = [...activeEffectsList, id];
    setSelectedConfigEffectId(id);
    updateSettings({
      activeEffects: next,
      activeEffect: next[0],
    });
  };

  const handleClearEffects = () => {
    setSelectedConfigEffectId(null);
    updateSettings({
      activeEffects: [],
      activeEffect: 'none',
    });
  };

  const handleUpdateEffectConfig = (effectId: EffectId, patch: Partial<EffectConfig>) => {
    const current = resolveEffectConfig(settings, effectId);
    updateSettings({
      effectConfigs: {
        ...(settings.effectConfigs || {}),
        [effectId]: {
          ...current,
          ...patch,
        },
      },
    });
  };

  // =========================================================================
  // 1. FLOATING COMPACT PANEL ("Thu nhỏ để xem")
  // =========================================================================
  if (isMinimized) {
    return createPortal(
      <div
        style={{
          position: 'fixed',
          right: `${floatingPos.x}px`,
          bottom: `${floatingPos.y}px`,
          width: '360px',
          maxHeight: '520px',
          zIndex: 80,
        }}
        className="bg-elevated border border-strong rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] flex flex-col overflow-hidden text-primary animate-in zoom-in-95 duration-150 select-none"
      >
        {/* Drag Bar & Floating Header */}
        <div
          onMouseDown={handleDragStart}
          className="px-3.5 py-2.5 bg-panel border-b border-subtle flex items-center justify-between cursor-move"
          title="Kéo thả để di chuyển bảng điều khiển"
        >
          <div className="flex items-center gap-2">
            <Move className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-accent" />
              Cá nhân hóa (Thu nhỏ)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-[var(--radius-xs)] hover:bg-[var(--border-subtle)] text-secondary hover:text-primary transition-colors cursor-pointer"
              title="Mở rộng toàn màn hình"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-[var(--radius-xs)] hover:bg-[var(--border-subtle)] text-secondary hover:text-primary transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compact Quick Actions */}
        <div className="px-3 py-2 bg-app border-b border-subtle flex items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-2 py-1 rounded-[var(--radius-xs)] bg-panel border border-default hover:border-strong disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo2 className="w-3 h-3" />
              <span>Hoàn tác</span>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-2 py-1 rounded-[var(--radius-xs)] bg-panel border border-default hover:border-strong disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              title="Làm lại (Ctrl+Y)"
            >
              <Redo2 className="w-3 h-3" />
              <span>Làm lại</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRandomize}
              className="px-2 py-1 rounded-[var(--radius-xs)] bg-panel border border-default hover:border-strong text-[11px] font-medium flex items-center gap-1 cursor-pointer text-accent"
              title="Ngẫu nhiên hóa"
            >
              <Shuffle className="w-3 h-3" />
              <span>Ngẫu nhiên</span>
            </button>
            <button
              onClick={toggleThemeMode}
              className="p-1 rounded-[var(--radius-xs)] bg-panel border border-default hover:border-strong text-secondary hover:text-primary cursor-pointer"
              title="Chuyển chế độ Sáng/Tối"
            >
              {settings.mode === 'dark' ? <Moon className="w-3.5 h-3.5 text-accent" /> : <Sun className="w-3.5 h-3.5 text-warning" />}
            </button>
          </div>
        </div>

        {/* Compact Content Area */}
        <div className="p-3 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* Quick Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-secondary">Mẫu giao diện</span>
              <span className="text-[10px] text-muted font-mono">{activePreset.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {THEME_PRESETS.slice(0, 6).map((p) => {
                const isSelected = settings.presetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`p-1.5 rounded-[var(--radius-sm)] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--accent-base)] bg-accent-soft text-accent font-semibold'
                        : 'border-default hover:border-strong bg-panel text-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div style={{ backgroundColor: p.accent }} className="w-2.5 h-2.5 rounded-full" />
                      <span className="text-[9px] font-mono opacity-70">{p.type === 'dark' ? 'Tối' : 'Sáng'}</span>
                    </div>
                    <span className="text-[11px] truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Accent Swatches */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-secondary">Màu điểm nhấn</span>
              <span className="text-[10px] text-muted font-mono">{settings.accentColor}</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {ACCENT_SWATCHES.slice(0, 12).map((s) => {
                const isCurrent = settings.accentColor.toLowerCase() === s.hex.toLowerCase();
                return (
                  <button
                    key={s.hex}
                    onClick={() => updateSettings({ accentColor: s.hex })}
                    style={{ backgroundColor: s.hex }}
                    className={`h-7 rounded-[var(--radius-xs)] flex items-center justify-center cursor-pointer transition-transform ${
                      isCurrent ? 'ring-2 ring-white scale-105' : 'hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                    title={s.name}
                  >
                    {isCurrent && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Radius */}
          <div>
            <span className="font-semibold text-secondary block mb-1.5">Bo góc</span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'none', label: '0px' },
                { id: 'sm', label: '4px' },
                { id: 'md', label: '10px' },
                { id: 'lg', label: '16px' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => updateSettings({ radius: r.id as RadiusStyle })}
                  className={`py-1 text-[11px] rounded-[var(--radius-xs)] border text-center transition-all cursor-pointer ${
                    settings.radius === r.id
                      ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold'
                      : 'bg-panel text-secondary border-default'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Expand Bar */}
        <div className="p-2.5 bg-panel border-t border-subtle flex items-center justify-between">
          <span className="text-[10px] text-muted">Đang theo dõi thay đổi trực tiếp</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-xs)] bg-accent text-accent-on hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Mở rộng cửa sổ</span>
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // =========================================================================
  // 2. FULL WIDE WINDOW (full-screen sheet on mobile, 1120x760 on tablet/desktop)
  // =========================================================================
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-5 sm:pt-[max(0.5rem,var(--safe-top))] sm:pb-[max(0.5rem,var(--safe-bottom))] bg-overlay overflow-hidden animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={windowRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-viewport sm:w-[min(1120px,94vw)] sm:h-[min(760px,calc(var(--app-height,100dvh)*0.88-var(--safe-top)-var(--safe-bottom)))] pt-safe pb-safe sm:pt-0 sm:pb-0 bg-elevated glass-panel border-0 sm:border border-default rounded-none sm:rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] flex flex-col overflow-hidden text-primary animate-in zoom-in-95 duration-200"
      >
        {/* ========================================================= */}
        {/* HEADER: Actions, History, Expand/Collapse & Close         */}
        {/* ========================================================= */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 bg-panel border-b border-subtle flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          {/* Left Title & Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-accent-soft text-accent flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-primary truncate">
                  Cá nhân hóa giao diện
                </h2>
                <span className="hidden sm:inline-block text-[11px] font-mono text-muted">
                  • {THEME_PRESETS.length} mẫu giao diện
                </span>
              </div>
              <p className="text-xs text-muted truncate hidden sm:block">
                Tùy biến màu sắc, phông chữ, họa tiết hoa văn và hiệu ứng trực tiếp
              </p>
            </div>
          </div>

          {/* Right Action Toolbar */}
          <div className="touch-gap flex items-center gap-1 sm:gap-2 shrink-0 max-w-full overflow-x-auto no-scrollbar ml-auto">
            {/* Undo */}
            <button
              onClick={undo}
              disabled={!canUndo}
              className="touch-target p-1.5 sm:px-2.5 sm:py-1 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-strong disabled:opacity-40 text-xs font-medium flex items-center justify-center gap-1 text-secondary hover:text-primary transition-all cursor-pointer"
              title="Hoàn tác (Ctrl+Z)"
              aria-label="Hoàn tác"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Hoàn tác</span>
            </button>

            {/* Redo */}
            <button
              onClick={redo}
              disabled={!canRedo}
              className="touch-target p-1.5 sm:px-2.5 sm:py-1 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-strong disabled:opacity-40 text-xs font-medium flex items-center justify-center gap-1 text-secondary hover:text-primary transition-all cursor-pointer"
              title="Làm lại (Ctrl+Y)"
              aria-label="Làm lại"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Làm lại</span>
            </button>

            {/* Randomize */}
            <button
              onClick={handleRandomize}
              className="touch-target p-1.5 sm:px-2.5 sm:py-1 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-strong text-xs font-medium flex items-center justify-center gap-1 text-accent hover:underline transition-all cursor-pointer"
              title="Tạo phối màu & kiểu dáng ngẫu nhiên"
              aria-label="Ngẫu nhiên"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ngẫu nhiên</span>
            </button>

            {/* Reset Defaults */}
            <button
              onClick={handleReset}
              className="touch-target p-1.5 sm:px-2.5 sm:py-1 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-strong text-xs font-medium flex items-center justify-center gap-1 text-secondary hover:text-primary transition-all cursor-pointer"
              title="Khôi phục cài đặt gốc"
              aria-label="Khôi phục mặc định"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mặc định</span>
            </button>

            {/* Export / Import Button */}
            <button
              onClick={() => setIsExportImportOpen(true)}
              className="touch-target p-1.5 sm:px-2.5 sm:py-1 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-strong text-xs font-medium flex items-center justify-center gap-1 text-secondary hover:text-primary transition-all cursor-pointer"
              title="Xuất hoặc nhập giao diện JSON"
              aria-label="Xuất hoặc nhập giao diện"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Xuất / Nhập</span>
            </button>

            <div className="h-4 w-[1px] bg-subtle mx-0.5" />

            {/* Mobile Toggle for Right Mockup Preview */}
            <button
              type="button"
              onClick={() => setShowMobilePreview((v) => !v)}
              aria-pressed={showMobilePreview}
              className={`md:hidden touch-target-h px-2.5 py-1 rounded-[var(--radius-xs)] border text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                showMobilePreview
                  ? 'bg-accent-soft text-accent border-[var(--accent-base)]'
                  : 'bg-elevated text-secondary border-default hover:text-primary'
              }`}
              title="Hiện/ẩn mô phỏng trực tiếp"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mô phỏng</span>
            </button>

            {/* Temporary Stage 1 Test Pattern Trigger */}
            {onTriggerTestPattern && (
              <button
                type="button"
                onClick={onTriggerTestPattern}
                className="touch-target-h px-2.5 py-1 rounded-[var(--radius-xs)] bg-accent text-accent-on hover:bg-[var(--accent-hover)] text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs whitespace-nowrap"
                title="Hiển thị mẫu sọc chéo thử nghiệm 3 giây để kiểm tra lớp nền"
                aria-label="Thử nghiệm nền"
              >
                <Sparkles className="w-3.5 h-3.5 sm:hidden" />
                <Eye className="w-3.5 h-3.5 hidden sm:inline" />
                <span className="hidden sm:inline">Thử nghiệm nền</span>
              </button>
            )}

            {/* Minimize to Floating Panel ("Thu nhỏ để xem") */}
            <button
              onClick={() => setIsMinimized(true)}
              className="hidden sm:flex touch-target-h px-2 py-1 rounded-[var(--radius-xs)] bg-accent-soft text-accent border border-[var(--accent-base)]/30 hover:bg-accent-soft/80 text-xs font-semibold items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
              title="Thu nhỏ thành bảng điều khiển nổi để quan sát trực tiếp toàn màn hình"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Thu nhỏ để xem</span>
            </button>

            {/* Close X */}
            <button
              onClick={onClose}
              className="touch-target p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--border-subtle)] text-muted hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
              title="Đóng cửa sổ (Esc)"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: 3-COLUMN DESKTOP LAYOUT                        */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* ======================================================= */}
          {/* COLUMN 1: LEFT NAVIGATION (~200px)                      */}
          {/* ======================================================= */}
          <div className="w-full md:w-[210px] md:min-w-[210px] bg-panel border-b md:border-b-0 md:border-r border-subtle flex flex-col shrink-0 overflow-x-auto no-scrollbar md:overflow-y-auto">
            {/* Nav Items */}
            <nav className="p-2 touch-gap space-y-0 md:space-y-1 flex md:flex-col overflow-x-auto no-scrollbar md:overflow-x-visible shrink-0 flex-1">
              {navSections.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`touch-target-h w-auto md:w-full px-3 py-2 text-xs font-medium rounded-[var(--radius-sm)] flex items-center gap-2 sm:gap-2.5 transition-all text-left whitespace-nowrap flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-accent-soft text-accent font-semibold border border-[var(--accent-base)]/40 shadow-xs'
                        : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
                    }`}
                  >
                    <span className={isActive ? 'text-accent' : 'text-muted'}>{sec.icon}</span>
                    <div className="min-w-0 md:flex-1">
                      <div className="truncate">{sec.label}</div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Quick Dark/Light Switch in Nav Footer */}
            <div className="p-2.5 border-t border-subtle hidden md:block shrink-0">
              <button
                onClick={toggleThemeMode}
                className="w-full px-3 py-2 rounded-[var(--radius-sm)] bg-elevated border border-default hover:border-strong text-xs font-medium flex items-center justify-between text-primary cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  {settings.mode === 'dark' ? <Moon className="w-3.5 h-3.5 text-accent" /> : <Sun className="w-3.5 h-3.5 text-warning" />}
                  <span>{settings.mode === 'dark' ? 'Chế độ Tối' : 'Chế độ Sáng'}</span>
                </span>
                <span className="text-[10px] text-muted uppercase font-mono">{settings.mode}</span>
              </button>
            </div>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 2: CENTER CONTROLS (flex-1, scrollable)          */}
          {/* ======================================================= */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 min-w-0 bg-transparent"
          >
            {/* Notification Toast */}
            {toastMessage && (
              <div className="p-2.5 rounded-[var(--radius-sm)] bg-panel border border-[var(--accent-base)] text-accent flex items-center justify-between text-xs animate-in fade-in duration-150">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {toastMessage}
                </span>
                {canUndo && (
                  <button onClick={undo} className="text-xs font-bold underline cursor-pointer">
                    Hoàn tác
                  </button>
                )}
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* SECTION 1: MẪU CÓ SẴN (PRESETS)                       */}
            {/* ----------------------------------------------------- */}
            {activeSection === 'presets' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-subtle">
                  <div>
                    <h3 className="text-sm font-bold text-primary">Mẫu giao diện hoàn chỉnh</h3>
                    <p className="text-xs text-muted">
                      Chọn nhanh bộ giao diện được phối sẵn màu sắc, bo góc và phông chữ đồng nhất ({THEME_PRESETS.length} mẫu)
                    </p>
                  </div>

                  {/* Dark/Light Quick Toggle */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={toggleThemeMode}
                      className="touch-target-h px-3 py-1.5 rounded-[var(--radius-sm)] bg-elevated border border-default hover:border-strong text-xs font-medium flex items-center gap-1.5 text-primary cursor-pointer"
                    >
                      {settings.mode === 'dark' ? (
                        <>
                          <Moon className="w-3.5 h-3.5 text-accent" />
                          <span>Đang bật nền Tối</span>
                        </>
                      ) : (
                        <>
                          <Sun className="w-3.5 h-3.5 text-warning" />
                          <span>Đang bật nền Sáng</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                      type="search"
                      inputMode="search"
                      enterKeyHint="search"
                      autoComplete="off"
                      value={presetSearch}
                      onChange={(e) => setPresetSearch(e.target.value)}
                      placeholder="Tìm kiếm mẫu giao diện theo tên hoặc mô tả..."
                      className="w-full h-10 sm:h-8 pl-8 pr-8 text-xs bg-panel border border-default rounded-[var(--radius-sm)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent-base)]"
                    />
                    {presetSearch && (
                      <button
                        onClick={() => setPresetSearch('')}
                        className="touch-hit-expand absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                        aria-label="Xóa tìm kiếm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Chips with Dynamic Counts */}
                  <div className="touch-gap flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: `Tất cả (${presetCounts.all})` },
                      { id: 'floral', label: `Hoa & thiên nhiên (${presetCounts.floral})` },
                      { id: 'animated', label: `Động (${presetCounts.animated})` },
                      { id: 'dark', label: `Tối (${presetCounts.dark})` },
                      { id: 'light', label: `Sáng (${presetCounts.light})` },
                      { id: 'pattern', label: `Có họa tiết (${presetCounts.pattern})` },
                      { id: 'contrast', label: `Tương phản cao (${presetCounts.contrast})` },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setPresetFilter(chip.id as typeof presetFilter)}
                        className={`touch-target-h px-2.5 py-1 text-xs font-medium rounded-[var(--radius-xs)] transition-all cursor-pointer whitespace-nowrap ${
                          presetFilter === chip.id
                            ? 'bg-accent text-accent-on font-semibold'
                            : 'bg-panel border border-default text-secondary hover:text-primary'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {filteredPresets.map((p) => {
                    const isSelected = settings.presetId === p.id;
                    const miniPattern =
                      p.patternType && p.patternType !== 'none'
                        ? buildStaticPatternStyle({
                            patternType: p.patternType,
                            opacity: Math.min(0.42, (p.patternOpacity ?? 0.22) * 1.5),
                            scale: 0.72,
                            angle: p.patternAngle ?? 0,
                            density: p.patternDensity ?? 1,
                            colorMode: p.patternColorMode || 'palette',
                            customColor: p.patternColor,
                            accentColor: p.accent,
                            accentColor2: p.accent2,
                            vignette: false,
                          })
                        : null;
                    const hasAnim = !!(p.activeEffects && p.activeEffects.length > 0);
                    const patternName = p.patternType && p.patternType !== 'none'
                      ? STATIC_PATTERN_DEFINITIONS.find((pat) => pat.id === p.patternType)?.name
                      : null;
                    const effectNames = hasAnim
                      ? p.activeEffects!
                          .map((effId) => EFFECT_CATALOG.find((e) => e.id === effId)?.name || effId)
                          .join(' + ')
                      : null;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        data-preset-id={p.id}
                        onClick={() => applyPreset(p.id)}
                        className={`p-3 rounded-[var(--radius-md)] border text-left flex flex-col gap-2.5 transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-[var(--accent-base)] ring-2 ring-[var(--accent-base)]/30 bg-elevated shadow-xs'
                            : 'border-default hover:border-strong bg-panel hover:bg-elevated'
                        }`}
                      >
                        {/* Mini visual mockup of preset with real SVG pattern preview */}
                        <div
                          style={{
                            backgroundColor: p.bgApp,
                            backgroundImage:
                              p.bgType === 'mesh' || p.bgType === 'gradient'
                                ? `radial-gradient(circle at 20% 25%, ${p.accent}33 0%, transparent 60%), radial-gradient(circle at 85% 80%, ${p.accent2}2b 0%, transparent 60%)`
                                : undefined,
                          }}
                          className="w-full h-16 rounded-[var(--radius-xs)] border border-subtle p-2 flex flex-col justify-between overflow-hidden relative"
                        >
                          {miniPattern && (
                            <div
                              aria-hidden="true"
                              style={{
                                position: 'absolute',
                                inset: 0,
                                pointerEvents: 'none',
                                backgroundImage: miniPattern.backgroundImage,
                                backgroundSize: miniPattern.backgroundSize,
                                backgroundRepeat: 'repeat',
                                opacity: Math.min(0.6, miniPattern.opacity * 1.4),
                              }}
                            />
                          )}
                          <div className="relative z-[1] flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <div style={{ backgroundColor: p.accent }} className="w-3 h-3 rounded-full shadow-xs" />
                              <div style={{ backgroundColor: p.accent2 }} className="w-2 h-2 rounded-full opacity-80" />
                            </div>
                            <div className="flex items-center gap-1">
                              {hasAnim && (
                                <span
                                  style={{
                                    color: p.accent,
                                    backgroundColor: `${p.bgPanel}d9`,
                                    borderColor: `${p.accent}55`,
                                  }}
                                  className="px-1.5 py-0.5 rounded-[var(--radius-xs)] border text-[9px] font-semibold"
                                >
                                  Động
                                </span>
                              )}
                              <span
                                style={{ color: p.textSecondary, backgroundColor: `${p.bgPanel}cc` }}
                                className="px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[9px] font-mono font-bold"
                              >
                                {p.type === 'dark' ? 'Tối' : 'Sáng'}
                              </span>
                            </div>
                          </div>
                          <div className="relative z-[1] space-y-1">
                            <div
                              style={{ backgroundColor: p.accent }}
                              className="h-1.5 w-3/4 rounded-full opacity-90"
                            />
                            <div
                              style={{ backgroundColor: p.textMuted }}
                              className="h-1 w-1/2 rounded-full opacity-50"
                            />
                          </div>
                        </div>

                        {/* Title, metadata & description */}
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-accent' : 'text-primary'}`}>
                              {p.name}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-accent shrink-0">
                                <Check className="w-3.5 h-3.5" />
                                <span>Đang dùng</span>
                              </span>
                            )}
                          </div>
                          <p
                            className="text-[11px] text-muted line-clamp-2 mt-1 leading-relaxed"
                            title={p.description}
                          >
                            {p.description}
                          </p>
                          {(patternName || effectNames) && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                              {patternName && (
                                <span className="px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-elevated border border-subtle text-secondary">
                                  Họa tiết: {patternName}
                                </span>
                              )}
                              {effectNames && (
                                <span className="px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-accent-soft text-accent font-medium">
                                  {effectNames}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {filteredPresets.length === 0 && (
                  <div className="p-8 text-center bg-panel border border-dashed border-default rounded-[var(--radius-md)] text-muted text-xs">
                    Không tìm thấy mẫu giao diện nào phù hợp với bộ lọc.
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* SECTION 2: MÀU NHẤN (ACCENT COLORS)                   */}
            {/* ----------------------------------------------------- */}
            {activeSection === 'accent' && (
              <div className="space-y-5">
                <div className="pb-2 border-b border-subtle">
                  <h3 className="text-sm font-bold text-primary">Màu điểm nhấn thị giác</h3>
                  <p className="text-xs text-muted">
                    Xác định sắc thái cho nút bấm, đường liên kết, thẻ trạng thái và các chi tiết nổi bật
                  </p>
                </div>

                {/* 16 Swatches */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-semibold text-secondary">
                      16 Bảng màu điểm nhấn tuyển chọn
                    </label>
                    <button
                      onClick={() => {
                        const candidates = ACCENT_SWATCHES.filter((s) => s.hex !== settings.accentColor);
                        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
                        updateSettings({ accentColor: chosen.hex });
                      }}
                      className="touch-target-h px-1 text-xs text-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Chọn ngẫu nhiên</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {ACCENT_SWATCHES.map((swatch) => {
                      const isCurrent = settings.accentColor.toLowerCase() === swatch.hex.toLowerCase();
                      return (
                        <button
                          key={swatch.hex}
                          onClick={() => updateSettings({ accentColor: swatch.hex })}
                          className={`touch-target-h p-2 rounded-[var(--radius-sm)] border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            isCurrent
                              ? 'border-[var(--accent-base)] bg-elevated shadow-xs ring-1 ring-[var(--accent-base)]/40'
                              : 'border-default hover:border-strong bg-panel'
                          }`}
                        >
                          <div
                            style={{ backgroundColor: swatch.hex }}
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                          >
                            {isCurrent && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-primary truncate">{swatch.name}</div>
                            <div className="text-[10px] font-mono text-muted">{swatch.hex}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Hex Color Picker */}
                <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary">Màu điểm nhấn tùy chọn (Hex code)</label>
                    <span className="text-[11px] text-muted font-mono">{settings.accentColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateSettings({ accentColor: e.target.value })}
                      className="touch-target w-11 h-11 sm:w-9 sm:h-9 rounded-[var(--radius-xs)] border border-default cursor-pointer p-0.5 bg-elevated"
                    />
                  </div>
                </div>

                {/* Tint Neutrals */}
                <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)]">
                  <Switch
                    checked={settings.tintNeutrals}
                    onChange={(checked) => updateSettings({ tintNeutrals: checked })}
                    label="Nhuộm màu nền theo màu nhấn (Tint Neutrals)"
                    description="Hòa quyện sắc thái màu nhấn tinh tế (3-8%) vào các bề mặt nền và đường viền để tạo tổng thể giao diện hài hòa, tự nhiên."
                  />
                </div>

                {/* WCAG Contrast Meter */}
                <div className="p-3 bg-panel border border-default rounded-[var(--radius-sm)] flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-primary block">Độ tương phản tiếp cận WCAG</span>
                    <span className="text-[11px] text-muted">
                      Tỉ lệ tương phản giữa màu nhấn và màu nền ứng dụng: {contrastRatio.toFixed(2)}:1
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-[var(--radius-xs)] bg-accent-soft text-accent text-xs font-bold font-mono flex-shrink-0">
                    {contrastRatio >= 4.5 ? 'Đạt chuẩn AA / AAA' : 'Độ tương phản thấp'}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* SECTION 3: NỀN & HỌA TIẾT (GIAI ĐOẠN 2)                */}
            {/* ----------------------------------------------------- */}
            {activeSection === 'patterns' && (() => {
              const normalizedCurrentPattern = normalizePatternId(settings.patternType);
              const visiblePatterns = STATIC_PATTERN_DEFINITIONS.filter((p) =>
                patternGroupFilter === 'all' ? true : p.group === patternGroupFilter
              );
              const floralCount = STATIC_PATTERN_DEFINITIONS.filter((p) => p.group === 'floral').length;
              const geomCount = STATIC_PATTERN_DEFINITIONS.filter((p) => p.group === 'geometric').length;
              const cappedOpacityPercent = Math.min(60, Math.round((settings.patternOpacity ?? 0.18) * 100));

              return (
                <div className="space-y-5">
                  <div className="pb-2 border-b border-subtle">
                    <h3 className="text-sm font-bold text-primary">Nền, độ mờ bảng & họa tiết tĩnh</h3>
                    <p className="text-xs text-muted">
                      Chọn nền cơ sở, điều chỉnh độ trong suốt bảng điều khiển và kết hợp 30 họa tiết SVG hoa lá / hình học
                    </p>
                  </div>

                  {/* Độ trong suốt bảng điều khiển + Thử nghiệm nền */}
                  <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] space-y-3">
                    <Slider
                      value={Math.round((settings.surfaceOpacity ?? 0.88) * 100)}
                      min={40}
                      max={100}
                      step={2}
                      onChange={(val) => updateSettings({ surfaceOpacity: val / 100 })}
                      label="Độ trong suốt của bảng điều khiển"
                      valueDisplay={`${Math.round((settings.surfaceOpacity ?? 0.88) * 100)}%`}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-subtle">
                      <span className="text-[11px] text-muted leading-relaxed">
                        Vùng soạn thảo giữ tối thiểu 88% để mã nguồn luôn rõ nét.
                      </span>
                      {onTriggerTestPattern && (
                        <button
                          type="button"
                          onClick={onTriggerTestPattern}
                          className="touch-target-h px-3 py-1.5 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-strong text-xs font-semibold text-primary flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5 text-accent" />
                          <span>Thử nghiệm nền</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Kiểu nền cơ sở */}
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">
                      Kiểu nền cơ sở
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'solid', label: 'Màu đơn sắc' },
                        { id: 'gradient', label: 'Chuyển sắc dịu' },
                        { id: 'mesh', label: 'Lưới cực quang' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => updateSettings({ bgType: b.id as 'solid' | 'gradient' | 'mesh' })}
                          className={`touch-target-h p-2.5 text-xs font-medium rounded-[var(--radius-sm)] border text-center transition-all cursor-pointer ${
                            (settings.bgType || 'solid') === b.id
                              ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold'
                              : 'bg-panel text-secondary hover:text-primary border-default'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bộ lọc nhóm họa tiết */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-secondary">
                        Thư viện họa tiết tĩnh ({STATIC_PATTERN_DEFINITIONS.length} mẫu)
                      </label>
                      <div className="touch-gap flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'all', label: `Tất cả (${STATIC_PATTERN_DEFINITIONS.length})` },
                          { id: 'floral', label: `Hoa & lá (${floralCount})` },
                          { id: 'geometric', label: `Hình học (${geomCount})` },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setPatternGroupFilter(tab.id as 'all' | PatternGroup)}
                            className={`touch-target-h px-2.5 py-1 rounded-[var(--radius-xs)] text-[11px] font-medium border cursor-pointer transition-colors ${
                              patternGroupFilter === tab.id
                                ? 'bg-accent text-accent-on border-transparent font-semibold'
                                : 'bg-panel text-secondary hover:text-primary border-default'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                        {normalizedCurrentPattern !== 'none' && (
                          <button
                            type="button"
                            onClick={() => updateSettings({ patternType: 'none' })}
                            className="touch-target-h px-2.5 py-1 rounded-[var(--radius-xs)] text-[11px] font-medium bg-panel border border-default text-danger hover:border-strong cursor-pointer"
                          >
                            Tắt họa tiết
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Lưới thẻ xem trước họa tiết */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <button
                        type="button"
                        onClick={() => updateSettings({ patternType: 'none' })}
                        className={`p-2 rounded-[var(--radius-sm)] border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                          normalizedCurrentPattern === 'none'
                            ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold shadow-xs'
                            : 'bg-panel text-secondary hover:text-primary border-default'
                        }`}
                      >
                        <div className="w-full h-14 rounded-[calc(var(--radius-sm)-2px)] bg-app border border-subtle flex items-center justify-center text-[11px] text-muted">
                          Không có
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs truncate">Tắt họa tiết</span>
                          {normalizedCurrentPattern === 'none' && (
                            <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                          )}
                        </div>
                      </button>

                      {visiblePatterns.map((pat) => {
                        const isSelected = normalizedCurrentPattern === pat.id;
                        return (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => updateSettings({ patternType: pat.id as PatternType })}
                            title={pat.description}
                            className={`p-2 rounded-[var(--radius-sm)] border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold shadow-xs'
                                : 'bg-panel text-secondary hover:text-primary border-default hover:border-strong'
                            }`}
                          >
                            <PatternThumbnail
                              patternType={pat.id}
                              accentColor={settings.accentColor}
                              accentColor2={settings.accentColor2}
                              colorMode={settings.patternColorMode || 'palette'}
                              customColor={settings.patternColor}
                            />
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs truncate">{pat.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tùy chỉnh họa tiết đang bật */}
                  {normalizedCurrentPattern !== 'none' && (
                    <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-subtle">
                        <span className="text-xs font-bold text-primary">Tùy chỉnh họa tiết đang chọn</span>
                        <div className="touch-gap flex flex-wrap items-center gap-1.5">
                          {[
                            { id: 'palette', label: 'Bộ màu riêng' },
                            { id: 'accent', label: 'Theo màu nhấn' },
                            { id: 'custom', label: 'Tùy chọn' },
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() =>
                                updateSettings({ patternColorMode: mode.id as EffectColorMode })
                              }
                              className={`touch-target-h px-2 py-1 rounded-[var(--radius-xs)] text-[11px] font-medium border cursor-pointer ${
                                (settings.patternColorMode || 'palette') === mode.id
                                  ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-semibold'
                                  : 'bg-elevated text-secondary border-default hover:text-primary'
                              }`}
                            >
                              {mode.label}
                            </button>
                          ))}
                          {(settings.patternColorMode || 'palette') === 'custom' && (
                            <input
                              type="color"
                              value={settings.patternColor || settings.accentColor}
                              onChange={(e) => updateSettings({ patternColor: e.target.value })}
                              className="touch-target w-9 h-9 sm:w-6 sm:h-6 rounded-[var(--radius-xs)] border border-default bg-transparent cursor-pointer"
                              aria-label="Chọn màu họa tiết"
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <Slider
                          value={cappedOpacityPercent}
                          min={5}
                          max={60}
                          step={5}
                          onChange={(val) => updateSettings({ patternOpacity: Math.min(0.6, val / 100) })}
                          label="Độ đậm nhạt (Tối đa 60%)"
                          valueDisplay={`${cappedOpacityPercent}%`}
                        />
                        <Slider
                          value={Math.round((settings.patternScale ?? 1) * 100)}
                          min={50}
                          max={250}
                          step={10}
                          onChange={(val) => updateSettings({ patternScale: val / 100 })}
                          label="Kích thước họa tiết"
                          valueDisplay={`${Math.round((settings.patternScale ?? 1) * 100)}%`}
                        />
                        <Slider
                          value={Math.round(settings.patternAngle ?? 0)}
                          min={0}
                          max={360}
                          step={15}
                          onChange={(val) => updateSettings({ patternAngle: val })}
                          label="Góc xoay"
                          valueDisplay={`${Math.round(settings.patternAngle ?? 0)}°`}
                        />
                        <Slider
                          value={Math.round((settings.patternDensity ?? 1) * 100)}
                          min={50}
                          max={200}
                          step={10}
                          onChange={(val) => updateSettings({ patternDensity: val / 100 })}
                          label="Mật độ phân bố"
                          valueDisplay={`${Math.round((settings.patternDensity ?? 1) * 100)}%`}
                        />
                      </div>

                      <div className="pt-2 border-t border-subtle">
                        <Switch
                          checked={settings.patternVignette ?? true}
                          onChange={(checked) => updateSettings({ patternVignette: checked })}
                          label="Làm mờ dịu vùng trung tâm"
                          description="Giảm độ gắt của họa tiết ở giữa khu vực làm việc và giữ rõ nét dần ra viền"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ----------------------------------------------------- */}
            {/* SECTION 4: ẢNH NỀN CỦA BẠN (GIAI ĐOẠN 4)              */}
            {/* ----------------------------------------------------- */}
            {activeSection === 'custom-bg' && (
              <div className="space-y-5">
                <div className="pb-2 border-b border-subtle">
                  <h3 className="text-sm font-bold text-primary">Ảnh nền cá nhân của bạn</h3>
                  <p className="text-xs text-muted">
                    <span className="shortcut-hint">Tải ảnh từ máy tính, kéo thả hoặc nhấn Ctrl+V để dán ảnh trực tiếp</span>
                    <span className="touch-only-hint hidden">Chọn ảnh từ thiết bị hoặc thư viện ảnh của bạn</span>{' '}
                    (PNG, JPEG, WebP, GIF tối đa 15 MB)
                  </p>
                </div>

                {/* Vùng chọn tệp & Kéo thả (dùng label htmlFor + sr-only input) */}
                <div
                  data-testid="bg-upload-dropzone"
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsBgDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsBgDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setIsBgDragging(false);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsBgDragging(false);
                    const file = e.dataTransfer?.files?.[0];
                    if (file) {
                      void handleBgFileUpload(file);
                    }
                  }}
                  className={`rounded-[var(--radius-md)] border-2 border-dashed p-5 text-center transition-all ${
                    isBgDragging
                      ? 'border-[var(--accent-base)] bg-accent-soft'
                      : 'border-default bg-panel hover:border-strong'
                  }`}
                >
                  <input
                    id="bg-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      // Reset value ngay để có thể chọn lại đúng cùng một tệp
                      e.target.value = '';
                      if (file) {
                        void handleBgFileUpload(file);
                      }
                    }}
                  />

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-11 h-11 rounded-[var(--radius-md)] bg-accent-soft text-accent flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-primary">
                        {isBgDragging
                          ? 'Thả tệp ảnh vào đây để áp dụng ngay'
                          : isBgUploading
                          ? 'Đang xử lý và hiển thị ảnh nền...'
                          : 'Kéo thả ảnh vào đây hoặc chọn tệp từ thiết bị'}
                      </p>
                      <p className="text-[11px] text-muted">
                        Hỗ trợ PNG, JPEG, WebP, GIF (tối đa 15 MB, không hỗ trợ SVG).
                        <span className="shortcut-hint">
                          {' '}
                          Có thể nhấn{' '}
                          <kbd className="px-1.5 py-0.5 rounded bg-elevated border border-default font-mono text-[10px]">
                            Ctrl+V
                          </kbd>{' '}
                          để dán ảnh từ bộ nhớ tạm.
                        </span>
                      </p>
                    </div>
                    <label
                      htmlFor="bg-file"
                      className="touch-target-h inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] bg-accent text-accent-on hover:bg-[var(--accent-hover)] text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>{settings.customBgImage ? 'Đổi ảnh nền khác' : 'Chọn ảnh từ thiết bị'}</span>
                    </label>
                  </div>
                </div>

                {/* Thông báo lỗi tiếng Việt rõ ràng */}
                {bgUploadError && (
                  <div
                    role="alert"
                    data-testid="bg-upload-error"
                    className="p-3 rounded-[var(--radius-sm)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-danger text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{bgUploadError}</span>
                  </div>
                )}

                {/* Thẻ xem trước & thông tin ảnh hiện tại */}
                {settings.customBgImage && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-md)] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-primary block truncate">
                            {bgImageMeta?.name || 'Ảnh nền đang áp dụng'}
                          </span>
                          <span className="text-[11px] text-muted">
                            {bgImageMeta
                              ? [
                                  bgImageMeta.width && bgImageMeta.height
                                    ? `${bgImageMeta.width} × ${bgImageMeta.height} px`
                                    : null,
                                  bgImageMeta.size ? formatBytesVi(bgImageMeta.size) : null,
                                  bgImageMeta.persistedIn === 'indexeddb'
                                    ? 'Lưu bền vững (IndexedDB)'
                                    : bgImageMeta.persistedIn === 'localstorage'
                                    ? 'Lưu bộ nhớ trình duyệt'
                                    : 'Hiển thị tức thì trong phiên',
                                ]
                                  .filter(Boolean)
                                  .join(' • ')
                              : 'Đang tải xem trước ảnh...'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleClearBgImage()}
                          className="touch-target-h px-2.5 py-1.5 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-[var(--color-danger)] text-xs font-medium text-danger flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa ảnh nền</span>
                        </button>
                      </div>

                      {/* Khung xem trước trực tiếp */}
                      {bgImageMeta?.url && (
                        <div
                          className="w-full h-36 rounded-[var(--radius-sm)] border border-subtle overflow-hidden relative bg-app"
                          aria-label="Xem trước ảnh nền"
                        >
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundImage: `url("${bgImageMeta.url}")`,
                              backgroundPosition: 'center',
                              backgroundRepeat: (settings.customBgFit || 'cover') === 'tile' ? 'repeat' : 'no-repeat',
                              backgroundSize:
                                (settings.customBgFit || 'cover') === 'tile'
                                  ? '64px auto'
                                  : settings.customBgFit || 'cover',
                              opacity: settings.customBgOpacity ?? 0.5,
                              filter:
                                (settings.customBgBlur ?? 0) > 0
                                  ? `blur(${Math.min(12, (settings.customBgBlur ?? 0) * 0.6)}px)`
                                  : undefined,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Tùy chỉnh hiển thị ảnh nền */}
                    <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] space-y-4">
                      <Slider
                        value={Math.round((settings.customBgOpacity ?? 0.5) * 100)}
                        min={10}
                        max={100}
                        step={5}
                        onChange={(val) => updateSettings({ customBgOpacity: val / 100 })}
                        label="Độ rõ ảnh nền"
                        valueDisplay={`${Math.round((settings.customBgOpacity ?? 0.5) * 100)}%`}
                      />

                      <Slider
                        value={Math.round(settings.customBgBlur ?? 0)}
                        min={0}
                        max={24}
                        step={1}
                        onChange={(val) => updateSettings({ customBgBlur: val })}
                        label="Độ mờ hậu cảnh (Blur)"
                        valueDisplay={`${Math.round(settings.customBgBlur ?? 0)}px`}
                      />

                      <div>
                        <label className="block text-xs font-semibold text-secondary mb-2">
                          Chế độ hiển thị ảnh
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'cover', label: 'Phủ kín khung (Cover)' },
                            { id: 'contain', label: 'Vừa trọn ảnh (Contain)' },
                            { id: 'tile', label: 'Lặp gạch lát (Tile)' },
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() =>
                                updateSettings({
                                  customBgFit: mode.id as 'cover' | 'contain' | 'tile',
                                })
                              }
                              className={`touch-target-h p-2 text-xs font-medium rounded-[var(--radius-sm)] border text-center transition-all cursor-pointer ${
                                (settings.customBgFit || 'cover') === mode.id
                                  ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold'
                                  : 'bg-elevated text-secondary hover:text-primary border-default'
                              }`}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-subtle">
                        <Slider
                          value={Math.round((settings.surfaceOpacity ?? 0.88) * 100)}
                          min={40}
                          max={100}
                          step={2}
                          onChange={(val) => updateSettings({ surfaceOpacity: val / 100 })}
                          label="Độ trong suốt bảng điều khiển (để lộ ảnh nền)"
                          valueDisplay={`${Math.round((settings.surfaceOpacity ?? 0.88) * 100)}%`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* SECTION 5: TRÌNH SOẠN THẢO (EDITOR)                   */}
            {/* ----------------------------------------------------- */}
            {activeSection === 'editor' && (
              <div className="space-y-5">
                <div className="pb-2 border-b border-subtle">
                  <h3 className="text-sm font-bold text-primary">Cấu hình trình soạn thảo mã nguồn</h3>
                  <p className="text-xs text-muted">
                    Điều chỉnh phông chữ lập trình, cỡ chữ, số dòng và chế độ ngắt dòng tự động
                  </p>
                </div>

                {/* Font Size Slider */}
                <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)]">
                  <Slider
                    value={settings.editorFontSize}
                    min={11}
                    max={20}
                    step={0.5}
                    onChange={(val) => updateSettings({ editorFontSize: val })}
                    label="Cỡ chữ soạn thảo (Editor Font Size)"
                    valueDisplay={`${settings.editorFontSize}px`}
                  />
                </div>

                {/* Code Font Selector */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">
                    Phông chữ hiển thị mã nguồn
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "'JetBrains Mono', monospace", label: 'JetBrains Mono' },
                      { id: "'Fira Code', monospace", label: 'Fira Code' },
                      { id: "ui-monospace, monospace", label: 'Hệ thống (Monospace)' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => updateSettings({ editorFontFamily: f.id })}
                        className={`touch-target-h p-2.5 rounded-[var(--radius-sm)] border text-xs font-mono text-center transition-all cursor-pointer ${
                          settings.editorFontFamily === f.id
                            ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold'
                            : 'bg-panel text-secondary hover:text-primary border-default'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switches */}
                <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] space-y-3">
                  <Switch
                    checked={settings.editorWordWrap}
                    onChange={(checked) => updateSettings({ editorWordWrap: checked })}
                    label="Tự động xuống dòng (Word Wrap)"
                    description="Tự động ngắt dòng các câu lệnh dài thay vì phải cuộn ngang"
                  />
                  <div className="border-t border-subtle pt-3">
                    <Switch
                      checked={settings.editorLineNumbers}
                      onChange={(checked) => updateSettings({ editorLineNumbers: checked })}
                      label="Đánh số thứ tự dòng (Line Numbers)"
                      description="Hiển thị cột số dòng ở lề trái vùng soạn thảo"
                    />
                  </div>
                  <div className="border-t border-subtle pt-3">
                    <Switch
                      checked={settings.collabHighlightInserts ?? true}
                      onChange={(checked) => updateSettings({ collabHighlightInserts: checked })}
                      label="Làm nổi bật mã do cộng tác viên vừa chèn"
                      description="Hiển thị hiệu ứng sáng nhẹ trong ~1 giây khi thành viên khác thêm mã mới"
                    />
                  </div>
                  <div className="border-t border-subtle pt-3">
                    <Switch
                      checked={settings.collabHideRemoteCursors ?? false}
                      onChange={(checked) => updateSettings({ collabHideRemoteCursors: checked })}
                      label="Ẩn con trỏ của cộng tác viên"
                      description="Tắt hiển thị con trỏ, nhãn tên và vùng chọn của người khác trong trình soạn thảo"
                    />
                  </div>
                  <div className="border-t border-subtle pt-3">
                    <Switch
                      checked={settings.collabHideOwnCursor ?? false}
                      onChange={(checked) => updateSettings({ collabHideOwnCursor: checked })}
                      label="Ẩn vị trí con trỏ của tôi"
                      description="Vẫn đồng bộ mã nguồn theo thời gian thực nhưng không chia sẻ vị trí con trỏ của bạn"
                    />
                  </div>
                  <div className="border-t border-subtle pt-3">
                    <Switch
                      checked={settings.collabChatSound ?? false}
                      onChange={(checked) => updateSettings({ collabChatSound: checked })}
                      label="Âm thanh thông báo trò chuyện nhóm"
                      description="Phát âm báo nhẹ khi có tin nhắn mới trong khung trò chuyện dự án nhóm"
                    />
                  </div>
                </div>

                {/* Preview Pane Background */}
                <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)]">
                  <label className="block text-xs font-semibold text-secondary mb-2">
                    Nền khung xem trước bài học (Live Preview Background)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'dark', label: 'Tối đồng bộ' },
                      { id: 'light', label: 'Sáng chuẩn' },
                      { id: 'checker', label: 'Lưới caro trong suốt' },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => updateSettings({ previewBg: bg.id as any })}
                        className={`touch-target-h py-2 text-xs font-medium rounded-[var(--radius-sm)] border text-center transition-all cursor-pointer ${
                          settings.previewBg === bg.id
                            ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold'
                            : 'bg-panel text-secondary hover:text-primary border-default'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* SECTION 6: BỐ CỤC & BO GÓC (LAYOUT & RADIUS)           */}
            {/* ----------------------------------------------------- */}
            {activeSection === 'layout' && (
              <div className="space-y-5">
                <div className="pb-2 border-b border-subtle">
                  <h3 className="text-sm font-bold text-primary">Bố cục & Bo góc các thành phần</h3>
                  <p className="text-xs text-muted">
                    Tùy biến bán kính góc bo và phong cách bóng đổ bề mặt thẻ
                  </p>
                </div>

                {/* Corner Radius */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">
                    Độ bo góc các thành phần giao diện (Corner Radius)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'none', label: 'Vuông vức (0px)' },
                      { id: 'sm', label: 'Nhỏ gọn (4px)' },
                      { id: 'md', label: 'Tiêu chuẩn (10px)' },
                      { id: 'lg', label: 'Bo tròn mềm (16px)' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        onClick={() => updateSettings({ radius: r.id as RadiusStyle })}
                        className={`touch-target-h py-2.5 text-xs font-medium rounded-[var(--radius-sm)] border text-center transition-all cursor-pointer ${
                          settings.radius === r.id
                            ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold'
                            : 'bg-panel text-secondary hover:text-primary border-default'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Surface Style */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">
                    Phong cách thẻ bề mặt (Surface Style)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'flat', label: 'Phẳng mịn (Flat)' },
                      { id: 'raised', label: 'Nổi khối (Raised)' },
                      { id: 'glass', label: 'Kính mờ (Glass)' },
                      { id: 'bordered', label: 'Viền nét (Bordered)' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => updateSettings({ surfaceStyle: s.id as SurfaceStyle })}
                        className={`touch-target-h py-2.5 text-xs font-medium rounded-[var(--radius-sm)] border text-center transition-all cursor-pointer ${
                          settings.surfaceStyle === s.id
                            ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold'
                            : 'bg-panel text-secondary hover:text-primary border-default'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* SECTION 7: CHỮ & MẬT ĐỘ (TYPOGRAPHY & DENSITY)        */}
            {/* ----------------------------------------------------- */}
            {activeSection === 'typography' && (
              <div className="space-y-5">
                <div className="pb-2 border-b border-subtle">
                  <h3 className="text-sm font-bold text-primary">Phông chữ & Mật độ hiển thị</h3>
                  <p className="text-xs text-muted">
                    Tùy biến phông chữ tiếng Việt hiển thị tiêu đề, nhãn và mật độ khoảng cách dòng
                  </p>
                </div>

                {/* UI Font */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">
                    Phông chữ giao diện tiếng Việt (UI Font)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "'Be Vietnam Pro', system-ui, sans-serif", label: 'Be Vietnam Pro' },
                      { id: "'Plus Jakarta Sans', system-ui, sans-serif", label: 'Plus Jakarta Sans' },
                      { id: "Inter, system-ui, sans-serif", label: 'Inter' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => updateSettings({ uiFont: f.id })}
                        className={`touch-target-h p-2.5 rounded-[var(--radius-sm)] border text-xs text-center transition-all cursor-pointer ${
                          settings.uiFont === f.id
                            ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold'
                            : 'bg-panel text-secondary hover:text-primary border-default'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Density Scale */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">
                    Mật độ khoảng cách giao diện
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'compact', label: 'Gọn', hint: 'Thu nhỏ khoảng cách, hiển thị nhiều nội dung hơn' },
                      { id: 'comfortable', label: 'Thoải mái', hint: 'Mặc định trên thiết bị cảm ứng, cân đối và dễ thao tác' },
                      { id: 'spacious', label: 'Rộng rãi', hint: 'Khoảng thở rộng rãi, dễ đọc và chạm trên điện thoại, tablet' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => updateSettings({ density: d.id as DensityStyle })}
                        className={`touch-target p-3 rounded-[var(--radius-sm)] border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          settings.density === d.id
                            ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-bold'
                            : 'bg-panel text-secondary hover:text-primary border-default'
                        }`}
                      >
                        <span className="text-xs">{d.label}</span>
                        <span className="text-[11px] text-muted font-normal leading-normal">{d.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* SECTION 8: HIỆU ỨNG NỀN (GIAI ĐOẠN 2 - PHẦN 1)        */}
            {/* ----------------------------------------------------- */}
            {activeSection === 'effects' && (
              <div className="space-y-5">
                <div className="pb-2 border-b border-subtle flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-primary">Hiệu ứng nền & Tương tác</h3>
                    <p className="text-xs text-muted">
                      Kết hợp tối đa 3 hiệu ứng động chạy trên một canvas chung mượt mà (Giai đoạn 2 - Phần 1: 6 hiệu ứng đầu tiên)
                    </p>
                  </div>
                  {activeEffectsList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearEffects}
                      className="touch-target-h px-2.5 py-1 rounded-[var(--radius-xs)] bg-panel border border-default text-danger text-xs font-semibold hover:border-strong cursor-pointer"
                    >
                      Hiệu ứng: Tắt
                    </button>
                  )}
                </div>

                {/* Trạng thái các hiệu ứng đang kết hợp */}
                <div className="p-3 bg-panel border border-default rounded-[var(--radius-sm)] flex flex-wrap items-center justify-between gap-2">
                  <div className="touch-gap flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-secondary">
                      Đang bật ({activeEffectsList.length}/3):
                    </span>
                    {activeEffectsList.length === 0 ? (
                      <span className="text-xs text-muted">Chưa chọn hiệu ứng nào (Đang tắt)</span>
                    ) : (
                      activeEffectsList.map((id) => {
                        const def = EFFECT_CATALOG.find((e) => e.id === id);
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleToggleEffect(id)}
                            className="touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] bg-accent-soft text-accent border border-[var(--accent-base)]/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Bấm để bỏ chọn hiệu ứng này"
                          >
                            <span>{def?.name || id}</span>
                            <X className="w-3 h-3" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Bộ sưu tập thẻ xem trước động chia theo 4 nhóm */}
                <div className="space-y-4">
                  {EFFECT_CATEGORIES.map((cat) => {
                    const catEffects = EFFECT_CATALOG.filter((e) => e.category === cat.id);
                    return (
                      <div key={cat.id} className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
                            {cat.label}
                          </h4>
                          <span className="text-[11px] text-muted">{cat.description}</span>
                        </div>

                        {catEffects.length === 0 ? (
                          <div className="p-3 rounded-[var(--radius-sm)] bg-panel border border-subtle text-[11px] text-muted">
                            Các hiệu ứng thuộc nhóm &ldquo;{cat.label}&rdquo; sẽ được bổ sung ở phần tiếp theo của Giai đoạn 2 sau khi bạn xác nhận 6 hiệu ứng đầu tiên.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {catEffects.map((eff) => {
                              const isActive = activeEffectsList.includes(eff.id);
                              return (
                                <button
                                  key={eff.id}
                                  type="button"
                                  onClick={() => handleToggleEffect(eff.id)}
                                  className={`p-2 rounded-[var(--radius-sm)] border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                                    isActive
                                      ? 'bg-accent-soft border-[var(--accent-base)] shadow-xs'
                                      : 'bg-panel border-default hover:border-strong'
                                  }`}
                                >
                                  <EffectThumbnail
                                    effectId={eff.id}
                                    accentColor={settings.accentColor}
                                  />
                                  <div className="space-y-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span
                                        className={`text-xs font-bold truncate ${
                                          isActive ? 'text-accent' : 'text-primary'
                                        }`}
                                      >
                                        {eff.name}
                                      </span>
                                      {isActive && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                                    </div>
                                    <p className="text-[10px] text-muted line-clamp-2 leading-snug">
                                      {eff.description}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bảng tùy chỉnh chi tiết cho hiệu ứng đang bật */}
                {currentEditingEffectId && (() => {
                  const cfg = resolveEffectConfig(settings, currentEditingEffectId);
                  const currentDef = EFFECT_CATALOG.find((e) => e.id === currentEditingEffectId);
                  return (
                    <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-subtle">
                        <div className="touch-gap flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-primary">
                            Tinh chỉnh:
                          </span>
                          {activeEffectsList.map((effId) => {
                            const d = EFFECT_CATALOG.find((e) => e.id === effId);
                            const activeTab = effId === currentEditingEffectId;
                            return (
                              <button
                                key={effId}
                                type="button"
                                onClick={() => setSelectedConfigEffectId(effId)}
                                className={`touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-medium border cursor-pointer ${
                                  activeTab
                                    ? 'bg-accent text-accent-on border-transparent font-semibold'
                                    : 'bg-elevated text-secondary border-default hover:text-primary'
                                }`}
                              >
                                {d?.name || effId}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-[11px] text-muted">{currentDef?.name}</span>
                      </div>

                      {/* Màu sắc hiệu ứng */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-secondary">Màu sắc</span>
                        <div className="touch-gap flex flex-wrap items-center gap-1.5">
                          {[
                            { id: 'palette', label: 'Bộ màu riêng' },
                            { id: 'accent', label: 'Theo màu nhấn' },
                            { id: 'custom', label: 'Tùy chọn' },
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() =>
                                handleUpdateEffectConfig(currentEditingEffectId, {
                                  colorMode: mode.id as EffectColorMode,
                                })
                              }
                              className={`touch-target-h px-2 py-1 rounded-[var(--radius-xs)] text-[11px] font-medium border cursor-pointer ${
                                cfg.colorMode === mode.id
                                  ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-semibold'
                                  : 'bg-elevated text-secondary border-default hover:text-primary'
                              }`}
                            >
                              {mode.label}
                            </button>
                          ))}
                          {cfg.colorMode === 'custom' && (
                            <input
                              type="color"
                              value={cfg.customColor}
                              onChange={(e) =>
                                handleUpdateEffectConfig(currentEditingEffectId, {
                                  customColor: e.target.value,
                                })
                              }
                              className="touch-target w-9 h-9 sm:w-6 sm:h-6 rounded-[var(--radius-xs)] border border-default bg-transparent cursor-pointer"
                              aria-label="Chọn màu hiệu ứng"
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <Slider
                          value={Math.round(cfg.amount * 100)}
                          min={25}
                          max={200}
                          step={5}
                          onChange={(val) =>
                            handleUpdateEffectConfig(currentEditingEffectId, { amount: val / 100 })
                          }
                          label="Số lượng hạt"
                          valueDisplay={`${Math.round(cfg.amount * 100)}%`}
                        />
                        <Slider
                          value={Math.round(cfg.speed * 100)}
                          min={25}
                          max={250}
                          step={5}
                          onChange={(val) =>
                            handleUpdateEffectConfig(currentEditingEffectId, { speed: val / 100 })
                          }
                          label="Tốc độ"
                          valueDisplay={`${Math.round(cfg.speed * 100)}%`}
                        />
                        <Slider
                          value={Math.round(cfg.size * 100)}
                          min={50}
                          max={220}
                          step={5}
                          onChange={(val) =>
                            handleUpdateEffectConfig(currentEditingEffectId, { size: val / 100 })
                          }
                          label="Kích thước"
                          valueDisplay={`${Math.round(cfg.size * 100)}%`}
                        />
                        <Slider
                          value={Math.round(cfg.opacity * 100)}
                          min={10}
                          max={100}
                          step={5}
                          onChange={(val) =>
                            handleUpdateEffectConfig(currentEditingEffectId, { opacity: val / 100 })
                          }
                          label="Độ mờ"
                          valueDisplay={`${Math.round(cfg.opacity * 100)}%`}
                        />
                      </div>

                      <div className="pt-2 border-t border-subtle">
                        <Switch
                          checked={cfg.centerFade}
                          onChange={(checked) =>
                            handleUpdateEffectConfig(currentEditingEffectId, { centerFade: checked })
                          }
                          label="Mờ dần ở giữa"
                          description="Giữ khu vực soạn thảo và đọc bài ở trung tâm dịu nhẹ, ít phân tâm hơn"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Tùy chọn tương tác & Tiết kiệm pin */}
                <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] space-y-3">
                  <Switch
                    checked={settings.batterySaver ?? false}
                    onChange={(checked) => updateSettings({ batterySaver: checked })}
                    label="Tiết kiệm pin"
                    description="Giảm một nửa số lượng hạt và giới hạn tốc độ khung hình ở 30 FPS"
                  />
                  <div className="border-t border-subtle pt-3">
                    <Switch
                      checked={settings.mouseWind ?? true}
                      onChange={(checked) => updateSettings({ mouseWind: checked })}
                      label="Gió theo chuột"
                      description="Các hạt nhẹ nhàng nghiêng và trôi theo chuyển động con trỏ chuột (tự tắt khi bật Giảm chuyển động)"
                    />
                  </div>
                  <div className="border-t border-subtle pt-3">
                    <Switch
                      checked={settings.clickBurst ?? true}
                      onChange={(checked) => updateSettings({ clickBurst: checked })}
                      label="Bấm để tạo hiệu ứng"
                      description="Bấm vào màn hình để tạo chùm hạt nhỏ của hiệu ứng đang bật mà không cản trở thao tác gõ phím"
                    />
                  </div>
                </div>

                {/* Chuyển động UI & Kính mờ */}
                <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] space-y-3">
                  <Switch
                    checked={settings.enableAnimations ?? true}
                    onChange={(checked) => updateSettings({ enableAnimations: checked })}
                    label="Bật hiệu ứng chuyển động giao diện"
                    description="Chuyển động mượt mà khi thay đổi màu sắc, mở bảng điều khiển và nhấp chuột."
                  />
                  <div className="border-t border-subtle pt-3">
                    <Switch
                      checked={settings.enableBlur ?? true}
                      onChange={(checked) => updateSettings({ enableBlur: checked })}
                      label="Hiệu ứng kính mờ"
                      description="Làm mờ nền đằng sau thanh điều hướng, cửa sổ và menu ngữ cảnh."
                    />
                  </div>
                </div>

                {/* Bộ đếm FPS ở góc màn hình */}
                {(() => {
                  const defaultShowFps = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
                  const fpsEnabled = settings.showFps ?? defaultShowFps;
                  const currentCorner = settings.fpsCorner || 'bottom-right';
                  return (
                    <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] space-y-3">
                      <Switch
                        checked={fpsEnabled}
                        onChange={(checked) => updateSettings({ showFps: checked })}
                        label="Hiện FPS ở góc màn hình"
                        description="Hiển thị tốc độ khung hình gọn nhẹ ở một góc màn hình, tự tạm dừng khi chuyển tab."
                      />
                      {fpsEnabled && (
                        <div className="border-t border-subtle pt-3 space-y-2">
                          <span className="block text-xs font-semibold text-secondary">
                            Vị trí góc hiển thị FPS
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {[
                              { id: 'bottom-right', label: 'Dưới phải' },
                              { id: 'bottom-left', label: 'Dưới trái' },
                              { id: 'top-right', label: 'Trên phải' },
                              { id: 'top-left', label: 'Trên trái' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  updateSettings({
                                    fpsCorner: opt.id as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
                                  })
                                }
                                className={`touch-target-h px-2 py-1.5 rounded-[var(--radius-xs)] text-[11px] font-medium border cursor-pointer transition-colors ${
                                  currentCorner === opt.id
                                    ? 'bg-accent-soft text-accent border-[var(--accent-base)] font-semibold'
                                    : 'bg-elevated text-secondary border-default hover:text-primary'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ----------------------------------------------------- */}
            {/* SECTION 9: HỒ SƠ & ĐỒNG BỘ (SYNC & PROFILE)           */}
            {/* ----------------------------------------------------- */}
            {activeSection === 'sync' && (
              <div className="space-y-5">
                <div className="pb-2 border-b border-subtle">
                  <h3 className="text-sm font-bold text-primary">Hồ sơ & Đồng bộ cấu hình</h3>
                  <p className="text-xs text-muted">
                    Sao lưu giao diện lên tài khoản đám mây, xuất và nhập tệp cấu hình JSON
                  </p>
                </div>

                {/* Cloud Sync Status */}
                <div className="p-3.5 bg-panel border border-default rounded-[var(--radius-sm)] flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-primary block">Trạng thái đồng bộ đám mây</span>
                    <span className="text-[11px] text-muted">
                      {currentUser?.uid
                        ? `Đã đăng nhập (${getUserDiagnosticLabel(currentUser)}) • Cấu hình tự động lưu lên Firestore`
                        : 'Đang dùng chế độ Khách (Guest) • Đăng nhập để đồng bộ giao diện trên mọi thiết bị'}
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-[var(--radius-xs)] bg-elevated border border-default text-xs font-semibold text-secondary flex-shrink-0">
                    {currentUser?.uid ? 'Đã kích hoạt' : 'Lưu cục bộ'}
                  </div>
                </div>

                {/* Export & Import Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-panel border border-default rounded-[var(--radius-sm)] space-y-2.5">
                    <span className="text-xs font-bold text-primary block">Xuất cấu hình ra tệp JSON</span>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Tải toàn bộ thiết lập màu sắc, phông chữ và bố cục về máy để chia sẻ hoặc sao lưu.
                    </p>
                    <button
                      onClick={handleExport}
                      className="touch-target-h px-3 py-1.5 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-strong text-xs font-medium flex items-center gap-1.5 text-primary cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-accent" />
                      <span>Tải tệp coderlive-theme.json</span>
                    </button>
                  </div>

                  <div className="p-4 bg-panel border border-default rounded-[var(--radius-sm)] space-y-2.5">
                    <span className="text-xs font-bold text-primary block">Nhập cấu hình từ JSON</span>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Áp dụng nhanh cấu hình từ tệp JSON đã lưu hoặc chuỗi mã chia sẻ từ bạn bè.
                    </p>
                    <button
                      onClick={() => setIsExportImportOpen(true)}
                      className="touch-target-h px-3 py-1.5 rounded-[var(--radius-xs)] bg-accent text-accent-on hover:bg-[var(--accent-hover)] text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nhập giao diện ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* COLUMN 3: RIGHT STICKY LIVE PREVIEW (~360px)            */}
          {/* ======================================================= */}
          <div
            className={`${
              showMobilePreview ? 'flex max-h-[42dvh] border-t md:border-t-0 md:max-h-none' : 'hidden'
            } md:flex w-full md:w-[360px] md:min-w-[360px] bg-panel md:border-l border-subtle p-4 flex-col shrink-0 overflow-y-auto overscroll-contain space-y-3.5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-accent" />
                Mô phỏng giao diện thực tế
              </span>
              <span className="text-[10px] font-mono text-muted">
                {activePreset.name} • {settings.mode === 'dark' ? 'Tối' : 'Sáng'}
              </span>
            </div>

            {/* Rich Mini UI Mockup */}
            <div className="p-3 bg-app border border-default rounded-[var(--radius-md)] space-y-3 select-none shadow-xs">
              {/* Mini App Header */}
              <div className="h-8 px-2.5 bg-panel border border-subtle rounded-[var(--radius-xs)] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-[var(--radius-xs)] bg-accent text-accent-on flex items-center justify-center text-[9px] font-bold">
                    C
                  </div>
                  <span className="text-xs font-bold text-primary">Coderlive</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-accent-soft text-accent text-[9px] font-mono font-semibold">
                    Trực tiếp
                  </span>
                  <div className="w-4 h-4 rounded-full bg-elevated border border-subtle flex items-center justify-center text-[9px] text-secondary">
                    U
                  </div>
                </div>
              </div>

              {/* Mini Code Editor with real CSS variables */}
              <div
                style={{ fontSize: `${Math.max(10, settings.editorFontSize - 2.5)}px` }}
                className="p-2.5 bg-panel border border-default rounded-[var(--radius-xs)] font-mono text-primary leading-relaxed"
              >
                <div>
                  <span style={{ color: 'var(--syn-tag)' }}>&lt;div</span>{' '}
                  <span style={{ color: 'var(--syn-attr)' }}>class</span>=
                  <span style={{ color: 'var(--syn-string)' }}>&quot;card&quot;</span>
                  <span style={{ color: 'var(--syn-tag)' }}>&gt;</span>
                </div>
                <div className="pl-3">
                  <span style={{ color: 'var(--syn-tag)' }}>&lt;h1&gt;</span>
                  <span>{activePreset.name}</span>
                  <span style={{ color: 'var(--syn-tag)' }}>&lt;/h1&gt;</span>
                </div>
                <div className="pl-3">
                  <span style={{ color: 'var(--syn-keyword)' }}>const</span> accent ={' '}
                  <span style={{ color: 'var(--syn-string)' }}>&quot;{settings.accentColor}&quot;</span>;
                </div>
                <div>
                  <span style={{ color: 'var(--syn-tag)' }}>&lt;/div&gt;</span>
                </div>
              </div>

              {/* Mini Lesson Card Preview */}
              <div className="p-2.5 bg-elevated border border-subtle rounded-[var(--radius-xs)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-accent" />
                    Bài 01: Thẻ tiêu đề HTML
                  </span>
                  <span className="text-[9px] font-mono text-muted">100%</span>
                </div>
                <div className="w-full h-1 bg-subtle rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full w-4/5" />
                </div>
              </div>

              {/* Mini Interactive Buttons Strip */}
              <div className="flex items-center gap-2 pt-0.5">
                <button className="h-6 px-2.5 text-[10px] font-medium text-accent-on bg-accent rounded-[var(--radius-xs)] shadow-xs flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  <span>Nút chính</span>
                </button>

                <div className="px-2 py-0.5 text-[9px] font-medium rounded-[var(--radius-xs)] bg-accent-soft text-accent border border-[var(--accent-base)]/30">
                  Thẻ trạng thái
                </div>

                <div className="ml-auto text-[9px] font-mono text-muted">
                  {contrastRatio.toFixed(1)}:1
                </div>
              </div>
            </div>

            {/* Token Palette Quick Inspector */}
            <div className="p-3 bg-elevated border border-subtle rounded-[var(--radius-sm)] space-y-2 text-xs">
              <span className="font-semibold text-secondary block text-[11px]">Thông số đang kích hoạt</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-1.5 rounded-[var(--radius-xs)] bg-panel border border-subtle">
                  <span className="text-muted block">Màu nhấn:</span>
                  <span className="font-bold text-accent">{settings.accentColor}</span>
                </div>
                <div className="p-1.5 rounded-[var(--radius-xs)] bg-panel border border-subtle">
                  <span className="text-muted block">Bo góc:</span>
                  <span className="font-bold text-primary">{settings.radius}</span>
                </div>
                <div className="p-1.5 rounded-[var(--radius-xs)] bg-panel border border-subtle">
                  <span className="text-muted block">Mật độ:</span>
                  <span className="font-bold text-primary">{settings.density}</span>
                </div>
                <div className="p-1.5 rounded-[var(--radius-xs)] bg-panel border border-subtle">
                  <span className="text-muted block">Bề mặt:</span>
                  <span className="font-bold text-primary">{settings.surfaceStyle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUB-MODAL: EXPORT / IMPORT THEME DIALOG                   */}
        {/* ========================================================= */}
        {isExportImportOpen && (
          <div
            className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-overlay animate-in fade-in duration-150"
            onClick={() => setIsExportImportOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-viewport-90 overflow-y-auto overscroll-contain bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] p-5 space-y-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Download className="w-4 h-4 text-accent" />
                  Xuất / Nhập cấu hình giao diện
                </h3>
                <button
                  onClick={() => setIsExportImportOpen(false)}
                  aria-label="Đóng"
                  className="touch-target flex items-center justify-center p-1 rounded-[var(--radius-xs)] text-muted hover:text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="touch-gap flex flex-wrap items-center gap-2">
                  <label className="touch-target-h flex-1 min-w-[140px] px-3 py-2 rounded-[var(--radius-sm)] bg-panel border border-default hover:border-strong text-xs font-semibold text-primary flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-accent" />
                    <span>Tải tệp .json từ máy</span>
                    <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                  </label>
                  <button
                    onClick={() => {
                      const json = exportTheme();
                      navigator.clipboard?.writeText(json);
                      showNotification('Đã sao chép cấu hình vào clipboard!');
                    }}
                    className="touch-target-h px-3 py-2 rounded-[var(--radius-sm)] bg-panel border border-default hover:border-strong text-xs font-semibold text-primary flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-accent" />
                    <span>Sao chép JSON</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    Hoặc dán mã JSON cấu hình vào đây:
                  </label>
                  <textarea
                    rows={6}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='{"presetId": "midnight", "accentColor": "#6366f1", ...}'
                    className="w-full p-2.5 font-mono text-[11px] bg-panel border border-default rounded-[var(--radius-sm)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent-base)]"
                  />
                </div>

                {importFeedback && (
                  <div
                    className={`p-2.5 rounded-[var(--radius-xs)] text-xs flex items-center gap-2 ${
                      importFeedback.type === 'success'
                        ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/40'
                        : 'bg-danger/10 text-danger border border-danger/30'
                    }`}
                  >
                    {importFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{importFeedback.message}</span>
                  </div>
                )}
              </div>

              <div className="touch-gap flex items-center justify-end gap-2 pt-2 border-t border-subtle">
                <button
                  onClick={() => setIsExportImportOpen(false)}
                  className="touch-target-h px-3 py-1.5 text-xs font-medium rounded-[var(--radius-xs)] bg-panel border border-default text-secondary hover:text-primary cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleImportSubmit}
                  className="touch-target-h px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-xs)] bg-accent text-accent-on hover:bg-[var(--accent-hover)] cursor-pointer"
                >
                  Áp dụng cấu hình
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
