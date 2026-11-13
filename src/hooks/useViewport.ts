import { useState, useEffect } from 'react';

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export const BREAKPOINTS = {
  PHONE_MAX: 639,
  TABLET_MIN: 640,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
} as const;

const TOUCH_MEDIA_QUERY = '(hover: none) and (pointer: coarse), (pointer: coarse)';

export function getIsTouchDevice(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(TOUCH_MEDIA_QUERY).matches;
}

export function getBreakpointForWidth(width: number): Breakpoint {
  if (width < BREAKPOINTS.TABLET_MIN) return 'phone';
  if (width < BREAKPOINTS.DESKTOP_MIN) return 'tablet';
  return 'desktop';
}

function readViewportDimensions() {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 800,
      layoutHeight: 800,
      offsetTop: 0,
    };
  }
  const vv = window.visualViewport;
  return {
    width: Math.round(vv?.width ?? window.innerWidth),
    height: Math.round(vv?.height ?? window.innerHeight),
    layoutHeight: Math.round(window.innerHeight),
    offsetTop: Math.round(vv?.offsetTop ?? 0),
  };
}

/**
 * Returns true on coarse-pointer / touch-primary devices (phones & tablets).
 */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(() => getIsTouchDevice());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(TOUCH_MEDIA_QUERY);
    const update = () => setIsTouch(mql.matches);
    update();

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    // Safari < 14 fallback
    mql.addListener?.(update);
    return () => mql.removeListener?.(update);
  }, []);

  return isTouch;
}

/**
 * Returns the active responsive breakpoint:
 * - 'phone': < 640px
 * - 'tablet': 640px - 1023px
 * - 'desktop': >= 1024px
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getBreakpointForWidth(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      const next = getBreakpointForWidth(window.innerWidth);
      setBreakpoint((prev) => (prev === next ? prev : next));
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  return breakpoint;
}

/**
 * True when viewport width < 640px (phone).
 */
export function useIsMobile(): boolean {
  return useBreakpoint() === 'phone';
}

/**
 * True when viewport width is 640px - 1023px (tablet).
 */
export function useIsTablet(): boolean {
  return useBreakpoint() === 'tablet';
}

/**
 * True when viewport width >= 1024px (desktop).
 */
export function useIsDesktop(): boolean {
  return useBreakpoint() === 'desktop';
}

export interface VisualViewportState {
  width: number;
  height: number;
  offsetTop: number;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
}

function isFormControlElement(el: EventTarget | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest('.cm-editor')) return false;
  const tag = el.tagName;
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type;
    return !['checkbox', 'radio', 'range', 'file', 'button', 'submit', 'reset'].includes(type);
  }
  return tag === 'TEXTAREA' || tag === 'SELECT';
}

/**
 * Synchronizes `--app-height`, `--vv-offset-top`, `html.is-touch`, `html.is-mobile`,
 * `html.keyboard-open`, `data-breakpoint`, and ensures focused form inputs scroll
 * smoothly above the on-screen keyboard on mobile/touch devices.
 */
export function useVisualViewport(): VisualViewportState {
  const isTouch = useIsTouch();
  const breakpoint = useBreakpoint();
  const [dims, setDims] = useState(() => readViewportDimensions());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    const syncViewportCss = () => {
      const next = readViewportDimensions();
      setDims(next);

      if (next.height > 0) {
        root.style.setProperty('--app-height', `${next.height}px`);
      }
      root.style.setProperty('--vv-offset-top', `${next.offsetTop}px`);

      const keyboardDelta = Math.max(0, window.innerHeight - next.height);
      const keyboardOpen = (isTouch || next.width < BREAKPOINTS.DESKTOP_MIN) && keyboardDelta > 120;
      root.classList.toggle('keyboard-open', keyboardOpen);
      root.style.setProperty('--keyboard-height', `${keyboardOpen ? keyboardDelta : 0}px`);
    };

    syncViewportCss();

    const vv = window.visualViewport;
    vv?.addEventListener('resize', syncViewportCss, { passive: true });
    vv?.addEventListener('scroll', syncViewportCss, { passive: true });
    window.addEventListener('resize', syncViewportCss, { passive: true });
    window.addEventListener('orientationchange', syncViewportCss, { passive: true });

    return () => {
      vv?.removeEventListener('resize', syncViewportCss);
      vv?.removeEventListener('scroll', syncViewportCss);
      window.removeEventListener('resize', syncViewportCss);
      window.removeEventListener('orientationchange', syncViewportCss);
    };
  }, [isTouch]);

  // Sync device & breakpoint markers onto <html>
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('is-touch', isTouch);
    root.classList.toggle('is-mobile', breakpoint === 'phone');
    root.classList.toggle('is-tablet', breakpoint === 'tablet');
    root.setAttribute('data-breakpoint', breakpoint);
    root.setAttribute('data-input-mode', isTouch ? 'touch' : 'pointer');
  }, [isTouch, breakpoint]);

  // Scroll focused form inputs above the virtual keyboard
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const scrollActiveInputIntoView = () => {
      if (!isTouch && window.innerWidth >= BREAKPOINTS.DESKTOP_MIN) return;
      const active = document.activeElement;
      if (!isFormControlElement(active)) return;

      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        try {
          active.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        } catch {
          active.scrollIntoView(false);
        }
      }, 150);
    };

    const vv = window.visualViewport;
    document.addEventListener('focusin', scrollActiveInputIntoView, { passive: true });
    vv?.addEventListener('resize', scrollActiveInputIntoView, { passive: true });

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      document.removeEventListener('focusin', scrollActiveInputIntoView);
      vv?.removeEventListener('resize', scrollActiveInputIntoView);
    };
  }, [isTouch]);

  const keyboardHeight = Math.max(0, dims.layoutHeight - dims.height);
  const isKeyboardOpen =
    (isTouch || dims.width < BREAKPOINTS.DESKTOP_MIN) && keyboardHeight > 120;

  return {
    width: dims.width,
    height: dims.height,
    offsetTop: dims.offsetTop,
    keyboardHeight,
    isKeyboardOpen,
    breakpoint,
    isMobile: breakpoint === 'phone',
    isTablet: breakpoint === 'tablet',
    isTouch,
  };
}
