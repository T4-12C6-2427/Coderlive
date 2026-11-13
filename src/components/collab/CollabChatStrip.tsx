import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { CollabChatMessage } from '../../types';
import { getInitials } from '../../lib/presenceIdentity';
import { getContrastingText } from '../../lib/themeEngine';

interface CollabChatStripProps {
  projectId: string;
  currentUserId: string;
  projectOwnerId: string;
  messages: CollabChatMessage[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSendMessage: (text: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  hidden?: boolean;
  isKeyboardOpen?: boolean;
  liftAboveMobileRun?: boolean;
}

function playQuietChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.setValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
    osc.onended = () => {
      void ctx.close().catch(() => {});
    };
  } catch {
    // Trình duyệt có thể chặn AudioContext khi chưa tương tác
  }
}

function formatMessageTime(iso: string): string {
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

export const CollabChatStrip: React.FC<CollabChatStripProps> = ({
  projectId,
  currentUserId,
  projectOwnerId,
  messages,
  soundEnabled,
  onToggleSound,
  onSendMessage,
  onDeleteMessage,
  hidden = false,
  isKeyboardOpen = false,
  liftAboveMobileRun = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastReadCount, setLastReadCount] = useState(0);

  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMsgIdsRef = useRef<Set<string>>(new Set());
  const hasHydratedRef = useRef<boolean>(false);

  // Reset trạng thái khi chuyển dự án
  useEffect(() => {
    setIsExpanded(false);
    setDraft('');
    setLastReadCount(0);
    prevMsgIdsRef.current = new Set();
    hasHydratedRef.current = false;
  }, [projectId]);

  // Theo dõi tin nhắn mới đến từ cộng tác viên để phát âm thanh (nếu bật) và cập nhật badge chưa đọc
  useEffect(() => {
    if (!hasHydratedRef.current) {
      prevMsgIdsRef.current = new Set(messages.map((m) => m.id));
      hasHydratedRef.current = true;
      setLastReadCount(messages.length);
      return;
    }

    const incomingRemote = messages.filter(
      (m) => !prevMsgIdsRef.current.has(m.id) && m.authorId !== currentUserId
    );
    prevMsgIdsRef.current = new Set(messages.map((m) => m.id));

    if (incomingRemote.length > 0 && soundEnabled) {
      playQuietChime();
    }

    if (isExpanded) {
      setLastReadCount(messages.length);
    }
  }, [messages, currentUserId, soundEnabled, isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      setLastReadCount(messages.length);
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    }
  }, [isExpanded, messages.length]);

  const unreadCount = useMemo(() => {
    if (isExpanded) return 0;
    const diff = messages.length - lastReadCount;
    if (diff <= 0) return 0;
    return messages.slice(-diff).filter((m) => m.authorId !== currentUserId).length;
  }, [isExpanded, messages, lastReadCount, currentUserId]);

  if (hidden || (!isExpanded && isKeyboardOpen)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    try {
      await onSendMessage(trimmed);
      setDraft('');
    } finally {
      setIsSending(false);
    }
  };

  const mobileBottomClass =
    isExpanded && isKeyboardOpen
      ? 'bottom-[max(0.5rem,var(--safe-bottom))] md:bottom-[calc(12px+var(--safe-bottom))]'
      : 'bottom-[calc(4.5rem+var(--safe-bottom))] md:bottom-[calc(12px+var(--safe-bottom))]';
  const mobileRightClass =
    liftAboveMobileRun && !isExpanded
      ? 'right-[calc(4.75rem+var(--safe-right))] md:right-[calc(12px+var(--safe-right))]'
      : 'right-[calc(12px+var(--safe-right))]';

  return (
    <div className={`fixed ${mobileBottomClass} ${mobileRightClass} z-40 flex flex-col items-end select-none transition-all duration-150`}>
      {isExpanded ? (
        <section
          aria-label="Khung trò chuyện nhóm"
          className={`w-[320px] max-w-[calc(100vw-24px-var(--safe-left)-var(--safe-right))] ${
            isKeyboardOpen
              ? 'h-[min(280px,calc(var(--app-height,100dvh)-64px-var(--safe-top)-var(--safe-bottom)))]'
              : 'h-[min(340px,calc(var(--app-height,100dvh)-148px-var(--safe-top)-var(--safe-bottom)))]'
          } md:h-[min(340px,calc(var(--app-height,100dvh)-96px-var(--safe-top)-var(--safe-bottom)))] bg-elevated border border-default rounded-[var(--radius-md)] shadow-[var(--shadow-overlay)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150`}
        >
          {/* Chat Header */}
          <div className="min-h-[36px] px-3 py-1 bg-panel border-b border-subtle flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <MessageCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.75} />
              <span className="text-xs font-semibold text-primary truncate">
                Trò chuyện nhóm
              </span>
              <span className="text-[10px] font-mono text-muted flex-shrink-0">
                ({messages.length})
              </span>
            </div>

            <div className="flex items-center touch-gap gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={onToggleSound}
                aria-pressed={soundEnabled}
                aria-label={
                  soundEnabled
                    ? 'Tắt âm thanh thông báo trò chuyện'
                    : 'Bật âm thanh thông báo trò chuyện'
                }
                className={`touch-hit-expand p-1 rounded-[var(--radius-xs)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
                  soundEnabled
                    ? 'text-accent bg-accent-soft'
                    : 'text-muted hover:text-primary hover:bg-[var(--border-subtle)]'
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Thu gọn khung trò chuyện"
                className="touch-hit-expand p-1 rounded-[var(--radius-xs)] text-muted hover:text-primary hover:bg-[var(--border-subtle)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2 text-xs select-text">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted px-4 text-[11px]">
                <MessageCircle className="w-6 h-6 text-muted/60 mb-1.5" strokeWidth={1.5} />
                <span>Chưa có tin nhắn nào. Hãy gửi lời chào đến nhóm!</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.authorId === currentUserId;
                const canDelete = isSelf || projectOwnerId === currentUserId;
                const contrastColor = getContrastingText(msg.authorColor);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 px-1 text-[10px] text-muted">
                      {!isSelf && (
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                          style={{
                            backgroundColor: msg.authorColor,
                            color: contrastColor,
                          }}
                        >
                          {getInitials(msg.authorName).slice(0, 1)}
                        </span>
                      )}
                      <span className="font-medium text-secondary">
                        {isSelf ? 'Bạn' : msg.authorName}
                      </span>
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void onDeleteMessage(msg.id)}
                          aria-label="Xóa tin nhắn"
                          className="touch-hit-expand opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 text-muted hover:text-danger transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] px-2.5 py-1.5 rounded-[var(--radius-sm)] break-words whitespace-pre-wrap leading-relaxed ${
                        isSelf
                          ? 'bg-accent text-accent-on'
                          : 'bg-panel border border-default text-primary'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={listEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-2 bg-panel border-t border-subtle flex items-center touch-gap gap-1.5 flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              enterKeyHint="send"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={500}
              placeholder="Nhắn nhanh cho nhóm..."
              aria-label="Nhập tin nhắn trò chuyện nhóm"
              className="flex-1 min-w-0 h-10 sm:h-7 px-2.5 bg-elevated border border-default rounded-[var(--radius-xs)] text-xs text-primary placeholder:text-muted focus:border-[var(--accent-base)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              aria-label="Gửi tin nhắn"
              className="touch-target-h h-10 sm:h-7 px-3 sm:px-2.5 rounded-[var(--radius-xs)] bg-accent hover:bg-[var(--accent-hover)] text-accent-on disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-expanded={false}
          aria-label={
            unreadCount > 0
              ? `Mở trò chuyện nhóm (${unreadCount} tin nhắn chưa đọc)`
              : 'Mở trò chuyện nhóm'
          }
          className="touch-target-h h-8 px-3 rounded-full bg-elevated hover:bg-panel border border-default hover:border-[var(--accent-base)] shadow-[var(--shadow-elevated)] text-xs font-medium text-primary flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
        >
          <MessageCircle className="w-3.5 h-3.5 text-accent" strokeWidth={1.75} />
          <span>Trò chuyện</span>
          {unreadCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-on text-[10px] font-bold flex items-center justify-center tabular-nums">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
