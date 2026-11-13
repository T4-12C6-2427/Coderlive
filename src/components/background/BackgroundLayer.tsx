import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { buildStaticPatternStyle } from '../../lib/background/patterns';
import {
  BackgroundCanvasEngine,
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

  // Khởi tạo BackgroundCanvasEngine duy nhất cho toàn ứng dụng
  useEffect(() => {
    const layerEl = layerRef.current;
    const canvasEl = canvasRef.current;
    if (!layerEl || !canvasEl) return;

    const engine = new BackgroundCanvasEngine(canvasEl, layerEl);
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

  return (
    <div
      ref={layerRef}
      id="coderlive-background-layer"
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
          id="coderlive-base-gradient-layer"
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
            id="coderlive-custom-bg-layer"
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
          id="coderlive-pattern-layer"
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
        id="coderlive-background-canvas"
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
  );
};

