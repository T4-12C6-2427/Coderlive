import { EditorTab, WorkspacePreset } from '../types';

export const CANONICAL_LANGUAGES = ['html', 'css', 'js'] as const;
export type LanguageId = (typeof CANONICAL_LANGUAGES)[number];
export type OptionalLanguageId = 'css' | 'js';

export interface RunHiddenTabs {
  css: boolean;
  js: boolean;
}

export interface TabViewSettings {
  languages: LanguageId[];
  runHiddenTabs: RunHiddenTabs;
}

export interface WorkspaceViewState {
  preset: WorkspacePreset;
  splitRatio: number;
  lastSplitPreset: 'split-horizontal' | 'split-vertical';
}

export function normalizeLanguages(langs?: readonly string[] | null): LanguageId[] {
  const set = new Set<string>(Array.isArray(langs) ? langs : []);
  set.add('html');
  return CANONICAL_LANGUAGES.filter((l) => set.has(l));
}

export function getHiddenLanguages(enabledLanguages: readonly LanguageId[]): OptionalLanguageId[] {
  const normalized = normalizeLanguages(enabledLanguages);
  return (['css', 'js'] as const).filter((lang) => !normalized.includes(lang));
}

export function getNearestVisibleTab(
  prevEnabled: readonly LanguageId[],
  removingLang: OptionalLanguageId,
  currentActive: EditorTab
): EditorTab {
  const prevNorm = normalizeLanguages(prevEnabled);
  const nextNorm = normalizeLanguages(prevNorm.filter((l) => l !== removingLang));

  if (currentActive !== removingLang && nextNorm.includes(currentActive)) {
    return currentActive;
  }

  const removedIndex = prevNorm.indexOf(removingLang);
  if (removedIndex > 0) {
    for (let i = removedIndex - 1; i >= 0; i--) {
      if (nextNorm.includes(prevNorm[i])) {
        return prevNorm[i];
      }
    }
  }
  for (let i = Math.max(0, removedIndex + 1); i < prevNorm.length; i++) {
    if (nextNorm.includes(prevNorm[i])) {
      return prevNorm[i];
    }
  }
  return nextNorm[0] || 'html';
}

export function getEffectivePreviewCodes(
  codes: { html: string; css: string; js: string },
  enabledLanguages: readonly LanguageId[],
  runHiddenTabs: RunHiddenTabs
): { html: string; css: string; js: string } {
  const norm = normalizeLanguages(enabledLanguages);
  return {
    html: codes.html,
    css: norm.includes('css') || runHiddenTabs.css ? codes.css : '',
    js: norm.includes('js') || runHiddenTabs.js ? codes.js : '',
  };
}

export function getTabViewStorageKey(params: {
  isSharedView: boolean;
  collabProjectId?: string | null;
  projectId?: string | null;
  userId?: string | null;
}): string | null {
  if (params.isSharedView) return null;
  if (params.collabProjectId) {
    return `coderlive_tab_view_v1_collab_${params.userId || 'anon'}_${params.collabProjectId}`;
  }
  if (params.projectId) {
    return `coderlive_tab_view_v1_proj_${params.userId || 'guest'}_${params.projectId}`;
  }
  return `coderlive_tab_view_v1_scratch_${params.userId || 'guest'}`;
}

export function loadTabViewSettings(
  storageKey: string | null,
  fallbackLanguages: readonly LanguageId[] = CANONICAL_LANGUAGES
): TabViewSettings {
  const fallback: TabViewSettings = {
    languages: normalizeLanguages(fallbackLanguages),
    runHiddenTabs: { css: true, js: true },
  };
  if (!storageKey || typeof localStorage === 'undefined') {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      languages: Array.isArray(parsed?.languages)
        ? normalizeLanguages(parsed.languages)
        : fallback.languages,
      runHiddenTabs: {
        css: typeof parsed?.runHiddenTabs?.css === 'boolean' ? parsed.runHiddenTabs.css : true,
        js: typeof parsed?.runHiddenTabs?.js === 'boolean' ? parsed.runHiddenTabs.js : true,
      },
    };
  } catch {
    return fallback;
  }
}

export function saveTabViewSettings(storageKey: string | null, state: TabViewSettings): void {
  if (!storageKey || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        languages: normalizeLanguages(state.languages),
        runHiddenTabs: {
          css: Boolean(state.runHiddenTabs.css),
          js: Boolean(state.runHiddenTabs.js),
        },
      })
    );
  } catch {
    // Ignore quota errors
  }
}

const VALID_PRESETS: WorkspacePreset[] = ['split-horizontal', 'split-vertical'];

export function getWorkspaceViewStorageKey(userId?: string | null): string {
  return `coderlive_workspace_view_v1_${userId || 'guest'}`;
}

export function loadWorkspaceViewState(userId?: string | null): WorkspaceViewState {
  const legacyPresetKey = 'coderlive_workspace_preset_v1';
  const legacyPresetRaw =
    typeof localStorage !== 'undefined' ? localStorage.getItem(legacyPresetKey) : null;
  const legacyLayout =
    typeof localStorage !== 'undefined' ? localStorage.getItem('coderlive_layout_mode_v1') : null;
  const legacyRatioRaw =
    typeof localStorage !== 'undefined' ? localStorage.getItem('coderlive_split_ratio_v1') : null;
  const legacyRatio = legacyRatioRaw ? parseFloat(legacyRatioRaw) : NaN;

  // Clean up deprecated global preset key (especially if it stored focus-code / focus-preview / zen)
  if (typeof localStorage !== 'undefined' && legacyPresetRaw !== null) {
    try {
      localStorage.removeItem(legacyPresetKey);
    } catch {
      // Ignore storage removal errors
    }
  }

  const defaultSplitPreset: 'split-horizontal' | 'split-vertical' =
    legacyPresetRaw === 'split-vertical' || legacyLayout === 'vertical'
      ? 'split-vertical'
      : 'split-horizontal';

  const defaults: WorkspaceViewState = {
    preset: defaultSplitPreset,
    splitRatio: !isNaN(legacyRatio) && legacyRatio >= 0.18 && legacyRatio <= 0.82 ? legacyRatio : 0.5,
    lastSplitPreset: defaultSplitPreset,
  };

  if (typeof localStorage === 'undefined') return defaults;

  const storageKey = getWorkspaceViewStorageKey(userId);
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);

    const hasValidPreset =
      typeof parsed?.preset === 'string' && VALID_PRESETS.includes(parsed.preset as WorkspacePreset);
    const hasStaleRemovedFields =
      !hasValidPreset ||
      'quickPreviewOpen' in (parsed || {}) ||
      'quickPreviewMode' in (parsed || {});

    const preset: WorkspacePreset = hasValidPreset
      ? (parsed.preset as WorkspacePreset)
      : 'split-horizontal';
    const lastSplitPreset: 'split-horizontal' | 'split-vertical' =
      preset === 'split-vertical' || parsed?.lastSplitPreset === 'split-vertical'
        ? 'split-vertical'
        : 'split-horizontal';
    const ratio = typeof parsed?.splitRatio === 'number' ? parsed.splitRatio : defaults.splitRatio;
    const splitRatio = !isNaN(ratio) && ratio >= 0.18 && ratio <= 0.82 ? ratio : defaults.splitRatio;

    const sanitized: WorkspaceViewState = {
      preset,
      splitRatio,
      lastSplitPreset,
    };

    if (hasStaleRemovedFields) {
      saveWorkspaceViewState(userId, sanitized);
    }

    return sanitized;
  } catch {
    return defaults;
  }
}

export function saveWorkspaceViewState(
  userId: string | null | undefined,
  state: WorkspaceViewState
): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const safePreset: WorkspacePreset = VALID_PRESETS.includes(state.preset)
      ? state.preset
      : 'split-horizontal';
    const safeSplitPreset: 'split-horizontal' | 'split-vertical' =
      state.lastSplitPreset === 'split-vertical' ? 'split-vertical' : 'split-horizontal';
    localStorage.setItem(
      getWorkspaceViewStorageKey(userId),
      JSON.stringify({
        preset: safePreset,
        splitRatio: state.splitRatio,
        lastSplitPreset: safeSplitPreset,
      })
    );
  } catch {
    // Ignore quota errors
  }
}
