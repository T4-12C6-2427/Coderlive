import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Table,
  CheckCircle2,
  Check,
  Sun,
  Moon,
  Sparkles,
  Code2,
  Palette,
  ChevronDown,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { LESSONS } from '../../data/lessons';
import { JS_LESSONS } from '../../data/lessons-js';
import { CSS_LESSONS } from '../../data/lessons-css';
import { COURSES } from '../../data/courses';
import { CourseId, CourseInfo, Lesson } from '../../types/learning';
import { LessonSidebar } from './LessonSidebar';
import { LessonView } from './LessonView';
import { CheatSheet } from './CheatSheet';
import { TagCheatSheet } from './TagCheatSheet';
import { JsCheatSheet } from './JsCheatSheet';
import { ErrorBoundary } from './ErrorBoundary';
import { getCompletedLessons, saveCompletedLessons } from '../../services/learningService';
import { useAuth } from '../../contexts/AuthContext';
import { useIsTouch } from '../../hooks/useViewport';

interface LearnPageProps {
  onBackToEditor: () => void;
  onOpenInEditor: (code: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  onBackToEditor,
  onOpenInEditor,
  theme,
  onToggleTheme,
}) => {
  const { currentUser } = useAuth();
  const isTouch = useIsTouch();

  // Active Course state (persisted)
  const [activeCourseId, setActiveCourseId] = useState<CourseId>(() => {
    const saved = localStorage.getItem('coderlive_active_course');
    return (saved as CourseId) || 'html';
  });

  const [showCourseSelector, setShowCourseSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'lessons' | 'cheatSheet'>('lessons');
  const [activeLessonId, setActiveLessonId] = useState<number | string>(1);
  const [completedLessonIds, setCompletedLessonIds] = useState<(number | string)[]>([]);

  // Track progress counts for all courses to show in dropdown
  const [htmlCompletedCount, setHtmlCompletedCount] = useState<number>(0);
  const [cssCompletedCount, setCssCompletedCount] = useState<number>(0);
  const [jsCompletedCount, setJsCompletedCount] = useState<number>(0);

  // Trigger ref & coords for portal-based dropdown
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number } | null>(null);

  // Current course lessons sorted strictly by order
  const currentLessons = useMemo(() => {
    const raw =
      activeCourseId === 'js'
        ? JS_LESSONS
        : activeCourseId === 'css'
        ? CSS_LESSONS
        : LESSONS;
    return [...raw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [activeCourseId]);

  const currentCourse = COURSES.find((c) => c.id === activeCourseId) || COURSES[0];

  // Course badge styling helper
  const getCourseBadge = (id: CourseId) => {
    switch (id) {
      case 'html':
        return { label: 'HTML', bg: 'bg-[var(--course-html)]', text: 'text-white' };
      case 'css':
        return { label: 'CSS', bg: 'bg-[var(--course-css)]', text: 'text-white' };
      case 'js':
        return { label: 'JS', bg: 'bg-[var(--course-js)]', text: 'text-white' };
    }
  };

  // Save selected course preference
  useEffect(() => {
    localStorage.setItem('coderlive_active_course', activeCourseId);
  }, [activeCourseId]);

  // Load progress counts for all courses on mount / user change
  useEffect(() => {
    getCompletedLessons(currentUser?.uid, 'html').then((list) => {
      setHtmlCompletedCount(list.length);
      if (activeCourseId === 'html') {
        setCompletedLessonIds(list);
      }
    });

    getCompletedLessons(currentUser?.uid, 'css').then((list) => {
      setCssCompletedCount(list.length);
      if (activeCourseId === 'css') {
        setCompletedLessonIds(list);
      }
    });

    getCompletedLessons(currentUser?.uid, 'js').then((list) => {
      setJsCompletedCount(list.length);
      if (activeCourseId === 'js') {
        setCompletedLessonIds(list);
      }
    });
  }, [currentUser, activeCourseId]);

  // Load or restore active lesson when course changes
  useEffect(() => {
    const savedLesson = localStorage.getItem(`coderlive_last_lesson_${activeCourseId}`);
    if (savedLesson) {
      const found = currentLessons.find((l) => String(l.id) === savedLesson);
      if (found) {
        setActiveLessonId(found.id);
        return;
      }
    }
    // Default to lesson with order 1
    const firstLesson = currentLessons[0];
    if (firstLesson) {
      setActiveLessonId(firstLesson.id);
    }
  }, [activeCourseId, currentLessons]);

  // Persist current lesson position
  useEffect(() => {
    localStorage.setItem(`coderlive_last_lesson_${activeCourseId}`, String(activeLessonId));
  }, [activeLessonId, activeCourseId]);

  // Handle open dropdown and calculate position
  const handleToggleDropdown = () => {
    if (!showCourseSelector && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const top = rect.bottom + 6;
      const menuWidth = Math.min(320, window.innerWidth - 24);
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - menuWidth - 12));
      setMenuCoords({ top, left });
      setShowCourseSelector(true);
    } else {
      setShowCourseSelector(false);
    }
  };

  // Close dropdown on Escape or outside click
  useEffect(() => {
    if (!showCourseSelector) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCourseSelector(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCourseSelector]);

  // Handle course switch
  const handleSelectCourse = (targetCourseId: CourseId) => {
    if (targetCourseId === activeCourseId) {
      setShowCourseSelector(false);
      return;
    }

    // Persist current lesson before switching
    localStorage.setItem(`coderlive_last_lesson_${activeCourseId}`, String(activeLessonId));

    setActiveCourseId(targetCourseId);
    setShowCourseSelector(false);
    setActiveTab('lessons');
  };

  const handleToggleComplete = async (lessonId: number | string) => {
    const isDone = completedLessonIds.includes(lessonId);
    const updated = isDone
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];

    setCompletedLessonIds(updated);
    if (activeCourseId === 'html') setHtmlCompletedCount(updated.length);
    if (activeCourseId === 'css') setCssCompletedCount(updated.length);
    if (activeCourseId === 'js') setJsCompletedCount(updated.length);

    await saveCompletedLessons(updated, currentUser?.uid, activeCourseId);
  };

  // Find current, prev, next lessons based on sorted order
  const currentLesson = currentLessons.find((l) => l.id === activeLessonId) || currentLessons[0];
  const currentIdx = currentLessons.findIndex((l) => l.id === activeLessonId);
  const prevLesson = currentIdx > 0 ? currentLessons[currentIdx - 1] : undefined;
  const nextLesson = currentIdx < currentLessons.length - 1 ? currentLessons[currentIdx + 1] : undefined;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden select-none bg-transparent text-primary font-sans transition-colors">
      {/* Learn Header Bar (Slim 48px on desktop, safe-area & touch-aware on mobile) */}
      <header className="pt-safe pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] sm:pl-[max(1rem,var(--safe-left))] sm:pr-[max(1rem,var(--safe-right))] min-h-[calc(48px+var(--safe-top))] bg-elevated border-b border-subtle flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0 z-20 whitespace-nowrap overflow-x-hidden">
        {/* Left: Back button + Course Selector Trigger */}
        <div className="touch-gap flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBackToEditor}
            className="touch-target h-7 px-2.5 text-xs font-medium text-secondary hover:text-primary bg-elevated hover:bg-[var(--border-subtle)] rounded-[var(--radius-sm)] border border-default transition-all flex-shrink-0 flex items-center justify-center gap-1.5 cursor-pointer outline-none"
            title={isTouch ? undefined : 'Quay lại trình soạn thảo chính'}
            aria-label="Quay lại trình soạn thảo chính"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
            <span className="hidden sm:inline">Quay lại Editor</span>
          </button>

          <div className="h-5 w-px bg-[var(--border-subtle)] hidden sm:block" />

          {/* Course Selector Button Trigger */}
          <button
            ref={triggerRef}
            onClick={handleToggleDropdown}
            aria-haspopup="true"
            aria-expanded={showCourseSelector}
            className="touch-target-h h-8 px-2 sm:px-2.5 rounded-[var(--radius-sm)] bg-panel hover:bg-hover text-xs font-bold text-primary border border-default transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer min-w-0 focus-visible:ring-1 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
            title={isTouch ? undefined : 'Đổi khóa học lập trình'}
            aria-label={`Khóa học hiện tại: ${currentCourse.title}. Nhấn để đổi khóa học`}
          >
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                getCourseBadge(activeCourseId).bg
              } ${getCourseBadge(activeCourseId).text} shadow-xs`}
            >
              {getCourseBadge(activeCourseId).label}
            </div>
            <span className="hidden min-[420px]:inline truncate max-w-[100px] sm:max-w-[180px]">
              {currentCourse.title}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted flex-shrink-0 transition-transform duration-200 ${
                showCourseSelector ? 'rotate-180 text-primary' : ''
              }`}
            />
          </button>
        </div>

        {/* Center: Tab Switcher (Lessons vs CheatSheet) */}
        <div className="touch-gap flex items-center gap-1 p-0.5 bg-panel rounded-[var(--radius-md)] border border-subtle text-xs font-semibold flex-shrink-0">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`touch-target-h h-8 px-2.5 sm:px-3 rounded-[var(--radius-sm)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'lessons'
                ? 'bg-accent text-[var(--text-on-accent)] font-bold shadow-xs'
                : 'text-muted hover:text-primary'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Bài học<span className="hidden sm:inline"> ({currentLessons.length})</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cheatSheet')}
            className={`touch-target-h h-8 px-2.5 sm:px-3 rounded-[var(--radius-sm)] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cheatSheet'
                ? 'bg-accent text-[var(--text-on-accent)] font-bold shadow-xs'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Table className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">
              {activeCourseId === 'js' ? 'Tra cứu JS' : activeCourseId === 'css' ? 'Tra cứu CSS' : 'Tra cứu Thẻ'}
            </span>
            <span className="sm:hidden">Tra cứu</span>
          </button>
        </div>

        {/* Right: Theme toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onToggleTheme}
            className="touch-target w-8 h-8 flex items-center justify-center text-secondary hover:text-primary bg-panel hover:bg-hover rounded-[var(--radius-sm)] border border-default transition-all cursor-pointer focus-visible:ring-1 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
            title={isTouch ? undefined : theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
            aria-label="Đổi giao diện sáng tối"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-accent" />}
          </button>
        </div>
      </header>

      {/* Breadcrumb Context Line under Top Bar */}
      <nav
        aria-label="Đường dẫn điều hướng"
        className="min-h-[28px] py-1 pl-[max(1rem,var(--safe-left))] pr-[max(1rem,var(--safe-right))] bg-panel border-b border-subtle flex items-center gap-1.5 text-[11px] text-muted select-none flex-shrink-0 overflow-x-auto no-scrollbar whitespace-nowrap"
      >
        <button
          onClick={onBackToEditor}
          className="touch-hit-expand hover:text-primary transition-colors cursor-pointer flex-shrink-0"
        >
          Trình soạn thảo
        </button>
        <span className="opacity-50 flex-shrink-0">›</span>
        <span className="text-secondary font-medium flex-shrink-0">Học lập trình</span>
        <span className="opacity-50 flex-shrink-0">›</span>
        <span className="text-secondary font-medium flex-shrink-0">{currentCourse.title}</span>
        {activeTab === 'lessons' && (
          <>
            <span className="opacity-50 flex-shrink-0">›</span>
            <span className="text-primary font-semibold truncate max-w-[200px] sm:max-w-xs">
              Bài {currentLesson.order}: {currentLesson.title}
            </span>
          </>
        )}
      </nav>

      {/* Main Learning Hub Body wrapped in ErrorBoundary */}
      <ErrorBoundary fallbackTitle="Có lỗi xảy ra khi hiển thị nội dung khóa học">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {activeTab === 'lessons' ? (
            <>
              <LessonSidebar
                lessons={currentLessons}
                activeLessonId={activeLessonId}
                onSelectLesson={setActiveLessonId}
                completedLessonIds={completedLessonIds}
              />

              <div className="flex-1 flex overflow-hidden bg-app">
                <LessonView
                  lesson={currentLesson}
                  courseId={activeCourseId}
                  isCompleted={completedLessonIds.includes(currentLesson.id)}
                  onToggleComplete={handleToggleComplete}
                  onNextLesson={nextLesson ? () => setActiveLessonId(nextLesson.id) : undefined}
                  onPrevLesson={prevLesson ? () => setActiveLessonId(prevLesson.id) : undefined}
                  onOpenInEditor={onOpenInEditor}
                  theme={theme}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex overflow-hidden bg-app">
              <CheatSheet
                course={activeCourseId === 'js' ? 'js' : activeCourseId === 'css' ? 'css' : 'html'}
                onOpenInEditor={onOpenInEditor}
              />
            </div>
          )}
        </div>
      </ErrorBoundary>

      {/* Accessible Portal-based Course Selector Dropdown into document.body */}
      {showCourseSelector &&
        menuCoords &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setShowCourseSelector(false)}
            />

            {/* Dropdown Menu Container */}
            <div
              style={{
                top: `${menuCoords.top}px`,
                left: `${menuCoords.left}px`,
              }}
              role="dialog"
              aria-label="Danh sách khóa học lập trình"
              className="fixed z-[9999] w-80 max-w-[calc(100vw-24px)] max-h-[calc(var(--app-height,100dvh)-72px-var(--safe-bottom))] overflow-y-auto overscroll-contain p-2.5 bg-elevated border border-default rounded-[var(--radius-lg)] shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
            >
              <div className="px-2 py-1.5 text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-accent" />
                <span>Chọn khóa học lập trình</span>
              </div>

              <div className="space-y-1.5 mt-1">
                {[...COURSES]
                  .sort((a, b) => a.order - b.order)
                  .map((course) => {
                    const isSelected = course.id === activeCourseId;
                    const progressCount =
                      course.id === 'html'
                        ? htmlCompletedCount
                        : course.id === 'css'
                        ? cssCompletedCount
                        : jsCompletedCount;
                    const badge = getCourseBadge(course.id);

                    return (
                      <button
                        key={course.id}
                        onClick={() => handleSelectCourse(course.id)}
                        className={`touch-target-h w-full text-left p-2.5 rounded-[var(--radius-md)] transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-accent-soft border border-[var(--accent-base)]/50 text-accent font-semibold'
                            : 'hover:bg-hover text-secondary hover:text-primary border border-transparent cursor-pointer'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 ${badge.bg} ${badge.text} shadow-xs`}
                        >
                          {badge.label}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-primary truncate flex items-center gap-1.5">
                              {course.title}
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-success flex-shrink-0" strokeWidth={2.5} />
                              )}
                            </span>

                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                                isSelected
                                  ? 'bg-success-soft text-success border border-[var(--color-success)]/30'
                                  : 'bg-panel text-muted'
                              }`}
                            >
                              {progressCount}/{course.lessonCount} bài
                            </span>
                          </div>

                          <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                            {course.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};
