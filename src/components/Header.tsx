import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Save,
  Share2,
  FolderGit2,
  MoreHorizontal,
  Rows,
  Columns,
  Sun,
  Moon,
  Copy,
  Download,
  Trash2,
  Code2,
  Sparkles,
  Check,
  Edit3,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  GitFork,
  Globe,
  ArrowLeft,
  GraduationCap,
  FileCode2,
  Wand2,
  Palette,
  Search,
  Cloud,
  Users,
  Lock
} from 'lucide-react';
import {
  LayoutMode,
  ThemeMode,
  CodeTemplate,
  CloudSaveStatus,
  WorkspacePreset,
  CollabRole,
  CollabSyncState,
  CollabProject,
  CollabInviteRole,
  PresenceUser,
} from '../types';
import { CODE_TEMPLATES } from '../constants/templates';
import { SaveStatus } from './SaveStatus';
import { useAuth } from '../contexts/AuthContext';
import { ProfileModal } from './ProfileModal';
import { PresenceAvatarStack } from './collab/PresenceAvatarStack';
import { PeoplePanel } from './collab/PeoplePanel';
import { SegmentedControl } from './ui/SegmentedControl';
import { IconButton } from './ui/IconButton';
import { Button } from './ui/Button';
import { Kbd } from './ui/Kbd';
import { useIsTouch } from '../hooks/useViewport';

export interface HeaderProps {
  onRun: () => void;
  onClear: () => void;
  onCopy: () => void;
  onOpenDownload: () => void;
  onFormatCode?: () => void;
  layout: LayoutMode;
  onToggleLayout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectTemplate: (template: CodeTemplate) => void;
  isCopied: boolean;
  isCodeEmpty?: boolean;
  activeTemplateId?: string;

  // Workspace layout presets
  activePreset?: WorkspacePreset;
  onSetWorkspacePreset?: (preset: WorkspacePreset) => void;

  // Navigation (Editor vs Learning Hub)
  activeView?: 'editor' | 'learn';
  onViewChange?: (view: 'editor' | 'learn') => void;
  onOpenLearn?: () => void;

  // Personalization & Command palette
  onOpenPersonalize?: () => void;
  onOpenCommandPalette?: () => void;

  // Cloud / Project / Auth props
  currentProjectTitle: string;
  currentProjectDescription?: string;
  onUpdateProjectTitle: (newTitle: string) => void;
  onManualSave: () => void;
  cloudSaveStatus: CloudSaveStatus;
  hasUnsavedChanges?: boolean;
  onOpenProjects: () => void;
  projectCount: number;
  onOpenAuth: (mode: 'login' | 'signup') => void;

  // Share props
  isProjectShared?: boolean;
  onOpenShare?: () => void;
  isSharedView?: boolean;
  sharedAuthorEmail?: string;
  onForkProject?: () => void;
  onExitSharedView?: () => void;

  // Cloud Diagnostics
  onOpenCloudDiagnostic?: () => void;

  // Collaborative team project props
  isCollabProject?: boolean;
  collabRole?: CollabRole;
  collabMemberCount?: number;
  collabSyncState?: CollabSyncState;
  canEditTitle?: boolean;
  onOpenCollabInvite?: () => void;
  onOpenCollabMembers?: () => void;
  // Stage 3 & 4 Presence, Privacy & People Panel props
  collabProject?: CollabProject | null;
  onlineUsers?: PresenceUser[];
  followingUid?: string | null;
  onToggleFollow?: (user: PresenceUser) => void;
  onJumpToUser?: (user: PresenceUser) => void;
  onChangeCollabRole?: (targetUid: string, role: CollabInviteRole) => Promise<void>;
  hideRemoteCursors?: boolean;
  onToggleHideRemoteCursors?: () => void;
  hideOwnCursor?: boolean;
  onToggleHideOwnCursor?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRun,
  onClear,
  onCopy,
  onOpenDownload,
  onFormatCode,
  layout,
  onToggleLayout,
  theme,
  onToggleTheme,
  onSelectTemplate,
  isCopied,
  isCodeEmpty = false,
  activeTemplateId,
  activePreset = 'split-horizontal',
  onSetWorkspacePreset,
  activeView = 'editor',
  onViewChange,
  onOpenLearn,
  onOpenPersonalize,
  onOpenCommandPalette,
  currentProjectTitle,
  currentProjectDescription,
  onUpdateProjectTitle,
  onManualSave,
  cloudSaveStatus,
  hasUnsavedChanges = false,
  onOpenProjects,
  projectCount,
  onOpenAuth,
  isProjectShared = false,
  onOpenShare,
  isSharedView = false,
  sharedAuthorEmail,
  onForkProject,
  onExitSharedView,
  onOpenCloudDiagnostic,
  isCollabProject = false,
  collabRole,
  collabMemberCount = 0,
  collabSyncState,
  canEditTitle = true,
  onOpenCollabInvite,
  onOpenCollabMembers,
  collabProject = null,
  onlineUsers = [],
  followingUid = null,
  onToggleFollow,
  onJumpToUser,
  onChangeCollabRole,
  hideRemoteCursors = false,
  onToggleHideRemoteCursors,
  hideOwnCursor = false,
  onToggleHideOwnCursor,
}) => {
  const { currentUser, logout } = useAuth();
  const isTouch = useIsTouch();

  // Dropdown visibility states
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showTemplateSubmenu, setShowTemplateSubmenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPeoplePanel, setShowPeoplePanel] = useState(false);
  const [peoplePanelCoords, setPeoplePanelCoords] = useState<{ top: number; right: number } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Trigger button and menu refs for portal positioning & outside click handling
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const peopleTriggerRef = useRef<HTMLElement | null>(null);

  // Coordinate states for body-portal dropdowns
  const [moreMenuCoords, setMoreMenuCoords] = useState<{ top: number; right: number }>({ top: 48, right: 16 });
  const [userMenuCoords, setUserMenuCoords] = useState<{ top: number; right: number }>({ top: 48, right: 16 });

  // Inline title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentProjectTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(currentProjectTitle);
  }, [currentProjectTitle]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Reset dropdowns on auth or project change
  useEffect(() => {
    setShowUserDropdown(false);
    setShowMoreDropdown(false);
    setShowTemplateSubmenu(false);
    setShowPeoplePanel(false);
  }, [currentUser, collabProject?.id, isCollabProject]);

  // Outside click & escape listeners for portal menus
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        showUserDropdown &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target) &&
        !userBtnRef.current?.contains(target)
      ) {
        setShowUserDropdown(false);
      }
      if (
        showMoreDropdown &&
        moreMenuRef.current &&
        !moreMenuRef.current.contains(target) &&
        !moreBtnRef.current?.contains(target)
      ) {
        setShowMoreDropdown(false);
        setShowTemplateSubmenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUserDropdown) {
          setShowUserDropdown(false);
          userBtnRef.current?.focus();
        }
        if (showMoreDropdown) {
          setShowMoreDropdown(false);
          setShowTemplateSubmenu(false);
          moreBtnRef.current?.focus();
        }
      }
    };

    const handleWindowChange = (e?: Event) => {
      const target = e?.target;
      if (
        target instanceof Node &&
        (moreMenuRef.current?.contains(target) || userMenuRef.current?.contains(target))
      ) {
        return;
      }
      if (showUserDropdown) setShowUserDropdown(false);
      if (showMoreDropdown) {
        setShowMoreDropdown(false);
        setShowTemplateSubmenu(false);
      }
    };

    if (showUserDropdown || showMoreDropdown) {
      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', handleWindowChange);
      window.addEventListener('scroll', handleWindowChange, true);
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [showUserDropdown, showMoreDropdown]);

  const toggleMoreDropdown = () => {
    if (showMoreDropdown) {
      setShowMoreDropdown(false);
      setShowTemplateSubmenu(false);
    } else {
      if (moreBtnRef.current) {
        const rect = moreBtnRef.current.getBoundingClientRect();
        setMoreMenuCoords({
          top: rect.bottom + 6,
          right: Math.max(12, window.innerWidth - rect.right),
        });
      }
      setShowUserDropdown(false);
      setShowPeoplePanel(false);
      setShowMoreDropdown(true);
    }
  };

  const toggleUserDropdown = () => {
    if (showUserDropdown) {
      setShowUserDropdown(false);
    } else {
      if (userBtnRef.current) {
        const rect = userBtnRef.current.getBoundingClientRect();
        setUserMenuCoords({
          top: rect.bottom + 6,
          right: Math.max(12, window.innerWidth - rect.right),
        });
      }
      setShowMoreDropdown(false);
      setShowPeoplePanel(false);
      setShowUserDropdown(true);
    }
  };

  const handleTogglePeoplePanel = (anchorEl: HTMLElement) => {
    peopleTriggerRef.current = anchorEl;
    if (showPeoplePanel) {
      setShowPeoplePanel(false);
      return;
    }
    const rect = anchorEl.getBoundingClientRect();
    setPeoplePanelCoords({
      top: rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
    });
    setShowMoreDropdown(false);
    setShowUserDropdown(false);
    setShowPeoplePanel(true);
  };

  const handleFinishEditingTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== currentProjectTitle) {
      onUpdateProjectTitle(trimmed);
    } else {
      setTitleInput(currentProjectTitle);
    }
    setIsEditingTitle(false);
  };

  const handleNavClick = (view: 'editor' | 'learn') => {
    if (onViewChange) {
      onViewChange(view);
    } else if (view === 'learn' && onOpenLearn) {
      onOpenLearn();
    }
  };

  return (
    <>
      {/* Slim Top Bar: 48px on desktop, safe-area & touch-aware on mobile */}
      <header className="pt-safe pl-[max(0.5rem,var(--safe-left))] pr-[max(0.5rem,var(--safe-right))] sm:pl-[max(1rem,var(--safe-left))] sm:pr-[max(1rem,var(--safe-right))] min-h-[calc(48px+var(--safe-top))] bg-elevated glass-panel border-b border-subtle text-primary flex items-center justify-between gap-1.5 sm:gap-3 select-none z-30 whitespace-nowrap overflow-x-hidden">
        {/* ========================================================= */}
        {/* ZONE 1: LEFT - Brand Logo & View Switcher                 */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-accent text-accent-on flex items-center justify-center shadow-xs">
              <Code2 className="w-4 h-4 text-accent-on" strokeWidth={1.5} />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
              <span className="font-semibold text-xs tracking-tight text-primary">
                Coderlive
              </span>
              <span className="text-[9px] font-mono font-semibold tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-accent-soft text-accent border border-[var(--accent-base)]/25">
                PRO
              </span>
            </div>
          </div>

          {/* View Switcher: Segmented Control */}
          {!isSharedView && (
            <div className="hidden md:block flex-shrink-0">
              <SegmentedControl
                size="sm"
                value={activeView}
                onChange={(val) => handleNavClick(val as 'editor' | 'learn')}
                options={[
                  {
                    value: 'editor',
                    label: 'Trình soạn thảo',
                    icon: <FileCode2 className="w-3.5 h-3.5" strokeWidth={1.5} />,
                  },
                  {
                    value: 'learn',
                    label: 'Học lập trình',
                    icon: <GraduationCap className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />,
                  },
                ]}
              />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* ZONE 2: CENTER - Project Title & Save Status Chip         */}
        {/* ========================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 justify-start sm:justify-center">
          {isSharedView ? (
            /* Shared View Indicator */
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] bg-accent-soft border border-[var(--accent-base)]/30 text-xs text-primary min-w-0 max-w-full sm:max-w-[280px]">
              <Globe className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.5} />
              <span className="truncate font-medium" title={currentProjectTitle}>
                {currentProjectTitle}
              </span>
              {sharedAuthorEmail && (
                <span className="text-[10px] text-muted hidden sm:inline truncate">
                  ({sharedAuthorEmail})
                </span>
              )}
            </div>
          ) : (
            /* Editable Project Title (or read-only title for non-owner team members) */
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 max-w-full sm:max-w-[240px] md:max-w-[300px] lg:max-w-[360px]">
              {isEditingTitle && canEditTitle ? (
                <div className="flex items-center gap-1 min-w-0 w-full">
                  <input
                    ref={titleInputRef}
                    type="text"
                    enterKeyHint="done"
                    autoComplete="off"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleFinishEditingTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFinishEditingTitle();
                      if (e.key === 'Escape') {
                        setTitleInput(currentProjectTitle);
                        setIsEditingTitle(false);
                      }
                    }}
                    maxLength={60}
                    className="px-2 py-0.5 h-6.5 bg-panel border border-[var(--accent-base)] rounded-[var(--radius-xs)] text-xs font-medium text-primary focus:outline-none w-full"
                  />
                  <button
                    onMouseDown={handleFinishEditingTitle}
                    className="touch-target inline-flex items-center justify-center p-1 text-[var(--color-success)] hover:opacity-80 flex-shrink-0"
                    title={isTouch ? undefined : 'Lưu tên dự án'}
                    aria-label="Lưu tên dự án"
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ) : canEditTitle ? (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  title={
                    isTouch
                      ? undefined
                      : currentProjectDescription
                      ? `${currentProjectTitle} • ${currentProjectDescription} (Nhấp để đổi tên)`
                      : `Nhấp để đổi tên: ${currentProjectTitle}`
                  }
                  aria-label={`Tên dự án: ${currentProjectTitle}. Nhấn để đổi tên`}
                  className="touch-target-h flex items-center gap-1.5 px-2 py-1 h-6.5 rounded-[var(--radius-xs)] hover:bg-[var(--border-subtle)] text-left text-xs font-medium text-primary transition-colors group/edit min-w-0 outline-none cursor-pointer"
                >
                  <span className="truncate">{currentProjectTitle}</span>
                  <Edit3 className="w-3 h-3 text-muted group-hover/edit:text-accent flex-shrink-0" strokeWidth={1.5} />
                </button>
              ) : (
                <div
                  title="Chỉ chủ sở hữu mới có thể đổi tên dự án nhóm"
                  className="flex items-center gap-1.5 px-2 py-1 h-6.5 rounded-[var(--radius-xs)] text-xs font-medium text-primary min-w-0"
                >
                  <span className="truncate">{currentProjectTitle}</span>
                </div>
              )}

              {/* Team badge + members/invite quick buttons */}
              {isCollabProject && (
                <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={onOpenCollabMembers}
                    title={isTouch ? undefined : 'Xem & quản lý thành viên dự án nhóm'}
                    className="touch-target-h inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-[var(--accent-base)]/30 font-medium hover:opacity-90 cursor-pointer"
                  >
                    <Users className="w-2.5 h-2.5" strokeWidth={1.5} />
                    <span>Nhóm • {collabMemberCount}</span>
                  </button>

                  {collabRole === 'owner' && onOpenCollabInvite && (
                    <button
                      type="button"
                      onClick={onOpenCollabInvite}
                      title={isTouch ? undefined : 'Mời thành viên tham gia dự án nhóm'}
                      className="touch-target-h inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-panel text-primary border border-default font-medium hover:border-[var(--accent-base)] cursor-pointer"
                    >
                      <UserPlus className="w-2.5 h-2.5 text-accent" strokeWidth={1.5} />
                      <span>Mời</span>
                    </button>
                  )}

                  {collabRole === 'viewer' && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-warning-soft text-warning border border-[var(--color-warning)]/30 font-medium"
                      title="Bạn đang ở chế độ chỉ xem trong dự án nhóm này"
                    >
                      <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
                      <span>Chế độ chỉ xem</span>
                    </span>
                  )}
                </div>
              )}

              {/* Share badge: strictly when isProjectShared === true */}
              {!isCollabProject && isProjectShared === true && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/30 flex-shrink-0 font-medium"
                  title="Dự án này đang được chia sẻ công khai"
                >
                  <Globe className="w-2.5 h-2.5" strokeWidth={1.5} />
                  <span>Đang chia sẻ</span>
                </span>
              )}
            </div>
          )}

          {/* Compact Save Status */}
          {!isSharedView && (
            <SaveStatus
              status={cloudSaveStatus}
              isLoggedIn={!!currentUser}
              hasUnsavedChanges={hasUnsavedChanges}
              onLoginClick={() => onOpenAuth('login')}
              isCollab={isCollabProject}
              collabSyncState={collabSyncState}
            />
          )}
        </div>

        {/* ========================================================= */}
        {/* ZONE 3: RIGHT - Actions: Chạy, Lưu, Palette, Thêm, Avatar */}
        {/* ========================================================= */}
        <div className="touch-gap flex items-center gap-1.5 flex-shrink-0">
          {isSharedView ? (
            /* Shared View Actions: Fork & Exit */
            <>
              <button
                onClick={onForkProject}
                className="touch-target h-7 px-3 text-xs font-medium text-accent-on bg-accent hover:bg-[var(--accent-hover)] rounded-[var(--radius-sm)] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title={isTouch ? undefined : 'Sao chép toàn bộ mã nguồn về tài khoản của bạn để chỉnh sửa'}
                aria-label="Sao chép về tài khoản của bạn"
              >
                <GitFork className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Sao chép (Fork)</span>
                <span className="sm:hidden">Fork</span>
              </button>

              {onExitSharedView && (
                <button
                  onClick={onExitSharedView}
                  className="touch-target h-7 px-2.5 text-xs font-medium text-secondary hover:text-primary bg-elevated border border-default rounded-[var(--radius-sm)] transition-all flex items-center gap-1 cursor-pointer"
                  title={isTouch ? undefined : 'Quay lại trình soạn thảo chính'}
                  aria-label="Quay lại trình soạn thảo chính"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Quay lại</span>
                </button>
              )}
            </>
          ) : (
            /* Normal Actions */
            <>
              {/* Command Palette Button */}
              {onOpenCommandPalette && (
                <button
                  onClick={onOpenCommandPalette}
                  className="touch-target hidden md:flex items-center gap-1.5 h-7 px-2 rounded-[var(--radius-sm)] bg-[var(--border-subtle)] hover:bg-[var(--border-default)] border border-default text-muted hover:text-primary text-[11px] transition-colors cursor-pointer"
                  title={isTouch ? undefined : 'Mở Bảng lệnh (Ctrl+K)'}
                  aria-label="Mở Bảng lệnh"
                >
                  <Search className="w-3 h-3" strokeWidth={1.5} />
                  <span className="hidden lg:inline">Tìm kiếm...</span>
                  <Kbd className="h-4 text-[9px] px-1">⌘K</Kbd>
                </button>
              )}

              {/* 1. Primary Action: "Chạy" (Success green) */}
              <button
                onClick={onRun}
                className="touch-target h-7 px-2.5 sm:px-3 text-xs font-medium text-white bg-success hover:opacity-90 active:opacity-100 rounded-[var(--radius-sm)] shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.97] cursor-pointer flex-shrink-0"
                title={isTouch ? undefined : 'Chạy lại mã (Phím tắt: Ctrl+Enter)'}
                aria-label="Chạy lại mã"
              >
                <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                <span className="hidden sm:inline">Chạy</span>
              </button>

              {/* 2. Primary Action: "Lưu" (Accent) */}
              <button
                onClick={onManualSave}
                disabled={cloudSaveStatus === 'saving'}
                className="touch-target h-7 px-2.5 sm:px-3 text-xs font-medium text-accent-on bg-accent hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] rounded-[var(--radius-sm)] shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.97] disabled:opacity-50 cursor-pointer flex-shrink-0"
                title={isTouch ? undefined : 'Lưu dự án (Phím tắt: Ctrl+S)'}
                aria-label="Lưu dự án"
              >
                <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Lưu</span>
              </button>

              {/* 3. "Thêm" (⋯) Dropdown Menu */}
              <IconButton
                ref={moreBtnRef}
                size="sm"
                variant="ghost"
                isActive={showMoreDropdown}
                onClick={toggleMoreDropdown}
                tooltip="Tác vụ khác (Mẫu, Sao chép, Tải xuống, Chia sẻ...)"
                aria-label="Tác vụ khác"
              >
                <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
              </IconButton>

              {/* Stage 3: Online Presence Avatar Stack */}
              {isCollabProject && collabProject && onlineUsers.length > 0 && (
                <>
                  <div className="h-4 w-px bg-[var(--border-default)] mx-0.5 hidden sm:block" />
                  <PresenceAvatarStack
                    onlineUsers={onlineUsers}
                    currentUserId={currentUser?.uid || ''}
                    followingUid={followingUid}
                    isPeoplePanelOpen={showPeoplePanel}
                    onTogglePeoplePanel={handleTogglePeoplePanel}
                  />
                </>
              )}

              <div className="h-4 w-px bg-[var(--border-default)] mx-0.5 hidden sm:block" />

              {/* 5. Account Avatar Button */}
              {currentUser ? (
                <button
                  ref={userBtnRef}
                  onClick={toggleUserDropdown}
                  className="touch-target w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--border-subtle)] hover:bg-[var(--border-default)] border border-default flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                  title={isTouch ? undefined : currentUser.displayName || currentUser.email || 'Tài khoản người dùng'}
                  aria-label="Tài khoản người dùng"
                >
                  <div className="w-5 h-5 rounded-full bg-accent text-accent-on flex items-center justify-center text-[10px] font-bold">
                    {currentUser.displayName
                      ? currentUser.displayName.charAt(0).toUpperCase()
                      : currentUser.email
                      ? currentUser.email.charAt(0).toUpperCase()
                      : <UserIcon className="w-3 h-3" strokeWidth={1.5} />}
                  </div>
                </button>
              ) : (
                /* Guest Buttons */
                <div className="touch-gap flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="touch-target h-7 px-2.5 text-xs font-medium text-secondary hover:text-primary hover:bg-[var(--border-subtle)] rounded-[var(--radius-sm)] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    aria-label="Đăng nhập"
                  >
                    <LogIn className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    <span className="hidden sm:inline">Đăng nhập</span>
                  </button>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="touch-target h-7 px-2.5 text-xs font-medium text-accent-on bg-accent hover:bg-[var(--accent-hover)] rounded-[var(--radius-sm)] shadow-xs transition-all hidden sm:flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Đăng ký</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* PORTAL DROPDOWNS (IMMUNE TO HEADER CLIPPING)              */}
      {/* ========================================================= */}

      {/* 1. More ("⋯") Menu Portal */}
      {showMoreDropdown &&
        createPortal(
          <div
            ref={moreMenuRef}
            style={{
              position: 'fixed',
              top: `${moreMenuCoords.top}px`,
              right: `max(${moreMenuCoords.right}px, var(--safe-right))`,
              zIndex: 99999,
            }}
            className="w-60 max-w-[calc(100vw-24px)] max-h-[calc(var(--app-height,100dvh)-72px-var(--safe-bottom))] overflow-y-auto overscroll-contain p-1.5 bg-elevated border border-default rounded-[var(--radius-md)] shadow-[var(--shadow-elevated)] animate-in fade-in zoom-in-95 duration-150 text-xs text-primary select-none"
            role="menu"
          >
            {/* Collab actions or Personal Share Link */}
            {isCollabProject ? (
              <>
                {collabRole === 'owner' && onOpenCollabInvite && (
                  <button
                    onClick={() => {
                      setShowMoreDropdown(false);
                      onOpenCollabInvite();
                    }}
                    className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                    role="menuitem"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    <span>Mời thành viên</span>
                  </button>
                )}
                {onOpenCollabMembers && (
                  <button
                    onClick={() => {
                      setShowMoreDropdown(false);
                      onOpenCollabMembers();
                    }}
                    className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center justify-between transition-colors cursor-pointer"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                      <span>{collabRole === 'owner' ? 'Quản lý thành viên' : 'Thành viên nhóm'}</span>
                    </div>
                    <span className="text-[10px] text-muted font-mono">{collabMemberCount}</span>
                  </button>
                )}
              </>
            ) : (
              currentUser && onOpenShare && (
                <button
                  onClick={() => {
                    setShowMoreDropdown(false);
                    onOpenShare();
                  }}
                  className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center justify-between transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    <span>Chia sẻ dự án</span>
                  </div>
                  {isProjectShared && (
                    <span className="text-[10px] text-[var(--color-success)] font-medium">Đang mở</span>
                  )}
                </button>
              )
            )}

            {/* My Projects */}
            {currentUser && (
              <button
                onClick={() => {
                  setShowMoreDropdown(false);
                  onOpenProjects();
                }}
                className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center justify-between transition-colors cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span>Dự án của tôi</span>
                </div>
                <span className="text-[10px] text-muted font-mono">{projectCount}</span>
              </button>
            )}

            {/* Templates Submenu */}
            <div className="relative">
              <button
                onClick={() => setShowTemplateSubmenu(!showTemplateSubmenu)}
                className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center justify-between transition-colors cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-warning" strokeWidth={1.5} />
                  <span>Mẫu có sẵn</span>
                </div>
                <span className="text-[10px] text-muted font-mono">▸</span>
              </button>

              {showTemplateSubmenu && (
                <div className="p-1 my-1 bg-panel rounded-[var(--radius-sm)] border border-default space-y-0.5">
                  {CODE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => {
                        onSelectTemplate(tmpl);
                        setShowMoreDropdown(false);
                        setShowTemplateSubmenu(false);
                      }}
                      className={`touch-target-h w-full text-left px-2 py-1 rounded-[var(--radius-xs)] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        activeTemplateId === tmpl.id
                          ? 'bg-accent-soft text-accent font-semibold'
                          : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
                      }`}
                    >
                      <span className="truncate">{tmpl.name}</span>
                      <span className="text-[10px] text-muted font-mono ml-2">
                        {tmpl.badge}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile quick links: Learn, Personalize, Command Palette */}
            <div className="md:hidden space-y-0.5 mb-1 pb-1 border-b border-subtle">
              <button
                onClick={() => {
                  setShowMoreDropdown(false);
                  handleNavClick(activeView === 'learn' ? 'editor' : 'learn');
                }}
                className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                role="menuitem"
              >
                <GraduationCap className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <span>{activeView === 'learn' ? 'Quay lại Trình soạn thảo' : 'Học lập trình'}</span>
              </button>
              {onOpenPersonalize && (
                <button
                  onClick={() => {
                    setShowMoreDropdown(false);
                    onOpenPersonalize();
                  }}
                  className="touch-target-h sm:hidden w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <Palette className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span>Cá nhân hóa giao diện</span>
                </button>
              )}
              {onOpenCommandPalette && (
                <button
                  onClick={() => {
                    setShowMoreDropdown(false);
                    onOpenCommandPalette();
                  }}
                  className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <Search className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                  <span>Tìm kiếm lệnh & bài học</span>
                </button>
              )}
            </div>

            {/* Cloud Diagnostic Check */}
            {onOpenCloudDiagnostic && (
              <button
                onClick={() => {
                  setShowMoreDropdown(false);
                  onOpenCloudDiagnostic();
                }}
                className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center justify-between transition-colors cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span>Kiểm tra kết nối đám mây</span>
                </div>
                <span className="text-[10px] text-muted font-mono">Status</span>
              </button>
            )}

            <div className="my-1 border-t border-subtle" />

            {/* Copy code */}
            <button
              type="button"
              disabled={isCodeEmpty}
              title={isCodeEmpty ? 'Chưa có code' : undefined}
              onClick={() => {
                if (isCodeEmpty) return;
                onCopy();
                setShowMoreDropdown(false);
              }}
              className={`touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] flex items-center justify-between transition-colors ${
                isCodeEmpty
                  ? 'text-muted opacity-50 cursor-not-allowed'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)] cursor-pointer'
              }`}
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-[var(--color-success)]" strokeWidth={1.5} />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                )}
                <span>Sao chép toàn bộ mã</span>
              </div>
              <Kbd>Ctrl+Shift+C</Kbd>
            </button>

            {/* Download */}
            <button
              type="button"
              disabled={isCodeEmpty}
              title={isCodeEmpty ? 'Chưa có code' : undefined}
              onClick={() => {
                if (isCodeEmpty) return;
                onOpenDownload();
                setShowMoreDropdown(false);
              }}
              className={`touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] flex items-center justify-between transition-colors ${
                isCodeEmpty
                  ? 'text-muted opacity-50 cursor-not-allowed'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)] cursor-pointer'
              }`}
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
                <span>Tải xuống (.html/.htm)</span>
              </div>
            </button>

            {/* Format code */}
            {onFormatCode && (
              <button
                onClick={() => {
                  onFormatCode();
                  setShowMoreDropdown(false);
                }}
                className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center justify-between transition-colors cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <Wand2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span>Định dạng mã nguồn</span>
                </div>
                <Kbd>Alt+Shift+F</Kbd>
              </button>
            )}

            <div className="my-1 border-t border-subtle" />

            {/* Workspace Presets Submenu */}
            {onSetWorkspacePreset && (
              <div className="space-y-0.5">
                <div className="px-2 py-0.5 text-[10px] font-semibold text-muted uppercase tracking-wider">
                  Bố cục khung làm việc
                </div>
                <button
                  onClick={() => {
                    onSetWorkspacePreset('split-horizontal');
                    setShowMoreDropdown(false);
                  }}
                  className={`touch-target-h w-full text-left px-2.5 py-1 rounded-[var(--radius-xs)] flex items-center justify-between cursor-pointer ${
                    activePreset === 'split-horizontal' ? 'bg-accent-soft text-accent font-medium' : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Columns className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Chia đôi (Trái / Phải)</span>
                  </div>
                  {activePreset === 'split-horizontal' && <Check className="w-3 h-3" strokeWidth={2} />}
                </button>
                <button
                  onClick={() => {
                    onSetWorkspacePreset('split-vertical');
                    setShowMoreDropdown(false);
                  }}
                  className={`touch-target-h w-full text-left px-2.5 py-1 rounded-[var(--radius-xs)] flex items-center justify-between cursor-pointer ${
                    activePreset === 'split-vertical' ? 'bg-accent-soft text-accent font-medium' : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Rows className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Chia dọc (Trên / Dưới)</span>
                  </div>
                  {activePreset === 'split-vertical' && <Check className="w-3 h-3" strokeWidth={2} />}
                </button>
              </div>
            )}

            <div className="my-1 border-t border-subtle" />

            {/* Toggle Theme */}
            <button
              onClick={() => {
                onToggleTheme();
                setShowMoreDropdown(false);
              }}
              className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center justify-between transition-colors cursor-pointer"
              role="menuitem"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-warning" strokeWidth={1.5} />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                )}
                <span>Giao diện {theme === 'dark' ? 'Sáng' : 'Tối'}</span>
              </div>
              <Kbd>Ctrl+Shift+L</Kbd>
            </button>

            {/* Clear all */}
            <button
              onClick={() => {
                onClear();
                setShowMoreDropdown(false);
              }}
              className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] flex items-center gap-2 transition-colors cursor-pointer"
              role="menuitem"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Xóa trắng mã nguồn...</span>
            </button>
          </div>,
          document.body
        )}

      {/* 2. User Avatar Dropdown Portal */}
      {showUserDropdown &&
        currentUser &&
        createPortal(
          <div
            ref={userMenuRef}
            style={{
              position: 'fixed',
              top: `${userMenuCoords.top}px`,
              right: `max(${userMenuCoords.right}px, var(--safe-right))`,
              zIndex: 99999,
            }}
            className="w-60 max-w-[calc(100vw-24px)] max-h-[calc(var(--app-height,100dvh)-72px-var(--safe-bottom))] overflow-y-auto overscroll-contain p-1.5 bg-elevated border border-default rounded-[var(--radius-md)] shadow-[var(--shadow-elevated)] animate-in fade-in zoom-in-95 duration-150 text-xs text-primary select-none"
            role="menu"
          >
            {/* Header info */}
            <div className="px-2.5 py-2 border-b border-subtle">
              {currentUser.displayName ? (
                <>
                  <p className="text-xs font-semibold text-primary truncate">{currentUser.displayName}</p>
                  <p className="text-[11px] text-muted font-mono truncate mt-0.5" title={currentUser.email || ''}>
                    {currentUser.email}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] text-muted font-medium">Đang đăng nhập:</p>
                  <p className="text-xs font-semibold text-primary truncate mt-0.5" title={currentUser.email || ''}>
                    {currentUser.email}
                  </p>
                </>
              )}
            </div>

            <div className="py-1 space-y-0.5">
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  setIsProfileOpen(true);
                }}
                className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                role="menuitem"
              >
                <UserIcon className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <span>Thông tin hồ sơ</span>
              </button>

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onOpenProjects();
                }}
                className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                role="menuitem"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                <span>Dự án của tôi ({projectCount})</span>
              </button>

              {onOpenCloudDiagnostic && (
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenCloudDiagnostic();
                  }}
                  className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <Cloud className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <span>Kiểm tra kết nối đám mây</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  logout();
                }}
                className="touch-target-h w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] flex items-center gap-2 transition-colors cursor-pointer"
                role="menuitem"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* People Panel Popover (Stage 3 & 4 Presence) */}
      {isCollabProject && collabProject && (
        <PeoplePanel
          isOpen={showPeoplePanel}
          anchorRect={peoplePanelCoords}
          returnFocusToRef={peopleTriggerRef}
          onClose={() => setShowPeoplePanel(false)}
          project={collabProject}
          currentUserId={currentUser?.uid || ''}
          onlineUsers={onlineUsers}
          followingUid={followingUid}
          onToggleFollow={(u) => onToggleFollow?.(u)}
          onJumpToUser={(u) => onJumpToUser?.(u)}
          onChangeRole={onChangeCollabRole}
          onOpenInvite={onOpenCollabInvite}
          onOpenMemberManagement={onOpenCollabMembers}
          hideRemoteCursors={hideRemoteCursors}
          onToggleHideRemoteCursors={onToggleHideRemoteCursors}
          hideOwnCursor={hideOwnCursor}
          onToggleHideOwnCursor={onToggleHideOwnCursor}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
