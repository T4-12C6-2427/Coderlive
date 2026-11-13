import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  FolderOpen,
  Search,
  Clock,
  Check,
  FolderGit2,
  Globe,
  Loader2,
  RefreshCw,
  AlertCircle,
  MoreHorizontal,
  FileEdit,
  Users,
  UserPlus,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react';
import { CollabProject, Project } from '../types';
import { Drawer } from './ui/Drawer';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/Feedback';

export interface ProjectsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId?: string;
  onSelectProject: (project: Project) => void;
  onCreateNewProject: (defaultType?: 'personal' | 'collab') => void;
  onRenameProject: (projectId: string, newTitle: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
  onConvertToCollab?: (project: Project) => void;
  collabProjects?: CollabProject[];
  activeCollabProjectId?: string;
  currentUserId?: string;
  onSelectCollabProject?: (project: CollabProject) => void;
  onRenameCollabProject?: (projectId: string, newTitle: string) => void;
  onDeleteCollabProject?: (project: CollabProject) => void;
  onEditCollabProject?: (project: CollabProject) => void;
  onOpenCollabInvite?: (project: CollabProject) => void;
  onOpenCollabMembers?: (project: CollabProject) => void;
  onLeaveCollabProject?: (project: CollabProject) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isGuest?: boolean;
  onOpenAuth?: () => void;
}

export const ProjectsPanel: React.FC<ProjectsPanelProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateNewProject,
  onRenameProject,
  onDeleteProject,
  onEditProject,
  onConvertToCollab,
  collabProjects = [],
  activeCollabProjectId,
  currentUserId = '',
  onSelectCollabProject,
  onRenameCollabProject,
  onDeleteCollabProject,
  onEditCollabProject,
  onOpenCollabInvite,
  onOpenCollabMembers,
  onLeaveCollabProject,
  isLoading = false,
  error = null,
  onRetry,
  isGuest = false,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);
  const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);
  const [menuOpenKey, setMenuOpenKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpenKey) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenKey(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpenKey]);

  const normalizedQuery = searchQuery.toLowerCase().trim();

  const filteredPersonal = projects.filter((p) =>
    p.title.toLowerCase().includes(normalizedQuery)
  );
  const filteredCollab = collabProjects.filter((p) =>
    p.title.toLowerCase().includes(normalizedQuery)
  );

  const startRenamePersonal = (p: Project) => {
    setEditingKey(`personal:${p.id}`);
    setEditTitle(p.title);
  };

  const startRenameCollab = (p: CollabProject) => {
    setEditingKey(`collab:${p.id}`);
    setEditTitle(p.title);
  };

  const handleSaveRenamePersonal = (projectId: string) => {
    if (editTitle.trim()) {
      onRenameProject(projectId, editTitle.trim());
    }
    setEditingKey(null);
  };

  const handleSaveRenameCollab = (projectId: string) => {
    if (editTitle.trim() && onRenameCollabProject) {
      onRenameCollabProject(projectId, editTitle.trim());
    }
    setEditingKey(null);
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Vừa xong';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} giờ trước`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 30) return `${diffDay} ngày trước`;
      const diffMonth = Math.floor(diffDay / 30);
      if (diffMonth < 12) return `${diffMonth} tháng trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'owner') return 'Chủ sở hữu';
    if (role === 'editor') return 'Biên tập viên';
    return 'Chỉ xem';
  };

  const totalCount = projects.length + collabProjects.length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      title={
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <span>Dự án ({totalCount})</span>
        </div>
      }
      description="Quản lý dự án cá nhân và dự án nhóm cộng tác"
      width="w-full sm:w-96"
    >
      <div className="space-y-4">
        {/* Guest Banner if not signed in */}
        {isGuest && (
          <div className="p-2.5 rounded-[var(--radius-md)] bg-panel border border-subtle flex items-start justify-between gap-2 text-xs">
            <span className="text-secondary text-[11px]">
              Đang ở chế độ Khách (lưu vào trình duyệt).{' '}
              <span className="text-primary font-medium">
                Đăng nhập để đồng bộ và cộng tác nhóm.
              </span>
            </span>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="touch-target-h px-1 text-accent hover:underline text-[11px] font-semibold flex-shrink-0 cursor-pointer"
              >
                Đăng nhập
              </button>
            )}
          </div>
        )}

        {/* Action Header: Search & Create New Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-3 sm:top-2.5 text-muted pointer-events-none"
              strokeWidth={1.5}
            />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm dự án..."
              aria-label="Tìm kiếm dự án"
              className="w-full h-10 sm:h-8 pl-8 pr-3 text-xs bg-elevated border border-default rounded-[var(--radius-sm)] text-primary placeholder-muted outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-base)]"
            />
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onCreateNewProject()}
            leftIcon={<Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Tạo mới
          </Button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-3 bg-danger-soft border border-[var(--color-danger)]/30 rounded-[var(--radius-md)] flex flex-wrap items-start justify-between gap-2 text-xs text-danger">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="touch-target-h px-1.5 flex items-center gap-1 font-semibold hover:underline text-xs flex-shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Thử lại</span>
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="text-xs">Đang đồng bộ dự án...</span>
          </div>
        ) : totalCount === 0 ? (
          <EmptyState
            icon={<FolderOpen className="w-6 h-6 text-muted" strokeWidth={1.5} />}
            title="Chưa có dự án nào"
            description="Hãy lưu lại sản phẩm sáng tạo đầu tiên của bạn hoặc tạo một dự án nhóm."
            action={
              <Button
                size="sm"
                variant="primary"
                onClick={() => onCreateNewProject()}
                leftIcon={<Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
              >
                Tạo dự án đầu tiên
              </Button>
            }
          />
        ) : filteredPersonal.length === 0 && filteredCollab.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            Không tìm thấy dự án nào khớp với &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="space-y-5">
            {/* ===================================================== */}
            {/* SECTION 1: DỰ ÁN NHÓM (TEAM COLLABORATION PROJECTS)    */}
            {/* ===================================================== */}
            {(!isGuest || collabProjects.length > 0) && (
              <section className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                    <Users className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    <span>Dự án nhóm ({filteredCollab.length})</span>
                  </div>
                  {!isGuest && (
                    <button
                      type="button"
                      onClick={() => onCreateNewProject('collab')}
                      className="touch-target-h text-[11px] font-medium text-accent hover:underline cursor-pointer flex items-center gap-1 px-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tạo nhóm</span>
                    </button>
                  )}
                </div>

                {filteredCollab.length === 0 ? (
                  <div className="p-3 rounded-[var(--radius-md)] border border-dashed border-default bg-panel/50 text-[11px] text-muted text-center">
                    {normalizedQuery
                      ? 'Không có dự án nhóm phù hợp.'
                      : 'Chưa có dự án nhóm nào. Bạn có thể tạo mới hoặc chuyển một dự án cá nhân thành dự án nhóm.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCollab.map((cp) => {
                      const isActive = cp.id === activeCollabProjectId;
                      const menuKey = `collab:${cp.id}`;
                      const isMenuOpen = menuOpenKey === menuKey;
                      const isEditing = editingKey === menuKey;
                      const myRole = cp.members[currentUserId] || 'viewer';
                      const isOwner = myRole === 'owner' && cp.ownerId === currentUserId;
                      const projectLanguages =
                        cp.languages && cp.languages.length > 0 ? cp.languages : ['html', 'css', 'js'];
                      const memberIds = Object.keys(cp.members);
                      const visibleAvatars = memberIds.slice(0, 4);
                      const extraMembers = memberIds.length - visibleAvatars.length;

                      return (
                        <div
                          key={cp.id}
                          className={`p-3 rounded-[var(--radius-md)] border transition-all flex flex-col gap-2 relative ${
                            isActive
                              ? 'bg-accent-soft border-[var(--accent-base)]/40 shadow-xs'
                              : 'bg-elevated border-default hover:border-strong'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <input
                                  type="text"
                                  enterKeyHint="done"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRenameCollab(cp.id);
                                    if (e.key === 'Escape') setEditingKey(null);
                                  }}
                                  autoFocus
                                  maxLength={60}
                                  className="flex-1 min-w-0 h-10 sm:h-7 px-2 text-xs bg-panel border border-[var(--accent-base)] rounded-[var(--radius-xs)] text-primary outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRenameCollab(cp.id)}
                                  className="touch-target p-1 text-[var(--color-success)] hover:bg-[var(--border-subtle)] rounded-[var(--radius-xs)] cursor-pointer flex items-center justify-center"
                                  aria-label="Lưu tên"
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSelectCollabProject?.(cp);
                                      onClose();
                                    }}
                                    className="touch-target-h text-xs font-semibold text-primary hover:text-accent truncate text-left transition-colors cursor-pointer min-w-0 max-w-full"
                                    title={cp.title}
                                  >
                                    {cp.title}
                                  </button>
                                  <Badge variant="accent" size="sm">
                                    Nhóm
                                  </Badge>
                                  {isActive && (
                                    <Badge variant="success" size="sm">
                                      Đang mở
                                    </Badge>
                                  )}
                                </div>

                                <p
                                  className="text-[11px] text-secondary truncate mt-0.5"
                                  title={cp.description || 'Chưa có mô tả'}
                                >
                                  {cp.description || (
                                    <span className="text-muted italic">
                                      Vai trò: {getRoleLabel(myRole)}
                                    </span>
                                  )}
                                </p>

                                {/* Languages + Member Avatars */}
                                <div className="flex items-center justify-between gap-2 mt-1.5">
                                  <div className="flex items-center gap-1">
                                    {projectLanguages.map((lang) => (
                                      <span
                                        key={lang}
                                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border select-none ${
                                          lang === 'html'
                                            ? 'bg-accent-soft text-accent border-[var(--accent-base)]/30'
                                            : lang === 'css'
                                            ? 'bg-[var(--accent-2)]/10 text-[var(--accent-2)] border-[var(--accent-2)]/30'
                                            : 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/30'
                                        }`}
                                      >
                                        {lang.toUpperCase()}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Stacked member avatars */}
                                  <button
                                    type="button"
                                    onClick={() => onOpenCollabMembers?.(cp)}
                                    title={`${memberIds.length} thành viên • Nhấp để xem`}
                                    className="flex items-center -space-x-1.5 cursor-pointer"
                                  >
                                    {visibleAvatars.map((uid) => {
                                      const prof = cp.memberProfiles[uid];
                                      const label = prof?.name || 'TV';
                                      return prof?.photoURL ? (
                                        <img
                                          key={uid}
                                          src={prof.photoURL}
                                          alt={label}
                                          title={label}
                                          referrerPolicy="no-referrer"
                                          className="w-5 h-5 rounded-full object-cover border border-[var(--bg-elevated)] bg-panel"
                                        />
                                      ) : (
                                        <span
                                          key={uid}
                                          title={label}
                                          className="w-5 h-5 rounded-full bg-accent-soft text-accent border border-[var(--bg-elevated)] flex items-center justify-center text-[9px] font-bold"
                                        >
                                          {label.charAt(0).toUpperCase()}
                                        </span>
                                      );
                                    })}
                                    {extraMembers > 0 && (
                                      <span className="w-5 h-5 rounded-full bg-panel text-secondary border border-[var(--bg-elevated)] flex items-center justify-center text-[9px] font-semibold">
                                        +{extraMembers}
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 3-dots menu for collab project */}
                            <div className="relative flex-shrink-0" ref={isMenuOpen ? menuRef : undefined}>
                              <button
                                type="button"
                                onClick={() => setMenuOpenKey(isMenuOpen ? null : menuKey)}
                                className="touch-target p-1 text-muted hover:text-primary rounded-[var(--radius-xs)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer flex items-center justify-center"
                                aria-label="Tùy chọn dự án nhóm"
                              >
                                <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 top-9 z-30 min-w-44 py-1 bg-elevated border border-default rounded-[var(--radius-sm)] shadow-[var(--shadow-overlay)] text-xs animate-in fade-in zoom-in-95 duration-150">
                                  {isOwner && onOpenCollabInvite && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onOpenCollabInvite(cp);
                                        setMenuOpenKey(null);
                                      }}
                                      className="touch-target-h w-full px-3 py-1.5 text-left text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <UserPlus className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                                      <span>Mời thành viên</span>
                                    </button>
                                  )}

                                  {onOpenCollabMembers && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onOpenCollabMembers(cp);
                                        setMenuOpenKey(null);
                                      }}
                                      className="touch-target-h w-full px-3 py-1.5 text-left text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Users className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                                      <span>{isOwner ? 'Quản lý thành viên' : 'Xem thành viên'}</span>
                                    </button>
                                  )}

                                  {isOwner && onEditCollabProject && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onEditCollabProject(cp);
                                        setMenuOpenKey(null);
                                      }}
                                      className="touch-target-h w-full px-3 py-1.5 text-left text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <FileEdit className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                                      <span>Chỉnh sửa thông tin</span>
                                    </button>
                                  )}

                                  {isOwner && onRenameCollabProject && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        startRenameCollab(cp);
                                        setMenuOpenKey(null);
                                      }}
                                      className="touch-target-h w-full px-3 py-1.5 text-left text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                                      <span>Đổi tên</span>
                                    </button>
                                  )}

                                  <div className="my-1 border-t border-subtle" />

                                  {isOwner ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConfirmDeleteKey(menuKey);
                                        setMenuOpenKey(null);
                                      }}
                                      className="touch-target-h w-full px-3 py-1.5 text-left text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-[var(--color-danger)]" strokeWidth={1.5} />
                                      <span>Xóa dự án nhóm</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConfirmLeaveId(cp.id);
                                        setMenuOpenKey(null);
                                      }}
                                      className="touch-target-h w-full px-3 py-1.5 text-left text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <LogOut className="w-3.5 h-3.5 text-[var(--color-danger)]" strokeWidth={1.5} />
                                      <span>Rời khỏi dự án</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Confirm Delete Collab Inline */}
                          {confirmDeleteKey === menuKey && (
                            <div className="p-2 bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/30 rounded-[var(--radius-sm)] flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-150">
                              <span className="text-[var(--color-danger)] font-medium text-[11px]">
                                Xóa vĩnh viễn dự án nhóm này?
                              </span>
                              <div className="flex items-center touch-gap gap-1.5">
                                <button
                                  onClick={() => {
                                    onDeleteCollabProject?.(cp);
                                    setConfirmDeleteKey(null);
                                  }}
                                  className="touch-target-h px-2.5 py-0.5 bg-[var(--color-danger)] text-white text-[10px] font-semibold rounded-[var(--radius-xs)] hover:opacity-90 cursor-pointer"
                                >
                                  Xóa
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteKey(null)}
                                  className="touch-target-h px-2.5 py-0.5 bg-elevated text-secondary text-[10px] rounded-[var(--radius-xs)] hover:text-primary cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Confirm Leave Collab Inline */}
                          {confirmLeaveId === cp.id && (
                            <div className="p-2 bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/30 rounded-[var(--radius-sm)] flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-150">
                              <span className="text-[var(--color-danger)] font-medium text-[11px]">
                                Xác nhận rời khỏi dự án nhóm?
                              </span>
                              <div className="flex items-center touch-gap gap-1.5">
                                <button
                                  onClick={() => {
                                    onLeaveCollabProject?.(cp);
                                    setConfirmLeaveId(null);
                                  }}
                                  className="touch-target-h px-2.5 py-0.5 bg-[var(--color-danger)] text-white text-[10px] font-semibold rounded-[var(--radius-xs)] hover:opacity-90 cursor-pointer"
                                >
                                  Rời dự án
                                </button>
                                <button
                                  onClick={() => setConfirmLeaveId(null)}
                                  className="touch-target-h px-2.5 py-0.5 bg-elevated text-secondary text-[10px] rounded-[var(--radius-xs)] hover:text-primary cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-subtle">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" strokeWidth={1.5} />
                              <span>{formatRelativeTime(cp.updatedAt || cp.createdAt)}</span>
                            </span>
                            <span className="text-[10px] font-medium text-secondary">
                              {getRoleLabel(myRole)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ===================================================== */}
            {/* SECTION 2: CỦA TÔI (PERSONAL PROJECTS)                 */}
            {/* ===================================================== */}
            <section className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  <FolderGit2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span>Của tôi ({filteredPersonal.length})</span>
                </div>
              </div>

              {filteredPersonal.length === 0 ? (
                <div className="p-3 rounded-[var(--radius-md)] border border-dashed border-default bg-panel/50 text-[11px] text-muted text-center">
                  Không có dự án cá nhân nào.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPersonal.map((p) => {
                    const isActive = !activeCollabProjectId && p.id === activeProjectId;
                    const menuKey = `personal:${p.id}`;
                    const isMenuOpen = menuOpenKey === menuKey;
                    const isEditing = editingKey === menuKey;
                    const projectLanguages =
                      p.languages && p.languages.length > 0 ? p.languages : ['html', 'css', 'js'];

                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-[var(--radius-md)] border transition-all flex flex-col gap-2 relative ${
                          isActive
                            ? 'bg-accent-soft border-[var(--accent-base)]/40 shadow-xs'
                            : 'bg-elevated border-default hover:border-strong'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <input
                                type="text"
                                enterKeyHint="done"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRenamePersonal(p.id);
                                  if (e.key === 'Escape') setEditingKey(null);
                                }}
                                autoFocus
                                maxLength={60}
                                className="flex-1 min-w-0 h-10 sm:h-7 px-2 text-xs bg-panel border border-[var(--accent-base)] rounded-[var(--radius-xs)] text-primary outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRenamePersonal(p.id)}
                                className="touch-target p-1 text-[var(--color-success)] hover:bg-[var(--border-subtle)] rounded-[var(--radius-xs)] cursor-pointer flex items-center justify-center"
                                aria-label="Lưu tên"
                              >
                                <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectProject(p);
                                    onClose();
                                  }}
                                  className="touch-target-h text-xs font-semibold text-primary hover:text-accent truncate text-left transition-colors cursor-pointer min-w-0"
                                  title={p.title}
                                >
                                  {p.title}
                                </button>
                                {isActive && (
                                  <Badge variant="accent" size="sm">
                                    Đang mở
                                  </Badge>
                                )}
                                {p.isShared && (
                                  <span
                                    title="Đang chia sẻ công khai"
                                    className="text-[var(--color-success)]"
                                  >
                                    <Globe className="w-3 h-3" strokeWidth={1.5} />
                                  </span>
                                )}
                              </div>

                              <p
                                className="text-[11px] text-secondary truncate mt-0.5"
                                title={p.description ? p.description : 'Chưa có mô tả'}
                              >
                                {p.description || (
                                  <span className="text-muted italic">Không có mô tả</span>
                                )}
                              </p>

                              <div className="flex items-center gap-1 mt-1.5">
                                {projectLanguages.map((lang) => (
                                  <span
                                    key={lang}
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border select-none ${
                                      lang === 'html'
                                        ? 'bg-accent-soft text-accent border-[var(--accent-base)]/30'
                                        : lang === 'css'
                                        ? 'bg-[var(--accent-2)]/10 text-[var(--accent-2)] border-[var(--accent-2)]/30'
                                        : 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/30'
                                    }`}
                                  >
                                    {lang.toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 3-dots menu for personal project */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <div className="relative" ref={isMenuOpen ? menuRef : undefined}>
                              <button
                                type="button"
                                onClick={() => setMenuOpenKey(isMenuOpen ? null : menuKey)}
                                className="touch-target p-1 text-muted hover:text-primary rounded-[var(--radius-xs)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer flex items-center justify-center"
                                aria-label="Tùy chọn dự án"
                              >
                                <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 top-9 z-30 min-w-44 py-1 bg-elevated border border-default rounded-[var(--radius-sm)] shadow-[var(--shadow-overlay)] text-xs animate-in fade-in zoom-in-95 duration-150">
                                  {onConvertToCollab && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onConvertToCollab(p);
                                        setMenuOpenKey(null);
                                      }}
                                      className="touch-target-h w-full px-3 py-1.5 text-left text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <ArrowRightLeft className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                                      <span>Chuyển thành dự án nhóm</span>
                                    </button>
                                  )}

                                  {onEditProject && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onEditProject(p);
                                        setMenuOpenKey(null);
                                      }}
                                      className="touch-target-h w-full px-3 py-1.5 text-left text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <FileEdit className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                                      <span>Chỉnh sửa thông tin</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      startRenamePersonal(p);
                                      setMenuOpenKey(null);
                                    }}
                                    className="touch-target-h w-full px-3 py-1.5 text-left text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                                    <span>Đổi tên</span>
                                  </button>

                                  <div className="my-1 border-t border-subtle" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmDeleteKey(menuKey);
                                      setMenuOpenKey(null);
                                    }}
                                    className="touch-target-h w-full px-3 py-1.5 text-left text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-[var(--color-danger)]" strokeWidth={1.5} />
                                    <span>Xóa dự án</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {confirmDeleteKey === menuKey && (
                          <div className="p-2 bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/30 rounded-[var(--radius-sm)] flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-150">
                            <span className="text-[var(--color-danger)] font-medium text-[11px]">
                              Xác nhận xóa dự án này?
                            </span>
                            <div className="flex items-center touch-gap gap-1.5">
                              <button
                                onClick={() => {
                                  onDeleteProject(p.id);
                                  setConfirmDeleteKey(null);
                                }}
                                className="touch-target-h px-2.5 py-0.5 bg-[var(--color-danger)] text-white text-[10px] font-semibold rounded-[var(--radius-xs)] hover:opacity-90 cursor-pointer"
                              >
                                Xóa
                              </button>
                              <button
                                onClick={() => setConfirmDeleteKey(null)}
                                className="touch-target-h px-2.5 py-0.5 bg-elevated text-secondary text-[10px] rounded-[var(--radius-xs)] hover:text-primary cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-subtle">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            <span>{formatRelativeTime(p.updatedAt || p.createdAt)}</span>
                          </span>
                          {!isActive && (
                            <button
                              onClick={() => {
                                onSelectProject(p);
                                onClose();
                              }}
                              className="touch-target-h px-1 text-accent hover:underline font-medium cursor-pointer"
                            >
                              Mở dự án
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </Drawer>
  );
};
