import React, { useMemo } from 'react';
import { Eye, Info, Sparkles, Monitor } from 'lucide-react';

interface LivePreviewBoxProps {
  code: string;
  title?: string;
  height?: string;
  previewKey?: number | string;
  forceRender?: boolean;
}

export const LivePreviewBox: React.FC<LivePreviewBoxProps> = ({
  code,
  title = 'Kết quả hiển thị',
  height = '280px',
  previewKey = 0,
  forceRender = false,
}) => {
  // Check if code has no visible body content (purely invisible head/doctype/meta/comments)
  const invisibleInfo = useMemo(() => {
    if (forceRender) return null;

    const trimmed = code.trim();
    if (!trimmed) {
      return { isBlank: true, reason: 'Chưa có mã nguồn để hiển thị' };
    }

    // Extract title if present
    const titleMatch = trimmed.match(/<title[^>]*>(.*?)<\/title>/i);
    const hasTitle = Boolean(titleMatch);
    const titleText = titleMatch ? titleMatch[1].trim() : '';

    // Strip comments
    let stripped = trimmed.replace(/<!--[\s\S]*?-->/g, '');
    // Strip doctype
    stripped = stripped.replace(/<!DOCTYPE[^>]*>/gi, '');
    // Strip head and its contents
    stripped = stripped.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    // Strip standalone head/meta/link/title/style/script tags
    stripped = stripped.replace(/<\/?(html|head|meta|link|base|style|script)[^>]*>/gi, '');
    stripped = stripped.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
    // Strip body tags themselves (but check what was inside)
    stripped = stripped.replace(/<\/?body[^>]*>/gi, '');
    stripped = stripped.trim();

    if (stripped.length === 0) {
      if (hasTitle) {
        return {
          isBlank: true,
          type: 'title',
          titleText,
          message: 'Thẻ <title> hiển thị trên tab trình duyệt chứ không nằm trong vùng nội dung trang.',
        };
      }
      return {
        isBlank: true,
        type: 'invisible',
        message: 'Đoạn mã này là thẻ cấu hình hoặc siêu dữ liệu (metadata), không hiển thị trực tiếp lên vùng nội dung của trang.',
      };
    }

    return null;
  }, [code, forceRender]);

  // Combine snippet into safe sandboxed document with a reload nonce
  const safeSrcDoc = useMemo(() => {
    const nonce = `<!-- reload-nonce: ${previewKey}-${Date.now()} -->`;
    if (code.includes('<!DOCTYPE') || code.includes('<html')) {
      if (code.includes('<head>')) {
        return code.replace('<head>', `<head>${nonce}`);
      }
      return `${nonce}\n${code}`;
    }
    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${nonce}
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 16px;
      margin: 0;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.5;
    }
  </style>
</head>
<body>
${code}
</body>
</html>`;
  }, [code, previewKey]);

  return (
    <div className="flex flex-col rounded-[var(--radius-md)] border border-default bg-white overflow-hidden shadow-xs">
      {/* Header Label */}
      <div className="px-3.5 py-2 bg-panel border-b border-subtle flex items-center justify-between text-xs text-primary font-semibold select-none">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-accent" />
          <span>{title}</span>
        </div>
        <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
          {invisibleInfo ? 'Hậu trường' : 'Trực tiếp'}
        </span>
      </div>

      {/* If code is purely invisible, display informative mock rather than empty blank white box */}
      {invisibleInfo ? (
        <div
          className="w-full flex flex-col items-center justify-center p-6 bg-panel text-center select-none"
          style={{ minHeight: height }}
        >
          {invisibleInfo.type === 'title' ? (
            <div className="w-full max-w-sm space-y-3">
              <div className="rounded-[var(--radius-md)] border border-default bg-[var(--code-bg)] overflow-hidden shadow-xs text-left">
                <div className="px-3 py-1.5 bg-elevated border-b border-subtle flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
                  </div>
                  <div className="px-2.5 py-0.5 rounded-t bg-panel border-t border-x border-default text-[11px] font-medium text-primary flex items-center gap-1.5 max-w-[200px] truncate">
                    <Monitor className="w-3 h-3 text-accent flex-shrink-0" />
                    <span className="truncate">{invisibleInfo.titleText || 'Tiêu đề trang'}</span>
                  </div>
                </div>
                <div className="p-4 text-center text-xs text-muted">
                  Vùng nội dung trang web (chưa có phần tử &lt;body&gt;)
                </div>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {invisibleInfo.message}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-sm space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-accent-soft border border-[var(--accent-base)]/30 flex items-center justify-center mx-auto text-accent">
                <Info className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-primary">
                Cấu hình nền móng (Metadata)
              </h4>
              <p className="text-xs text-secondary leading-relaxed">
                {invisibleInfo.message}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Sandboxed iframe with dynamic key to ensure clean remount on reset */
        <iframe
          key={`live-preview-${previewKey}`}
          srcDoc={safeSrcDoc}
          title={title}
          sandbox="allow-scripts"
          className="w-full border-0 bg-white"
          style={{ height }}
        />
      )}
    </div>
  );
};
