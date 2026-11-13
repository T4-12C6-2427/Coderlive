import React, { useState, useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  BookOpen,
  Play,
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Code2,
  Sparkles,
  Lightbulb,
  Terminal,
  Sliders,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Lesson, CourseId } from '../../types/learning';
import { useIsMobile, useIsTouch } from '../../hooks/useViewport';
import { AnnotatedCode } from './AnnotatedCode';
import { LivePreviewBox } from './LivePreviewBox';
import { MistakeBox } from './MistakeBox';
import { QuizBlock } from './QuizBlock';
import { CodeRunner } from './CodeRunner';
import { StepThrough } from './StepThrough';
import { PredictionBlock } from './PredictionBlock';
import { ExerciseBlock } from './ExerciseBlock';
import { CssPlayground } from './CssPlayground';

interface LessonViewProps {
  lesson: Lesson;
  courseId?: CourseId;
  isCompleted: boolean;
  onToggleComplete: (lessonId: any) => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  onOpenInEditor: (code: string) => void;
  theme: 'dark' | 'light';
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  courseId = 'html',
  isCompleted,
  onToggleComplete,
  onNextLesson,
  onPrevLesson,
  onOpenInEditor,
  theme,
}) => {
  const isTouch = useIsTouch();
  const isMobile = useIsMobile();
  // HTML-specific Try-it interactive state
  const [editableCode, setEditableCode] = useState(lesson.initialCode);
  const [previewCode, setPreviewCode] = useState(lesson.initialCode);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Sync when lesson changes
  useEffect(() => {
    setEditableCode(lesson.initialCode);
    setPreviewCode(lesson.initialCode);
    setPreviewKey((k) => k + 1);
    setCopied(false);
  }, [lesson]);

  // Debounced live update for HTML/CSS "Thử sửa" (~300ms)
  useEffect(() => {
    if (courseId === 'js') return; // JS runs on demand, not on keystroke
    const timer = setTimeout(() => {
      setPreviewCode(editableCode);
    }, 300);
    return () => clearTimeout(timer);
  }, [editableCode, courseId]);

  const handleReset = () => {
    setEditableCode(lesson.initialCode);
    setPreviewCode(lesson.initialCode);
    setPreviewKey((k) => k + 1);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const extensions = useMemo(() => [html({ autoCloseTags: true, matchClosingTags: true })], []);

  const isJsCourse = courseId === 'js';
  const isCssCourse = courseId === 'css';

  const badgeThemeClasses = isJsCourse
    ? 'bg-[var(--course-js-soft)] text-[var(--course-js-text)] border-[var(--course-js-border)]'
    : isCssCourse
    ? 'bg-[var(--course-css-soft)] text-[var(--course-css-text)] border-[var(--course-css-border)]'
    : 'bg-[var(--course-html-soft)] text-[var(--course-html-text)] border-[var(--course-html-border)]';

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain p-4 pl-safe pr-safe pb-[max(2rem,var(--safe-bottom))] sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl w-full min-w-0 mx-auto">
      {/* Lesson Header */}
      <div className="space-y-3 pb-6 border-b border-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeThemeClasses}`}>
              Bài {lesson.order} • {lesson.topic}
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {lesson.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-panel text-secondary font-mono text-[11px] border border-subtle"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleComplete(lesson.id)}
            className={`touch-target-h flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer ${
              isCompleted
                ? 'bg-success text-white shadow-xs'
                : 'bg-elevated text-secondary hover:text-primary hover:bg-hover border border-default'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu đã học'}</span>
          </button>
        </div>

        <h1 className="text-fluid-h1 sm:text-3xl font-extrabold text-primary tracking-tight">
          {lesson.title}
        </h1>

        <p className="text-secondary leading-relaxed text-fluid-body sm:text-base prose-measure">
          {lesson.intro}
        </p>

        {lesson.analogy && (
          <div className="p-3.5 rounded-[var(--radius-md)] bg-warning-soft border border-[var(--color-warning)]/30 text-warning text-xs sm:text-sm flex items-start gap-2.5 prose-measure">
            <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{lesson.analogy}</span>
          </div>
        )}
      </div>

      {/* Section 1: Line-by-Line Code Explanation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-primary">
          <Code2 className="w-5 h-5 text-accent" />
          <span>Mã nguồn mẫu & Giải thích từng dòng:</span>
        </div>

        <AnnotatedCode code={lesson.initialCode} lineNotes={lesson.lineNotes} theme={theme} />
      </div>

      {/* CSS-SPECIFIC BLOCK: Giải thích thuộc tính CSS */}
      {isCssCourse && lesson.cssProperties && lesson.cssProperties.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-base font-bold text-primary">
            <Sliders className="w-5 h-5 text-accent" />
            <span>Giải thích thuộc tính CSS trong bài:</span>
          </div>
          <div className="rounded-[var(--radius-md)] border border-default overflow-hidden bg-panel shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-elevated border-b border-subtle text-muted text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3.5 font-bold font-mono">Thuộc tính</th>
                    <th className="py-2.5 px-3.5 font-bold">Ý nghĩa & Tác dụng</th>
                    <th className="py-2.5 px-3.5 font-bold font-mono">Giá trị thông dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {lesson.cssProperties.map((prop, idx) => (
                    <tr key={idx} className="hover:bg-hover transition-colors">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-accent whitespace-nowrap">
                        {prop.property}
                      </td>
                      <td className="py-2.5 px-3.5 text-secondary leading-relaxed">
                        {prop.description}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-primary">
                        {prop.values}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CSS-SPECIFIC BLOCK: Cách trình duyệt xử lý & hoạt động */}
      {isCssCourse && lesson.browserSteps && lesson.browserSteps.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-base font-bold text-primary">
            <BookOpen className="w-5 h-5 text-accent" />
            <span>Cách hoạt động (Quy trình kết xuất của trình duyệt):</span>
          </div>
          <div className="p-4 rounded-[var(--radius-md)] bg-panel border border-subtle space-y-3 shadow-xs">
            <div className="space-y-2.5">
              {lesson.browserSteps.map((step) => (
                <div key={step.step} className="flex items-start gap-3 text-xs leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-accent-soft text-accent font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.step}
                  </span>
                  <div className="flex-1">
                    <strong className="text-primary block font-medium mb-0.5">{step.title}</strong>
                    <span className="text-secondary">{step.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {lesson.consequence && (
              <div className="pt-3 border-t border-subtle flex items-start gap-2.5 text-xs bg-danger-soft p-3 rounded-[var(--radius-sm)] border border-[var(--color-danger)]/30">
                <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5 text-danger font-bold">Nếu viết sai hoặc thiếu thì sao?</strong>
                  <span className="text-secondary">{lesson.consequence}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS-SPECIFIC BLOCK: Sân chơi tương tác (Playground) */}
      {isCssCourse && lesson.playgroundType && (
        <div className="pt-2">
          <CssPlayground type={lesson.playgroundType} theme={theme} />
        </div>
      )}

      {/* JS-SPECIFIC BLOCK: Chạy từng bước (Step-by-step Execution) */}
      {isJsCourse && lesson.steps && lesson.steps.length > 0 && (
        <StepThrough code={lesson.initialCode} steps={lesson.steps} theme={theme} />
      )}

      {/* JS-SPECIFIC BLOCK: Dự đoán kết quả (Prediction Challenges) */}
      {isJsCourse && lesson.predictions && lesson.predictions.length > 0 && (
        <PredictionBlock predictions={lesson.predictions} theme={theme} />
      )}

      {/* Section 2: "Thử sửa" Interactive Area */}
      {isJsCourse ? (
        // JS Course: Run on demand with CodeRunner (Worker or DOM Iframe + ConsolePanel)
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-base font-bold text-primary">
            <Sparkles className="w-5 h-5 text-warning" />
            <span>Khu vực "Thử chạy & sửa mã" (Run on Demand):</span>
          </div>

          <CodeRunner
            initialCode={lesson.initialCode}
            isDomLesson={lesson.isDomLesson}
            initialHtml={lesson.initialHtml}
            onOpenInEditor={onOpenInEditor}
            theme={theme}
            title={lesson.title}
          />
        </div>
      ) : (
        // HTML Course: Live auto-update with CodeMirror + LivePreviewBox
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-base font-bold text-primary">
              <Sparkles className="w-5 h-5 text-warning" />
              <span>Khu vực &quot;Thử sửa&quot; trực tiếp:</span>
            </div>

            <div className="flex flex-wrap items-center touch-gap gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="touch-target-h flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium text-secondary hover:text-primary bg-panel hover:bg-hover border border-default transition-colors cursor-pointer"
                title={isTouch ? undefined : 'Khôi phục lại mã nguồn ban đầu của bài học'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="touch-target-h flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium text-secondary hover:text-primary bg-panel hover:bg-hover border border-default transition-colors cursor-pointer"
                title={isTouch ? undefined : 'Sao chép mã vào bộ nhớ tạm'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenInEditor(editableCode)}
                className="touch-target-h flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold text-[var(--text-on-accent)] bg-accent hover:opacity-90 shadow-xs transition-all active:scale-95 cursor-pointer"
                title={isTouch ? undefined : 'Nạp đoạn mã này vào trình soạn thảo chính để làm việc tiếp'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở trong trình soạn thảo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
            <div className="rounded-[var(--radius-md)] border border-default bg-[var(--code-bg)] overflow-hidden flex flex-col h-[250px] sm:h-[320px] shadow-xs min-w-0">
              <div className="px-3.5 py-2 bg-panel border-b border-subtle text-xs font-semibold text-secondary flex items-center justify-between gap-2">
                <span className="truncate">Trình gõ thử nghiệm (Editable)</span>
                <span className="text-[11px] text-muted font-mono flex-shrink-0">Tự cập nhật 300ms</span>
              </div>
              <div className="flex-1 overflow-auto overscroll-contain min-h-0">
                <CodeMirror
                  value={editableCode}
                  height="100%"
                  theme={oneDark}
                  extensions={extensions}
                  onChange={setEditableCode}
                  basicSetup={{
                    lineNumbers: true,
                    syntaxHighlighting: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    tabSize: 2,
                  }}
                  className="h-full font-mono text-xs"
                />
              </div>
            </div>

            <LivePreviewBox
              code={previewCode}
              title="Kết quả hiển thị trực tiếp"
              height={isMobile ? '250px' : '320px'}
              previewKey={previewKey}
            />
          </div>
        </div>
      )}

      {/* JS-SPECIFIC BLOCK: Bài tập nhỏ (Hands-on Challenge) */}
      {isJsCourse && lesson.exercise && (
        <ExerciseBlock exercise={lesson.exercise} theme={theme} />
      )}

      {/* Section 3: Common Mistakes */}
      {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
        <MistakeBox mistakes={lesson.commonMistakes} />
      )}

      {/* Section 4: Mini Quiz */}
      {lesson.quiz && lesson.quiz.length > 0 && (
        <QuizBlock questions={lesson.quiz} />
      )}

      {/* Lesson Navigation Footer */}
      <div className="pt-6 border-t border-subtle flex items-center justify-between touch-gap gap-4">
        {onPrevLesson ? (
          <button
            type="button"
            onClick={onPrevLesson}
            className="touch-target-h flex items-center gap-2 px-4 py-2 text-xs font-semibold text-secondary hover:text-primary bg-panel hover:bg-hover rounded-[var(--radius-sm)] border border-default transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Bài trước</span>
          </button>
        ) : (
          <div />
        )}

        {onNextLesson ? (
          <button
            type="button"
            onClick={onNextLesson}
            className="touch-target-h flex items-center gap-2 px-5 py-2 text-xs font-bold text-[var(--text-on-accent)] bg-accent hover:opacity-90 shadow-xs rounded-[var(--radius-sm)] transition-all cursor-pointer"
          >
            <span>Bài tiếp theo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggleComplete(lesson.id)}
            className="touch-target-h flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-success hover:opacity-90 shadow-xs rounded-[var(--radius-sm)] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Hoàn thành khóa học!</span>
          </button>
        )}
      </div>
    </div>
  );
};
