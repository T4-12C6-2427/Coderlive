import React, { useState, useEffect, useRef } from 'react';
import { Code2, Palette, Sparkles, Lock, AlertCircle, AlertTriangle, Loader2, Info, Users, User } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Project } from '../types';

export interface ProjectFormData {
  title: string;
  description: string;
  languages: ('html' | 'css' | 'js')[];
  projectType?: 'personal' | 'collab';
}

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<Project> | null;
  existingProjects?: Project[];
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isGuest?: boolean;
  onOpenAuth?: () => void;
  defaultProjectType?: 'personal' | 'collab';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  mode = 'create',
  initialData,
  existingProjects = [],
  onSubmit,
  isGuest = false,
  onOpenAuth,
  defaultProjectType = 'personal',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [languages, setLanguages] = useState<('html' | 'css' | 'js')[]>(['html', 'css', 'js']);
  const [projectType, setProjectType] = useState<'personal' | 'collab'>(defaultProjectType);
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or reset form when opened
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setLanguages(
          initialData.languages && initialData.languages.length > 0
            ? initialData.languages
            : ['html', 'css', 'js']
        );
        setProjectType('personal');
      } else {
        setTitle('');
        setDescription('');
        setLanguages(['html', 'css', 'js']);
        setProjectType(defaultProjectType);
      }
      setTouched(false);
      setErrorMessage(null);
      setIsSubmitting(false);

      // Focus input with slight delay
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, initialData, defaultProjectType]);

  // Auto-grow textarea up to 6 rows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = 72; // ~3 rows
      const maxHeight = 144; // ~6 rows
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  }, [description]);

  const trimmedTitle = title.trim();
  const isTitleEmpty = trimmedTitle.length === 0;

  // Duplicate title check (excluding current project when editing)
  const isDuplicateTitle = existingProjects.some(
    (p) =>
      p.id !== initialData?.id &&
      p.title.trim().toLowerCase() === trimmedTitle.toLowerCase() &&
      trimmedTitle.length > 0
  );

  const toggleLanguage = (lang: 'css' | 'js') => {
    setLanguages((prev) => {
      if (prev.includes(lang)) {
        return prev.filter((l) => l !== lang);
      } else {
        return [...prev, lang];
      }
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTouched(true);

    if (isTitleEmpty) {
      titleInputRef.current?.focus();
      return;
    }

    if (isSubmitting) return;

    // If duplicate title and creating, optionally append " (2)" helper if user accepts or submit as-is
    let finalTitle = trimmedTitle;
    if (mode === 'create' && isDuplicateTitle) {
      // Find suitable suffix
      let counter = 2;
      let candidate = `${trimmedTitle} (${counter})`;
      while (existingProjects.some((p) => p.title.trim().toLowerCase() === candidate.toLowerCase())) {
        counter++;
        candidate = `${trimmedTitle} (${counter})`;
      }
      finalTitle = candidate;
    }

    if (mode === 'create' && projectType === 'collab' && isGuest) {
      setErrorMessage('Vui lòng đăng nhập để tạo dự án nhóm cộng tác.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit({
        title: finalTitle,
        description: description.trim(),
        languages,
        projectType: mode === 'create' ? projectType : undefined,
      });
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu thông tin dự án:', err);
      setErrorMessage(
        mode === 'create'
          ? 'Không thể tạo dự án. Vui lòng thử lại.'
          : 'Không thể cập nhật thông tin dự án. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {mode === 'create' && projectType === 'collab' ? (
            <Users className="w-4 h-4 text-accent" strokeWidth={1.5} />
          ) : (
            <Code2 className="w-4 h-4 text-accent" strokeWidth={1.5} />
          )}
          <span>
            {mode === 'create'
              ? projectType === 'collab'
                ? 'Tạo dự án nhóm'
                : 'Tạo dự án mới'
              : 'Chỉnh sửa thông tin'}
          </span>
        </div>
      }
      description={
        mode === 'create'
          ? 'Thiết lập tên gọi, mục tiêu và thành phần ngôn ngữ cho dự án'
          : 'Cập nhật tiêu đề, mô tả mục tiêu và ngôn ngữ sử dụng'
      }
      maxWidth="md"
      className="max-sm:h-full max-sm:max-w-full max-sm:rounded-none max-sm:m-0 max-sm:border-0 max-sm:flex max-sm:flex-col"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-sm:flex-1 max-sm:flex max-sm:flex-col">
        {/* Error banner if submission failed */}
        {errorMessage && (
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/30 text-xs text-[var(--color-danger)] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="flex-1">
              <span className="font-semibold">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Project Type Selector (Create mode only) */}
        {mode === 'create' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-primary block">Loại dự án</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 touch-gap gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setProjectType('personal');
                  setErrorMessage(null);
                }}
                className={`touch-target-h p-2.5 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer ${
                  projectType === 'personal'
                    ? 'bg-accent-soft border-[var(--accent-base)] text-primary shadow-xs'
                    : 'bg-panel border-default text-secondary hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <User className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span>Dự án cá nhân</span>
                </div>
                <p className="text-[11px] text-muted mt-0.5">Lưu riêng trong tài khoản của bạn</p>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setProjectType('collab');
                  setErrorMessage(null);
                }}
                className={`touch-target-h p-2.5 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer ${
                  projectType === 'collab'
                    ? 'bg-accent-soft border-[var(--accent-base)] text-primary shadow-xs'
                    : 'bg-panel border-default text-secondary hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span>Tạo dự án nhóm</span>
                </div>
                <p className="text-[11px] text-muted mt-0.5">Cộng tác trực tiếp cùng nhiều người</p>
              </button>
            </div>
          </div>
        )}

        {/* ROW 1: Tên dự án (required) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="project-modal-title" className="text-xs font-semibold text-primary flex items-center gap-1">
              <span>Tên dự án</span>
              <span className="text-[var(--color-danger)]">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                title.length >= 60 ? 'text-[var(--color-danger)] font-bold' : 'text-muted'
              }`}
            >
              {title.length}/60
            </span>
          </div>

          <div className="relative">
            <input
              id="project-modal-title"
              ref={titleInputRef}
              type="text"
              autoComplete="off"
              enterKeyHint="next"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onBlur={() => setTouched(true)}
              onKeyDown={handleTitleKeyDown}
              maxLength={60}
              placeholder="Ví dụ: Trang giới thiệu bản thân"
              disabled={isSubmitting}
              className={`w-full h-11 sm:h-9 px-3 text-xs bg-panel border rounded-[var(--radius-sm)] text-primary placeholder-muted outline-none transition-all ${
                touched && isTitleEmpty
                  ? 'border-[var(--color-danger)] focus:ring-1 focus:ring-[var(--color-danger)]'
                  : 'border-default focus:border-[var(--accent-base)] focus:ring-1 focus:ring-[var(--accent-base)]'
              }`}
            />
          </div>

          {/* Validation & Warnings */}
          {touched && isTitleEmpty && (
            <p className="text-[11px] text-[var(--color-danger)] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
              <span>Vui lòng nhập tên dự án</span>
            </p>
          )}

          {isDuplicateTitle && !isTitleEmpty && (
            <div className="p-2 rounded-[var(--radius-xs)] bg-[var(--color-warning-soft)] border border-[var(--color-warning)]/30 text-[11px] text-[var(--color-warning)] flex items-center gap-1.5 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
              <span>Đã có dự án trùng tên (hệ thống sẽ tự động thêm đuôi số để phân biệt)</span>
            </div>
          )}
        </div>

        {/* ROW 2: Mô tả / Mục tiêu (optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="project-modal-desc" className="text-xs font-semibold text-primary flex items-center gap-1">
              <span>Mô tả / Mục tiêu</span>
              <span className="text-muted font-normal text-[11px]">(Tùy chọn)</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                description.length >= 300 ? 'text-[var(--color-danger)] font-bold' : 'text-muted'
              }`}
            >
              {description.length}/300
            </span>
          </div>

          <textarea
            id="project-modal-desc"
            ref={textareaRef}
            enterKeyHint="done"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleDescriptionKeyDown}
            maxLength={300}
            rows={3}
            disabled={isSubmitting}
            placeholder="Bạn muốn làm gì với dự án này? Ví dụ: Luyện tập Flexbox, làm trang đăng nhập..."
            className="w-full px-3 py-2 text-xs bg-panel border border-default rounded-[var(--radius-sm)] text-primary placeholder-muted outline-none focus:border-[var(--accent-base)] focus:ring-1 focus:ring-[var(--accent-base)] transition-all resize-none leading-relaxed"
          />
        </div>

        {/* ROW 3: Loại hình (chips) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-primary block">
            <span>Loại hình & Thành phần ngôn ngữ</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* HTML Chip (Locked & Always Selected) */}
            <div
              className="p-2.5 rounded-[var(--radius-md)] border bg-accent-soft border-[var(--accent-base)] text-primary flex flex-col gap-1 cursor-not-allowed select-none relative"
              title="HTML là cấu trúc nền tảng bắt buộc của mọi trang web"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span className="text-xs font-bold text-accent">HTML</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Bắt buộc</span>
                </div>
              </div>
              <span className="text-[11px] text-secondary">Cấu trúc trang web</span>
            </div>

            {/* CSS Chip */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => toggleLanguage('css')}
              className={`touch-target-h p-2.5 rounded-[var(--radius-md)] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                languages.includes('css')
                  ? 'bg-accent-soft border-[var(--accent-base)] text-primary shadow-xs'
                  : 'bg-panel border-default text-muted hover:border-[var(--border-strong)] hover:text-secondary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[var(--accent-2)]" strokeWidth={1.5} />
                  <span
                    className={`text-xs font-bold ${
                      languages.includes('css') ? 'text-accent' : 'text-secondary'
                    }`}
                  >
                    CSS
                  </span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    languages.includes('css')
                      ? 'bg-accent text-accent-on font-semibold'
                      : 'bg-elevated text-muted'
                  }`}
                >
                  {languages.includes('css') ? 'Đã bật' : 'Tắt'}
                </span>
              </div>
              <span className="text-[11px] text-secondary">Giao diện & phong cách</span>
            </button>

            {/* JS Chip */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => toggleLanguage('js')}
              className={`touch-target-h p-2.5 rounded-[var(--radius-md)] border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                languages.includes('js')
                  ? 'bg-accent-soft border-[var(--accent-base)] text-primary shadow-xs'
                  : 'bg-panel border-default text-muted hover:border-[var(--border-strong)] hover:text-secondary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-warning)]" strokeWidth={1.5} />
                  <span
                    className={`text-xs font-bold ${
                      languages.includes('js') ? 'text-accent' : 'text-secondary'
                    }`}
                  >
                    JavaScript
                  </span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    languages.includes('js')
                      ? 'bg-accent text-accent-on font-semibold'
                      : 'bg-elevated text-muted'
                  }`}
                >
                  {languages.includes('js') ? 'Đã bật' : 'Tắt'}
                </span>
              </div>
              <span className="text-[11px] text-secondary">Hành vi & tương tác</span>
            </button>
          </div>
        </div>

        {/* Guest Warning / Gentle Hint */}
        {isGuest && (
          <div className="p-2.5 rounded-[var(--radius-md)] bg-panel border border-subtle flex items-start justify-between gap-2 text-xs">
            <div className="flex items-start gap-2 text-secondary">
              <Info className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>
                {projectType === 'collab' && mode === 'create' ? (
                  <>
                    Tạo dự án nhóm yêu cầu tài khoản.{' '}
                    <span className="text-primary font-medium">
                      Đăng nhập để tạo và mời thành viên cùng sửa mã.
                    </span>
                  </>
                ) : (
                  <>
                    Đang dùng ở chế độ Khách (lưu cục bộ).{' '}
                    <span className="text-primary font-medium">
                      Đăng nhập để lưu dự án lên tài khoản của bạn.
                    </span>
                  </>
                )}
              </span>
            </div>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="touch-target-h text-accent hover:underline text-xs font-semibold flex-shrink-0 cursor-pointer inline-flex items-center px-2"
              >
                Đăng nhập
              </button>
            )}
          </div>
        )}

        {/* Mobile Spacer */}
        <div className="max-sm:flex-1" />

        {/* Modal Footer */}
        <div className="pt-3 border-t border-subtle flex items-center justify-end touch-gap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting || isTitleEmpty || (mode === 'create' && projectType === 'collab' && isGuest)}
            leftIcon={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Đang tạo...'
                : 'Đang lưu...'
              : mode === 'create'
              ? projectType === 'collab'
                ? 'Tạo dự án nhóm'
                : 'Tạo dự án'
              : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
