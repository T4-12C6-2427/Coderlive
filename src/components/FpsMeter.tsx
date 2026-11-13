import React, { useEffect, useRef } from 'react';
import { FpsCorner } from '../types/theme';

export type FpsTier = 'good' | 'warn' | 'bad';

export function getFpsTier(fps: number): FpsTier {
  if (fps >= 50) return 'good';
  if (fps >= 30) return 'warn';
  return 'bad';
}

export function formatFpsLabel(fps: number): string {
  const safeFps = Math.max(0, Math.round(fps));
  const tier = getFpsTier(safeFps);
  if (tier === 'bad') return `${safeFps} FPS !`;
  if (tier === 'warn') return `${safeFps} FPS ~`;
  return `${safeFps} FPS`;
}

const TIER_PILL_CLASSES: Record<FpsTier, string> = {
  good: 'text-success border-success',
  warn: 'text-warning border-warning',
  bad: 'text-danger border-danger',
};

const TIER_DOT_CLASSES: Record<FpsTier, string> = {
  good: 'bg-success',
  warn: 'bg-warning',
  bad: 'bg-danger',
};

export interface FpsMeterProps {
  enabled: boolean;
  corner?: FpsCorner;
  isDesktop?: boolean;
  hasLeftActivityBar?: boolean;
  hasMobileBottomNav?: boolean;
  isCollabStripVisible?: boolean;
  isMobileRunVisible?: boolean;
  hasSecondaryTopBar?: boolean;
}

export const FpsMeter: React.FC<FpsMeterProps> = ({
  enabled,
  corner = 'bottom-right',
  isDesktop = true,
  hasLeftActivityBar = false,
  hasMobileBottomNav = false,
  isCollabStripVisible = false,
  isMobileRunVisible = false,
  hasSecondaryTopBar = false,
}) => {
  const pillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const tierRef = useRef<FpsTier>('good');

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }

    let rafId: number | null = null;
    let frames = 0;
    let lastSampleTime = performance.now();

    const applyReading = (fpsValue: number) => {
      const nextTier = getFpsTier(fpsValue);
      const label = formatFpsLabel(fpsValue);

      if (textRef.current && textRef.current.textContent !== label) {
        textRef.current.textContent = label;
      }

      if (tierRef.current !== nextTier) {
        const prevTier = tierRef.current;
        tierRef.current = nextTier;

        if (pillRef.current) {
          TIER_PILL_CLASSES[prevTier].split(' ').forEach((cls) => pillRef.current?.classList.remove(cls));
          TIER_PILL_CLASSES[nextTier].split(' ').forEach((cls) => pillRef.current?.classList.add(cls));
        }
        if (dotRef.current) {
          dotRef.current.classList.remove(TIER_DOT_CLASSES[prevTier]);
          dotRef.current.classList.add(TIER_DOT_CLASSES[nextTier]);
        }
      }
    };

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const tick = (now: number) => {
      frames += 1;
      const elapsed = now - lastSampleTime;
      if (elapsed >= 500) {
        const currentFps = Math.round((frames * 1000) / elapsed);
        frames = 0;
        lastSampleTime = now;
        applyReading(currentFps);
      }
      if (!document.hidden) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const startLoop = () => {
      if (document.hidden || rafId !== null) return;
      frames = 0;
      lastSampleTime = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startLoop();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopLoop();
    };
  }, [enabled]);

  if (!enabled) return null;

  const leftValue =
    isDesktop && hasLeftActivityBar
      ? 'calc(3.75rem + var(--safe-left))'
      : 'calc(0.75rem + var(--safe-left))';

  const rightValue = 'calc(0.75rem + var(--safe-right))';

  const topValue = hasSecondaryTopBar
    ? 'calc(6.25rem + var(--safe-top))'
    : 'calc(3.65rem + var(--safe-top))';

  let bottomValue = 'calc(2.15rem + var(--safe-bottom))';
  if (corner === 'bottom-right') {
    if (!isDesktop && isMobileRunVisible) {
      bottomValue = 'calc(8.5rem + var(--safe-bottom))';
    } else if (isCollabStripVisible) {
      bottomValue = isDesktop
        ? 'calc(4.5rem + var(--safe-bottom))'
        : 'calc(8.5rem + var(--safe-bottom))';
    } else if (!isDesktop && hasMobileBottomNav) {
      bottomValue = 'calc(5.25rem + var(--safe-bottom))';
    }
  } else if (corner === 'bottom-left') {
    if (!isDesktop && hasMobileBottomNav) {
      bottomValue = 'calc(5.25rem + var(--safe-bottom))';
    }
  }

  const posStyle: React.CSSProperties = {
    ...(corner.startsWith('top') ? { top: topValue } : { bottom: bottomValue }),
    ...(corner.endsWith('left') ? { left: leftValue } : { right: rightValue }),
  };

  return (
    <div
      ref={pillRef}
      data-testid="fps-meter"
      data-corner={corner}
      role="status"
      aria-live="off"
      aria-label="Tốc độ khung hình"
      style={posStyle}
      className="pointer-events-none select-none fixed z-[35] px-2 py-0.5 rounded-full bg-elevated/85 backdrop-blur-sm border border-success text-success text-[11px] font-mono tabular-nums font-semibold tracking-tight shadow-[var(--shadow-subtle)] flex items-center gap-1.5"
    >
      <span
        ref={dotRef}
        aria-hidden="true"
        className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0"
      />
      <span ref={textRef}>60 FPS</span>
    </div>
  );
};
