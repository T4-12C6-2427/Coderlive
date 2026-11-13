/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  ShieldCheck,
  EyeOff,
  X,
} from 'lucide-react';
import { Header } from './components/Header';
import { EditorPane } from './components/EditorPane';
import { PreviewPane } from './components/PreviewPane';
import { Resizer } from './components/Resizer';
import { ConfirmModal } from './components/ConfirmModal';
import { AuthModal } from './components/AuthModal';
import { ProjectsPanel } from './components/ProjectsPanel';
import { DownloadModal } from './components/DownloadModal';
import { GuestPromptModal } from './components/GuestPromptModal';
import { ShareModal } from './components/ShareModal';
import { ProjectModal, ProjectFormData } from './components/ProjectModal';
import { LearnPage } from './components/learn/LearnPage';
import { ActivityBar } from './components/ActivityBar';
import { CommandPalette } from './components/CommandPalette';
import { TemplatesDrawer } from './components/TemplatesDrawer';
import { PersonalizationDrawer } from './components/PersonalizationDrawer';
import { TokenInspectorModal } from './components/TokenInspectorModal';
import { CloudDiagnosticModal } from './components/CloudDiagnosticModal';
import { InviteMemberModal } from './components/collab/InviteMemberModal';
import { MemberManagementModal } from './components/collab/MemberManagementModal';
import { CollabChatStrip } from './components/collab/CollabChatStrip';
import { BackgroundLayer } from './components/background/BackgroundLayer';
import { useTheme } from './contexts/ThemeContext';
import { Kbd } from './components/ui/Kbd';
import { Toast } from './components/ui/Feedback';
import { useVisualViewport } from './hooks/useViewport';
import {
  LayoutMode,
  ThemeMode,
  DeviceMode,
  ConsoleMessage,
  StaticIssue,
  CodeTemplate,
  Project,
  CloudSaveStatus,
  EditorTab,
  WorkspacePreset,
  CollabProject,
  CollabInviteRole,
  CollabSyncState,
  PresenceSession,
  PresenceUser,
  RemoteInsertFlash,
  CollabLineComment,
  CollabChatMessage,
  CollabPreviewSyncState,
} from './types';
import {
  DEFAULT_HTML_PART,
  DEFAULT_CSS_PART,
  DEFAULT_JS_PART,
} from './constants/templates';
import { useAuth } from './contexts/AuthContext';
import {
  getUserProjects,
  getGuestProjects,
  saveProject,
  updateProject,
  deleteProject,
  getSharedProject,
  toggleShareProject,
  forkProject,
} from './services/projectService';
import {
  createCollabProject,
  convertPersonalToCollabProject,
  subscribeUserCollabProjects,
  subscribeCollabProject,
  updateCollabProjectMeta,
  updateCollabInviteSettings,
  joinCollabProjectByInvite,
  changeCollabMemberRole,
  removeCollabMember,
  transferCollabOwnership,
  leaveCollabProject,
  deleteCollabProject,
  syncCollabPresenceMeta,
  savePendingCollabInvite,
  getPendingCollabInvite,
  clearPendingCollabInvite,
} from './services/collabProjectService';
import {
  subscribeCollabComments,
  addCollabLineComment,
  replyCollabLineComment,
  toggleResolveCollabComment,
  deleteCollabLineComment,
  subscribeCollabMessages,
  sendCollabMessage,
  deleteCollabMessage,
  subscribeCollabPreviewSync,
  publishCollabPreviewSync,
} from './services/collabSideService';
import { CollabProvider } from './lib/CollabProvider';
import { PresenceManager, PresenceJoinLeaveNotice } from './lib/PresenceManager';
import { getPresenceDisplayName, getUserPresenceColor } from './lib/presenceIdentity';
import { testConnection, isFirebaseConfigValid, firebaseConfigError, rtdb } from './lib/firebase';
import { combineCode, compilePreviewDocument, migrateProjectCode } from './lib/codeCompiler';
import { runStaticChecks } from './lib/staticLinter';

const STORAGE_KEYS = {
  TABS_CODE: 'htmlive_code_tabs_v2',
  LEGACY_CODE: 'htmlive_code_content_v1',
  LAYOUT: 'htmlive_layout_mode_v1',
  THEME: 'htmlive_theme_mode_v1',
  SPLIT_RATIO: 'htmlive_split_ratio_v1',
  LAST_PROJECT_PREFIX: 'htmlive_last_project_',
  WORKSPACE_PRESET: 'htmlive_workspace_preset_v1',
  ACTIVITY_BAR: 'htmlive_activity_bar_visible_v1',
  COLLAB_PRIVACY_NOTICE_SEEN: 'htmlive_collab_privacy_notice_seen_v1',
};

export default function App() {
  const viewport = useVisualViewport();
  const isSplitDesktop = viewport.width >= 768;
  const { currentUser, loading: authLoading } = useAuth();
  const { settings, updateSettings, toggleThemeMode } = useTheme();
  const theme = settings.mode;
  const handleToggleTheme = toggleThemeMode;

  const hideRemoteCursors = Boolean(settings.collabHideRemoteCursors);
  const hideOwnCursor = Boolean(settings.collabHideOwnCursor);
  const chatSoundEnabled = Boolean(settings.collabChatSound);

  // Layout mode: horizontal or vertical
  const [layout, setLayout] = useState<LayoutMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAYOUT);
    return saved === 'vertical' ? 'vertical' : 'horizontal';
  });

  // Active Editor Tab ('html' | 'css' | 'js')
  const [activeTab, setActiveTab] = useState<EditorTab>('html');

  // Code state: HTML, CSS, JS
  const [htmlCode, setHtmlCode] = useState<string>(() => {
    const savedTabs = localStorage.getItem(STORAGE_KEYS.TABS_CODE);
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        if (parsed.htmlCode !== undefined) return parsed.htmlCode;
      } catch {}
    }
    // Check legacy migration
    const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_CODE);
    if (legacy) return legacy;
    return DEFAULT_HTML_PART;
  });

  const [cssCode, setCssCode] = useState<string>(() => {
    const savedTabs = localStorage.getItem(STORAGE_KEYS.TABS_CODE);
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        if (parsed.cssCode !== undefined) return parsed.cssCode;
      } catch {}
    }
    // If legacy code exists, leave CSS empty so legacy works in HTML tab
    const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_CODE);
    if (legacy) return '';
    return DEFAULT_CSS_PART;
  });

  const [jsCode, setJsCode] = useState<string>(() => {
    const savedTabs = localStorage.getItem(STORAGE_KEYS.TABS_CODE);
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        if (parsed.jsCode !== undefined) return parsed.jsCode;
      } catch {}
    }
    // If legacy code exists, leave JS empty so legacy works in HTML tab
    const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_CODE);
    if (legacy) return '';
    return DEFAULT_JS_PART;
  });

  // Debounced snapshot cho sandbox preview iframe + source map + channel token
  const [previewSnapshot, setPreviewSnapshot] = useState<{
    html: string;
    css: string;
    js: string;
  }>(() => ({ html: htmlCode, css: cssCode, js: jsCode }));
  const lastCompiledCodesRef = useRef<{ html: string; css: string; js: string }>({
    html: htmlCode,
    css: cssCode,
    js: jsCode,
  });
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const compiledPreview = useMemo(() => {
    const token = `ch_${refreshTrigger}_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const compiled = compilePreviewDocument(
      previewSnapshot.html,
      previewSnapshot.css,
      previewSnapshot.js,
      token
    );
    return {
      token,
      ...compiled,
    };
  }, [previewSnapshot, refreshTrigger]);

  const updatePreviewSnapshot = useCallback(
    (html: string, css: string, js: string, clearErrors = true) => {
      lastCompiledCodesRef.current = { html, css, js };
      if (clearErrors) {
        setConsoleMessages([]);
      }
      setPreviewSnapshot({ html, css, js });
    },
    []
  );

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | undefined>('welcome');

  // Split ratio for resizer
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPLIT_RATIO);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val >= 0.15 && val <= 0.85) return val;
    }
    return 0.5;
  });

  // Project and Cloud Persistence States
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [collabProjects, setCollabProjects] = useState<CollabProject[]>([]);
  const [activeCollabProject, setActiveCollabProject] = useState<CollabProject | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('Trang Chào Mừng');
  const [cloudSaveStatus, setCloudSaveStatus] = useState<CloudSaveStatus>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(false);
  const [projectsLoadError, setProjectsLoadError] = useState<string | null>(null);

  // Collaborative Team Modals & Flows
  const [defaultNewProjectType, setDefaultNewProjectType] = useState<'personal' | 'collab'>('personal');
  const [editingCollabProject, setEditingCollabProject] = useState<CollabProject | null>(null);
  const [inviteModalProjectId, setInviteModalProjectId] = useState<string | null>(null);
  const [membersModalProjectId, setMembersModalProjectId] = useState<string | null>(null);
  const [pendingRemovePersonalAfterConvert, setPendingRemovePersonalAfterConvert] = useState<Project | null>(null);
  const [collabProviderInstance, setCollabProviderInstance] = useState<CollabProvider | null>(null);
  const [collabSyncState, setCollabSyncState] = useState<CollabSyncState>('connecting');
  const [collabDocReady, setCollabDocReady] = useState<boolean>(false);

  // Stage 3 Real-time Presence & Follow Mode State
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [remoteSessions, setRemoteSessions] = useState<PresenceSession[]>([]);
  const [isPresenceConnected, setIsPresenceConnected] = useState<boolean>(true);
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [followingUid, setFollowingUid] = useState<string | null>(null);
  const [jumpTarget, setJumpTarget] = useState<{ uid: string; tab: EditorTab; nonce: number } | null>(null);
  const [remoteInsertFlashes, setRemoteInsertFlashes] = useState<RemoteInsertFlash[]>([]);
  const presenceManagerRef = useRef<PresenceManager | null>(null);
  const remoteSessionsRef = useRef<PresenceSession[]>([]);
  const highlightInsertsRef = useRef<boolean>(settings.collabHighlightInserts !== false);
  highlightInsertsRef.current = settings.collabHighlightInserts !== false;

  // Stage 4 Side Features & Privacy State
  const [collabLineComments, setCollabLineComments] = useState<CollabLineComment[]>([]);
  const [collabChatMessages, setCollabChatMessages] = useState<CollabChatMessage[]>([]);
  const [syncPreviewEnabled, setSyncPreviewEnabled] = useState<boolean>(false);
  const [syncedPreviewState, setSyncedPreviewState] = useState<CollabPreviewSyncState | null>(null);
  const [showCollabPrivacyNotice, setShowCollabPrivacyNotice] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.COLLAB_PRIVACY_NOTICE_SEEN) !== '1';
    } catch {
      return false;
    }
  });

  // Shared Link Mode States
  const [isSharedView, setIsSharedView] = useState<boolean>(false);
  const [sharedProjectData, setSharedProjectData] = useState<Project | null>(null);
  const [sharedAuthorEmail, setSharedAuthorEmail] = useState<string | undefined>(undefined);

  // Modals & Panels
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');
  const [isProjectsPanelOpen, setIsProjectsPanelOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [isCloudDiagnosticOpen, setIsCloudDiagnosticOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'code' | 'preview'>('code');

  // Stage 1 Test Background Pattern
  const [isTestPatternActive, setIsTestPatternActive] = useState<boolean>(false);
  const testPatternTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTriggerTestPattern = useCallback(() => {
    setIsTestPatternActive(true);
    if (testPatternTimeoutRef.current) clearTimeout(testPatternTimeoutRef.current);
    testPatternTimeoutRef.current = setTimeout(() => {
      setIsTestPatternActive(false);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (testPatternTimeoutRef.current) clearTimeout(testPatternTimeoutRef.current);
    };
  }, []);

  // Active Languages for Tabs ('html' | 'css' | 'js')
  const [activeLanguages, setActiveLanguages] = useState<('html' | 'css' | 'js')[]>(['html', 'css', 'js']);

  // Project Modal State (Create & Edit)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Tab removal confirmation state
  const [isConfirmRemoveTabOpen, setIsConfirmRemoveTabOpen] = useState<boolean>(false);
  const [pendingRemoveLang, setPendingRemoveLang] = useState<'css' | 'js' | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'danger'>('success');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>(undefined);
  const toastActionCallbackRef = useRef<(() => void) | undefined>(undefined);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback(
    (
      msg: string,
      type: 'success' | 'info' | 'warning' | 'danger' = 'success',
      options?: { durationMs?: number; actionLabel?: string; onAction?: () => void }
    ) => {
      setToastMessage(msg);
      setToastType(type);
      setToastActionLabel(options?.actionLabel);
      toastActionCallbackRef.current = options?.onAction;
      setIsToastVisible(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setIsToastVisible(false);
        setToastActionLabel(undefined);
        toastActionCallbackRef.current = undefined;
      }, options?.durationMs ?? 3000);
    },
    []
  );

  const handleOpenNewProjectModal = useCallback((defaultType: 'personal' | 'collab' = 'personal') => {
    setProjectModalMode('create');
    setEditingProject(null);
    setEditingCollabProject(null);
    setDefaultNewProjectType(defaultType);
    setIsProjectModalOpen(true);
  }, []);

  const handleOpenEditProjectModal = useCallback((proj: Project) => {
    setProjectModalMode('edit');
    setEditingProject(proj);
    setEditingCollabProject(null);
    setIsProjectModalOpen(true);
  }, []);

  const handleOpenEditCollabProjectModal = useCallback((proj: CollabProject) => {
    setProjectModalMode('edit');
    setEditingProject(null);
    setEditingCollabProject(proj);
    setIsProjectModalOpen(true);
  }, []);

  // Workspace Preset state (Phase 2 Requirement 5)
  const [workspacePreset, setWorkspacePreset] = useState<WorkspacePreset>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKSPACE_PRESET);
    return (saved as WorkspacePreset) || 'split-horizontal';
  });

  // Activity bar visibility state (Phase 2 Requirement 3)
  const [isActivityBarVisible, setIsActivityBarVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_BAR);
    return saved !== 'false';
  });

  // Command palette & drawer states (Phase 2 Requirement 2 & 4)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTemplatesDrawerOpen, setIsTemplatesDrawerOpen] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

  const handleSetWorkspacePreset = useCallback((preset: WorkspacePreset) => {
    setWorkspacePreset(preset);
    localStorage.setItem(STORAGE_KEYS.WORKSPACE_PRESET, preset);
    if (preset === 'split-horizontal') {
      setLayout('horizontal');
      setIsFullscreen(false);
    } else if (preset === 'split-vertical') {
      setLayout('vertical');
      setIsFullscreen(false);
    } else if (preset === 'focus-preview') {
      setIsFullscreen(true);
    } else if (preset === 'focus-code') {
      setIsFullscreen(false);
    } else if (preset === 'zen') {
      setIsFullscreen(false);
    }
  }, []);

  const handleToggleActivityBar = useCallback(() => {
    setIsActivityBarVisible((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_BAR, String(next));
      return next;
    });
  }, []);

  // Global Keyboard shortcuts: Ctrl/Cmd+K (Command Palette), Ctrl+Alt+N (New Project), and F11 / Ctrl+Shift+Z (Zen Mode)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenNewProjectModal();
      }
      if (e.key === 'F11' || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        handleSetWorkspacePreset(workspacePreset === 'zen' ? 'split-horizontal' : 'zen');
      }
      if (e.key === 'Escape' && workspacePreset === 'zen') {
        handleSetWorkspacePreset('split-horizontal');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [workspacePreset, handleSetWorkspacePreset, handleOpenNewProjectModal]);

  // Track previous user to detect guest-to-login transitions
  const prevUserRef = useRef<string | null>(null);
  const guestCodeSnapshotRef = useRef<{ html: string; css: string; js: string }>({ html: '', css: '', js: '' });

  // Console messages, static HTML/CSS checks & cursor jump target
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const consoleMessagesRef = useRef<ConsoleMessage[]>([]);
  consoleMessagesRef.current = consoleMessages;
  const [staticIssues, setStaticIssues] = useState<StaticIssue[]>(() =>
    runStaticChecks(htmlCode, cssCode)
  );
  const [cursorJumpTarget, setCursorJumpTarget] = useState<{
    tab: EditorTab;
    line: number;
    col?: number;
    nonce: number;
  } | null>(null);
  const [appliedHighlightTarget, setAppliedHighlightTarget] = useState<{
    tab: EditorTab;
    ranges: Array<{ fromLine: number; toLine: number }>;
    nonce: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Test Firebase connection on boot
  useEffect(() => {
    testConnection();
  }, []);


  // Save layout preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAYOUT, layout);
  }, [layout]);

  // Save split ratio preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPLIT_RATIO, splitRatio.toString());
  }, [splitRatio]);

  // Warn before closing tab if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Derived collaborative team project permissions
  const activeCollabRole =
    activeCollabProject && currentUser
      ? activeCollabProject.members[currentUser.uid]
      : undefined;
  const isCollabViewer = Boolean(activeCollabProject && activeCollabRole === 'viewer');
  const isCollabOwner = Boolean(
    activeCollabProject &&
      currentUser &&
      activeCollabProject.ownerId === currentUser.uid &&
      activeCollabRole === 'owner'
  );
  const isEditorReadOnly = isSharedView || isCollabViewer;

  const resolvedInviteModalProject = useMemo(() => {
    if (!inviteModalProjectId) return null;
    return (
      collabProjects.find((p) => p.id === inviteModalProjectId) ||
      (activeCollabProject?.id === inviteModalProjectId ? activeCollabProject : null)
    );
  }, [collabProjects, inviteModalProjectId, activeCollabProject]);

  const resolvedMembersModalProject = useMemo(() => {
    if (!membersModalProjectId) return null;
    return (
      collabProjects.find((p) => p.id === membersModalProjectId) ||
      (activeCollabProject?.id === membersModalProjectId ? activeCollabProject : null)
    );
  }, [collabProjects, membersModalProjectId, activeCollabProject]);

  // Check URL parameters for Shared Project OR Collab Invite on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareUid = params.get('share');
    const shareProjId = params.get('project');
    const collabId = params.get('collab');
    const inviteToken = params.get('invite');

    if (collabId && inviteToken) {
      savePendingCollabInvite({ projectId: collabId, token: inviteToken });
    } else if (shareUid && shareProjId) {
      getSharedProject(shareUid, shareProjId)
        .then((proj) => {
          if (proj) {
            setIsSharedView(true);
            setSharedProjectData(proj);
            setProjectTitle(proj.title);
            setHtmlCode(proj.htmlCode);
            setCssCode(proj.cssCode || '');
            setJsCode(proj.jsCode || '');
            setSharedAuthorEmail(proj.authorEmail);
            updatePreviewSnapshot(proj.htmlCode, proj.cssCode || '', proj.jsCode || '');
          } else {
            console.warn('Không tìm thấy dự án được chia sẻ hoặc chia sẻ đã bị tắt.');
          }
        })
        .catch((err) => console.error('Lỗi khi mở liên kết chia sẻ:', err));
    }
  }, []);

  // Subscribe to user's collaborative projects when signed in
  useEffect(() => {
    if (authLoading || !currentUser || isSharedView) {
      if (!currentUser) {
        setCollabProjects([]);
        setActiveCollabProject(null);
      }
      return;
    }

    const unsubscribe = subscribeUserCollabProjects(currentUser.uid, (list) => {
      setCollabProjects(list);
    });
    return () => unsubscribe();
  }, [currentUser, authLoading, isSharedView]);

  // Subscribe to currently active collaborative project for instant permission/removal enforcement
  useEffect(() => {
    if (!activeCollabProject?.id || !currentUser?.uid) return;
    const targetId = activeCollabProject.id;

    const unsubscribe = subscribeCollabProject(
      targetId,
      currentUser.uid,
      (updated) => {
        setActiveCollabProject(updated);
        setProjectTitle(updated.title);
        const langs = (
          updated.languages && updated.languages.length > 0
            ? updated.languages
            : ['html', 'css', 'js']
        ) as ('html' | 'css' | 'js')[];
        setActiveLanguages(langs);
      },
      () => {
        // Thành viên bị xóa hoặc dự án đã bị xóa -> mất quyền truy cập ngay lập tức
        setActiveCollabProject(null);
        setInviteModalProjectId((prev) => (prev === targetId ? null : prev));
        setMembersModalProjectId((prev) => (prev === targetId ? null : prev));
        setHasUnsavedChanges(false);
        setCloudSaveStatus('idle');

        if (projects.length > 0) {
          const fallback = projects[0];
          setActiveProject(fallback);
          setProjectTitle(fallback.title);
          setHtmlCode(fallback.htmlCode);
          setCssCode(fallback.cssCode || '');
          setJsCode(fallback.jsCode || '');
          const langs = (fallback.languages && fallback.languages.length > 0
            ? fallback.languages
            : ['html', 'css', 'js']) as ('html' | 'css' | 'js')[];
          setActiveLanguages(langs);
          updatePreviewSnapshot(fallback.htmlCode, fallback.cssCode || '', fallback.jsCode || '');
        } else {
          setActiveProject(null);
          setProjectTitle('Trang Chào Mừng');
          setHtmlCode(DEFAULT_HTML_PART);
          setCssCode(DEFAULT_CSS_PART);
          setJsCode(DEFAULT_JS_PART);
          setActiveLanguages(['html', 'css', 'js']);
          updatePreviewSnapshot(DEFAULT_HTML_PART, DEFAULT_CSS_PART, DEFAULT_JS_PART);
        }

        showToast('Bạn không còn quyền truy cập dự án nhóm này');
      }
    );

    return () => unsubscribe();
  }, [activeCollabProject?.id, currentUser?.uid]);

  // Mount & lifecycle for real-time Yjs CollabProvider
  useEffect(() => {
    const projectId = activeCollabProject?.id;
    const uid = currentUser?.uid;
    if (!projectId || !uid || isSharedView) {
      setCollabProviderInstance(null);
      setCollabDocReady(false);
      setCollabSyncState('connecting');
      setRemoteInsertFlashes([]);
      return;
    }

    let isCancelled = false;
    setCollabDocReady(false);
    setCollabSyncState('connecting');

    const initialCanEdit = activeCollabProject.members[uid] !== 'viewer';
    const provider = new CollabProvider({
      projectId,
      userId: uid,
      canEdit: initialCanEdit,
      onSyncStateChange: (nextState) => {
        if (isCancelled) return;
        setCollabSyncState(nextState);
        if (nextState === 'synced' || nextState === 'offline') {
          setCollabDocReady(true);
        }
      },
      onCodeChange: ({ htmlCode: nextHtml, cssCode: nextCss, jsCode: nextJs }) => {
        if (isCancelled) return;
        setHtmlCode(nextHtml);
        setCssCode(nextCss);
        setJsCode(nextJs);
      },
      onRemoteInsert: (inserts) => {
        if (isCancelled || !highlightInsertsRef.current) return;
        const now = Date.now();
        const currentRemote = remoteSessionsRef.current;
        const flashes: RemoteInsertFlash[] = inserts.map((ins) => {
          const candidates = currentRemote.filter((s) => s.tab === ins.tab);
          const typingMatch = candidates.find((s) => s.typingUntil > now);
          const matched = typingMatch || candidates[0];
          return {
            id: `${now}_${Math.random().toString(36).slice(2, 8)}`,
            tab: ins.tab,
            from: ins.from,
            to: ins.to,
            color: matched?.color || '#4F46E5',
            createdAt: now,
          };
        });
        if (flashes.length === 0) return;
        setRemoteInsertFlashes((prev) => [...prev.slice(-30), ...flashes]);
        setTimeout(() => {
          const cutoff = Date.now() - 1200;
          setRemoteInsertFlashes((prev) => prev.filter((f) => f.createdAt > cutoff));
        }, 1250);
      },
      onError: (msg) => {
        if (isCancelled) return;
        showToast(msg, 'warning');
      },
      onSizeWarning: (msg) => {
        if (isCancelled) return;
        showToast(msg, 'warning');
      },
    });

    setCollabProviderInstance(provider);
    void provider.start();

    return () => {
      isCancelled = true;
      setCollabProviderInstance(null);
      setCollabDocReady(false);
      void provider.destroy();
    };
  }, [activeCollabProject?.id, currentUser?.uid, isSharedView]);

  // Keep provider edit permission in sync if owner changes member role live
  useEffect(() => {
    collabProviderInstance?.setCanEdit(!isCollabViewer);
  }, [collabProviderInstance, isCollabViewer]);

  // Track browser online/offline state for connection-lost banner
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ensure RTDB presenceMeta exists when owner opens existing collab projects
  useEffect(() => {
    if (isCollabOwner && activeCollabProject && rtdb) {
      syncCollabPresenceMeta(activeCollabProject).catch(() => {});
    }
  }, [isCollabOwner, activeCollabProject]);

  // Mount & lifecycle for Stage 3 PresenceManager (RTDB path: presence/{projectId}/{sessionId})
  useEffect(() => {
    const projectId = activeCollabProject?.id;
    const uid = currentUser?.uid;
    if (!projectId || !uid || isSharedView) {
      setOnlineUsers([]);
      setRemoteSessions([]);
      remoteSessionsRef.current = [];
      setFollowingUid(null);
      setJumpTarget(null);
      setIsPresenceConnected(true);
      return;
    }

    let isCancelled = false;
    const initialRole = activeCollabProject.members[uid] || 'viewer';
    const initialName = getPresenceDisplayName(
      currentUser,
      activeCollabProject.memberProfiles[uid]
    );
    const initialPhoto =
      currentUser.photoURL || activeCollabProject.memberProfiles[uid]?.photoURL || null;
    const color = getUserPresenceColor(projectId, uid);

    const formatJoinLeaveToast = (notice: PresenceJoinLeaveNotice): string => {
      const action = notice.type === 'join' ? 'đã tham gia' : 'đã rời đi';
      if (notice.users.length === 1) {
        return `${notice.users[0].name} ${action}`;
      }
      if (notice.users.length === 2) {
        return `${notice.users[0].name}, ${notice.users[1].name} ${action}`;
      }
      return `${notice.users[0].name} và ${notice.users.length - 1} người khác ${action}`;
    };

    const manager = new PresenceManager({
      projectId,
      uid,
      name: initialName,
      photoURL: initialPhoto,
      color,
      role: initialRole,
      initialTab: activeTab,
      hideOwnCursor,
      onStateChange: ({ onlineUsers: nextUsers, remoteSessions: nextRemote }) => {
        if (isCancelled) return;
        remoteSessionsRef.current = nextRemote;
        setOnlineUsers(nextUsers);
        setRemoteSessions(nextRemote);
      },
      onConnectionChange: (connected) => {
        if (isCancelled) return;
        setIsPresenceConnected(connected);
      },
      onJoinLeaveNotice: (notice) => {
        if (isCancelled) return;
        showToast(formatJoinLeaveToast(notice), 'info');
      },
      onPermissionError: () => {
        if (isCancelled) return;
        console.warn('[Presence] Bị từ chối quyền ghi Realtime Database — hãy kiểm tra database.rules.json');
      },
    });

    presenceManagerRef.current = manager;
    manager.start();

    return () => {
      isCancelled = true;
      presenceManagerRef.current = null;
      remoteSessionsRef.current = [];
      setOnlineUsers([]);
      setRemoteSessions([]);
      setFollowingUid(null);
      setJumpTarget(null);
      void manager.destroy();
    };
    // Chỉ khởi tạo lại khi đổi dự án hoặc tài khoản — cập nhật tab/role/tên qua các hàm patch bên dưới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCollabProject?.id, currentUser?.uid, isSharedView]);

  // Đồng bộ vai trò, tên hiển thị và tab đang mở lên PresenceManager mà không ngắt kết nối
  useEffect(() => {
    if (activeCollabRole) {
      presenceManagerRef.current?.updateRole(activeCollabRole);
    }
  }, [activeCollabRole]);

  useEffect(() => {
    if (!activeCollabProject || !currentUser) return;
    const name = getPresenceDisplayName(
      currentUser,
      activeCollabProject.memberProfiles[currentUser.uid]
    );
    const photoURL =
      currentUser.photoURL || activeCollabProject.memberProfiles[currentUser.uid]?.photoURL || null;
    presenceManagerRef.current?.updateIdentity(name, photoURL);
  }, [
    activeCollabProject?.memberProfiles,
    currentUser?.displayName,
    currentUser?.email,
    currentUser?.photoURL,
    currentUser?.uid,
  ]);

  useEffect(() => {
    presenceManagerRef.current?.updateTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    presenceManagerRef.current?.setHideOwnCursor(hideOwnCursor);
  }, [hideOwnCursor]);

  // Stage 4: Lắng nghe bình luận theo dòng & trò chuyện nhóm khi mở dự án nhóm
  useEffect(() => {
    const projectId = activeCollabProject?.id;
    const uid = currentUser?.uid;
    setSyncPreviewEnabled(false);
    setSyncedPreviewState(null);

    if (!projectId || !uid || isSharedView) {
      setCollabLineComments([]);
      setCollabChatMessages([]);
      return;
    }

    const unsubComments = subscribeCollabComments(projectId, setCollabLineComments);
    const unsubMessages = subscribeCollabMessages(projectId, setCollabChatMessages);

    return () => {
      unsubComments();
      unsubMessages();
    };
  }, [activeCollabProject?.id, currentUser?.uid, isSharedView]);

  // Stage 4: Lắng nghe đồng bộ chế độ xem trước (chỉ bật khi người dùng chọn)
  useEffect(() => {
    const projectId = activeCollabProject?.id;
    const uid = currentUser?.uid;
    if (!projectId || !uid || isSharedView || !syncPreviewEnabled) {
      setSyncedPreviewState(null);
      return;
    }
    const unsubPreview = subscribeCollabPreviewSync(projectId, setSyncedPreviewState);
    return () => unsubPreview();
  }, [activeCollabProject?.id, currentUser?.uid, isSharedView, syncPreviewEnabled]);

  // Theo dõi tương tác cục bộ trên cửa sổ để reset bộ đếm "Vắng mặt 2 phút"
  useEffect(() => {
    if (!activeCollabProject?.id || !currentUser?.uid || isSharedView) return;
    const handleActivity = () => {
      presenceManagerRef.current?.markActivity();
    };
    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [activeCollabProject?.id, currentUser?.uid, isSharedView]);

  // Chế độ Theo dõi (Follow mode)
  const followingUser = useMemo(() => {
    if (!followingUid) return null;
    return onlineUsers.find((u) => u.uid === followingUid) || null;
  }, [followingUid, onlineUsers]);

  useEffect(() => {
    if (followingUid && onlineUsers.length > 0 && !followingUser) {
      setFollowingUid(null);
    }
  }, [followingUid, followingUser, onlineUsers.length]);

  useEffect(() => {
    if (followingUser && activeLanguages.includes(followingUser.tab) && activeTab !== followingUser.tab) {
      setActiveTab(followingUser.tab);
    }
  }, [followingUser, activeLanguages, activeTab]);

  const handleToggleFollowUser = useCallback(
    (user: PresenceUser) => {
      if (user.uid === currentUser?.uid) return;
      setFollowingUid((prev) => {
        if (prev === user.uid) return null;
        if (activeLanguages.includes(user.tab)) {
          setActiveTab(user.tab);
        }
        return user.uid;
      });
    },
    [currentUser?.uid, activeLanguages]
  );

  const handleJumpToUser = useCallback(
    (user: PresenceUser) => {
      if (user.uid === currentUser?.uid) return;
      setFollowingUid(null);
      if (activeLanguages.includes(user.tab)) {
        setActiveTab(user.tab);
      }
      setJumpTarget({ uid: user.uid, tab: user.tab, nonce: Date.now() });
    },
    [currentUser?.uid, activeLanguages]
  );

  const handleEditorTabChange = useCallback(
    (nextTab: EditorTab) => {
      if (followingUid) {
        setFollowingUid(null);
      }
      setActiveTab(nextTab);
    },
    [followingUid]
  );

  const handleLocalCursorChange = useCallback(
    (tab: EditorTab, anchor: number, head: number) => {
      const ytext = collabProviderInstance?.getYText(tab);
      if (!ytext) return;
      presenceManagerRef.current?.updateCursor(tab, anchor, head, ytext);
    },
    [collabProviderInstance]
  );

  const handleLocalTyping = useCallback((tab: EditorTab) => {
    presenceManagerRef.current?.notifyTyping(tab);
  }, []);

  const handleLocalEditorInteraction = useCallback(() => {
    setFollowingUid((prev) => (prev ? null : prev));
  }, []);

  const handleChangeCollabMemberRole = useCallback(
    async (targetUid: string, role: CollabInviteRole) => {
      if (!activeCollabProject) return;
      await changeCollabMemberRole(activeCollabProject.id, targetUid, role);
      showToast('Đã cập nhật vai trò thành viên');
    },
    [activeCollabProject, showToast]
  );

  // Stage 4: Privacy, Cursor, IME Composition, Comments, Chat & Preview Sync handlers
  const handleToggleHideRemoteCursors = useCallback(() => {
    updateSettings({ collabHideRemoteCursors: !hideRemoteCursors });
  }, [hideRemoteCursors, updateSettings]);

  const handleToggleHideOwnCursor = useCallback(() => {
    updateSettings({ collabHideOwnCursor: !hideOwnCursor });
  }, [hideOwnCursor, updateSettings]);

  const handleToggleChatSound = useCallback(() => {
    updateSettings({ collabChatSound: !chatSoundEnabled });
  }, [chatSoundEnabled, updateSettings]);

  const handleDismissPrivacyNotice = useCallback(() => {
    setShowCollabPrivacyNotice(false);
    try {
      localStorage.setItem(STORAGE_KEYS.COLLAB_PRIVACY_NOTICE_SEEN, '1');
    } catch {}
  }, []);

  const handleCompositionChange = useCallback(
    (isComposing: boolean) => {
      collabProviderInstance?.setLocalComposing(isComposing);
    },
    [collabProviderInstance]
  );

  const currentCollabIdentity = useMemo(() => {
    if (!activeCollabProject || !currentUser) return null;
    const name = getPresenceDisplayName(
      currentUser,
      activeCollabProject.memberProfiles[currentUser.uid]
    );
    const color = getUserPresenceColor(activeCollabProject.id, currentUser.uid);
    const photoURL =
      currentUser.photoURL || activeCollabProject.memberProfiles[currentUser.uid]?.photoURL || null;
    return { name, color, photoURL };
  }, [activeCollabProject, currentUser]);

  const handleAddLineComment = useCallback(
    async (tab: EditorTab, lineNumber: number, relPosJson: string | null, text: string) => {
      if (!activeCollabProject || !currentUser || !currentCollabIdentity) return;
      await addCollabLineComment({
        projectId: activeCollabProject.id,
        tab,
        lineNumber,
        relPosJson,
        authorId: currentUser.uid,
        authorName: currentCollabIdentity.name,
        authorColor: currentCollabIdentity.color,
        text,
      });
    },
    [activeCollabProject, currentUser, currentCollabIdentity]
  );

  const handleReplyLineComment = useCallback(
    async (commentId: string, text: string) => {
      if (!activeCollabProject || !currentUser || !currentCollabIdentity) return;
      await replyCollabLineComment({
        projectId: activeCollabProject.id,
        commentId,
        authorId: currentUser.uid,
        authorName: currentCollabIdentity.name,
        authorColor: currentCollabIdentity.color,
        text,
      });
    },
    [activeCollabProject, currentUser, currentCollabIdentity]
  );

  const handleToggleResolveLineComment = useCallback(
    async (commentId: string, nextResolved: boolean) => {
      if (!activeCollabProject || !currentCollabIdentity) return;
      await toggleResolveCollabComment({
        projectId: activeCollabProject.id,
        commentId,
        resolved: nextResolved,
        resolvedByName: currentCollabIdentity.name,
      });
    },
    [activeCollabProject, currentCollabIdentity]
  );

  const handleDeleteLineComment = useCallback(
    async (commentId: string) => {
      if (!activeCollabProject) return;
      await deleteCollabLineComment(activeCollabProject.id, commentId);
    },
    [activeCollabProject]
  );

  const handleSendChatMessage = useCallback(
    async (text: string) => {
      if (!activeCollabProject || !currentUser || !currentCollabIdentity) return;
      await sendCollabMessage({
        projectId: activeCollabProject.id,
        authorId: currentUser.uid,
        authorName: currentCollabIdentity.name,
        authorColor: currentCollabIdentity.color,
        photoURL: currentCollabIdentity.photoURL,
        text,
      });
    },
    [activeCollabProject, currentUser, currentCollabIdentity]
  );

  const handleDeleteChatMessage = useCallback(
    async (messageId: string) => {
      if (!activeCollabProject) return;
      await deleteCollabMessage(activeCollabProject.id, messageId);
    },
    [activeCollabProject]
  );

  const handlePublishPreviewSync = useCallback(
    (device: DeviceMode, refreshNonce: number) => {
      if (!activeCollabProject || !currentUser || !currentCollabIdentity || !syncPreviewEnabled) {
        return;
      }
      void publishCollabPreviewSync({
        projectId: activeCollabProject.id,
        device,
        refreshNonce,
        updatedByUid: currentUser.uid,
        updatedByName: currentCollabIdentity.name,
      });
    },
    [activeCollabProject, currentUser, currentCollabIdentity, syncPreviewEnabled]
  );

  // Real-time preview update (debounce ~500ms, xóa lỗi cũ khi chạy lại bản mới)
  useEffect(() => {
    const timer = setTimeout(() => {
      const prev = lastCompiledCodesRef.current;
      if (prev.html === htmlCode && prev.css === cssCode && prev.js === jsCode) {
        return;
      }
      updatePreviewSnapshot(htmlCode, cssCode, jsCode, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode, updatePreviewSnapshot]);

  // Kiểm tra tĩnh HTML/CSS tự động (debounce ~250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setStaticIssues(runStaticChecks(htmlCode, cssCode));
    }, 250);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode]);

  // Guest local storage auto-save
  useEffect(() => {
    if (!currentUser && !isSharedView && !activeCollabProject) {
      localStorage.setItem(
        STORAGE_KEYS.TABS_CODE,
        JSON.stringify({ htmlCode, cssCode, jsCode })
      );
    }
  }, [htmlCode, cssCode, jsCode, currentUser, isSharedView, activeCollabProject]);

  // Cloud Auto-save to Firestore for logged in personal projects (debounce ~2s)
  useEffect(() => {
    if (!currentUser || !activeProject || activeCollabProject || isSharedView) return;

    const hasChanged =
      htmlCode !== activeProject.htmlCode ||
      cssCode !== (activeProject.cssCode || '') ||
      jsCode !== (activeProject.jsCode || '') ||
      projectTitle !== activeProject.title;

    if (!hasChanged) {
      setHasUnsavedChanges(false);
      return;
    }

    setHasUnsavedChanges(true);
    setCloudSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        await updateProject(currentUser.uid, activeProject.id, {
          title: projectTitle,
          htmlCode,
          cssCode,
          jsCode,
        });
        setActiveProject((prev) =>
          prev
            ? {
                ...prev,
                title: projectTitle,
                htmlCode,
                cssCode,
                jsCode,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        setProjects((prev) =>
          prev.map((p) =>
            p.id === activeProject.id
              ? {
                  ...p,
                  title: projectTitle,
                  htmlCode,
                  cssCode,
                  jsCode,
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );
        setCloudSaveStatus('saved');
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error('Lỗi tự động lưu đám mây:', err);
        setCloudSaveStatus('error');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode, projectTitle, currentUser, activeProject, activeCollabProject, isSharedView]);

  // Load guest projects when not logged in
  useEffect(() => {
    if (authLoading || currentUser || isSharedView) return;
    const guestProjects = getGuestProjects();
    setProjects(guestProjects);
    if (guestProjects.length > 0 && !activeProject) {
      const lastGuestId = localStorage.getItem('htmlive_last_guest_project');
      const found = guestProjects.find((p) => p.id === lastGuestId) || guestProjects[0];
      if (found) {
        setActiveProject(found);
        setProjectTitle(found.title);
        setHtmlCode(found.htmlCode);
        setCssCode(found.cssCode || '');
        setJsCode(found.jsCode || '');
        const langs = (found.languages && found.languages.length > 0 ? found.languages : ['html', 'css', 'js']) as ('html' | 'css' | 'js')[];
        setActiveLanguages(langs);
        if (!langs.includes(activeTab)) {
          setActiveTab('html');
        }
        updatePreviewSnapshot(found.htmlCode, found.cssCode || '', found.jsCode || '');
      }
    }
  }, [currentUser, authLoading, isSharedView]);

  // Load user projects and handle auth transitions + pending collab invite join
  useEffect(() => {
    if (authLoading || isSharedView) return;

    const currentUid = currentUser?.uid || null;
    const prevUid = prevUserRef.current;
    prevUserRef.current = currentUid;

    const pendingInvite = getPendingCollabInvite();

    // Guest opened an invite link -> ask to sign in/sign up first
    if (!currentUid && pendingInvite) {
      setAuthModalInitialMode('login');
      setIsAuthModalOpen(true);
      showToast('Vui lòng đăng nhập hoặc đăng ký để tham gia dự án nhóm');
      return;
    }

    // Logged In from Guest
    if (currentUid && !prevUid) {
      if (pendingInvite) {
        loadUserProjectsAndLastActive(currentUid);
      } else {
        const isCustomGuestCode =
          htmlCode !== DEFAULT_HTML_PART ||
          cssCode !== DEFAULT_CSS_PART ||
          jsCode !== DEFAULT_JS_PART;

        if (isCustomGuestCode) {
          guestCodeSnapshotRef.current = { html: htmlCode, css: cssCode, js: jsCode };
          setIsGuestPromptOpen(true);
        } else {
          loadUserProjectsAndLastActive(currentUid);
        }
      }
    }
    // Logged Out
    else if (!currentUid && prevUid) {
      const guestProjects = getGuestProjects();
      setProjects(guestProjects);
      setCollabProjects([]);
      setActiveCollabProject(null);
      setActiveProject(null);
      setProjectTitle('Trang Chào Mừng');
      setHtmlCode(DEFAULT_HTML_PART);
      setCssCode(DEFAULT_CSS_PART);
      setJsCode(DEFAULT_JS_PART);
      setActiveLanguages(['html', 'css', 'js']);
      setActiveTab('html');
      updatePreviewSnapshot(DEFAULT_HTML_PART, DEFAULT_CSS_PART, DEFAULT_JS_PART);
      setCloudSaveStatus('idle');
      localStorage.removeItem(STORAGE_KEYS.TABS_CODE);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_CODE);
    }
  }, [currentUser, authLoading, isSharedView]);

  // Process pending collaborative invite once signed in
  useEffect(() => {
    if (authLoading || !currentUser || isSharedView) return;
    const pending = getPendingCollabInvite();
    if (!pending) return;

    clearPendingCollabInvite();
    window.history.replaceState({}, '', window.location.pathname);

    joinCollabProjectByInvite(pending.projectId, pending.token, currentUser)
      .then(async (joined) => {
        await handleSelectCollabProject(joined);
        showToast(`Đã tham gia dự án nhóm "${joined.title}"`);
      })
      .catch((err: any) => {
        console.error('Lỗi tham gia dự án nhóm:', err);
        showToast(err?.message || 'Không thể tham gia dự án nhóm qua liên kết này');
      });
  }, [currentUser, authLoading, isSharedView]);

  // Load projects from Firestore
  const loadUserProjectsAndLastActive = async (uid: string) => {
    setIsProjectsLoading(true);
    setProjectsLoadError(null);
    try {
      const userProjects = await getUserProjects(uid);
      setProjects(userProjects);

      if (userProjects.length > 0) {
        const lastOpenedId = localStorage.getItem(`${STORAGE_KEYS.LAST_PROJECT_PREFIX}${uid}`);
        const found = userProjects.find((p) => p.id === lastOpenedId) || userProjects[0];
        setActiveProject(found);
        setProjectTitle(found.title);
        setHtmlCode(found.htmlCode);
        setCssCode(found.cssCode || '');
        setJsCode(found.jsCode || '');
        const langs = (found.languages && found.languages.length > 0 ? found.languages : ['html', 'css', 'js']) as ('html' | 'css' | 'js')[];
        setActiveLanguages(langs);
        if (!langs.includes(activeTab)) {
          setActiveTab('html');
        }
        updatePreviewSnapshot(found.htmlCode, found.cssCode || '', found.jsCode || '');
      } else {
        const initialProj = await saveProject(uid, {
          title: 'Dự án đầu tiên của tôi',
          languages: ['html', 'css', 'js'],
          htmlCode: DEFAULT_HTML_PART,
          cssCode: DEFAULT_CSS_PART,
          jsCode: DEFAULT_JS_PART,
          authorEmail: currentUser?.email || undefined,
        });
        setProjects([initialProj]);
        setActiveProject(initialProj);
        setProjectTitle(initialProj.title);
        setHtmlCode(initialProj.htmlCode);
        setCssCode(initialProj.cssCode || '');
        setJsCode(initialProj.jsCode || '');
        setActiveLanguages(['html', 'css', 'js']);
        localStorage.setItem(`${STORAGE_KEYS.LAST_PROJECT_PREFIX}${uid}`, initialProj.id);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách dự án:', err);
      setProjectsLoadError('Không thể tải danh sách dự án đám mây. Vui lòng thử lại.');
    } finally {
      setIsProjectsLoading(false);
    }
  };

  // Guest Prompt Handlers
  const handleSaveGuestCodeAsNew = async () => {
    if (!currentUser) return;
    try {
      setIsGuestPromptOpen(false);
      setCloudSaveStatus('saving');
      const snap = guestCodeSnapshotRef.current;
      const newProj = await saveProject(currentUser.uid, {
        title: 'Dự án từ phiên khách',
        languages: activeLanguages,
        htmlCode: snap.html || htmlCode,
        cssCode: snap.css || cssCode,
        jsCode: snap.js || jsCode,
        authorEmail: currentUser.email || undefined,
      });
      const updatedList = await getUserProjects(currentUser.uid);
      setProjects(updatedList);
      setActiveProject(newProj);
      setProjectTitle(newProj.title);
      setHtmlCode(newProj.htmlCode);
      setCssCode(newProj.cssCode || '');
      setJsCode(newProj.jsCode || '');
      localStorage.setItem(`${STORAGE_KEYS.LAST_PROJECT_PREFIX}${currentUser.uid}`, newProj.id);
      setCloudSaveStatus('saved');
      showToast('Đã lưu mã từ phiên khách thành dự án mới');
    } catch (err) {
      console.error('Lỗi khi lưu mã từ phiên khách:', err);
      setCloudSaveStatus('error');
    }
  };

  const handleDiscardGuestCode = () => {
    setIsGuestPromptOpen(false);
    if (currentUser) {
      loadUserProjectsAndLastActive(currentUser.uid);
    }
  };

  // Manual Save (Cloud for logged-in personal & Collab flush/compaction, localStorage for guest)
  const handleManualSave = async () => {
    if (isEditorReadOnly) return;

    if (activeCollabProject && currentUser && collabProviderInstance) {
      setCloudSaveStatus('saving');
      try {
        await collabProviderInstance.flushAndCompact();
        if (isCollabOwner && projectTitle !== activeCollabProject.title) {
          await updateCollabProjectMeta(
            activeCollabProject.id,
            { title: projectTitle },
            activeCollabProject.inviteToken
          );
        }
        setCloudSaveStatus('saved');
        setHasUnsavedChanges(false);
        showToast('Đã đồng bộ và nén ảnh chụp dự án nhóm');
      } catch (err) {
        console.error('Lỗi khi đồng bộ dự án nhóm:', err);
        setCloudSaveStatus('error');
      }
      return;
    }

    const targetUid = currentUser?.uid || 'guest';
    setCloudSaveStatus('saving');
    try {
      if (activeProject) {
        await updateProject(targetUid, activeProject.id, {
          title: projectTitle,
          htmlCode,
          cssCode,
          jsCode,
          languages: activeLanguages,
        });
        setActiveProject((prev) =>
          prev
            ? { ...prev, title: projectTitle, htmlCode, cssCode, jsCode, languages: activeLanguages, updatedAt: new Date().toISOString() }
            : null
        );
      } else {
        const newProj = await saveProject(targetUid, {
          title: projectTitle || 'Dự án mới',
          languages: activeLanguages,
          htmlCode,
          cssCode,
          jsCode,
          authorEmail: currentUser?.email || undefined,
        });
        setActiveProject(newProj);
        if (currentUser) {
          localStorage.setItem(`${STORAGE_KEYS.LAST_PROJECT_PREFIX}${currentUser.uid}`, newProj.id);
        } else {
          localStorage.setItem('htmlive_last_guest_project', newProj.id);
        }
      }
      const updatedList = currentUser ? await getUserProjects(currentUser.uid) : getGuestProjects();
      setProjects(updatedList);
      setCloudSaveStatus('saved');
      setHasUnsavedChanges(false);
      showToast('Đã lưu dự án thành công');
    } catch (err) {
      console.error('Lỗi khi lưu dự án:', err);
      setCloudSaveStatus('error');
    }
  };

  // Select personal project from panel
  const handleSelectProject = (project: Project) => {
    setActiveCollabProject(null);
    setActiveProject(project);
    setProjectTitle(project.title);
    setHtmlCode(project.htmlCode);
    setCssCode(project.cssCode || '');
    setJsCode(project.jsCode || '');
    const langs = (project.languages && project.languages.length > 0 ? project.languages : ['html', 'css', 'js']) as ('html' | 'css' | 'js')[];
    setActiveLanguages(langs);
    if (!langs.includes(activeTab)) {
      setActiveTab('html');
    }
    updatePreviewSnapshot(project.htmlCode, project.cssCode || '', project.jsCode || '');
    setCloudSaveStatus('idle');
    setHasUnsavedChanges(false);
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEYS.LAST_PROJECT_PREFIX}${currentUser.uid}`, project.id);
    } else {
      localStorage.setItem('htmlive_last_guest_project', project.id);
    }
  };

  // Select collaborative team project (CollabProvider streams Y.Doc state live)
  const handleSelectCollabProject = async (collabProj: CollabProject) => {
    setActiveProject(null);
    setActiveCollabProject(collabProj);
    setProjectTitle(collabProj.title);
    const langs = (
      collabProj.languages && collabProj.languages.length > 0
        ? collabProj.languages
        : ['html', 'css', 'js']
    ) as ('html' | 'css' | 'js')[];
    setActiveLanguages(langs);
    if (!langs.includes(activeTab)) {
      setActiveTab('html');
    }
    setCloudSaveStatus('saved');
    setHasUnsavedChanges(false);
  };

  // Convert personal project into team project (keeps personal copy until user confirms removal)
  const handleConvertPersonalToCollab = async (personalProj: Project) => {
    if (!currentUser) {
      openAuth('login');
      showToast('Vui lòng đăng nhập để chuyển thành dự án nhóm');
      return;
    }
    try {
      const created = await convertPersonalToCollabProject(currentUser, personalProj);
      await handleSelectCollabProject(created);
      setIsProjectsPanelOpen(false);
      setPendingRemovePersonalAfterConvert(personalProj);
      showToast(`Đã tạo dự án nhóm "${created.title}"`);
    } catch (err) {
      console.error('Lỗi chuyển thành dự án nhóm:', err);
      showToast('Không thể chuyển đổi dự án thành dự án nhóm');
    }
  };

  // Submit handler for Create or Edit Project form (Personal or Collab)
  const handleProjectFormSubmit = async (formData: ProjectFormData) => {
    const targetUserId = currentUser?.uid || 'guest';

    if (projectModalMode === 'create') {
      // 1. Auto-save current personal project if it has unsaved changes
      if (hasUnsavedChanges && activeProject && !activeCollabProject) {
        try {
          await updateProject(targetUserId, activeProject.id, {
            title: projectTitle,
            htmlCode,
            cssCode,
            jsCode,
            languages: activeLanguages,
          });
        } catch (err) {
          console.warn('Lỗi khi tự động lưu dự án cũ:', err);
        }
      }

      // 2. Starter templates matching selected types
      const minimalHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formData.title}</title>
</head>
<body>
  <h1>Xin chào!</h1>
  <p>Bắt đầu viết mã HTML của bạn tại đây.</p>
</body>
</html>`;

      const cssStarter = formData.languages.includes('css')
        ? `/* Viết mã CSS để tùy biến giao diện tại đây */\n`
        : '';
      const jsStarter = formData.languages.includes('js')
        ? `// Viết mã JavaScript để tạo tương tác tại đây\n`
        : '';

      if (formData.projectType === 'collab') {
        if (!currentUser) {
          throw new Error('Vui lòng đăng nhập để tạo dự án nhóm');
        }
        const newCollab = await createCollabProject(currentUser, {
          title: formData.title,
          description: formData.description,
          languages: formData.languages,
          htmlCode: minimalHtml,
          cssCode: cssStarter,
          jsCode: jsStarter,
        });
        await handleSelectCollabProject(newCollab);
        setIsProjectsPanelOpen(false);
        showToast(`Đã tạo dự án nhóm "${newCollab.title}"`);
        return;
      }

      try {
        const newProj = await saveProject(targetUserId, {
          title: formData.title,
          description: formData.description,
          languages: formData.languages,
          htmlCode: minimalHtml,
          cssCode: cssStarter,
          jsCode: jsStarter,
          authorEmail: currentUser?.email || undefined,
        });

        let updatedList: Project[] = [];
        if (currentUser) {
          updatedList = await getUserProjects(currentUser.uid);
        } else {
          updatedList = getGuestProjects();
        }
        setProjects(updatedList);

        handleSelectProject(newProj);
        setIsProjectsPanelOpen(false);
        showToast(`Đã tạo dự án "${newProj.title}"`);
      } catch (err) {
        console.error('Lỗi khi tạo dự án mới:', err);
        throw err;
      }
    } else {
      // Edit mode (Collab vs Personal)
      const targetCollab =
        editingCollabProject || (!editingProject && activeCollabProject ? activeCollabProject : null);

      if (targetCollab) {
        if (!currentUser || targetCollab.ownerId !== currentUser.uid) {
          throw new Error('Chỉ chủ sở hữu mới có thể chỉnh sửa cài đặt dự án nhóm');
        }
        await updateCollabProjectMeta(
          targetCollab.id,
          {
            title: formData.title,
            description: formData.description,
            languages: formData.languages,
          },
          targetCollab.inviteToken
        );
        if (activeCollabProject && activeCollabProject.id === targetCollab.id) {
          setProjectTitle(formData.title);
          setActiveLanguages(formData.languages);
          if (!formData.languages.includes(activeTab)) {
            setActiveTab('html');
          }
        }
        showToast(`Đã cập nhật dự án nhóm "${formData.title}"`);
        return;
      }

      const projId = editingProject?.id || activeProject?.id;
      if (!projId) return;

      try {
        await updateProject(targetUserId, projId, {
          title: formData.title,
          description: formData.description,
          languages: formData.languages,
        });

        let updatedList: Project[] = [];
        if (currentUser) {
          updatedList = await getUserProjects(currentUser.uid);
        } else {
          updatedList = getGuestProjects();
        }
        setProjects(updatedList);

        if (activeProject && activeProject.id === projId) {
          setActiveProject((prev) =>
            prev
              ? {
                  ...prev,
                  title: formData.title,
                  description: formData.description,
                  languages: formData.languages,
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
          setProjectTitle(formData.title);
          setActiveLanguages(formData.languages);
          if (!formData.languages.includes(activeTab)) {
            setActiveTab('html');
          }
        }

        showToast(`Đã cập nhật dự án "${formData.title}"`);
      } catch (err) {
        console.error('Lỗi khi cập nhật thông tin dự án:', err);
        throw err;
      }
    }
  };

  // Add missing language tab (CSS or JS) to project
  const handleAddLanguage = useCallback(
    async (lang: 'html' | 'css' | 'js') => {
      if (isEditorReadOnly) return;
      if (activeLanguages.includes(lang)) {
        setActiveTab(lang);
        return;
      }
      if (activeCollabProject && !isCollabOwner) {
        showToast('Chỉ chủ sở hữu mới có thể thay đổi thành phần ngôn ngữ của dự án nhóm');
        return;
      }

      const newLangs = [...activeLanguages, lang];
      setActiveLanguages(newLangs);
      setActiveTab(lang);

      if (activeCollabProject && isCollabOwner) {
        try {
          await updateCollabProjectMeta(activeCollabProject.id, { languages: newLangs });
          showToast(`Đã thêm tab ${lang.toUpperCase()}`);
        } catch (err) {
          console.error('Lỗi khi thêm tab ngôn ngữ dự án nhóm:', err);
        }
        return;
      }

      if (activeProject) {
        try {
          const targetUserId = currentUser?.uid || 'guest';
          await updateProject(targetUserId, activeProject.id, {
            languages: newLangs,
          });
          setActiveProject((prev) => (prev ? { ...prev, languages: newLangs } : null));
          setProjects((prev) =>
            prev.map((p) => (p.id === activeProject.id ? { ...p, languages: newLangs } : p))
          );
          showToast(`Đã thêm tab ${lang.toUpperCase()}`);
        } catch (err) {
          console.error('Lỗi khi thêm tab ngôn ngữ:', err);
        }
      }
    },
    [activeLanguages, activeProject, activeCollabProject, isCollabOwner, isEditorReadOnly, currentUser, showToast]
  );

  // Execute actual removal of language tab while preserving code
  const executeRemoveLanguage = useCallback(
    async (lang: 'css' | 'js') => {
      if (isEditorReadOnly) return;
      if (activeCollabProject && !isCollabOwner) {
        showToast('Chỉ chủ sở hữu mới có thể thay đổi thành phần ngôn ngữ của dự án nhóm');
        return;
      }

      const newLangs = activeLanguages.filter((l) => l !== lang);
      setActiveLanguages(newLangs);
      if (activeTab === lang) {
        setActiveTab('html');
      }

      if (activeCollabProject && isCollabOwner) {
        try {
          await updateCollabProjectMeta(activeCollabProject.id, { languages: newLangs });
          showToast(`Đã ẩn tab ${lang.toUpperCase()} (mã vẫn được giữ nguyên)`);
        } catch (err) {
          console.error('Lỗi khi cập nhật tab ngôn ngữ dự án nhóm:', err);
        }
        return;
      }

      if (activeProject) {
        try {
          const targetUserId = currentUser?.uid || 'guest';
          await updateProject(targetUserId, activeProject.id, {
            languages: newLangs,
          });
          setActiveProject((prev) => (prev ? { ...prev, languages: newLangs } : null));
          setProjects((prev) =>
            prev.map((p) => (p.id === activeProject.id ? { ...p, languages: newLangs } : p))
          );
          showToast(`Đã ẩn tab ${lang.toUpperCase()} (mã vẫn được giữ nguyên)`);
        } catch (err) {
          console.error('Lỗi khi cập nhật tab ngôn ngữ:', err);
        }
      }
    },
    [activeLanguages, activeTab, activeProject, activeCollabProject, isCollabOwner, isEditorReadOnly, currentUser, showToast]
  );

  // Request remove language tab with confirmation if code is present
  const handleRequestRemoveLanguage = useCallback(
    (lang: 'css' | 'js') => {
      if (isEditorReadOnly) return;
      if (activeCollabProject && !isCollabOwner) {
        showToast('Chỉ chủ sở hữu mới có thể ẩn tab ngôn ngữ dự án nhóm');
        return;
      }

      const currentCode = lang === 'css' ? cssCode : jsCode;
      const trimmed = currentCode.trim();
      const hasMeaningfulCode =
        trimmed.length > 0 &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('//');

      if (hasMeaningfulCode) {
        setPendingRemoveLang(lang);
        setIsConfirmRemoveTabOpen(true);
      } else {
        executeRemoveLanguage(lang);
      }
    },
    [cssCode, jsCode, executeRemoveLanguage, isEditorReadOnly, activeCollabProject, isCollabOwner, showToast]
  );

  // Rename personal project
  const handleRenameProject = async (projectId: string, newTitle: string) => {
    try {
      const targetUid = currentUser?.uid || 'guest';
      await updateProject(targetUid, projectId, { title: newTitle });
      if (activeProject && activeProject.id === projectId) {
        setActiveProject((prev) => (prev ? { ...prev, title: newTitle } : null));
        setProjectTitle(newTitle);
      }
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, title: newTitle } : p)));
      showToast(`Đã đổi tên dự án thành "${newTitle}"`);
    } catch (err) {
      console.error('Lỗi đổi tên dự án:', err);
    }
  };

  // Rename team project (owner only)
  const handleRenameCollabProject = async (projectId: string, newTitle: string) => {
    const target = collabProjects.find((p) => p.id === projectId) || activeCollabProject;
    if (!currentUser || !target || target.ownerId !== currentUser.uid) {
      showToast('Chỉ chủ sở hữu mới có thể đổi tên dự án nhóm');
      return;
    }
    try {
      await updateCollabProjectMeta(projectId, { title: newTitle }, target.inviteToken);
      if (activeCollabProject?.id === projectId) {
        setProjectTitle(newTitle);
      }
      showToast(`Đã đổi tên dự án nhóm thành "${newTitle}"`);
    } catch (err) {
      console.error('Lỗi đổi tên dự án nhóm:', err);
      showToast('Không thể đổi tên dự án nhóm');
    }
  };

  // Delete personal project
  const handleDeleteProject = async (projectId: string) => {
    try {
      const targetUid = currentUser?.uid || 'guest';
      await deleteProject(targetUid, projectId);
      const remaining = projects.filter((p) => p.id !== projectId);
      setProjects(remaining);

      if (activeProject && activeProject.id === projectId) {
        if (remaining.length > 0) {
          handleSelectProject(remaining[0]);
        } else {
          setActiveProject(null);
          setProjectTitle('Trang Chào Mừng');
          setHtmlCode(DEFAULT_HTML_PART);
          setCssCode(DEFAULT_CSS_PART);
          setJsCode(DEFAULT_JS_PART);
          setActiveLanguages(['html', 'css', 'js']);
          updatePreviewSnapshot(DEFAULT_HTML_PART, DEFAULT_CSS_PART, DEFAULT_JS_PART);
        }
      }
      showToast('Đã xóa dự án');
    } catch (err) {
      console.error('Lỗi khi xóa dự án:', err);
    }
  };

  // Delete team project (owner only)
  const handleDeleteCollabProject = async (collabProj: CollabProject) => {
    if (!currentUser || collabProj.ownerId !== currentUser.uid) {
      showToast('Chỉ chủ sở hữu mới có thể xóa dự án nhóm');
      return;
    }
    try {
      await deleteCollabProject(collabProj);
      if (activeCollabProject?.id === collabProj.id) {
        setActiveCollabProject(null);
        if (projects.length > 0) {
          handleSelectProject(projects[0]);
        } else {
          setProjectTitle('Trang Chào Mừng');
          setHtmlCode(DEFAULT_HTML_PART);
          setCssCode(DEFAULT_CSS_PART);
          setJsCode(DEFAULT_JS_PART);
          setActiveLanguages(['html', 'css', 'js']);
          updatePreviewSnapshot(DEFAULT_HTML_PART, DEFAULT_CSS_PART, DEFAULT_JS_PART);
        }
      }
      showToast(`Đã xóa dự án nhóm "${collabProj.title}"`);
    } catch (err) {
      console.error('Lỗi khi xóa dự án nhóm:', err);
      showToast('Không thể xóa dự án nhóm');
    }
  };

  // Leave team project (non-owner)
  const handleLeaveCollabProject = async (collabProj: CollabProject) => {
    if (!currentUser || collabProj.ownerId === currentUser.uid) return;
    try {
      await leaveCollabProject(collabProj.id, currentUser.uid);
      if (activeCollabProject?.id === collabProj.id) {
        setActiveCollabProject(null);
        if (projects.length > 0) {
          handleSelectProject(projects[0]);
        } else {
          setProjectTitle('Trang Chào Mừng');
          setHtmlCode(DEFAULT_HTML_PART);
          setCssCode(DEFAULT_CSS_PART);
          setJsCode(DEFAULT_JS_PART);
          setActiveLanguages(['html', 'css', 'js']);
          updatePreviewSnapshot(DEFAULT_HTML_PART, DEFAULT_CSS_PART, DEFAULT_JS_PART);
        }
      }
      showToast(`Đã rời khỏi dự án nhóm "${collabProj.title}"`);
    } catch (err) {
      console.error('Lỗi khi rời dự án nhóm:', err);
      showToast('Không thể rời khỏi dự án nhóm');
    }
  };

  // Toggle Sharing on current project
  const handleToggleShare = async (shared: boolean) => {
    if (!currentUser || !activeProject) return;
    try {
      await toggleShareProject(currentUser.uid, activeProject.id, shared, currentUser.email || undefined);
      setActiveProject((prev) => (prev ? { ...prev, isShared: shared } : null));
      setProjects((prev) =>
        prev.map((p) => (p.id === activeProject.id ? { ...p, isShared: shared } : p))
      );
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái chia sẻ:', err);
    }
  };

  // Fork shared project into current user's account
  const handleForkProject = async () => {
    if (!sharedProjectData) return;

    if (!currentUser) {
      // If guest, prompt to sign in or fork locally
      setAuthModalInitialMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const forked = await forkProject(currentUser.uid, currentUser.email || '', sharedProjectData);
      const updatedList = await getUserProjects(currentUser.uid);
      setProjects(updatedList);
      setIsSharedView(false);
      setSharedProjectData(null);
      // Clean query parameters from URL
      window.history.replaceState({}, '', window.location.pathname);
      handleSelectProject(forked);
    } catch (err) {
      console.error('Lỗi sao chép dự án:', err);
    }
  };

  // Exit shared read-only view
  const handleExitSharedView = () => {
    setIsSharedView(false);
    setSharedProjectData(null);
    window.history.replaceState({}, '', window.location.pathname);
    if (currentUser) {
      loadUserProjectsAndLastActive(currentUser.uid);
    } else {
      setHtmlCode(DEFAULT_HTML_PART);
      setCssCode(DEFAULT_CSS_PART);
      setJsCode(DEFAULT_JS_PART);
      setProjectTitle('Trang Chào Mừng');
    }
  };

  // Tiếp nhận thông báo đã xác thực từ PreviewPane & gộp các lỗi/cảnh báo trùng lặp kèm bộ đếm
  const handleRuntimeMessage = useCallback((newMsg: ConsoleMessage) => {
    setConsoleMessages((prev) => {
      if (newMsg.type === 'error' || newMsg.type === 'warn') {
        const existingIdx = prev.findIndex(
          (m) =>
            m.type === newMsg.type &&
            m.message === newMsg.message &&
            (m.tab ?? null) === (newMsg.tab ?? null) &&
            (m.line ?? null) === (newMsg.line ?? null) &&
            (m.col ?? null) === (newMsg.col ?? null)
        );
        if (existingIdx !== -1) {
          const next = [...prev];
          const existing = next[existingIdx];
          next[existingIdx] = {
            ...existing,
            count: (existing.count ?? 1) + 1,
            time: newMsg.time,
          };
          return next;
        }
      }
      return [...prev.slice(-99), newMsg];
    });
  }, []);

  // Nhảy tới đúng tab, dòng và cột khi bấm vào lỗi hoặc vấn đề
  const handleJumpToLocation = useCallback(
    (loc: { tab: EditorTab; line: number; col?: number }) => {
      if ((loc.tab === 'css' || loc.tab === 'js') && !activeLanguages.includes(loc.tab)) {
        setActiveLanguages((prev) => (prev.includes(loc.tab) ? prev : [...prev, loc.tab]));
      }
      setActiveTab(loc.tab);
      setMobileTab('code');
      if (workspacePreset === 'focus-preview') {
        handleSetWorkspacePreset('split-horizontal');
      }
      setCursorJumpTarget({
        tab: loc.tab,
        line: loc.line,
        col: loc.col ?? 1,
        nonce: Date.now() + Math.random(),
      });
    },
    [activeLanguages, workspacePreset, handleSetWorkspacePreset]
  );

  // Keyboard shortcuts (Ctrl+Enter / Cmd+Enter to Run, Ctrl+S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [htmlCode, cssCode, jsCode, projectTitle, currentUser, activeProject, activeCollabProject, collabProviderInstance, isEditorReadOnly]);

  // Run manually (Auto-clears console & stale runtime errors on each run)
  const handleRun = useCallback(() => {
    updatePreviewSnapshot(htmlCode, cssCode, jsCode, false);
    setRefreshTrigger((prev) => prev + 1);
    setConsoleMessages([
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'info',
        message: 'Đã làm mới mã nguồn và xóa sạch nhật ký cũ.',
        time: new Date().toLocaleTimeString('vi-VN'),
      },
    ]);
  }, [htmlCode, cssCode, jsCode, updatePreviewSnapshot]);

  // Clear code
  const handleConfirmClear = useCallback(() => {
    if (isEditorReadOnly) {
      setIsClearModalOpen(false);
      return;
    }
    if (activeCollabProject && collabProviderInstance) {
      collabProviderInstance.setTabCode(activeTab, '');
    } else {
      if (activeTab === 'html') setHtmlCode('');
      else if (activeTab === 'css') setCssCode('');
      else if (activeTab === 'js') setJsCode('');
    }

    setConsoleMessages([]);
    setIsClearModalOpen(false);
  }, [activeTab, isEditorReadOnly, activeCollabProject, collabProviderInstance]);

  // Copy combined code
  const handleCopy = useCallback(async () => {
    const fullCode = combineCode(htmlCode, cssCode, jsCode);
    try {
      await navigator.clipboard.writeText(fullCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [htmlCode, cssCode, jsCode]);

  // Toggle layout
  const handleToggleLayout = useCallback(() => {
    setLayout((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  }, []);


  // Select sample template
  const handleSelectTemplate = useCallback((template: CodeTemplate) => {
    if (isEditorReadOnly) {
      showToast('Bạn đang ở chế độ chỉ xem, không thể áp dụng mẫu');
      return;
    }
    if (activeCollabProject && collabProviderInstance) {
      collabProviderInstance.setAllCode({
        htmlCode: template.htmlCode,
        cssCode: template.cssCode || '',
        jsCode: template.jsCode || '',
      });
    } else {
      setHtmlCode(template.htmlCode);
      setCssCode(template.cssCode || '');
      setJsCode(template.jsCode || '');
    }
    setActiveTemplateId(template.id);
    setConsoleMessages([]);
    setRefreshTrigger((prev) => prev + 1);
    if (!activeCollabProject || isCollabOwner) {
      setProjectTitle(template.name);
    }
  }, [isEditorReadOnly, activeCollabProject, collabProviderInstance, isCollabOwner, showToast]);

  // Resizer drag
  const handleResize = useCallback(
    (delta: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dimension = layout === 'horizontal' ? rect.width : rect.height;
      if (dimension <= 0) return;

      const deltaRatio = delta / dimension;
      setSplitRatio((prev) => {
        const next = prev + deltaRatio;
        return Math.min(Math.max(next, 0.18), 0.82);
      });
    },
    [layout]
  );

  // Format code helper for active tab
  const handleFormatCode = useCallback(() => {
    if (isEditorReadOnly) return;
    try {
      const current = activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode;
      const lines = current.split('\n');
      let indentLevel = 0;
      const formattedLines = lines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';

        if (trimmed.startsWith('</') || trimmed.startsWith('}')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        const indent = '  '.repeat(indentLevel);
        const result = `${indent}${trimmed}`;

        const isOpeningTag =
          trimmed.startsWith('<') &&
          !trimmed.startsWith('</') &&
          !trimmed.endsWith('/>') &&
          !trimmed.startsWith('<!') &&
          !trimmed.includes('</');
        const isOpeningBrace = trimmed.endsWith('{');

        if (isOpeningTag || isOpeningBrace) {
          indentLevel++;
        }

        return result;
      });

      const formatted = formattedLines.join('\n');
      if (activeCollabProject && collabProviderInstance) {
        collabProviderInstance.setTabCode(activeTab, formatted);
      } else {
        if (activeTab === 'html') setHtmlCode(formatted);
        else if (activeTab === 'css') setCssCode(formatted);
        else if (activeTab === 'js') setJsCode(formatted);
      }
    } catch {}
  }, [activeTab, htmlCode, cssCode, jsCode, isEditorReadOnly, activeCollabProject, collabProviderInstance]);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Open code from learning section directly into the 3-tab editor
  const handleOpenLessonInEditor = useCallback((code: string) => {
    setActiveCollabProject(null);
    setActiveProject(null);
    setActiveLanguages(['html', 'css', 'js']);

    const isPureJs =
      !code.trim().startsWith('<') &&
      (code.includes('console.log') ||
        code.includes('let ') ||
        code.includes('const ') ||
        code.includes('function') ||
        code.includes('alert('));

    if (isPureJs) {
      setJsCode(code);
      setHtmlCode('<div style="font-family: sans-serif; padding: 20px; text-align: center;">\n  <h2>Thực hành JavaScript</h2>\n  <p>Mở tab <strong>JS</strong> bên trái để xem mã, và xem kết quả in ra ở <strong>Bảng điều khiển (Console)</strong> bên dưới!</p>\n</div>');
      setCssCode('');
      setActiveTab('js');
      setProjectTitle('Thực hành bài học JavaScript');
      updatePreviewSnapshot(
        '<div style="font-family: sans-serif; padding: 20px; text-align: center;">\n  <h2>Thực hành JavaScript</h2>\n  <p>Mở tab <strong>JS</strong> bên trái để xem mã, và xem kết quả in ra ở <strong>Bảng điều khiển (Console)</strong> bên dưới!</p>\n</div>',
        '',
        code
      );
    } else {
      let extractedHtml = code;
      let extractedCss = '';
      let extractedJs = '';

      const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch) {
        extractedCss = styleMatch[1].trim();
        extractedHtml = extractedHtml.replace(styleMatch[0], '').trim();
      }

      const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch) {
        extractedJs = scriptMatch[1].trim();
        extractedHtml = extractedHtml.replace(scriptMatch[0], '').trim();
      }

      setHtmlCode(extractedHtml);
      setCssCode(extractedCss);
      setJsCode(extractedJs);
      setActiveTab(extractedJs ? 'js' : 'html');
      setProjectTitle('Thực hành bài học lập trình');
      updatePreviewSnapshot(extractedHtml, extractedCss, extractedJs);
    }

    setRefreshTrigger((prev) => prev + 1);
    setHasUnsavedChanges(true);
    setIsLearningOpen(false);
  }, [updatePreviewSnapshot]);

  // Share URL calculation
  const currentShareUrl = useMemo(() => {
    if (!currentUser || !activeProject) return '';
    return `${window.location.origin}${window.location.pathname}?share=${currentUser.uid}&project=${activeProject.id}`;
  }, [currentUser, activeProject]);

  return (
    <>
      <BackgroundLayer isTestPatternActive={isTestPatternActive} />

      <div
        id="app-content-wrapper"
        className="relative z-[1] bg-transparent h-viewport w-full max-w-full flex flex-col overflow-hidden text-primary font-sans transition-colors duration-200"
      >
        {isLearningOpen ? (
          <div className="flex-1 min-h-0 overflow-hidden">
            <LearnPage
              onBackToEditor={() => setIsLearningOpen(false)}
              onOpenInEditor={handleOpenLessonInEditor}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          </div>
        ) : (
          <>
            {/* Firebase Config Missing Warning Banner */}
      {!isFirebaseConfigValid && (
        <div className="bg-warning-soft border-b border-[var(--color-warning)]/30 text-warning px-4 pl-safe pr-safe py-1.5 text-xs font-medium flex items-center justify-between gap-2 z-30 flex-shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
            <span className="min-w-0 break-words">
              <strong>Chưa cấu hình Firebase:</strong> {firebaseConfigError || 'Thiếu thông tin kết nối.'} Ứng dụng đang chạy ở chế độ Khách (Guest mode).
            </span>
          </div>
          <button
            onClick={() => setIsCloudDiagnosticOpen(true)}
            className="touch-target-h px-2.5 py-0.5 rounded bg-elevated hover:bg-hover text-primary border border-[var(--color-warning)]/40 text-[11px] font-semibold transition-all cursor-pointer flex-shrink-0"
          >
            Kiểm tra
          </button>
        </div>
      )}

      {/* Top Header Toolbar (Slim 48px height, hidden in Zen mode) */}
      {workspacePreset !== 'zen' && (
        <Header
          onRun={handleRun}
          onClear={() => setIsClearModalOpen(true)}
          onCopy={handleCopy}
          onOpenDownload={() => setIsDownloadModalOpen(true)}
          onFormatCode={handleFormatCode}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          isFullscreen={isFullscreen}
          layout={layout}
          onToggleLayout={handleToggleLayout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onSelectTemplate={handleSelectTemplate}
          isCopied={isCopied}
          activeTemplateId={activeTemplateId}
          activePreset={workspacePreset}
          onSetWorkspacePreset={handleSetWorkspacePreset}
          activeView={isLearningOpen ? 'learn' : 'editor'}
          onViewChange={(v) => setIsLearningOpen(v === 'learn')}
          onOpenLearn={() => setIsLearningOpen(true)}
          onOpenPersonalize={() => setIsPersonalizeOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          currentProjectTitle={projectTitle}
          currentProjectDescription={activeCollabProject?.description || activeProject?.description}
          onUpdateProjectTitle={(t) => {
            if (activeCollabProject && !isCollabOwner) return;
            setProjectTitle(t);
            if (activeCollabProject && isCollabOwner) {
              updateCollabProjectMeta(
                activeCollabProject.id,
                { title: t },
                activeCollabProject.inviteToken
              ).catch(() => {});
            } else {
              setHasUnsavedChanges(true);
            }
          }}
          onManualSave={handleManualSave}
          cloudSaveStatus={cloudSaveStatus}
          hasUnsavedChanges={hasUnsavedChanges}
          onOpenProjects={() => setIsProjectsPanelOpen(true)}
          projectCount={projects.length + collabProjects.length}
          onOpenAuth={openAuth}
          isProjectShared={activeProject?.isShared}
          onOpenShare={() => setIsShareModalOpen(true)}
          isSharedView={isSharedView}
          sharedAuthorEmail={sharedAuthorEmail}
          onForkProject={handleForkProject}
          onExitSharedView={handleExitSharedView}
          onOpenCloudDiagnostic={() => setIsCloudDiagnosticOpen(true)}
          isCollabProject={!!activeCollabProject}
          collabRole={activeCollabRole}
          collabMemberCount={activeCollabProject ? Object.keys(activeCollabProject.members).length : 0}
          collabSyncState={collabSyncState}
          canEditTitle={!activeCollabProject || isCollabOwner}
          onOpenCollabInvite={() => {
            if (activeCollabProject) setInviteModalProjectId(activeCollabProject.id);
          }}
          onOpenCollabMembers={() => {
            if (activeCollabProject) setMembersModalProjectId(activeCollabProject.id);
          }}
          collabProject={activeCollabProject}
          onlineUsers={onlineUsers}
          followingUid={followingUid}
          onToggleFollow={handleToggleFollowUser}
          onJumpToUser={handleJumpToUser}
          onChangeCollabRole={handleChangeCollabMemberRole}
          hideRemoteCursors={hideRemoteCursors}
          onToggleHideRemoteCursors={handleToggleHideRemoteCursors}
          hideOwnCursor={hideOwnCursor}
          onToggleHideOwnCursor={handleToggleHideOwnCursor}
        />
      )}

      {/* Connection-lost calm banner for collaborative projects */}
      {activeCollabProject &&
        !isSharedView &&
        (!isBrowserOnline || collabSyncState === 'offline' || (Boolean(rtdb) && !isPresenceConnected)) && (
          <div className="bg-warning-soft border-b border-[var(--color-warning)]/30 text-warning px-4 pl-safe pr-safe py-1.5 text-xs font-medium flex flex-wrap items-center justify-center text-center gap-2 z-20 flex-shrink-0 animate-in fade-in">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
            <span>
              Mất kết nối — các thay đổi đang được lưu tạm và sẽ tự đồng bộ lại khi có mạng.
            </span>
          </div>
        )}

      {/* One-time Privacy Notice in collaborative mode */}
      {activeCollabProject && !isSharedView && showCollabPrivacyNotice && (
        <div
          role="region"
          aria-label="Thông báo quyền riêng tư cộng tác"
          className="bg-accent-soft border-b border-[var(--accent-base)]/25 text-primary px-4 pl-safe pr-safe py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 sm:gap-3 z-20 flex-shrink-0"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" strokeWidth={1.75} />
            <span className="min-w-0 break-words">
              Thành viên nhóm sẽ thấy tên và vị trí con trỏ của bạn khi bạn chỉnh sửa.
            </span>
          </div>
          <div className="flex items-center touch-gap gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleToggleHideOwnCursor}
              aria-pressed={hideOwnCursor}
              className={`touch-target-h h-6 px-2 rounded-[var(--radius-xs)] border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
                hideOwnCursor
                  ? 'bg-accent text-accent-on border-transparent'
                  : 'bg-elevated border-default text-secondary hover:text-primary'
              }`}
            >
              <EyeOff className="w-3 h-3" />
              <span>{hideOwnCursor ? 'Đang ẩn vị trí con trỏ' : 'Ẩn vị trí con trỏ của tôi'}</span>
            </button>
            <button
              type="button"
              onClick={handleDismissPrivacyNotice}
              aria-label="Đã hiểu thông báo quyền riêng tư"
              className="touch-target-h h-6 px-2.5 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-[var(--accent-base)] text-[11px] font-medium text-primary transition-colors cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none"
            >
              Đã hiểu
            </button>
            <button
              type="button"
              onClick={handleDismissPrivacyNotice}
              aria-label="Đóng thông báo"
              className="touch-target p-1 rounded-[var(--radius-xs)] text-muted hover:text-primary cursor-pointer flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Mode Tabs (<768px): Code | Xem trước */}
      {workspacePreset !== 'zen' && (
        <div className="md:hidden min-h-[44px] py-1 pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] bg-elevated border-b border-subtle flex items-center justify-between gap-2 flex-shrink-0 z-20">
          <div className="touch-gap inline-flex p-0.5 bg-[var(--border-subtle)] rounded-[var(--radius-sm)] border border-default text-xs font-medium">
            <button
              type="button"
              onClick={() => setMobileTab('code')}
              className={`touch-target-h px-3.5 py-1 rounded-[calc(var(--radius-sm)-2px)] transition-all cursor-pointer ${
                mobileTab === 'code'
                  ? 'bg-accent text-accent-on shadow-xs font-semibold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Code
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`touch-target-h px-3.5 py-1 rounded-[calc(var(--radius-sm)-2px)] transition-all cursor-pointer ${
                mobileTab === 'preview'
                  ? 'bg-accent text-accent-on shadow-xs font-semibold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Xem trước
            </button>
          </div>
          <span className="text-[11px] text-muted font-mono truncate">
            {mobileTab === 'code' ? `Tab: ${activeTab.toUpperCase()}` : 'Xem trước trực tiếp'}
          </span>
        </div>
      )}

      {/* Main Body with Activity Bar + Workspaces */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        {/* Activity Bar on Left (Desktop/Tablet >=768px) or Bottom Bar (<768px) */}
        {workspacePreset !== 'zen' && isActivityBarVisible && (
          <ActivityBar
            activeView={isLearningOpen ? 'learn' : 'editor'}
            onViewChange={(v) => setIsLearningOpen(v === 'learn')}
            onOpenProjects={() => setIsProjectsPanelOpen(true)}
            onOpenTemplates={() => setIsTemplatesDrawerOpen(true)}
            onOpenPersonalize={() => setIsPersonalizeOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onToggleActivityBar={handleToggleActivityBar}
            isProjectsOpen={isProjectsPanelOpen}
            isTemplatesOpen={isTemplatesDrawerOpen}
            isPersonalizeOpen={isPersonalizeOpen}
            hideMobileNav={viewport.isKeyboardOpen}
          />
        )}

        {/* Split Container */}
        <div
          ref={containerRef}
          className={`flex-1 flex min-w-0 min-h-0 overflow-hidden relative order-1 md:order-2 ${
            isFullscreen || workspacePreset === 'focus-preview'
              ? 'flex-col'
              : layout === 'horizontal' && workspacePreset !== 'focus-code' && workspacePreset !== 'zen'
              ? 'flex-col md:flex-row'
              : 'flex-col'
          }`}
        >
          {/* Editor Pane (Left or Top) */}
          {(!isSplitDesktop ? workspacePreset !== 'zen' : !isFullscreen && workspacePreset !== 'focus-preview') && (
            <div
              style={
                !isSplitDesktop || workspacePreset === 'focus-code' || workspacePreset === 'zen'
                  ? { flex: '1 1 100%', minWidth: 0, minHeight: 0 }
                  : {
                      flex: `0 0 ${splitRatio * 100}%`,
                      minWidth: layout === 'horizontal' ? (viewport.width < 1024 ? '190px' : '240px') : 0,
                      minHeight: layout === 'vertical' ? '140px' : 0,
                    }
              }
              className={`flex-col overflow-hidden transition-[flex-basis] duration-75 relative z-10 min-w-0 min-h-0 ${
                mobileTab === 'preview' && workspacePreset !== 'zen' ? 'hidden md:flex' : 'flex'
              }`}
            >
              <EditorPane
                activeTab={activeTab}
                onTabChange={handleEditorTabChange}
                htmlCode={htmlCode}
                cssCode={cssCode}
                jsCode={jsCode}
                onHtmlChange={setHtmlCode}
                onCssChange={setCssCode}
                onJsChange={setJsCode}
                theme={theme}
                onFormatCode={handleFormatCode}
                isReadOnly={isEditorReadOnly}
                readOnlyBadgeText={isCollabViewer ? 'Chế độ chỉ xem' : 'Chỉ đọc'}
                enabledLanguages={activeLanguages}
                onAddLanguage={handleAddLanguage}
                onRemoveLanguage={handleRequestRemoveLanguage}
                collabProjectId={activeCollabProject?.id}
                collabYDoc={collabProviderInstance?.ydoc ?? null}
                collabSyncReady={collabDocReady}
                collabUndoManagers={collabProviderInstance?.undoManagers ?? null}
                onlineUsers={onlineUsers}
                remoteSessions={remoteSessions}
                currentUserId={currentUser?.uid || ''}
                followingUser={followingUser}
                onStopFollowing={() => setFollowingUid(null)}
                jumpTarget={jumpTarget}
                cursorJumpTarget={cursorJumpTarget}
                appliedHighlightTarget={appliedHighlightTarget}
                remoteInsertFlashes={remoteInsertFlashes}
                onLocalCursorChange={handleLocalCursorChange}
                onLocalTyping={handleLocalTyping}
                onLocalInteraction={handleLocalEditorInteraction}
                hideRemoteCursors={hideRemoteCursors}
                onCompositionChange={handleCompositionChange}
                lineComments={collabLineComments}
                projectOwnerId={activeCollabProject?.ownerId || ''}
                onAddLineComment={handleAddLineComment}
                onReplyLineComment={handleReplyLineComment}
                onToggleResolveLineComment={handleToggleResolveLineComment}
                onDeleteLineComment={handleDeleteLineComment}
              />
            </div>
          )}

          {/* Draggable Resizer (Desktop only in split view) */}
          {!isFullscreen && workspacePreset !== 'focus-code' && workspacePreset !== 'focus-preview' && workspacePreset !== 'zen' && (
            <div className="hidden md:flex flex-shrink-0">
              <Resizer layout={layout} theme={theme} onResize={handleResize} />
            </div>
          )}

          {/* Preview Pane (Right or Bottom) */}
          {(!isSplitDesktop ? workspacePreset !== 'zen' : workspacePreset !== 'focus-code' && workspacePreset !== 'zen') && (
            <div
              style={
                !isSplitDesktop || isFullscreen || workspacePreset === 'focus-preview'
                  ? { flex: '1 1 100%', minWidth: 0, minHeight: 0 }
                  : {
                      flex: `0 0 ${(1 - splitRatio) * 100}%`,
                      minWidth: !isFullscreen && layout === 'horizontal' ? (viewport.width < 1024 ? '190px' : '240px') : 0,
                      minHeight: !isFullscreen && layout === 'vertical' ? '160px' : 0,
                    }
              }
              className={`flex-col flex-1 overflow-hidden relative z-10 min-w-0 min-h-0 ${
                mobileTab === 'code' ? 'hidden md:flex' : 'flex'
              }`}
            >
              <PreviewPane
                compiledSrcDoc={compiledPreview.srcDoc}
                sourceMap={compiledPreview.sourceMap}
                channelToken={compiledPreview.token}
                previewCodes={previewSnapshot}
                theme={theme}
                onRefresh={handleRun}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                refreshTrigger={refreshTrigger}
                consoleMessages={consoleMessages}
                staticIssues={staticIssues}
                onRuntimeMessage={handleRuntimeMessage}
                onClearConsole={() => setConsoleMessages([])}
                onJumpToLocation={handleJumpToLocation}
                isCollabMode={Boolean(activeCollabProject && !isSharedView)}
                syncPreviewEnabled={syncPreviewEnabled}
                onToggleSyncPreview={() => setSyncPreviewEnabled((prev) => !prev)}
                syncedPreviewState={syncedPreviewState}
                currentUserId={currentUser?.uid || ''}
                onPublishPreviewSync={handlePublishPreviewSync}
              />
            </div>
          )}

          {/* Floating Run Button on Mobile Preview */}
          {mobileTab === 'preview' && workspacePreset !== 'zen' && !viewport.isKeyboardOpen && (
            <button
              onClick={handleRun}
              className="md:hidden fixed bottom-[calc(4.5rem+var(--safe-bottom))] right-[calc(1rem+var(--safe-right))] z-40 w-12 h-12 rounded-full bg-success hover:opacity-95 text-white shadow-[var(--shadow-elevated)] flex items-center justify-center active:scale-95 transition-all focus:outline-none cursor-pointer"
              title="Chạy lại mã"
              aria-label="Chạy lại mã"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" strokeWidth={1.5} />
            </button>
          )}

          {/* Zen Mode Minimal Floating Bar */}
          {workspacePreset === 'zen' && (
            <div className="touch-gap fixed bottom-[calc(1.25rem+var(--safe-bottom))] right-[calc(1.25rem+var(--safe-right))] z-50 flex items-center gap-1.5 p-1 bg-elevated/95 backdrop-blur-md border border-default rounded-[var(--radius-sm)] shadow-[var(--shadow-elevated)] animate-in fade-in duration-200">
              <button
                onClick={handleRun}
                className="touch-target h-7 px-3 text-xs font-semibold text-white bg-success hover:opacity-95 rounded-[calc(var(--radius-sm)-2px)] flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Chạy lại mã"
                aria-label="Chạy lại mã"
              >
                <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                <span>Chạy</span>
              </button>
              <button
                onClick={() => handleSetWorkspacePreset('split-horizontal')}
                className="touch-target h-7 px-2.5 text-xs font-medium text-secondary hover:text-primary hover:bg-[var(--border-subtle)] rounded-[calc(var(--radius-sm)-2px)] flex items-center gap-1.5 cursor-pointer"
                title="Thoát chế độ Zen"
                aria-label="Thoát chế độ Zen"
              >
                <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Thoát Zen</span>
                <Kbd>ESC</Kbd>
              </button>
            </div>
          )}
        </div>

        {/* Mobile credit strip above mobile bottom nav */}
        {workspacePreset !== 'zen' && !viewport.isKeyboardOpen && (
          <div className="md:hidden order-2 h-6 px-3 bg-elevated/90 glass-panel border-t border-subtle flex items-center justify-center text-[11px] text-muted select-none flex-shrink-0">
            <span className="truncate">Được tạo bởi tổ 4 — 12C6 — 2024-2027</span>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clearing Code */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        title={`Xóa trắng mã nguồn tab ${activeTab.toUpperCase()}?`}
        message={`Hành động này sẽ xóa toàn bộ nội dung trong tab ${activeTab.toUpperCase()}. Bạn có thể dùng Ctrl+Z để hoàn tác.`}
        confirmText="Xóa tab này"
        cancelText="Hủy bỏ"
        isDangerous={true}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearModalOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalInitialMode}
        onWarning={(msg) => showToast(msg)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Cloud Diagnostic Modal */}
      <CloudDiagnosticModal
        isOpen={isCloudDiagnosticOpen}
        onClose={() => setIsCloudDiagnosticOpen(false)}
      />

      {/* Projects Drawer Panel */}
      <ProjectsPanel
        isOpen={isProjectsPanelOpen}
        onClose={() => setIsProjectsPanelOpen(false)}
        projects={projects}
        activeProjectId={activeProject?.id}
        onSelectProject={handleSelectProject}
        onCreateNewProject={handleOpenNewProjectModal}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        onEditProject={handleOpenEditProjectModal}
        onConvertToCollab={handleConvertPersonalToCollab}
        collabProjects={collabProjects}
        activeCollabProjectId={activeCollabProject?.id}
        currentUserId={currentUser?.uid || ''}
        onSelectCollabProject={handleSelectCollabProject}
        onRenameCollabProject={handleRenameCollabProject}
        onDeleteCollabProject={handleDeleteCollabProject}
        onEditCollabProject={handleOpenEditCollabProjectModal}
        onOpenCollabInvite={(cp) => setInviteModalProjectId(cp.id)}
        onOpenCollabMembers={(cp) => setMembersModalProjectId(cp.id)}
        onLeaveCollabProject={handleLeaveCollabProject}
        isLoading={isProjectsLoading}
        error={projectsLoadError}
        isGuest={!currentUser}
        onOpenAuth={() => openAuth('login')}
        onRetry={() => {
          if (currentUser) {
            loadUserProjectsAndLastActive(currentUser.uid);
          } else {
            setProjects(getGuestProjects());
          }
        }}
      />

      {/* Templates Drawer */}
      <TemplatesDrawer
        isOpen={isTemplatesDrawerOpen}
        onClose={() => setIsTemplatesDrawerOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        activeTemplateId={activeTemplateId}
      />

      {/* Personalization Drawer */}
      <PersonalizationDrawer
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        onTriggerTestPattern={handleTriggerTestPattern}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onRun={handleRun}
        onSave={handleManualSave}
        onNewProject={() => handleOpenNewProjectModal('personal')}
        onFormatCode={handleFormatCode}
        onCopy={handleCopy}
        onDownload={() => setIsDownloadModalOpen(true)}
        onShare={() => setIsShareModalOpen(true)}
        onClear={() => setIsClearModalOpen(true)}
        onToggleTheme={handleToggleTheme}
        theme={theme}
        onSetWorkspacePreset={handleSetWorkspacePreset}
        activePreset={workspacePreset}
        onToggleActivityBar={handleToggleActivityBar}
        isActivityBarVisible={isActivityBarVisible}
        onOpenPersonalize={() => setIsPersonalizeOpen(true)}
        onOpenProjects={() => setIsProjectsPanelOpen(true)}
        onOpenTemplates={() => setIsTemplatesDrawerOpen(true)}
        onOpenLearn={() => setIsLearningOpen(true)}
        projects={projects}
        onSelectProject={handleSelectProject}
      />

      {/* Project Creation & Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
          setEditingCollabProject(null);
        }}
        mode={projectModalMode}
        defaultProjectType={defaultNewProjectType}
        initialData={
          editingCollabProject ||
          editingProject ||
          (projectModalMode === 'edit' ? activeCollabProject || activeProject : null)
        }
        existingProjects={projects}
        onSubmit={handleProjectFormSubmit}
        isGuest={!currentUser}
        onOpenAuth={() => openAuth('login')}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={!!resolvedInviteModalProject}
        onClose={() => setInviteModalProjectId(null)}
        project={resolvedInviteModalProject}
        onUpdateInvite={async (options) => {
          if (!resolvedInviteModalProject || !currentUser) return;
          await updateCollabInviteSettings(resolvedInviteModalProject, currentUser, options);
          if (options.regenerateToken) {
            showToast('Đã tạo liên kết mời mới');
          }
        }}
      />

      {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={!!resolvedMembersModalProject}
        onClose={() => setMembersModalProjectId(null)}
        project={resolvedMembersModalProject}
        currentUserId={currentUser?.uid || ''}
        onChangeRole={async (targetUid, role: CollabInviteRole) => {
          if (!resolvedMembersModalProject) return;
          await changeCollabMemberRole(resolvedMembersModalProject.id, targetUid, role);
          showToast('Đã cập nhật vai trò thành viên');
        }}
        onRemoveMember={async (targetUid) => {
          if (!resolvedMembersModalProject) return;
          await removeCollabMember(resolvedMembersModalProject.id, targetUid);
          showToast('Đã xóa thành viên khỏi dự án nhóm');
        }}
        onTransferOwnership={async (newOwnerUid) => {
          if (!resolvedMembersModalProject || !currentUser) return;
          await transferCollabOwnership(resolvedMembersModalProject, currentUser.uid, newOwnerUid);
          showToast('Đã chuyển quyền chủ sở hữu dự án');
        }}
        onLeaveProject={async () => {
          if (!resolvedMembersModalProject) return;
          await handleLeaveCollabProject(resolvedMembersModalProject);
        }}
        onOpenInvite={() => {
          if (resolvedMembersModalProject) {
            setInviteModalProjectId(resolvedMembersModalProject.id);
          }
        }}
      />

      {/* Confirmation Modal to optionally delete old personal copy after converting to team project */}
      <ConfirmModal
        isOpen={!!pendingRemovePersonalAfterConvert}
        title="Đã chuyển thành dự án nhóm"
        message={`Dự án "${pendingRemovePersonalAfterConvert?.title || ''}" đã được sao chép sang mục Dự án nhóm. Bạn có muốn xóa bản cá nhân cũ hay giữ lại?`}
        confirmText="Xóa bản cá nhân cũ"
        cancelText="Giữ lại bản cá nhân"
        isDangerous={true}
        onConfirm={async () => {
          const target = pendingRemovePersonalAfterConvert;
          setPendingRemovePersonalAfterConvert(null);
          if (target) {
            await handleDeleteProject(target.id);
          }
        }}
        onCancel={() => setPendingRemovePersonalAfterConvert(null)}
      />

      {/* Confirmation Modal for Removing Language Tab */}
      <ConfirmModal
        isOpen={isConfirmRemoveTabOpen}
        title={`Ẩn tab ${pendingRemoveLang === 'css' ? 'CSS' : 'JavaScript'}?`}
        message={`Mã nguồn trong tab ${
          pendingRemoveLang === 'css' ? 'CSS' : 'JavaScript'
        } của bạn vẫn được lưu giữ nguyên vẹn và an toàn. Bạn có thể mở lại bất cứ lúc nào qua nút "+".`}
        confirmText="Ẩn tab"
        cancelText="Giữ lại"
        isDangerous={false}
        onConfirm={() => {
          if (pendingRemoveLang) {
            executeRemoveLanguage(pendingRemoveLang);
            setPendingRemoveLang(null);
          }
          setIsConfirmRemoveTabOpen(false);
        }}
        onCancel={() => {
          setPendingRemoveLang(null);
          setIsConfirmRemoveTabOpen(false);
        }}
      />

      {/* Global Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        type={toastType}
        actionLabel={toastActionLabel}
        onAction={() => {
          const cb = toastActionCallbackRef.current;
          setIsToastVisible(false);
          setToastActionLabel(undefined);
          toastActionCallbackRef.current = undefined;
          cb?.();
        }}
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        defaultTitle={projectTitle}
        code={combineCode(htmlCode, cssCode, jsCode)}
      />

      {/* Guest-to-Login Prompt Modal */}
      <GuestPromptModal
        isOpen={isGuestPromptOpen}
        onSaveAsNew={handleSaveGuestCodeAsNew}
        onDiscard={handleDiscardGuestCode}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        isShared={!!activeProject?.isShared}
        shareUrl={currentShareUrl}
        onToggleShare={handleToggleShare}
        projectTitle={projectTitle}
      />

      {/* Dev Token Inspector */}
      <TokenInspectorModal />

      {/* Team Chat Strip (Stage 4) */}
      {activeCollabProject && currentUser && !isSharedView && (
        <CollabChatStrip
          projectId={activeCollabProject.id}
          currentUserId={currentUser.uid}
          projectOwnerId={activeCollabProject.ownerId}
          messages={collabChatMessages}
          soundEnabled={chatSoundEnabled}
          onToggleSound={handleToggleChatSound}
          onSendMessage={handleSendChatMessage}
          onDeleteMessage={handleDeleteChatMessage}
          hidden={workspacePreset === 'zen'}
          isKeyboardOpen={viewport.isKeyboardOpen}
          liftAboveMobileRun={mobileTab === 'preview' && !isSplitDesktop}
        />
      )}
          </>
        )}

        {/* Global Website Credit Footer */}
        {(isLearningOpen || workspacePreset !== 'zen') && (
          <footer
            role="contentinfo"
            className={`${
              isLearningOpen
                ? 'flex min-h-[calc(24px+var(--safe-bottom))] pb-safe'
                : 'hidden md:flex h-6'
            } px-4 bg-elevated glass-panel border-t border-subtle items-center justify-center text-[11px] text-muted select-none flex-shrink-0 z-20`}
          >
            <span className="truncate">Được tạo bởi tổ 4 — 12C6 — 2024-2027</span>
          </footer>
        )}
      </div>
    </>
  );
}
