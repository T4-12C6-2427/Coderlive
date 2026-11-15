export type LayoutMode = 'horizontal' | 'vertical';

export type WorkspacePreset = 'split-horizontal' | 'split-vertical';

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

export type TemplateCategory =
  | 'Trang web'
  | 'Thành phần giao diện'
  | 'Ứng dụng nhỏ'
  | 'Trò chơi'
  | 'Hiệu ứng & Canvas'
  | 'Học tập';

export type TemplateDifficulty = 'Dễ' | 'Trung bình' | 'Nâng cao';

export interface TemplateRelatedLesson {
  courseId: 'html' | 'css' | 'js';
  slug: string;
  title: string;
}

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  tags: string[];
  learningPoints: string[];
  relatedLessons: TemplateRelatedLesson[];
  createdOrder: number;
  iconKey?: string;
  htmlCode: string;
  cssCode?: string;
  jsCode?: string;
  // Legacy support
  code?: string;
}

export interface TemplatePrefs {
  favorites: string[];
  recentIds: string[];
  updatedAt: string;
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
export type InviteExpiryPreset = 'never' | '1h' | '24h' | '7d';
export type JoinCodeExpiryPreset = '15m' | '1h' | '24h';

export const DEFAULT_COLLAB_MEMBER_LIMIT = 20;

export interface CollabMemberProfile {
  name: string;
  photoURL: string | null;
  email?: string;
}

export type JoinRequestSource = 'code' | 'link';
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

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
  inviteExpiresAt?: number | null;
  inviteExpiryPreset?: InviteExpiryPreset;
  inviteRequiresApproval?: boolean;
  joinCode?: string | null;
  joinCodeEnabled?: boolean;
  joinCodeRole?: CollabInviteRole;
  joinCodeExpiresAt?: number | null;
  joinCodeExpiryPreset?: JoinCodeExpiryPreset | InviteExpiryPreset;
  memberLimit?: number;
  inviteTokenUsed?: string;
  singleEditorPerAccount?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollabJoinCode {
  code: string;
  projectId: string;
  projectTitle: string;
  ownerId: string;
  ownerName: string;
  defaultRole: CollabInviteRole;
  enabled: boolean;
  expiresAt: number | null;
  expiryPreset: JoinCodeExpiryPreset | InviteExpiryPreset;
  createdAt: string;
  updatedAt: string;
}

export interface CollabJoinRequest {
  requesterUid: string;
  projectId: string;
  projectTitle: string;
  requesterName: string;
  requesterPhotoURL: string | null;
  requesterPublicLabel: string;
  source: JoinRequestSource;
  codeUsed: string | null;
  inviteTokenUsed: string | null;
  requestedRole: CollabInviteRole;
  assignedRole: CollabInviteRole | null;
  status: JoinRequestStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface CollabBlockedUser {
  uid: string;
  name: string;
  photoURL: string | null;
  publicLabel: string;
  blockedBy: string;
  createdAt: string;
}

export type JoinCollabResult =
  | { status: 'joined'; project: CollabProject }
  | { status: 'already_member'; project: CollabProject }
  | {
      status: 'pending';
      projectId: string;
      projectTitle: string;
      requestedRole: CollabInviteRole;
      source: JoinRequestSource;
      alreadyPending?: boolean;
    };

export interface UserPrivacySettings {
  allowProfileSearch: boolean;
  allowEmailSearch: boolean;
  acceptDirectInvites: boolean;
}

export interface PublicUserProfile {
  uid: string;
  displayName: string;
  displayNameLower: string;
  username: string | null;
  usernameLower: string | null;
  photoURL: string | null;
  hasVerifiedEmail: boolean;
  allowProfileSearch: boolean;
  allowEmailSearch: boolean;
  acceptDirectInvites: boolean;
  updatedAt: string;
}

export interface UserSearchResult {
  uid: string;
  displayName: string;
  username: string | null;
  photoURL: string | null;
  hasVerifiedEmail: boolean;
  acceptDirectInvites: boolean;
  matchedBy: 'email' | 'username' | 'name';
}

export type CollabDirectInviteStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export interface CollabDirectInvite {
  projectId: string;
  projectTitle: string;
  targetUid: string;
  targetName: string;
  targetUsername: string | null;
  targetPhotoURL: string | null;
  inviterUid: string;
  inviterName: string;
  inviterPhotoURL: string | null;
  role: CollabInviteRole;
  status: CollabDirectInviteStatus;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
}

export interface UserInviteInboxItem {
  projectId: string;
  projectTitle: string;
  targetUid: string;
  inviterUid: string;
  inviterName: string;
  inviterPhotoURL: string | null;
  role: CollabInviteRole;
  status: CollabDirectInviteStatus;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
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
  isLockHolder?: boolean;
  lockClaimedAt?: number;
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


