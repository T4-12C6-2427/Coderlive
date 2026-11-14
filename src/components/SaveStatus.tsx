import React from 'react';
import { Check, Loader2, AlertCircle, Clock, WifiOff } from 'lucide-react';
import { CloudSaveStatus, CollabSyncState } from '../types';
import { useIsTouch } from '../hooks/useViewport';

interface SaveStatusProps {
  status: CloudSaveStatus;
  isLoggedIn: boolean;
  hasUnsavedChanges?: boolean;
  onLoginClick?: () => void;
  isCollab?: boolean;
  collabSyncState?: CollabSyncState;
}

export const SaveStatus: React.FC<SaveStatusProps> = ({
  status,
  isLoggedIn,
  hasUnsavedChanges = false,
  onLoginClick,
  isCollab = false,
  collabSyncState = 'synced',
}) => {
  const isTouch = useIsTouch();
  if (isCollab) {
    const collabConfig: Record<
      CollabSyncState,
      { label: string; tooltip: string; className: string; icon: React.ReactNode }
    > = {
      connecting: {
        label: 'Đang tải dự án...',
        tooltip: 'Đang tải bản chụp và đồng bộ thời gian thực...',
        className: 'bg-accent-soft text-accent border-[var(--accent-base)]/30',
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />,
      },
      syncing: {
        label: 'Đang đồng bộ...',
        tooltip: 'Đang gửi thay đổi CRDT lên đám mây cho cả nhóm...',
        className: 'bg-accent-soft text-accent border-[var(--accent-base)]/30',
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />,
      },
      synced: {
        label: 'Đã đồng bộ',
        tooltip: 'Mã nguồn đã đồng bộ thời gian thực với cả nhóm (Ctrl+S để nén bản chụp)',
        className: 'bg-success-soft text-success border-[var(--color-success)]/30',
        icon: <Check className="w-3.5 h-3.5 flex-shrink-0" />,
      },
      offline: {
        label: 'Mất kết nối, đang thử lại',
        tooltip: 'Mất kết nối mạng — thay đổi đang được giữ an toàn và sẽ tự đồng bộ khi có mạng',
        className: 'bg-warning-soft text-warning border-[var(--color-warning)]/30',
        icon: <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />,
      },
      error: {
        label: 'Lỗi đồng bộ',
        tooltip: 'Không thể đồng bộ thay đổi với máy chủ. Kiểm tra quyền hoặc kết nối mạng.',
        className: 'bg-danger-soft text-danger border-[var(--color-danger)]/30',
        icon: <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />,
      },
    };

    const currentCollab = collabConfig[collabSyncState] || collabConfig.synced;
    return (
      <div
        title={isTouch ? undefined : currentCollab.tooltip}
        aria-label={currentCollab.label}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap flex-shrink-0 select-none ${currentCollab.className}`}
      >
        {currentCollab.icon}
        <span className="hidden xl:inline text-[11px] leading-none font-medium">
          {currentCollab.label}
        </span>
      </div>
    );
  }

  // Personal / Guest state
  let state: 'saved' | 'saving' | 'unsaved' | 'error' = 'saved';

  if (status === 'saving') {
    state = 'saving';
  } else if (status === 'error') {
    state = 'error';
  } else if (hasUnsavedChanges) {
    state = 'unsaved';
  } else if (status === 'saved' || !hasUnsavedChanges) {
    state = 'saved';
  }

  const config = {
    saving: {
      label: 'Đang lưu...',
      tooltip: 'Đang đồng bộ thay đổi lên máy chủ...',
      className: 'bg-accent-soft text-accent border-[var(--accent-base)]/30',
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />,
    },
    saved: {
      label: 'Đã lưu',
      tooltip: isLoggedIn
        ? 'Dự án đã được lưu an toàn trên đám mây'
        : 'Mã nguồn đã được lưu tự động trên trình duyệt',
      className: 'bg-success-soft text-success border-[var(--color-success)]/30',
      icon: <Check className="w-3.5 h-3.5 flex-shrink-0" />,
    },
    unsaved: {
      label: 'Chưa lưu',
      tooltip: isLoggedIn
        ? 'Có thay đổi chưa lưu (Sẽ tự động lưu sau 2 giây hoặc nhấn Ctrl+S)'
        : 'Có thay đổi chưa lưu vào tài khoản (Nhấp để đăng nhập)',
      className: 'bg-warning-soft text-warning border-[var(--color-warning)]/30',
      icon: <Clock className="w-3.5 h-3.5 flex-shrink-0" />,
    },
    error: {
      label: 'Lỗi lưu',
      tooltip: 'Lỗi khi lưu lên đám mây. Vui lòng bấm "Lưu" để thử lại!',
      className: 'bg-danger-soft text-danger border-[var(--color-danger)]/30',
      icon: <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />,
    },
  };

  const current = config[state];

  return (
    <div
      onClick={!isLoggedIn && state === 'unsaved' ? onLoginClick : undefined}
      title={isTouch ? undefined : current.tooltip}
      aria-label={current.label}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 xl:px-2.5 xl:py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap flex-shrink-0 select-none ${
        current.className
      } ${!isLoggedIn && state === 'unsaved' ? 'cursor-pointer hover:border-[var(--color-warning)]' : ''}`}
    >
      {current.icon}
      <span className="hidden xl:inline text-[11px] leading-none font-medium">
        {current.label}
      </span>
    </div>
  );
};
