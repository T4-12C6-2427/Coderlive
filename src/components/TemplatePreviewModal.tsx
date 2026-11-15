import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Eye,
  FolderPlus,
  Monitor,
  Play,
  RotateCcw,
  Smartphone,
  Star,
} from 'lucide-react';
import { CodeTemplate, TemplateRelatedLesson } from '../types';
import {
  getTemplateLineCount,
  hasTemplateCss,
  hasTemplateHtml,
  hasTemplateJs,
} from '../constants/templates';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Tooltip } from './ui/Feedback';

export interface TemplatePreviewModalProps {
  template: CodeTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: CodeTemplate) => void;
  onCreateProjectFromTemplate: (template: CodeTemplate) => void;
  isFavorite: boolean;
  onToggleFavorite: (templateId: string) => void;
  onOpenRelatedLesson: (lesson: TemplateRelatedLesson) => void;
  isApplyDisabled?: boolean;
  applyDisabledReason?: string;
}

type CodeTab = 'html' | 'css' | 'js';

function buildFullPreviewSrcDoc(template: CodeTemplate): string {
  const html = template.htmlCode || '';
  const css = template.cssCode || '';
  const js = template.jsCode || '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>html { background-color: #ffffff; }</style>
  <style>${css}</style>
</head>
<body>
${html}
<script>
try {
  ${js}
} catch (err) {
  console.error(err);
}
</script>
</body>
</html>`;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate,
  onCreateProjectFromTemplate,
  isFavorite,
  onToggleFavorite,
  onOpenRelatedLesson,
  isApplyDisabled = false,
  applyDisabledReason = 'Bạn đang ở chế độ chỉ xem, không thể ghi đè dự án hiện tại',
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [codeTab, setCodeTab] = useState<CodeTab>('html');
  const [reloadNonce, setReloadNonce] = useState(0);
  const [copiedTab, setCopiedTab] = useState<CodeTab | null>(null);

  useEffect(() => {
    if (isOpen && template) {
      setViewMode('preview');
      setPreviewViewport('desktop');
      setCodeTab('html');
      setReloadNonce(0);
      setCopiedTab(null);
    }
  }, [isOpen, template?.id]);

  const srcDoc = useMemo(() => {
    if (!template) return '';
    return buildFullPreviewSrcDoc(template);
  }, [template]);

  if (!template) return null;

  const hasHtml = hasTemplateHtml(template);
  const hasCss = hasTemplateCss(template);
  const hasJs = hasTemplateJs(template);
  const lineCount = getTemplateLineCount(template);

  const activeCodeText =
    codeTab === 'html'
      ? template.htmlCode || ''
      : codeTab === 'css'
      ? template.cssCode || '/* Mẫu này không sử dụng CSS riêng */'
      : template.jsCode || '// Mẫu này không sử dụng JavaScript';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeCodeText);
      setCopiedTab(codeTab);
      setTimeout(() => setCopiedTab(null), 1800);
    } catch {
      // Fallback nhẹ nếu clipboard bị từ chối
    }
  };

  const difficultyBadgeVariant =
    template.difficulty === 'Dễ'
      ? 'success'
      : template.difficulty === 'Trung bình'
      ? 'warning'
      : 'danger';

  const useButton = (
    <Button
      variant="primary"
      size="md"
      leftIcon={<Play className="w-3.5 h-3.5" />}
      disabled={isApplyDisabled}
      onClick={() => onUseTemplate(template)}
      className="min-h-[44px] md:min-h-[36px] w-full sm:w-auto"
    >
      Dùng mẫu này
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="full"
      fullScreenMobile={true}
      className="md:w-[min(1060px,95vw)] md:h-[min(760px,90vh)]"
      bodyClassName="flex-1 min-h-0 overflow-hidden flex flex-col md:flex-row"
      title={
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate">{template.name}</span>
          <Badge variant="accent" size="sm">
            {template.category}
          </Badge>
        </div>
      }
      description={template.description}
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className="min-h-[44px] md:min-h-[36px]"
            >
              Đóng
            </Button>
            {isApplyDisabled && (
              <span className="text-[11px] text-warning hidden lg:inline">
                {applyDisabledReason}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<FolderPlus className="w-3.5 h-3.5" />}
              onClick={() => onCreateProjectFromTemplate(template)}
              className="min-h-[44px] md:min-h-[36px]"
            >
              Mở thành dự án mới
            </Button>

            {isApplyDisabled ? (
              <Tooltip content={applyDisabledReason} side="top">
                <span className="inline-flex w-full sm:w-auto">{useButton}</span>
              </Tooltip>
            ) : (
              useButton
            )}
          </div>
        </div>
      }
    >
      {/* Cột trái: Xem trước trực tiếp / Xem code */}
      <div className="flex-1 min-w-0 min-h-[280px] md:min-h-0 flex flex-col border-b md:border-b-0 md:border-r border-subtle bg-panel">
        {/* Thanh công cụ chế độ xem */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-subtle bg-elevated flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`min-h-[36px] md:min-h-[30px] px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-accent text-accent-on'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trực tiếp</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`min-h-[36px] md:min-h-[30px] px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'code'
                  ? 'bg-accent text-accent-on'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Xem code</span>
            </button>
          </div>

          {viewMode === 'preview' ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewViewport('desktop')}
                aria-pressed={previewViewport === 'desktop'}
                aria-label="Xem kích thước máy tính"
                title="Kích thước máy tính"
                className={`min-w-[36px] min-h-[36px] md:min-w-[30px] md:min-h-[30px] px-2 rounded-[var(--radius-sm)] inline-flex items-center justify-center transition-colors cursor-pointer ${
                  previewViewport === 'desktop'
                    ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/40'
                    : 'text-muted hover:text-primary hover:bg-[var(--border-subtle)]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport('mobile')}
                aria-pressed={previewViewport === 'mobile'}
                aria-label="Xem kích thước điện thoại"
                title="Kích thước điện thoại (375px)"
                className={`min-w-[36px] min-h-[36px] md:min-w-[30px] md:min-h-[30px] px-2 rounded-[var(--radius-sm)] inline-flex items-center justify-center transition-colors cursor-pointer ${
                  previewViewport === 'mobile'
                    ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/40'
                    : 'text-muted hover:text-primary hover:bg-[var(--border-subtle)]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setReloadNonce((n) => n + 1)}
                aria-label="Tải lại bản xem trước"
                title="Chạy lại bản xem trước"
                className="min-w-[36px] min-h-[36px] md:min-w-[30px] md:min-h-[30px] px-2 rounded-[var(--radius-sm)] text-muted hover:text-primary hover:bg-[var(--border-subtle)] inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {(['html', 'css', 'js'] as CodeTab[]).map((tab) => {
                const disabled =
                  (tab === 'css' && !hasCss) || (tab === 'js' && !hasJs);
                return (
                  <button
                    key={tab}
                    type="button"
                    disabled={disabled}
                    onClick={() => setCodeTab(tab)}
                    className={`min-h-[34px] md:min-h-[28px] px-2.5 rounded-[var(--radius-xs)] text-[11px] font-semibold uppercase transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      codeTab === tab
                        ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/40'
                        : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleCopyCode}
                className="min-h-[34px] md:min-h-[28px] px-2.5 rounded-[var(--radius-xs)] text-[11px] font-medium text-secondary hover:text-primary hover:bg-[var(--border-subtle)] inline-flex items-center gap-1 transition-colors cursor-pointer ml-1"
              >
                {copiedTab === codeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-success">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Nội dung xem trước hoặc mã nguồn */}
        <div className="flex-1 min-h-0 p-3 flex items-center justify-center overflow-hidden">
          {viewMode === 'preview' ? (
            <div
              className={`h-full transition-all duration-200 border border-default rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-subtle)] ${
                previewViewport === 'mobile' ? 'w-[375px] max-w-full' : 'w-full'
              }`}
            >
              <iframe
                key={`${template.id}-${reloadNonce}`}
                srcDoc={srcDoc}
                sandbox="allow-scripts"
                title={`Xem trước trực tiếp ${template.name}`}
                className="w-full h-full border-0 block"
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-[var(--radius-md)] border border-default bg-elevated overflow-auto p-3 sm:p-4 select-text">
              <pre className="text-xs leading-relaxed font-mono text-primary whitespace-pre-wrap break-words">
                <code>{activeCodeText}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Cột phải: Thông tin học tập, siêu dữ liệu & bài học liên quan */}
      <aside className="w-full md:w-80 lg:w-88 flex-shrink-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-5 bg-elevated">
        {/* Tóm tắt & nút Yêu thích */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={difficultyBadgeVariant} size="sm">
              {template.difficulty}
            </Badge>
            {hasHtml && (
              <Badge variant="default" size="sm">
                HTML
              </Badge>
            )}
            {hasCss && (
              <Badge variant="default" size="sm">
                CSS
              </Badge>
            )}
            {hasJs && (
              <Badge variant="default" size="sm">
                JS
              </Badge>
            )}
            <span className="text-[11px] font-mono text-muted tabular-nums ml-1">
              {lineCount} dòng
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(template.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
            className={`min-h-[44px] md:min-h-[34px] px-2.5 py-1 rounded-[var(--radius-sm)] border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0 ${
              isFavorite
                ? 'bg-warning-soft text-warning border-[var(--color-warning)]/40'
                : 'bg-panel text-secondary hover:text-primary border-default hover:border-strong'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`}
              strokeWidth={1.75}
            />
            <span>{isFavorite ? 'Đã thích' : 'Yêu thích'}</span>
          </button>
        </div>

        {/* Bạn sẽ học */}
        <section className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Bạn sẽ học
          </h4>
          <ul className="space-y-2">
            {template.learningPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-secondary leading-relaxed"
              >
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Bài học liên quan */}
        {template.relatedLessons.length > 0 && (
          <section className="space-y-2.5 pt-2 border-t border-subtle">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              <span>Xem bài học liên quan</span>
            </h4>
            <div className="space-y-1.5">
              {template.relatedLessons.map((rel) => (
                <button
                  key={`${rel.courseId}:${rel.slug}`}
                  type="button"
                  onClick={() => onOpenRelatedLesson(rel)}
                  className="w-full min-h-[44px] md:min-h-[38px] text-left px-3 py-2 rounded-[var(--radius-sm)] bg-panel hover:bg-[var(--border-subtle)] border border-default hover:border-[var(--accent-base)]/40 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <span className="text-xs font-medium text-primary group-hover:text-accent truncate">
                    {rel.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent-soft text-accent flex-shrink-0">
                    {rel.courseId}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Từ khóa mẫu */}
        {template.tags.length > 0 && (
          <section className="space-y-2 pt-2 border-t border-subtle">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Chủ đề
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] bg-panel text-secondary border border-subtle"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </aside>
    </Modal>
  );
};
