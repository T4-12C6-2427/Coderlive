import React, { useState, useEffect } from 'react';
import { Download, X, FileCode, Check } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle: string;
  code: string;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  defaultTitle,
  code,
}) => {
  const [extension, setExtension] = useState<'.html' | '.htm'>('.html');
  const [fileName, setFileName] = useState('index');
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Sanitize project title into a clean file name
  useEffect(() => {
    if (isOpen) {
      setIsDownloaded(false);
      let name = defaultTitle
        .trim()
        .replace(/[\\/:*?"<>|]/g, '') // remove illegal filename characters
        .replace(/\s+/g, '-');
      if (!name) name = 'index';
      setFileName(name);
    }
  }, [isOpen, defaultTitle]);

  if (!isOpen) return null;

  const fullFileName = `${fileName.trim() || 'index'}${extension}`;

  const handleDownload = () => {
    try {
      // Create UTF-8 encoded Blob with explicit charset
      const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fullFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsDownloaded(true);
      setTimeout(() => {
        setIsDownloaded(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Lỗi tải tệp:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe pl-safe pr-safe bg-overlay backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain">
      <div
        className="relative w-full max-w-md max-h-viewport-90 overflow-y-auto overscroll-contain p-5 sm:p-6 bg-elevated border border-default rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="touch-target absolute top-3 right-3 p-2 text-muted hover:text-primary hover:bg-[var(--border-subtle)] rounded-[var(--radius-sm)] transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-accent-soft text-accent border border-[var(--accent-base)]/30 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-primary">Tải xuống mã nguồn</h3>
            <p className="text-xs text-secondary">Lưu trang web về máy tính định dạng UTF-8</p>
          </div>
        </div>

        {/* File Name Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">
              Tên tệp (File Name)
            </label>
            <div className="flex items-center touch-gap gap-2">
              <input
                type="text"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                value={fileName}
                onChange={(e) => setFileName(e.target.value.replace(/[\\/:*?"<>|]/g, ''))}
                placeholder="index"
                className="flex-1 min-w-0 px-3.5 py-2.5 bg-input border border-default rounded-[var(--radius-sm)] text-sm text-primary placeholder-muted focus:outline-none focus:border-[var(--accent-base)] focus:ring-1 focus:ring-[var(--accent-base)] transition-all font-mono"
              />
              <span className="text-sm font-mono text-muted px-2.5 py-2.5 bg-panel rounded-[var(--radius-sm)] border border-default flex-shrink-0">
                {extension}
              </span>
            </div>
          </div>

          {/* Extension selector */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">
              Định dạng phần mở rộng
            </label>
            <div className="grid grid-cols-2 touch-gap gap-3">
              <button
                type="button"
                onClick={() => setExtension('.html')}
                className={`touch-target-h p-3 rounded-[var(--radius-sm)] border flex items-center justify-between transition-all cursor-pointer ${
                  extension === '.html'
                    ? 'bg-accent-soft border-[var(--accent-base)] text-accent font-semibold shadow-xs'
                    : 'bg-panel border-default text-secondary hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCode className={`w-4 h-4 ${extension === '.html' ? 'text-accent' : 'text-muted'}`} />
                  <span className="font-mono text-sm">.html</span>
                </div>
                <span className="text-[11px] text-muted">Phổ biến</span>
              </button>

              <button
                type="button"
                onClick={() => setExtension('.htm')}
                className={`touch-target-h p-3 rounded-[var(--radius-sm)] border flex items-center justify-between transition-all cursor-pointer ${
                  extension === '.htm'
                    ? 'bg-accent-soft border-[var(--accent-base)] text-accent font-semibold shadow-xs'
                    : 'bg-panel border-default text-secondary hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCode className={`w-4 h-4 ${extension === '.htm' ? 'text-accent' : 'text-muted'}`} />
                  <span className="font-mono text-sm">.htm</span>
                </div>
                <span className="text-[11px] text-muted">Cổ điển</span>
              </button>
            </div>
          </div>

          {/* Preview of the resulting file */}
          <div className="p-3 bg-panel border border-default rounded-[var(--radius-sm)] text-xs text-secondary flex items-center justify-between gap-2 min-w-0">
            <span className="flex-shrink-0">Tên tệp tải về:</span>
            <span className="font-mono font-medium text-accent truncate min-w-0">{fullFileName}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end touch-gap gap-3">
          <button
            type="button"
            onClick={onClose}
            className="touch-target-h px-4 py-2 text-xs font-medium text-secondary hover:text-primary bg-panel hover:bg-elevated rounded-[var(--radius-sm)] transition-colors border border-default cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloaded}
            className="touch-target-h flex items-center gap-2 px-5 py-2 text-xs font-semibold text-accent-on bg-accent hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] rounded-[var(--radius-sm)] shadow-xs transition-all disabled:opacity-75 cursor-pointer"
          >
            {isDownloaded ? (
              <>
                <Check className="w-4 h-4 text-accent-on" />
                <span>Đã tải xong!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Tải tệp ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
