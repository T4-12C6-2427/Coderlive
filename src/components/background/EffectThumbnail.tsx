import React, { useEffect, useRef } from 'react';
import { EffectId } from '../../types/theme';
import { renderEffectThumbnailFrame } from '../../lib/background/effectsEngine';

interface EffectThumbnailProps {
  effectId: EffectId;
  accentColor: string;
}

export const EffectThumbnail: React.FC<EffectThumbnailProps> = ({ effectId, accentColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 160;
    const h = 76;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      renderEffectThumbnailFrame(ctx, w, h, effectId, 1.25, accentColor);
      return;
    }

    let rafId = 0;
    let lastDraw = 0;
    const start = performance.now();

    const loop = (now: number) => {
      if (document.visibilityState === 'visible' && now - lastDraw >= 33) {
        lastDraw = now;
        const timeSec = (now - start) / 1000;
        renderEffectThumbnailFrame(ctx, w, h, effectId, timeSec, accentColor);
      }
      rafId = requestAnimationFrame(loop);
    };

    renderEffectThumbnailFrame(ctx, w, h, effectId, 0.5, accentColor);
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [effectId, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="w-full h-[76px] rounded-[calc(var(--radius-sm)-2px)] bg-app border border-subtle block pointer-events-none"
    />
  );
};
