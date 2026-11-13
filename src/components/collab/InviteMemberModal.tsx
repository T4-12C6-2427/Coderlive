import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  Link2,
  Shield,
  Eye,
  Edit3,
  Loader2,
  Lock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CollabInviteRole, CollabProject } from '../../types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CollabProject | null;
  onUpdateInvite: (options: {
    inviteEnabled?: boolean;
    inviteRole?: CollabInviteRole;
    regenerateToken?: boolean;
  }) => Promise<void>;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateInvite,
}) => {
  const [copied, setCopied] = useState(false);
  const [busyAction, setBusyAction] = useState<'toggle' | 'role' | 'regen' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inviteUrl = useMemo(() => {
    if (!project || !project.inviteToken) return '';
    return `${window.location.origin}${window.location.pathname}?collab=${encodeURIComponent(
      project.id
    )}&invite=${encodeURIComponent(project.inviteToken)}`;
  }, [project]);

  if (!project) return null;

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = inviteUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const runUpdate = async (
    action: 'toggle' | 'role' | 'regen',
    options: {
      inviteEnabled?: boolean;
      inviteRole?: CollabInviteRole;
      regenerateToken?: boolean;
    }
  ) => {
    setError(null);
    setBusyAction(action);
    try {
      await onUpdateInvite(options);
    } catch (err) {
      console.error('Lỗi cập nhật lời mời:', err);
      setError('Không thể cập nhật cài đặt lời mời. Vui lòng thử lại.');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <span>Mời thành viên</span>
        </div>
      }
      description={`Chia sẻ liên kết mời cho dự án nhóm "${project.title}"`}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 text-danger text-xs">
            {error}
          </div>
        )}

        {/* Bật / Tắt liên kết mời */}
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-default flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 ${
                project.inviteEnabled
                  ? 'bg-success-soft text-success'
                  : 'bg-elevated text-muted'
              }`}
            >
              {project.inviteEnabled ? (
                <Link2 className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Lock className="w-4 h-4" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary">
                {project.inviteEnabled ? 'Liên kết mời đang bật' : 'Liên kết mời đã tắt'}
              </p>
              <p className="text-[11px] text-secondary mt-0.5">
                {project.inviteEnabled
                  ? 'Người có liên kết sau khi đăng nhập sẽ tham gia ngay'
                  : 'Không ai có thể dùng liên kết cũ để tham gia thêm'}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={project.inviteEnabled}
            disabled={busyAction !== null}
            onClick={() =>
              runUpdate('toggle', { inviteEnabled: !project.inviteEnabled })
            }
            aria-label="Bật hoặc tắt liên kết mời"
            className={`touch-hit-expand relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-50 ${
              project.inviteEnabled ? 'bg-accent' : 'bg-[var(--border-strong)]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--bg-elevated)] shadow-sm transition duration-200 ${
                project.inviteEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Chọn vai trò khi tham gia */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-primary">
            Vai trò khi tham gia qua liên kết
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 touch-gap gap-2">
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => runUpdate('role', { inviteRole: 'editor' })}
              className={`touch-target-h p-3 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer disabled:opacity-60 ${
                project.inviteRole === 'editor'
                  ? 'bg-accent-soft border-[var(--accent-base)] text-primary'
                  : 'bg-panel border-default text-secondary hover:border-strong'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Edit3 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <span>Biên tập viên</span>
              </div>
              <p className="text-[11px] text-muted mt-1 leading-snug">
                Chỉnh sửa mã trực tiếp và xem đồng bộ theo thời gian thực
              </p>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => runUpdate('role', { inviteRole: 'viewer' })}
              className={`touch-target-h p-3 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer disabled:opacity-60 ${
                project.inviteRole === 'viewer'
                  ? 'bg-accent-soft border-[var(--accent-base)] text-primary'
                  : 'bg-panel border-default text-secondary hover:border-strong'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Eye className="w-3.5 h-3.5 text-warning" strokeWidth={1.5} />
                <span>Người xem</span>
              </div>
              <p className="text-[11px] text-muted mt-1 leading-snug">
                Chỉ xem mã nguồn và con trỏ trực tuyến (chế độ chỉ đọc)
              </p>
            </button>
          </div>
        </div>

        {/* Liên kết mời & nút sao chép / tạo mới */}
        {project.inviteEnabled && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-primary">
              Liên kết mời dự án nhóm
            </label>
            <div className="flex flex-col sm:flex-row sm:items-stretch touch-gap gap-2">
              <input
                type="url"
                inputMode="url"
                readOnly
                value={inviteUrl}
                className="flex-1 min-w-0 h-11 sm:h-9 px-3 bg-input border border-default rounded-[var(--radius-sm)] text-xs text-accent font-mono focus:outline-none select-all"
              />
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleCopy}
                className={`w-full sm:w-auto flex-shrink-0 ${copied ? '!bg-[var(--color-success)] !text-white' : ''}`}
                leftIcon={
                  copied ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )
                }
              >
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.5} />
                <span>Chỉ gửi liên kết này cho thành viên tin cậy</span>
              </span>
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => runUpdate('regen', { regenerateToken: true })}
                className="touch-target-h inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline cursor-pointer disabled:opacity-50"
              >
                {busyAction === 'regen' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" strokeWidth={1.5} />
                )}
                <span>Tạo liên kết mới</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-subtle flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
