import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Ban,
  Check,
  Clock,
  Copy,
  Download,
  Edit3,
  Eye,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  Mail,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Send,
  Share2,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, Switch } from '../ui/Controls';
import { Tabs, TabItem } from '../ui/SegmentedControl';
import {
  CollabBlockedUser,
  CollabDirectInvite,
  CollabInviteRole,
  CollabJoinRequest,
  CollabProject,
  DEFAULT_COLLAB_MEMBER_LIMIT,
  InviteExpiryPreset,
  JoinCodeExpiryPreset,
  UserSearchResult,
} from '../../types';
import { useIsMobile } from '../../hooks/useViewport';
import {
  CollabMemberList,
  getRoleDisplayLabel,
  MemberRoleDropdownButton,
} from './CollabMemberList';
import {
  copyQrImageToClipboard,
  downloadQrPng,
  printQrCard,
  renderQrToCanvas,
} from '../../lib/qrCodeUtils';
import { cleanupExpiredJoinCode } from '../../services/collabProjectService';
import { maskEmail } from '../../lib/usernameAuth';

type InviteModalTabId = 'link' | 'qr' | 'code' | 'search' | 'members';

export interface InviteUpdateOptions {
  inviteEnabled?: boolean;
  inviteRole?: CollabInviteRole;
  regenerateToken?: boolean;
  inviteExpiryPreset?: InviteExpiryPreset;
  inviteRequiresApproval?: boolean;
}

export interface JoinCodeUpdateOptions {
  joinCodeEnabled?: boolean;
  joinCodeRole?: CollabInviteRole;
  regenerateCode?: boolean;
  joinCodeExpiryPreset?: JoinCodeExpiryPreset;
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CollabProject | null;
  currentUserId: string;
  currentUserEmail?: string | null;
  onUpdateInvite: (options: InviteUpdateOptions) => Promise<void>;
  onUpdateJoinCode: (options: JoinCodeUpdateOptions) => Promise<void>;
  onChangeRole: (targetUid: string, role: CollabInviteRole) => Promise<void>;
  onRemoveMember: (targetUid: string) => Promise<void>;
  pendingRequests: CollabJoinRequest[];
  sentInvites: CollabDirectInvite[];
  blockedUsers: CollabBlockedUser[];
  onApproveRequest: (request: CollabJoinRequest, role: CollabInviteRole) => Promise<void>;
  onRejectRequest: (request: CollabJoinRequest) => Promise<void>;
  onBlockRequest: (request: CollabJoinRequest) => Promise<void>;
  onUnblockUser: (targetUid: string) => Promise<void>;
  onSearchUsers: (queryText: string) => Promise<UserSearchResult[]>;
  onSendDirectInvite: (target: UserSearchResult, role: CollabInviteRole) => Promise<void>;
  onRevokeSentInvite: (targetUid: string) => Promise<void>;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'danger') => void;
}

const EXPIRY_OPTIONS: { value: InviteExpiryPreset; label: string }[] = [
  { value: 'never', label: 'Không giới hạn' },
  { value: '1h', label: '1 giờ' },
  { value: '24h', label: '24 giờ' },
  { value: '7d', label: '7 ngày' },
];

const JOIN_CODE_EXPIRY_OPTIONS: { value: JoinCodeExpiryPreset; label: string }[] = [
  { value: '15m', label: '15 phút' },
  { value: '1h', label: '1 giờ' },
  { value: '24h', label: '24 giờ' },
];

function formatExpiryLine(
  expiresAtMs: number | null | undefined,
  nowMs: number
): { label: string; isExpired: boolean } {
  if (typeof expiresAtMs !== 'number' || !Number.isFinite(expiresAtMs)) {
    return { label: 'Không giới hạn thời gian', isExpired: false };
  }
  const diffMs = expiresAtMs - nowMs;
  if (diffMs <= 0) {
    return { label: 'Đã hết hạn', isExpired: true };
  }
  const dateText = new Date(expiresAtMs).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const totalMinutes = Math.ceil(diffMs / 60000);
  if (totalMinutes < 60) {
    return { label: `Hết hạn lúc ${dateText} (còn ${totalMinutes} phút)`, isExpired: false };
  }
  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    const remMins = totalMinutes % 60;
    return {
      label: `Hết hạn lúc ${dateText} (còn ${totalHours} giờ${remMins > 0 ? ` ${remMins} phút` : ''})`,
      isExpired: false,
    };
  }
  const totalDays = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  return {
    label: `Hết hạn lúc ${dateText} (còn ${totalDays} ngày${remHours > 0 ? ` ${remHours} giờ` : ''})`,
    isExpired: false,
  };
}

function formatShortRelativeTime(isoString: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return new Date(isoString).toLocaleDateString('vi-VN');
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  project,
  currentUserId,
  currentUserEmail = null,
  onUpdateInvite,
  onUpdateJoinCode,
  onChangeRole,
  onRemoveMember,
  pendingRequests,
  sentInvites,
  blockedUsers,
  onApproveRequest,
  onRejectRequest,
  onBlockRequest,
  onUnblockUser,
  onSearchUsers,
  onSendDirectInvite,
  onRevokeSentInvite,
  onShowToast,
}) => {
  const isMobile = useIsMobile();
  const tabsIdPrefix = useId();
  const [activeTab, setActiveTab] = useState<InviteModalTabId>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [requestBusyKey, setRequestBusyKey] = useState<string | null>(null);
  const [requestRoles, setRequestRoles] = useState<Record<string, CollabInviteRole>>({});
  const [showBlockedList, setShowBlockedList] = useState(false);
  const [qrBusy, setQrBusy] = useState<'download' | 'copy' | 'print' | null>(null);
  const [qrRenderError, setQrRenderError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const cleanedExpiredCodeRef = useRef<string | null>(null);

  // Stage 3: Tìm người dùng & Gửi lời mời trực tiếp
  const [userQuery, setUserQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [hasSearchedUsers, setHasSearchedUsers] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [searchInviteRoles, setSearchInviteRoles] = useState<Record<string, CollabInviteRole>>({});
  const [inviteSendBusyUid, setInviteSendBusyUid] = useState<string | null>(null);

  const isOwner = Boolean(project && project.ownerId === currentUserId);

  // Nếu chuyển từ mobile sang desktop trong khi đang mở tab "members", quay về tab "link"
  useEffect(() => {
    if (!isMobile && activeTab === 'members') {
      setActiveTab('link');
    }
  }, [isMobile, activeTab]);

  // Đặt lại trạng thái tab khi mở modal cho dự án mới
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setQrRenderError(null);
      setNowMs(Date.now());
      setUserQuery('');
      setSearchResults([]);
      setHasSearchedUsers(false);
      setUserSearchError(null);
    }
  }, [isOpen, project?.id]);

  // Debounce tìm kiếm người dùng khi đang ở tab "Tìm người dùng"
  useEffect(() => {
    if (!isOpen || !isOwner || activeTab !== 'search') return;
    const trimmed = userQuery.trim();
    const minLen = trimmed.startsWith('@') ? 3 : 2;
    if (trimmed.length < minLen) {
      setSearchResults([]);
      setHasSearchedUsers(false);
      setUserSearchError(null);
      setIsSearchingUsers(false);
      return;
    }

    let cancelled = false;
    setIsSearchingUsers(true);
    setUserSearchError(null);

    const timer = setTimeout(() => {
      onSearchUsers(trimmed)
        .then((list) => {
          if (!cancelled) {
            setSearchResults(list);
            setHasSearchedUsers(true);
          }
        })
        .catch((err: any) => {
          if (!cancelled) {
            console.error('Lỗi tìm kiếm người dùng:', err);
            setUserSearchError(err?.message || 'Không thể tìm kiếm người dùng lúc này.');
            setHasSearchedUsers(true);
          }
        })
        .finally(() => {
          if (!cancelled) setIsSearchingUsers(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, isOwner, activeTab, userQuery, onSearchUsers]);

  // Cập nhật đồng hồ đếm ngược mỗi 5 giây khi modal đang mở
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const inviteUrl = useMemo(() => {
    if (!project || !project.inviteToken) return '';
    return `${window.location.origin}${window.location.pathname}?collab=${encodeURIComponent(
      project.id
    )}&invite=${encodeURIComponent(project.inviteToken)}`;
  }, [project]);

  const expiryStatus = useMemo(
    () => formatExpiryLine(project?.inviteExpiresAt, nowMs),
    [project?.inviteExpiresAt, nowMs]
  );

  const joinCodeExpiryStatus = useMemo(
    () => formatExpiryLine(project?.joinCodeExpiresAt, nowMs),
    [project?.joinCodeExpiresAt, nowMs]
  );

  const isInviteActiveAndValid = Boolean(project?.inviteEnabled && !expiryStatus.isExpired);
  const isJoinCodeActiveAndValid = Boolean(
    project?.joinCodeEnabled && project?.joinCode && !joinCodeExpiryStatus.isExpired
  );

  // Tự động dọn dẹp mã dự án 4 chữ số nếu đã hết hạn khi chủ dự án đang mở modal
  useEffect(() => {
    if (
      !isOpen ||
      !isOwner ||
      !project?.joinCode ||
      !joinCodeExpiryStatus.isExpired ||
      cleanedExpiredCodeRef.current === `${project.id}:${project.joinCode}`
    ) {
      return;
    }
    cleanedExpiredCodeRef.current = `${project.id}:${project.joinCode}`;
    cleanupExpiredJoinCode(project).catch(() => {});
  }, [isOpen, isOwner, project, joinCodeExpiryStatus.isExpired]);

  // Vẽ mã QR trên client mỗi khi tab QR được hiển thị và liên kết đang bật + còn hạn
  useEffect(() => {
    if (!isOpen || !isOwner || activeTab !== 'qr' || !isInviteActiveAndValid || !inviteUrl) {
      return;
    }
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    setQrRenderError(null);
    renderQrToCanvas(canvas, inviteUrl, { sizePx: 248 }).catch((err) => {
      if (!cancelled) {
        console.error('Lỗi tạo mã QR:', err);
        setQrRenderError('Không thể tạo mã QR lúc này.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, isOwner, activeTab, isInviteActiveAndValid, inviteUrl]);

  if (!project || !isOwner) return null;

  const memberCount = Object.keys(project.members).length;
  const memberLimit = project.memberLimit ?? DEFAULT_COLLAB_MEMBER_LIMIT;
  const isProjectFull = memberCount >= memberLimit;
  const roleLabel = getRoleDisplayLabel(project.inviteRole);
  const joinCodeRole: CollabInviteRole = project.joinCodeRole === 'viewer' ? 'viewer' : 'editor';
  const canWebShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const tabsList: TabItem<InviteModalTabId>[] = [
    {
      id: 'link',
      label: 'Liên kết',
      icon: <Link2 className="w-3.5 h-3.5" strokeWidth={1.5} />,
    },
    {
      id: 'qr',
      label: 'Mã QR',
      icon: <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />,
    },
    {
      id: 'code',
      label: 'Mã dự án',
      icon: <KeyRound className="w-3.5 h-3.5" strokeWidth={1.5} />,
    },
    {
      id: 'search',
      label: 'Tìm người dùng',
      icon: <Search className="w-3.5 h-3.5" strokeWidth={1.5} />,
    },
    ...(isMobile
      ? [
          {
            id: 'members' as const,
            label: 'Thành viên',
            count: memberCount + pendingRequests.length + sentInvites.length,
            icon: <Users className="w-3.5 h-3.5" strokeWidth={1.5} />,
          },
        ]
      : []),
  ];

  const runUpdate = async (actionKey: string, options: InviteUpdateOptions) => {
    setError(null);
    setBusyAction(actionKey);
    try {
      await onUpdateInvite(options);
    } catch (err) {
      console.error('Lỗi cập nhật lời mời:', err);
      setError('Không thể cập nhật cài đặt lời mời. Vui lòng thử lại.');
    } finally {
      setBusyAction(null);
    }
  };

  const runJoinCodeUpdate = async (actionKey: string, options: JoinCodeUpdateOptions) => {
    setError(null);
    setBusyAction(actionKey);
    try {
      await onUpdateJoinCode(options);
    } catch (err: any) {
      console.error('Lỗi cập nhật mã dự án:', err);
      setError(err?.message || 'Không thể cập nhật mã dự án. Vui lòng thử lại.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleCopyJoinCode = async () => {
    if (!project.joinCode) return;
    try {
      await navigator.clipboard.writeText(project.joinCode);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = project.joinCode;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedCode(true);
    onShowToast?.('Đã sao chép mã dự án', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = inviteUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedLink(true);
    onShowToast?.('Đã sao chép liên kết', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWebShare = async () => {
    if (!inviteUrl || !canWebShare) return;
    try {
      await navigator.share({
        title: `Mời tham gia "${project.title}" trên Coderlive`,
        text: `Tham gia dự án nhóm "${project.title}" trên Coderlive với vai trò ${roleLabel}`,
        url: inviteUrl,
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        await handleCopyLink();
      }
    }
  };

  const handleDownloadQr = async () => {
    if (!inviteUrl) return;
    setQrBusy('download');
    try {
      await downloadQrPng(inviteUrl, project.title);
      onShowToast?.('Đã tải ảnh QR (PNG)', 'success');
    } catch {
      setError('Không thể xuất ảnh PNG cho mã QR.');
    } finally {
      setQrBusy(null);
    }
  };

  const handleCopyQrImage = async () => {
    if (!inviteUrl) return;
    setQrBusy('copy');
    try {
      await copyQrImageToClipboard(inviteUrl, project.title);
      setCopiedQr(true);
      onShowToast?.('Đã sao chép ảnh QR', 'success');
      setTimeout(() => setCopiedQr(false), 2000);
    } catch (err: any) {
      setError(
        err?.message ||
          'Trình duyệt không cho phép sao chép ảnh trực tiếp. Vui lòng dùng nút Tải ảnh QR (PNG).'
      );
    } finally {
      setQrBusy(null);
    }
  };

  const handlePrintQr = async () => {
    if (!inviteUrl) return;
    setQrBusy('print');
    try {
      await printQrCard(inviteUrl, project.title, roleLabel, expiryStatus.label);
    } catch {
      setError('Không thể mở hộp thoại in mã QR.');
    } finally {
      setQrBusy(null);
    }
  };

  const renderRightSidebarSections = () => (
    <div className="space-y-5">
      {/* 1. Thành viên */}
      <section aria-labelledby="invite-members-heading" className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h4
            id="invite-members-heading"
            className="text-xs font-semibold text-primary flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
            <span>
              Thành viên (<span className="tabular-nums">{memberCount}/{memberLimit}</span>)
            </span>
          </h4>
          {isProjectFull && (
            <Badge variant="warning" size="sm">
              Đã đầy
            </Badge>
          )}
        </div>

        {isProjectFull && (
          <div className="p-2.5 rounded-[var(--radius-sm)] bg-warning-soft border border-[var(--color-warning)]/30 text-[11px] text-warning">
            Dự án đã đạt giới hạn {memberLimit} thành viên. Hãy xóa bớt thành viên trước khi mời thêm.
          </div>
        )}

        <CollabMemberList
          project={project}
          currentUserId={currentUserId}
          currentUserEmail={currentUserEmail}
          onChangeRole={onChangeRole}
          onRemoveMember={onRemoveMember}
          compact
          onError={setError}
        />
      </section>

      {/* 2. Yêu cầu tham gia (Giai đoạn 2) */}
      <section
        aria-labelledby="invite-requests-heading"
        className="pt-4 border-t border-subtle space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2">
          <h4
            id="invite-requests-heading"
            className="text-xs font-semibold text-primary flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
            <span>
              Yêu cầu tham gia (<span className="tabular-nums">{pendingRequests.length}</span>)
            </span>
          </h4>
          {pendingRequests.length > 0 && (
            <Badge variant="accent" size="sm">
              Chờ duyệt
            </Badge>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-3 rounded-[var(--radius-md)] bg-panel border border-default text-xs text-muted">
            Chưa có yêu cầu tham gia nào đang chờ duyệt.
          </div>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((req) => {
              const chosenRole = requestRoles[req.requesterUid] || req.requestedRole;
              const isBusy = requestBusyKey?.startsWith(`${req.requesterUid}:`);
              return (
                <div
                  key={req.requesterUid}
                  className="p-3 rounded-[var(--radius-md)] bg-panel border border-default space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    {req.requesterPhotoURL ? (
                      <img
                        src={req.requesterPhotoURL}
                        alt={req.requesterName}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-default"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-accent-soft text-accent font-semibold text-xs flex items-center justify-center flex-shrink-0 border border-[var(--accent-base)]/30">
                        {req.requesterName.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <p className="text-xs font-semibold text-primary truncate">
                          {req.requesterName}
                        </p>
                        <Badge variant="default" size="sm">
                          {req.source === 'code'
                            ? `Mã ${req.codeUsed || '----'}`
                            : 'Qua liên kết'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted mt-0.5 flex-wrap">
                        {(() => {
                          const raw = (req.requesterPublicLabel || '').trim();
                          if (!raw || raw.includes('@users.coderlive.app')) return null;
                          const displayLabel = raw.startsWith('@')
                            ? raw
                            : maskEmail(raw) || raw;
                          return (
                            <>
                              <span className="truncate max-w-[160px] text-secondary">
                                {displayLabel}
                              </span>
                              <span aria-hidden="true">·</span>
                            </>
                          );
                        })()}
                        <span>{formatShortRelativeTime(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-subtle">
                    <MemberRoleDropdownButton
                      memberName={req.requesterName}
                      role={chosenRole}
                      disabled={Boolean(isBusy)}
                      onChangeRole={(nextRole) =>
                        setRequestRoles((prev) => ({
                          ...prev,
                          [req.requesterUid]: nextRole,
                        }))
                      }
                    />

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        disabled={isProjectFull || Boolean(isBusy)}
                        isLoading={requestBusyKey === `${req.requesterUid}:approve`}
                        className="min-h-[44px] md:min-h-0"
                        onClick={async () => {
                          setError(null);
                          setRequestBusyKey(`${req.requesterUid}:approve`);
                          try {
                            await onApproveRequest(req, chosenRole);
                          } catch (err: any) {
                            setError(err?.message || 'Không thể chấp nhận yêu cầu.');
                          } finally {
                            setRequestBusyKey(null);
                          }
                        }}
                      >
                        Chấp nhận
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={Boolean(isBusy)}
                        isLoading={requestBusyKey === `${req.requesterUid}:reject`}
                        className="min-h-[44px] md:min-h-0"
                        onClick={async () => {
                          setError(null);
                          setRequestBusyKey(`${req.requesterUid}:reject`);
                          try {
                            await onRejectRequest(req);
                          } catch (err: any) {
                            setError(err?.message || 'Không thể từ chối yêu cầu.');
                          } finally {
                            setRequestBusyKey(null);
                          }
                        }}
                      >
                        Từ chối
                      </Button>

                      <button
                        type="button"
                        disabled={Boolean(isBusy)}
                        title="Chặn người này khỏi dự án"
                        aria-label={`Chặn ${req.requesterName}`}
                        onClick={async () => {
                          setError(null);
                          setRequestBusyKey(`${req.requesterUid}:block`);
                          try {
                            await onBlockRequest(req);
                          } catch (err: any) {
                            setError(err?.message || 'Không thể chặn người dùng.');
                          } finally {
                            setRequestBusyKey(null);
                          }
                        }}
                        className="min-h-[44px] min-w-[44px] md:min-h-[28px] md:min-w-0 px-2 inline-flex items-center justify-center gap-1 text-xs font-medium rounded-[var(--radius-sm)] text-danger hover:bg-danger-soft transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Chặn người này</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Lời mời đã gửi (Giai đoạn 3) */}
      <section
        aria-labelledby="invite-sent-heading"
        className="pt-4 border-t border-subtle space-y-2.5"
      >
        <div className="flex items-center justify-between gap-2">
          <h4
            id="invite-sent-heading"
            className="text-xs font-semibold text-primary flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
            <span>
              Lời mời đã gửi (<span className="tabular-nums">{sentInvites.length}</span>)
            </span>
          </h4>
          {sentInvites.length > 0 && (
            <Badge variant="default" size="sm">
              Chờ phản hồi
            </Badge>
          )}
        </div>

        {sentInvites.length === 0 ? (
          <div className="p-3 rounded-[var(--radius-md)] bg-panel border border-default text-xs text-muted">
            Chưa có lời mời trực tiếp nào đang chờ phản hồi.
          </div>
        ) : (
          <div className="space-y-2">
            {sentInvites.map((inv) => {
              const isRevoking = requestBusyKey === `revoke:${inv.targetUid}`;
              return (
                <div
                  key={inv.targetUid}
                  className="p-2.5 rounded-[var(--radius-md)] bg-panel border border-default flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {inv.targetPhotoURL ? (
                      <img
                        src={inv.targetPhotoURL}
                        alt={inv.targetName}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-default flex-shrink-0"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-accent-soft text-accent font-semibold text-xs flex items-center justify-center border border-[var(--accent-base)]/30 flex-shrink-0">
                        {inv.targetName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-xs font-semibold text-primary truncate">
                          {inv.targetName}
                        </p>
                        <Badge variant={inv.role === 'editor' ? 'accent' : 'default'} size="sm">
                          {getRoleDisplayLabel(inv.role)}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted truncate mt-0.5">
                        {inv.targetUsername ? `@${inv.targetUsername} · ` : ''}
                        {formatShortRelativeTime(inv.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={Boolean(requestBusyKey)}
                    isLoading={isRevoking}
                    className="min-h-[44px] md:min-h-0 flex-shrink-0"
                    onClick={async () => {
                      setError(null);
                      setRequestBusyKey(`revoke:${inv.targetUid}`);
                      try {
                        await onRevokeSentInvite(inv.targetUid);
                      } catch (err: any) {
                        setError(err?.message || 'Không thể thu hồi lời mời.');
                      } finally {
                        setRequestBusyKey(null);
                      }
                    }}
                  >
                    Thu hồi
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Danh sách Đã chặn */}
      <section
        aria-labelledby="invite-blocked-heading"
        className="pt-4 border-t border-subtle space-y-2"
      >
        <button
          type="button"
          aria-expanded={showBlockedList || blockedUsers.length > 0}
          onClick={() => setShowBlockedList((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 text-left cursor-pointer py-1 rounded-[var(--radius-xs)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-base)]"
        >
          <h4
            id="invite-blocked-heading"
            className="text-xs font-semibold text-primary flex items-center gap-1.5"
          >
            <Ban className="w-3.5 h-3.5 text-danger" strokeWidth={1.5} />
            <span>
              Đã chặn (<span className="tabular-nums">{blockedUsers.length}</span>)
            </span>
          </h4>
          <span className="text-[11px] text-accent hover:underline">
            {showBlockedList ? 'Thu gọn' : 'Xem'}
          </span>
        </button>

        {(showBlockedList || blockedUsers.length > 0) && (
          blockedUsers.length === 0 ? (
            <div className="p-3 rounded-[var(--radius-md)] bg-panel border border-default text-xs text-muted">
              Chưa có người dùng nào bị chặn khỏi dự án này.
            </div>
          ) : (
            <div className="space-y-1.5">
              {blockedUsers.map((bu) => {
                const isUnblocking = requestBusyKey === `unblock:${bu.uid}`;
                return (
                  <div
                    key={bu.uid}
                    className="p-2.5 rounded-[var(--radius-md)] bg-panel border border-default flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-primary truncate">{bu.name}</p>
                      {bu.publicLabel && (
                        <p className="text-[11px] text-muted truncate">{bu.publicLabel}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={Boolean(requestBusyKey)}
                      isLoading={isUnblocking}
                      className="min-h-[44px] md:min-h-0"
                      onClick={async () => {
                        setError(null);
                        setRequestBusyKey(`unblock:${bu.uid}`);
                        try {
                          await onUnblockUser(bu.uid);
                        } catch (err: any) {
                          setError(err?.message || 'Không thể bỏ chặn người dùng.');
                        } finally {
                          setRequestBusyKey(null);
                        }
                      }}
                    >
                      Bỏ chặn
                    </Button>
                  </div>
                );
              })}
            </div>
          )
        )}
      </section>
    </div>
  );

  const renderLinkTab = () => (
    <div className="space-y-4">
      {/* Công tắc bật / tắt liên kết mời */}
      <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-default flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 ${
              isInviteActiveAndValid
                ? 'bg-success-soft text-success'
                : 'bg-elevated text-muted'
            }`}
          >
            {isInviteActiveAndValid ? (
              <Link2 className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Lock className="w-4 h-4" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">
              {project.inviteEnabled
                ? expiryStatus.isExpired
                  ? 'Liên kết mời đã hết hạn'
                  : 'Liên kết mời đang bật'
                : 'Liên kết mời đang tắt'}
            </p>
            <p className="text-[11px] text-secondary mt-0.5">
              {project.inviteRequiresApproval
                ? 'Người dùng mở liên kết sẽ gửi yêu cầu chờ bạn phê duyệt'
                : project.inviteEnabled && !expiryStatus.isExpired
                ? 'Người có liên kết sau khi đăng nhập có thể tham gia ngay'
                : 'Không ai có thể tham gia qua liên kết hoặc mã QR hiện tại'}
            </p>
          </div>
        </div>

        <Switch
          checked={project.inviteEnabled}
          ariaLabel="Bật hoặc tắt liên kết mời"
          disabled={busyAction !== null}
          onChange={(checked) => runUpdate('toggle', { inviteEnabled: checked })}
        />
      </div>

      {/* Chọn vai trò khi tham gia */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-primary">
          Vai trò khi tham gia qua liên kết hoặc QR
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => runUpdate('role', { inviteRole: 'editor' })}
            className={`min-h-[44px] p-3 rounded-[var(--radius-md)] border text-left transition-colors cursor-pointer disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
              project.inviteRole === 'editor'
                ? 'bg-accent-soft border-[var(--accent-base)] text-primary'
                : 'bg-panel border-default text-secondary hover:border-[var(--border-strong)]'
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
            className={`min-h-[44px] p-3 rounded-[var(--radius-md)] border text-left transition-colors cursor-pointer disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
              project.inviteRole === 'viewer'
                ? 'bg-accent-soft border-[var(--accent-base)] text-primary'
                : 'bg-panel border-default text-secondary hover:border-[var(--border-strong)]'
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

      {/* Thời hạn & yêu cầu chủ dự án chấp nhận */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[var(--radius-md)] bg-panel border border-default">
        <div className="space-y-1.5">
          <Select<InviteExpiryPreset>
            label="Hết hạn"
            value={project.inviteExpiryPreset || 'never'}
            options={EXPIRY_OPTIONS}
            selectClassName="text-base md:text-xs !h-11 md:!h-8"
            onChange={(preset) =>
              runUpdate('expiry', {
                inviteExpiryPreset: preset,
                inviteEnabled: true,
              })
            }
          />
          <p
            className={`text-[11px] flex items-center gap-1.5 ${
              expiryStatus.isExpired ? 'text-danger font-medium' : 'text-muted'
            }`}
          >
            <Clock className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
            <span>{expiryStatus.label}</span>
          </p>
        </div>

        <div className="flex items-start justify-between gap-3 sm:border-l sm:border-subtle sm:pl-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-medium text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.5} />
              <span>Chủ dự án phải chấp nhận khi tham gia qua liên kết hoặc QR</span>
            </p>
            <p className="text-[11px] text-muted leading-snug">
              Khi bật, người bấm liên kết sẽ gửi yêu cầu chờ duyệt thay vì vào thẳng.
            </p>
          </div>
          <Switch
            size="sm"
            ariaLabel="Chủ dự án phải chấp nhận khi tham gia qua liên kết hoặc QR"
            checked={Boolean(project.inviteRequiresApproval)}
            disabled={busyAction !== null}
            onChange={(checked) =>
              runUpdate('approval', { inviteRequiresApproval: checked })
            }
          />
        </div>
      </div>

      {/* Liên kết mời đầy đủ (không cắt chữ) */}
      {project.inviteEnabled && (
        <div className="space-y-2.5">
          <label
            htmlFor="collab-full-invite-url"
            className="block text-xs font-semibold text-primary"
          >
            Liên kết mời đầy đủ
          </label>
          <textarea
            id="collab-full-invite-url"
            readOnly
            rows={2}
            value={inviteUrl}
            aria-label="Liên kết mời đầy đủ"
            onFocus={(e) => e.currentTarget.select()}
            className="w-full px-3 py-2.5 bg-input border border-default rounded-[var(--radius-sm)] text-base md:text-xs text-accent font-mono leading-relaxed break-all resize-none focus:outline-none focus:border-[var(--accent-base)] select-all"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={handleCopyLink}
                className="min-h-[44px] md:min-h-0"
                leftIcon={
                  copiedLink ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )
                }
              >
                {copiedLink ? 'Đã sao chép' : 'Sao chép'}
              </Button>

              {isMobile && canWebShare && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleWebShare}
                  className="min-h-[44px] md:min-h-0"
                  leftIcon={<Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
                >
                  Chia sẻ
                </Button>
              )}
            </div>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => runUpdate('regen', { regenerateToken: true })}
              className="min-h-[44px] md:min-h-0 px-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none rounded-[var(--radius-xs)]"
            >
              {busyAction === 'regen' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
              )}
              <span>Tạo liên kết mới</span>
            </button>
          </div>

          <p className="text-[11px] text-muted flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.5} />
            <span>
              Tạo liên kết mới sẽ vô hiệu hóa ngay lập tức liên kết và mã QR trước đó.
            </span>
          </p>
        </div>
      )}
    </div>
  );

  const renderQrTab = () => {
    if (!isInviteActiveAndValid) {
      return (
        <div className="p-6 rounded-[var(--radius-md)] bg-panel border border-default flex flex-col items-center justify-center text-center space-y-3 min-h-[320px]">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-elevated border border-default flex items-center justify-center text-muted">
            <QrCode className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="space-y-1 max-w-xs">
            <h4 className="text-sm font-semibold text-primary">Liên kết mời đang tắt</h4>
            <p className="text-xs text-secondary leading-relaxed">
              {expiryStatus.isExpired
                ? 'Liên kết mời đã hết hạn nên mã QR tạm thời ngừng hoạt động. Bật lại để tạo mã QR mới.'
                : 'Hãy bật liên kết mời để hiển thị mã QR cho thành viên quét và tham gia.'}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={busyAction !== null}
            onClick={() => runUpdate('enable-from-qr', { inviteEnabled: true })}
            className="min-h-[44px] md:min-h-0"
          >
            {busyAction === 'enable-from-qr' ? 'Đang bật...' : 'Bật liên kết mời'}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="p-4 sm:p-5 rounded-[var(--radius-md)] bg-panel border border-default flex flex-col items-center text-center space-y-3.5">
          {/* Nền sáng cố định đen/trắng riêng cho mã QR để mọi máy ảnh đọc ổn định ở mọi giao diện */}
          <div
            className="p-3 rounded-[var(--radius-md)] border border-default shadow-[var(--shadow-subtle)] inline-flex items-center justify-center"
            style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
          >
            <canvas
              ref={qrCanvasRef}
              width={248}
              height={248}
              role="img"
              aria-label={`Mã QR mời tham gia dự án ${project.title} với vai trò ${roleLabel}`}
              className="block w-[240px] h-[240px] md:w-[248px] md:h-[248px]"
            />
          </div>

          {qrRenderError && (
            <p className="text-xs text-danger">{qrRenderError}</p>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-primary">
              <span>
                Vai trò: <strong>{roleLabel}</strong>
              </span>
              <span aria-hidden="true" className="text-muted">·</span>
              <span className="text-secondary">{expiryStatus.label}</span>
            </div>
            <p className="text-[11px] text-muted">
              Ai quét mã đều có thể tham gia với vai trò này
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={qrBusy !== null}
              onClick={handleDownloadQr}
              className="min-h-[44px] md:min-h-0"
              leftIcon={<Download className="w-3.5 h-3.5" strokeWidth={1.5} />}
            >
              {qrBusy === 'download' ? 'Đang tạo PNG...' : 'Tải ảnh QR (PNG)'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={qrBusy !== null}
              onClick={handleCopyQrImage}
              className="min-h-[44px] md:min-h-0"
              leftIcon={
                copiedQr ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                ) : (
                  <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                )
              }
            >
              {copiedQr ? 'Đã sao chép ảnh' : 'Sao chép ảnh'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={qrBusy !== null}
              onClick={handlePrintQr}
              className="min-h-[44px] md:min-h-0"
              leftIcon={<Printer className="w-3.5 h-3.5" strokeWidth={1.5} />}
            >
              In
            </Button>
          </div>
        </div>

        {/* Văn bản thay thế (Text alternative) hiển thị liên kết ngay cạnh/dưới QR */}
        <div className="p-3 rounded-[var(--radius-sm)] bg-panel border border-default space-y-1">
          <p className="text-[11px] font-medium text-secondary">
            Liên kết tương ứng với mã QR này:
          </p>
          <p className="text-xs font-mono text-accent break-all select-all">{inviteUrl}</p>
        </div>
      </div>
    );
  };

  const renderCodeTab = () => (
    <div className="space-y-4">
      {/* Công tắc bật / tắt mã dự án 4 chữ số */}
      <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-default flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 ${
              isJoinCodeActiveAndValid
                ? 'bg-success-soft text-success'
                : 'bg-elevated text-muted'
            }`}
          >
            {isJoinCodeActiveAndValid ? (
              <KeyRound className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Lock className="w-4 h-4" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">
              Cho phép tham gia bằng mã dự án
            </p>
            <p className="text-[11px] text-secondary mt-0.5">
              {project.joinCodeEnabled
                ? joinCodeExpiryStatus.isExpired
                  ? 'Mã dự án đã hết hạn — hãy tạo mã mới.'
                  : 'Người nhập đúng mã chỉ gửi được yêu cầu. Bạn phải chấp nhận thì họ mới vào được dự án.'
                : 'Đang tắt — bật để tạo mã 4 chữ số cho người khác gửi yêu cầu tham gia.'}
            </p>
          </div>
        </div>

        <Switch
          checked={Boolean(project.joinCodeEnabled)}
          ariaLabel="Cho phép tham gia bằng mã dự án"
          disabled={busyAction !== null}
          onChange={(checked) => runJoinCodeUpdate('code-toggle', { joinCodeEnabled: checked })}
        />
      </div>

      {/* Vai trò đề xuất khi tham gia bằng mã */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-primary">
          Vai trò đề xuất (có thể đổi trước khi bấm Chấp nhận)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => runJoinCodeUpdate('code-role', { joinCodeRole: 'editor' })}
            className={`min-h-[44px] p-3 rounded-[var(--radius-md)] border text-left transition-colors cursor-pointer disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
              joinCodeRole === 'editor'
                ? 'bg-accent-soft border-[var(--accent-base)] text-primary'
                : 'bg-panel border-default text-secondary hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Edit3 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              <span>Biên tập viên</span>
            </div>
            <p className="text-[11px] text-muted mt-1 leading-snug">
              Cho phép chỉnh sửa mã nguồn sau khi được duyệt
            </p>
          </button>

          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => runJoinCodeUpdate('code-role', { joinCodeRole: 'viewer' })}
            className={`min-h-[44px] p-3 rounded-[var(--radius-md)] border text-left transition-colors cursor-pointer disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
              joinCodeRole === 'viewer'
                ? 'bg-accent-soft border-[var(--accent-base)] text-primary'
                : 'bg-panel border-default text-secondary hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5 text-warning" strokeWidth={1.5} />
              <span>Người xem</span>
            </div>
            <p className="text-[11px] text-muted mt-1 leading-snug">
              Chỉ xem mã nguồn theo thời gian thực sau khi được duyệt
            </p>
          </button>
        </div>
      </div>

      {/* Thời hạn mã dự án */}
      <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-default space-y-2">
        <Select<JoinCodeExpiryPreset>
          label="Thời hạn mã dự án"
          value={
            project.joinCodeExpiryPreset === '15m' ||
            project.joinCodeExpiryPreset === '1h' ||
            project.joinCodeExpiryPreset === '24h'
              ? project.joinCodeExpiryPreset
              : '1h'
          }
          options={JOIN_CODE_EXPIRY_OPTIONS}
          selectClassName="text-base md:text-xs !h-11 md:!h-8"
          onChange={(preset) =>
            runJoinCodeUpdate('code-expiry', {
              joinCodeExpiryPreset: preset,
              joinCodeEnabled: true,
            })
          }
        />
        <p
          className={`text-[11px] flex items-center gap-1.5 ${
            joinCodeExpiryStatus.isExpired ? 'text-danger font-medium' : 'text-muted'
          }`}
        >
          <Clock className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
          <span>
            {project.joinCodeEnabled && project.joinCode
              ? joinCodeExpiryStatus.label
              : 'Mã sẽ tự động hết hạn và bị xóa sau thời gian đã chọn.'}
          </span>
        </p>
      </div>

      {/* Khối hiển thị 4 chữ số hoặc trạng thái tắt */}
      {isJoinCodeActiveAndValid && project.joinCode ? (
        <div className="p-4 sm:p-5 rounded-[var(--radius-md)] bg-panel border border-default flex flex-col items-center text-center space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-primary">Mã tham gia dự án</p>
            <p className="text-[11px] text-muted">
              Đọc mã gồm 4 chữ số này cho thành viên nhập tại mục Tham gia bằng mã
            </p>
          </div>

          <div
            className="flex items-center justify-center gap-2.5 sm:gap-3 select-all"
            aria-label={`Mã dự án gồm 4 chữ số: ${project.joinCode.split('').join(' ')}`}
          >
            {project.joinCode.split('').map((digit, idx) => (
              <span
                key={idx}
                className="w-13 h-14 sm:w-14 sm:h-16 rounded-[var(--radius-md)] bg-elevated border border-default shadow-[var(--shadow-subtle)] flex items-center justify-center font-mono text-2xl sm:text-3xl font-bold tabular-nums text-primary"
              >
                {digit}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleCopyJoinCode}
              className="min-h-[44px] md:min-h-0"
              leftIcon={
                copiedCode ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                ) : (
                  <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                )
              }
            >
              {copiedCode ? 'Đã sao chép' : 'Sao chép mã'}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busyAction !== null}
              isLoading={busyAction === 'code-regen'}
              onClick={() =>
                runJoinCodeUpdate('code-regen', {
                  regenerateCode: true,
                  joinCodeEnabled: true,
                })
              }
              className="min-h-[44px] md:min-h-0"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />}
            >
              Tạo mã mới
            </Button>
          </div>

          <p className="text-[11px] text-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.5} />
            <span>
              Tạo mã mới sẽ hủy mã cũ ngay lập tức. Yêu cầu gửi lên luôn xuất hiện ở cột Yêu cầu tham gia.
            </span>
          </p>
        </div>
      ) : (
        <div className="p-5 rounded-[var(--radius-md)] bg-panel border border-default flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-11 h-11 rounded-[var(--radius-md)] bg-elevated border border-default flex items-center justify-center text-muted">
            <KeyRound className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="space-y-1 max-w-xs">
            <h4 className="text-sm font-semibold text-primary">
              {joinCodeExpiryStatus.isExpired
                ? 'Mã dự án đã hết hạn'
                : 'Mã dự án 4 chữ số đang tắt'}
            </h4>
            <p className="text-xs text-secondary leading-relaxed">
              Bật mã dự án để tạo nhanh mã 4 chữ số giúp bạn bè gửi yêu cầu tham gia và chờ bạn duyệt.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={busyAction !== null}
            isLoading={busyAction === 'code-enable'}
            onClick={() =>
              runJoinCodeUpdate('code-enable', {
                joinCodeEnabled: true,
                regenerateCode: joinCodeExpiryStatus.isExpired || !project.joinCode,
              })
            }
            className="min-h-[44px] md:min-h-0"
          >
            {joinCodeExpiryStatus.isExpired ? 'Tạo mã mới' : 'Bật mã dự án'}
          </Button>
        </div>
      )}
    </div>
  );

  const handleManualSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = userQuery.trim();
    const minLen = trimmed.startsWith('@') ? 3 : 2;
    if (trimmed.length < minLen || isSearchingUsers) return;
    setIsSearchingUsers(true);
    setUserSearchError(null);
    try {
      const list = await onSearchUsers(trimmed);
      setSearchResults(list);
      setHasSearchedUsers(true);
    } catch (err: any) {
      setUserSearchError(err?.message || 'Không thể tìm kiếm người dùng lúc này.');
      setHasSearchedUsers(true);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const renderSearchTab = () => {
    const blockedUidSet = new Set(blockedUsers.map((b) => b.uid));
    const sentInviteMap = new Map<string, CollabDirectInvite>(
      sentInvites.map((inv) => [inv.targetUid, inv])
    );

    return (
      <div className="space-y-4">
        <div className="p-3.5 rounded-[var(--radius-md)] bg-panel border border-default space-y-2">
          <p className="text-xs font-semibold text-primary">Tìm người dùng hiện có</p>
          <p className="text-[11px] text-secondary leading-relaxed">
            Nhập chính xác <strong>email đã xác minh</strong>, <strong>@tênđăngnhập</strong> hoặc{' '}
            <strong>tên hiển thị</strong>. Người được mời sẽ nhận lời mời trong hộp thư và tự bấm
            Chấp nhận mới vào dự án.
          </p>

          <form onSubmit={handleManualSearchSubmit} className="flex items-center gap-2 pt-1">
            <div className="relative flex-1 min-w-0">
              <Search
                className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.5}
              />
              <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Email đã xác minh, @username hoặc tên..."
                aria-label="Tìm người dùng theo email đã xác minh hoặc tên đăng nhập"
                className="w-full min-h-[44px] md:min-h-[36px] pl-9 pr-8 py-2 bg-input border border-default rounded-[var(--radius-sm)] text-base md:text-xs text-primary placeholder-muted focus:outline-none focus:border-[var(--accent-base)]"
              />
              {userQuery && (
                <button
                  type="button"
                  aria-label="Xóa từ khóa tìm kiếm"
                  onClick={() => {
                    setUserQuery('');
                    setSearchResults([]);
                    setHasSearchedUsers(false);
                    setUserSearchError(null);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-primary cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={isSearchingUsers || userQuery.trim().length < 2}
              isLoading={isSearchingUsers}
              className="min-h-[44px] md:min-h-[36px] px-3 flex-shrink-0"
            >
              Tìm
            </Button>
          </form>
        </div>

        {userSearchError && (
          <div
            role="alert"
            className="p-2.5 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 text-danger text-xs"
          >
            {userSearchError}
          </div>
        )}

        {isSearchingUsers ? (
          <div className="p-8 rounded-[var(--radius-md)] bg-panel border border-default flex flex-col items-center justify-center gap-2 text-muted">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span className="text-xs">Đang tìm kiếm người dùng...</span>
          </div>
        ) : !hasSearchedUsers ? (
          <div className="p-6 rounded-[var(--radius-md)] bg-panel border border-default flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-elevated border border-default flex items-center justify-center text-accent">
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-medium text-primary">Nhập tối thiểu 2 ký tự để bắt đầu tìm</p>
            <p className="text-[11px] text-muted max-w-sm leading-relaxed">
              Vì quyền riêng tư, danh sách email không bao giờ được công khai. Chỉ tài khoản bật cho
              phép tìm kiếm trong Thông tin hồ sơ mới xuất hiện.
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-6 rounded-[var(--radius-md)] bg-panel border border-default flex flex-col items-center justify-center text-center space-y-1.5">
            <p className="text-xs font-semibold text-primary">Không tìm thấy người dùng phù hợp</p>
            <p className="text-[11px] text-secondary max-w-sm leading-relaxed">
              Kiểm tra lại chính tả, hoặc người đó chưa bật cho phép tìm kiếm trong{' '}
              <strong>Thông tin hồ sơ → Quyền riêng tư</strong>. Bạn vẫn có thể gửi Liên kết mời
              hoặc Mã dự án 4 chữ số.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {searchResults.map((u) => {
              const existingRole = project.members[u.uid];
              const isBlocked = blockedUidSet.has(u.uid);
              const existingInvite = sentInviteMap.get(u.uid);
              const chosenRole = searchInviteRoles[u.uid] || 'editor';
              const isSending = inviteSendBusyUid === u.uid;

              return (
                <div
                  key={u.uid}
                  className="p-3 rounded-[var(--radius-md)] bg-panel border border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {u.photoURL ? (
                      <img
                        src={u.photoURL}
                        alt={u.displayName}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-default flex-shrink-0"
                      />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-accent-soft text-accent font-bold text-xs flex items-center justify-center border border-[var(--accent-base)]/30 flex-shrink-0">
                        {u.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-semibold text-primary truncate">
                          {u.displayName}
                        </p>
                        {u.username && (
                          <span className="text-[11px] font-mono text-secondary truncate">
                            @{u.username}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        {u.matchedBy === 'email'
                          ? 'Khớp email đã xác minh'
                          : u.matchedBy === 'username'
                          ? 'Khớp tên đăng nhập'
                          : 'Khớp tên hiển thị'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end flex-shrink-0">
                    {existingRole ? (
                      <Badge variant="success" size="sm">
                        Đã là thành viên ({getRoleDisplayLabel(existingRole)})
                      </Badge>
                    ) : isBlocked ? (
                      <Badge variant="danger" size="sm">
                        Đã bị chặn
                      </Badge>
                    ) : existingInvite ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="accent" size="sm">
                          Đã gửi lời mời
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isSending || Boolean(requestBusyKey)}
                          isLoading={requestBusyKey === `revoke:${u.uid}`}
                          className="min-h-[44px] md:min-h-0"
                          onClick={async () => {
                            setError(null);
                            setRequestBusyKey(`revoke:${u.uid}`);
                            try {
                              await onRevokeSentInvite(u.uid);
                            } catch (err: any) {
                              setError(err?.message || 'Không thể thu hồi lời mời.');
                            } finally {
                              setRequestBusyKey(null);
                            }
                          }}
                        >
                          Thu hồi
                        </Button>
                      </div>
                    ) : !u.acceptDirectInvites ? (
                      <Badge variant="default" size="sm">
                        Đang tắt nhận lời mời
                      </Badge>
                    ) : (
                      <>
                        <MemberRoleDropdownButton
                          memberName={u.displayName}
                          role={chosenRole}
                          disabled={isSending || isProjectFull}
                          onChangeRole={(nextRole) =>
                            setSearchInviteRoles((prev) => ({
                              ...prev,
                              [u.uid]: nextRole,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          disabled={isProjectFull || isSending}
                          isLoading={isSending}
                          className="min-h-[44px] md:min-h-0"
                          leftIcon={<Send className="w-3.5 h-3.5" strokeWidth={1.5} />}
                          onClick={async () => {
                            setError(null);
                            setInviteSendBusyUid(u.uid);
                            try {
                              await onSendDirectInvite(u, chosenRole);
                            } catch (err: any) {
                              setError(err?.message || 'Không thể gửi lời mời trực tiếp.');
                            } finally {
                              setInviteSendBusyUid(null);
                            }
                          }}
                        >
                          Gửi lời mời
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="full"
      fullScreenMobile
      className="md:w-[min(1000px,94vw)] md:h-[min(720px,90vh)] md:max-w-none"
      bodyClassName="flex-1 min-h-0 flex flex-col overflow-hidden"
      title={
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.5} />
          <span>Mời thành viên</span>
        </div>
      }
      description={`Mời bạn tham gia dự án "${project.title}" trên Coderlive`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted tabular-nums">
            Giới hạn thành viên: {memberCount}/{memberLimit}
          </span>
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
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Cột trái (~60% trên desktop): Thanh tab & nội dung */}
        <div className="flex-1 md:w-[60%] md:flex-none min-w-0 min-h-0 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-6 pt-3 flex-shrink-0">
            <Tabs<InviteModalTabId>
              tabs={tabsList}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="underline"
              idPrefix={tabsIdPrefix}
              ariaLabel="Phương thức mời thành viên"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
            {error && (
              <div
                role="alert"
                className="p-2.5 rounded-[var(--radius-sm)] bg-danger-soft border border-[var(--color-danger)]/30 text-danger text-xs"
              >
                {error}
              </div>
            )}

            <div
              role="tabpanel"
              id={`${tabsIdPrefix}-panel-${activeTab}`}
              aria-labelledby={`${tabsIdPrefix}-tab-${activeTab}`}
            >
              {activeTab === 'link' && renderLinkTab()}
              {activeTab === 'qr' && renderQrTab()}
              {activeTab === 'code' && renderCodeTab()}
              {activeTab === 'search' && renderSearchTab()}
              {activeTab === 'members' && isMobile && renderRightSidebarSections()}
            </div>
          </div>
        </div>

        {/* Cột phải (~40% trên desktop): Thành viên, yêu cầu và lời mời */}
        <aside
          aria-label="Danh sách thành viên và yêu cầu"
          className="hidden md:block md:w-[40%] min-w-0 min-h-0 border-l border-subtle overflow-y-auto overscroll-contain p-5 bg-panel/40"
        >
          {renderRightSidebarSections()}
        </aside>
      </div>
    </Modal>
  );
};
