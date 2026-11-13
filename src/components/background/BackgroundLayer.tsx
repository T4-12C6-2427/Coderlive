import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Activity, X } from 'lucide-react';
import { buildStaticPatternStyle, normalizePatternId, STATIC_PATTERN_DEFINITIONS } from '../../lib/background/patterns';
import {
  BackgroundCanvasEngine,
  EFFECT_CATALOG,
  getActiveEffectsList,
} from '../../lib/background/effectsEngine';
import {
  resolveBgImageMeta,
  StoredBgImageMeta,
  subscribeBgImageChanged,
} from '../../lib/background/imageStorage';

interface BackgroundLayerProps {
  isTestPatternActive?: boolean;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ isTestPatternActive = false }) => {
  const { settings, activePreset } = useTheme();
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BackgroundCanvasEngine | null>(null);

  // Theo dõi prefers-reduced-motion của hệ thống
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Ẩn Dev Badge & tắt vòng lặp đo FPS trên màn hình điện thoại (<768px) để tránh che nút điều hướng và tiết kiệm pin
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsSmallScreen(e.matches);
    setIsSmallScreen(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Dev Badge mặc định hiển thị trên tablet/desktop và bật/tắt bằng Ctrl+Shift+B
  const [showDevBadge, setShowDevBadge] = useState<boolean>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('htmlive_dev_badge_visible') !== 'false';
      }
    } catch {}
    return true;
  });

  const [canvasMetrics, setCanvasMetrics] = useState<{
    width: number;
    height: number;
    dpr: number;
  }>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
  }));

  // Đo FPS thực tế khi Dev Badge đang bật
  const [fps, setFps] = useState<number>(60);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Khởi tạo BackgroundCanvasEngine duy nhất cho toàn ứng dụng
  useEffect(() => {
    const layerEl = layerRef.current;
    const canvasEl = canvasRef.current;
    if (!layerEl || !canvasEl) return;

    const engine = new BackgroundCanvasEngine(canvasEl, layerEl, (width, height, dpr) => {
      setCanvasMetrics({ width, height, dpr });
    });
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const activeEffects = useMemo(() => getActiveEffectsList(settings), [settings]);

  // Đồng bộ cấu hình vào canvas engine
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.updateConfig({
      activeEffects,
      settings,
      accentColor: settings.accentColor || activePreset.accent,
      accentColor2: settings.accentColor2 || activePreset.accent2,
      reducedMotion: prefersReducedMotion,
    });
  }, [activeEffects, settings, activePreset, prefersReducedMotion]);

  // Phím tắt Ctrl+Shift+B để bật/tắt Dev Badge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        e.preventDefault();
        setShowDevBadge((prev) => {
          const next = !prev;
          try {
            localStorage.setItem('htmlive_dev_badge_visible', String(next));
          } catch {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Vòng đo FPS chỉ chạy khi Dev Badge hiển thị trên màn hình đủ rộng (>=768px)
  useEffect(() => {
    if (!showDevBadge || isSmallScreen) return;

    lastTimeRef.current = performance.now();
    frameCountRef.current = 0;

    const measureFps = (now: number) => {
      frameCountRef.current += 1;
      const elapsed = now - lastTimeRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      rafIdRef.current = requestAnimationFrame(measureFps);
    };

    rafIdRef.current = requestAnimationFrame(measureFps);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [showDevBadge, isSmallScreen]);

  // Lớp họa tiết tĩnh SVG (giới hạn độ mờ <= 60%)
  const patternStyle = useMemo(() => {
    return buildStaticPatternStyle({
      patternType: settings.patternType || 'none',
      opacity: settings.patternOpacity,
      scale: settings.patternScale,
      angle: settings.patternAngle,
      density: settings.patternDensity,
      colorMode: settings.patternColorMode || 'palette',
      customColor: settings.patternColor,
      accentColor: settings.accentColor || activePreset.accent,
      accentColor2: settings.accentColor2 || activePreset.accent2,
      vignette: settings.patternVignette,
    });
  }, [
    settings.patternType,
    settings.patternOpacity,
    settings.patternScale,
    settings.patternAngle,
    settings.patternDensity,
    settings.patternColorMode,
    settings.patternColor,
    settings.accentColor,
    settings.accentColor2,
    settings.patternVignette,
    activePreset.accent,
    activePreset.accent2,
  ]);

  // Kiểu nền cơ sở (solid / gradient / mesh)
  const baseOverlayGradient = useMemo(() => {
    const mode = settings.bgType || 'solid';
    if (mode === 'gradient') {
      return 'radial-gradient(circle at 18% 18%, rgba(var(--accent-rgb), 0.22) 0%, transparent 55%), radial-gradient(circle at 85% 82%, rgba(var(--accent-2-rgb), 0.18) 0%, transparent 58%)';
    }
    if (mode === 'mesh') {
      return 'radial-gradient(at 15% 20%, rgba(var(--accent-rgb), 0.26) 0px, transparent 52%), radial-gradient(at 85% 15%, rgba(var(--accent-2-rgb), 0.22) 0px, transparent 48%), radial-gradient(at 75% 85%, rgba(var(--accent-rgb), 0.18) 0px, transparent 55%), radial-gradient(at 20% 85%, rgba(var(--accent-2-rgb), 0.16) 0px, transparent 50%)';
    }
    return undefined;
  }, [settings.bgType]);

  // Giải mã ảnh nền tùy chỉnh (ObjectURL / IndexedDB / DataURL fallback)
  const [resolvedBgMeta, setResolvedBgMeta] = useState<StoredBgImageMeta | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadImage = async () => {
      if (!settings.customBgImage) {
        if (!cancelled) setResolvedBgMeta(null);
        return;
      }
      const meta = await resolveBgImageMeta(settings.customBgImage);
      if (!cancelled) {
        setResolvedBgMeta(meta);
      }
    };
    loadImage();
    const unsub = subscribeBgImageChanged(() => {
      loadImage();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [settings.customBgImage]);

  const surfacePercent = Math.round((settings.surfaceOpacity ?? 0.88) * 100);
  const normalizedPattern = normalizePatternId(settings.patternType);
  const patternDef = STATIC_PATTERN_DEFINITIONS.find((p) => p.id === normalizedPattern);
  const patternLabel = isTestPatternActive
    ? 'Thử nghiệm'
    : patternDef
    ? patternDef.name
    : 'Tắt';

  const effectLabel =
    activeEffects.length > 0
      ? activeEffects
          .map((id) => EFFECT_CATALOG.find((e) => e.id === id)?.name || id)
          .join(', ')
      : 'Tắt';
  const imageLabel = resolvedBgMeta
    ? resolvedBgMeta.width && resolvedBgMeta.height
      ? `Đã tải (${resolvedBgMeta.width}×${resolvedBgMeta.height})`
      : 'Đã tải'
    : settings.customBgImage
    ? 'Đang nạp...'
    : 'Không có';

  return (
    <>
      {/* 1. LỚP NỀN CỐ ĐỊNH DUY NHẤT Ở GỐC ỨNG DỤNG */}
      <div
        ref={layerRef}
        id="htmlive-background-layer"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundColor: 'var(--bg-app)',
          overflow: 'hidden',
          userSelect: 'none',
          transition: 'background-color 200ms ease',
        }}
      >
        {/* Lớp chuyển sắc / lưới cực quang theo token chủ đề */}
        {baseOverlayGradient && (
          <div
            id="htmlive-base-gradient-layer"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: baseOverlayGradient,
            }}
          />
        )}

        {/* Lớp ảnh nền tùy chỉnh do người dùng tải lên */}
        {resolvedBgMeta?.url && (() => {
          const fit = settings.customBgFit || 'cover';
          const opacity = Math.max(0, Math.min(1, settings.customBgOpacity ?? 0.5));
          const blurPx = Math.max(0, Math.min(24, settings.customBgBlur ?? 0));
          const scaleComp = blurPx > 0 && fit !== 'tile' ? 1 + blurPx * 0.004 : 1;

          return (
            <div
              id="htmlive-custom-bg-layer"
              data-bg-id={resolvedBgMeta.id}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage: `url("${resolvedBgMeta.url}")`,
                backgroundPosition: 'center',
                backgroundRepeat: fit === 'tile' ? 'repeat' : 'no-repeat',
                backgroundSize: fit === 'tile' ? 'auto' : fit,
                opacity,
                filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
                transform: scaleComp !== 1 ? `scale(${scaleComp})` : undefined,
                transition: 'opacity 160ms ease',
              }}
            />
          );
        })()}

        {/* Lớp họa tiết tĩnh SVG (hoa văn hoặc hình học, tối đa 60% opacity) */}
        {patternStyle && (
          <div
            id="htmlive-pattern-layer"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: patternStyle.backgroundImage,
              backgroundSize: patternStyle.backgroundSize,
              backgroundRepeat: 'repeat',
              opacity: patternStyle.opacity,
              maskImage: patternStyle.maskImage,
              WebkitMaskImage: patternStyle.maskImage,
            }}
          />
        )}

        {/* Canvas dùng chung duy nhất cho toàn bộ hiệu ứng động */}
        <canvas
          ref={canvasRef}
          id="htmlive-background-canvas"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Mẫu sọc chéo thử nghiệm 3 giây */}
        {isTestPatternActive && (
          <div
            data-testid="bg-test-pattern"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              pointerEvents: 'none',
              background:
                'repeating-linear-gradient(45deg, #f43f5e 0, #f43f5e 28px, #06b6d4 28px, #06b6d4 56px, #fbbf24 56px, #fbbf24 84px, #a855f7 84px, #a855f7 112px)',
              opacity: 0.95,
            }}
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-[var(--radius-md)] bg-elevated text-primary font-mono text-xs font-bold tracking-wide shadow-[var(--shadow-overlay)] border border-default backdrop-blur-md">
              ĐANG THỬ NGHIỆM NỀN (3 GIÂY) — HIỂN THỊ BÊN DƯỚI GIAO DIỆN
            </div>
          </div>
        )}
      </div>

      {/* 2. DEV BADGE (Chỉ hiển thị từ md trở lên, bật/tắt bằng Ctrl+Shift+B) */}
      {showDevBadge && !isSmallScreen && (
        <aside
          id="htmlive-bg-dev-badge"
          role="region"
          aria-label="Thông số kỹ thuật lớp nền"
          className="hidden md:block fixed bottom-[max(0.75rem,var(--safe-bottom))] right-[max(0.75rem,var(--safe-right))] pointer-events-auto bg-elevated border border-default rounded-[var(--radius-md)] p-3 text-xs text-primary shadow-[var(--shadow-overlay)] font-mono space-y-1.5 w-68 select-none backdrop-blur-md"
          style={{ zIndex: 99998 }}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-subtle">
            <div className="flex items-center gap-1.5 text-accent font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>Thông số lớp nền</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="shortcut-hint text-[10px] text-muted">Ctrl+Shift+B</span>
              <button
                type="button"
                onClick={() => {
                  setShowDevBadge(false);
                  try {
                    localStorage.setItem('htmlive_dev_badge_visible', 'false');
                  } catch {}
                }}
                className="touch-hit-expand p-0.5 text-muted hover:text-primary rounded cursor-pointer"
                title="Ẩn bảng thông số (Ctrl+Shift+B)"
                aria-label="Ẩn bảng thông số"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between gap-2">
              <span className="text-secondary">Nền gốc:</span>
              <span className="font-semibold text-primary truncate">{settings.presetId}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-secondary">Độ mờ bảng:</span>
              <span className="font-semibold text-accent">{surfacePercent}%</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-secondary">Họa tiết:</span>
              <span className="font-semibold text-primary truncate">{patternLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-secondary">Hiệu ứng:</span>
              <span className="font-semibold text-primary truncate max-w-[155px]" title={effectLabel}>
                {effectLabel}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-secondary">Ảnh nền:</span>
              <span className="font-semibold text-primary">{imageLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-secondary">Canvas:</span>
              <span className="font-semibold text-primary">
                {canvasMetrics.width} × {canvasMetrics.height} · {canvasMetrics.dpr}x
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-secondary">FPS:</span>
              <span
                className={`font-bold ${
                  fps >= 50 ? 'text-success' : fps >= 25 ? 'text-warning' : 'text-danger'
                }`}
              >
                {prefersReducedMotion
                  ? 'Tĩnh (Giảm chuyển động)'
                  : settings.batterySaver
                  ? `${Math.min(30, fps)} FPS (Tiết kiệm pin)`
                  : `${fps} FPS`}
              </span>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
