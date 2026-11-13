import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ThemeSettings, ThemePreset } from '../types/theme';
import {
  THEME_PRESETS,
  getDefaultThemeSettings,
  isTouchEnvironment,
  loadThemeSettings,
  saveThemeSettings,
  applyThemeToDom,
} from '../lib/themeEngine';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { ACCENT_SWATCHES } from '../lib/themeEngine';

export interface ThemeContextType {
  settings: ThemeSettings;
  activePreset: ThemePreset;
  updateSettings: (partial: Partial<ThemeSettings>) => void;
  applyPreset: (presetId: string) => void;
  resetDefaults: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  randomizeTheme: () => void;
  exportTheme: () => string;
  importTheme: (jsonStr: string) => { success: boolean; message: string };
  toggleThemeMode: () => void;
  isTokenInspectorOpen: boolean;
  setTokenInspectorOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<ThemeSettings>(() => loadThemeSettings());
  const [history, setHistory] = useState<ThemeSettings[]>([]);
  const [future, setFuture] = useState<ThemeSettings[]>([]);
  const [isTokenInspectorOpen, setTokenInspectorOpen] = useState(false);
  const isInitialMount = useRef(true);

  const activePreset = THEME_PRESETS.find((p) => p.id === settings.presetId) || THEME_PRESETS[0];

  // Apply immediately on mount and whenever settings change
  useEffect(() => {
    applyThemeToDom(settings);
    saveThemeSettings(settings);

    // Save to Firestore if user logged in
    const firestore = db;
    if (currentUser?.uid && !isInitialMount.current && firestore) {
      try {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const safeSettings =
          settings.customBgImage &&
          settings.customBgImage.startsWith('data:') &&
          settings.customBgImage.length > 200_000
            ? { ...settings, customBgImage: '' }
            : settings;
        setDoc(userRef, { themeSettings: safeSettings }, { merge: true }).catch((err) => {
          console.error('[Firestore:theme] Không thể đồng bộ theme lên cloud cho user:', currentUser.uid, err);
        });
      } catch (err) {
        console.error('[Firestore:theme] Lỗi khi tạo reference đồng bộ theme:', err);
      }
    }
  }, [settings, currentUser]);

  // Load from Firestore on user login
  useEffect(() => {
    const firestore = db;
    if (!currentUser?.uid || !firestore) return;
    const fetchUserTheme = async () => {
      try {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists() && snap.data()?.themeSettings) {
          const cloudSettings = snap.data().themeSettings;
          setSettings((prev) => ({ ...prev, ...cloudSettings }));
          console.log('[Firestore:theme] Đã tải theme cá nhân hóa từ đám mây.');
        }
      } catch (err) {
        console.error('[Firestore:theme] Lỗi khi tải theme từ cloud:', err);
      }
    };
    fetchUserTheme();
  }, [currentUser]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Keyboard shortcut Ctrl+Shift+D for Dev Token Inspector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setTokenInspectorOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateSettings = useCallback((partial: Partial<ThemeSettings>) => {
    setSettings((prev) => {
      setHistory((h) => [...h.slice(-25), prev]);
      setFuture([]);
      return { ...prev, ...partial };
    });
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSettings((prev) => {
      setHistory((h) => [...h.slice(-25), prev]);
      setFuture([]);
      const nextEffects = preset.activeEffects ? [...preset.activeEffects] : [];
      const nextEffectConfigs = preset.effectConfigs
        ? Object.fromEntries(
            Object.entries(preset.effectConfigs).map(([k, v]) => [k, v ? { ...v } : {}])
          )
        : {};
      const nextDensity =
        isTouchEnvironment() && preset.density === 'compact'
          ? prev.density === 'spacious'
            ? 'spacious'
            : 'comfortable'
          : preset.density;
      return {
        ...prev,
        presetId,
        mode: preset.type,
        accentColor: preset.accent,
        accentColor2: preset.accent2,
        radius: preset.radius,
        density: nextDensity,
        surfaceStyle: preset.surfaceStyle || 'raised',
        tintNeutrals: preset.tintNeutralsDefault,
        uiFont: preset.fontUi,
        editorFontFamily: preset.fontCode,
        // Apply preset background & clean up stale pattern/effect from previous preset
        bgType: preset.bgType || 'solid',
        patternType: preset.patternType || 'none',
        patternOpacity: preset.patternOpacity ?? 0.18,
        patternScale: preset.patternScale ?? 1,
        patternAngle: preset.patternAngle ?? 0,
        patternDensity: preset.patternDensity ?? 1,
        patternColorMode: preset.patternColorMode || 'palette',
        patternColor: preset.patternColor || preset.accent,
        patternVignette: preset.patternVignette ?? true,
        activeEffects: nextEffects,
        activeEffect: nextEffects[0] || 'none',
        effectConfigs: nextEffectConfigs,
      };
    });
  }, []);

  const resetDefaults = useCallback(() => {
    setSettings((prev) => {
      setHistory((h) => [...h.slice(-25), prev]);
      setFuture([]);
      return getDefaultThemeSettings();
    });
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [settings, ...f.slice(0, 25)]);
    setSettings(previous);
  }, [history, settings]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h.slice(-25), settings]);
    setSettings(next);
  }, [future, settings]);

  const randomizeTheme = useCallback(() => {
    // Pick random preset or random creative combo
    const randomPreset = THEME_PRESETS[Math.floor(Math.random() * THEME_PRESETS.length)];
    const randomAccent = ACCENT_SWATCHES[Math.floor(Math.random() * ACCENT_SWATCHES.length)].hex;
    const radii: ('none' | 'sm' | 'md' | 'lg')[] = ['none', 'sm', 'md', 'lg'];
    const randomRadius = radii[Math.floor(Math.random() * radii.length)];
    const densities: ('compact' | 'comfortable' | 'spacious')[] = ['compact', 'comfortable', 'spacious'];
    const randomDensity = densities[Math.floor(Math.random() * densities.length)];
    const surfaceStyles: ('flat' | 'raised' | 'glass' | 'bordered')[] = ['flat', 'raised', 'glass', 'bordered'];
    const randomSurface = surfaceStyles[Math.floor(Math.random() * surfaceStyles.length)];
    const nextEffects = randomPreset.activeEffects ? [...randomPreset.activeEffects] : [];

    setSettings((prev) => {
      setHistory((h) => [...h.slice(-25), prev]);
      setFuture([]);
      return {
        ...prev,
        presetId: randomPreset.id,
        mode: randomPreset.type,
        accentColor: randomPreset.patternType ? randomPreset.accent : randomAccent,
        accentColor2: randomPreset.accent2,
        radius: randomRadius,
        density: randomDensity,
        surfaceStyle: randomSurface,
        tintNeutrals: Math.random() > 0.3,
        bgType: randomPreset.bgType || 'solid',
        patternType: randomPreset.patternType || 'none',
        patternOpacity: randomPreset.patternOpacity ?? 0.18,
        patternScale: randomPreset.patternScale ?? 1,
        patternAngle: randomPreset.patternAngle ?? 0,
        patternDensity: randomPreset.patternDensity ?? 1,
        patternColorMode: randomPreset.patternColorMode || 'palette',
        patternColor: randomPreset.patternColor || randomPreset.accent,
        patternVignette: randomPreset.patternVignette ?? true,
        activeEffects: nextEffects,
        activeEffect: nextEffects[0] || 'none',
        effectConfigs: randomPreset.effectConfigs ? { ...randomPreset.effectConfigs } : {},
      };
    });
  }, []);

  const exportTheme = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    // Create download link
    try {
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `htmlive-theme-${settings.presetId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Lỗi khi tải tệp theme:', e);
    }
    return dataStr;
  }, [settings]);

  const importTheme = useCallback((jsonStr: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Định dạng JSON không hợp lệ.' };
      }
      if (!parsed.presetId && !parsed.accentColor) {
        return { success: false, message: 'Tệp JSON không chứa cấu hình giao diện hợp lệ.' };
      }

      setSettings((prev) => {
        setHistory((h) => [...h.slice(-25), prev]);
        setFuture([]);
        return {
          ...prev,
          ...parsed,
        };
      });
      return { success: true, message: 'Đã nhập cấu hình giao diện thành công!' };
    } catch (e) {
      return { success: false, message: `Lỗi đọc JSON: ${e instanceof Error ? e.message : 'Lỗi không xác định'}` };
    }
  }, []);

  const toggleThemeMode = useCallback(() => {
    setSettings((prev) => {
      const nextMode = prev.mode === 'dark' ? 'light' : 'dark';
      // Find preset for opposite mode if possible, or adjust
      const matchingPreset = THEME_PRESETS.find(
        (p) => p.type === nextMode && (p.id === 'paper' || p.id === 'midnight')
      );
      setHistory((h) => [...h.slice(-25), prev]);
      setFuture([]);
      return {
        ...prev,
        mode: nextMode,
        presetId: matchingPreset ? matchingPreset.id : prev.presetId,
      };
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        activePreset,
        updateSettings,
        applyPreset,
        resetDefaults,
        undo,
        redo,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        randomizeTheme,
        exportTheme,
        importTheme,
        toggleThemeMode,
        isTokenInspectorOpen,
        setTokenInspectorOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
