import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TemplatePrefs } from '../types';

const STORAGE_KEY_PREFIX = 'coderlive_template_prefs_v1_';
const MAX_RECENTS = 4;
const MAX_FAVORITES = 100;

let inMemoryPrefs: Record<string, TemplatePrefs> = {};

function getLocalStorageKey(uid?: string | null): string {
  return `${STORAGE_KEY_PREFIX}${uid || 'guest'}`;
}

function normalizeIds(raw: unknown, maxLen: number): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
    if (result.length >= maxLen) break;
  }
  return result;
}

export function loadLocalTemplatePrefs(uid?: string | null): TemplatePrefs {
  const key = getLocalStorageKey(uid);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        favorites: normalizeIds(parsed?.favorites, MAX_FAVORITES),
        recentIds: normalizeIds(parsed?.recentIds, MAX_RECENTS),
        updatedAt: typeof parsed?.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      };
    }
  } catch {
    // Fallback to memory store if localStorage is unavailable
  }
  return (
    inMemoryPrefs[key] || {
      favorites: [],
      recentIds: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export function saveLocalTemplatePrefs(prefs: TemplatePrefs, uid?: string | null): void {
  const key = getLocalStorageKey(uid);
  const sanitized: TemplatePrefs = {
    favorites: normalizeIds(prefs.favorites, MAX_FAVORITES),
    recentIds: normalizeIds(prefs.recentIds, MAX_RECENTS),
    updatedAt: prefs.updatedAt || new Date().toISOString(),
  };
  inMemoryPrefs[key] = sanitized;
  try {
    localStorage.setItem(key, JSON.stringify(sanitized));
  } catch {
    // Ignore storage quota / sandbox restrictions
  }
}

export async function loadCloudTemplatePrefs(uid: string): Promise<TemplatePrefs> {
  const local = loadLocalTemplatePrefs(uid);
  if (!db || !uid) return local;

  try {
    const ref = doc(db, 'users', uid, 'templatePrefs', 'default');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return local;
    }
    const data = snap.data();
    const cloud: TemplatePrefs = {
      favorites: normalizeIds(data?.favorites, MAX_FAVORITES),
      recentIds: normalizeIds(data?.recentIds, MAX_RECENTS),
      updatedAt: typeof data?.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
    };

    // Merge local favorites/recents with cloud so offline actions aren't lost
    const mergedFavorites = normalizeIds(
      [...cloud.favorites, ...local.favorites],
      MAX_FAVORITES
    );
    const mergedRecents = normalizeIds(
      [...local.recentIds, ...cloud.recentIds],
      MAX_RECENTS
    );
    const merged: TemplatePrefs = {
      favorites: mergedFavorites,
      recentIds: mergedRecents,
      updatedAt: new Date().toISOString(),
    };
    saveLocalTemplatePrefs(merged, uid);

    if (
      merged.favorites.length !== cloud.favorites.length ||
      merged.recentIds.join(',') !== cloud.recentIds.join(',')
    ) {
      await setDoc(ref, merged, { merge: false });
    }

    return merged;
  } catch {
    return local;
  }
}

export async function saveCloudTemplatePrefs(prefs: TemplatePrefs, uid?: string | null): Promise<TemplatePrefs> {
  const sanitized: TemplatePrefs = {
    favorites: normalizeIds(prefs.favorites, MAX_FAVORITES),
    recentIds: normalizeIds(prefs.recentIds, MAX_RECENTS),
    updatedAt: new Date().toISOString(),
  };
  saveLocalTemplatePrefs(sanitized, uid);

  if (db && uid) {
    try {
      const ref = doc(db, 'users', uid, 'templatePrefs', 'default');
      await setDoc(ref, sanitized, { merge: false });
    } catch {
      // Local prefs already saved; fail silently if offline
    }
  }
  return sanitized;
}

export function toggleFavoriteTemplateId(current: TemplatePrefs, templateId: string): TemplatePrefs {
  const exists = current.favorites.includes(templateId);
  const nextFavorites = exists
    ? current.favorites.filter((id) => id !== templateId)
    : [templateId, ...current.favorites].slice(0, MAX_FAVORITES);

  return {
    ...current,
    favorites: nextFavorites,
    updatedAt: new Date().toISOString(),
  };
}

export function recordRecentTemplateId(current: TemplatePrefs, templateId: string): TemplatePrefs {
  const nextRecents = [templateId, ...current.recentIds.filter((id) => id !== templateId)].slice(
    0,
    MAX_RECENTS
  );
  return {
    ...current,
    recentIds: nextRecents,
    updatedAt: new Date().toISOString(),
  };
}
