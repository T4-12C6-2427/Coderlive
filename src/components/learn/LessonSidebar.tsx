import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle2, Circle, ChevronRight, Menu, X, BookOpen } from 'lucide-react';
import { Lesson } from '../../types/learning';
import { ProgressBar } from './ProgressBar';

interface LessonSidebarProps {
  lessons: Lesson[];
  activeLessonId: number | string;
  onSelectLesson: (id: any) => void;
  completedLessonIds: (number | string)[];
}

/**
 * Dev-time validation check for lesson ordering & contiguous topic groups.
 */
function validateLessonOrdering(lessons: Lesson[]) {
  if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
    const orders = lessons.map((l) => l.order);
    const orderSet = new Set(orders);
    if (orderSet.size !== orders.length) {
      console.warn('[HTMLLive Dev Warning] Phát hiện trùng lặp thứ tự (order) trong danh sách bài học:', orders);
    }

    // Check contiguous topic grouping
    const seenTopics = new Set<string>();
    let currentTopic = '';
    const sorted = [...lessons].sort((a, b) => a.order - b.order);
    for (const l of sorted) {
      if (l.topic !== currentTopic) {
        if (seenTopics.has(l.topic)) {
          console.warn(
            `[HTMLLive Dev Warning] Chủ đề "${l.topic}" xuất hiện không liền mạch tại bài #${l.order} (${l.title})`
          );
        }
        seenTopics.add(l.topic);
        currentTopic = l.topic;
      }
    }
  }
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  lessons,
  activeLessonId,
  onSelectLesson,
  completedLessonIds,
}) => {
  const [search, setSearch] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Run dev validation on mount/lessons change
  useEffect(() => {
    validateLessonOrdering(lessons);
  }, [lessons]);

  // Sort lessons strictly by numeric order
  const sortedLessons = useMemo(() => {
    return [...lessons].sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
  }, [lessons]);

  // Contiguous topics in the order they appear
  const topics = useMemo(() => {
    const list: string[] = [];
    sortedLessons.forEach((l) => {
      if (!list.includes(l.topic)) {
        list.push(l.topic);
      }
    });
    return list;
  }, [sortedLessons]);

  // Filter lessons
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sortedLessons;
    return sortedLessons.filter((l) => {
      const matchOrder = String(l.order ?? l.id) === q || `bài ${l.order ?? l.id}`.includes(q);
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchTopic = l.topic.toLowerCase().includes(q);
      const matchTags = l.tags.some((t) => t.toLowerCase().includes(q));
      return matchOrder || matchTitle || matchTopic || matchTags;
    });
  }, [sortedLessons, search]);

  const handleLessonPick = (id: number | string) => {
    onSelectLesson(id);
    setIsMobileOpen(false);
  };

  const activeLesson = sortedLessons.find((l) => l.id === activeLessonId);

  const sidebarContent = (
    <div className="flex flex-col h-full space-y-4">
      {/* Progress Bar */}
      <ProgressBar completedCount={completedLessonIds.length} totalCount={sortedLessons.length} />

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm bài học, chủ đề hoặc từ khóa..."
          aria-label="Tìm bài học, chủ đề hoặc từ khóa"
          className="w-full pl-8 pr-3 py-1.5 bg-panel border border-default rounded-[var(--radius-sm)] text-xs text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent-base)] transition-all"
        />
      </div>

      {/* Lesson List Grouped by Contiguous Topic */}
      <div className="flex-1 overflow-y-auto overscroll-contain space-y-4 pr-1">
        {topics.map((topic) => {
          const topicLessons = filtered.filter((l) => l.topic === topic);
          if (topicLessons.length === 0) return null;

          return (
            <div key={topic} className="space-y-1.5">
              <div className="px-2 text-[11px] font-bold text-muted uppercase tracking-wider flex items-center justify-between">
                <span>{topic}</span>
                <span className="text-[10px] text-muted font-mono font-normal">
                  ({topicLessons.length})
                </span>
              </div>

              <div className="space-y-1">
                {topicLessons.map((l) => {
                  const isActive = l.id === activeLessonId;
                  const isDone = completedLessonIds.includes(l.id);
                  const displayTitle = `Bài ${l.order}: ${l.title}`;

                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleLessonPick(l.id)}
                      title={displayTitle}
                      className={`touch-target-h w-full text-left px-3 py-2 rounded-[var(--radius-sm)] text-xs transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        isActive
                          ? 'bg-accent text-[var(--text-on-accent)] font-semibold shadow-xs'
                          : 'bg-panel hover:bg-hover text-secondary hover:text-primary border border-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isDone ? (
                          <CheckCircle2
                            className={`w-4 h-4 flex-shrink-0 ${
                              isActive ? 'text-[var(--text-on-accent)]' : 'text-success'
                            }`}
                          />
                        ) : (
                          <Circle
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isActive ? 'text-[var(--text-on-accent)] opacity-70' : 'text-muted'
                            }`}
                          />
                        )}
                        <span className="truncate">{displayTitle}</span>
                      </div>

                      <ChevronRight
                        className={`w-3 h-3 flex-shrink-0 ${
                          isActive ? 'text-[var(--text-on-accent)]' : 'text-muted'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-6 text-center text-muted text-xs">
            Không tìm thấy bài học nào phù hợp với từ khóa &quot;{search}&quot;.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden p-2.5 sm:p-3 pl-safe pr-safe bg-panel border-b border-subtle flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="touch-target-h flex-1 min-w-0 flex items-center gap-2 text-xs font-semibold text-primary bg-elevated px-3 py-1.5 rounded-[var(--radius-sm)] border border-default cursor-pointer"
        >
          {isMobileOpen ? <X className="w-4 h-4 flex-shrink-0" /> : <Menu className="w-4 h-4 flex-shrink-0" />}
          <span className="truncate">
            {activeLesson ? `Bài ${activeLesson.order}: ${activeLesson.title}` : 'Danh sách bài học'}
          </span>
        </button>

        <span className="text-xs text-accent font-mono font-bold flex-shrink-0 whitespace-nowrap">
          {completedLessonIds.length}/{sortedLessons.length}
          <span className="hidden min-[400px]:inline"> hoàn thành</span>
        </span>
      </div>

      {/* Mobile Drawer (Bottom Sheet on phones, centered dialog on tablet) */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-overlay backdrop-blur-sm p-0 sm:p-4 pt-safe sm:pb-safe sm:pl-safe sm:pr-safe flex items-end sm:items-center justify-center animate-in fade-in overscroll-contain"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="bg-elevated border-t sm:border border-default rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-lg)] p-4 pb-[max(1rem,var(--safe-bottom))] sm:pb-4 w-full sm:max-w-lg h-[82dvh] max-h-viewport-88 flex flex-col shadow-[var(--shadow-overlay)] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" />
            </div>
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <span className="text-sm font-bold text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                <span>Mục lục bài học</span>
              </span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Đóng mục lục bài học"
                className="touch-target p-1.5 text-muted hover:text-primary rounded-[var(--radius-sm)] cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">{sidebarContent}</div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 h-full p-4 border-r border-subtle bg-app glass-panel overflow-hidden select-none">
        {sidebarContent}
      </aside>
    </>
  );
};
