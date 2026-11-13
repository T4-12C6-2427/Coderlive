import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Play,
  Save,
  FolderGit2,
  Sparkles,
  Download,
  Copy,
  Trash2,
  Wand2,
  Share2,
  Columns,
  Rows,
  Maximize2,
  Sun,
  Moon,
  Palette,
  GraduationCap,
  FileCode2,
  Check,
  ChevronRight,
  Eye,
  Minimize2,
  Sidebar,
  Code2
} from 'lucide-react';
import { Kbd } from './ui/Kbd';
import { Project, WorkspacePreset } from '../types';
import { LESSONS } from '../data/lessons';
import { JS_LESSONS } from '../data/lessons-js';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: () => void;
  onSave: () => void;
  onNewProject: () => void;
  onFormatCode?: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onShare?: () => void;
  onClear: () => void;
  onToggleTheme: () => void;
  theme: 'dark' | 'light';
  onSetWorkspacePreset: (preset: WorkspacePreset) => void;
  activePreset: WorkspacePreset;
  onToggleActivityBar: () => void;
  isActivityBarVisible: boolean;
  onOpenPersonalize: () => void;
  onOpenProjects: () => void;
  onOpenTemplates: () => void;
  onOpenLearn: (lessonSlug?: string) => void;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'actions' | 'layout' | 'theme' | 'projects' | 'lessons';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onRun,
  onSave,
  onNewProject,
  onFormatCode,
  onCopy,
  onDownload,
  onShare,
  onClear,
  onToggleTheme,
  theme,
  onSetWorkspacePreset,
  activePreset,
  onToggleActivityBar,
  isActivityBarVisible,
  onOpenPersonalize,
  onOpenProjects,
  onOpenTemplates,
  onOpenLearn,
  projects = [],
  onSelectProject,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Built-in commands list
  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Actions
      {
        id: 'cmd-run',
        title: 'Chạy lại mã nguồn (Run)',
        category: 'actions',
        icon: <Play className="w-4 h-4 text-success fill-current" strokeWidth={1.5} />,
        shortcut: 'Ctrl+Enter',
        action: onRun,
        keywords: ['run', 'chay', 'thuc thi', 'render'],
      },
      {
        id: 'cmd-save',
        title: 'Lưu dự án lên đám mây',
        category: 'actions',
        icon: <Save className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        shortcut: 'Ctrl+S',
        action: onSave,
        keywords: ['save', 'luu', 'cloud'],
      },
      {
        id: 'cmd-new',
        title: 'Tạo dự án mới',
        category: 'actions',
        icon: <FileCode2 className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        shortcut: 'Ctrl+Alt+N',
        action: onNewProject,
        keywords: ['new', 'tao moi', 'project', 'du an'],
      },
      {
        id: 'cmd-format',
        title: 'Định dạng mã nguồn (Format Code)',
        category: 'actions',
        icon: <Wand2 className="w-4 h-4 text-warning" strokeWidth={1.5} />,
        shortcut: 'Alt+Shift+F',
        action: () => onFormatCode && onFormatCode(),
        keywords: ['format', 'dinh dang', 'beautify', 'can chinh'],
      },
      {
        id: 'cmd-copy',
        title: 'Sao chép toàn bộ mã nguồn',
        category: 'actions',
        icon: <Copy className="w-4 h-4 text-muted" strokeWidth={1.5} />,
        shortcut: 'Ctrl+Shift+C',
        action: onCopy,
        keywords: ['copy', 'sao chep', 'clipboard'],
      },
      {
        id: 'cmd-download',
        title: 'Tải xuống tệp HTML (.html/.htm)',
        category: 'actions',
        icon: <Download className="w-4 h-4 text-muted" strokeWidth={1.5} />,
        shortcut: 'Ctrl+Shift+D',
        action: onDownload,
        keywords: ['download', 'tai ve', 'export', 'xuat file'],
      },
      {
        id: 'cmd-clear',
        title: 'Xóa trắng mã nguồn tab hiện tại...',
        category: 'actions',
        icon: <Trash2 className="w-4 h-4 text-danger" strokeWidth={1.5} />,
        action: onClear,
        keywords: ['clear', 'xoa', 'reset', 'trang'],
      },

      // Layout Presets
      {
        id: 'layout-split-h',
        title: 'Bố cục: Chia đôi (Trái / Phải)',
        category: 'layout',
        icon: <Columns className="w-4 h-4 text-muted" strokeWidth={1.5} />,
        action: () => onSetWorkspacePreset('split-horizontal'),
        keywords: ['chia doi', 'ngang', 'horizontal', 'side by side'],
      },
      {
        id: 'layout-split-v',
        title: 'Bố cục: Chia dọc (Trên / Dưới)',
        category: 'layout',
        icon: <Rows className="w-4 h-4 text-muted" strokeWidth={1.5} />,
        action: () => onSetWorkspacePreset('split-vertical'),
        keywords: ['chia doc', 'vertical', 'tren duoi', 'stacked'],
      },
      {
        id: 'layout-focus-code',
        title: 'Bố cục: Tập trung Code (Mở rộng trình soạn thảo)',
        category: 'layout',
        icon: <Code2 className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        action: () => onSetWorkspacePreset('focus-code'),
        keywords: ['focus code', 'tap trung code', 'editor only'],
      },
      {
        id: 'layout-focus-preview',
        title: 'Bố cục: Tập trung Xem trước (Toàn màn hình Preview)',
        category: 'layout',
        icon: <Eye className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        action: () => onSetWorkspacePreset('focus-preview'),
        keywords: ['focus preview', 'toan man hinh', 'fullscreen'],
      },
      {
        id: 'layout-zen',
        title: 'Chế độ Zen (Tối giản không xao nhãng)',
        category: 'layout',
        icon: <Maximize2 className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        shortcut: 'Ctrl+Shift+Z / F11',
        action: () => onSetWorkspacePreset('zen'),
        keywords: ['zen', 'distraction free', 'toi gian'],
      },
      {
        id: 'layout-toggle-activity',
        title: isActivityBarVisible ? 'Ẩn thanh Activity Bar bên trái' : 'Hiện thanh Activity Bar bên trái',
        category: 'layout',
        icon: <Sidebar className="w-4 h-4 text-muted" strokeWidth={1.5} />,
        action: onToggleActivityBar,
        keywords: ['activity bar', 'thanh ben', 'sidebar', 'rail'],
      },

      // Theme & Personalization
      {
        id: 'theme-toggle',
        title: `Chuyển sang giao diện ${theme === 'dark' ? 'Sáng' : 'Tối'}`,
        category: 'theme',
        icon: theme === 'dark' ? <Sun className="w-4 h-4 text-warning" strokeWidth={1.5} /> : <Moon className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        shortcut: 'Ctrl+Shift+L',
        action: onToggleTheme,
        keywords: ['theme', 'giao dien', 'sang toi', 'dark light'],
      },
      {
        id: 'theme-personalize',
        title: 'Mở bảng Cá nhân hóa giao diện (Màu sắc, Font, Phong cách)',
        category: 'theme',
        icon: <Palette className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        action: onOpenPersonalize,
        keywords: ['ca nhan hoa', 'personalize', 'customize', 'mau sac', 'font', 'bo cuc'],
      },
      {
        id: 'nav-templates',
        title: 'Xem danh sách Mẫu có sẵn (Templates)',
        category: 'theme',
        icon: <Sparkles className="w-4 h-4 text-warning" strokeWidth={1.5} />,
        action: onOpenTemplates,
        keywords: ['mau', 'template', 'samples', 'vi du'],
      },
      {
        id: 'nav-projects',
        title: 'Xem danh sách Dự án của tôi',
        category: 'theme',
        icon: <FolderGit2 className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        action: onOpenProjects,
        keywords: ['du an', 'projects', 'danh sach'],
      },
      {
        id: 'nav-learn',
        title: 'Mở khu vực Học lập trình (HTML, CSS, JS)',
        category: 'theme',
        icon: <GraduationCap className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        action: () => onOpenLearn(),
        keywords: ['hoc', 'learn', 'khoa hoc', 'html', 'css', 'js'],
      },
    ];

    if (onShare) {
      list.push({
        id: 'cmd-share',
        title: 'Chia sẻ liên kết dự án chỉ đọc (Public Link)',
        category: 'actions',
        icon: <Share2 className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        action: onShare,
        keywords: ['share', 'chia se', 'link', 'cong khai'],
      });
    }

    // Add Projects
    if (projects.length > 0 && onSelectProject) {
      projects.forEach((p) => {
        list.push({
          id: `project-${p.id}`,
          title: `Dự án: ${p.title}`,
          category: 'projects',
          icon: <FolderGit2 className="w-4 h-4 text-accent" strokeWidth={1.5} />,
          action: () => onSelectProject(p),
          keywords: ['du an', 'project', p.title.toLowerCase()],
        });
      });
    }

    // Add Lessons
    LESSONS.forEach((lesson) => {
      list.push({
        id: `lesson-html-${lesson.id}`,
        title: `Bài học HTML ${lesson.order}: ${lesson.title}`,
        category: 'lessons',
        icon: <GraduationCap className="w-4 h-4 text-accent" strokeWidth={1.5} />,
        action: () => onOpenLearn(lesson.slug),
        keywords: ['html', 'bai hoc', lesson.title.toLowerCase(), ...(lesson.tags || [])],
      });
    });

    JS_LESSONS.forEach((lesson) => {
      list.push({
        id: `lesson-js-${lesson.id}`,
        title: `Bài học JS ${lesson.order}: ${lesson.title}`,
        category: 'lessons',
        icon: <GraduationCap className="w-4 h-4 text-warning" strokeWidth={1.5} />,
        action: () => onOpenLearn(lesson.slug),
        keywords: ['js', 'javascript', 'bai hoc', lesson.title.toLowerCase(), ...(lesson.tags || [])],
      });
    });

    return list;
  }, [
    onRun,
    onSave,
    onNewProject,
    onFormatCode,
    onCopy,
    onDownload,
    onClear,
    onShare,
    onToggleTheme,
    theme,
    onSetWorkspacePreset,
    onToggleActivityBar,
    isActivityBarVisible,
    onOpenPersonalize,
    onOpenTemplates,
    onOpenProjects,
    onOpenLearn,
    projects,
    onSelectProject,
  ]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase().trim();
    return commands.filter((cmd) => {
      if (cmd.title.toLowerCase().includes(q)) return true;
      if (cmd.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [commands, query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Category labels
  const categoryLabels: Record<string, string> = {
    actions: 'Thao tác nhanh',
    layout: 'Bố cục & Không gian làm việc',
    theme: 'Giao diện & Điều hướng',
    projects: 'Dự án của tôi',
    lessons: 'Bài học lập trình',
  };

  // Group filtered items
  const grouped = filteredCommands.reduce((acc, cmd, index) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push({ cmd, index });
    return acc;
  }, {} as Record<string, { cmd: CommandItem; index: number }[]>);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-[max(0.75rem,var(--safe-top))] sm:pt-[max(3rem,calc(var(--app-height,100dvh)*0.12))] px-3 sm:px-4 bg-overlay backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary overflow-hidden flex flex-col max-h-viewport-85 sm:max-h-viewport-70 animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-subtle flex-shrink-0">
          <Search className="w-4 h-4 text-muted flex-shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm kiếm lệnh, dự án, bài học..."
            className="w-full bg-transparent text-sm text-primary placeholder-muted outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="touch-target text-[11px] text-muted hover:text-primary px-2 py-1 rounded-[var(--radius-xs)] hover:bg-[var(--border-subtle)]"
            >
              Xóa
            </button>
          ) : (
            <Kbd>ESC</Kbd>
          )}
        </div>

        {/* Command List */}
        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-4">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              Không tìm thấy lệnh hoặc bài học nào phù hợp với &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-muted tracking-wider uppercase">
                  {categoryLabels[category] || category}
                </div>
                {items.map(({ cmd, index }) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      data-selected={isSelected}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`touch-target-h w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-accent-soft text-accent font-medium'
                          : 'text-primary hover:bg-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex-shrink-0">{cmd.icon}</span>
                        <span className="truncate">{cmd.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {cmd.shortcut && <Kbd>{cmd.shortcut}</Kbd>}
                        <ChevronRight className="w-3.5 h-3.5 text-muted opacity-60" strokeWidth={1.5} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer info line (shortcut hints hidden on touch) */}
        <div className="shortcut-hint px-4 py-2 bg-[var(--border-subtle)] border-t border-subtle flex items-center justify-between text-[11px] text-muted flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> di chuyển
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>↵</Kbd> chọn lệnh
            </span>
          </div>
          <span>HTMLive PRO Workspace</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
