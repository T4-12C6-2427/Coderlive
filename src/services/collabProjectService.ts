import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  orderBy,
  query,
  startAfter,
  deleteDoc,
  deleteField,
  onSnapshot,
  where,
  Unsubscribe,
  QueryConstraint,
  Timestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { ref as rtdbRef, set as rtdbSet, update as rtdbUpdate, remove as rtdbRemove } from 'firebase/database';
import { db, rtdb, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  CollabBlockedUser,
  CollabDirectInvite,
  CollabInviteRole,
  CollabJoinRequest,
  CollabMemberProfile,
  CollabProject,
  CollabRole,
  DEFAULT_COLLAB_MEMBER_LIMIT,
  InviteExpiryPreset,
  JoinCodeExpiryPreset,
  JoinCollabResult,
  Project,
  UserInviteInboxItem,
  UserSearchResult,
} from '../types';
import {
  decodeCollabStateToCode,
  encodeInitialCollabState,
} from '../lib/collabYjsHelpers';
import { getSnapshotCursor } from '../lib/CollabProvider';
import { getAccountIdentity, maskEmail } from '../lib/usernameAuth';

const PENDING_INVITE_STORAGE_KEY = 'coderlive_pending_collab_invite_v1';

export interface PendingCollabInvite {
  projectId: string;
  token: string;
}

/**
 * Lưu lời mời đang chờ vào sessionStorage khi khách cần đăng nhập/đăng ký trước khi tham gia
 */
export function savePendingCollabInvite(invite: PendingCollabInvite): void {
  try {
    sessionStorage.setItem(PENDING_INVITE_STORAGE_KEY, JSON.stringify(invite));
  } catch {
    // Bỏ qua nếu trình duyệt chặn storage
  }
}

export function getPendingCollabInvite(): PendingCollabInvite | null {
  try {
    const raw = sessionStorage.getItem(PENDING_INVITE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.projectId && parsed?.token) {
      return { projectId: String(parsed.projectId), token: String(parsed.token) };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPendingCollabInvite(): void {
  try {
    sessionStorage.removeItem(PENDING_INVITE_STORAGE_KEY);
  } catch {
    // Bỏ qua
  }
}

export function generateCollabProjectId(): string {
  return 'collab_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Sinh token mời ngẫu nhiên khó đoán (28 ký tự alphanumeric)
 */
export function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(28);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let token = '';
  for (let i = 0; i < bytes.length; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}

export function buildMemberProfile(user: User): CollabMemberProfile {
  const identity = getAccountIdentity(user);
  const rawName = (user.displayName || identity.username || identity.displayLabel || 'Thành viên').trim().slice(0, 100);
  return {
    name: rawName || 'Thành viên',
    photoURL: user.photoURL || null,
    email: identity.publicEmail || '',
  };
}

export function getPublicRequesterLabel(user: User): string {
  const identity = getAccountIdentity(user);
  if (identity.username) return `@${identity.username}`;
  return maskEmail(identity.publicEmail) || '';
}

export function parseTimestampToMs(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'object') {
    const anyVal = val as { toMillis?: () => number; seconds?: number; _seconds?: number };
    if (typeof anyVal.toMillis === 'function') {
      const ms = anyVal.toMillis();
      return Number.isFinite(ms) ? ms : null;
    }
    if (typeof anyVal.seconds === 'number') return anyVal.seconds * 1000;
    if (typeof anyVal._seconds === 'number') return anyVal._seconds * 1000;
  }
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function computeInviteExpiryTimestamp(
  preset: InviteExpiryPreset | JoinCodeExpiryPreset,
  fromMs = Date.now()
): Timestamp | null {
  if (preset === '15m') return Timestamp.fromMillis(fromMs + 15 * 60 * 1000);
  if (preset === '1h') return Timestamp.fromMillis(fromMs + 60 * 60 * 1000);
  if (preset === '24h') return Timestamp.fromMillis(fromMs + 24 * 60 * 60 * 1000);
  if (preset === '7d') return Timestamp.fromMillis(fromMs + 7 * 24 * 60 * 60 * 1000);
  return null;
}

function normalizeInvitePreset(val: unknown): InviteExpiryPreset {
  if (val === '1h' || val === '24h' || val === '7d') return val;
  return 'never';
}

function normalizeJoinCodePreset(val: unknown): JoinCodeExpiryPreset {
  if (val === '15m' || val === '1h' || val === '24h') return val;
  return '1h';
}

function normalizeCollabProject(id: string, data: Record<string, any>): CollabProject {
  const memberLimit =
    typeof data.memberLimit === 'number' && data.memberLimit >= 2
      ? data.memberLimit
      : DEFAULT_COLLAB_MEMBER_LIMIT;
  return {
    id: data.id || id,
    title: data.title || 'Dự án nhóm',
    description: data.description || '',
    languages:
      Array.isArray(data.languages) && data.languages.length > 0
        ? data.languages
        : ['html', 'css', 'js'],
    ownerId: data.ownerId || '',
    members: (data.members as Record<string, CollabRole>) || {},
    memberProfiles: (data.memberProfiles as Record<string, CollabMemberProfile>) || {},
    inviteEnabled: Boolean(data.inviteEnabled),
    inviteToken: data.inviteToken || '',
    inviteRole: data.inviteRole === 'viewer' ? 'viewer' : 'editor',
    inviteExpiresAt: parseTimestampToMs(data.inviteExpiresAt),
    inviteExpiryPreset: normalizeInvitePreset(data.inviteExpiryPreset),
    inviteRequiresApproval: Boolean(data.inviteRequiresApproval),
    joinCode: typeof data.joinCode === 'string' && /^[0-9]{4}$/.test(data.joinCode) ? data.joinCode : null,
    joinCodeEnabled: Boolean(data.joinCodeEnabled),
    joinCodeRole: data.joinCodeRole === 'viewer' ? 'viewer' : 'editor',
    joinCodeExpiresAt: parseTimestampToMs(data.joinCodeExpiresAt),
    joinCodeExpiryPreset: normalizeJoinCodePreset(data.joinCodeExpiryPreset),
    memberLimit,
    singleEditorPerAccount: data.singleEditorPerAccount !== false,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Tạo dự án nhóm mới và khởi tạo snapshot Yjs ban đầu (html, css, js)
 */
export async function createCollabProject(
  user: User,
  input: {
    title: string;
    description?: string;
    languages?: ('html' | 'css' | 'js')[];
    htmlCode: string;
    cssCode?: string;
    jsCode?: string;
    singleEditorPerAccount?: boolean;
  }
): Promise<CollabProject> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');

  const projectId = generateCollabProjectId();
  const inviteToken = generateInviteToken();
  const now = new Date().toISOString();
  const profile = buildMemberProfile(user);
  const langs: ('html' | 'css' | 'js')[] =
    input.languages && input.languages.length > 0 ? input.languages : ['html', 'css', 'js'];

  const project: CollabProject = {
    id: projectId,
    title: input.title.trim().slice(0, 60) || 'Dự án nhóm mới',
    description: (input.description || '').trim().slice(0, 300),
    languages: langs,
    ownerId: user.uid,
    members: { [user.uid]: 'owner' },
    memberProfiles: { [user.uid]: profile },
    inviteEnabled: true,
    inviteToken,
    inviteRole: 'editor',
    inviteExpiresAt: null,
    inviteExpiryPreset: 'never',
    inviteRequiresApproval: false,
    joinCode: null,
    joinCodeEnabled: false,
    joinCodeRole: 'editor',
    joinCodeExpiresAt: null,
    joinCodeExpiryPreset: '1h',
    memberLimit: DEFAULT_COLLAB_MEMBER_LIMIT,
    singleEditorPerAccount: input.singleEditorPerAccount !== false,
    createdAt: now,
    updatedAt: now,
  };

  const docPath = `collabProjects/${projectId}`;
  try {
    await setDoc(doc(db, 'collabProjects', projectId), {
      ...project,
      inviteExpiresAt: null,
      joinCodeExpiresAt: null,
    });

    const stateBase64 = encodeInitialCollabState({
      htmlCode: input.htmlCode || '',
      cssCode: input.cssCode || '',
      jsCode: input.jsCode || '',
    });

    await setDoc(doc(db, 'collabProjects', projectId, 'snapshots', 'latest'), {
      stateBase64,
      updatedBy: user.uid,
      updatedAt: now,
      watermarkAt: now,
    });

    await setDoc(doc(db, 'collabInvites', inviteToken), {
      projectId,
      ownerId: user.uid,
      inviteRole: project.inviteRole,
      inviteEnabled: project.inviteEnabled,
      projectTitle: project.title,
      expiresAt: null,
      requiresApproval: false,
      memberLimit: DEFAULT_COLLAB_MEMBER_LIMIT,
      updatedAt: now,
    });

    await syncCollabPresenceMeta(project).catch(() => {});

    return project;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Đồng bộ siêu dữ liệu thành viên dự án sang Realtime Database (`presenceMeta/{projectId}`)
 * để RTDB Security Rules xác thực chính xác chỉ thành viên mới đọc/ghi presence.
 */
export async function syncCollabPresenceMeta(project: CollabProject): Promise<void> {
  if (!rtdb || !project?.id) return;
  const membersMap: Record<string, { role: CollabRole; inviteTokenUsed?: string }> = {};
  for (const [uid, role] of Object.entries(project.members || {})) {
    membersMap[uid] = { role };
  }
  await rtdbSet(rtdbRef(rtdb, `presenceMeta/${project.id}`), {
    ownerId: project.ownerId,
    inviteEnabled: Boolean(project.inviteEnabled),
    inviteToken: project.inviteToken || '',
    inviteRole: project.inviteRole === 'viewer' ? 'viewer' : 'editor',
    members: membersMap,
  });
}

/**
 * Chuyển đổi một dự án cá nhân thành dự án nhóm (giữ nguyên bản cá nhân cho tới khi người dùng xác nhận xóa)
 */
export async function convertPersonalToCollabProject(
  user: User,
  personalProject: Project
): Promise<CollabProject> {
  return createCollabProject(user, {
    title: personalProject.title,
    description: personalProject.description || '',
    languages: personalProject.languages || ['html', 'css', 'js'],
    htmlCode: personalProject.htmlCode || '',
    cssCode: personalProject.cssCode || '',
    jsCode: personalProject.jsCode || '',
  });
}

/**
 * Tải mã nguồn hiện tại của dự án nhóm từ snapshot + các update chunk Yjs
 */
export async function loadCollabProjectCode(projectId: string): Promise<{
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');

  const snapPath = `collabProjects/${projectId}/snapshots/latest`;
  try {
    const snapDoc = await getDoc(doc(db, 'collabProjects', projectId, 'snapshots', 'latest'));
    const snapData = snapDoc.exists() ? snapDoc.data() : null;
    const snapshotBase64 = snapData ? (snapData.stateBase64 as string) : null;
    const cursor = getSnapshotCursor(snapData);

    const constraints: QueryConstraint[] = [orderBy('createdAt', 'asc')];
    if (cursor) {
      constraints.push(startAfter(cursor));
    }
    const updatesQuery = query(
      collection(db, 'collabProjects', projectId, 'updates'),
      ...constraints
    );
    const updatesSnap = await getDocs(updatesQuery);
    const chunks: string[] = [];
    updatesSnap.forEach((d) => {
      const val = d.data().updateBase64;
      if (typeof val === 'string' && val.length > 0) {
        chunks.push(val);
      }
    });

    return decodeCollabStateToCode(snapshotBase64, chunks);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, snapPath);
  }
}

/**
 * Lắng nghe danh sách dự án nhóm của người dùng theo thời gian thực
 */
export function subscribeUserCollabProjects(
  uid: string,
  onData: (projects: CollabProject[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db || !uid) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, 'collabProjects'),
    where(`members.${uid}`, 'in', ['owner', 'editor', 'viewer'])
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: CollabProject[] = [];
      snapshot.forEach((d) => {
        list.push(normalizeCollabProject(d.id, d.data()));
      });
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onData(list);
    },
    (error) => {
      console.error('[Collab:list] Lỗi lắng nghe danh sách dự án nhóm:', error);
      onError?.(error);
    }
  );
}

/**
 * Lắng nghe trực tiếp một dự án nhóm đang mở để phát hiện ngay khi bị xóa, đổi vai trò hoặc bị mời ra khỏi nhóm
 */
export function subscribeCollabProject(
  projectId: string,
  uid: string,
  onUpdate: (project: CollabProject) => void,
  onRevoked: () => void
): Unsubscribe {
  if (!db || !projectId || !uid) return () => {};

  const docRef = doc(db, 'collabProjects', projectId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onRevoked();
        return;
      }
      const proj = normalizeCollabProject(snapshot.id, snapshot.data());
      if (!proj.members[uid]) {
        onRevoked();
        return;
      }
      onUpdate(proj);
    },
    (error) => {
      console.warn('[Collab:doc] Mất quyền hoặc không thể đọc dự án nhóm:', error);
      onRevoked();
    }
  );
}

/**
 * Cập nhật thông tin cơ bản của dự án nhóm (chỉ chủ sở hữu)
 */
export async function updateCollabProjectMeta(
  projectId: string,
  updates: Partial<Pick<CollabProject, 'title' | 'description' | 'languages' | 'singleEditorPerAccount'>>,
  activeInviteToken?: string,
  activeJoinCode?: string | null
): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const now = new Date().toISOString();
  const payload: Record<string, any> = { updatedAt: now };

  if (updates.title !== undefined) {
    payload.title = updates.title.trim().slice(0, 60) || 'Dự án nhóm';
  }
  if (updates.description !== undefined) {
    payload.description = updates.description.trim().slice(0, 300);
  }
  if (updates.languages !== undefined) {
    payload.languages = updates.languages.length > 0 ? updates.languages : ['html'];
  }
  if (updates.singleEditorPerAccount !== undefined) {
    payload.singleEditorPerAccount = Boolean(updates.singleEditorPerAccount);
  }

  const docPath = `collabProjects/${projectId}`;
  try {
    await updateDoc(doc(db, 'collabProjects', projectId), payload);
    if (updates.title !== undefined && activeInviteToken) {
      await updateDoc(doc(db, 'collabInvites', activeInviteToken), {
        projectTitle: payload.title,
        updatedAt: now,
      }).catch(() => {});
    }
    if (updates.title !== undefined && activeJoinCode) {
      await updateDoc(doc(db, 'joinCodes', activeJoinCode), {
        projectTitle: payload.title,
        updatedAt: now,
      }).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Cập nhật cài đặt lời mời (bật/tắt, vai trò mặc định, hoặc tạo lại mã mới) — chỉ chủ sở hữu
 */
export async function updateCollabInviteSettings(
  project: CollabProject,
  user: User,
  options: {
    inviteEnabled?: boolean;
    inviteRole?: CollabInviteRole;
    regenerateToken?: boolean;
    inviteExpiryPreset?: InviteExpiryPreset;
    inviteRequiresApproval?: boolean;
  }
): Promise<{
  inviteEnabled: boolean;
  inviteRole: CollabInviteRole;
  inviteToken: string;
  inviteExpiresAt: number | null;
  inviteExpiryPreset: InviteExpiryPreset;
  inviteRequiresApproval: boolean;
}> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');

  const nowMs = Date.now();
  const now = new Date(nowMs).toISOString();
  const nextEnabled =
    options.inviteEnabled !== undefined ? options.inviteEnabled : project.inviteEnabled;
  const nextRole = options.inviteRole !== undefined ? options.inviteRole : project.inviteRole;
  const nextToken = options.regenerateToken ? generateInviteToken() : project.inviteToken;
  const nextPreset =
    options.inviteExpiryPreset !== undefined
      ? options.inviteExpiryPreset
      : project.inviteExpiryPreset || 'never';
  const nextRequiresApproval =
    options.inviteRequiresApproval !== undefined
      ? options.inviteRequiresApproval
      : Boolean(project.inviteRequiresApproval);
  const memberLimit =
    typeof project.memberLimit === 'number' && project.memberLimit >= 2
      ? project.memberLimit
      : DEFAULT_COLLAB_MEMBER_LIMIT;

  const wasExpired =
    typeof project.inviteExpiresAt === 'number' && project.inviteExpiresAt <= nowMs;
  const shouldRefreshExpiry =
    options.inviteExpiryPreset !== undefined ||
    Boolean(options.regenerateToken) ||
    (options.inviteEnabled === true && wasExpired);

  const nextExpiresTimestamp: Timestamp | null = shouldRefreshExpiry
    ? computeInviteExpiryTimestamp(nextPreset, nowMs)
    : typeof project.inviteExpiresAt === 'number'
    ? Timestamp.fromMillis(project.inviteExpiresAt)
    : null;
  const nextExpiresMs = nextExpiresTimestamp ? nextExpiresTimestamp.toMillis() : null;

  const docPath = `collabProjects/${project.id}`;
  try {
    await updateDoc(doc(db, 'collabProjects', project.id), {
      inviteEnabled: nextEnabled,
      inviteRole: nextRole,
      inviteToken: nextToken,
      inviteExpiresAt: nextExpiresTimestamp,
      inviteExpiryPreset: nextPreset,
      inviteRequiresApproval: nextRequiresApproval,
      memberLimit,
      updatedAt: now,
    });

    if (options.regenerateToken && project.inviteToken && project.inviteToken !== nextToken) {
      await deleteDoc(doc(db, 'collabInvites', project.inviteToken)).catch(() => {});
    }

    await setDoc(doc(db, 'collabInvites', nextToken), {
      projectId: project.id,
      ownerId: user.uid,
      inviteRole: nextRole,
      inviteEnabled: nextEnabled,
      projectTitle: project.title,
      expiresAt: nextExpiresTimestamp,
      requiresApproval: nextRequiresApproval,
      memberLimit,
      updatedAt: now,
    });

    if (rtdb) {
      await rtdbUpdate(rtdbRef(rtdb, `presenceMeta/${project.id}`), {
        inviteEnabled: nextEnabled,
        inviteRole: nextRole,
        inviteToken: nextToken,
      }).catch(() => {});
    }

    return {
      inviteEnabled: nextEnabled,
      inviteRole: nextRole,
      inviteToken: nextToken,
      inviteExpiresAt: nextExpiresMs,
      inviteExpiryPreset: nextPreset,
      inviteRequiresApproval: nextRequiresApproval,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Tham gia dự án nhóm thông qua liên kết mời
 * - Nếu dự án tắt duyệt trước: tham gia trực tiếp ngay
 * - Nếu dự án bật "Chủ dự án phải chấp nhận": tạo yêu cầu chờ duyệt giống luồng mã 4 chữ số
 */
export async function joinCollabProjectByInvite(
  projectId: string,
  inviteToken: string,
  user: User
): Promise<JoinCollabResult> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const now = new Date().toISOString();

  // 1. Nếu người dùng đã là thành viên rồi thì trả về luôn dự án
  try {
    const existingSnap = await getDoc(doc(db, 'collabProjects', projectId));
    if (existingSnap.exists()) {
      const existingData = normalizeCollabProject(existingSnap.id, existingSnap.data());
      if (existingData.members[user.uid]) {
        return { status: 'joined', project: existingData };
      }
    }
  } catch {
    // Người chưa phải thành viên sẽ bị từ chối getDoc theo rules -> tiếp tục luồng tham gia bằng token
  }

  // 2. Tra cứu thông tin lời mời qua token bí mật
  const inviteRef = doc(db, 'collabInvites', inviteToken);
  let inviteSnap;
  try {
    inviteSnap = await getDoc(inviteRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `collabInvites/${inviteToken}`);
  }

  if (!inviteSnap.exists()) {
    throw new Error('Liên kết mời không tồn tại hoặc đã bị thu hồi.');
  }

  const inviteData = inviteSnap.data();
  if (inviteData.projectId !== projectId) {
    throw new Error('Liên kết mời không khớp với dự án này.');
  }
  if (!inviteData.inviteEnabled) {
    throw new Error('Chủ sở hữu hiện đã tạm tắt lời mời cho dự án này.');
  }
  const expiresAtMs = parseTimestampToMs(inviteData.expiresAt);
  if (expiresAtMs !== null && expiresAtMs <= Date.now()) {
    throw new Error('Liên kết mời này đã hết hạn.');
  }

  const assignedRole: CollabInviteRole =
    inviteData.inviteRole === 'viewer' ? 'viewer' : 'editor';
  const profile = buildMemberProfile(user);

  // 2b. Nếu chủ dự án bật yêu cầu phê duyệt trước khi tham gia -> tạo yêu cầu chờ duyệt
  if (inviteData.requiresApproval === true) {
    const reqRef = doc(db, 'collabProjects', projectId, 'joinRequests', user.uid);
    const projectTitle =
      typeof inviteData.projectTitle === 'string' && inviteData.projectTitle.trim()
        ? inviteData.projectTitle.trim().slice(0, 60)
        : 'Dự án nhóm';
    try {
      const existingReqSnap = await getDoc(reqRef).catch(() => null);
      if (existingReqSnap?.exists() && existingReqSnap.data()?.status === 'pending') {
        return {
          status: 'pending',
          projectId,
          projectTitle,
          requestedRole: assignedRole,
          source: 'link',
        };
      }
      const requestPayload: CollabJoinRequest = {
        requesterUid: user.uid,
        projectId,
        projectTitle,
        requesterName: profile.name,
        requesterPhotoURL: profile.photoURL,
        requesterPublicLabel: getPublicRequesterLabel(user),
        source: 'link',
        codeUsed: null,
        inviteTokenUsed: inviteToken,
        requestedRole: assignedRole,
        assignedRole: null,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
        resolvedBy: null,
      };
      await setDoc(reqRef, requestPayload);
      return {
        status: 'pending',
        projectId,
        projectTitle,
        requestedRole: assignedRole,
        source: 'link',
      };
    } catch (error: any) {
      if (error?.code === 'permission-denied') {
        throw new Error(
          'Không thể gửi yêu cầu tham gia (liên kết đã hết hạn, bị làm mới, bạn đã bị chặn hoặc dự án đã đầy).'
        );
      }
      handleFirestoreError(error, OperationType.WRITE, `collabProjects/${projectId}/joinRequests/${user.uid}`);
    }
  }

  // 3. Tự thêm mình vào members + memberProfiles với bằng chứng inviteTokenUsed
  const projectRef = doc(db, 'collabProjects', projectId);
  try {
    await updateDoc(projectRef, {
      [`members.${user.uid}`]: assignedRole,
      [`memberProfiles.${user.uid}`]: profile,
      inviteTokenUsed: inviteToken,
      updatedAt: now,
    });
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      throw new Error(
        'Không thể tham gia: liên kết đã hết hạn, bị làm mới, yêu cầu duyệt, bạn đã bị chặn hoặc dự án đã đạt giới hạn thành viên.'
      );
    }
    handleFirestoreError(error, OperationType.UPDATE, `collabProjects/${projectId}`);
  }

  // 4. Đọc lại tài liệu dự án sau khi đã là thành viên
  const joinedSnap = await getDoc(projectRef);
  if (!joinedSnap.exists()) {
    throw new Error('Không tìm thấy dự án nhóm sau khi tham gia.');
  }
  if (rtdb) {
    await rtdbSet(rtdbRef(rtdb, `presenceMeta/${projectId}/members/${user.uid}`), {
      role: assignedRole,
      inviteTokenUsed: inviteToken,
    }).catch(() => {});
  }

  return {
    status: 'joined',
    project: normalizeCollabProject(joinedSnap.id, joinedSnap.data()),
  };
}

// =========================================================================
// GIAI ĐOẠN 2: MÃ DỰ ÁN 4 CHỮ SỐ, YÊU CẦU THAM GIA & DANH SÁCH CHẶN
// =========================================================================

const JOIN_CODE_ATTEMPT_KEY_PREFIX = 'coderlive_join_code_attempts_v1_';
export const JOIN_CODE_MAX_ATTEMPTS = 5;
export const JOIN_CODE_COOLDOWN_MS = 5 * 60 * 1000;

export function formatJoinCodeCooldown(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins > 0 && secs > 0) return `${mins} phút ${secs} giây`;
  if (mins > 0) return `${mins} phút`;
  return `${safe} giây`;
}

function isOfflineFirestoreError(err: any): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const code = String(err?.code || '').toLowerCase();
  const message = String(err?.message || '').toLowerCase();
  return (
    code === 'unavailable' ||
    message.includes('client is offline') ||
    message.includes('network') ||
    message.includes('failed to get document because the client is offline')
  );
}

export interface JoinCodeAttemptStatus {
  failedCount: number;
  remainingAttempts: number;
  isLocked: boolean;
  cooldownRemainingSec: number;
  lockUntilMs: number | null;
}

export function getJoinCodeAttemptStatus(uid: string): JoinCodeAttemptStatus {
  if (!uid) {
    return {
      failedCount: 0,
      remainingAttempts: JOIN_CODE_MAX_ATTEMPTS,
      isLocked: false,
      cooldownRemainingSec: 0,
      lockUntilMs: null,
    };
  }
  try {
    const raw = localStorage.getItem(`${JOIN_CODE_ATTEMPT_KEY_PREFIX}${uid}`);
    if (!raw) {
      return {
        failedCount: 0,
        remainingAttempts: JOIN_CODE_MAX_ATTEMPTS,
        isLocked: false,
        cooldownRemainingSec: 0,
        lockUntilMs: null,
      };
    }
    const parsed = JSON.parse(raw) as { failedCount?: number; lockUntilMs?: number | null };
    const now = Date.now();
    const lockUntilMs = typeof parsed.lockUntilMs === 'number' ? parsed.lockUntilMs : null;
    if (lockUntilMs !== null && lockUntilMs <= now) {
      localStorage.removeItem(`${JOIN_CODE_ATTEMPT_KEY_PREFIX}${uid}`);
      return {
        failedCount: 0,
        remainingAttempts: JOIN_CODE_MAX_ATTEMPTS,
        isLocked: false,
        cooldownRemainingSec: 0,
        lockUntilMs: null,
      };
    }
    if (lockUntilMs !== null && lockUntilMs > now) {
      return {
        failedCount: JOIN_CODE_MAX_ATTEMPTS,
        remainingAttempts: 0,
        isLocked: true,
        cooldownRemainingSec: Math.ceil((lockUntilMs - now) / 1000),
        lockUntilMs,
      };
    }
    const failedCount = Math.max(0, Math.min(JOIN_CODE_MAX_ATTEMPTS - 1, Number(parsed.failedCount) || 0));
    return {
      failedCount,
      remainingAttempts: Math.max(0, JOIN_CODE_MAX_ATTEMPTS - failedCount),
      isLocked: false,
      cooldownRemainingSec: 0,
      lockUntilMs: null,
    };
  } catch {
    return {
      failedCount: 0,
      remainingAttempts: JOIN_CODE_MAX_ATTEMPTS,
      isLocked: false,
      cooldownRemainingSec: 0,
      lockUntilMs: null,
    };
  }
}

export function recordJoinCodeFailure(uid: string): JoinCodeAttemptStatus {
  const current = getJoinCodeAttemptStatus(uid);
  if (current.isLocked) return current;
  const nextFailed = current.failedCount + 1;
  const isLocked = nextFailed >= JOIN_CODE_MAX_ATTEMPTS;
  const lockUntilMs = isLocked ? Date.now() + JOIN_CODE_COOLDOWN_MS : null;
  try {
    if (uid) {
      localStorage.setItem(
        `${JOIN_CODE_ATTEMPT_KEY_PREFIX}${uid}`,
        JSON.stringify({ failedCount: nextFailed, lockUntilMs })
      );
    }
  } catch {
    // Bỏ qua lỗi quota storage
  }
  return {
    failedCount: nextFailed,
    remainingAttempts: Math.max(0, JOIN_CODE_MAX_ATTEMPTS - nextFailed),
    isLocked,
    cooldownRemainingSec: isLocked ? Math.ceil(JOIN_CODE_COOLDOWN_MS / 1000) : 0,
    lockUntilMs,
  };
}

export function resetJoinCodeAttempts(uid: string): void {
  if (!uid) return;
  try {
    localStorage.removeItem(`${JOIN_CODE_ATTEMPT_KEY_PREFIX}${uid}`);
  } catch {
    // Bỏ qua
  }
}

function generateRandomFourDigitCandidate(): string {
  const blockedPatterns = new Set([
    '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
    '1234', '4321', '0123', '3210',
  ]);
  for (let i = 0; i < 8; i++) {
    let n = 0;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint16Array(1);
      crypto.getRandomValues(arr);
      n = arr[0] % 10000;
    } else {
      n = Math.floor(Math.random() * 10000);
    }
    const candidate = String(n).padStart(4, '0');
    if (!blockedPatterns.has(candidate)) return candidate;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Cập nhật cài đặt mã dự án 4 chữ số (bật/tắt, vai trò gợi ý, hết hạn 15m/1h/24h, tạo mã mới) — chỉ chủ sở hữu.
 * - Khi tắt hoặc hết hạn: xóa ngay tài liệu trong `joinCodes` để giải phóng mã.
 * - Khi tạo mã mới: dùng Firestore transaction để kiểm tra trùng lặp nguyên tử.
 */
export async function updateCollabJoinCodeSettings(
  project: CollabProject,
  user: User,
  options: {
    joinCodeEnabled?: boolean;
    joinCodeRole?: CollabInviteRole;
    regenerateCode?: boolean;
    joinCodeExpiryPreset?: JoinCodeExpiryPreset;
  }
): Promise<{
  joinCode: string | null;
  joinCodeEnabled: boolean;
  joinCodeRole: CollabInviteRole;
  joinCodeExpiresAt: number | null;
  joinCodeExpiryPreset: JoinCodeExpiryPreset;
}> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');

  const nowMs = Date.now();
  const now = new Date(nowMs).toISOString();
  const nextEnabled =
    options.joinCodeEnabled !== undefined ? options.joinCodeEnabled : Boolean(project.joinCodeEnabled);
  const nextRole: CollabInviteRole =
    options.joinCodeRole !== undefined
      ? options.joinCodeRole
      : project.joinCodeRole === 'viewer'
      ? 'viewer'
      : 'editor';
  const nextPreset: JoinCodeExpiryPreset =
    options.joinCodeExpiryPreset !== undefined
      ? options.joinCodeExpiryPreset
      : normalizeJoinCodePreset(project.joinCodeExpiryPreset);

  const projectRef = doc(db, 'collabProjects', project.id);
  const docPath = `collabProjects/${project.id}`;

  // Khi tắt mã dự án: xóa ngay tài liệu joinCodes/{code} và đặt joinCode = null
  if (!nextEnabled) {
    const batch = writeBatch(db);
    batch.update(projectRef, {
      joinCode: null,
      joinCodeEnabled: false,
      joinCodeRole: nextRole,
      joinCodeExpiresAt: null,
      joinCodeExpiryPreset: nextPreset,
      updatedAt: now,
    });
    if (project.joinCode) {
      batch.delete(doc(db, 'joinCodes', project.joinCode));
    }
    try {
      await batch.commit();
      return {
        joinCode: null,
        joinCodeEnabled: false,
        joinCodeRole: nextRole,
        joinCodeExpiresAt: null,
        joinCodeExpiryPreset: nextPreset,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  }

  const wasExpired =
    typeof project.joinCodeExpiresAt === 'number' && project.joinCodeExpiresAt <= nowMs;
  const needsNewCode = Boolean(options.regenerateCode || !project.joinCode || wasExpired);
  const shouldRefreshExpiry =
    needsNewCode ||
    options.joinCodeExpiryPreset !== undefined ||
    options.joinCodeEnabled === true;

  const nextExpiresTimestamp: Timestamp | null = shouldRefreshExpiry
    ? computeInviteExpiryTimestamp(nextPreset, nowMs)
    : typeof project.joinCodeExpiresAt === 'number'
    ? Timestamp.fromMillis(project.joinCodeExpiresAt)
    : computeInviteExpiryTimestamp(nextPreset, nowMs);
  const nextExpiresMs = nextExpiresTimestamp ? nextExpiresTimestamp.toMillis() : null;
  const ownerProfile = buildMemberProfile(user);

  if (!needsNewCode && project.joinCode) {
    const existingCode = project.joinCode;
    const batch = writeBatch(db);
    batch.update(projectRef, {
      joinCode: existingCode,
      joinCodeEnabled: true,
      joinCodeRole: nextRole,
      joinCodeExpiresAt: nextExpiresTimestamp,
      joinCodeExpiryPreset: nextPreset,
      updatedAt: now,
    });
    batch.set(doc(db, 'joinCodes', existingCode), {
      code: existingCode,
      projectId: project.id,
      projectTitle: project.title,
      ownerId: user.uid,
      ownerName: ownerProfile.name,
      defaultRole: nextRole,
      enabled: true,
      expiresAt: nextExpiresTimestamp,
      expiryPreset: nextPreset,
      createdAt: project.createdAt || now,
      updatedAt: now,
    });
    try {
      await batch.commit();
      return {
        joinCode: existingCode,
        joinCodeEnabled: true,
        joinCodeRole: nextRole,
        joinCodeExpiresAt: nextExpiresMs,
        joinCodeExpiryPreset: nextPreset,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  }

  // Dùng transaction kiểm tra trùng lặp nguyên tử để chọn mã 4 chữ số duy nhất đang hoạt động
  for (let attempt = 0; attempt < 15; attempt++) {
    const candidate = generateRandomFourDigitCandidate();
    if (project.joinCode && candidate === project.joinCode) continue;

    try {
      await runTransaction(db, async (tx) => {
        const candidateRef = doc(db!, 'joinCodes', candidate);
        const existingCodeSnap = await tx.get(candidateRef);
        if (existingCodeSnap.exists()) {
          throw new Error('JOIN_CODE_COLLISION');
        }

        tx.set(candidateRef, {
          code: candidate,
          projectId: project.id,
          projectTitle: project.title,
          ownerId: user.uid,
          ownerName: ownerProfile.name,
          defaultRole: nextRole,
          enabled: true,
          expiresAt: nextExpiresTimestamp,
          expiryPreset: nextPreset,
          createdAt: now,
          updatedAt: now,
        });

        tx.update(projectRef, {
          joinCode: candidate,
          joinCodeEnabled: true,
          joinCodeRole: nextRole,
          joinCodeExpiresAt: nextExpiresTimestamp,
          joinCodeExpiryPreset: nextPreset,
          updatedAt: now,
        });

        if (project.joinCode && project.joinCode !== candidate) {
          tx.delete(doc(db!, 'joinCodes', project.joinCode));
        }
      });

      return {
        joinCode: candidate,
        joinCodeEnabled: true,
        joinCodeRole: nextRole,
        joinCodeExpiresAt: nextExpiresMs,
        joinCodeExpiryPreset: nextPreset,
      };
    } catch (err: any) {
      if (err?.message === 'JOIN_CODE_COLLISION') {
        continue;
      }
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  }

  throw new Error('Không tìm thấy mã 4 chữ số trống sau nhiều lần thử. Vui lòng thử lại.');
}

/**
 * Xóa mã dự án đã hết hạn khỏi `joinCodes` và tắt trên dự án
 */
export async function cleanupExpiredJoinCode(project: CollabProject): Promise<void> {
  if (!db || !project.joinCode) return;
  const now = new Date().toISOString();
  const batch = writeBatch(db);
  batch.delete(doc(db, 'joinCodes', project.joinCode));
  batch.update(doc(db, 'collabProjects', project.id), {
    joinCode: null,
    joinCodeEnabled: false,
    joinCodeExpiresAt: null,
    updatedAt: now,
  });
  await batch.commit().catch(() => {});
}

/**
 * Người dùng nhập mã dự án 4 chữ số để gửi yêu cầu tham gia (bắt buộc chủ dự án chấp nhận)
 */
export async function requestJoinByProjectCode(
  rawCode: string,
  user: User
): Promise<JoinCollabResult> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng và thử lại.');
  }

  const attemptState = getJoinCodeAttemptStatus(user.uid);
  if (attemptState.isLocked) {
    throw new Error(
      `Bạn đã nhập sai mã ${JOIN_CODE_MAX_ATTEMPTS} lần liên tiếp. Vui lòng thử lại sau ${formatJoinCodeCooldown(attemptState.cooldownRemainingSec)}.`
    );
  }

  const code = rawCode.replace(/\D/g, '').trim();
  if (!/^[0-9]{4}$/.test(code)) {
    throw new Error('Mã dự án phải gồm đúng 4 chữ số.');
  }

  const codeRef = doc(db, 'joinCodes', code);
  let codeSnap;
  try {
    codeSnap = await getDoc(codeRef);
  } catch (error) {
    if (isOfflineFirestoreError(error)) {
      throw new Error('Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
    handleFirestoreError(error, OperationType.GET, `joinCodes/${code}`);
  }

  const codeData = codeSnap.exists() ? codeSnap.data() : null;
  const expiresAtMs = codeData ? parseTimestampToMs(codeData.expiresAt) : null;
  const isCodeExpired = expiresAtMs !== null && expiresAtMs <= Date.now();

  if (!codeData || !codeData.enabled || isCodeExpired) {
    const nextAttempt = recordJoinCodeFailure(user.uid);
    if (nextAttempt.isLocked) {
      throw new Error(
        `Bạn đã nhập sai mã ${JOIN_CODE_MAX_ATTEMPTS} lần liên tiếp. Vui lòng thử lại sau ${formatJoinCodeCooldown(nextAttempt.cooldownRemainingSec)}.`
      );
    }
    throw new Error(
      `Mã không đúng hoặc đã hết hạn. (Còn ${nextAttempt.remainingAttempts} lần thử)`
    );
  }

  resetJoinCodeAttempts(user.uid);

  const projectId = String(codeData.projectId);
  const projectTitle =
    typeof codeData.projectTitle === 'string' && codeData.projectTitle.trim()
      ? codeData.projectTitle.trim().slice(0, 60)
      : 'Dự án nhóm';
  const requestedRole: CollabInviteRole =
    codeData.defaultRole === 'viewer' ? 'viewer' : 'editor';

  // Nếu đã là thành viên -> trả về already_member để UI hiển thị nút "Mở dự án"
  try {
    const existingProjSnap = await getDoc(doc(db, 'collabProjects', projectId));
    if (existingProjSnap.exists()) {
      const existingProj = normalizeCollabProject(existingProjSnap.id, existingProjSnap.data());
      if (existingProj.members[user.uid]) {
        return { status: 'already_member', project: existingProj };
      }
    }
  } catch {
    // Không phải thành viên -> tiếp tục tạo yêu cầu tham gia
  }

  const now = new Date().toISOString();
  const profile = buildMemberProfile(user);
  const reqRef = doc(db, 'collabProjects', projectId, 'joinRequests', user.uid);

  try {
    const existingReqSnap = await getDoc(reqRef).catch(() => null);
    if (existingReqSnap?.exists() && existingReqSnap.data()?.status === 'pending') {
      return {
        status: 'pending',
        projectId,
        projectTitle,
        requestedRole,
        source: 'code',
        alreadyPending: true,
      };
    }

    const requestPayload: CollabJoinRequest = {
      requesterUid: user.uid,
      projectId,
      projectTitle,
      requesterName: profile.name,
      requesterPhotoURL: profile.photoURL,
      requesterPublicLabel: getPublicRequesterLabel(user),
      source: 'code',
      codeUsed: code,
      inviteTokenUsed: null,
      requestedRole,
      assignedRole: null,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      resolvedBy: null,
    };

    await setDoc(reqRef, requestPayload);
    return {
      status: 'pending',
      projectId,
      projectTitle,
      requestedRole,
      source: 'code',
      alreadyPending: false,
    };
  } catch (error: any) {
    if (isOfflineFirestoreError(error)) {
      throw new Error('Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
    if (error?.code === 'permission-denied') {
      throw new Error(
        'Không thể gửi yêu cầu tham gia: dự án đã đủ thành viên, bạn đã bị chặn khỏi dự án này hoặc mã không đúng hoặc đã hết hạn.'
      );
    }
    handleFirestoreError(error, OperationType.WRITE, `collabProjects/${projectId}/joinRequests/${user.uid}`);
  }
}

function normalizeJoinRequest(data: Record<string, any>): CollabJoinRequest {
  return {
    requesterUid: String(data.requesterUid || ''),
    projectId: String(data.projectId || ''),
    projectTitle: String(data.projectTitle || 'Dự án nhóm'),
    requesterName: String(data.requesterName || 'Thành viên'),
    requesterPhotoURL: typeof data.requesterPhotoURL === 'string' ? data.requesterPhotoURL : null,
    requesterPublicLabel: typeof data.requesterPublicLabel === 'string' ? data.requesterPublicLabel : '',
    source: data.source === 'link' ? 'link' : 'code',
    codeUsed: typeof data.codeUsed === 'string' ? data.codeUsed : null,
    inviteTokenUsed: typeof data.inviteTokenUsed === 'string' ? data.inviteTokenUsed : null,
    requestedRole: data.requestedRole === 'viewer' ? 'viewer' : 'editor',
    assignedRole:
      data.assignedRole === 'editor' || data.assignedRole === 'viewer' ? data.assignedRole : null,
    status:
      data.status === 'approved' || data.status === 'rejected' || data.status === 'cancelled'
        ? data.status
        : 'pending',
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(data.updatedAt || new Date().toISOString()),
    resolvedAt: typeof data.resolvedAt === 'string' ? data.resolvedAt : null,
    resolvedBy: typeof data.resolvedBy === 'string' ? data.resolvedBy : null,
  };
}

/**
 * Người gửi yêu cầu lắng nghe trạng thái yêu cầu của chính mình theo thời gian thực
 */
export function subscribeOwnJoinRequest(
  projectId: string,
  uid: string,
  onUpdate: (request: CollabJoinRequest | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db || !projectId || !uid) {
    onUpdate(null);
    return () => {};
  }
  const reqRef = doc(db, 'collabProjects', projectId, 'joinRequests', uid);
  return onSnapshot(
    reqRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      onUpdate(normalizeJoinRequest(snap.data()));
    },
    (error) => {
      console.warn('[Collab:joinRequest] Lỗi lắng nghe trạng thái yêu cầu:', error);
      onError?.(error);
    }
  );
}

/**
 * Người gửi hủy yêu cầu tham gia đang chờ
 */
export async function cancelOwnJoinRequest(projectId: string, uid: string): Promise<void> {
  if (!db || !projectId || !uid) return;
  try {
    await deleteDoc(doc(db, 'collabProjects', projectId, 'joinRequests', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `collabProjects/${projectId}/joinRequests/${uid}`);
  }
}

/**
 * Tải thông tin dự án nhóm sau khi yêu cầu tham gia đã được chủ dự án chấp nhận
 */
export async function fetchJoinedCollabProject(projectId: string): Promise<CollabProject | null> {
  if (!db || !projectId) return null;
  try {
    const snap = await getDoc(doc(db, 'collabProjects', projectId));
    if (!snap.exists()) return null;
    return normalizeCollabProject(snap.id, snap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `collabProjects/${projectId}`);
  }
}

/**
 * MỘT listener thời gian thực duy nhất lắng nghe danh sách yêu cầu đang chờ duyệt (dành cho chủ dự án).
 * Sử dụng composite index (status ASC, createdAt DESC); nếu index chưa được tạo trên Console sẽ tự lùi về truy vấn đơn và sắp xếp trên client để không gián đoạn trải nghiệm.
 */
export function subscribePendingJoinRequests(
  projectId: string,
  onData: (requests: CollabJoinRequest[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db || !projectId) {
    onData([]);
    return () => {};
  }

  let activeUnsub: Unsubscribe | null = null;
  let disposed = false;

  const indexedQuery = query(
    collection(db, 'collabProjects', projectId, 'joinRequests'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const attachFallbackListener = () => {
    if (disposed || !db) return;
    const fallbackQuery = query(
      collection(db, 'collabProjects', projectId, 'joinRequests'),
      where('status', '==', 'pending')
    );
    activeUnsub = onSnapshot(
      fallbackQuery,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => normalizeJoinRequest(d.data()))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(list);
      },
      (fallbackErr) => {
        console.error('[Collab:joinRequests] Lỗi fallback listener:', fallbackErr);
        onError?.(fallbackErr);
      }
    );
  };

  activeUnsub = onSnapshot(
    indexedQuery,
    (snapshot) => {
      const list = snapshot.docs.map((d) => normalizeJoinRequest(d.data()));
      onData(list);
    },
    (error: any) => {
      if (error?.code === 'failed-precondition') {
        console.warn(
          '[Collab:joinRequests] Thiếu composite index (status ASC, createdAt DESC). Đang dùng chế độ sắp xếp tạm trên trình duyệt.',
          error.message
        );
        activeUnsub = null;
        attachFallbackListener();
        return;
      }
      console.error('[Collab:joinRequests] Lỗi lắng nghe yêu cầu tham gia:', error);
      onError?.(error);
    }
  );

  return () => {
    disposed = true;
    activeUnsub?.();
  };
}

/**
 * Lắng nghe danh sách người dùng đã bị chặn của dự án (chỉ chủ dự án)
 */
export function subscribeBlockedCollabUsers(
  projectId: string,
  onData: (blockedUsers: CollabBlockedUser[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db || !projectId) {
    onData([]);
    return () => {};
  }
  return onSnapshot(
    collection(db, 'collabProjects', projectId, 'blockedUsers'),
    (snapshot) => {
      const list: CollabBlockedUser[] = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            uid: String(data.uid || d.id),
            name: String(data.name || 'Người dùng'),
            photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
            publicLabel: typeof data.publicLabel === 'string' ? data.publicLabel : '',
            blockedBy: String(data.blockedBy || ''),
            createdAt: String(data.createdAt || new Date().toISOString()),
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error) => {
      console.error('[Collab:blockedUsers] Lỗi lắng nghe danh sách chặn:', error);
      onError?.(error);
    }
  );
}

/**
 * Chủ dự án chấp nhận yêu cầu tham gia (atomic writeBatch thêm thành viên + đánh dấu approved)
 */
export async function approveJoinRequest(
  project: CollabProject,
  request: CollabJoinRequest,
  assignedRole: CollabInviteRole,
  ownerUid: string
): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const memberLimit = project.memberLimit ?? DEFAULT_COLLAB_MEMBER_LIMIT;
  if (Object.keys(project.members).length >= memberLimit) {
    throw new Error(`Dự án đã đạt giới hạn tối đa ${memberLimit} thành viên.`);
  }

  const now = new Date().toISOString();
  const publicEmail =
    request.requesterPublicLabel && !request.requesterPublicLabel.startsWith('@')
      ? request.requesterPublicLabel
      : '';
  const profile: CollabMemberProfile = {
    name: request.requesterName || 'Thành viên',
    photoURL: request.requesterPhotoURL || null,
    email: publicEmail,
  };

  const batch = writeBatch(db);
  batch.update(doc(db, 'collabProjects', project.id), {
    [`members.${request.requesterUid}`]: assignedRole,
    [`memberProfiles.${request.requesterUid}`]: profile,
    updatedAt: now,
  });
  batch.update(doc(db, 'collabProjects', project.id, 'joinRequests', request.requesterUid), {
    status: 'approved',
    assignedRole,
    resolvedAt: now,
    resolvedBy: ownerUid,
    updatedAt: now,
  });

  const docPath = `collabProjects/${project.id}/joinRequests/${request.requesterUid}`;
  try {
    await batch.commit();
    if (rtdb) {
      await rtdbSet(rtdbRef(rtdb, `presenceMeta/${project.id}/members/${request.requesterUid}`), {
        role: assignedRole,
      }).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Chủ dự án từ chối yêu cầu tham gia
 */
export async function rejectJoinRequest(
  projectId: string,
  requesterUid: string,
  ownerUid: string
): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const now = new Date().toISOString();
  const docPath = `collabProjects/${projectId}/joinRequests/${requesterUid}`;
  try {
    await updateDoc(doc(db, 'collabProjects', projectId, 'joinRequests', requesterUid), {
      status: 'rejected',
      assignedRole: null,
      resolvedAt: now,
      resolvedBy: ownerUid,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Chủ dự án chặn người gửi yêu cầu (atomic writeBatch thêm vào blockedUsers + từ chối yêu cầu)
 */
export async function blockAndRejectJoinRequest(
  projectId: string,
  request: CollabJoinRequest,
  ownerUid: string
): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const now = new Date().toISOString();
  const batch = writeBatch(db);

  const blockedPayload: CollabBlockedUser = {
    uid: request.requesterUid,
    name: request.requesterName || 'Người dùng',
    photoURL: request.requesterPhotoURL || null,
    publicLabel: request.requesterPublicLabel || '',
    blockedBy: ownerUid,
    createdAt: now,
  };

  batch.set(
    doc(db, 'collabProjects', projectId, 'blockedUsers', request.requesterUid),
    blockedPayload
  );
  batch.update(doc(db, 'collabProjects', projectId, 'joinRequests', request.requesterUid), {
    status: 'rejected',
    assignedRole: null,
    resolvedAt: now,
    resolvedBy: ownerUid,
    updatedAt: now,
  });

  const docPath = `collabProjects/${projectId}/blockedUsers/${request.requesterUid}`;
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Chủ dự án bỏ chặn người dùng khỏi danh sách chặn của dự án
 */
export async function unblockCollabUser(projectId: string, targetUid: string): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const docPath = `collabProjects/${projectId}/blockedUsers/${targetUid}`;
  try {
    await deleteDoc(doc(db, 'collabProjects', projectId, 'blockedUsers', targetUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// =========================================================================
// GIAI ĐOẠN 3: LỜI MỜI TRỰC TIẾP & HỘP THƯ LỜI MỜI (CONSENT-BASED INVITES)
// =========================================================================

function normalizeDirectInvite(id: string, data: Record<string, any>): CollabDirectInvite {
  return {
    projectId: String(data.projectId || ''),
    projectTitle: String(data.projectTitle || 'Dự án nhóm'),
    targetUid: String(data.targetUid || id),
    targetName: String(data.targetName || 'Người dùng'),
    targetUsername: typeof data.targetUsername === 'string' && data.targetUsername ? data.targetUsername : null,
    targetPhotoURL: typeof data.targetPhotoURL === 'string' ? data.targetPhotoURL : null,
    inviterUid: String(data.inviterUid || ''),
    inviterName: String(data.inviterName || 'Chủ dự án'),
    inviterPhotoURL: typeof data.inviterPhotoURL === 'string' ? data.inviterPhotoURL : null,
    role: data.role === 'viewer' ? 'viewer' : 'editor',
    status:
      data.status === 'accepted' || data.status === 'declined' || data.status === 'revoked'
        ? data.status
        : 'pending',
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(data.updatedAt || new Date().toISOString()),
    respondedAt: typeof data.respondedAt === 'string' ? data.respondedAt : null,
  };
}

function normalizeUserInviteInboxItem(id: string, data: Record<string, any>): UserInviteInboxItem {
  return {
    projectId: String(data.projectId || id),
    projectTitle: String(data.projectTitle || 'Dự án nhóm'),
    targetUid: String(data.targetUid || ''),
    inviterUid: String(data.inviterUid || ''),
    inviterName: String(data.inviterName || 'Chủ dự án'),
    inviterPhotoURL: typeof data.inviterPhotoURL === 'string' ? data.inviterPhotoURL : null,
    role: data.role === 'viewer' ? 'viewer' : 'editor',
    status:
      data.status === 'accepted' || data.status === 'declined' || data.status === 'revoked'
        ? data.status
        : 'pending',
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(data.updatedAt || new Date().toISOString()),
    respondedAt: typeof data.respondedAt === 'string' ? data.respondedAt : null,
  };
}

/**
 * Chủ dự án gửi lời mời trực tiếp tới người dùng đã tìm thấy.
 * Người được mời sẽ nhận trong hộp thư lời mời và tự bấm Chấp nhận hoặc Từ chối (không tự ép vào nhóm).
 */
export async function sendDirectCollabInvite(
  project: CollabProject,
  ownerUser: User,
  target: UserSearchResult,
  role: CollabInviteRole
): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  if (target.uid === ownerUser.uid) {
    throw new Error('Bạn đã là chủ sở hữu của dự án này.');
  }
  if (project.members[target.uid]) {
    throw new Error('Người dùng này đã là thành viên trong dự án.');
  }
  if (!target.acceptDirectInvites) {
    throw new Error('Người dùng này đang tắt nhận lời mời tham gia dự án.');
  }

  const memberLimit = project.memberLimit ?? DEFAULT_COLLAB_MEMBER_LIMIT;
  if (Object.keys(project.members).length >= memberLimit) {
    throw new Error(`Dự án đã đạt giới hạn tối đa ${memberLimit} thành viên.`);
  }

  const now = new Date().toISOString();
  const inviterProfile = buildMemberProfile(ownerUser);

  const projectInvitePayload: CollabDirectInvite = {
    projectId: project.id,
    projectTitle: project.title,
    targetUid: target.uid,
    targetName: target.displayName,
    targetUsername: target.username || null,
    targetPhotoURL: target.photoURL || null,
    inviterUid: ownerUser.uid,
    inviterName: inviterProfile.name,
    inviterPhotoURL: inviterProfile.photoURL,
    role,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    respondedAt: null,
  };

  const userInboxPayload: UserInviteInboxItem = {
    projectId: project.id,
    projectTitle: project.title,
    targetUid: target.uid,
    inviterUid: ownerUser.uid,
    inviterName: inviterProfile.name,
    inviterPhotoURL: inviterProfile.photoURL,
    role,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    respondedAt: null,
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'collabProjects', project.id, 'invites', target.uid), projectInvitePayload);
  batch.set(doc(db, 'users', target.uid, 'userInvites', project.id), userInboxPayload);

  const docPath = `collabProjects/${project.id}/invites/${target.uid}`;
  try {
    await batch.commit();
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      throw new Error(
        'Không thể gửi lời mời: người dùng đã tắt nhận lời mời, đã bị chặn hoặc dự án đã đầy.'
      );
    }
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Chủ dự án thu hồi lời mời trực tiếp đang chờ phản hồi
 */
export async function revokeDirectCollabInvite(
  projectId: string,
  targetUid: string
): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const batch = writeBatch(db);
  batch.delete(doc(db, 'collabProjects', projectId, 'invites', targetUid));
  batch.delete(doc(db, 'users', targetUid, 'userInvites', projectId));

  const docPath = `collabProjects/${projectId}/invites/${targetUid}`;
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Lắng nghe danh sách lời mời trực tiếp đang chờ phản hồi của một dự án (dành cho chủ dự án)
 */
export function subscribeProjectSentInvites(
  projectId: string,
  onData: (invites: CollabDirectInvite[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db || !projectId) {
    onData([]);
    return () => {};
  }

  let activeUnsub: Unsubscribe | null = null;
  let disposed = false;

  const indexedQuery = query(
    collection(db, 'collabProjects', projectId, 'invites'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const attachFallback = () => {
    if (disposed || !db) return;
    const fallbackQ = query(
      collection(db, 'collabProjects', projectId, 'invites'),
      where('status', '==', 'pending')
    );
    activeUnsub = onSnapshot(
      fallbackQ,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => normalizeDirectInvite(d.id, d.data()))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(list);
      },
      (fallbackErr) => {
        console.error('[Collab:sentInvites] Lỗi fallback listener:', fallbackErr);
        onError?.(fallbackErr);
      }
    );
  };

  activeUnsub = onSnapshot(
    indexedQuery,
    (snapshot) => {
      const list = snapshot.docs.map((d) => normalizeDirectInvite(d.id, d.data()));
      onData(list);
    },
    (error: any) => {
      if (error?.code === 'failed-precondition') {
        console.warn(
          '[Collab:sentInvites] Thiếu composite index (status ASC, createdAt DESC). Đang dùng sắp xếp tạm trên trình duyệt.',
          error.message
        );
        activeUnsub = null;
        attachFallback();
        return;
      }
      console.error('[Collab:sentInvites] Lỗi lắng nghe lời mời đã gửi:', error);
      onError?.(error);
    }
  );

  return () => {
    disposed = true;
    activeUnsub?.();
  };
}

/**
 * Lắng nghe hộp thư lời mời tham gia dự án nhóm của người dùng hiện tại
 */
export function subscribeUserInviteInbox(
  uid: string,
  onData: (invites: UserInviteInboxItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db || !uid) {
    onData([]);
    return () => {};
  }

  let activeUnsub: Unsubscribe | null = null;
  let disposed = false;

  const indexedQuery = query(
    collection(db, 'users', uid, 'userInvites'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const attachFallback = () => {
    if (disposed || !db) return;
    const fallbackQ = query(
      collection(db, 'users', uid, 'userInvites'),
      where('status', '==', 'pending')
    );
    activeUnsub = onSnapshot(
      fallbackQ,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => normalizeUserInviteInboxItem(d.id, d.data()))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(list);
      },
      (fallbackErr) => {
        console.error('[Collab:userInvites] Lỗi fallback listener:', fallbackErr);
        onError?.(fallbackErr);
      }
    );
  };

  activeUnsub = onSnapshot(
    indexedQuery,
    (snapshot) => {
      const list = snapshot.docs.map((d) => normalizeUserInviteInboxItem(d.id, d.data()));
      onData(list);
    },
    (error: any) => {
      if (error?.code === 'failed-precondition') {
        console.warn(
          '[Collab:userInvites] Thiếu composite index (status ASC, createdAt DESC). Đang dùng sắp xếp tạm trên trình duyệt.',
          error.message
        );
        activeUnsub = null;
        attachFallback();
        return;
      }
      console.error('[Collab:userInvites] Lỗi lắng nghe hộp thư lời mời:', error);
      onError?.(error);
    }
  );

  return () => {
    disposed = true;
    activeUnsub?.();
  };
}

/**
 * Người dùng đồng ý chấp nhận lời mời trực tiếp -> tự thêm vào dự án nhóm với đúng vai trò được mời
 */
export async function acceptUserCollabInvite(
  invite: UserInviteInboxItem,
  user: User
): Promise<CollabProject> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');

  const now = new Date().toISOString();
  const profile = buildMemberProfile(user);
  const projectRef = doc(db, 'collabProjects', invite.projectId);
  const projectInviteRef = doc(db, 'collabProjects', invite.projectId, 'invites', user.uid);
  const inboxRef = doc(db, 'users', user.uid, 'userInvites', invite.projectId);

  const batch = writeBatch(db);
  batch.update(projectRef, {
    [`members.${user.uid}`]: invite.role,
    [`memberProfiles.${user.uid}`]: profile,
    updatedAt: now,
  });
  batch.update(projectInviteRef, {
    status: 'accepted',
    respondedAt: now,
    updatedAt: now,
  });
  batch.update(inboxRef, {
    status: 'accepted',
    respondedAt: now,
    updatedAt: now,
  });

  try {
    await batch.commit();
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      throw new Error(
        'Không thể tham gia: lời mời đã bị thu hồi, dự án đã đầy hoặc tài khoản không đủ quyền.'
      );
    }
    handleFirestoreError(error, OperationType.UPDATE, `collabProjects/${invite.projectId}`);
  }

  if (rtdb) {
    await rtdbSet(rtdbRef(rtdb, `presenceMeta/${invite.projectId}/members/${user.uid}`), {
      role: invite.role,
    }).catch(() => {});
  }

  const snap = await getDoc(projectRef);
  if (!snap.exists()) {
    throw new Error('Không tìm thấy dự án nhóm sau khi chấp nhận lời mời.');
  }
  return normalizeCollabProject(snap.id, snap.data());
}

/**
 * Người dùng từ chối lời mời trực tiếp
 */
export async function declineUserCollabInvite(
  invite: UserInviteInboxItem,
  uid: string
): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const now = new Date().toISOString();

  const projectInviteRef = doc(db, 'collabProjects', invite.projectId, 'invites', uid);
  const inboxRef = doc(db, 'users', uid, 'userInvites', invite.projectId);

  const batch = writeBatch(db);
  batch.update(projectInviteRef, {
    status: 'declined',
    respondedAt: now,
    updatedAt: now,
  });
  batch.update(inboxRef, {
    status: 'declined',
    respondedAt: now,
    updatedAt: now,
  });

  try {
    await batch.commit();
  } catch (error: any) {
    // Nếu lời mời ở dự án gốc đã bị xóa trước đó, vẫn xóa bản ghi hộp thư cá nhân
    if (error?.code === 'not-found' || error?.code === 'permission-denied') {
      await deleteDoc(inboxRef).catch(() => {});
      return;
    }
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/userInvites/${invite.projectId}`);
  }
}

/**
 * Thay đổi vai trò thành viên (chỉ chủ sở hữu)
 */
export async function changeCollabMemberRole(
  projectId: string,
  targetUid: string,
  role: CollabInviteRole
): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const docPath = `collabProjects/${projectId}`;
  try {
    await updateDoc(doc(db, 'collabProjects', projectId), {
      [`members.${targetUid}`]: role,
      updatedAt: new Date().toISOString(),
    });
    if (rtdb) {
      await rtdbUpdate(rtdbRef(rtdb, `presenceMeta/${projectId}/members/${targetUid}`), {
        role,
      }).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Xóa thành viên khỏi dự án nhóm (chỉ chủ sở hữu)
 */
export async function removeCollabMember(projectId: string, targetUid: string): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const docPath = `collabProjects/${projectId}`;
  try {
    await updateDoc(doc(db, 'collabProjects', projectId), {
      [`members.${targetUid}`]: deleteField(),
      [`memberProfiles.${targetUid}`]: deleteField(),
      updatedAt: new Date().toISOString(),
    });
    if (rtdb) {
      await rtdbRemove(rtdbRef(rtdb, `presenceMeta/${projectId}/members/${targetUid}`)).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Chuyển quyền sở hữu dự án nhóm cho thành viên khác (chủ sở hữu cũ trở thành Biên tập viên)
 */
export async function transferCollabOwnership(
  project: CollabProject,
  currentOwnerUid: string,
  newOwnerUid: string
): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  if (currentOwnerUid === newOwnerUid) return;
  const now = new Date().toISOString();
  const docPath = `collabProjects/${project.id}`;

  try {
    await updateDoc(doc(db, 'collabProjects', project.id), {
      ownerId: newOwnerUid,
      [`members.${newOwnerUid}`]: 'owner',
      [`members.${currentOwnerUid}`]: 'editor',
      updatedAt: now,
    });
    if (rtdb) {
      await rtdbUpdate(rtdbRef(rtdb, `presenceMeta/${project.id}`), {
        ownerId: newOwnerUid,
        [`members/${newOwnerUid}/role`]: 'owner',
        [`members/${currentOwnerUid}/role`]: 'editor',
      }).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Thành viên không phải chủ sở hữu tự rời khỏi dự án nhóm
 */
export async function leaveCollabProject(projectId: string, uid: string): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const docPath = `collabProjects/${projectId}`;
  try {
    await updateDoc(doc(db, 'collabProjects', projectId), {
      [`members.${uid}`]: deleteField(),
      [`memberProfiles.${uid}`]: deleteField(),
      updatedAt: new Date().toISOString(),
    });
    if (rtdb) {
      await rtdbRemove(rtdbRef(rtdb, `presenceMeta/${projectId}/members/${uid}`)).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Xóa hoàn toàn dự án nhóm (chỉ chủ sở hữu)
 */
export async function deleteCollabProject(project: CollabProject): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const docPath = `collabProjects/${project.id}`;

  try {
    const updatesSnap = await getDocs(collection(db, 'collabProjects', project.id, 'updates'));
    await Promise.all(updatesSnap.docs.map((d) => deleteDoc(d.ref)));

    const snapshotsSnap = await getDocs(collection(db, 'collabProjects', project.id, 'snapshots'));
    await Promise.all(snapshotsSnap.docs.map((d) => deleteDoc(d.ref)));

    const commentsSnap = await getDocs(collection(db, 'collabProjects', project.id, 'comments'));
    await Promise.all(commentsSnap.docs.map((d) => deleteDoc(d.ref)));

    const messagesSnap = await getDocs(collection(db, 'collabProjects', project.id, 'messages'));
    await Promise.all(messagesSnap.docs.map((d) => deleteDoc(d.ref)));

    const stateSnap = await getDocs(collection(db, 'collabProjects', project.id, 'state'));
    await Promise.all(stateSnap.docs.map((d) => deleteDoc(d.ref)));

    const requestsSnap = await getDocs(collection(db, 'collabProjects', project.id, 'joinRequests'));
    await Promise.all(requestsSnap.docs.map((d) => deleteDoc(d.ref)));

    const invitesSnap = await getDocs(collection(db, 'collabProjects', project.id, 'invites'));
    await Promise.all(
      invitesSnap.docs.map(async (d) => {
        await deleteDoc(doc(db!, 'users', d.id, 'userInvites', project.id)).catch(() => {});
        await deleteDoc(d.ref);
      })
    );

    const blockedSnap = await getDocs(collection(db, 'collabProjects', project.id, 'blockedUsers'));
    await Promise.all(blockedSnap.docs.map((d) => deleteDoc(d.ref)));

    if (project.inviteToken) {
      await deleteDoc(doc(db, 'collabInvites', project.inviteToken)).catch(() => {});
    }

    if (project.joinCode) {
      await deleteDoc(doc(db, 'joinCodes', project.joinCode)).catch(() => {});
    }

    if (rtdb) {
      await rtdbRemove(rtdbRef(rtdb, `presence/${project.id}`)).catch(() => {});
      await rtdbRemove(rtdbRef(rtdb, `presenceMeta/${project.id}`)).catch(() => {});
    }

    await deleteDoc(doc(db, 'collabProjects', project.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
