import React, { useState } from 'react';
import {
  Users,
  Crown,
  Trash2,
  UserPlus,
  LogOut,
  ArrowRightLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CollabInviteRole, CollabProject } from '../../types';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CollabProject | null;
  currentUserId: string;
  onChangeRole: (targetUid: string, role: CollabInviteRole) => Promise<void>;
  onRemoveMember: (targetUid: string) => Promise<void>;
  onTransferOwnership: (newOwnerUid: string) => Promise<void>;
  onLeaveProject: () => Promise<void>;
  onOpenInvite?: () => void;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUserId,
  onChangeRole,
  onRemoveMember,
  onTransferOwnership,
  onLeaveProject,
  onOpenInvite,
}) => {
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [confirmRemoveUid, setConfirmRemoveUid] = useState<string | null>(null);
  const [confirmTransferUid, setConfirmTransferUid] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!project) return null;

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
    setError(null);
    setBusyUid(uid);
    try {
      await onChangeRole(uid, role);
    } catch {
      setError('Không thể cập nhật vai trò thành viên.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleRemove = async (uid: string) => {
    setError(null);
    setBusyUid(uid);
    try {
      await onRemoveMember(uid);
      setConfirmRemoveUid(null);
    } catch {
      setError('Không thể xóa thành viên khỏi dự án.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleTransfer = async (uid: string) => {
    setError(null);
    setBusyUid(uid);
    try {
      await onTransferOwnership(uid);
      setConfirmTransferUid(null);
    } catch {
      setError('Không thể chuyển quyền sở hữu.');
    } finally {
      setBusyUid(null);
    }
  };

  const handleLeave = async () => {
    setError(null);
    setBusyUid(currentUserId);
    try {
      await onLeaveProject();
      setConfirmLeave(false);
      onClose();
    } catch {
      setError('Không thể rời khỏi dự án lúc này.');
    } finally {
      setBusyUid(null);
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'owner') return 'Chủ sở hữu';
    if (role === 'editor') return 'Biên tập viên';
    return 'Người xem';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <span>Thành viên dự án nhóm</span>
          <Badge variant="accent" size="sm">
            {memberEntries.length}
          </Badge>
        </div>
      }
      description={`Quản lý quyền truy cập cho "${project.title}"`}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 text-danger text-xs">
            {error}
          </div>
        )}

        {isOwner && onOpenInvite && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[var(--radius-md)] bg-accent-soft border border-[var(--accent-base)]/30">
            <div className="text-xs min-w-0 flex-1">
              <p className="font-semibold text-primary">Mời thêm cộng tác viên</p>
              <p className="text-[11px] text-secondary mt-0.5">
                Chia sẻ liên kết để thêm Biên tập viên hoặc Người xem
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => {
                onClose();
                onOpenInvite();
              }}
              leftIcon={<UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />}
            >
              Mời thành viên
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-72 overflow-y-auto overscroll-contain pr-1">
          {memberEntries.map(([uid, role]) => {
            const profile = project.memberProfiles[uid];
            const displayName = profile?.name || 'Thành viên';
            const email = profile?.email;
            const photoURL = profile?.photoURL;
            const isSelf = uid === currentUserId;
            const isTargetOwner = role === 'owner';
            const isBusy = busyUid === uid;

            return (
              <div
                key={uid}
                className="p-3 rounded-[var(--radius-md)] bg-panel border border-default space-y-2"
              >
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
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
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-primary truncate">
                          {displayName}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-elevated border border-subtle text-muted flex-shrink-0">
                            Bạn
                          </span>
                        )}
                        {isTargetOwner && (
                          <Crown className="w-3.5 h-3.5 text-warning flex-shrink-0" strokeWidth={1.5} />
                        )}
                      </div>
                      {email && (
                        <p className="text-[11px] text-muted truncate">{email}</p>
                      )}
                    </div>
                  </div>

                  {/* Role / Owner controls */}
                  <div className="flex items-center touch-gap gap-1.5 flex-shrink-0">
                    {isOwner && !isTargetOwner ? (
                      <>
                        <select
                          aria-label={`Vai trò của ${displayName}`}
                          value={role === 'viewer' ? 'viewer' : 'editor'}
                          disabled={isBusy}
                          onChange={(e) =>
                            handleRoleChange(uid, e.target.value as CollabInviteRole)
                          }
                          className="touch-target-h h-7 px-2 text-xs bg-elevated border border-default rounded-[var(--radius-xs)] text-primary outline-none focus:border-[var(--accent-base)] cursor-pointer disabled:opacity-50"
                        >
                          <option value="editor">Biên tập viên</option>
                          <option value="viewer">Người xem</option>
                        </select>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            setConfirmRemoveUid(null);
                            setConfirmTransferUid(confirmTransferUid === uid ? null : uid);
                          }}
                          aria-label="Chuyển quyền sở hữu"
                          className="touch-target p-1.5 rounded-[var(--radius-xs)] text-muted hover:text-warning hover:bg-warning-soft transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            setConfirmTransferUid(null);
                            setConfirmRemoveUid(confirmRemoveUid === uid ? null : uid);
                          }}
                          aria-label="Xóa khỏi dự án"
                          className="touch-target p-1.5 rounded-[var(--radius-xs)] text-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          )}
                        </button>
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
                        {getRoleLabel(role)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Xác nhận xóa thành viên */}
                {confirmRemoveUid === uid && (
                  <div className="p-2.5 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-danger font-medium min-w-0">
                      Xóa {displayName} khỏi dự án? Họ sẽ mất quyền truy cập ngay.
                    </span>
                    <div className="flex items-center touch-gap gap-1.5 flex-shrink-0 ml-auto">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRemove(uid)}
                        className="touch-target-h px-3 py-1 rounded-[var(--radius-xs)] bg-[var(--color-danger)] text-white font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveUid(null)}
                        className="touch-target-h px-3 py-1 rounded-[var(--radius-xs)] bg-elevated text-secondary hover:text-primary cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Xác nhận chuyển quyền sở hữu */}
                {confirmTransferUid === uid && (
                  <div className="p-2.5 rounded-[var(--radius-sm)] bg-warning-soft border border-[var(--color-warning)]/30 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-warning font-medium min-w-0">
                      Chuyển quyền chủ sở hữu cho {displayName}? Bạn sẽ trở thành Biên tập viên.
                    </span>
                    <div className="flex items-center touch-gap gap-1.5 flex-shrink-0 ml-auto">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleTransfer(uid)}
                        className="touch-target-h px-3 py-1 rounded-[var(--radius-xs)] bg-[var(--color-warning)] text-accent-on font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Chuyển quyền
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmTransferUid(null)}
                        className="touch-target-h px-3 py-1 rounded-[var(--radius-xs)] bg-elevated text-secondary hover:text-primary cursor-pointer"
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

        {/* Footer: Rời dự án cho thành viên không phải chủ sở hữu */}
        <div className="pt-2 border-t border-subtle flex flex-wrap items-center justify-between gap-2">
          {!isOwner ? (
            confirmLeave ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-danger font-medium">Xác nhận rời khỏi dự án?</span>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={busyUid === currentUserId}
                  onClick={handleLeave}
                >
                  Rời ngay
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmLeave(false)}
                >
                  Hủy
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setConfirmLeave(true)}
                leftIcon={<LogOut className="w-3.5 h-3.5 text-danger" strokeWidth={1.5} />}
                className="text-danger hover:bg-danger-soft"
              >
                Rời khỏi dự án
              </Button>
            )
          ) : (
            <span className="text-[11px] text-muted flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              <span>Bạn là chủ sở hữu dự án</span>
            </span>
          )}

          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
