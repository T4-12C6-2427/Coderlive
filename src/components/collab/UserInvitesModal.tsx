import React, { useState } from 'react';
import { Check, Inbox, MailCheck, Users, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UserInviteInboxItem } from '../../types';
import { getRoleDisplayLabel } from './CollabMemberList';

interface UserInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invites: UserInviteInboxItem[];
  onAcceptInvite: (invite: UserInviteInboxItem) => Promise<void>;
  onDeclineInvite: (invite: UserInviteInboxItem) => Promise<void>;
}

function formatInviteTime(isoString: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return new Date(isoString).toLocaleDateString('vi-VN');
}

export const UserInvitesModal: React.FC<UserInvitesModalProps> = ({
  isOpen,
  onClose,
  invites,
  onAcceptInvite,
  onDeclineInvite,
}) => {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullScreenMobile
      title={
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
          <span>Lời mời tham gia dự án</span>
          {invites.length > 0 && (
            <Badge variant="accent" size="sm">
              <span className="tabular-nums">{invites.length}</span>
            </Badge>
          )}
        </div>
      }
      description="Các dự án nhóm đang mời bạn cộng tác. Bạn chỉ tham gia sau khi bấm Chấp nhận."
      footer={
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="min-h-[44px] md:min-h-0 px-4"
          >
            Đóng
          </Button>
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-3">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 text-danger text-xs"
          >
            {error}
          </div>
        )}

        {invites.length === 0 ? (
          <div className="p-8 rounded-[var(--radius-md)] bg-panel border border-default flex flex-col items-center justify-center text-center space-y-2.5">
            <div className="w-11 h-11 rounded-[var(--radius-md)] bg-elevated border border-default flex items-center justify-center text-muted">
              <MailCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h4 className="text-sm font-semibold text-primary">Chưa có lời mời nào</h4>
            <p className="text-xs text-secondary max-w-xs leading-relaxed">
              Khi chủ dự án khác tìm thấy tài khoản và gửi lời mời trực tiếp, thông báo sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {invites.map((invite) => {
              const isAccepting = busyKey === `${invite.projectId}:accept`;
              const isDeclining = busyKey === `${invite.projectId}:decline`;
              const anyBusy = Boolean(busyKey);

              return (
                <div
                  key={invite.projectId}
                  className="p-3.5 sm:p-4 rounded-[var(--radius-md)] bg-panel border border-default space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {invite.inviterPhotoURL ? (
                        <img
                          src={invite.inviterPhotoURL}
                          alt={invite.inviterName}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-default flex-shrink-0"
                        />
                      ) : (
                        <span className="w-9 h-9 rounded-full bg-accent-soft text-accent font-bold text-xs flex items-center justify-center border border-[var(--accent-base)]/30 flex-shrink-0">
                          {invite.inviterName.charAt(0).toUpperCase()}
                        </span>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Users className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.5} />
                          <h4 className="text-sm font-semibold text-primary truncate">
                            {invite.projectTitle}
                          </h4>
                        </div>
                        <p className="text-xs text-secondary">
                          Được mời bởi <strong className="text-primary">{invite.inviterName}</strong>
                          <span className="text-muted"> · {formatInviteTime(invite.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <Badge variant={invite.role === 'editor' ? 'accent' : 'default'} size="sm">
                      {getRoleDisplayLabel(invite.role)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-subtle">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={anyBusy}
                      isLoading={isDeclining}
                      onClick={async () => {
                        setError(null);
                        setBusyKey(`${invite.projectId}:decline`);
                        try {
                          await onDeclineInvite(invite);
                        } catch (err: any) {
                          setError(err?.message || 'Không thể từ chối lời mời lúc này.');
                        } finally {
                          setBusyKey(null);
                        }
                      }}
                      className="min-h-[44px] md:min-h-0"
                      leftIcon={<X className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    >
                      Từ chối
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      disabled={anyBusy}
                      isLoading={isAccepting}
                      onClick={async () => {
                        setError(null);
                        setBusyKey(`${invite.projectId}:accept`);
                        try {
                          await onAcceptInvite(invite);
                          onClose();
                        } catch (err: any) {
                          setError(err?.message || 'Không thể chấp nhận lời mời lúc này.');
                        } finally {
                          setBusyKey(null);
                        }
                      }}
                      className="min-h-[44px] md:min-h-0"
                      leftIcon={<Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    >
                      Chấp nhận tham gia
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
