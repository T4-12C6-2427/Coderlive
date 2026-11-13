export type ThemeMode = 'dark' | 'light';

export type RadiusStyle = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type DensityStyle = 'compact' | 'comfortable' | 'spacious';

export type SurfaceStyle = 'flat' | 'raised' | 'glass' | 'bordered';

export type PatternType =
  | 'none'
  // 22 Geometric & Classic Patterns
  | 'stripes-v'
  | 'stripes-h'
  | 'stripes-diag'
  | 'checker'
  | 'gingham'
  | 'dots'
  | 'dots-fine'
  | 'grid'
  | 'graph-paper'
  | 'zigzag'
  | 'waves'
  | 'hexagon'
  | 'fishscale'
  | 'seigaiha'
  | 'asanoha'
  | 'diamond'
  | 'brick'
  | 'triangles'
  | 'cross'
  | 'plus-grid'
  | 'houndstooth'
  | 'isometric'
  // 8 Floral Inline SVG Patterns
  | 'floral-sakura'
  | 'floral-peach'
  | 'floral-apricot'
  | 'floral-lotus'
  | 'floral-sunflower'
  | 'floral-rose'
  | 'floral-lavender'
  | 'floral-foliage'
  // Legacy compatibility aliases
  | 'stripes'
  | 'sakura'
  | 'squares';

export type EffectCategoryId = 'flowers' | 'sky' | 'weather' | 'tech';

export type EffectColorMode = 'accent' | 'custom' | 'palette';

export type EffectId =
  | 'sakura-petals'
  | 'apricot-petals'
  | 'twinkling-stars'
  | 'shooting-stars'
  | 'fireflies'
  | 'snow';

export type EffectType = 'none' | EffectId | 'stars' | 'matrix-rain';

export interface EffectConfig {
  amount: number; // 0.25 - 2.0
  speed: number; // 0.25 - 2.5
  size: number; // 0.5 - 2.2
  opacity: number; // 0.1 - 1.0
  colorMode: EffectColorMode;
  customColor: string;
  centerFade: boolean;
}

export type PersonalizeSection =
  | 'presets'
  | 'accent'
  | 'patterns'
  | 'custom-bg'
  | 'editor'
  | 'layout'
  | 'typography'
  | 'effects'
  | 'sync';

export type PresetCategoryTag = 'floral' | 'animated' | 'pattern' | 'contrast';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  type: ThemeMode;
  categories?: PresetCategoryTag[];
  bgApp: string;
  bgPanel: string;
  bgElevated: string;
  bgInput: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  accent: string;
  accent2: string;
  radius: RadiusStyle;
  density: DensityStyle;
  surfaceStyle?: SurfaceStyle;
  tintNeutralsDefault: boolean;
  codeBg: string;
  codeGutter: string;
  codeSelection: string;
  codeLineHighlight: string;
  synKeyword: string;
  synTag: string;
  synAttr: string;
  synString: string;
  synNumber: string;
  synFunction: string;
  synComment: string;
  synProperty: string;
  synValue: string;
  fontUi: string;
  fontCode: string;
  // Background preset defaults (Stage 3)
  bgType?: 'solid' | 'gradient' | 'mesh';
  patternType?: PatternType;
  patternOpacity?: number;
  patternScale?: number;
  patternAngle?: number;
  patternDensity?: number;
  patternColorMode?: EffectColorMode;
  patternColor?: string;
  patternVignette?: boolean;
  activeEffects?: EffectId[];
  effectConfigs?: Partial<Record<EffectId, Partial<EffectConfig>>>;
}

export interface ThemeSettings {
  presetId: string;
  mode: ThemeMode;
  accentColor: string;
  accentColor2?: string;
  tintNeutrals: boolean;
  radius: RadiusStyle;
  density: DensityStyle;
  surfaceStyle: SurfaceStyle;
  surfaceOpacity?: number; // 0.40 to 1.0 (default 0.88)
  editorSurfaceOpacity?: number; // 0.88 to 1.0 (default 0.88)
  editorFontSize: number;
  editorFontFamily: string;
  editorLineNumbers: boolean;
  editorWordWrap: boolean;
  previewBg: 'dark' | 'light' | 'checker';
  uiFont: string;

  // Static pattern engine (Stage 2)
  bgType?: 'solid' | 'gradient' | 'mesh';
  patternType?: PatternType;
  patternOpacity?: number; // Hard-capped at 0.60
  patternScale?: number; // 0.5 to 2.5
  patternAngle?: number; // 0 to 360 deg
  patternDensity?: number; // 0.5 to 2.0 (especially for florals)
  patternColorMode?: EffectColorMode;
  patternColor?: string;
  patternVignette?: boolean;

  // Custom user background image (Stage 4)
  customBgImage?: string;
  customBgOpacity?: number;
  customBgBlur?: number;
  customBgFit?: 'cover' | 'contain' | 'tile';

  // Animated background canvas engine (Stage 2)
  enableAnimations?: boolean;
  enableBlur?: boolean;
  activeEffect?: EffectType;
  activeEffects?: EffectId[]; // Up to 3 combined effects
  effectConfigs?: Partial<Record<EffectId, Partial<EffectConfig>>>;
  batterySaver?: boolean;
  mouseWind?: boolean;
  clickBurst?: boolean;

  // Collaborative presence, privacy & chat preferences
  collabHighlightInserts?: boolean;
  collabHideRemoteCursors?: boolean;
  collabHideOwnCursor?: boolean;
  collabChatSound?: boolean;

  // Corner FPS meter preferences
  showFps?: boolean;
  fpsCorner?: FpsCorner;
}

export type FpsCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

