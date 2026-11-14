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
} from 'firebase/firestore';
import { ref as rtdbRef, set as rtdbSet, update as rtdbUpdate, remove as rtdbRemove } from 'firebase/database';
import { db, rtdb, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  CollabInviteRole,
  CollabMemberProfile,
  CollabProject,
  CollabRole,
  Project,
} from '../types';
import {
  decodeCollabStateToCode,
  encodeInitialCollabState,
} from '../lib/collabYjsHelpers';
import { getSnapshotCursor } from '../lib/CollabProvider';
import { getAccountIdentity } from '../lib/usernameAuth';

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

function normalizeCollabProject(id: string, data: Record<string, any>): CollabProject {
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
    singleEditorPerAccount: input.singleEditorPerAccount !== false,
    createdAt: now,
    updatedAt: now,
  };

  const docPath = `collabProjects/${projectId}`;
  try {
    await setDoc(doc(db, 'collabProjects', projectId), project);

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
  activeInviteToken?: string
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
  }
): Promise<{ inviteEnabled: boolean; inviteRole: CollabInviteRole; inviteToken: string }> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');

  const now = new Date().toISOString();
  const nextEnabled =
    options.inviteEnabled !== undefined ? options.inviteEnabled : project.inviteEnabled;
  const nextRole = options.inviteRole !== undefined ? options.inviteRole : project.inviteRole;
  const nextToken = options.regenerateToken ? generateInviteToken() : project.inviteToken;

  const docPath = `collabProjects/${project.id}`;
  try {
    await updateDoc(doc(db, 'collabProjects', project.id), {
      inviteEnabled: nextEnabled,
      inviteRole: nextRole,
      inviteToken: nextToken,
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
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Tham gia dự án nhóm thông qua liên kết mời
 */
export async function joinCollabProjectByInvite(
  projectId: string,
  inviteToken: string,
  user: User
): Promise<CollabProject> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const now = new Date().toISOString();

  // 1. Nếu người dùng đã là thành viên rồi thì trả về luôn dự án
  try {
    const existingSnap = await getDoc(doc(db, 'collabProjects', projectId));
    if (existingSnap.exists()) {
      const existingData = normalizeCollabProject(existingSnap.id, existingSnap.data());
      if (existingData.members[user.uid]) {
        return existingData;
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

  const assignedRole: CollabInviteRole =
    inviteData.inviteRole === 'viewer' ? 'viewer' : 'editor';
  const profile = buildMemberProfile(user);

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
      throw new Error('Liên kết mời đã hết hiệu lực, bị tắt hoặc đã được làm mới.');
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

  return normalizeCollabProject(joinedSnap.id, joinedSnap.data());
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

    if (project.inviteToken) {
      await deleteDoc(doc(db, 'collabInvites', project.inviteToken)).catch(() => {});
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
