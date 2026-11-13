import { EffectCategoryId, EffectConfig, EffectId, ThemeSettings } from '../../types/theme';

export interface EffectCategoryMeta {
  id: EffectCategoryId;
  label: string;
  description: string;
}

export interface EffectDefinition {
  id: EffectId;
  name: string;
  category: EffectCategoryId;
  description: string;
  palette: [string, string, string];
  baseCount: number;
}

export const EFFECT_CATEGORIES: EffectCategoryMeta[] = [
  { id: 'flowers', label: 'Hoa & cánh hoa rơi', description: 'Cánh hoa bay bổng, mềm mại theo làn gió' },
  { id: 'sky', label: 'Bầu trời & ánh sáng', description: 'Vì sao, ánh sáng lấp lánh và đom đóm đêm' },
  { id: 'weather', label: 'Thời tiết & thiên nhiên', description: 'Tuyết trắng, sương nhẹ và thiên nhiên' },
  { id: 'tech', label: 'Công nghệ & vui nhộn', description: 'Hiệu ứng số, mã nguồn và hình học động' },
];

// Giai đoạn 2 - Phần 1: 6 hiệu ứng đầu tiên
export const EFFECT_CATALOG: EffectDefinition[] = [
  {
    id: 'sakura-petals',
    name: 'Hoa anh đào rơi',
    category: 'flowers',
    description: 'Cánh hoa anh đào xoay nghiêng 3D nhẹ nhàng và mờ sâu theo lớp',
    palette: ['#fda4af', '#fbcfe8', '#f472b6'],
    baseCount: 48,
  },
  {
    id: 'apricot-petals',
    name: 'Cánh hoa mai rơi',
    category: 'flowers',
    description: 'Cánh hoa mai vàng rực sắc Tết nhẹ bay trong gió xuân',
    palette: ['#facc15', '#fde047', '#fbbf24'],
    baseCount: 44,
  },
  {
    id: 'twinkling-stars',
    name: 'Sao lấp lánh',
    category: 'sky',
    description: 'Nhiều tầng sao xa gần nhấp nháy nhẹ nhàng với tia sáng 4 cánh',
    palette: ['#f8fafc', '#bae6fd', '#e9d5ff'],
    baseCount: 95,
  },
  {
    id: 'shooting-stars',
    name: 'Sao băng',
    category: 'sky',
    description: 'Những vệt sao băng sáng rực lướt chéo bầu trời đêm',
    palette: ['#e0f2fe', '#93c5fd', '#c4b5fd'],
    baseCount: 8,
  },
  {
    id: 'fireflies',
    name: 'Đom đóm',
    category: 'sky',
    description: 'Đốm sáng sinh học bay lượn tự nhiên và nhấp nháy ấm áp',
    palette: ['#bef264', '#fde047', '#86efac'],
    baseCount: 42,
  },
  {
    id: 'snow',
    name: 'Tuyết rơi',
    category: 'weather',
    description: 'Bông tuyết mềm mại rơi chậm kèm hiệu ứng bokeh nhẹ',
    palette: ['#ffffff', '#e0f2fe', '#f1f5f9'],
    baseCount: 72,
  },
];

export const DEFAULT_EFFECT_CONFIG: EffectConfig = {
  amount: 1.0,
  speed: 1.0,
  size: 1.0,
  opacity: 0.85,
  colorMode: 'palette',
  customColor: '#f472b6',
  centerFade: false,
};

export function resolveEffectConfig(settings: ThemeSettings, effectId: EffectId): EffectConfig {
  const override = settings.effectConfigs?.[effectId];
  return {
    ...DEFAULT_EFFECT_CONFIG,
    customColor: override?.customColor || settings.accentColor || '#6366f1',
    ...override,
  };
}

export function getActiveEffectsList(settings: ThemeSettings): EffectId[] {
  if (settings.activeEffects && settings.activeEffects.length > 0) {
    return settings.activeEffects.slice(0, 3);
  }
  if (settings.activeEffect && settings.activeEffect !== 'none') {
    if (settings.activeEffect === 'stars') return ['twinkling-stars'];
    const found = EFFECT_CATALOG.find((e) => e.id === settings.activeEffect);
    if (found) return [found.id];
  }
  return [];
}

// =============================================================================
// TYPED PARTICLE POOL ENGINE (KHÔNG CẤP PHÁT BỘ NHỚ MỖI KHUNG HÌNH)
// =============================================================================
const MAX_POOL_SLOTS = 720;

const EFFECT_TYPE_CODE: Record<EffectId, number> = {
  'sakura-petals': 1,
  'apricot-petals': 2,
  'twinkling-stars': 3,
  'shooting-stars': 4,
  'fireflies': 5,
  'snow': 6,
};

function resolveColors(
  def: EffectDefinition,
  cfg: EffectConfig,
  accentColor: string,
  accentColor2: string
): [string, string, string] {
  if (cfg.colorMode === 'accent') {
    return [accentColor, accentColor2 || accentColor, accentColor];
  }
  if (cfg.colorMode === 'custom') {
    return [cfg.customColor, cfg.customColor, accentColor2 || cfg.customColor];
  }
  return def.palette;
}

// Deterministic pseudo-random helper for reduced-motion static frames
function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function isLowPowerMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const isSmallScreen = window.innerWidth < 768;
  const isCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const lowCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4;
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0 && nav.deviceMemory <= 4;
  const saveData = Boolean(nav.connection?.saveData);
  return saveData || (isCoarsePointer && (isSmallScreen || lowCores || lowMemory)) || (isSmallScreen && (lowCores || lowMemory));
}

export interface EngineStateSnapshot {
  activeEffects: EffectId[];
  settings: ThemeSettings;
  accentColor: string;
  accentColor2: string;
  reducedMotion: boolean;
}

export class BackgroundCanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 1280;
  private height = 720;
  private dpr = 1;

  // Typed particle pools (zero per-frame allocations)
  private active = new Uint8Array(MAX_POOL_SLOTS);
  private effectSlot = new Uint8Array(MAX_POOL_SLOTS); // 0, 1, 2
  private kind = new Uint8Array(MAX_POOL_SLOTS); // EFFECT_TYPE_CODE
  private colorIdx = new Uint8Array(MAX_POOL_SLOTS); // 0..2
  private isBurst = new Uint8Array(MAX_POOL_SLOTS);

  private px = new Float32Array(MAX_POOL_SLOTS);
  private py = new Float32Array(MAX_POOL_SLOTS);
  private vx = new Float32Array(MAX_POOL_SLOTS);
  private vy = new Float32Array(MAX_POOL_SLOTS);
  private psize = new Float32Array(MAX_POOL_SLOTS);
  private angle = new Float32Array(MAX_POOL_SLOTS);
  private vAngle = new Float32Array(MAX_POOL_SLOTS);
  private phase = new Float32Array(MAX_POOL_SLOTS);
  private vPhase = new Float32Array(MAX_POOL_SLOTS);
  private alpha = new Float32Array(MAX_POOL_SLOTS);
  private life = new Float32Array(MAX_POOL_SLOTS);
  private maxLife = new Float32Array(MAX_POOL_SLOTS);
  private depth = new Float32Array(MAX_POOL_SLOTS);

  // Runtime loop state
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private lastRenderTime = 0;
  private elapsedSec = 0;
  private isTabHidden = false;
  private resizeObserver: ResizeObserver | null = null;

  // Mouse wind & burst state
  private pointerX = 0.5;
  private pointerY = 0.5;
  private targetWindX = 0;
  private targetWindY = 0;
  private smoothWindX = 0;
  private smoothWindY = 0;
  private lastPointerClientX = -1;
  private lastPointerClientY = -1;

  // Current configuration
  private snapshot: EngineStateSnapshot | null = null;
  private cachedPalettes: [string, string, string][] = [];
  private cachedConfigs: EffectConfig[] = [];
  private onMetricsChange?: (w: number, h: number, dpr: number) => void;

  private containerEl: HTMLElement;

  constructor(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    onMetricsChange?: (w: number, h: number, dpr: number) => void
  ) {
    this.canvas = canvas;
    this.containerEl = container;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      throw new Error('Không thể khởi tạo Canvas 2D cho lớp nền.');
    }
    this.ctx = context;
    this.onMetricsChange = onMetricsChange;

    this.syncSize(container);
    this.resizeObserver = new ResizeObserver(() => {
      this.syncSize(container);
      if (this.snapshot && (this.snapshot.reducedMotion || this.snapshot.activeEffects.length > 0)) {
        if (this.snapshot.reducedMotion) {
          this.drawStaticReducedFrame();
        }
      }
    });
    this.resizeObserver.observe(container);

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', this.handlePointerDown, { passive: true });
  }

  private getEffectiveDpr(): number {
    const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const nav = typeof navigator !== 'undefined'
      ? (navigator as Navigator & { deviceMemory?: number })
      : undefined;
    const veryLowSpec =
      (typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) ||
      (typeof nav?.deviceMemory === 'number' && nav.deviceMemory <= 2);

    if (this.snapshot?.settings.batterySaver || veryLowSpec) {
      return 1;
    }
    if (isLowPowerMobileDevice()) {
      return Math.min(rawDpr, 1.25);
    }
    return Math.min(rawDpr, 2);
  }

  private syncSize(container: HTMLElement): void {
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width || window.innerWidth));
    const h = Math.max(1, Math.round(rect.height || window.innerHeight));
    const dpr = this.getEffectiveDpr();

    this.width = w;
    this.height = h;
    this.dpr = dpr;

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.onMetricsChange?.(w, h, dpr);
  }

  public updateConfig(snapshot: EngineStateSnapshot): void {
    const prevKey = this.snapshot
      ? `${this.snapshot.activeEffects.join(',')}|${this.snapshot.reducedMotion}|${this.snapshot.settings.batterySaver}|${this.snapshot.settings.effectConfigs ? JSON.stringify(this.snapshot.settings.effectConfigs) : ''}`
      : '';
    const prevBattery = this.snapshot?.settings.batterySaver;

    this.snapshot = snapshot;
    this.cachedConfigs = snapshot.activeEffects.map((id) => resolveEffectConfig(snapshot.settings, id));
    this.cachedPalettes = snapshot.activeEffects.map((id, idx) => {
      const def = EFFECT_CATALOG.find((e) => e.id === id) || EFFECT_CATALOG[0];
      return resolveColors(def, this.cachedConfigs[idx], snapshot.accentColor, snapshot.accentColor2);
    });

    if (prevBattery !== snapshot.settings.batterySaver) {
      this.syncSize(this.containerEl);
    }

    const nextKey = `${snapshot.activeEffects.join(',')}|${snapshot.reducedMotion}|${snapshot.settings.batterySaver}|${snapshot.settings.effectConfigs ? JSON.stringify(snapshot.settings.effectConfigs) : ''}`;

    if (snapshot.activeEffects.length === 0) {
      this.stopLoop();
      this.active.fill(0);
      this.ctx.clearRect(0, 0, this.width, this.height);
      return;
    }

    if (prevKey !== nextKey) {
      this.rebuildPools();
    }

    if (snapshot.reducedMotion) {
      this.stopLoop();
      this.drawStaticReducedFrame();
      return;
    }

    if (!this.isTabHidden && this.rafId === null) {
      this.startLoop();
    }
  }

  private rebuildPools(): void {
    this.active.fill(0);
    if (!this.snapshot) return;

    const { activeEffects, settings } = this.snapshot;
    const batteryFactor = settings.batterySaver ? 0.5 : 1;
    const mobileFactor = isLowPowerMobileDevice() ? 0.55 : 1;
    const scaleFactor = batteryFactor * mobileFactor;
    let cursor = 0;

    for (let slotIdx = 0; slotIdx < activeEffects.length; slotIdx++) {
      const effectId = activeEffects[slotIdx];
      const def = EFFECT_CATALOG.find((e) => e.id === effectId);
      if (!def) continue;
      const cfg = this.cachedConfigs[slotIdx];
      const maxForSlot = Math.floor((MAX_POOL_SLOTS - 90) / Math.max(1, activeEffects.length));
      const count = Math.max(1, Math.min(maxForSlot, Math.round(def.baseCount * cfg.amount * scaleFactor)));

      for (let i = 0; i < count && cursor < MAX_POOL_SLOTS - 60; i++) {
        this.initParticle(cursor, slotIdx, effectId, false, i, true);
        cursor++;
      }
    }
  }

  private initParticle(
    idx: number,
    slotIdx: number,
    effectId: EffectId,
    burst: boolean,
    seedIdx: number,
    spreadInitialY: boolean,
    originX?: number,
    originY?: number
  ): void {
    const code = EFFECT_TYPE_CODE[effectId];
    const cfg = this.cachedConfigs[slotIdx] || DEFAULT_EFFECT_CONFIG;
    const sizeMul = cfg.size;
    const speedMul = cfg.speed;
    const r1 = seededRand(idx * 17 + seedIdx + this.elapsedSec * 7 + (burst ? 99 : 0));
    const r2 = Math.random();
    const r3 = Math.random();

    this.active[idx] = 1;
    this.effectSlot[idx] = slotIdx;
    this.kind[idx] = code;
    this.isBurst[idx] = burst ? 1 : 0;
    this.colorIdx[idx] = Math.floor(r2 * 3) % 3;
    this.depth[idx] = 0.45 + r3 * 0.55;

    if (burst && originX !== undefined && originY !== undefined) {
      this.px[idx] = originX + (Math.random() - 0.5) * 18;
      this.py[idx] = originY + (Math.random() - 0.5) * 18;
    } else {
      this.px[idx] = Math.random() * this.width;
      this.py[idx] = spreadInitialY ? Math.random() * this.height : -20 - Math.random() * 40;
    }

    this.phase[idx] = r1 * Math.PI * 2;
    this.vPhase[idx] = 1.2 + Math.random() * 1.8;
    this.angle[idx] = Math.random() * Math.PI * 2;

    if (code === 1 || code === 2) {
      // Sakura or Apricot petals
      this.psize[idx] = (6 + Math.random() * 7) * sizeMul * this.depth[idx];
      this.vx[idx] = burst ? (Math.random() - 0.5) * 160 : (14 + Math.random() * 24) * speedMul;
      this.vy[idx] = burst ? -50 - Math.random() * 90 : (36 + Math.random() * 42) * speedMul * this.depth[idx];
      this.vAngle[idx] = (Math.random() - 0.5) * 2.4 * speedMul;
      this.alpha[idx] = 0.55 + this.depth[idx] * 0.4;
      this.maxLife[idx] = burst ? 2.4 + Math.random() * 1.2 : 999;
      this.life[idx] = this.maxLife[idx];
    } else if (code === 3) {
      // Twinkling stars
      this.psize[idx] = (1.1 + Math.random() * 2.2) * sizeMul * this.depth[idx];
      this.vx[idx] = burst ? (Math.random() - 0.5) * 110 : (Math.random() - 0.5) * 4 * speedMul;
      this.vy[idx] = burst ? (Math.random() - 0.5) * 110 : (Math.random() - 0.5) * 4 * speedMul;
      this.vAngle[idx] = 0;
      this.alpha[idx] = 0.35 + Math.random() * 0.65;
      this.maxLife[idx] = burst ? 1.4 + Math.random() * 0.8 : 999;
      this.life[idx] = this.maxLife[idx];
    } else if (code === 4) {
      // Shooting stars
      this.psize[idx] = (1.6 + Math.random() * 1.8) * sizeMul;
      const startX = burst && originX !== undefined ? originX : Math.random() * this.width * 0.9;
      const startY = burst && originY !== undefined ? originY : Math.random() * this.height * 0.45;
      this.px[idx] = startX;
      this.py[idx] = startY;
      const dirAngle = 0.45 + Math.random() * 0.35; // diagonal down-right
      const spd = (420 + Math.random() * 340) * speedMul;
      this.vx[idx] = Math.cos(dirAngle) * spd;
      this.vy[idx] = Math.sin(dirAngle) * spd;
      this.vAngle[idx] = 0;
      this.alpha[idx] = 0.9;
      this.maxLife[idx] = 0.85 + Math.random() * 0.7;
      this.life[idx] = burst ? this.maxLife[idx] : Math.random() * this.maxLife[idx];
    } else if (code === 5) {
      // Fireflies
      this.psize[idx] = (2.2 + Math.random() * 2.8) * sizeMul * this.depth[idx];
      this.vx[idx] = burst ? (Math.random() - 0.5) * 120 : (Math.random() - 0.5) * 28 * speedMul;
      this.vy[idx] = burst ? (Math.random() - 0.5) * 120 : (Math.random() - 0.5) * 24 * speedMul;
      this.vAngle[idx] = 0;
      this.alpha[idx] = 0.5 + Math.random() * 0.5;
      this.maxLife[idx] = burst ? 2.2 + Math.random() * 1.0 : 999;
      this.life[idx] = this.maxLife[idx];
    } else {
      // Snow
      this.psize[idx] = (2.0 + Math.random() * 3.8) * sizeMul * this.depth[idx];
      this.vx[idx] = burst ? (Math.random() - 0.5) * 130 : (Math.random() - 0.5) * 18 * speedMul;
      this.vy[idx] = burst ? -40 + Math.random() * 80 : (28 + Math.random() * 44) * speedMul * this.depth[idx];
      this.vAngle[idx] = (Math.random() - 0.5) * 1.2 * speedMul;
      this.alpha[idx] = 0.45 + this.depth[idx] * 0.5;
      this.maxLife[idx] = burst ? 2.0 + Math.random() * 1.0 : 999;
      this.life[idx] = this.maxLife[idx];
    }
  }

  private drawStaticReducedFrame(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (!this.snapshot) return;
    // Place particles deterministically across viewport for a calm static frame
    for (let i = 0; i < MAX_POOL_SLOTS; i++) {
      if (!this.active[i]) continue;
      if (this.kind[i] === 4) {
        // Keep shooting stars nicely visible in reduced motion static frame
        this.life[i] = this.maxLife[i] * 0.55;
      }
    }
    this.renderFrame(0);
  }

  private handleVisibilityChange = (): void => {
    this.isTabHidden = document.visibilityState === 'hidden';
    if (this.isTabHidden) {
      this.stopLoop();
    } else if (this.snapshot && this.snapshot.activeEffects.length > 0 && !this.snapshot.reducedMotion) {
      this.startLoop();
    }
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    if (!this.snapshot || !this.snapshot.settings.mouseWind || this.snapshot.reducedMotion) return;
    if (this.lastPointerClientX >= 0) {
      const dx = e.clientX - this.lastPointerClientX;
      const dy = e.clientY - this.lastPointerClientY;
      this.targetWindX = Math.max(-140, Math.min(140, dx * 3.2));
      this.targetWindY = Math.max(-60, Math.min(60, dy * 1.6));
    }
    this.lastPointerClientX = e.clientX;
    this.lastPointerClientY = e.clientY;
    this.pointerX = e.clientX / Math.max(1, this.width);
    this.pointerY = e.clientY / Math.max(1, this.height);
  };

  private handlePointerDown = (e: PointerEvent): void => {
    if (
      !this.snapshot ||
      !this.snapshot.settings.clickBurst ||
      this.snapshot.reducedMotion ||
      this.snapshot.activeEffects.length === 0
    ) {
      return;
    }
    // Spawn small burst in unused slots at end of pool (660..719)
    const activeEffects = this.snapshot.activeEffects;
    const burstCount = this.snapshot.settings.batterySaver || isLowPowerMobileDevice() ? 6 : 12;
    let spawned = 0;
    for (let i = MAX_POOL_SLOTS - 60; i < MAX_POOL_SLOTS && spawned < burstCount; i++) {
      if (!this.active[i]) {
        const slotIdx = spawned % activeEffects.length;
        this.initParticle(i, slotIdx, activeEffects[slotIdx], true, spawned, false, e.clientX, e.clientY);
        spawned++;
      }
    }
  };

  private startLoop(): void {
    if (this.rafId !== null) return;
    this.lastTimestamp = performance.now();
    this.lastRenderTime = this.lastTimestamp;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (now: number): void => {
    this.rafId = null;
    if (!this.snapshot || this.isTabHidden || this.snapshot.reducedMotion || this.snapshot.activeEffects.length === 0) {
      return;
    }

    const shouldThrottleFps = this.snapshot.settings.batterySaver || isLowPowerMobileDevice();
    const minFrameMs = shouldThrottleFps ? 1000 / 30 : 0;
    if (minFrameMs > 0 && now - this.lastRenderTime < minFrameMs) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTimestamp) / 1000));
    this.lastTimestamp = now;
    this.lastRenderTime = now;
    this.elapsedSec += dt;

    this.updatePhysics(dt);
    this.renderFrame(dt);

    this.rafId = requestAnimationFrame(this.tick);
  };

  private updatePhysics(dt: number): void {
    if (!this.snapshot) return;
    const windEnabled = !!this.snapshot.settings.mouseWind;
    if (windEnabled) {
      this.smoothWindX += (this.targetWindX - this.smoothWindX) * Math.min(1, dt * 6);
      this.smoothWindY += (this.targetWindY - this.smoothWindY) * Math.min(1, dt * 6);
      this.targetWindX *= Math.pow(0.25, dt);
      this.targetWindY *= Math.pow(0.25, dt);
    } else {
      this.smoothWindX = 0;
      this.smoothWindY = 0;
    }

    const w = this.width;
    const h = this.height;
    const activeEffects = this.snapshot.activeEffects;

    for (let i = 0; i < MAX_POOL_SLOTS; i++) {
      if (!this.active[i]) continue;
      const slotIdx = this.effectSlot[i];
      const cfg = this.cachedConfigs[slotIdx] || DEFAULT_EFFECT_CONFIG;
      const code = this.kind[i];
      const burst = this.isBurst[i] === 1;

      this.phase[i] += this.vPhase[i] * dt;
      this.angle[i] += this.vAngle[i] * dt;

      if (burst) {
        this.life[i] -= dt;
        if (this.life[i] <= 0) {
          this.active[i] = 0;
          continue;
        }
        this.vy[i] += 110 * dt;
      }

      if (code === 1 || code === 2) {
        // Petals sway + wind
        const sway = Math.sin(this.phase[i]) * 26 * cfg.speed;
        this.px[i] += (this.vx[i] + sway + this.smoothWindX * this.depth[i]) * dt;
        this.py[i] += (this.vy[i] + this.smoothWindY * 0.35 * this.depth[i]) * dt;

        if (!burst) {
          if (this.py[i] > h + 28) {
            this.py[i] = -24;
            this.px[i] = Math.random() * w;
          }
          if (this.px[i] > w + 32) this.px[i] = -28;
          else if (this.px[i] < -32) this.px[i] = w + 28;
        }
      } else if (code === 3) {
        // Stars subtle parallax drift
        this.px[i] += (this.vx[i] + this.smoothWindX * 0.14 * this.depth[i]) * dt;
        this.py[i] += (this.vy[i] + this.smoothWindY * 0.14 * this.depth[i]) * dt;
        if (!burst) {
          if (this.px[i] < 0) this.px[i] += w;
          else if (this.px[i] > w) this.px[i] -= w;
          if (this.py[i] < 0) this.py[i] += h;
          else if (this.py[i] > h) this.py[i] -= h;
        }
      } else if (code === 4) {
        // Shooting stars
        this.px[i] += this.vx[i] * dt;
        this.py[i] += this.vy[i] * dt;
        this.life[i] -= dt;
        if (this.life[i] <= 0 || this.px[i] > w + 200 || this.py[i] > h + 200) {
          if (burst) {
            this.active[i] = 0;
          } else {
            const effId = activeEffects[slotIdx] || 'shooting-stars';
            this.initParticle(i, slotIdx, effId, false, i, false);
            this.life[i] = this.maxLife[i];
          }
        }
      } else if (code === 5) {
        // Fireflies wander organically
        const turnX = Math.cos(this.phase[i] * 0.9) * 18 * cfg.speed;
        const turnY = Math.sin(this.phase[i] * 1.1) * 15 * cfg.speed;
        this.px[i] += (this.vx[i] + turnX + this.smoothWindX * 0.35 * this.depth[i]) * dt;
        this.py[i] += (this.vy[i] + turnY + this.smoothWindY * 0.35 * this.depth[i]) * dt;
        if (!burst) {
          if (this.px[i] < -20) this.px[i] = w + 18;
          else if (this.px[i] > w + 20) this.px[i] = -18;
          if (this.py[i] < -20) this.py[i] = h + 18;
          else if (this.py[i] > h + 20) this.py[i] = -18;
        }
      } else {
        // Snow
        const sway = Math.sin(this.phase[i]) * 14 * cfg.speed;
        this.px[i] += (this.vx[i] + sway + this.smoothWindX * 0.65 * this.depth[i]) * dt;
        this.py[i] += (this.vy[i] + this.smoothWindY * 0.25 * this.depth[i]) * dt;
        if (!burst) {
          if (this.py[i] > h + 16) {
            this.py[i] = -14;
            this.px[i] = Math.random() * w;
          }
          if (this.px[i] > w + 16) this.px[i] = -14;
          else if (this.px[i] < -16) this.px[i] = w + 14;
        }
      }
    }
  }

  private renderFrame(_dt: number): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    const halfW = w * 0.5;
    const halfH = h * 0.5;

    for (let i = 0; i < MAX_POOL_SLOTS; i++) {
      if (!this.active[i]) continue;
      const slotIdx = this.effectSlot[i];
      const cfg = this.cachedConfigs[slotIdx] || DEFAULT_EFFECT_CONFIG;
      const palette = this.cachedPalettes[slotIdx] || EFFECT_CATALOG[0].palette;
      const color = palette[this.colorIdx[i]] || palette[0];

      const x = this.px[i];
      const y = this.py[i];
      const size = this.psize[i];
      let a = this.alpha[i] * cfg.opacity;

      if (this.isBurst[i]) {
        a *= Math.max(0, Math.min(1, this.life[i] / this.maxLife[i]));
      }

      if (cfg.centerFade) {
        const dx = (x - halfW) / Math.max(1, halfW);
        const dy = (y - halfH) / Math.max(1, halfH);
        const r = Math.sqrt(dx * dx + dy * dy);
        const fadeMul = Math.min(1, 0.14 + Math.pow(Math.min(1.15, r), 1.65) * 0.92);
        a *= fadeMul;
      }

      if (a <= 0.01) continue;

      const code = this.kind[i];
      drawParticleShape(
        ctx,
        code,
        x,
        y,
        size,
        this.angle[i],
        this.phase[i],
        this.vx[i],
        this.vy[i],
        this.life[i],
        this.maxLife[i],
        this.depth[i],
        a,
        color
      );
    }
    ctx.globalAlpha = 1;
  }

  public destroy(): void {
    this.stopLoop();
    this.resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerdown', this.handlePointerDown);
  }
}

export function drawParticleShape(
  ctx: CanvasRenderingContext2D,
  code: number,
  x: number,
  y: number,
  size: number,
  angle: number,
  phase: number,
  vx: number,
  vy: number,
  life: number,
  maxLife: number,
  depth: number,
  alpha: number,
  color: string
): void {
  if (code === 1) {
    // Hoa anh đào rơi (cánh hoa chẻ đầu, lật 3D theo cos(phase))
    const flipY = 0.42 + 0.58 * Math.abs(Math.cos(phase));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(1, flipY);
    if (depth < 0.65) {
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.72);
    ctx.bezierCurveTo(-size * 0.75, size * 0.2, -size * 0.85, -size * 0.55, -size * 0.22, -size * 0.85);
    ctx.lineTo(0, -size * 0.56);
    ctx.lineTo(size * 0.22, -size * 0.85);
    ctx.bezierCurveTo(size * 0.85, -size * 0.55, size * 0.75, size * 0.2, 0, size * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (code === 2) {
    // Cánh hoa mai rơi (cánh tròn vàng ấm, thỉnh thoảng rơi bông 5 cánh nhỏ)
    const flipY = 0.48 + 0.52 * Math.abs(Math.cos(phase * 0.9));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(1, flipY);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    if (depth > 0.86) {
      // Mini 5-petal blossom
      const r = size * 0.55;
      for (let p = 0; p < 5; p++) {
        const pa = (p * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(pa) * r * 0.68, Math.sin(pa) * r * 0.68, r * 0.48, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.56, size * 0.78, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (code === 3) {
    // Sao lấp lánh
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(phase * 1.4));
    const a = alpha * twinkle;
    ctx.fillStyle = color;
    ctx.globalAlpha = a * 0.28;
    ctx.beginPath();
    ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();

    if (depth > 0.75) {
      // 4-point cross flare
      const len = size * (2.6 + twinkle * 1.5);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(0.7, size * 0.32);
      ctx.beginPath();
      ctx.moveTo(x - len, y);
      ctx.lineTo(x + len, y);
      ctx.moveTo(x, y - len);
      ctx.lineTo(x, y + len);
      ctx.stroke();
    }
  } else if (code === 4) {
    // Sao băng
    const lifeRatio = Math.max(0, Math.min(1, life / Math.max(0.01, maxLife)));
    const fade = Math.sin(lifeRatio * Math.PI);
    const a = alpha * fade;
    if (a <= 0.01) return;

    const mag = Math.hypot(vx, vy) || 1;
    const ux = vx / mag;
    const uy = vy / mag;
    const tailLen = size * 36 * (0.5 + 0.5 * lifeRatio);

    ctx.save();
    const grad = ctx.createLinearGradient(x, y, x - ux * tailLen, y - uy * tailLen);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = a;
    ctx.strokeStyle = grad;
    ctx.lineWidth = size * 1.35;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - ux * tailLen, y - uy * tailLen);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (code === 5) {
    // Đom đóm (phát sáng dịu và nhấp nháy)
    const pulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(phase * 1.5));
    const a = alpha * pulse;
    ctx.fillStyle = color;
    ctx.globalAlpha = a * 0.16;
    ctx.beginPath();
    ctx.arc(x, y, size * 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = a * 0.36;
    ctx.beginPath();
    ctx.arc(x, y, size * 2.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.78, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Tuyết rơi
    ctx.globalAlpha = alpha * 0.25;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.82, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Vẽ khung hình thu nhỏ cho thẻ xem trước hiệu ứng trong thư viện
 */
export function renderEffectThumbnailFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  effectId: EffectId,
  timeSec: number,
  accentHex: string
): void {
  const def = EFFECT_CATALOG.find((e) => e.id === effectId) || EFFECT_CATALOG[0];
  const code = EFFECT_TYPE_CODE[effectId];
  const palette = def.palette;
  ctx.clearRect(0, 0, w, h);

  const count = code === 4 ? 3 : 14;
  for (let i = 0; i < count; i++) {
    const sx = seededRand(i * 11 + code * 31);
    const sy = seededRand(i * 23 + code * 17);
    const color = i % 5 === 0 ? accentHex : palette[i % 3];

    if (code === 1 || code === 2 || code === 6) {
      const spd = 18 + sx * 18;
      const y = ((sy * h + timeSec * spd) % (h + 16)) - 8;
      const x = (sx * w + Math.sin(timeSec * 1.8 + i) * 10 + w) % w;
      const sz = code === 6 ? 2.2 + sy * 2.2 : 4.2 + sy * 3.5;
      drawParticleShape(ctx, code, x, y, sz, timeSec * 1.4 + i, timeSec * 2 + i, 0, 0, 1, 1, 0.7, 0.88, color);
    } else if (code === 3) {
      const x = sx * w;
      const y = sy * h;
      drawParticleShape(ctx, 3, x, y, 1.3 + sx * 1.1, 0, timeSec * 2.2 + i * 1.7, 0, 0, 1, 1, 0.85, 0.9, color);
    } else if (code === 4) {
      const cycle = (timeSec * 0.7 + i * 0.37) % 1;
      const x = (sx * 0.4 + cycle * 0.75) * w;
      const y = (sy * 0.25 + cycle * 0.55) * h;
      drawParticleShape(ctx, 4, x, y, 1.4, 0, 0, 1, 0.6, 1 - cycle, 1, 1, 0.95, color);
    } else {
      const x = ((sx * w + Math.sin(timeSec * 1.1 + i * 2) * 14) + w) % w;
      const y = ((sy * h + Math.cos(timeSec * 0.9 + i * 1.5) * 10) + h) % h;
      drawParticleShape(ctx, 5, x, y, 2.2 + sy * 1.2, 0, timeSec * 2.1 + i, 0, 0, 1, 1, 0.8, 0.9, color);
    }
  }
  ctx.globalAlpha = 1;
}
