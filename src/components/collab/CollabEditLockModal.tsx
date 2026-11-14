import React from 'react';
import { ArrowRightLeft, Eye, Lock, ShieldAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CollabEditLockSnapshot, useCollabEditLock } from '../../lib/collabPresenceStore';

interface CollabEditLockModalProps {
  lockState: CollabEditLockSnapshot;
  onChooseReadOnly: () => void;
  onClaimEditLock: () => void;
}

export const CollabEditLockModal: React.FC<CollabEditLockModalProps> = ({
  lockState,
  onChooseReadOnly,
  onClaimEditLock,
}) => {
  const isHolderDisconnected = lockState.reason === 'holder_disconnected';

  return (
    <Modal
      isOpen={lockState.promptOpen}
      onClose={onChooseReadOnly}
      maxWidth="sm"
      title={
        <div className="flex items-center gap-2">
          {isHolderDisconnected ? (
            <ArrowRightLeft className="w-4 h-4 text-accent" strokeWidth={1.75} />
          ) : (
            <ShieldAlert className="w-4 h-4 text-warning" strokeWidth={1.75} />
          )}
          <span>
            {isHolderDisconnected
              ? 'Phiên chỉnh sửa trước vừa đóng'
              : 'Phát hiện phiên chỉnh sửa khác'}
          </span>
        </div>
      }
      description={
        isHolderDisconnected
          ? 'Tiếp tục chỉnh sửa ở đây hoặc giữ chế độ chỉ xem để tránh thao tác nhầm.'
          : 'Mỗi tài khoản chỉ chỉnh sửa trên 1 phiên tại một thời điểm để tránh trùng lặp thao tác.'
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-[var(--radius-md)] bg-panel border border-default text-xs text-secondary leading-relaxed space-y-1.5">
          {isHolderDisconnected ? (
            <p className="text-primary font-medium">
              Phiên chỉnh sửa trước vừa đóng — Tiếp tục chỉnh sửa ở đây?
            </p>
          ) : (
            <>
              <p className="text-primary font-medium">
                Tài khoản của bạn đang chỉnh sửa ở tab hoặc thiết bị khác
                {lockState.holderTab ? ` (tab ${lockState.holderTab.toUpperCase()})` : ''}.
              </p>
              <p className="text-[11px] text-muted">
                Bạn có thể tiếp tục xem mã theo thời gian thực ở tab này, hoặc chiếm quyền chỉnh sửa về đây (phiên kia sẽ tự chuyển sang chỉ xem).
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onChooseReadOnly}
            leftIcon={<Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Tiếp tục ở chế độ chỉ xem
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClaimEditLock}
            leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Chiếm quyền chỉnh sửa ở đây
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface CollabEditLockBannerProps {
  isCollabActive: boolean;
  isViewer: boolean;
  onClaimEditLock: () => void;
}

export const CollabEditLockBanner: React.FC<CollabEditLockBannerProps> = React.memo(
  ({ isCollabActive, isViewer, onClaimEditLock }) => {
    const lockState = useCollabEditLock();

    if (!isCollabActive || isViewer) return null;
    if (
      lockState.status !== 'readonly_conflict' &&
      lockState.status !== 'takeover_available'
    ) {
      return null;
    }

    const isTakeoverAvailable = lockState.status === 'takeover_available';

    return (
      <div
        role="status"
        className={`border-b px-4 pl-safe pr-safe py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 z-20 flex-shrink-0 ${
          isTakeoverAvailable
            ? 'bg-accent-soft border-[var(--accent-base)]/30 text-primary'
            : 'bg-warning-soft border-[var(--color-warning)]/30 text-warning'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Lock className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
          <span className="font-medium min-w-0 break-words">
            {isTakeoverAvailable
              ? 'Phiên chỉnh sửa trước đã đóng — bạn đang ở chế độ chỉ xem.'
              : `Đang ở chế độ chỉ xem: tài khoản của bạn đang sửa ở tab/thiết bị khác${
                  lockState.holderTab ? ` (${lockState.holderTab.toUpperCase()})` : ''
                }.`}
          </span>
        </div>
        <button
          type="button"
          onClick={onClaimEditLock}
          className="touch-target-h h-6 px-2.5 rounded-[var(--radius-xs)] bg-accent text-accent-on text-[11px] font-semibold flex items-center gap-1 hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
        >
          <ArrowRightLeft className="w-3 h-3" strokeWidth={1.75} />
          <span>Chiếm quyền chỉnh sửa ở đây</span>
        </button>
      </div>
    );
  }
);
