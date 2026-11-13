import React, { useState, useMemo } from 'react';
import { Sparkles, Search, Check, ChevronRight } from 'lucide-react';
import { Drawer } from './ui/Drawer';
import { CodeTemplate } from '../types';
import { CODE_TEMPLATES } from '../constants/templates';
import { Badge } from './ui/Badge';

export interface TemplatesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CodeTemplate) => void;
  activeTemplateId?: string;
}

export const TemplatesDrawer: React.FC<TemplatesDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  activeTemplateId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return CODE_TEMPLATES;
    const q = searchQuery.toLowerCase().trim();
    return CODE_TEMPLATES.filter(
      (tmpl) =>
        tmpl.name.toLowerCase().includes(q) ||
        tmpl.description?.toLowerCase().includes(q) ||
        tmpl.badge?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-warning" strokeWidth={1.5} />
          <span>Mẫu có sẵn (Templates)</span>
        </div>
      }
      description="Chọn mẫu để bắt đầu thực hành và sáng tạo nhanh chóng"
      width="w-full sm:w-96"
    >
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 sm:top-2.5 text-muted pointer-events-none" strokeWidth={1.5} />
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm mẫu giao diện..."
            aria-label="Tìm kiếm mẫu giao diện"
            className="w-full h-10 sm:h-8 pl-8 pr-3 text-xs bg-elevated border border-default rounded-[var(--radius-sm)] text-primary placeholder-muted outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-base)]"
          />
        </div>

        {/* Template List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              Không tìm thấy mẫu phù hợp
            </div>
          ) : (
            filtered.map((tmpl) => {
              const isActive = activeTemplateId === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className={`touch-target-h w-full text-left group p-3 rounded-[var(--radius-md)] border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isActive
                      ? 'bg-accent-soft border-[var(--accent-base)]/40 shadow-xs'
                      : 'bg-elevated border-default hover:border-strong hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-xs font-semibold text-primary group-hover:text-accent transition-colors truncate">
                      {tmpl.name}
                    </span>
                    <Badge variant={isActive ? 'accent' : 'default'} size="sm">
                      {tmpl.badge}
                    </Badge>
                  </div>
                  {tmpl.description && (
                    <p className="text-[11px] text-secondary line-clamp-2">
                      {tmpl.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between w-full pt-1 text-[10px] text-muted">
                    <span>Mã nguồn hoàn chỉnh (HTML/CSS/JS)</span>
                    <span className="flex items-center gap-0.5 text-accent font-medium sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      Áp dụng <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Drawer>
  );
};
