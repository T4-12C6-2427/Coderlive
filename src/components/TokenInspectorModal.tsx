import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check, AlertTriangle, Eye, RefreshCw, Sparkles, Sliders } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getContrastRatio } from '../lib/themeEngine';

export const TokenInspectorModal: React.FC = () => {
  const { isTokenInspectorOpen, setTokenInspectorOpen, settings, activePreset } = useTheme();
  const [filter, setFilter] = useState('');
  const [highlightActive, setHighlightActive] = useState(false);
  const [hardcodedCount, setHardcodedCount] = useState<number | null>(null);

  // Read current computed tokens from documentElement
  const [computedTokens, setComputedTokens] = useState<Array<{ name: string; value: string; category: string }>>([]);

  const refreshTokens = () => {
    if (typeof window === 'undefined') return;
    const style = getComputedStyle(document.documentElement);
    const tokenNames = [
      '--bg-app',
      '--bg-panel',
      '--bg-elevated',
      '--bg-overlay',
      '--bg-input',
      '--bg-hover',
      '--bg-active',
      '--bg-selected',
      '--text-primary',
      '--text-secondary',
      '--text-muted',
      '--text-disabled',
      '--text-on-accent',
      '--text-link',
      '--border-subtle',
      '--border-default',
      '--border-strong',
      '--border-focus',
      '--accent',
      '--accent-hover',
      '--accent-active',
      '--accent-soft',
      '--accent-border',
      '--accent-text',
      '--accent-2',
      '--color-success',
      '--color-warning',
      '--color-danger',
      '--color-info',
      '--code-bg',
      '--code-gutter',
      '--code-selection',
      '--code-line-highlight',
      '--code-font-size',
      '--syn-keyword',
      '--syn-tag',
      '--syn-attr',
      '--syn-string',
      '--syn-number',
      '--syn-function',
      '--syn-comment',
      '--syn-property',
      '--syn-value',
      '--radius-xs',
      '--radius-sm',
      '--radius-md',
      '--radius-lg',
      '--radius-xl',
      '--font-sans',
      '--font-mono',
    ];

    const tokens = tokenNames.map((name) => {
      let category = 'Chung';
      if (name.startsWith('--bg')) category = 'Nền (Background)';
      else if (name.startsWith('--text')) category = 'Chữ (Text)';
      else if (name.startsWith('--border')) category = 'Đường viền (Border)';
      else if (name.startsWith('--accent')) category = 'Điểm nhấn (Accent)';
      else if (name.startsWith('--color')) category = 'Ngữ nghĩa (Semantic)';
      else if (name.startsWith('--code') || name.startsWith('--syn')) category = 'Trình soạn thảo (Code)';
      else if (name.startsWith('--radius')) category = 'Bo góc (Radius)';
      else if (name.startsWith('--font')) category = 'Phông chữ (Font)';

      return {
        name,
        value: style.getPropertyValue(name).trim(),
        category,
      };
    });

    setComputedTokens(tokens);
  };

  useEffect(() => {
    if (isTokenInspectorOpen) {
      refreshTokens();
    }
  }, [isTokenInspectorOpen, settings]);

  // Highlight elements using hardcoded colors in DOM
  const toggleHighlightHardcoded = () => {
    if (highlightActive) {
      // Remove highlight outline
      const highlighted = document.querySelectorAll('[data-hardcoded-detected]');
      highlighted.forEach((el) => {
        (el as HTMLElement).style.outline = '';
        el.removeAttribute('data-hardcoded-detected');
      });
      setHighlightActive(false);
      setHardcodedCount(null);
    } else {
      // Scan DOM
      let count = 0;
      const allElements = document.body.querySelectorAll('*');
      allElements.forEach((el) => {
        // Skip inspector itself and preview iframe
        if (el.closest('#token-inspector-portal') || el.tagName === 'IFRAME') return;

        const classList = el.className;
        if (typeof classList === 'string') {
          // Check for Tailwind hardcoded palette classes
          const hasHardcoded = /\b(bg|text|border)-(slate|gray|zinc|neutral|stone|indigo|blue|purple|pink|rose|amber|emerald|red)-(400|500|600|700|800|900|950)\b/.test(
            classList
          );
          if (hasHardcoded) {
            (el as HTMLElement).style.outline = '2px dashed #f43f5e';
            el.setAttribute('data-hardcoded-detected', 'true');
            count++;
          }
        }
      });
      setHardcodedCount(count);
      setHighlightActive(true);
    }
  };

  // Clean up outlines on unmount
  useEffect(() => {
    return () => {
      const highlighted = document.querySelectorAll('[data-hardcoded-detected]');
      highlighted.forEach((el) => {
        (el as HTMLElement).style.outline = '';
        el.removeAttribute('data-hardcoded-detected');
      });
    };
  }, []);

  if (!isTokenInspectorOpen) return null;

  const filtered = computedTokens.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.value.toLowerCase().includes(filter.toLowerCase()) ||
      t.category.toLowerCase().includes(filter.toLowerCase())
  );

  const contrastWithApp = getContrastRatio(settings.accentColor, activePreset.bgApp);
  const contrastWithPanel = getContrastRatio(settings.accentColor, activePreset.bgPanel);

  return createPortal(
    <div
      id="token-inspector-portal"
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-end p-2 sm:p-4 pb-[max(0.5rem,var(--safe-bottom))] bg-black/40 backdrop-blur-xs pointer-events-none"
    >
      <div className="w-full sm:w-[500px] max-h-viewport-85 bg-elevated border border-strong rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] flex flex-col text-primary pointer-events-auto overflow-hidden animate-in slide-in-from-right-4 duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-subtle flex items-center justify-between gap-2 bg-panel">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-[var(--radius-xs)] bg-accent text-accent-on flex items-center justify-center flex-shrink-0">
              <Sliders className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-primary truncate">Bộ Thanh Tra Biến Giao Diện (Token Inspector)</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent-soft text-accent border border-[var(--accent-base)]/30 font-semibold flex-shrink-0">
                  Dev Tool
                </span>
              </div>
              <p className="shortcut-hint text-[10px] text-muted">
                Phím tắt bật/tắt: <kbd className="px-1 py-0.2 bg-app rounded border border-default font-mono">Ctrl+Shift+D</kbd>
              </p>
            </div>
          </div>
          <button
            onClick={() => setTokenInspectorOpen(false)}
            className="touch-target inline-flex items-center justify-center p-1 rounded-[var(--radius-xs)] text-muted hover:text-primary hover:bg-[var(--border-subtle)] cursor-pointer flex-shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contrast Check Strip */}
        <div className="px-3.5 py-2.5 bg-app border-b border-subtle flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] text-muted block">Tương phản vs Nền:</span>
              <span className={`font-mono text-xs font-bold ${contrastWithApp >= 4.5 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                {contrastWithApp.toFixed(2)}:1 {contrastWithApp >= 4.5 ? '✓ AA Đạt' : '⚠ Dưới AA'}
              </span>
            </div>
            <div className="h-6 w-px bg-default" />
            <div>
              <span className="text-[10px] text-muted block">Tương phản vs Khung:</span>
              <span className={`font-mono text-xs font-bold ${contrastWithPanel >= 4.5 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                {contrastWithPanel.toFixed(2)}:1 {contrastWithPanel >= 4.5 ? '✓ AA Đạt' : '⚠ Dưới AA'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleHighlightHardcoded}
            className={`touch-target-h px-3 py-1.5 text-xs font-medium rounded-[var(--radius-xs)] border transition-all cursor-pointer flex items-center gap-1.5 ${
              highlightActive
                ? 'bg-danger-soft text-danger border-danger/50 shadow-xs'
                : 'bg-elevated hover:bg-[var(--border-subtle)] text-secondary border-default'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{highlightActive ? `Tắt viền (${hardcodedCount ?? 0})` : 'Quét màu cứng'}</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="p-2 border-b border-subtle flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 sm:top-2 text-muted pointer-events-none" />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Lọc biến token (--accent, --bg...)..."
              className="w-full h-9 sm:h-7 pl-8 sm:pl-7 pr-2.5 text-xs bg-panel border border-default rounded-[var(--radius-xs)] text-primary placeholder-muted outline-none focus:border-[var(--accent-base)]"
            />
          </div>
          <button
            onClick={refreshTokens}
            className="touch-target inline-flex items-center justify-center p-1 text-muted hover:text-primary rounded-[var(--radius-xs)] hover:bg-[var(--border-subtle)] cursor-pointer"
            title="Làm mới giá trị tính toán"
            aria-label="Làm mới giá trị tính toán"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tokens List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2 text-xs divide-y divide-subtle">
          {filtered.map((t) => (
            <div key={t.name} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[11px] font-semibold text-primary truncate" title={t.name}>
                  {t.name}
                </div>
                <div className="text-[10px] text-muted truncate">{t.category}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Color swatch if value looks like a color */}
                {(t.value.startsWith('#') || t.value.startsWith('rgb')) && (
                  <div
                    style={{ backgroundColor: t.value }}
                    className="w-4 h-4 rounded-[var(--radius-xs)] border border-default shadow-xs flex-shrink-0"
                  />
                )}
                <span
                  className="font-mono text-[11px] text-secondary bg-panel px-1.5 py-0.5 rounded border border-default max-w-[140px] truncate select-all"
                  title={t.value}
                >
                  {t.value || '(chưa tính)'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-subtle bg-panel text-[11px] text-muted flex items-center justify-between">
          <span>{filtered.length} biến token đang hoạt động</span>
          <span>Preset: <strong className="text-primary">{activePreset.name}</strong></span>
        </div>
      </div>
    </div>,
    document.body
  );
};
