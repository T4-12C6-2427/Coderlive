/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
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
import { FpsMeter } from './components/FpsMeter';
import { CloudDiagnosticModal } from './components/CloudDiagnosticModal';
import { InviteMemberModal } from './components/collab/InviteMemberModal';
import { MemberManagementModal } from './components/collab/MemberManagementModal';
import { CollabChatStrip } from './components/collab/CollabChatStrip';
import { BackgroundLayer } from './components/background/BackgroundLayer';
import { useTheme } from './contexts/ThemeContext';
import { Toast } from './components/ui/Feedback';
import { useVisualViewport } from './hooks/useViewport';
import {
  CANONICAL_LANGUAGES,
  LanguageId,
  RunHiddenTabs,
  getEffectivePreviewCodes,
  getNearestVisibleTab,
  getTabViewStorageKey,
  loadTabViewSettings,
  loadWorkspaceViewState,
  normalizeLanguages,
  saveTabViewSettings,
  saveWorkspaceViewState,
} from './lib/editorWorkspaceUtils';
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
  GuestDraft,
  RecentProjectRef,
  capturePreviousGuestDraftOnStartup,
  deleteGuestDraft,
  getGuestDrafts,
  getRecentProjects,
  recordRecentProject,
  removeRecentProject,
} from './lib/draftsAndRecents';
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
  TABS_CODE: 'coderlive_code_tabs_v2',
  LEGACY_CODE: 'coderlive_code_content_v1',
  LAYOUT: 'coderlive_layout_mode_v1',
  THEME: 'coderlive_theme_mode_v1',
  SPLIT_RATIO: 'coderlive_split_ratio_v1',
  LAST_PROJECT_PREFIX: 'coderlive_last_project_',
  ACTIVITY_BAR: 'coderlive_activity_bar_visible_v1',
  COLLAB_PRIVACY_NOTICE_SEEN: 'coderlive_collab_privacy_notice_seen_v1',
};

export default function App() {
  const viewport = useVisualViewport();
  const isSplitDesktop = viewport.width >= 768;
  const { currentUser, loading: authLoading } = useAuth();
  const { settings, updateSettings, toggleThemeMode } = useTheme();
  const theme = settings.mode;
  const handleToggleTheme = toggleThemeMode;
  const isFpsVisible = settings.showFps ?? isSplitDesktop;
  const handleToggleFps = useCallback(() => {
    updateSettings({ showFps: !isFpsVisible });
  }, [isFpsVisible, updateSettings]);

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

  // Code state: Always start completely empty on startup
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');

  // Debounced snapshot cho sandbox preview iframe + source map + channel token
  const [previewSnapshot, setPreviewSnapshot] = useState<{
    html: string;
    css: string;
    js: string;
  }>({ html: '', css: '', js: '' });
  const lastCompiledCodesRef = useRef<{ html: string; css: string; js: string }>({
    html: '',
    css: '',
    js: '',
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
  const [activeTemplateId, setActiveTemplateId] = useState<string | undefined>(undefined);

  // Initial per-user workspace view state (preset, splitRatio)
  const initialWorkspaceView = useMemo(() => loadWorkspaceViewState(currentUser?.uid), []);

  // Split ratio for resizer
  const [splitRatio, setSplitRatio] = useState<number>(initialWorkspaceView.splitRatio);

  // Project and Cloud Persistence States
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [collabProjects, setCollabProjects] = useState<CollabProject[]>([]);
  const [activeCollabProject, setActiveCollabProject] = useState<CollabProject | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('Dự án chưa đặt tên');
  const [cloudSaveStatus, setCloudSaveStatus] = useState<CloudSaveStatus>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(false);
  const [projectsLoadError, setProjectsLoadError] = useState<string | null>(null);
  const [guestDrafts, setGuestDrafts] = useState<GuestDraft[]>(() => getGuestDrafts());
  const [recentProjects, setRecentProjects] = useState<RecentProjectRef[]>([]);
  const [isSavingScratchToNewProject, setIsSavingScratchToNewProject] = useState<boolean>(false);
  const [pendingTemplate, setPendingTemplate] = useState<CodeTemplate | null>(null);
  const hasCapturedGuestDraftRef = useRef<boolean>(false);

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

  // Active Languages for Tabs ('html' | 'css' | 'js') & whether hidden tabs still contribute to preview
  const initialScratchTabView = useMemo(
    () =>
      loadTabViewSettings(
        getTabViewStorageKey({ isSharedView: false, collabProjectId: null, projectId: null, userId: null }),
        CANONICAL_LANGUAGES
      ),
    []
  );
  const [activeLanguages, setActiveLanguages] = useState<LanguageId[]>(initialScratchTabView.languages);
  const [runHiddenTabs, setRunHiddenTabs] = useState<RunHiddenTabs>(initialScratchTabView.runHiddenTabs);

  // Project Modal State (Create & Edit)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Tab removal confirmation state
  const [isConfirmRemoveTabOpen, setIsConfirmRemoveTabOpen] = useState<boolean>(false);
  const [pendingRemoveLang, setPendingRemoveLang] = useState<'css' | 'js' | null>(null);
  const [keepHiddenCodeInPreview, setKeepHiddenCodeInPreview] = useState<boolean>(true);

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
    setIsSavingScratchToNewProject(false);
    setProjectModalMode('create');
    setEditingProject(null);
    setEditingCollabProject(null);
    setDefaultNewProjectType(defaultType);
    setIsProjectModalOpen(true);
  }, []);

  const handleOpenEditProjectModal = useCallback((proj: Project) => {
    setIsSavingScratchToNewProject(false);
    setProjectModalMode('edit');
    setEditingProject(proj);
    setEditingCollabProject(null);
    setIsProjectModalOpen(true);
  }, []);

  const handleOpenEditCollabProjectModal = useCallback((proj: CollabProject) => {
    setIsSavingScratchToNewProject(false);
    setProjectModalMode('edit');
    setEditingProject(null);
    setEditingCollabProject(proj);
    setIsProjectModalOpen(true);
  }, []);

  // Workspace Preset (only split-horizontal / split-vertical)
  const [workspacePreset, setWorkspacePreset] = useState<WorkspacePreset>(initialWorkspaceView.preset);
  const [lastSplitPreset, setLastSplitPreset] = useState<'split-horizontal' | 'split-vertical'>(
    initialWorkspaceView.lastSplitPreset
  );
  const hydratedWorkspaceUidRef = useRef<string | null | undefined>(undefined);

  // Activity bar visibility state
  const [isActivityBarVisible, setIsActivityBarVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_BAR);
    return saved !== 'false';
  });

  // Command palette & drawer states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTemplatesDrawerOpen, setIsTemplatesDrawerOpen] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

  // Hydrate workspace view state when user changes
  useEffect(() => {
    if (authLoading) return;
    const uid = currentUser?.uid || null;
    if (hydratedWorkspaceUidRef.current === uid) return;
    hydratedWorkspaceUidRef.current = uid;
    const loaded = loadWorkspaceViewState(uid);
    setWorkspacePreset(loaded.preset);
    setSplitRatio(loaded.splitRatio);
    setLastSplitPreset(loaded.lastSplitPreset);
    setLayout(loaded.lastSplitPreset === 'split-vertical' ? 'vertical' : 'horizontal');
  }, [authLoading, currentUser?.uid]);

  // Persist workspace view state per user
  useEffect(() => {
    if (authLoading) return;
    saveWorkspaceViewState(currentUser?.uid, {
      preset: workspacePreset,
      splitRatio,
      lastSplitPreset,
    });
  }, [
    authLoading,
    currentUser?.uid,
    workspacePreset,
    splitRatio,
    lastSplitPreset,
  ]);

  const handleSetWorkspacePreset = useCallback((preset: WorkspacePreset) => {
    if (preset === 'split-vertical') {
      setLayout('vertical');
      setLastSplitPreset('split-vertical');
      setWorkspacePreset('split-vertical');
    } else {
      setLayout('horizontal');
      setLastSplitPreset('split-horizontal');
      setWorkspacePreset('split-horizontal');
    }
  }, []);

  const handleToggleActivityBar = useCallback(() => {
    setIsActivityBarVisible((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_BAR, String(next));
      return next;
    });
  }, []);

  // Global Keyboard shortcuts: Ctrl/Cmd+K (Command Palette), Ctrl+Alt+N (New Project)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenNewProjectModal();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleOpenNewProjectModal]);

  // Track previous user to detect guest-to-login transitions
  const prevUserRef = useRef<string | null>(null);
  const guestCodeSnapshotRef = useRef<{ html: string; css: string; js: string }>({ html: '', css: '', js: '' });

  // Console messages, static HTML/CSS checks & cursor jump target
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const consoleMessagesRef = useRef<ConsoleMessage[]>([]);
  consoleMessagesRef.current = consoleMessages;
  const [staticIssues, setStaticIssues] = useState<StaticIssue[]>([]);
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

  const isCodeEmpty = !htmlCode && !cssCode && !jsCode;

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

  // Warn before closing tab only when unsaved non-empty changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isCodeEmpty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isCodeEmpty]);

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
          setProjectTitle('Dự án chưa đặt tên');
          setHtmlCode('');
          setCssCode('');
          setJsCode('');
          setActiveTemplateId(undefined);
          setActiveLanguages(['html', 'css', 'js']);
          setRunHiddenTabs({ css: true, js: true });
          setActiveTab('html');
          updatePreviewSnapshot('', '', '');
          setStaticIssues([]);
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

  const currentTabViewKey = useMemo(
    () =>
      getTabViewStorageKey({
        isSharedView,
        collabProjectId: activeCollabProject?.id,
        projectId: activeProject?.id,
        userId: currentUser?.uid,
      }),
    [isSharedView, activeCollabProject?.id, activeProject?.id, currentUser?.uid]
  );

  const effectivePreviewCodes = useMemo(
    () =>
      getEffectivePreviewCodes(
        { html: htmlCode, css: cssCode, js: jsCode },
        activeLanguages,
        runHiddenTabs
      ),
    [htmlCode, cssCode, jsCode, activeLanguages, runHiddenTabs]
  );

  // Real-time preview update (debounce ~500ms, xóa lỗi cũ khi chạy lại bản mới)
  useEffect(() => {
    const timer = setTimeout(() => {
      const prev = lastCompiledCodesRef.current;
      if (
        prev.html === effectivePreviewCodes.html &&
        prev.css === effectivePreviewCodes.css &&
        prev.js === effectivePreviewCodes.js
      ) {
        return;
      }
      updatePreviewSnapshot(
        effectivePreviewCodes.html,
        effectivePreviewCodes.css,
        effectivePreviewCodes.js,
        true
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [effectivePreviewCodes, updatePreviewSnapshot]);

  const isPreviewEmpty =
    !previewSnapshot.html && !previewSnapshot.css && !previewSnapshot.js;

  const resetToBlankEditor = useCallback(() => {
    setActiveCollabProject(null);
    setActiveProject(null);
    setProjectTitle('Dự án chưa đặt tên');
    setHtmlCode('');
    setCssCode('');
    setJsCode('');
    setActiveTemplateId(undefined);
    setActiveLanguages(['html', 'css', 'js']);
    setRunHiddenTabs({ css: true, js: true });
    setActiveTab('html');
    updatePreviewSnapshot('', '', '', true);
    setStaticIssues([]);
    setCloudSaveStatus('idle');
    setHasUnsavedChanges(false);
  }, [updatePreviewSnapshot]);

  // Kiểm tra tĩnh HTML/CSS tự động (debounce ~250ms; bỏ qua khi trình soạn thảo trống)
  useEffect(() => {
    if (!effectivePreviewCodes.html && !effectivePreviewCodes.css && !effectivePreviewCodes.js) {
      setStaticIssues([]);
      return;
    }
    const timer = setTimeout(() => {
      setStaticIssues(runStaticChecks(effectivePreviewCodes.html, effectivePreviewCodes.css));
    }, 250);
    return () => clearTimeout(timer);
  }, [effectivePreviewCodes.html, effectivePreviewCodes.css, effectivePreviewCodes.js]);

  // On guest startup, preserve previous non-empty session scratch code as a draft in "Bản nháp gần nhất" (FIFO max 5)
  useEffect(() => {
    if (authLoading || currentUser || isSharedView) return;
    if (hasCapturedGuestDraftRef.current) return;
    hasCapturedGuestDraftRef.current = true;

    const { capturedDraft, drafts } = capturePreviousGuestDraftOnStartup();
    setGuestDrafts(drafts);
    if (capturedDraft) {
      showToast('Đã lưu bản nháp của phiên trước trong mục Dự án', 'info', {
        durationMs: 4500,
      });
    }
  }, [authLoading, currentUser, isSharedView, showToast]);

  // Guest local storage scratch auto-save (only after auth resolved and when code is non-empty)
  useEffect(() => {
    if (authLoading || currentUser || isSharedView || activeCollabProject || activeProject) return;
    if (htmlCode || cssCode || jsCode) {
      localStorage.setItem(
        STORAGE_KEYS.TABS_CODE,
        JSON.stringify({ htmlCode, cssCode, jsCode, title: projectTitle })
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.TABS_CODE);
    }
  }, [authLoading, htmlCode, cssCode, jsCode, projectTitle, currentUser, isSharedView, activeCollabProject, activeProject]);

  // Track unsaved changes when editing scratch code outside any saved project
  useEffect(() => {
    if (authLoading || activeProject || activeCollabProject || isSharedView) return;
    setHasUnsavedChanges(!isCodeEmpty);
  }, [authLoading, activeProject, activeCollabProject, isSharedView, isCodeEmpty]);

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

  // Load guest projects list when not logged in (never auto-open on startup)
  useEffect(() => {
    if (authLoading || currentUser || isSharedView) return;
    setProjects(getGuestProjects());
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
        const hasGuestWork = Boolean(htmlCode.trim() || cssCode.trim() || jsCode.trim());
        if (hasGuestWork) {
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
      setRecentProjects([]);
      resetToBlankEditor();
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

  // Load projects from Firestore without auto-opening or auto-creating a starter project
  const loadUserProjectsAndLastActive = async (uid: string) => {
    setIsProjectsLoading(true);
    setProjectsLoadError(null);
    try {
      const userProjects = await getUserProjects(uid);
      setProjects(userProjects);
      setRecentProjects(getRecentProjects(uid));
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
      setRecentProjects(
        recordRecentProject(currentUser.uid, {
          id: newProj.id,
          kind: 'personal',
          title: newProj.title,
        })
      );
      localStorage.setItem(`${STORAGE_KEYS.LAST_PROJECT_PREFIX}${currentUser.uid}`, newProj.id);
      localStorage.removeItem(STORAGE_KEYS.TABS_CODE);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_CODE);
      setCloudSaveStatus('saved');
      setHasUnsavedChanges(false);
      showToast('Đã lưu mã từ phiên khách thành dự án mới');
    } catch (err) {
      console.error('Lỗi khi lưu mã từ phiên khách:', err);
      setCloudSaveStatus('error');
    }
  };

  const handleDiscardGuestCode = () => {
    setIsGuestPromptOpen(false);
    resetToBlankEditor();
    localStorage.removeItem(STORAGE_KEYS.TABS_CODE);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_CODE);
    if (currentUser) {
      loadUserProjectsAndLastActive(currentUser.uid);
    }
  };

  // Manual Save (Cloud for logged-in personal & Collab flush/compaction, modal prompt for unsaved scratch code)
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

    if (!activeProject) {
      if (isCodeEmpty) {
        showToast('Chưa có code để lưu. Hãy nhập code trước khi lưu dự án.', 'info');
        return;
      }
      setIsSavingScratchToNewProject(true);
      setProjectModalMode('create');
      setEditingProject(null);
      setEditingCollabProject(null);
      setDefaultNewProjectType('personal');
      setIsProjectModalOpen(true);
      return;
    }

    const targetUid = currentUser?.uid || 'guest';
    setCloudSaveStatus('saving');
    try {
      await updateProject(targetUid, activeProject.id, {
        title: projectTitle,
        htmlCode,
        cssCode,
        jsCode,
        languages: activeLanguages,
      });
      setActiveProject((prev) =>
        prev
          ? {
              ...prev,
              title: projectTitle,
              htmlCode,
              cssCode,
              jsCode,
              languages: activeLanguages,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
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
  const handleSelectProject = useCallback(
    (project: Project) => {
      setActiveCollabProject(null);
      setActiveProject(project);
      setActiveTemplateId(undefined);
      setProjectTitle(project.title);
      setHtmlCode(project.htmlCode);
      setCssCode(project.cssCode || '');
      setJsCode(project.jsCode || '');
      const viewSettings = loadTabViewSettings(
        getTabViewStorageKey({ isSharedView: false, projectId: project.id, userId: currentUser?.uid }),
        normalizeLanguages(project.languages)
      );
      setActiveLanguages(viewSettings.languages);
      setRunHiddenTabs(viewSettings.runHiddenTabs);
      if (!viewSettings.languages.includes(activeTab)) {
        setActiveTab('html');
      }
      const eff = getEffectivePreviewCodes(
        { html: project.htmlCode, css: project.cssCode || '', js: project.jsCode || '' },
        viewSettings.languages,
        viewSettings.runHiddenTabs
      );
      updatePreviewSnapshot(eff.html, eff.css, eff.js);
      setCloudSaveStatus('idle');
      setHasUnsavedChanges(false);
      if (currentUser) {
        localStorage.setItem(`${STORAGE_KEYS.LAST_PROJECT_PREFIX}${currentUser.uid}`, project.id);
        setRecentProjects(
          recordRecentProject(currentUser.uid, {
            id: project.id,
            kind: 'personal',
            title: project.title,
          })
        );
      } else {
        localStorage.setItem('coderlive_last_guest_project', project.id);
      }
    },
    [activeTab, currentUser, updatePreviewSnapshot]
  );

  // Select collaborative team project (CollabProvider streams Y.Doc state live; visible tabs stay local per user)
  const handleSelectCollabProject = useCallback(
    async (collabProj: CollabProject) => {
      setActiveProject(null);
      setActiveCollabProject(collabProj);
      setActiveTemplateId(undefined);
      setProjectTitle(collabProj.title);
      const viewSettings = loadTabViewSettings(
        getTabViewStorageKey({
          isSharedView: false,
          collabProjectId: collabProj.id,
          userId: currentUser?.uid,
        }),
        normalizeLanguages(collabProj.languages)
      );
      setActiveLanguages(viewSettings.languages);
      setRunHiddenTabs(viewSettings.runHiddenTabs);
      if (!viewSettings.languages.includes(activeTab)) {
        setActiveTab('html');
      }
      if (currentUser) {
        setRecentProjects(
          recordRecentProject(currentUser.uid, {
            id: collabProj.id,
            kind: 'collab',
            title: collabProj.title,
          })
        );
      }
      setCloudSaveStatus('saved');
      setHasUnsavedChanges(false);
    },
    [activeTab, currentUser]
  );

  const handleOpenRecentProject = useCallback(
    async (item: RecentProjectRef) => {
      if (item.kind === 'collab') {
        const target = collabProjects.find((cp) => cp.id === item.id);
        if (target) {
          await handleSelectCollabProject(target);
        }
      } else {
        const target = projects.find((p) => p.id === item.id);
        if (target) {
          handleSelectProject(target);
        }
      }
    },
    [collabProjects, projects, handleSelectCollabProject, handleSelectProject]
  );

  const handleRestoreGuestDraft = useCallback(
    (draft: GuestDraft) => {
      setActiveCollabProject(null);
      setActiveProject(null);
      setActiveTemplateId(undefined);
      setProjectTitle(
        draft.title && draft.title !== 'Bản nháp chưa đặt tên'
          ? draft.title
          : 'Dự án chưa đặt tên'
      );
      setHtmlCode(draft.htmlCode);
      setCssCode(draft.cssCode);
      setJsCode(draft.jsCode);
      const langs = normalizeLanguages(draft.languages);
      setActiveLanguages(langs);
      setRunHiddenTabs({ css: true, js: true });
      setActiveTab('html');
      const eff = getEffectivePreviewCodes(
        { html: draft.htmlCode, css: draft.cssCode, js: draft.jsCode },
        langs,
        { css: true, js: true }
      );
      updatePreviewSnapshot(eff.html, eff.css, eff.js, true);
      setRefreshTrigger((prev) => prev + 1);
      setCloudSaveStatus('idle');
      setHasUnsavedChanges(Boolean(draft.htmlCode || draft.cssCode || draft.jsCode));
      showToast(`Đã khôi phục bản nháp "${draft.title}"`);
    },
    [updatePreviewSnapshot, showToast]
  );

  const handleDeleteGuestDraft = useCallback(
    (draftId: string) => {
      setGuestDrafts(deleteGuestDraft(draftId));
      showToast('Đã xóa bản nháp');
    },
    [showToast]
  );

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
      const fromScratch = isSavingScratchToNewProject;
      setIsSavingScratchToNewProject(false);

      // 1. Auto-save current personal project if it has unsaved changes
      if (!fromScratch && hasUnsavedChanges && activeProject && !activeCollabProject) {
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

      // 2. Starter templates matching selected types (or current scratch code if triggered by Save button)
      const minimalHtml = fromScratch
        ? htmlCode
        : `<!DOCTYPE html>
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

      const cssStarter = fromScratch
        ? cssCode
        : formData.languages.includes('css')
        ? `/* Viết mã CSS để tùy biến giao diện tại đây */\n`
        : '';
      const jsStarter = fromScratch
        ? jsCode
        : formData.languages.includes('js')
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
        localStorage.removeItem(STORAGE_KEYS.TABS_CODE);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_CODE);
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
        localStorage.removeItem(STORAGE_KEYS.TABS_CODE);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_CODE);
        setIsProjectsPanelOpen(false);
        showToast(fromScratch ? 'Đã lưu dự án thành công' : `Đã tạo dự án "${newProj.title}"`);
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
          const nextLangs = normalizeLanguages(formData.languages);
          setActiveLanguages(nextLangs);
          saveTabViewSettings(
            getTabViewStorageKey({
              isSharedView: false,
              collabProjectId: targetCollab.id,
              userId: currentUser.uid,
            }),
            { languages: nextLangs, runHiddenTabs }
          );
          if (!nextLangs.includes(activeTab)) {
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
          const nextLangs = normalizeLanguages(formData.languages);
          setActiveProject((prev) =>
            prev
              ? {
                  ...prev,
                  title: formData.title,
                  description: formData.description,
                  languages: nextLangs,
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
          setProjectTitle(formData.title);
          setActiveLanguages(nextLangs);
          saveTabViewSettings(
            getTabViewStorageKey({
              isSharedView: false,
              projectId: projId,
              userId: currentUser?.uid,
            }),
            { languages: nextLangs, runHiddenTabs }
          );
          if (!nextLangs.includes(activeTab)) {
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

  // Restore / add language tab (CSS or JS) in canonical order without deleting code
  const handleAddLanguage = useCallback(
    async (lang: 'html' | 'css' | 'js') => {
      if (isSharedView) return;
      if (activeLanguages.includes(lang)) {
        setActiveTab(lang);
        return;
      }

      const newLangs = normalizeLanguages([...activeLanguages, lang]);
      const nextRunHidden: RunHiddenTabs =
        lang === 'css' || lang === 'js'
          ? { ...runHiddenTabs, [lang]: true }
          : runHiddenTabs;

      setActiveLanguages(newLangs);
      setRunHiddenTabs(nextRunHidden);
      setActiveTab(lang);

      saveTabViewSettings(currentTabViewKey, {
        languages: newLangs,
        runHiddenTabs: nextRunHidden,
      });

      const eff = getEffectivePreviewCodes(
        { html: htmlCode, css: cssCode, js: jsCode },
        newLangs,
        nextRunHidden
      );
      updatePreviewSnapshot(eff.html, eff.css, eff.js, false);
      setRefreshTrigger((prev) => prev + 1);

      const label = lang === 'css' ? 'CSS' : lang === 'js' ? 'JS' : 'HTML';
      showToast(`Đã mở lại tab ${label}`);

      // Personal project persists enabled languages to project record; team project keeps visible tabs local per user
      if (activeProject && !activeCollabProject) {
        try {
          const targetUserId = currentUser?.uid || 'guest';
          await updateProject(targetUserId, activeProject.id, {
            languages: newLangs,
          });
          setActiveProject((prev) => (prev ? { ...prev, languages: newLangs } : null));
          setProjects((prev) =>
            prev.map((p) => (p.id === activeProject.id ? { ...p, languages: newLangs } : p))
          );
        } catch (err) {
          console.error('Lỗi khi lưu danh sách tab dự án:', err);
        }
      }
    },
    [
      isSharedView,
      activeLanguages,
      runHiddenTabs,
      currentTabViewKey,
      htmlCode,
      cssCode,
      jsCode,
      updatePreviewSnapshot,
      activeProject,
      activeCollabProject,
      currentUser,
      showToast,
    ]
  );

  // Execute hiding of language tab while ALWAYS preserving code
  const executeRemoveLanguage = useCallback(
    async (lang: 'css' | 'js', keepCodeInPreview: boolean) => {
      if (isSharedView) return;

      const newLangs = normalizeLanguages(activeLanguages.filter((l) => l !== lang));
      const nextRunHidden: RunHiddenTabs = {
        ...runHiddenTabs,
        [lang]: keepCodeInPreview,
      };
      const nextTab = getNearestVisibleTab(activeLanguages, lang, activeTab);

      setActiveLanguages(newLangs);
      setRunHiddenTabs(nextRunHidden);
      if (activeTab === lang) {
        setActiveTab(nextTab);
      }

      saveTabViewSettings(currentTabViewKey, {
        languages: newLangs,
        runHiddenTabs: nextRunHidden,
      });

      const eff = getEffectivePreviewCodes(
        { html: htmlCode, css: cssCode, js: jsCode },
        newLangs,
        nextRunHidden
      );
      updatePreviewSnapshot(eff.html, eff.css, eff.js, false);
      setRefreshTrigger((prev) => prev + 1);

      const label = lang === 'css' ? 'CSS' : 'JS';
      showToast(
        keepCodeInPreview
          ? `Đã ẩn tab ${label} (mã vẫn chạy trong xem trước)`
          : `Đã ẩn tab ${label} (đã tạm tắt khỏi xem trước)`
      );

      // Personal project persists enabled languages; team project keeps visible tabs strictly local per user
      if (activeProject && !activeCollabProject) {
        try {
          const targetUserId = currentUser?.uid || 'guest';
          await updateProject(targetUserId, activeProject.id, {
            languages: newLangs,
          });
          setActiveProject((prev) => (prev ? { ...prev, languages: newLangs } : null));
          setProjects((prev) =>
            prev.map((p) => (p.id === activeProject.id ? { ...p, languages: newLangs } : p))
          );
        } catch (err) {
          console.error('Lỗi khi cập nhật tab ngôn ngữ:', err);
        }
      }
    },
    [
      isSharedView,
      activeLanguages,
      runHiddenTabs,
      activeTab,
      currentTabViewKey,
      htmlCode,
      cssCode,
      jsCode,
      updatePreviewSnapshot,
      activeProject,
      activeCollabProject,
      currentUser,
      showToast,
    ]
  );

  // Request hiding language tab via confirmation modal (with option to keep running hidden tab code)
  const handleRequestRemoveLanguage = useCallback(
    (lang: 'css' | 'js') => {
      if (isSharedView) return;
      setKeepHiddenCodeInPreview(true);
      setPendingRemoveLang(lang);
      setIsConfirmRemoveTabOpen(true);
    },
    [isSharedView]
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
      if (currentUser) {
        setRecentProjects(removeRecentProject(currentUser.uid, projectId, 'personal'));
      }

      if (activeProject && activeProject.id === projectId) {
        if (remaining.length > 0) {
          handleSelectProject(remaining[0]);
        } else {
          resetToBlankEditor();
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
      setRecentProjects(removeRecentProject(currentUser.uid, collabProj.id, 'collab'));
      if (activeCollabProject?.id === collabProj.id) {
        setActiveCollabProject(null);
        if (projects.length > 0) {
          handleSelectProject(projects[0]);
        } else {
          resetToBlankEditor();
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
      setRecentProjects(removeRecentProject(currentUser.uid, collabProj.id, 'collab'));
      if (activeCollabProject?.id === collabProj.id) {
        setActiveCollabProject(null);
        if (projects.length > 0) {
          handleSelectProject(projects[0]);
        } else {
          resetToBlankEditor();
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
    resetToBlankEditor();
    if (currentUser) {
      loadUserProjectsAndLastActive(currentUser.uid);
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
        const nextLangs = normalizeLanguages([...activeLanguages, loc.tab]);
        const nextRunHidden = { ...runHiddenTabs, [loc.tab]: true };
        setActiveLanguages(nextLangs);
        setRunHiddenTabs(nextRunHidden);
        saveTabViewSettings(currentTabViewKey, {
          languages: nextLangs,
          runHiddenTabs: nextRunHidden,
        });
      }
      setActiveTab(loc.tab);
      setMobileTab('code');
      setCursorJumpTarget({
        tab: loc.tab,
        line: loc.line,
        col: loc.col ?? 1,
        nonce: Date.now() + Math.random(),
      });
    },
    [activeLanguages, runHiddenTabs, currentTabViewKey]
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
  }, [htmlCode, cssCode, jsCode, effectivePreviewCodes, projectTitle, currentUser, activeProject, activeCollabProject, collabProviderInstance, isEditorReadOnly]);

  // Run manually (Auto-clears console & stale runtime errors on each run)
  const handleRun = useCallback(() => {
    const isEffectiveEmpty =
      !effectivePreviewCodes.html &&
      !effectivePreviewCodes.css &&
      !effectivePreviewCodes.js;

    updatePreviewSnapshot(
      effectivePreviewCodes.html,
      effectivePreviewCodes.css,
      effectivePreviewCodes.js,
      isEffectiveEmpty
    );
    setRefreshTrigger((prev) => prev + 1);
    if (isEffectiveEmpty) {
      setConsoleMessages([]);
      return;
    }
    setConsoleMessages([
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'info',
        message: 'Đã làm mới mã nguồn và xóa sạch nhật ký cũ.',
        time: new Date().toLocaleTimeString('vi-VN'),
      },
    ]);
  }, [effectivePreviewCodes, updatePreviewSnapshot]);

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
    if (!htmlCode && !cssCode && !jsCode) {
      showToast('Chưa có code', 'info');
      return;
    }
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
  }, [htmlCode, cssCode, jsCode, showToast]);

  // Toggle layout
  const handleToggleLayout = useCallback(() => {
    setLayout((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  }, []);

  const applyTemplateImmediately = useCallback(
    (template: CodeTemplate) => {
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
      setHasUnsavedChanges(true);
    },
    [activeCollabProject, collabProviderInstance, isCollabOwner]
  );

  // Select sample template (confirm before overwriting non-empty code)
  const handleSelectTemplate = useCallback(
    (template: CodeTemplate) => {
      if (isEditorReadOnly) {
        showToast('Bạn đang ở chế độ chỉ xem, không thể áp dụng mẫu');
        return;
      }
      if (!isCodeEmpty) {
        setPendingTemplate(template);
        return;
      }
      applyTemplateImmediately(template);
    },
    [isEditorReadOnly, isCodeEmpty, applyTemplateImmediately, showToast]
  );

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
    setRunHiddenTabs({ css: true, js: true });
    saveTabViewSettings(
      getTabViewStorageKey({
        isSharedView: false,
        collabProjectId: null,
        projectId: null,
        userId: currentUser?.uid,
      }),
      { languages: ['html', 'css', 'js'], runHiddenTabs: { css: true, js: true } }
    );

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
      <FpsMeter
        enabled={isFpsVisible}
        corner={settings.fpsCorner || 'bottom-right'}
        isDesktop={isSplitDesktop}
        hasLeftActivityBar={!isLearningOpen && !isSharedView && isActivityBarVisible}
        hasMobileBottomNav={!isLearningOpen && !viewport.isKeyboardOpen}
        isCollabStripVisible={!isLearningOpen && Boolean(activeCollabProject && currentUser && !isSharedView)}
        isMobileRunVisible={!isLearningOpen && mobileTab === 'preview' && !viewport.isKeyboardOpen}
        hasSecondaryTopBar={isLearningOpen || !isSplitDesktop}
      />

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

      {/* Top Header Toolbar (Slim 48px height) */}
      <Header
        onRun={handleRun}
        onClear={() => setIsClearModalOpen(true)}
        onCopy={handleCopy}
        onOpenDownload={() => {
          if (!isCodeEmpty) setIsDownloadModalOpen(true);
        }}
        onFormatCode={handleFormatCode}
        layout={layout}
        onToggleLayout={handleToggleLayout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectTemplate={handleSelectTemplate}
        isCopied={isCopied}
        isCodeEmpty={isCodeEmpty}
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

      {/* Main Body with Activity Bar + Workspaces */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        {/* Activity Bar on Left (Desktop/Tablet >=768px) or Bottom Bar (<768px) */}
        {isActivityBarVisible && (
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
            layout === 'horizontal' ? 'flex-col md:flex-row' : 'flex-col'
          }`}
        >
          {/* Editor Pane (Left or Top) */}
          <div
            style={
              !isSplitDesktop
                ? { flex: '1 1 100%', minWidth: 0, minHeight: 0 }
                : {
                    flex: `0 0 ${splitRatio * 100}%`,
                    minWidth: layout === 'horizontal' ? (viewport.width < 1024 ? '190px' : '240px') : 0,
                    minHeight: layout === 'vertical' ? '140px' : 0,
                  }
            }
            className={`flex-col overflow-hidden transition-[flex-basis] duration-75 relative z-10 min-w-0 min-h-0 ${
              mobileTab === 'preview' ? 'hidden md:flex' : 'flex'
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
              canCustomizeTabs={!isSharedView}
              readOnlyBadgeText={isCollabViewer ? 'Chế độ chỉ xem' : 'Chỉ đọc'}
              enabledLanguages={activeLanguages}
              onAddLanguage={handleAddLanguage}
              onRemoveLanguage={handleRequestRemoveLanguage}
              autoFocusDesktop={!isSharedView && !isLearningOpen}
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

          {/* Draggable Resizer (Desktop only in split view) */}
          <div className="hidden md:flex flex-shrink-0">
            <Resizer layout={layout} theme={theme} onResize={handleResize} />
          </div>

          {/* Preview Pane (Right or Bottom) */}
          <div
            style={
              !isSplitDesktop
                ? { flex: '1 1 100%', minWidth: 0, minHeight: 0 }
                : {
                    flex: `0 0 ${(1 - splitRatio) * 100}%`,
                    minWidth: layout === 'horizontal' ? (viewport.width < 1024 ? '190px' : '240px') : 0,
                    minHeight: layout === 'vertical' ? '160px' : 0,
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
              isEmptyPreview={isPreviewEmpty}
              theme={theme}
              onRefresh={handleRun}
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

          {/* Floating Run Button on Mobile Preview */}
          {mobileTab === 'preview' && !viewport.isKeyboardOpen && (
            <button
              onClick={handleRun}
              className="md:hidden fixed bottom-[calc(4.5rem+var(--safe-bottom))] right-[calc(1rem+var(--safe-right))] z-40 w-12 h-12 rounded-full bg-success hover:opacity-95 text-white shadow-[var(--shadow-elevated)] flex items-center justify-center active:scale-95 transition-all focus:outline-none cursor-pointer"
              title="Chạy lại mã"
              aria-label="Chạy lại mã"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Mobile credit strip above mobile bottom nav */}
        {!viewport.isKeyboardOpen && (
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

      {/* Confirmation Modal for Overwriting Non-Empty Editor with Template */}
      <ConfirmModal
        isOpen={!!pendingTemplate}
        title={`Áp dụng mẫu "${pendingTemplate?.name || ''}"?`}
        message="Mã nguồn hiện tại trong trình soạn thảo sẽ bị thay thế bởi mẫu này."
        confirmText="Áp dụng mẫu"
        cancelText="Hủy bỏ"
        isDangerous={false}
        onConfirm={() => {
          if (pendingTemplate) {
            applyTemplateImmediately(pendingTemplate);
            setPendingTemplate(null);
          }
        }}
        onCancel={() => setPendingTemplate(null)}
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
        guestDrafts={guestDrafts}
        onRestoreDraft={handleRestoreGuestDraft}
        onDeleteDraft={handleDeleteGuestDraft}
        recentProjects={recentProjects}
        onOpenRecentProject={handleOpenRecentProject}
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
        onDownload={() => {
          if (!isCodeEmpty) setIsDownloadModalOpen(true);
        }}
        onShare={() => setIsShareModalOpen(true)}
        onClear={() => setIsClearModalOpen(true)}
        onToggleTheme={handleToggleTheme}
        theme={theme}
        onToggleFps={handleToggleFps}
        isFpsVisible={isFpsVisible}
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
        isCodeEmpty={isCodeEmpty}
      />

      {/* Project Creation & Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setIsSavingScratchToNewProject(false);
          setEditingProject(null);
          setEditingCollabProject(null);
        }}
        mode={projectModalMode}
        defaultProjectType={defaultNewProjectType}
        initialData={
          isSavingScratchToNewProject
            ? {
                title: projectTitle !== 'Dự án chưa đặt tên' ? projectTitle : '',
                languages: activeLanguages,
              }
            : editingCollabProject ||
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

      {/* Confirmation Modal for Hiding Language Tab */}
      <ConfirmModal
        isOpen={isConfirmRemoveTabOpen}
        title={`Ẩn tab ${pendingRemoveLang === 'css' ? 'CSS' : 'JavaScript'}?`}
        message={`Tab ${
          pendingRemoveLang === 'css' ? 'CSS' : 'JavaScript'
        } sẽ được ẩn khỏi thanh tab nhưng mã nguồn bên trong vẫn được giữ nguyên vẹn. Bạn có thể mở lại bất cứ lúc nào qua nút "+".`}
        confirmText="Ẩn tab"
        cancelText="Giữ lại"
        isDangerous={false}
        checkbox={{
          label: 'Vẫn dùng code của tab này khi chạy',
          checked: keepHiddenCodeInPreview,
          onChange: setKeepHiddenCodeInPreview,
        }}
        onConfirm={() => {
          if (pendingRemoveLang) {
            executeRemoveLanguage(pendingRemoveLang, keepHiddenCodeInPreview);
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
          isKeyboardOpen={viewport.isKeyboardOpen}
          liftAboveMobileRun={mobileTab === 'preview' && !isSplitDesktop}
        />
      )}
          </>
        )}

        {/* Global Website Credit Footer */}
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
      </div>
    </>
  );
}
