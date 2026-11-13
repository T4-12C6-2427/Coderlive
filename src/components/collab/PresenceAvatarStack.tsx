import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PresenceUser } from '../../types';
import {
  formatPresenceActivity,
  getCollabRoleLabel,
  getInitials,
} from '../../lib/presenceIdentity';
import { getContrastingText } from '../../lib/themeEngine';
import { useIsMobile, useIsTouch } from '../../hooks/useViewport';

interface PresenceAvatarStackProps {
  onlineUsers: PresenceUser[];
  currentUserId: string;
  followingUid?: string | null;
  isPeoplePanelOpen: boolean;
  onTogglePeoplePanel: (anchorEl: HTMLElement) => void;
}

export const PresenceAvatarStack: React.FC<PresenceAvatarStackProps> = ({
  onlineUsers,
  currentUserId,
  followingUid,
  isPeoplePanelOpen,
  onTogglePeoplePanel,
}) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouch();
  const [hoveredUser, setHoveredUser] = useState<{
    user: PresenceUser;
    top: number;
    left: number;
  } | null>(null);

  if (onlineUsers.length === 0) return null;

  const maxVisible = isMobile ? 2 : 5;
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const overflowCount = Math.max(0, onlineUsers.length - maxVisible);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, user: PresenceUser) => {
    if (isTouch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredUser({
      user,
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  };

  if (isMobile) {
    const leadUser = onlineUsers[0];
    const leadContrast = getContrastingText(leadUser.color);
    const leadInitials = getInitials(leadUser.name);

    return (
      <button
        type="button"
        onClick={(e) => {
          setHoveredUser(null);
          onTogglePeoplePanel(e.currentTarget);
        }}
        aria-expanded={isPeoplePanelOpen}
        aria-haspopup="dialog"
        aria-controls="collab-people-panel"
        aria-label={`Đang trực tuyến (${onlineUsers.length} thành viên) — Mở danh sách thành viên`}
        className={`touch-target relative h-8 px-1.5 rounded-full bg-panel border border-default flex items-center justify-center gap-1 flex-shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
          isPeoplePanelOpen ? 'ring-1 ring-[var(--accent-base)] border-[var(--accent-base)]' : ''
        }`}
      >
        <span
          className={`relative w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
            leadUser.isIdle ? 'opacity-65' : ''
          }`}
          style={{
            backgroundColor: leadUser.color,
            color: leadContrast,
          }}
        >
          {leadUser.photoURL ? (
            <img
              src={leadUser.photoURL}
              alt={leadUser.name}
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span>{leadInitials}</span>
          )}
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border"
            style={{
              borderColor: 'var(--bg-panel)',
              backgroundColor: leadUser.isIdle
                ? 'var(--color-warning)'
                : 'var(--color-success)',
            }}
          />
        </span>
        {onlineUsers.length > 1 && (
          <span className="text-[10px] font-mono font-bold text-primary pr-0.5">
            {onlineUsers.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      <div
        role="group"
        aria-label={`Thành viên đang trực tuyến (${onlineUsers.length})`}
        className="flex items-center -space-x-1.5 flex-shrink-0"
      >
        {visibleUsers.map((user) => {
          const isSelf = user.uid === currentUserId;
          const isFollowing = followingUid === user.uid;
          const initials = getInitials(user.name);
          const contrastText = getContrastingText(user.color);

          return (
            <button
              key={user.uid}
              type="button"
              onClick={(e) => {
                setHoveredUser(null);
                onTogglePeoplePanel(e.currentTarget);
              }}
              onMouseEnter={(e) => handleMouseEnter(e, user)}
              onMouseLeave={() => setHoveredUser(null)}
              aria-expanded={isPeoplePanelOpen}
              aria-haspopup="dialog"
              aria-controls="collab-people-panel"
              aria-label={`${user.name}${isSelf ? ' (Bạn)' : ''} — ${getCollabRoleLabel(user.role)} — ${formatPresenceActivity(user)}`}
              className={`touch-hit-expand relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 hover:z-20 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none cursor-pointer ${
                user.isIdle ? 'opacity-65' : ''
              } ${isPeoplePanelOpen ? 'ring-1 ring-[var(--border-strong)]' : ''}`}
              style={{
                backgroundColor: user.color,
                color: contrastText,
                boxShadow: isFollowing
                  ? `0 0 0 2px var(--bg-elevated), 0 0 0 4px ${user.color}`
                  : `0 0 0 2px var(--bg-elevated)`,
              }}
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

              {/* Chấm trạng thái hoạt động / vắng mặt */}
              <span
                role="img"
                aria-label={user.isIdle ? 'Vắng mặt' : 'Đang trực tuyến'}
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{
                  borderColor: 'var(--bg-elevated)',
                  backgroundColor: user.isIdle
                    ? 'var(--color-warning)'
                    : 'var(--color-success)',
                }}
              />

              {/* Huy hiệu nhỏ khi 1 người mở nhiều tab */}
              {user.sessionCount > 1 && !isSelf && (
                <span
                  aria-label={`${user.sessionCount} tab đang mở`}
                  className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-elevated border border-default text-[8px] font-mono font-bold text-primary flex items-center justify-center"
                  title={`${user.sessionCount} tab đang mở`}
                >
                  {user.sessionCount}
                </span>
              )}
            </button>
          );
        })}

        {overflowCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              setHoveredUser(null);
              onTogglePeoplePanel(e.currentTarget);
            }}
            aria-expanded={isPeoplePanelOpen}
            aria-haspopup="dialog"
            aria-controls="collab-people-panel"
            title={`Còn ${overflowCount} người khác đang trực tuyến — Nhấp để xem`}
            aria-label={`Còn ${overflowCount} người khác đang trực tuyến — Mở danh sách thành viên`}
            className="touch-hit-expand relative w-7 h-7 rounded-full bg-panel border border-default hover:border-[var(--accent-base)] text-[10px] font-mono font-bold text-primary flex items-center justify-center z-10 hover:z-20 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
            style={{ boxShadow: '0 0 0 2px var(--bg-elevated)' }}
          >
            +{overflowCount}
          </button>
        )}
      </div>

      {/* Portal Tooltip khi rê chuột lên avatar */}
      {hoveredUser &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${hoveredUser.top}px`,
              left: `${hoveredUser.left}px`,
              transform: 'translateX(-50%)',
              zIndex: 99999,
            }}
            className="pointer-events-none px-2.5 py-2 bg-elevated border border-default rounded-[var(--radius-sm)] shadow-[var(--shadow-elevated)] text-xs text-primary min-w-[170px] max-w-[240px] animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: hoveredUser.user.color }}
              />
              <span className="font-semibold truncate">
                {hoveredUser.user.name}
                {hoveredUser.user.uid === currentUserId ? ' (Bạn)' : ''}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-secondary">
              <span>{getCollabRoleLabel(hoveredUser.user.role)}</span>
              <span aria-hidden="true">·</span>
              <span className={hoveredUser.user.isIdle ? 'text-warning' : 'text-primary'}>
                {formatPresenceActivity(hoveredUser.user)}
              </span>
            </div>
            {hoveredUser.user.sessionCount > 1 && (
              <div className="mt-0.5 text-[10px] text-muted font-mono">
                {hoveredUser.user.sessionCount} phiên đang mở
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
