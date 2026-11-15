import React, { useRef, useState } from 'react';
import {
  ArrowRightLeft,
  ChevronDown,
  Crown,
  Edit3,
  Eye,
  Loader2,
  Trash2,
} from 'lucide-react';
import { CollabInviteRole, CollabProject } from '../../types';
import { Badge } from '../ui/Badge';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import {
  extractUsernameFromSyntheticEmail,
  getPublicUserEmail,
  maskEmail,
} from '../../lib/usernameAuth';

export interface MemberRoleDropdownButtonProps {
  memberName: string;
  role: CollabInviteRole;
  disabled: boolean;
  onChangeRole: (role: CollabInviteRole) => void;
}

export const MemberRoleDropdownButton: React.FC<MemberRoleDropdownButtonProps> = ({
  memberName,
  role,
  disabled,
  onChangeRole,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const items: DropdownItem[] = [
    {
      id: 'editor',
      label: 'Biên tập viên',
      hint: role === 'editor' ? 'Đang chọn' : undefined,
      icon: <Edit3 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />,
      onSelect: () => {
        if (role !== 'editor') onChangeRole('editor');
      },
    },
    {
      id: 'viewer',
      label: 'Người xem',
      hint: role === 'viewer' ? 'Đang chọn' : undefined,
      icon: <Eye className="w-3.5 h-3.5 text-warning" strokeWidth={1.5} />,
      onSelect: () => {
        if (role !== 'viewer') onChangeRole('viewer');
      },
    },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Vai trò của ${memberName}`}
        className="min-h-[44px] md:min-h-[30px] h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium bg-elevated border border-default hover:border-[var(--border-strong)] rounded-[var(--radius-xs)] text-primary transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
      >
        <span>{role === 'editor' ? 'Biên tập viên' : 'Người xem'}</span>
        <ChevronDown className="w-3 h-3 text-muted" strokeWidth={1.5} />
      </button>

      <Dropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        items={items}
        align="right"
        minWidth={170}
        ariaLabel={`Chọn vai trò cho ${memberName}`}
      />
    </>
  );
};

export interface CollabMemberListProps {
  project: CollabProject;
  currentUserId: string;
  currentUserEmail?: string | null;
  onChangeRole?: (targetUid: string, role: CollabInviteRole) => Promise<void>;
  onRemoveMember?: (targetUid: string) => Promise<void>;
  onTransferOwnership?: (newOwnerUid: string) => Promise<void>;
  allowOwnershipTransfer?: boolean;
  compact?: boolean;
  onError?: (message: string | null) => void;
}

export function getRoleDisplayLabel(role: string): string {
  if (role === 'owner') return 'Chủ sở hữu';
  if (role === 'editor') return 'Biên tập viên';
  return 'Người xem';
}

export const CollabMemberList: React.FC<CollabMemberListProps> = ({
  project,
  currentUserId,
  currentUserEmail = null,
  onChangeRole,
  onRemoveMember,
  onTransferOwnership,
  allowOwnershipTransfer = false,
  compact = false,
  onError,
}) => {
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [confirmRemoveUid, setConfirmRemoveUid] = useState<string | null>(null);
  const [confirmTransferUid, setConfirmTransferUid] = useState<string | null>(null);

  const isOwner = project.ownerId === currentUserId;
  const memberEntries = Object.entries(project.members).sort(([uidA, roleA], [uidB, roleB]) => {
    if (roleA === 'owner') return -1;
    if (roleB === 'owner') return 1;
    if (uidA === currentUserId) return -1;
    if (uidB === currentUserId) return 1;
    const nameA = project.memberProfiles[uidA]?.name || '';
    const nameB = project.memberProfiles[uidB]?.name || '';
    return nameA.localeCompare(nameB, 'vi');
  });

  const handleRoleChange = async (uid: string, role: CollabInviteRole) => {
    if (!onChangeRole) return;
    onError?.(null);
    setBusyUid(uid);
    try {
      await onChangeRole(uid, role);
    } catch {
      onError?.('Không thể cập nhật vai trò thành viên.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleRemove = async (uid: string) => {
    if (!onRemoveMember) return;
    onError?.(null);
    setBusyUid(uid);
    try {
      await onRemoveMember(uid);
      setConfirmRemoveUid(null);
    } catch {
      onError?.('Không thể xóa thành viên khỏi dự án.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleTransfer = async (uid: string) => {
    if (!onTransferOwnership) return;
    onError?.(null);
    setBusyUid(uid);
    try {
      await onTransferOwnership(uid);
      setConfirmTransferUid(null);
    } catch {
      onError?.('Không thể chuyển quyền sở hữu.');
    } finally {
      setBusyUid(null);
    }
  };

  return (
    <div className="space-y-2">
      {memberEntries.map(([uid, role]) => {
        const isSelf = uid === currentUserId;
        const profile = project.memberProfiles[uid];
        const rawEmail = profile?.email;
        const publicEmail = getPublicUserEmail(rawEmail);
        const selfPublicEmail = isSelf
          ? getPublicUserEmail(currentUserEmail) || publicEmail
          : null;
        const maskedOtherEmail = !isSelf ? maskEmail(publicEmail) : null;
        const legacyUsername =
          extractUsernameFromSyntheticEmail(rawEmail) ||
          (isSelf ? extractUsernameFromSyntheticEmail(currentUserEmail) : null);
        const rawDisplayName = (profile?.name || '').trim();
        const displayName =
          rawDisplayName && !rawDisplayName.includes('@users.coderlive.app')
            ? rawDisplayName
            : legacyUsername
            ? `@${legacyUsername}`
            : 'Thành viên';

        const subtitle = isSelf
          ? selfPublicEmail ||
            (legacyUsername && legacyUsername.toLowerCase() !== displayName.toLowerCase()
              ? `@${legacyUsername}`
              : '')
          : maskedOtherEmail ||
            (legacyUsername && legacyUsername.toLowerCase() !== displayName.toLowerCase()
              ? `@${legacyUsername}`
              : '');

        const photoURL = profile?.photoURL;
        const isTargetOwner = role === 'owner';
        const isBusy = busyUid === uid;

        return (
          <div
            key={uid}
            className={`${compact ? 'p-2.5' : 'p-3'} rounded-[var(--radius-md)] bg-panel border border-default space-y-2`}
          >
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border border-default flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent-soft text-accent border border-[var(--accent-base)]/30 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {displayName.replace(/^@/, '').charAt(0).toUpperCase() || 'T'}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold text-primary truncate">
                      {displayName}
                    </span>
                    {isSelf && (
                      <span className="text-[10px] text-muted flex-shrink-0">· Bạn</span>
                    )}
                    {isTargetOwner && (
                      <Crown
                        className="w-3.5 h-3.5 text-warning flex-shrink-0"
                        strokeWidth={1.5}
                        aria-label="Chủ sở hữu"
                      />
                    )}
                  </div>
                  {subtitle && <p className="text-[11px] text-muted truncate">{subtitle}</p>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isOwner && !isTargetOwner && (onChangeRole || onRemoveMember) ? (
                  <>
                    {onChangeRole ? (
                      <MemberRoleDropdownButton
                        memberName={displayName}
                        role={role === 'viewer' ? 'viewer' : 'editor'}
                        disabled={isBusy}
                        onChangeRole={(nextRole) => handleRoleChange(uid, nextRole)}
                      />
                    ) : (
                      <Badge variant={role === 'editor' ? 'accent' : 'default'} size="sm">
                        {getRoleDisplayLabel(role)}
                      </Badge>
                    )}

                    {allowOwnershipTransfer && onTransferOwnership && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setConfirmRemoveUid(null);
                          setConfirmTransferUid(confirmTransferUid === uid ? null : uid);
                        }}
                        aria-label={`Chuyển quyền sở hữu cho ${displayName}`}
                        title="Chuyển quyền sở hữu"
                        className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 p-1.5 rounded-[var(--radius-xs)] text-muted hover:text-warning hover:bg-warning-soft transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    )}

                    {onRemoveMember && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setConfirmTransferUid(null);
                          setConfirmRemoveUid(confirmRemoveUid === uid ? null : uid);
                        }}
                        aria-label={`Xóa ${displayName} khỏi dự án`}
                        title="Xóa thành viên"
                        className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 p-1.5 rounded-[var(--radius-xs)] text-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <Badge
                    variant={
                      isTargetOwner
                        ? 'warning'
                        : role === 'editor'
                        ? 'accent'
                        : 'default'
                    }
                    size="sm"
                  >
                    {getRoleDisplayLabel(role)}
                  </Badge>
                )}
              </div>
            </div>

            {confirmRemoveUid === uid && (
              <div className="p-2.5 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-danger font-medium min-w-0">
                  Xóa {displayName} khỏi dự án? Họ sẽ mất quyền truy cập ngay.
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleRemove(uid)}
                    className="min-h-[44px] md:min-h-0 px-3 py-1 rounded-[var(--radius-xs)] bg-[var(--color-danger)] text-accent-on font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveUid(null)}
                    className="min-h-[44px] md:min-h-0 px-3 py-1 rounded-[var(--radius-xs)] bg-elevated text-secondary hover:text-primary cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {confirmTransferUid === uid && (
              <div className="p-2.5 rounded-[var(--radius-sm)] bg-warning-soft border border-[var(--color-warning)]/30 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-warning font-medium min-w-0">
                  Chuyển quyền chủ sở hữu cho {displayName}? Bạn sẽ trở thành Biên tập viên.
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleTransfer(uid)}
                    className="min-h-[44px] md:min-h-0 px-3 py-1 rounded-[var(--radius-xs)] bg-[var(--color-warning)] text-accent-on font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Chuyển quyền
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmTransferUid(null)}
                    className="min-h-[44px] md:min-h-0 px-3 py-1 rounded-[var(--radius-xs)] bg-elevated text-secondary hover:text-primary cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
