import { LanguageId, normalizeLanguages } from './editorWorkspaceUtils';

export interface GuestDraft {
  id: string;
  title: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  languages: LanguageId[];
  savedAt: string;
}

export interface RecentProjectRef {
  id: string;
  kind: 'personal' | 'collab';
  title: string;
  openedAt: string;
}

export const GUEST_DRAFTS_STORAGE_KEY = 'coderlive_guest_drafts_v1';
export const MAX_GUEST_DRAFTS = 5;
export const MAX_RECENT_PROJECTS = 5;

const SCRATCH_TABS_KEY = 'coderlive_code_tabs_v2';
const SCRATCH_LEGACY_KEY = 'coderlive_code_content_v1';
const SCRATCH_TAB_VIEW_GUEST_KEY = 'coderlive_tab_view_v1_scratch_guest';

export function getRecentProjectsStorageKey(uid: string): string {
  return `coderlive_recent_projects_${uid}_v1`;
}

export function getGuestDrafts(): GuestDraft[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (d): d is GuestDraft =>
          Boolean(d && typeof d === 'object' && typeof d.id === 'string' && typeof d.savedAt === 'string')
      )
      .slice(0, MAX_GUEST_DRAFTS);
  } catch {
    return [];
  }
}

export function saveGuestDraft(input: {
  title?: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  languages?: readonly LanguageId[];
}): { drafts: GuestDraft[]; added: GuestDraft | null } {
  const htmlCode = input.htmlCode || '';
  const cssCode = input.cssCode || '';
  const jsCode = input.jsCode || '';

  if (!htmlCode.trim() && !cssCode.trim() && !jsCode.trim()) {
    return { drafts: getGuestDrafts(), added: null };
  }

  const existing = getGuestDrafts();
  // Avoid duplicating the exact latest draft
  const top = existing[0];
  if (
    top &&
    top.htmlCode === htmlCode &&
    top.cssCode === cssCode &&
    top.jsCode === jsCode
  ) {
    return { drafts: existing, added: null };
  }

  const draft: GuestDraft = {
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title:
      input.title && input.title.trim() && input.title.trim() !== 'Dự án chưa đặt tên'
        ? input.title.trim()
        : 'Bản nháp chưa đặt tên',
    htmlCode,
    cssCode,
    jsCode,
    languages: normalizeLanguages(input.languages),
    savedAt: new Date().toISOString(),
  };

  // FIFO: keep max 5 newest drafts, drop oldest beyond limit
  const next = [draft, ...existing].slice(0, MAX_GUEST_DRAFTS);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(GUEST_DRAFTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors
    }
  }
  return { drafts: next, added: draft };
}

export function deleteGuestDraft(draftId: string): GuestDraft[] {
  const next = getGuestDrafts().filter((d) => d.id !== draftId);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(GUEST_DRAFTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }
  return next;
}

/**
 * On startup in guest mode: if previous guest session left non-empty scratch code
 * in localStorage, preserve it into the FIFO "Bản nháp gần nhất" list (max 5)
 * and clear scratch keys so the editor starts completely empty.
 */
export function capturePreviousGuestDraftOnStartup(options?: {
  ignoreDefaultHtml?: string;
  ignoreDefaultCss?: string;
  ignoreDefaultJs?: string;
}): { capturedDraft: GuestDraft | null; drafts: GuestDraft[] } {
  if (typeof localStorage === 'undefined') {
    return { capturedDraft: null, drafts: [] };
  }

  let prevHtml = '';
  let prevCss = '';
  let prevJs = '';
  let prevTitle = '';

  try {
    const savedTabsRaw = localStorage.getItem(SCRATCH_TABS_KEY);
    if (savedTabsRaw) {
      const parsed = JSON.parse(savedTabsRaw);
      prevHtml = typeof parsed?.htmlCode === 'string' ? parsed.htmlCode : '';
      prevCss = typeof parsed?.cssCode === 'string' ? parsed.cssCode : '';
      prevJs = typeof parsed?.jsCode === 'string' ? parsed.jsCode : '';
      prevTitle = typeof parsed?.title === 'string' ? parsed.title : '';
    } else {
      const legacy = localStorage.getItem(SCRATCH_LEGACY_KEY);
      if (legacy) {
        prevHtml = legacy;
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Always clear scratch keys so editor starts empty
  try {
    localStorage.removeItem(SCRATCH_TABS_KEY);
    localStorage.removeItem(SCRATCH_LEGACY_KEY);
  } catch {
    // Ignore removal errors
  }

  const isLegacyWelcomeSample =
    options?.ignoreDefaultHtml !== undefined &&
    prevHtml === options.ignoreDefaultHtml &&
    prevCss === (options.ignoreDefaultCss ?? '') &&
    prevJs === (options.ignoreDefaultJs ?? '');

  if (isLegacyWelcomeSample || (!prevHtml.trim() && !prevCss.trim() && !prevJs.trim())) {
    return { capturedDraft: null, drafts: getGuestDrafts() };
  }

  let languages: LanguageId[] = ['html', 'css', 'js'];
  try {
    const viewRaw = localStorage.getItem(SCRATCH_TAB_VIEW_GUEST_KEY);
    if (viewRaw) {
      const parsedView = JSON.parse(viewRaw);
      if (Array.isArray(parsedView?.languages)) {
        languages = normalizeLanguages(parsedView.languages);
      }
    }
  } catch {
    // Ignore parse errors
  }

  const { drafts, added } = saveGuestDraft({
    title: prevTitle,
    htmlCode: prevHtml,
    cssCode: prevCss,
    jsCode: prevJs,
    languages,
  });

  return { capturedDraft: added, drafts };
}

export function getRecentProjects(uid?: string | null): RecentProjectRef[] {
  if (!uid || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getRecentProjectsStorageKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is RecentProjectRef =>
          Boolean(
            item &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              (item.kind === 'personal' || item.kind === 'collab') &&
              typeof item.title === 'string'
          )
      )
      .slice(0, MAX_RECENT_PROJECTS);
  } catch {
    return [];
  }
}

export function recordRecentProject(
  uid: string | null | undefined,
  entry: { id: string; kind: 'personal' | 'collab'; title: string }
): RecentProjectRef[] {
  if (!uid || typeof localStorage === 'undefined' || !entry.id) return [];
  const existing = getRecentProjects(uid).filter(
    (item) => !(item.id === entry.id && item.kind === entry.kind)
  );
  const next: RecentProjectRef[] = [
    {
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      openedAt: new Date().toISOString(),
    },
    ...existing,
  ].slice(0, MAX_RECENT_PROJECTS);

  try {
    localStorage.setItem(getRecentProjectsStorageKey(uid), JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  return next;
}

export function removeRecentProject(
  uid: string | null | undefined,
  id: string,
  kind: 'personal' | 'collab'
): RecentProjectRef[] {
  if (!uid || typeof localStorage === 'undefined') return [];
  const next = getRecentProjects(uid).filter((item) => !(item.id === id && item.kind === kind));
  try {
    localStorage.setItem(getRecentProjectsStorageKey(uid), JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  return next;
}
