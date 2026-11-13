import React from 'react';
import {
  Code2,
  FolderGit2,
  Sparkles,
  GraduationCap,
  Palette,
  Search,
  PanelLeftClose,
  ChevronLeft
} from 'lucide-react';
import { Tooltip } from './ui/Feedback';

export interface ActivityBarProps {
  activeView: 'editor' | 'learn';
  onViewChange: (view: 'editor' | 'learn') => void;
  onOpenProjects: () => void;
  onOpenTemplates: () => void;
  onOpenPersonalize: () => void;
  onOpenCommandPalette: () => void;
  onToggleActivityBar: () => void;
  isProjectsOpen?: boolean;
  isTemplatesOpen?: boolean;
  isPersonalizeOpen?: boolean;
  hideMobileNav?: boolean;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
  onOpenProjects,
  onOpenTemplates,
  onOpenPersonalize,
  onOpenCommandPalette,
  onToggleActivityBar,
  isProjectsOpen = false,
  isTemplatesOpen = false,
  isPersonalizeOpen = false,
  hideMobileNav = false,
}) => {
  return (
    <>
      {/* Desktop Activity Bar (48px left rail) */}
      <aside
        aria-label="Thanh công cụ bên"
        className="hidden md:flex flex-col items-center justify-between w-12 bg-app glass-panel border-r border-subtle select-none z-20 flex-shrink-0 py-2"
      >
        {/* Top Action Icons */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {/* Trình soạn thảo */}
          <Tooltip content="Trình soạn thảo" shortcut="Alt+1" side="right">
            <button
              onClick={() => onViewChange('editor')}
              className={`relative w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-all cursor-pointer ${
                activeView === 'editor' && !isProjectsOpen && !isTemplatesOpen
                  ? 'bg-accent-soft text-accent'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
              }`}
              aria-label="Trình soạn thảo"
            >
              {activeView === 'editor' && !isProjectsOpen && !isTemplatesOpen && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
              )}
              <Code2 className="w-4.5 h-4.5" strokeWidth={1.5} />
            </button>
          </Tooltip>

          {/* Dự án của tôi */}
          <Tooltip content="Dự án của tôi" shortcut="Alt+2" side="right">
            <button
              onClick={onOpenProjects}
              className={`relative w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-all cursor-pointer ${
                isProjectsOpen
                  ? 'bg-accent-soft text-accent'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
              }`}
              aria-label="Dự án của tôi"
            >
              {isProjectsOpen && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
              )}
              <FolderGit2 className="w-4.5 h-4.5" strokeWidth={1.5} />
            </button>
          </Tooltip>

          {/* Mẫu có sẵn */}
          <Tooltip content="Mẫu có sẵn (Templates)" shortcut="Alt+3" side="right">
            <button
              onClick={onOpenTemplates}
              className={`relative w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-all cursor-pointer ${
                isTemplatesOpen
                  ? 'bg-accent-soft text-accent'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
              }`}
              aria-label="Mẫu có sẵn"
            >
              {isTemplatesOpen && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
              )}
              <Sparkles className="w-4.5 h-4.5" strokeWidth={1.5} />
            </button>
          </Tooltip>

          {/* Học lập trình */}
          <Tooltip content="Học lập trình" shortcut="Alt+4" side="right">
            <button
              onClick={() => onViewChange('learn')}
              className={`relative w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-all cursor-pointer ${
                activeView === 'learn'
                  ? 'bg-accent-soft text-accent'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
              }`}
              aria-label="Học lập trình"
            >
              {activeView === 'learn' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
              )}
              <GraduationCap className="w-4.5 h-4.5" strokeWidth={1.5} />
            </button>
          </Tooltip>
        </div>

        {/* Bottom Action Icons */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {/* Command Palette */}
          <Tooltip content="Bảng lệnh (Command Palette)" shortcut="Ctrl+K" side="right">
            <button
              onClick={onOpenCommandPalette}
              className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center text-secondary hover:text-primary hover:bg-[var(--border-subtle)] transition-all cursor-pointer"
              aria-label="Bảng lệnh"
            >
              <Search className="w-4.5 h-4.5" strokeWidth={1.5} />
            </button>
          </Tooltip>

          {/* Cá nhân hóa */}
          <Tooltip content="Cá nhân hóa giao diện" shortcut="Alt+P" side="right">
            <button
              onClick={onOpenPersonalize}
              className={`relative w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-all cursor-pointer ${
                isPersonalizeOpen
                  ? 'bg-accent-soft text-accent'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
              }`}
              aria-label="Cá nhân hóa giao diện"
            >
              {isPersonalizeOpen && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r" />
              )}
              <Palette className="w-4.5 h-4.5" strokeWidth={1.5} />
            </button>
          </Tooltip>

          {/* Thu gọn Activity Bar */}
          <Tooltip content="Ẩn thanh bên" side="right">
            <button
              onClick={onToggleActivityBar}
              className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center text-muted hover:text-secondary hover:bg-[var(--border-subtle)] transition-all cursor-pointer mt-1"
              aria-label="Ẩn thanh bên"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* Mobile Bottom Bar (<768px) */}
      {!hideMobileNav && (
        <nav
          aria-label="Điều hướng dưới cùng"
          className="md:hidden order-3 min-h-[calc(52px+var(--safe-bottom))] pb-safe px-safe w-full bg-elevated/95 glass-panel border-t border-subtle flex items-center justify-around touch-gap select-none z-30 flex-shrink-0"
        >
          <button
            type="button"
            onClick={() => onViewChange('editor')}
            className={`touch-target-h relative flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-[var(--radius-sm)] text-[10px] font-medium transition-colors cursor-pointer ${
              activeView === 'editor' && !isProjectsOpen && !isTemplatesOpen && !isPersonalizeOpen
                ? 'text-accent font-semibold bg-accent-soft/50'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Code2 className="w-4 h-4 mb-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate max-w-full">Soạn thảo</span>
          </button>

          <button
            type="button"
            onClick={onOpenProjects}
            className={`touch-target-h relative flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-[var(--radius-sm)] text-[10px] font-medium transition-colors cursor-pointer ${
              isProjectsOpen ? 'text-accent font-semibold bg-accent-soft/50' : 'text-muted hover:text-primary'
            }`}
          >
            <FolderGit2 className="w-4 h-4 mb-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate max-w-full">Dự án</span>
          </button>

          <button
            type="button"
            onClick={onOpenTemplates}
            className={`touch-target-h relative flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-[var(--radius-sm)] text-[10px] font-medium transition-colors cursor-pointer ${
              isTemplatesOpen ? 'text-accent font-semibold bg-accent-soft/50' : 'text-muted hover:text-primary'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate max-w-full">Mẫu</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange('learn')}
            className={`touch-target-h relative flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-[var(--radius-sm)] text-[10px] font-medium transition-colors cursor-pointer ${
              activeView === 'learn' ? 'text-accent font-semibold bg-accent-soft/50' : 'text-muted hover:text-primary'
            }`}
          >
            <GraduationCap className="w-4 h-4 mb-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate max-w-full">Học</span>
          </button>

          <button
            type="button"
            onClick={onOpenPersonalize}
            className={`touch-target-h relative flex flex-col items-center justify-center py-1 px-1 flex-1 min-w-0 rounded-[var(--radius-sm)] text-[10px] font-medium transition-colors cursor-pointer ${
              isPersonalizeOpen ? 'text-accent font-semibold bg-accent-soft/50' : 'text-muted hover:text-primary'
            }`}
          >
            <Palette className="w-4 h-4 mb-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate max-w-full">Tùy chỉnh</span>
          </button>
        </nav>
      )}
    </>
  );
};
