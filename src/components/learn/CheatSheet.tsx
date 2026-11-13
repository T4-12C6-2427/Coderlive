import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Eye,
  Terminal,
  FileQuestion,
  Sparkles,
  ExternalLink,
  Code2,
  X,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { CheatEntry, ExampleKind } from '../../types/learning';
import { HTML_CHEAT_ENTRIES } from '../../data/cheatsheet-html';
import { CSS_CHEAT_ENTRIES } from '../../data/cheatsheet-css';
import { JS_CHEAT_ENTRIES } from '../../data/cheatsheet-js';
import { matchesQuery } from '../../lib/searchUtils';
import { CheatExampleModal } from './CheatExampleModal';
import { useIsTouch } from '../../hooks/useViewport';

interface CheatSheetProps {
  course: 'html' | 'css' | 'js';
  onOpenInEditor?: (code: string) => void;
}

export const CheatSheet: React.FC<CheatSheetProps> = ({ course, onOpenInEditor }) => {
  const isTouch = useIsTouch();
  // Load data source based on course
  const entries: CheatEntry[] = useMemo(() => {
    switch (course) {
      case 'html':
        return HTML_CHEAT_ENTRIES;
      case 'css':
        return CSS_CHEAT_ENTRIES;
      case 'js':
        return JS_CHEAT_ENTRIES;
      default:
        return HTML_CHEAT_ENTRIES;
    }
  }, [course]);

  // Course metadata
  const courseMeta = useMemo(() => {
    switch (course) {
      case 'html':
        return {
          title: 'Bảng Tra Cứu Thẻ HTML (Cheat Sheet)',
          subtitle: 'Tổng hợp các thẻ HTML chuẩn, phân loại rõ thẻ hiển thị và thẻ cấu trúc hậu trường, kèm giải thích trực quan.',
          termHeader: 'Cú pháp / Thẻ',
          searchPlaceholder: 'Tìm theo thẻ (<p>, <img>...), ý nghĩa, mẹo...',
        };
      case 'css':
        return {
          title: 'Bảng Tra Cứu Thuộc Tính CSS (Cheat Sheet)',
          subtitle: 'Cẩm nang toàn diện về bộ chọn, màu sắc, Flexbox, Grid, căn lề và hiệu ứng giao diện.',
          termHeader: 'Cú pháp / Thuộc tính',
          searchPlaceholder: 'Tìm theo thuộc tính (display, flex...), giá trị hoặc ý nghĩa...',
        };
      case 'js':
        return {
          title: 'Bảng Tra Cứu Cú Pháp JavaScript (Cheat Sheet)',
          subtitle: 'Toàn bộ từ khóa, toán tử, vòng lặp, hàm, mảng, DOM với code mẫu thực tế có thể chạy trực tiếp.',
          termHeader: 'Cú pháp / Từ khóa',
          searchPlaceholder: 'Tìm theo từ khóa (let, function, map...), ý nghĩa hoặc mẹo...',
        };
    }
  }, [course]);

  // Categories extraction with count
  const categories = useMemo(() => {
    const list: string[] = ['Tất cả'];
    const seen = new Set<string>();
    entries.forEach((e) => {
      if (!seen.has(e.category)) {
        seen.add(e.category);
        list.push(e.category);
      }
    });
    return list;
  }, [entries]);

  // Persisted search and category state
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return localStorage.getItem(`coderlive_cheatsheet_${course}_cat`) || 'Tất cả';
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return localStorage.getItem(`coderlive_cheatsheet_${course}_search`) || '';
  });

  const [activeModalEntry, setActiveModalEntry] = useState<CheatEntry | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(`coderlive_cheatsheet_${course}_cat`, selectedCategory);
  }, [selectedCategory, course]);

  useEffect(() => {
    localStorage.setItem(`coderlive_cheatsheet_${course}_search`, searchQuery);
  }, [searchQuery, course]);

  // Support deep links like #tra-cuu/js/let or #tra-cuu/html/head
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#tra-cuu/')) {
      const parts = hash.replace('#tra-cuu/', '').split('/');
      const [hashCourse, hashId] = parts;
      if (hashCourse === course && hashId) {
        const found = entries.find((e) => e.id.toLowerCase() === hashId.toLowerCase());
        if (found) {
          setActiveModalEntry(found);
        }
      }
    }
  }, [course, entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      const matchCat = selectedCategory === 'Tất cả' || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        matchesQuery(item.term, searchQuery) ||
        matchesQuery(item.name || item.meaning, searchQuery) ||
        matchesQuery(item.description || item.meaning, searchQuery) ||
        matchesQuery(item.tip, searchQuery) ||
        matchesQuery(item.example.code, searchQuery) ||
        matchesQuery(item.category, searchQuery);

      return matchCat && matchSearch;
    });
  }, [entries, selectedCategory, searchQuery]);

  // Group entries by category for clear section grouping
  const groupedEntries = useMemo(() => {
    const groups: { [cat: string]: CheatEntry[] } = {};
    filteredEntries.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredEntries]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: { [cat: string]: number } = {
      'Tất cả': entries.length,
    };
    entries.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [entries]);

  // Helper for button label & icon based on kind
  const renderActionButton = (item: CheatEntry) => {
    const kind = item.example.kind;
    switch (kind) {
      case 'render':
        return (
          <button
            type="button"
            onClick={() => setActiveModalEntry(item)}
            className="touch-target-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-accent-soft hover:bg-accent text-accent hover:text-[var(--text-on-accent)] border border-[var(--accent-base)]/30 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            title={isTouch ? undefined : 'Xem kết quả trực quan trên trang'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem kết quả</span>
          </button>
        );
      case 'console':
        return (
          <button
            type="button"
            onClick={() => setActiveModalEntry(item)}
            className="touch-target-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-accent-soft hover:bg-accent text-accent hover:text-[var(--text-on-accent)] border border-[var(--accent-base)]/30 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            title={isTouch ? undefined : 'Chạy thử code mẫu và xem kết quả Console'}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Chạy thử</span>
          </button>
        );
      case 'explain':
        return (
          <button
            type="button"
            onClick={() => setActiveModalEntry(item)}
            className="touch-target-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-elevated hover:bg-panel text-secondary hover:text-primary border border-default text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            title={isTouch ? undefined : 'Xem giải thích và cách hoạt động hậu trường'}
          >
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            <span>Xem giải thích</span>
          </button>
        );
      case 'mixed':
        return (
          <button
            type="button"
            onClick={() => setActiveModalEntry(item)}
            className="touch-target-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-accent-soft hover:bg-accent text-accent hover:text-[var(--text-on-accent)] border border-[var(--accent-base)]/30 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            title={isTouch ? undefined : 'Xem tương tác trực tiếp và phân tích cấu trúc'}
          >
            <Sparkles className="w-3.5 h-3.5 text-warning" />
            <span>Xem & phân tích</span>
          </button>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto md:overflow-hidden overscroll-contain bg-app text-primary">
      {/* Header & Filter Bar (scrolls naturally with page on phones/landscape, docked on md+) */}
      <div className="p-3.5 pl-safe pr-safe sm:p-6 border-b border-subtle bg-elevated flex-shrink-0 space-y-3 sm:space-y-4">
        {/* Title area */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h1 className="text-fluid-h1 sm:text-2xl font-extrabold text-primary tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-accent flex-shrink-0" />
              <span className="min-w-0 break-words">{courseMeta.title}</span>
            </h1>
            <p className="text-fluid-body sm:text-sm text-secondary prose-measure leading-relaxed">
              {courseMeta.subtitle}
            </p>
          </div>

          {/* Search Box with Clear Button */}
          <div className="relative w-full sm:w-80 flex-shrink-0">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={courseMeta.searchPlaceholder}
              aria-label={courseMeta.searchPlaceholder}
              className="w-full pl-9 pr-9 py-2 bg-panel border border-default rounded-[var(--radius-sm)] text-xs text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent-base)] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="touch-hit-expand absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-primary transition-colors cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips with counts & Result Counter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center touch-gap gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`touch-target-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-accent text-[var(--text-on-accent)] shadow-xs'
                      : 'bg-panel hover:bg-hover text-secondary border border-subtle'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : 'bg-elevated text-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result Counter */}
          <div className="text-xs text-muted font-medium whitespace-nowrap flex-shrink-0">
            Hiển thị <span className="font-bold text-primary">{filteredEntries.length}</span> / {entries.length} mục
          </div>
        </div>
      </div>

      {/* Main Content Area: Responsive Table (Desktop) / Cards (Mobile) */}
      <div className="md:flex-1 md:overflow-y-auto md:overscroll-contain p-4 pl-safe pr-safe pb-[max(2rem,var(--safe-bottom))] sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
        {filteredEntries.length === 0 ? (
          <div className="py-12 sm:py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-panel border border-subtle flex items-center justify-center mx-auto text-muted">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-primary">Không tìm thấy mục tra cứu nào</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Không có kết quả nào khớp với từ khóa "{searchQuery}". Bạn có thể thử tìm từ khóa không dấu hoặc chọn nhóm khác.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Tất cả');
              }}
              className="touch-target-h mt-2 px-4 py-2 text-xs font-semibold rounded-[var(--radius-sm)] bg-panel border border-default text-primary hover:bg-hover cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([catName, catItems]) => (
            <div key={catName} className="space-y-3">
              {/* Category Group Heading */}
              <div className="flex items-center gap-2 pb-1 border-b border-subtle">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                  {catName}
                </h2>
                <span className="text-[11px] text-muted font-mono">({catItems.length})</span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-[var(--radius-lg)] border border-default bg-panel overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-secondary border-collapse">
                  <thead className="bg-elevated text-muted border-b border-subtle font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5 pl-5 w-48">{courseMeta.termHeader}</th>
                      <th className="p-3.5 w-64">Ý nghĩa</th>
                      <th className="p-3.5 w-60">Ví dụ ngắn</th>
                      <th className="p-3.5">Mẹo</th>
                      <th className="p-3.5 pr-5 text-right w-36">Xem ví dụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {catItems.map((item) => (
                      <tr
                        key={item.id}
                        id={`row-${item.id}`}
                        className="hover:bg-hover transition-colors group"
                      >
                        {/* Term */}
                        <td className="p-3.5 pl-5 font-mono font-bold text-accent align-top">
                          <div className="inline-block px-2.5 py-1 rounded-[var(--radius-sm)] bg-accent-soft border border-[var(--accent-base)]/25 group-hover:border-[var(--accent-base)] transition-colors whitespace-nowrap">
                            {item.term}
                          </div>
                        </td>

                        {/* Name & Meaning */}
                        <td className="p-3.5 align-top">
                          <p className="font-bold text-primary text-xs">{item.name || item.meaning}</p>
                          <p className="text-[11px] text-secondary mt-1 leading-relaxed">
                            {item.description || item.meaning}
                          </p>
                        </td>

                        {/* Short Syntax / Code Snippet */}
                        <td className="p-3.5 align-top">
                          <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--code-bg)] border border-subtle font-mono text-[11px] text-accent overflow-x-auto whitespace-pre max-w-xs">
                            <code>{item.example.code.split('\n')[0]}</code>
                          </div>
                        </td>

                        {/* Tip / Analogy */}
                        <td className="p-3.5 align-top text-[11px] text-muted leading-relaxed">
                          <span className="text-secondary">{item.tip}</span>
                        </td>

                        {/* Action button */}
                        <td className="p-3.5 pr-5 text-right align-top">
                          {renderActionButton(item)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-[var(--radius-md)] border border-default bg-panel space-y-3 shadow-xs min-w-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                      <span className="font-mono font-bold text-sm text-accent px-2 py-0.5 rounded bg-accent-soft border border-[var(--accent-base)]/20 max-w-full truncate">
                        {item.term}
                      </span>
                      <span className="text-[10px] text-muted px-2 py-0.5 rounded-full bg-elevated border border-subtle truncate max-w-full">
                        {item.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-primary text-xs">{item.name || item.meaning}</h3>
                      <p className="text-xs text-secondary mt-1 leading-relaxed">{item.description || item.meaning}</p>
                    </div>

                    <div className="p-2 rounded bg-[var(--code-bg)] border border-subtle font-mono text-[11px] text-accent overflow-x-auto whitespace-pre">
                      {item.example.code.split('\n')[0]}
                    </div>

                    <p className="text-[11px] text-muted italic">Mẹo: {item.tip}</p>

                    <div className="pt-2 border-t border-subtle flex justify-end">
                      {renderActionButton(item)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Adaptive Example Modal */}
      {activeModalEntry && (
        <CheatExampleModal
          entry={activeModalEntry}
          course={course}
          onClose={() => setActiveModalEntry(null)}
          onOpenInEditor={onOpenInEditor}
        />
      )}
    </div>
  );
};
