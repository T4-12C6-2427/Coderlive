import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  CollabChatMessage,
  CollabLineComment,
  CollabLineCommentReply,
  CollabPreviewSyncState,
  DeviceMode,
  EditorTab,
} from '../types';

function createValidDocId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// =========================================================================
// 1. LINE COMMENTS (Tách biệt khỏi Yjs CRDT)
// =========================================================================

export function subscribeCollabComments(
  projectId: string,
  onData: (comments: CollabLineComment[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db || !projectId) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, 'collabProjects', projectId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: CollabLineComment[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: String(data.id || d.id),
          projectId: String(data.projectId || projectId),
          tab: data.tab === 'css' || data.tab === 'js' ? data.tab : 'html',
          lineNumber: typeof data.lineNumber === 'number' ? data.lineNumber : 1,
          relPosJson: typeof data.relPosJson === 'string' ? data.relPosJson : null,
          authorId: String(data.authorId || ''),
          authorName: String(data.authorName || 'Thành viên'),
          authorColor: String(data.authorColor || '#4F46E5'),
          text: String(data.text || ''),
          resolved: Boolean(data.resolved),
          resolvedByName: typeof data.resolvedByName === 'string' ? data.resolvedByName : null,
          resolvedAt: typeof data.resolvedAt === 'string' ? data.resolvedAt : null,
          replies: Array.isArray(data.replies) ? (data.replies as CollabLineCommentReply[]) : [],
          createdAt: String(data.createdAt || ''),
          updatedAt: String(data.updatedAt || ''),
        });
      });
      onData(list);
    },
    (error) => {
      console.warn('[CollabComments] Lỗi lắng nghe bình luận:', error);
      onError?.(error);
    }
  );
}

export async function addCollabLineComment(input: {
  projectId: string;
  tab: EditorTab;
  lineNumber: number;
  relPosJson: string | null;
  authorId: string;
  authorName: string;
  authorColor: string;
  text: string;
}): Promise<CollabLineComment> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const trimmed = input.text.trim().slice(0, 1000);
  if (!trimmed) throw new Error('Nội dung bình luận không được để trống');

  const id = createValidDocId('cmt');
  const now = new Date().toISOString();
  const safeLine = Math.max(1, Math.min(100000, Math.floor(input.lineNumber)));
  const safeRelPos =
    input.relPosJson && input.relPosJson.length <= 2000 ? input.relPosJson : null;

  const comment: CollabLineComment = {
    id,
    projectId: input.projectId,
    tab: input.tab,
    lineNumber: safeLine,
    relPosJson: safeRelPos,
    authorId: input.authorId,
    authorName: input.authorName.trim().slice(0, 100) || 'Thành viên',
    authorColor: input.authorColor.slice(0, 20) || '#4F46E5',
    text: trimmed,
    resolved: false,
    resolvedByName: null,
    resolvedAt: null,
    replies: [],
    createdAt: now,
    updatedAt: now,
  };

  const docPath = `collabProjects/${input.projectId}/comments/${id}`;
  try {
    await setDoc(doc(db, 'collabProjects', input.projectId, 'comments', id), comment);
    return comment;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function replyCollabLineComment(input: {
  projectId: string;
  commentId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  text: string;
}): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const trimmed = input.text.trim().slice(0, 800);
  if (!trimmed) return;

  const now = new Date().toISOString();
  const reply: CollabLineCommentReply = {
    id: createValidDocId('rep'),
    authorId: input.authorId,
    authorName: input.authorName.trim().slice(0, 100) || 'Thành viên',
    authorColor: input.authorColor.slice(0, 20) || '#4F46E5',
    text: trimmed,
    createdAt: now,
  };

  const docPath = `collabProjects/${input.projectId}/comments/${input.commentId}`;
  try {
    await updateDoc(doc(db, 'collabProjects', input.projectId, 'comments', input.commentId), {
      replies: arrayUnion(reply),
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function toggleResolveCollabComment(input: {
  projectId: string;
  commentId: string;
  resolved: boolean;
  resolvedByName: string;
}): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const now = new Date().toISOString();
  const docPath = `collabProjects/${input.projectId}/comments/${input.commentId}`;
  try {
    await updateDoc(doc(db, 'collabProjects', input.projectId, 'comments', input.commentId), {
      resolved: input.resolved,
      resolvedByName: input.resolved ? input.resolvedByName.trim().slice(0, 100) || 'Thành viên' : null,
      resolvedAt: input.resolved ? now : null,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteCollabLineComment(projectId: string, commentId: string): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const docPath = `collabProjects/${projectId}/comments/${commentId}`;
  try {
    await deleteDoc(doc(db, 'collabProjects', projectId, 'comments', commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// =========================================================================
// 2. TEAM CHAT STRIP MESSAGES (Tin nhắn ngắn lưu tại Firestore)
// =========================================================================

export function subscribeCollabMessages(
  projectId: string,
  onData: (messages: CollabChatMessage[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  if (!db || !projectId) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, 'collabProjects', projectId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(80)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: CollabChatMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: String(data.id || d.id),
          projectId: String(data.projectId || projectId),
          authorId: String(data.authorId || ''),
          authorName: String(data.authorName || 'Thành viên'),
          authorColor: String(data.authorColor || '#4F46E5'),
          photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
          text: String(data.text || ''),
          createdAt: String(data.createdAt || ''),
        });
      });
      // Hiển thị theo thứ tự thời gian tăng dần
      list.reverse();
      onData(list);
    },
    (error) => {
      console.warn('[CollabChat] Lỗi lắng nghe tin nhắn:', error);
      onError?.(error);
    }
  );
}

export async function sendCollabMessage(input: {
  projectId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  photoURL: string | null;
  text: string;
}): Promise<CollabChatMessage> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const trimmed = input.text.trim().slice(0, 500);
  if (!trimmed) throw new Error('Tin nhắn không được để trống');

  const id = createValidDocId('msg');
  const now = new Date().toISOString();
  const message: CollabChatMessage = {
    id,
    projectId: input.projectId,
    authorId: input.authorId,
    authorName: input.authorName.trim().slice(0, 100) || 'Thành viên',
    authorColor: input.authorColor.slice(0, 20) || '#4F46E5',
    photoURL: input.photoURL ? input.photoURL.slice(0, 1024) : null,
    text: trimmed,
    createdAt: now,
  };

  const docPath = `collabProjects/${input.projectId}/messages/${id}`;
  try {
    await setDoc(doc(db, 'collabProjects', input.projectId, 'messages', id), message);
    return message;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function deleteCollabMessage(projectId: string, messageId: string): Promise<void> {
  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa sẵn sàng');
  const docPath = `collabProjects/${projectId}/messages/${messageId}`;
  try {
    await deleteDoc(doc(db, 'collabProjects', projectId, 'messages', messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// =========================================================================
// 3. OPTIONAL PREVIEW SYNC STATE (Tắt mặc định)
// =========================================================================

export function subscribeCollabPreviewSync(
  projectId: string,
  onState: (state: CollabPreviewSyncState | null) => void
): Unsubscribe {
  if (!db || !projectId) {
    onState(null);
    return () => {};
  }

  const ref = doc(db, 'collabProjects', projectId, 'state', 'preview');
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onState(null);
        return;
      }
      const data = snap.data();
      const device: DeviceMode =
        data.device === 'tablet' || data.device === 'mobile' ? data.device : 'desktop';
      onState({
        device,
        refreshNonce: typeof data.refreshNonce === 'number' ? data.refreshNonce : 0,
        updatedByUid: String(data.updatedByUid || ''),
        updatedByName: String(data.updatedByName || 'Thành viên'),
        updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
      });
    },
    (error) => {
      console.warn('[CollabPreviewSync] Lỗi lắng nghe trạng thái xem trước:', error);
    }
  );
}

export async function publishCollabPreviewSync(input: {
  projectId: string;
  device: DeviceMode;
  refreshNonce: number;
  updatedByUid: string;
  updatedByName: string;
}): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'collabProjects', input.projectId, 'state', 'preview'), {
      device: input.device,
      refreshNonce: Math.max(0, Math.floor(input.refreshNonce)),
      updatedByUid: input.updatedByUid,
      updatedByName: input.updatedByName.trim().slice(0, 100) || 'Thành viên',
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.warn('[CollabPreviewSync] Không thể đẩy trạng thái xem trước:', error);
  }
}
