import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Eye,
  EyeOff,
  Crosshair,
  UserPlus,
  Settings2,
  Check,
  Crown,
  Loader2,
  X,
} from 'lucide-react';
import {
  CollabInviteRole,
  CollabProject,
  CollabRole,
  PresenceUser,
} from '../../types';
import {
  formatPresenceActivity,
  getCollabRoleLabel,
  getInitials,
  getUserPresenceColor,
} from '../../lib/presenceIdentity';
import { getContrastingText } from '../../lib/themeEngine';
import { useIsMobile } from '../../hooks/useViewport';
import { getPublicUserEmail } from '../../lib/usernameAuth';

interface PeoplePanelProps {
  isOpen: boolean;
  anchorRect: { top: number; right: number } | null;
  returnFocusToRef?: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  project: CollabProject;
  currentUserId: string;
  onlineUsers: PresenceUser[];
  followingUid: string | null;
  onToggleFollow: (user: PresenceUser) => void;
  onJumpToUser: (user: PresenceUser) => void;
  onChangeRole?: (targetUid: string, role: CollabInviteRole) => Promise<void>;
  onOpenInvite?: () => void;
  onOpenMemberManagement?: () => void;
  hideRemoteCursors?: boolean;
  onToggleHideRemoteCursors?: () => void;
  hideOwnCursor?: boolean;
  onToggleHideOwnCursor?: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({
  isOpen,
  anchorRect,
  returnFocusToRef,
  onClose,
  project,
  currentUserId,
  onlineUsers,
  followingUid,
  onToggleFollow,
  onJumpToUser,
  onChangeRole,
  onOpenInvite,
  onOpenMemberManagement,
  hideRemoteCursors = false,
  onToggleHideRemoteCursors,
  hideOwnCursor = false,
  onToggleHideOwnCursor,
}) => {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 20);
    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        returnFocusToRef?.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, returnFocusToRef]);

  if (!isOpen || !anchorRect) return null;

  const isOwner = project.ownerId === currentUserId;
  const onlineUidSet = new Set(onlineUsers.map((u) => u.uid));

  const offlineMembers = Object.entries(project.members)
    .filter(([uid]) => !onlineUidSet.has(uid))
    .map(([uid, role]) => {
      const profile = project.memberProfiles[uid];
      return {
        uid,
        role: role as CollabRole,
        name: profile?.name || 'Thành viên',
        email: getPublicUserEmail(profile?.email) || '',
        photoURL: profile?.photoURL || null,
        color: getUserPresenceColor(project.id, uid),
      };
    })
    .sort((a, b) => {
      if (a.role === 'owner') return -1;
      if (b.role === 'owner') return 1;
      return a.name.localeCompare(b.name, 'vi');
    });

  const handleRoleUpdate = async (targetUid: string, nextRole: CollabInviteRole) => {
    if (!onChangeRole) return;
    setBusyUid(targetUid);
    try {
      await onChangeRole(targetUid, nextRole);
    } finally {
      setBusyUid(null);
    }
  };

  const panelContent = (
    <div
      id="collab-people-panel"
      ref={panelRef}
      style={
        isMobile
          ? undefined
          : {
              position: 'fixed',
              top: `${anchorRect.top}px`,
              right: `${anchorRect.right}px`,
              zIndex: 99990,
            }
      }
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal={isMobile ? 'true' : 'false'}
      aria-label="Danh sách thành viên trong dự án"
      className={
        isMobile
          ? 'w-full max-h-viewport-85 pb-safe flex flex-col bg-elevated border-t border-x border-default rounded-t-[var(--radius-xl)] shadow-[var(--shadow-overlay)] text-xs text-primary overflow-hidden animate-in slide-in-from-bottom duration-200 select-none'
          : 'w-[340px] max-w-[calc(100vw-24px-var(--safe-left)-var(--safe-right))] max-h-[calc(var(--app-height,100dvh)-84px-var(--safe-bottom))] flex flex-col bg-elevated border border-default rounded-[var(--radius-md)] shadow-[var(--shadow-overlay)] text-xs text-primary overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none'
      }
    >
      {isMobile && (
        <div className="flex justify-center pt-2 pb-1 bg-panel flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--border-strong)]" />
        </div>
      )}
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-panel border-b border-subtle flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
          <span className="font-semibold text-primary truncate">Thành viên trong dự án</span>
          <span className="text-[11px] font-mono text-muted tabular-nums">
            {onlineUsers.length}/{Object.keys(project.members).length}
          </span>
        </div>
        <button
          ref={closeBtnRef}
          type="button"
          onClick={() => {
            onClose();
            returnFocusToRef?.current?.focus();
          }}
          className="touch-hit-expand p-1 rounded-[var(--radius-xs)] text-muted hover:text-primary hover:bg-[var(--border-subtle)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
          aria-label="Đóng bảng thành viên"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 max-h-[min(360px,calc(var(--app-height,100dvh)-180px-var(--safe-bottom)))] overflow-y-auto overscroll-contain divide-y divide-[var(--border-subtle)]">
        {/* Online users */}
        <div className="p-2.5 space-y-1.5">
          <div className="px-1 text-[10px] font-semibold text-muted uppercase tracking-wider">
            Đang trực tuyến ({onlineUsers.length})
          </div>

          {onlineUsers.map((user) => {
            const isSelf = user.uid === currentUserId;
            const isFollowing = followingUid === user.uid;
            const isTargetOwner = user.role === 'owner';
            const isBusy = busyUid === user.uid;
            const initials = getInitials(user.name);
            const contrastText = getContrastingText(user.color);

            return (
              <div
                key={user.uid}
                className={`p-2 rounded-[var(--radius-sm)] border transition-colors ${
                  isFollowing
                    ? 'bg-accent-soft border-[var(--accent-base)]/40'
                    : 'bg-panel/60 border-transparent hover:border-subtle'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: user.color, color: contrastText }}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                      <span
                        role="img"
                        aria-label={user.isIdle ? 'Vắng mặt' : 'Đang trực tuyến'}
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                        style={{
                          borderColor: 'var(--bg-panel)',
                          backgroundColor: user.isIdle
                            ? 'var(--color-warning)'
                            : 'var(--color-success)',
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-primary truncate">
                          {user.name}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] text-muted flex-shrink-0">(Bạn)</span>
                        )}
                        {isTargetOwner && (
                          <Crown className="w-3 h-3 text-warning flex-shrink-0" strokeWidth={1.5} />
                        )}
                        {user.sessionCount > 1 && (
                          <span className="text-[10px] font-mono text-muted flex-shrink-0">
                            · {user.sessionCount} tab
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-secondary truncate">
                        <span
                          className={
                            user.isIdle
                              ? 'text-warning'
                              : user.isTyping
                              ? 'text-accent font-medium'
                              : 'text-secondary'
                          }
                        >
                          {formatPresenceActivity(user)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role or quick role select for owner */}
                  <div className="flex-shrink-0">
                    {isOwner && !isTargetOwner && onChangeRole ? (
                      <div className="flex items-center gap-1">
                        {isBusy && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                        <select
                          aria-label={`Đổi vai trò của ${user.name}`}
                          value={user.role === 'viewer' ? 'viewer' : 'editor'}
                          disabled={isBusy}
                          onChange={(e) =>
                            handleRoleUpdate(user.uid, e.target.value as CollabInviteRole)
                          }
                          className="touch-target-h h-8 sm:h-6 px-2 sm:px-1.5 text-[11px] bg-elevated border border-default rounded-[var(--radius-xs)] text-primary outline-none focus:border-[var(--accent-base)] cursor-pointer disabled:opacity-50"
                        >
                          <option value="editor">Biên tập viên</option>
                          <option value="viewer">Người xem</option>
                        </select>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted">
                        {getCollabRoleLabel(user.role)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Follow & Jump actions for other online users */}
                {!isSelf && (
                  <div className="mt-2 pt-1.5 border-t border-subtle flex items-center touch-gap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleFollow(user)}
                      className={`touch-target-h flex-1 h-6 px-2 rounded-[var(--radius-xs)] text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        isFollowing
                          ? 'bg-accent text-accent-on'
                          : 'bg-elevated border border-default text-secondary hover:text-primary hover:border-[var(--accent-base)]'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Đang theo dõi</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Theo dõi</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onJumpToUser(user);
                        onClose();
                      }}
                      title={`Chuyển đến vị trí của ${user.name}`}
                      className="touch-target-h flex-1 h-6 px-2 rounded-[var(--radius-xs)] bg-elevated border border-default text-[11px] font-medium text-secondary hover:text-primary hover:border-[var(--accent-base)] flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
                    >
                      <Crosshair className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Chuyển đến {user.name}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Offline members (dimmed) */}
        {offlineMembers.length > 0 && (
          <div className="p-2.5 space-y-1.5">
            <div className="px-1 text-[10px] font-semibold text-muted uppercase tracking-wider">
              Ngoại tuyến ({offlineMembers.length})
            </div>

            {offlineMembers.map((member) => {
              const isTargetOwner = member.role === 'owner';
              const isBusy = busyUid === member.uid;
              return (
                <div
                  key={member.uid}
                  className="p-2 rounded-[var(--radius-sm)] flex items-center justify-between gap-2 opacity-55 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 grayscale-[35%]"
                      style={{ backgroundColor: member.color, color: getContrastingText(member.color) }}
                    >
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{getInitials(member.name)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-primary truncate">
                          {member.name}
                        </span>
                        {isTargetOwner && (
                          <Crown className="w-3 h-3 text-warning flex-shrink-0" strokeWidth={1.5} />
                        )}
                      </div>
                      <span className="text-[11px] text-muted block truncate">Ngoại tuyến</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isOwner && !isTargetOwner && onChangeRole ? (
                      <div className="flex items-center gap-1">
                        {isBusy && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                        <select
                          aria-label={`Đổi vai trò của ${member.name}`}
                          value={member.role === 'viewer' ? 'viewer' : 'editor'}
                          disabled={isBusy}
                          onChange={(e) =>
                            handleRoleUpdate(member.uid, e.target.value as CollabInviteRole)
                          }
                          className="touch-target-h h-8 sm:h-6 px-2 sm:px-1.5 text-[11px] bg-elevated border border-default rounded-[var(--radius-xs)] text-primary outline-none focus:border-[var(--accent-base)] cursor-pointer disabled:opacity-50"
                        >
                          <option value="editor">Biên tập viên</option>
                          <option value="viewer">Người xem</option>
                        </select>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted">
                        {getCollabRoleLabel(member.role)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Privacy & Cursor Visibility Toggles */}
      {(onToggleHideRemoteCursors || onToggleHideOwnCursor) && (
        <div className="px-3 py-2 bg-panel/70 border-t border-subtle space-y-1.5 flex-shrink-0">
          {onToggleHideRemoteCursors && (
            <button
              type="button"
              role="switch"
              aria-checked={hideRemoteCursors}
              onClick={onToggleHideRemoteCursors}
              className="touch-target-h w-full flex items-center justify-between gap-2 py-1 text-[11px] text-secondary hover:text-primary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none rounded-[var(--radius-xs)]"
            >
              <span className="flex items-center gap-1.5">
                {hideRemoteCursors ? (
                  <EyeOff className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-muted" />
                )}
                <span>Ẩn con trỏ của cộng tác viên</span>
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-medium whitespace-nowrap ${
                  hideRemoteCursors
                    ? 'bg-accent text-accent-on'
                    : 'bg-elevated border border-default text-muted'
                }`}
              >
                {hideRemoteCursors ? 'Đang ẩn' : 'Đang hiện'}
              </span>
            </button>
          )}
          {onToggleHideOwnCursor && (
            <button
              type="button"
              role="switch"
              aria-checked={hideOwnCursor}
              onClick={onToggleHideOwnCursor}
              className="touch-target-h w-full flex items-center justify-between gap-2 py-1 text-[11px] text-secondary hover:text-primary transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none rounded-[var(--radius-xs)]"
            >
              <span className="flex items-center gap-1.5">
                {hideOwnCursor ? (
                  <EyeOff className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-muted" />
                )}
                <span>Ẩn vị trí con trỏ của tôi</span>
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-medium whitespace-nowrap ${
                  hideOwnCursor
                    ? 'bg-accent text-accent-on'
                    : 'bg-elevated border border-default text-muted'
                }`}
              >
                {hideOwnCursor ? 'Đang ẩn' : 'Chia sẻ'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="px-3 py-2 bg-panel border-t border-subtle flex flex-wrap items-center justify-between touch-gap gap-2 flex-shrink-0">
        {isOwner && onOpenInvite ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenInvite();
            }}
            className="touch-target-h h-7 px-2.5 rounded-[var(--radius-xs)] bg-accent text-accent-on hover:bg-[var(--accent-hover)] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Mời thành viên</span>
          </button>
        ) : (
          <span className="text-[11px] text-muted">
            Nhấp &ldquo;Theo dõi&rdquo; để xem đồng đội gõ trực tiếp
          </span>
        )}

        {onOpenMemberManagement && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMemberManagement();
            }}
            className="touch-target-h h-7 px-2.5 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-[var(--accent-base)] text-[11px] font-medium text-secondary hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Quản lý</span>
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(
    isMobile ? (
      <div
        className="fixed inset-0 z-[99990] bg-overlay backdrop-blur-xs flex items-end animate-in fade-in duration-150"
        onClick={onClose}
      >
        {panelContent}
      </div>
    ) : (
      panelContent
    ),
    document.body
  );
};
