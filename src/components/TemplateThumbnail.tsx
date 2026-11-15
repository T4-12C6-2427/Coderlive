import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Coffee,
  Compass,
  FileText,
  Flame,
  Layers,
  MapPin,
  Rocket,
  Sparkles,
  User,
} from 'lucide-react';
import { CodeTemplate } from '../types';

const MAX_CONCURRENT_RENDERS = 6;
let activeRenderCount = 0;
const waitQueue: Array<{ id: number; start: () => void }> = [];
let nextTicketId = 1;

function enqueueThumbnailRender(start: () => void): () => void {
  const id = nextTicketId++;
  if (activeRenderCount < MAX_CONCURRENT_RENDERS) {
    activeRenderCount++;
    start();
  } else {
    waitQueue.push({ id, start });
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const queuedIdx = waitQueue.findIndex((item) => item.id === id);
    if (queuedIdx !== -1) {
      waitQueue.splice(queuedIdx, 1);
      return;
    }
    activeRenderCount = Math.max(0, activeRenderCount - 1);
    while (activeRenderCount < MAX_CONCURRENT_RENDERS && waitQueue.length > 0) {
      const next = waitQueue.shift();
      if (next) {
        activeRenderCount++;
        next.start();
      }
    }
  };
}

function buildThumbnailSrcDoc(template: CodeTemplate): string {
  const rawHtml = template.htmlCode || '';
  const rawCss = template.cssCode || '';
  const rawJs = template.jsCode || '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html { background-color: #ffffff; }
    html, body { overflow: hidden !important; pointer-events: none !important; user-select: none !important; }
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  </style>
  <style>${rawCss}</style>
</head>
<body>
${rawHtml}
<script>
try {
  ${rawJs}
} catch (e) {}
</script>
</body>
</html>`;
}

export function TemplateDomainIcon({
  iconKey,
  className = 'w-6 h-6',
}: {
  iconKey?: string;
  className?: string;
}) {
  switch (iconKey) {
    case 'user':
      return <User className={className} strokeWidth={1.6} />;
    case 'file':
      return <FileText className={className} strokeWidth={1.6} />;
    case 'rocket':
      return <Rocket className={className} strokeWidth={1.6} />;
    case 'book':
      return <BookOpen className={className} strokeWidth={1.6} />;
    case 'coffee':
      return <Coffee className={className} strokeWidth={1.6} />;
    case 'calendar':
      return <Calendar className={className} strokeWidth={1.6} />;
    case 'map':
      return <MapPin className={className} strokeWidth={1.6} />;
    case 'compass':
      return <Compass className={className} strokeWidth={1.6} />;
    case 'check':
      return <CheckSquare className={className} strokeWidth={1.6} />;
    case 'layers':
      return <Layers className={className} strokeWidth={1.6} />;
    case 'flame':
      return <Flame className={className} strokeWidth={1.6} />;
    case 'sparkles':
    default:
      return <Sparkles className={className} strokeWidth={1.6} />;
  }
}

export interface TemplateThumbnailProps {
  template: CodeTemplate;
}

const VIRTUAL_WIDTH = 1024;
const VIRTUAL_HEIGHT = 640;

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({ template }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canMountIframe, setCanMountIframe] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [scale, setScale] = useState(0.28);
  const releaseSlotRef = useRef<(() => void) | null>(null);

  const srcDoc = useMemo(() => {
    try {
      return buildThumbnailSrcDoc(template);
    } catch {
      return '';
    }
  }, [template]);

  // Measure container width to scale 1024x640 preview cleanly
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(width / VIRTUAL_WIDTH);
      }
    };
    updateScale();

    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Observe card visibility lazily
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '120px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Acquire concurrency slot (at most 6 iframes rendering at once)
  useEffect(() => {
    if (!isVisible || hasFailed || !srcDoc) return;

    let cancelled = false;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const release = enqueueThumbnailRender(() => {
      if (cancelled) {
        releaseSlotRef.current?.();
        return;
      }
      setCanMountIframe(true);
      safetyTimer = setTimeout(() => {
        if (!cancelled) {
          releaseSlotRef.current?.();
          releaseSlotRef.current = null;
        }
      }, 1500);
    });
    releaseSlotRef.current = release;

    return () => {
      cancelled = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      if (releaseSlotRef.current) {
        releaseSlotRef.current();
        releaseSlotRef.current = null;
      }
    };
  }, [isVisible, hasFailed, srcDoc]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (releaseSlotRef.current) {
      releaseSlotRef.current();
      releaseSlotRef.current = null;
    }
  };

  const handleError = () => {
    setHasFailed(true);
    if (releaseSlotRef.current) {
      releaseSlotRef.current();
      releaseSlotRef.current = null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] overflow-hidden rounded-t-[var(--radius-md)] bg-panel border-b border-subtle select-none"
    >
      {/* Fallback / loading placeholder */}
      {(!isLoaded || hasFailed) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-panel text-accent">
          <div className="w-11 h-11 rounded-[var(--radius-md)] bg-accent-soft border border-[var(--accent-base)]/25 flex items-center justify-center">
            <TemplateDomainIcon iconKey={template.iconKey} className="w-5 h-5 text-accent" />
          </div>
          <span className="text-[11px] font-medium text-muted">
            {hasFailed ? template.category : 'Đang dựng xem trước...'}
          </span>
        </div>
      )}

      {/* Sandboxed scaled live iframe (no allow-same-origin, pointer-events: none) */}
      {canMountIframe && !hasFailed && srcDoc && (
        <iframe
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
          title={`Xem trước thu nhỏ ${template.name}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: `${VIRTUAL_WIDTH}px`,
            height: `${VIRTUAL_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className={`block border-0 pointer-events-none transition-opacity duration-200 bg-elevated ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
