export type LayoutMode = 'horizontal' | 'vertical';

export type WorkspacePreset = 'split-horizontal' | 'split-vertical' | 'focus-code' | 'focus-preview' | 'zen';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type ThemeMode = 'dark' | 'light';

export type CloudSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type EditorTab = 'html' | 'css' | 'js';

export interface ConsoleMessage {
  id: string;
  type: 'error' | 'warn' | 'log' | 'info';
  message: string;
  tab?: EditorTab | null;
  line?: number | null;
  col?: number | null;
  stack?: string | null;
  count?: number;
  sourceType?: 'runtime' | 'promise' | 'console' | 'resource' | 'static';
  time: string;
}

export interface StaticIssue {
  id: string;
  severity: 'error' | 'warn';
  category: 'html' | 'css';
  tab: EditorTab;
  line: number;
  col: number;
  message: string;
  codeSnippet?: string;
  ruleId: string;
}

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  htmlCode: string;
  cssCode?: string;
  jsCode?: string;
  // Legacy support
  code?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  languages?: ('html' | 'css' | 'js')[];
  htmlCode: string;
  cssCode?: string;
  jsCode?: string;
  isShared?: boolean;
  sharedAt?: string;
  authorEmail?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type CollabRole = 'owner' | 'editor' | 'viewer';
export type CollabInviteRole = 'editor' | 'viewer';

export interface CollabMemberProfile {
  name: string;
  photoURL: string | null;
  email?: string;
}

export interface CollabProject {
  id: string;
  title: string;
  description?: string;
  languages: ('html' | 'css' | 'js')[];
  ownerId: string;
  members: Record<string, CollabRole>;
  memberProfiles: Record<string, CollabMemberProfile>;
  inviteEnabled: boolean;
  inviteToken: string;
  inviteRole: CollabInviteRole;
  inviteTokenUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollabUpdateChunk {
  id: string;
  updateBase64: string;
  authorId: string;
  createdAt: string;
}

export interface CollabSnapshot {
  id: string;
  stateBase64: string;
  updatedBy: string;
  updatedAt: string;
}

export type CollabSyncState = 'connecting' | 'synced' | 'syncing' | 'offline' | 'error';

export interface PresenceCursor {
  anchor: Record<string, any>;
  head: Record<string, any>;
}

export interface PresenceSelection {
  isEmpty: boolean;
  length: number;
}

export interface PresenceSession {
  sessionId: string;
  uid: string;
  name: string;
  photoURL: string | null;
  color: string;
  tab: EditorTab;
  cursor: PresenceCursor | null;
  selection: PresenceSelection | null;
  typingUntil: number;
  lastActive: number;
  role: CollabRole;
}

export interface PresenceUser {
  uid: string;
  name: string;
  photoURL: string | null;
  color: string;
  role: CollabRole;
  tab: EditorTab;
  isTyping: boolean;
  isIdle: boolean;
  idleMinutes: number;
  lastActive: number;
  sessionCount: number;
  primarySessionId: string;
  sessions: PresenceSession[];
}

export interface RemoteInsertFlash {
  id: string;
  tab: EditorTab;
  from: number;
  to: number;
  color: string;
  createdAt: number;
}

export interface CollabLineCommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  text: string;
  createdAt: string;
}

export interface CollabLineComment {
  id: string;
  projectId: string;
  tab: EditorTab;
  lineNumber: number;
  relPosJson: string | null;
  authorId: string;
  authorName: string;
  authorColor: string;
  text: string;
  resolved: boolean;
  resolvedByName: string | null;
  resolvedAt: string | null;
  replies: CollabLineCommentReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CollabChatMessage {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  photoURL: string | null;
  text: string;
  createdAt: string;
}

export interface CollabPreviewSyncState {
  device: DeviceMode;
  refreshNonce: number;
  updatedByUid: string;
  updatedByName: string;
  updatedAt: number;
}


