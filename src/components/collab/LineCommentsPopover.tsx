import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Send,
  X,
  CornerDownRight,
} from 'lucide-react';
import { CollabLineComment, EditorTab } from '../../types';
import { useIsMobile } from '../../hooks/useViewport';

export interface ResolvedLineCommentItem {
  comment: CollabLineComment;
  resolvedLine: number;
}

interface LineCommentsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: EditorTab;
  selectedLine: number;
  anchorY?: number | null;
  allTabComments: ResolvedLineCommentItem[];
  currentUserId: string;
  projectOwnerId: string;
  onSelectLine: (lineNumber: number) => void;
  onAddComment: (lineNumber: number, text: string) => Promise<void>;
  onReply: (commentId: string, text: string) => Promise<void>;
  onToggleResolve: (commentId: string, nextResolved: boolean) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

function formatShortTime(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export const LineCommentsPopover: React.FC<LineCommentsPopoverProps> = ({
  isOpen,
  onClose,
  activeTab,
  selectedLine,
  anchorY,
  allTabComments,
  currentUserId,
  projectOwnerId,
  onSelectLine,
  onAddComment,
  onReply,
  onToggleResolve,
  onDelete,
}) => {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const newCommentInputRef = useRef<HTMLTextAreaElement>(null);

  const [viewMode, setViewMode] = useState<'line' | 'all'>('line');
  const [newCommentText, setNewCommentText] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setViewMode('line');
      setTimeout(() => {
        newCommentInputRef.current?.focus();
      }, 40);
    }
  }, [isOpen, selectedLine, activeTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const selectedLineComments = useMemo(() => {
    return allTabComments.filter((item) => item.resolvedLine === selectedLine);
  }, [allTabComments, selectedLine]);

  const sortedAllComments = useMemo(() => {
    return [...allTabComments].sort((a, b) => {
      if (a.comment.resolved !== b.comment.resolved) {
        return a.comment.resolved ? 1 : -1;
      }
      if (a.resolvedLine !== b.resolvedLine) {
        return a.resolvedLine - b.resolvedLine;
      }
      return a.comment.createdAt.localeCompare(b.comment.createdAt);
    });
  }, [allTabComments]);

  const displayedList = viewMode === 'line' ? selectedLineComments : sortedAllComments;
  const unresolvedTotal = allTabComments.filter((item) => !item.comment.resolved).length;

  if (!isOpen) return null;

  const viewportHeight =
    typeof window !== 'undefined'
      ? (window.visualViewport?.height || window.innerHeight)
      : 760;
  const computedTop =
    typeof anchorY === 'number'
      ? Math.max(56, Math.min(anchorY - 24, viewportHeight - 360))
      : 76;

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCommentText.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onAddComment(selectedLine, trimmed);
      setNewCommentText('');
      setViewMode('line');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    const draft = (replyDrafts[commentId] || '').trim();
    if (!draft || busyCommentId) return;
    setBusyCommentId(commentId);
    try {
      await onReply(commentId, draft);
      setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }));
    } finally {
      setBusyCommentId(null);
    }
  };

  const handleToggleResolve = async (comment: CollabLineComment) => {
    if (busyCommentId) return;
    setBusyCommentId(comment.id);
    try {
      await onToggleResolve(comment.id, !comment.resolved);
    } finally {
      setBusyCommentId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (busyCommentId) return;
    setBusyCommentId(commentId);
    try {
      await onDelete(commentId);
    } finally {
      setBusyCommentId(null);
    }
  };

  const dialogNode = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal={isMobile ? 'true' : undefined}
      aria-label={`Bình luận mã nguồn trên tab ${activeTab.toUpperCase()}`}
      onClick={(e) => e.stopPropagation()}
      style={
        isMobile
          ? undefined
          : {
              position: 'fixed',
              top: `${computedTop}px`,
              left: 'max(12px, min(calc(100vw - 372px), 104px))',
              zIndex: 99985,
            }
      }
      className={
        isMobile
          ? 'w-full max-h-viewport-88 pb-safe flex flex-col bg-elevated border-t border-x border-default rounded-t-[var(--radius-xl)] shadow-[var(--shadow-overlay)] text-xs text-primary overflow-hidden animate-in slide-in-from-bottom duration-200'
          : 'w-[360px] max-w-[calc(100vw-24px)] max-h-[min(420px,calc(var(--app-height,100dvh)-84px-var(--safe-bottom)))] flex flex-col bg-elevated border border-default rounded-[var(--radius-md)] shadow-[var(--shadow-overlay)] text-xs text-primary overflow-hidden animate-in fade-in zoom-in-95 duration-150'
      }
    >
      {isMobile && (
        <div className="flex justify-center pt-2 pb-1 bg-panel flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" />
        </div>
      )}
      {/* Header */}
      <div className="px-3 py-2 bg-panel border-b border-subtle flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.75} />
          <span className="font-semibold text-primary truncate whitespace-nowrap">
            {viewMode === 'line'
              ? `Bình luận · Dòng ${selectedLine}`
              : `Bình luận tab ${activeTab.toUpperCase()}`}
          </span>
        </div>

        <div className="flex items-center touch-gap gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'line' ? 'all' : 'line')}
            className="touch-target-h h-6 px-2 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-[var(--accent-base)] text-[11px] font-medium text-secondary hover:text-primary transition-colors cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
          >
            {viewMode === 'line'
              ? `Tất cả (${unresolvedTotal}/${allTabComments.length})`
              : `Dòng ${selectedLine} (${selectedLineComments.length})`}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng khung bình luận"
            className="touch-hit-expand p-1 rounded-[var(--radius-xs)] text-muted hover:text-primary hover:bg-[var(--border-subtle)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2.5">
        {displayedList.length === 0 ? (
          <div className="py-5 px-3 text-center text-muted text-[11px] bg-panel/60 rounded-[var(--radius-sm)] border border-subtle">
            {viewMode === 'line'
              ? `Chưa có bình luận nào ở dòng ${selectedLine}. Thêm ghi chú bên dưới cho cả nhóm.`
              : `Chưa có bình luận nào trong tab ${activeTab.toUpperCase()}. Nhấp vào số dòng ở lề trái để bình luận.`}
          </div>
        ) : (
          displayedList.map(({ comment, resolvedLine }) => {
            const canDelete =
              comment.authorId === currentUserId || projectOwnerId === currentUserId;
            const isBusy = busyCommentId === comment.id;

            return (
              <div
                key={comment.id}
                className={`p-2.5 rounded-[var(--radius-sm)] border transition-opacity ${
                  comment.resolved
                    ? 'bg-panel/45 border-subtle opacity-75'
                    : 'bg-panel border-default'
                }`}
              >
                {/* Thread Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: comment.authorColor }}
                    />
                    <span className="font-semibold text-primary truncate max-w-[140px]">
                      {comment.authorName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLine(resolvedLine);
                        setViewMode('line');
                      }}
                      className="touch-target-h text-[10px] font-mono px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-elevated border border-subtle text-secondary hover:text-accent cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
                      title={`Nhảy tới dòng ${resolvedLine}`}
                    >
                      Dòng {resolvedLine}
                    </button>
                    <span className="text-[10px] text-muted flex-shrink-0">
                      {formatShortTime(comment.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center touch-gap gap-1 flex-shrink-0">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleResolve(comment)}
                      aria-label={
                        comment.resolved
                          ? 'Mở lại bình luận này'
                          : 'Đánh dấu bình luận đã xử lý'
                      }
                      className={`touch-target-h h-6 px-2 rounded-[var(--radius-xs)] text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
                        comment.resolved
                          ? 'bg-success-soft text-success border border-[var(--color-success)]/30 hover:opacity-85'
                          : 'bg-elevated border border-default text-secondary hover:text-success hover:border-[var(--color-success)]'
                      }`}
                    >
                      {comment.resolved ? (
                        <>
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Mở lại</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Đã xử lý</span>
                        </>
                      )}
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(comment.id)}
                        title="Xóa bình luận"
                        aria-label="Xóa bình luận"
                        className="touch-hit-expand p-1 rounded-[var(--radius-xs)] text-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="mt-1.5 text-xs text-primary whitespace-pre-wrap break-words leading-relaxed select-text">
                  {comment.text}
                </p>

                {comment.resolved && comment.resolvedByName && (
                  <div className="mt-1 text-[10px] text-success">
                    Đã xử lý bởi {comment.resolvedByName}
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="mt-2 pl-2.5 border-l-2 border-subtle space-y-1.5">
                    {comment.replies.map((rep) => (
                      <div key={rep.id} className="text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: rep.authorColor }}
                          />
                          <span className="font-semibold text-primary">{rep.authorName}</span>
                          <span className="text-[10px] text-muted">
                            {formatShortTime(rep.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-secondary whitespace-pre-wrap break-words select-text">
                          {rep.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Reply Box */}
                {!comment.resolved && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSubmitReply(comment.id);
                    }}
                    className="mt-2 flex items-center gap-1.5"
                  >
                    <CornerDownRight className="w-3 h-3 text-muted flex-shrink-0" />
                    <input
                      type="text"
                      enterKeyHint="send"
                      value={replyDrafts[comment.id] || ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [comment.id]: e.target.value,
                        }))
                      }
                      placeholder="Trả lời bình luận..."
                      maxLength={800}
                      aria-label={`Trả lời bình luận của ${comment.authorName}`}
                      className="flex-1 min-w-0 h-10 sm:h-7 px-2 bg-elevated border border-default rounded-[var(--radius-xs)] text-[11px] text-primary placeholder:text-muted focus:border-[var(--accent-base)] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isBusy || !(replyDrafts[comment.id] || '').trim()}
                      aria-label="Gửi trả lời"
                      className="touch-target-h h-10 sm:h-7 px-3 sm:px-2 rounded-[var(--radius-xs)] bg-accent text-accent-on hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap flex-shrink-0"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      <form
        onSubmit={handleSubmitNew}
        className="p-2.5 bg-panel border-t border-subtle space-y-2 flex-shrink-0"
      >
        <textarea
          ref={newCommentInputRef}
          rows={2}
          enterKeyHint="enter"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              void handleSubmitNew(e);
            }
          }}
          maxLength={1000}
          placeholder={`Thêm bình luận cho dòng ${selectedLine}...`}
          aria-label={`Nội dung bình luận cho dòng ${selectedLine}`}
          className="w-full p-2 bg-elevated border border-default rounded-[var(--radius-xs)] text-xs text-primary placeholder:text-muted focus:border-[var(--accent-base)] focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted">
            Tách biệt khỏi mã nguồn · Tất cả thành viên đều thấy
          </span>
          <button
            type="submit"
            disabled={submitting || !newCommentText.trim()}
            className="touch-target-h h-7 px-3 rounded-[var(--radius-xs)] bg-accent hover:bg-[var(--accent-hover)] text-accent-on font-medium text-[11px] flex items-center gap-1.5 disabled:opacity-45 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
          >
            <Send className="w-3 h-3" />
            <span>Gửi bình luận</span>
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(
    isMobile ? (
      <div
        className="fixed inset-0 z-[99985] bg-overlay backdrop-blur-xs flex items-end animate-in fade-in duration-150"
        onClick={onClose}
      >
        {dialogNode}
      </div>
    ) : (
      dialogNode
    ),
    document.body
  );
};
