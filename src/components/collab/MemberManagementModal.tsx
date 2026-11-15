import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CollabInviteRole, CollabProject, DEFAULT_COLLAB_MEMBER_LIMIT } from '../../types';
import { CollabMemberList } from './CollabMemberList';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CollabProject | null;
  currentUserId: string;
  currentUserEmail?: string | null;
  onChangeRole: (targetUid: string, role: CollabInviteRole) => Promise<void>;
  onRemoveMember: (targetUid: string) => Promise<void>;
  onTransferOwnership: (newOwnerUid: string) => Promise<void>;
  onLeaveProject: () => Promise<void>;
  onOpenInvite?: () => void;
  onToggleSingleEditor?: (enabled: boolean) => Promise<void>;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUserId,
  currentUserEmail = null,
  onChangeRole,
  onRemoveMember,
  onTransferOwnership,
  onLeaveProject,
  onOpenInvite,
  onToggleSingleEditor,
}) => {
  const [busyLeave, setBusyLeave] = useState(false);
  const [isTogglingLockSetting, setIsTogglingLockSetting] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!project) return null;

  const isOwner = project.ownerId === currentUserId;
  const memberCount = Object.keys(project.members).length;
  const memberLimit = project.memberLimit ?? DEFAULT_COLLAB_MEMBER_LIMIT;

  const handleLeave = async () => {
    setError(null);
    setBusyLeave(true);
    try {
      await onLeaveProject();
      setConfirmLeave(false);
      onClose();
    } catch {
      setError('Không thể rời khỏi dự án lúc này.');
    } finally {
      setBusyLeave(false);
    }
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
          <Badge variant={memberCount >= memberLimit ? 'warning' : 'accent'} size="sm">
            <span className="tabular-nums">{memberCount}/{memberLimit}</span>
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

        {isOwner && onToggleSingleEditor && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-md)] bg-panel border border-default">
            <div className="min-w-0 flex-1 space-y-0.5">
              <label
                htmlFor="members-single-editor-toggle"
                className="text-xs font-semibold text-primary block cursor-pointer"
              >
                Chỉ 1 phiên chỉnh sửa mỗi tài khoản
              </label>
              <p className="text-[11px] text-muted leading-snug">
                Ngăn xung đột khi cùng tài khoản mở nhiều tab/thiết bị. Tắt nếu muốn cho phép sửa đồng thời ở nhiều tab.
              </p>
            </div>
            <button
              id="members-single-editor-toggle"
              type="button"
              role="switch"
              aria-checked={project.singleEditorPerAccount !== false}
              disabled={isTogglingLockSetting}
              onClick={async () => {
                setError(null);
                setIsTogglingLockSetting(true);
                try {
                  await onToggleSingleEditor(project.singleEditorPerAccount === false);
                } catch {
                  setError('Không thể cập nhật cài đặt phiên chỉnh sửa.');
                } finally {
                  setIsTogglingLockSetting(false);
                }
              }}
              className={`touch-target-h relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-colors cursor-pointer disabled:opacity-50 ${
                project.singleEditorPerAccount !== false
                  ? 'bg-accent border-transparent'
                  : 'bg-elevated border-default'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                  project.singleEditorPerAccount !== false ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto overscroll-contain pr-1">
          <CollabMemberList
            project={project}
            currentUserId={currentUserId}
            currentUserEmail={currentUserEmail}
            onChangeRole={onChangeRole}
            onRemoveMember={onRemoveMember}
            onTransferOwnership={onTransferOwnership}
            allowOwnershipTransfer
            onError={setError}
          />
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
                  disabled={busyLeave}
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
