import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock,
  FilterX,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { CodeTemplate, TemplateCategory, TemplateDifficulty } from '../types';
import {
  CODE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplateLineCount,
  hasTemplateCss,
  hasTemplateHtml,
  hasTemplateJs,
  isTemplateHtmlOnly,
} from '../constants/templates';
import { matchesQuery } from '../lib/searchUtils';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/Feedback';
import { TemplateThumbnail } from './TemplateThumbnail';

export interface TemplatesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CodeTemplate) => void;
  onOpenTemplatePreview?: (template: CodeTemplate) => void;
  activeTemplateId?: string;
  favoriteIds?: string[];
  recentIds?: string[];
  onToggleFavorite?: (templateId: string) => void;
}

type CategoryFilter = 'Tất cả' | TemplateCategory;
type DifficultyFilter = 'Tất cả' | TemplateDifficulty;
type SortMode = 'newest' | 'az' | 'easiest';

const DIFFICULTY_RANK: Record<TemplateDifficulty, number> = {
  'Dễ': 1,
  'Trung bình': 2,
  'Nâng cao': 3,
};

const INITIAL_RENDER_BATCH = 12;
const RENDER_BATCH_STEP = 12;

export const TemplatesDrawer: React.FC<TemplatesDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onOpenTemplatePreview,
  activeTemplateId,
  favoriteIds = [],
  recentIds = [],
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Tất cả');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('Tất cả');
  const [onlyHtml, setOnlyHtml] = useState(false);
  const [onlyHasJs, setOnlyHasJs] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_RENDER_BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      'Tất cả': CODE_TEMPLATES.length,
      'Trang web': 0,
      'Thành phần giao diện': 0,
      'Ứng dụng nhỏ': 0,
      'Trò chơi': 0,
      'Hiệu ứng & Canvas': 0,
      'Học tập': 0,
    };
    for (const tmpl of CODE_TEMPLATES) {
      counts[tmpl.category] = (counts[tmpl.category] || 0) + 1;
    }
    return counts;
  }, []);

  const recentTemplates = useMemo(() => {
    if (!recentIds.length) return [];
    const byId = new Map(CODE_TEMPLATES.map((t) => [t.id, t]));
    return recentIds
      .map((id) => byId.get(id))
      .filter((t): t is CodeTemplate => Boolean(t))
      .slice(0, 4);
  }, [recentIds]);

  const filteredTemplates = useMemo(() => {
    const list = CODE_TEMPLATES.filter((tmpl) => {
      if (selectedCategory !== 'Tất cả' && tmpl.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'Tất cả' && tmpl.difficulty !== selectedDifficulty) return false;
      if (onlyHtml && !isTemplateHtmlOnly(tmpl)) return false;
      if (onlyHasJs && !hasTemplateJs(tmpl)) return false;
      if (onlyFavorites && !favoriteSet.has(tmpl.id)) return false;
      if (
        searchQuery.trim() &&
        !matchesQuery(
          searchQuery,
          tmpl.name,
          tmpl.description,
          tmpl.category,
          ...(tmpl.tags || [])
        )
      ) {
        return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sortMode === 'az') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortMode === 'easiest') {
      sorted.sort((a, b) => {
        const diffDelta = DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
        if (diffDelta !== 0) return diffDelta;
        return b.createdOrder - a.createdOrder;
      });
    } else {
      sorted.sort((a, b) => b.createdOrder - a.createdOrder);
    }
    return sorted;
  }, [
    selectedCategory,
    selectedDifficulty,
    onlyHtml,
    onlyHasJs,
    onlyFavorites,
    favoriteSet,
    searchQuery,
    sortMode,
  ]);

  // Đặt lại số thẻ hiển thị ban đầu khi bộ lọc thay đổi
  useEffect(() => {
    setVisibleLimit(INITIAL_RENDER_BATCH);
  }, [
    selectedCategory,
    selectedDifficulty,
    onlyHtml,
    onlyHasJs,
    onlyFavorites,
    searchQuery,
    sortMode,
    isOpen,
  ]);

  // Nạp thêm thẻ dần khi cuộn tới cuối danh sách
  useEffect(() => {
    if (!isOpen) return;
    if (visibleLimit >= filteredTemplates.length) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleLimit((prev) =>
            Math.min(filteredTemplates.length, prev + RENDER_BATCH_STEP)
          );
        }
      },
      { rootMargin: '180px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isOpen, visibleLimit, filteredTemplates.length]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'Tất cả' ||
    selectedDifficulty !== 'Tất cả' ||
    onlyHtml ||
    onlyHasJs ||
    onlyFavorites;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tất cả');
    setSelectedDifficulty('Tất cả');
    setOnlyHtml(false);
    setOnlyHasJs(false);
    setOnlyFavorites(false);
  };

  const handleOpenTemplate = (tmpl: CodeTemplate) => {
    if (onOpenTemplatePreview) {
      onOpenTemplatePreview(tmpl);
    } else {
      onSelectTemplate(tmpl);
      onClose();
    }
  };

  const visibleTemplates = filteredTemplates.slice(0, visibleLimit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="full"
      fullScreenMobile={true}
      className="md:w-[min(1140px,95vw)] md:h-[min(790px,90vh)]"
      bodyClassName="flex-1 min-h-0 flex flex-col overflow-hidden"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-warning" strokeWidth={1.75} />
          <span>Thư viện mẫu có sẵn</span>
        </div>
      }
      description="Khám phá, xem trước trực tiếp và áp dụng các mẫu giao diện thực hành"
    >
      {/* Vùng bộ lọc cố định phía trên */}
      <div className="px-4 sm:px-6 pt-3.5 pb-3 border-b border-subtle bg-elevated space-y-3 flex-shrink-0">
        {/* Hàng tìm kiếm + sắp xếp + bộ đếm */}
        <div className="flex flex-col md:flex-row md:items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              strokeWidth={1.5}
            />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mô tả, chủ đề hoặc thẻ..."
              aria-label="Tìm kiếm mẫu có sẵn"
              className="w-full min-h-[44px] md:min-h-[36px] pl-9 pr-9 text-base md:text-xs bg-panel border border-default rounded-[var(--radius-sm)] text-primary placeholder-muted outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Xóa từ khóa tìm kiếm"
                className="min-w-[36px] min-h-[36px] absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-muted hover:text-primary rounded-[var(--radius-xs)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 flex-shrink-0">
            <label htmlFor="template-sort-select" className="text-xs text-muted whitespace-nowrap">
              Sắp xếp:
            </label>
            <select
              id="template-sort-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="min-h-[44px] md:min-h-[36px] px-2.5 text-base md:text-xs bg-panel border border-default rounded-[var(--radius-sm)] text-primary outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="az">A–Z</option>
              <option value="easiest">Dễ trước</option>
            </select>
          </div>
        </div>

        {/* Hàng danh mục có số lượng */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
          role="tablist"
          aria-label="Danh mục mẫu"
        >
          {(['Tất cả', ...TEMPLATE_CATEGORIES] as CategoryFilter[]).map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[44px] md:min-h-[32px] px-3 py-1 rounded-[var(--radius-sm)] text-xs font-medium whitespace-nowrap inline-flex items-center gap-1.5 border transition-colors cursor-pointer flex-shrink-0 ${
                  active
                    ? 'bg-accent text-accent-on border-transparent'
                    : 'bg-panel text-secondary hover:text-primary border-default hover:border-strong'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-[var(--radius-xs)] ${
                    active ? 'bg-elevated/20 text-accent-on' : 'bg-elevated text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hàng bộ lọc phụ & bộ đếm kết quả */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Độ khó */}
            <select
              aria-label="Lọc theo độ khó"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyFilter)}
              className="min-h-[44px] md:min-h-[30px] px-2.5 text-base md:text-xs bg-panel border border-default rounded-[var(--radius-sm)] text-secondary outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] cursor-pointer"
            >
              <option value="Tất cả">Độ khó: Tất cả</option>
              <option value="Dễ">Độ khó: Dễ</option>
              <option value="Trung bình">Độ khó: Trung bình</option>
              <option value="Nâng cao">Độ khó: Nâng cao</option>
            </select>

            <button
              type="button"
              aria-pressed={onlyHtml}
              onClick={() => {
                setOnlyHtml((prev) => {
                  const next = !prev;
                  if (next) setOnlyHasJs(false);
                  return next;
                });
              }}
              className={`min-h-[44px] md:min-h-[30px] px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium border transition-colors cursor-pointer ${
                onlyHtml
                  ? 'bg-accent-soft text-accent border-[var(--accent-base)]/40'
                  : 'bg-panel text-secondary hover:text-primary border-default'
              }`}
            >
              Chỉ HTML
            </button>

            <button
              type="button"
              aria-pressed={onlyHasJs}
              onClick={() => {
                setOnlyHasJs((prev) => {
                  const next = !prev;
                  if (next) setOnlyHtml(false);
                  return next;
                });
              }}
              className={`min-h-[44px] md:min-h-[30px] px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium border transition-colors cursor-pointer ${
                onlyHasJs
                  ? 'bg-accent-soft text-accent border-[var(--accent-base)]/40'
                  : 'bg-panel text-secondary hover:text-primary border-default'
              }`}
            >
              Có JS
            </button>

            <button
              type="button"
              aria-pressed={onlyFavorites}
              onClick={() => setOnlyFavorites((prev) => !prev)}
              className={`min-h-[44px] md:min-h-[30px] px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium border inline-flex items-center gap-1 transition-colors cursor-pointer ${
                onlyFavorites
                  ? 'bg-warning-soft text-warning border-[var(--color-warning)]/40'
                  : 'bg-panel text-secondary hover:text-primary border-default'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
              <span>Yêu thích ({favoriteIds.length})</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-[44px] md:min-h-[30px] px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium text-muted hover:text-primary hover:bg-[var(--border-subtle)] inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Xóa lọc</span>
              </button>
            )}
          </div>

          <span
            aria-live="polite"
            className="text-xs font-medium text-secondary tabular-nums"
          >
            Hiển thị {filteredTemplates.length}/{CODE_TEMPLATES.length} mẫu
          </span>
        </div>
      </div>

      {/* Vùng cuộn danh sách mẫu */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 bg-panel/40">
        {/* Mục Gần đây (tối đa 4 mẫu dùng gần nhất) */}
        {recentTemplates.length > 0 && !hasActiveFilters && (
          <section className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Gần đây</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {recentTemplates.map((tmpl) => (
                <button
                  key={`recent-${tmpl.id}`}
                  type="button"
                  onClick={() => handleOpenTemplate(tmpl)}
                  className="min-h-[48px] text-left p-2.5 rounded-[var(--radius-md)] bg-elevated hover:bg-[var(--border-subtle)] border border-default hover:border-[var(--accent-base)]/40 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-primary group-hover:text-accent truncate">
                      {tmpl.name}
                    </div>
                    <div className="text-[11px] text-muted truncate">
                      {tmpl.category}
                    </div>
                  </div>
                  <Badge variant="default" size="sm">
                    {tmpl.difficulty}
                  </Badge>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Trạng thái trống hoặc lưới thẻ mẫu */}
        {filteredTemplates.length === 0 ? (
          <EmptyState
            icon={<Search className="w-5 h-5" />}
            title="Không tìm thấy mẫu phù hợp"
            description="Hãy thử đổi từ khóa tìm kiếm, chọn danh mục khác hoặc đặt lại bộ lọc."
            action={
              hasActiveFilters ? (
                <Button variant="secondary" size="md" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleTemplates.map((tmpl) => {
                const isActive = activeTemplateId === tmpl.id;
                const isFav = favoriteSet.has(tmpl.id);
                const lineCount = getTemplateLineCount(tmpl);
                const hasHtml = hasTemplateHtml(tmpl);
                const hasCss = hasTemplateCss(tmpl);
                const hasJs = hasTemplateJs(tmpl);
                const difficultyVariant =
                  tmpl.difficulty === 'Dễ'
                    ? 'success'
                    : tmpl.difficulty === 'Trung bình'
                    ? 'warning'
                    : 'danger';

                return (
                  <article
                    key={tmpl.id}
                    className={`relative group rounded-[var(--radius-md)] border bg-elevated transition-all flex flex-col overflow-hidden ${
                      isActive
                        ? 'border-[var(--accent-base)] ring-1 ring-[var(--accent-base)]/30 shadow-[var(--shadow-subtle)]'
                        : 'border-default hover:border-strong hover:shadow-[var(--shadow-subtle)]'
                    }`}
                  >
                    {/* Nút Yêu thích tách riêng (không lồng button) */}
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(tmpl.id)}
                        aria-pressed={isFav}
                        aria-label={
                          isFav
                            ? `Bỏ thích mẫu ${tmpl.name}`
                            : `Yêu thích mẫu ${tmpl.name}`
                        }
                        className={`absolute top-2.5 right-2.5 z-10 min-w-[44px] min-h-[44px] md:min-w-[34px] md:min-h-[34px] rounded-[var(--radius-sm)] border flex items-center justify-center transition-colors cursor-pointer ${
                          isFav
                            ? 'bg-warning-soft text-warning border-[var(--color-warning)]/40'
                            : 'bg-elevated/90 text-muted hover:text-primary border-default'
                        }`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`}
                          strokeWidth={1.75}
                        />
                      </button>
                    )}

                    {/* Nút chính mở xem trước mẫu */}
                    <button
                      type="button"
                      onClick={() => handleOpenTemplate(tmpl)}
                      className="text-left flex-1 flex flex-col cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-base)]"
                    >
                      <TemplateThumbnail template={tmpl} />

                      <div className="p-3.5 flex-1 flex flex-col gap-2 w-full">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-primary group-hover:text-accent transition-colors line-clamp-1">
                            {tmpl.name}
                          </h3>
                        </div>

                        <p className="text-xs text-secondary line-clamp-2 leading-relaxed min-h-[2.4em]">
                          {tmpl.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <Badge variant={isActive ? 'accent' : 'default'} size="sm">
                            {tmpl.category}
                          </Badge>
                          <Badge variant={difficultyVariant} size="sm">
                            {tmpl.difficulty}
                          </Badge>
                        </div>

                        <div className="mt-auto pt-2.5 border-t border-subtle flex items-center justify-between gap-2 text-[11px] text-muted">
                          <div className="flex items-center gap-1">
                            {hasHtml && (
                              <span className="px-1.5 py-0.5 rounded bg-panel border border-subtle font-mono text-[10px]">
                                HTML
                              </span>
                            )}
                            {hasCss && (
                              <span className="px-1.5 py-0.5 rounded bg-panel border border-subtle font-mono text-[10px]">
                                CSS
                              </span>
                            )}
                            {hasJs && (
                              <span className="px-1.5 py-0.5 rounded bg-panel border border-subtle font-mono text-[10px]">
                                JS
                              </span>
                            )}
                          </div>
                          <span className="font-mono tabular-nums">{lineCount} dòng</span>
                        </div>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>

            {visibleLimit < filteredTemplates.length && (
              <div ref={sentinelRef} className="pt-2 flex justify-center">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    setVisibleLimit((prev) =>
                      Math.min(filteredTemplates.length, prev + RENDER_BATCH_STEP)
                    )
                  }
                >
                  Tải thêm mẫu ({filteredTemplates.length - visibleLimit} mẫu còn lại)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
