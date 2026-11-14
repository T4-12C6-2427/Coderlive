import * as Y from 'yjs';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  Unsubscribe,
  writeBatch,
  QueryConstraint,
} from 'firebase/firestore';
import { db, firestorePersistenceMode, FirestorePersistenceMode } from './firebase';
import {
  applyStringDiffToYText,
  base64ToUint8Array,
  uint8ToBase64,
} from './collabYjsHelpers';
import { CollabRole, CollabSyncState, EditorTab, PresenceUser } from '../types';

export const COLLAB_REMOTE_ORIGIN = Symbol('collab-firestore-remote');
export const COLLAB_LOCAL_BULK_ORIGIN = Symbol('collab-local-bulk');
export const COLLAB_OFFLINE_RESTORE_ORIGIN = Symbol('collab-offline-restore');

export const STAGE1_SYNC_TIMINGS = {
  LEADING_FLUSH_DELAY_MS: 16,
  LEADING_COOLDOWN_MS: 120,
  TRAILING_BATCH_MS: 85,
  MAX_BATCH_WAIT_MS: 600,
  COMPACTION_UPDATE_THRESHOLD: 30,
  COMPACTION_FORCE_THRESHOLD: 90,
  COMPACTION_IDLE_DELAY_MS: 2500,
  META_TOUCH_THROTTLE_MS: 60_000,
  IME_BUFFER_MAX_MS: 2500,
  HIGH_SESSION_WRITE_THRESHOLD: 250,
} as const;

export const MAX_CHUNK_BASE64_LENGTH = 850_000;
export const MAX_SNAPSHOT_BASE64_LENGTH = 920_000;
export const WARN_SNAPSHOT_BASE64_LENGTH = 720_000;

const OFFLINE_QUEUE_KEY_PREFIX = 'coderlive_collab_offline_queue_v1_';

export interface RemoteTextInsert {
  tab: EditorTab;
  from: number;
  to: number;
}

export interface CollabSessionMetrics {
  projectId: string;
  sessionStartedAt: number;
  persistenceMode: FirestorePersistenceMode;
  readsCount: number;
  writesCount: number;
  chunkWritesCount: number;
  snapshotWritesCount: number;
  metaWritesCount: number;
  batchDeletesCount: number;
  bytesRead: number;
  bytesWritten: number;
  compactionsCount: number;
  remoteFramesApplied: number;
  reconnectCatchUpsCount: number;
  pendingLocalUpdates: number;
  lastWriteAt: number | null;
  lastReadAt: number | null;
}

export interface CompactionElectionResult {
  leaderSessionId: string;
  isLeader: boolean;
  activeEditorCount: number;
}

/**
 * Bầu chọn đúng 1 phiên làm việc chịu trách nhiệm nén snapshot (sessionId nhỏ nhất
 * trong các phiên có quyền owner/editor đang trực tuyến).
 */
export function electCompactionLeader(
  onlineUsers: Pick<PresenceUser, 'sessions'>[],
  localSessionId: string
): CompactionElectionResult {
  const candidateIds = new Set<string>();

  for (const user of onlineUsers) {
    if (!Array.isArray(user.sessions)) continue;
    for (const sess of user.sessions) {
      if (sess?.sessionId && (sess.role === 'owner' || sess.role === 'editor')) {
        candidateIds.add(sess.sessionId);
      }
    }
  }

  if (localSessionId) {
    candidateIds.add(localSessionId);
  }

  const sorted = Array.from(candidateIds).sort();
  const leaderSessionId = sorted[0] || localSessionId || '';
  const isLeader = localSessionId ? leaderSessionId === localSessionId : true;

  return {
    leaderSessionId,
    isLeader,
    activeEditorCount: sorted.length,
  };
}

export function getSnapshotCursor(data: {
  watermarkAt?: unknown;
  updatedAt?: unknown;
} | null | undefined): string | null {
  if (!data) return null;
  if (typeof data.watermarkAt === 'string' && data.watermarkAt.length > 0) {
    return data.watermarkAt;
  }
  if (typeof data.updatedAt === 'string' && data.updatedAt.length > 0) {
    return data.updatedAt;
  }
  return null;
}

export function shouldSkipUpdateChunk(params: {
  docId: string;
  hasPendingWrites: boolean;
  chunkClientId?: unknown;
  localClientId: number;
  seenDocIds: Set<string>;
}): boolean {
  if (params.hasPendingWrites) return true;
  if (params.seenDocIds.has(params.docId)) return true;
  if (typeof params.chunkClientId === 'number' && params.chunkClientId === params.localClientId) {
    return true;
  }
  return false;
}

let activeSessionMetrics: CollabSessionMetrics | null = null;

export function getActiveCollabSessionMetrics(): CollabSessionMetrics | null {
  return activeSessionMetrics ? { ...activeSessionMetrics } : null;
}

export interface CollabProviderOptions {
  projectId: string;
  userId: string;
  canEdit: boolean;
  onSyncStateChange?: (state: CollabSyncState) => void;
  onSnapshotReady?: () => void;
  onCodeChange?: (code: { htmlCode: string; cssCode: string; jsCode: string }) => void;
  onRemoteInsert?: (inserts: RemoteTextInsert[]) => void;
  onError?: (message: string) => void;
  onSizeWarning?: (message: string) => void;
  onHighWriteUsage?: (metrics: CollabSessionMetrics) => void;
}

/**
 * Custom Yjs CRDT Provider trên nền Cloud Firestore (Spark plan friendly).
 * Giai đoạn 1:
 * - Gửi đầu đợt nhanh + gộp đuôi 75ms (Y.mergeUpdates), không chặn luồng gõ phím.
 * - Mở dự án từ snapshot/latest trước, sau đó truy vấn có con trỏ (startAfter).
 * - Chống dội ngược bằng clientId + metadata.hasPendingWrites + Yjs origin.
 * - Gom cập nhật từ xa thành 1 Y.Doc transaction mỗi khung hình (rAF).
 * - Nén an toàn theo phiên trưởng (leader election), lúc nhàn rỗi hoặc khi người sửa cuối rời đi.
 * - Hỗ trợ hàng đợi ngoại tuyến + đồng bộ bù bằng Yjs State Vector khi kết nối lại.
 */
export class CollabProvider {
  public readonly projectId: string;
  public readonly userId: string;
  public readonly ydoc: Y.Doc;
  public readonly yHtml: Y.Text;
  public readonly yCss: Y.Text;
  public readonly yJs: Y.Text;
  public readonly undoManagers: Record<EditorTab, Y.UndoManager>;
  public readonly localClientId: number;

  private canEdit: boolean;
  private onSyncStateChange?: (state: CollabSyncState) => void;
  private onSnapshotReady?: () => void;
  private onCodeChange?: (code: { htmlCode: string; cssCode: string; jsCode: string }) => void;
  private onRemoteInsert?: (inserts: RemoteTextInsert[]) => void;
  private onError?: (message: string) => void;
  private onSizeWarning?: (message: string) => void;
  private onHighWriteUsage?: (metrics: CollabSessionMetrics) => void;

  private isDestroyed = false;
  private isSynced = false;
  private hasAppliedInitialSnapshot = false;
  private syncState: CollabSyncState = 'connecting';

  private pendingUpdates: Uint8Array[] = [];
  private seenUpdateDocIds = new Set<string>();
  private knownServerUpdateIds = new Set<string>();
  private knownUpdateCreatedAt = new Map<string, string>();
  private lastAppliedSnapshotStamp: string | null = null;
  private snapshotCursor: string | null = null;
  private lastUpdateCursor: string | null = null;

  private isLocalComposing = false;
  private pendingRemoteQueue: Uint8Array[] = [];
  private remoteApplyRafId: number | null = null;
  private remoteApplyTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private imeFlushSafetyTimer: ReturnType<typeof setTimeout> | null = null;
  private hasEmittedSizeWarning = false;
  private hasEmittedSizeExceeded = false;
  private hasEmittedHighWriteNotice = false;

  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private maxWaitTimer: ReturnType<typeof setTimeout> | null = null;
  private offlineBackupTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private idleCompactionTimer: ReturnType<typeof setTimeout> | null = null;
  private retryAttempt = 0;
  private isFlushing = false;
  private isCompacting = false;
  private isCatchingUp = false;
  private updatesListenerErrored = false;
  private seq = 0;
  private lastFlushDispatchedAt = 0;
  private lastActivityAt = Date.now();
  private lastMetaTouchAt = 0;

  private isCompactionLeader = true;
  private activeEditorSessionCount = 1;

  private metrics: CollabSessionMetrics;

  private unsubUpdates: Unsubscribe | null = null;
  private unsubSnapshot: Unsubscribe | null = null;

  constructor(options: CollabProviderOptions) {
    this.projectId = options.projectId;
    this.userId = options.userId;
    this.canEdit = options.canEdit;
    this.onSyncStateChange = options.onSyncStateChange;
    this.onSnapshotReady = options.onSnapshotReady;
    this.onCodeChange = options.onCodeChange;
    this.onRemoteInsert = options.onRemoteInsert;
    this.onError = options.onError;
    this.onSizeWarning = options.onSizeWarning;
    this.onHighWriteUsage = options.onHighWriteUsage;

    this.ydoc = new Y.Doc();
    this.localClientId = Math.floor(Math.abs(this.ydoc.clientID));
    this.yHtml = this.ydoc.getText('html');
    this.yCss = this.ydoc.getText('css');
    this.yJs = this.ydoc.getText('js');

    this.metrics = {
      projectId: this.projectId,
      sessionStartedAt: Date.now(),
      persistenceMode: firestorePersistenceMode,
      readsCount: 0,
      writesCount: 0,
      chunkWritesCount: 0,
      snapshotWritesCount: 0,
      metaWritesCount: 0,
      batchDeletesCount: 0,
      bytesRead: 0,
      bytesWritten: 0,
      compactionsCount: 0,
      remoteFramesApplied: 0,
      reconnectCatchUpsCount: 0,
      pendingLocalUpdates: 0,
      lastWriteAt: null,
      lastReadAt: null,
    };
    activeSessionMetrics = this.metrics;

    // UndoManager riêng từng tab, chỉ theo dõi thay đổi cục bộ của người dùng
    this.undoManagers = {
      html: new Y.UndoManager(this.yHtml, {
        trackedOrigins: new Set([null, COLLAB_LOCAL_BULK_ORIGIN]),
        captureTimeout: 400,
      }),
      css: new Y.UndoManager(this.yCss, {
        trackedOrigins: new Set([null, COLLAB_LOCAL_BULK_ORIGIN]),
        captureTimeout: 400,
      }),
      js: new Y.UndoManager(this.yJs, {
        trackedOrigins: new Set([null, COLLAB_LOCAL_BULK_ORIGIN]),
        captureTimeout: 400,
      }),
    };

    this.ydoc.on('update', this.handleYDocUpdate);
    this.ydoc.on('afterTransaction', this.handleAfterTransaction);
    this.yHtml.observe(this.handleHtmlObserve);
    this.yCss.observe(this.handleCssObserve);
    this.yJs.observe(this.handleJsObserve);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleNetworkOnline);
      window.addEventListener('offline', this.handleNetworkOffline);
      window.addEventListener('pagehide', this.handlePageUnload);
      window.addEventListener('beforeunload', this.handlePageUnload);
    }
  }

  private get offlineQueueStorageKey(): string {
    return `${OFFLINE_QUEUE_KEY_PREFIX}${this.projectId}_${this.userId}`;
  }

  public getMetrics(): CollabSessionMetrics {
    this.metrics.pendingLocalUpdates = this.pendingUpdates.length;
    return { ...this.metrics };
  }

  private recordRead(docsCount: number, bytesLen = 0): void {
    this.metrics.readsCount += docsCount;
    this.metrics.bytesRead += bytesLen;
    this.metrics.lastReadAt = Date.now();
    activeSessionMetrics = this.metrics;
  }

  private recordWrite(kind: 'chunk' | 'snapshot' | 'meta' | 'delete', count = 1, bytesLen = 0): void {
    this.metrics.writesCount += count;
    this.metrics.bytesWritten += bytesLen;
    this.metrics.lastWriteAt = Date.now();
    if (kind === 'chunk') this.metrics.chunkWritesCount += count;
    else if (kind === 'snapshot') this.metrics.snapshotWritesCount += count;
    else if (kind === 'meta') this.metrics.metaWritesCount += count;
    else if (kind === 'delete') this.metrics.batchDeletesCount += count;
    activeSessionMetrics = this.metrics;

    if (
      !this.hasEmittedHighWriteNotice &&
      this.metrics.writesCount >= STAGE1_SYNC_TIMINGS.HIGH_SESSION_WRITE_THRESHOLD
    ) {
      this.hasEmittedHighWriteNotice = true;
      this.onHighWriteUsage?.(this.getMetrics());
    }
  }

  private emitRemoteDeltaInserts(
    tab: EditorTab,
    event: Y.YTextEvent,
    tr: Y.Transaction
  ): void {
    if (this.isDestroyed || !this.hasAppliedInitialSnapshot || tr.origin !== COLLAB_REMOTE_ORIGIN) {
      return;
    }
    if (!this.onRemoteInsert) return;

    const inserts: RemoteTextInsert[] = [];
    let pos = 0;
    for (const op of event.delta) {
      if (typeof op.retain === 'number') {
        pos += op.retain;
      } else if (typeof op.insert === 'string') {
        const len = op.insert.length;
        if (len > 0) {
          inserts.push({ tab, from: pos, to: pos + len });
        }
        pos += len;
      }
    }
    if (inserts.length > 0) {
      this.onRemoteInsert(inserts);
    }
  }

  private handleHtmlObserve = (event: Y.YTextEvent, tr: Y.Transaction): void => {
    this.emitRemoteDeltaInserts('html', event, tr);
  };

  private handleCssObserve = (event: Y.YTextEvent, tr: Y.Transaction): void => {
    this.emitRemoteDeltaInserts('css', event, tr);
  };

  private handleJsObserve = (event: Y.YTextEvent, tr: Y.Transaction): void => {
    this.emitRemoteDeltaInserts('js', event, tr);
  };

  public setCanEdit(nextCanEdit: boolean): void {
    this.canEdit = nextCanEdit;
  }

  /**
   * Cập nhật thông tin bầu chọn trưởng nhóm nén snapshot và số lượng người sửa đang trực tuyến.
   */
  public setCompactionElectionState(state: { isLeader: boolean; activeEditorCount: number }): void {
    this.isCompactionLeader = state.isLeader;
    this.activeEditorSessionCount = Math.max(1, state.activeEditorCount);

    if (
      this.isCompactionLeader &&
      this.canEdit &&
      this.knownServerUpdateIds.size >= STAGE1_SYNC_TIMINGS.COMPACTION_UPDATE_THRESHOLD
    ) {
      this.scheduleIdleCompaction();
    } else if (!this.isCompactionLeader && this.idleCompactionTimer) {
      clearTimeout(this.idleCompactionTimer);
      this.idleCompactionTimer = null;
    }
  }

  /**
   * Đệm các gói cập nhật từ xa trong lúc người dùng đang gõ bộ gõ IME (Telex/VNI)
   * để không làm gián đoạn tổ hợp dấu tiếng Việt, sau đó áp dụng ngay khi kết thúc tổ hợp.
   */
  public setLocalComposing(composing: boolean): void {
    if (this.isDestroyed) return;
    this.isLocalComposing = composing;
    if (composing) {
      if (!this.imeFlushSafetyTimer) {
        this.imeFlushSafetyTimer = setTimeout(() => {
          this.imeFlushSafetyTimer = null;
          this.isLocalComposing = false;
          this.scheduleRemoteFrameApply();
        }, STAGE1_SYNC_TIMINGS.IME_BUFFER_MAX_MS);
      }
    } else {
      if (this.imeFlushSafetyTimer) {
        clearTimeout(this.imeFlushSafetyTimer);
        this.imeFlushSafetyTimer = null;
      }
      this.scheduleRemoteFrameApply();
    }
  }

  /**
   * Gom các gói cập nhật từ xa vào hàng đợi và áp dụng tất cả trong đúng 1 Yjs transaction
   * mỗi khung hình animation (requestAnimationFrame).
   */
  private enqueueRemoteBytes(bytesList: Uint8Array[]): void {
    if (this.isDestroyed || bytesList.length === 0) return;
    this.pendingRemoteQueue.push(...bytesList);
    this.lastActivityAt = Date.now();
    this.resetIdleCompactionTimerIfPending();
    if (this.isLocalComposing) return;
    this.scheduleRemoteFrameApply();
  }

  private scheduleRemoteFrameApply(): void {
    if (this.isDestroyed || this.pendingRemoteQueue.length === 0 || this.isLocalComposing) return;
    if (this.remoteApplyRafId !== null || this.remoteApplyTimeoutId !== null) return;

    const flush = () => {
      this.remoteApplyRafId = null;
      this.remoteApplyTimeoutId = null;
      this.flushRemoteQueue();
    };

    if (typeof requestAnimationFrame === 'function') {
      this.remoteApplyRafId = requestAnimationFrame(flush);
    } else {
      this.remoteApplyTimeoutId = setTimeout(flush, 16);
    }
  }

  private flushRemoteQueue(): void {
    if (this.isDestroyed || this.pendingRemoteQueue.length === 0 || this.isLocalComposing) return;
    const queued = this.pendingRemoteQueue.splice(0, this.pendingRemoteQueue.length);

    this.ydoc.transact(() => {
      for (const bytes of queued) {
        try {
          Y.applyUpdate(this.ydoc, bytes, COLLAB_REMOTE_ORIGIN);
        } catch (err) {
          console.warn('[CollabProvider:applyRemote] Bỏ qua gói cập nhật lỗi:', err);
        }
      }
    }, COLLAB_REMOTE_ORIGIN);

    this.metrics.remoteFramesApplied += 1;
    activeSessionMetrics = this.metrics;
  }

  public getYText(tab: EditorTab): Y.Text {
    if (tab === 'css') return this.yCss;
    if (tab === 'js') return this.yJs;
    return this.yHtml;
  }

  public getCodeSnapshot(): { htmlCode: string; cssCode: string; jsCode: string } {
    return {
      htmlCode: this.yHtml.toString(),
      cssCode: this.yCss.toString(),
      jsCode: this.yJs.toString(),
    };
  }

  /**
   * Cập nhật nội dung một tab (dùng cho Định dạng, Xóa trắng tab) qua transaction cục bộ
   */
  public setTabCode(tab: EditorTab, nextText: string): void {
    if (!this.canEdit || this.isDestroyed) return;
    applyStringDiffToYText(this.getYText(tab), nextText, COLLAB_LOCAL_BULK_ORIGIN);
  }

  /**
   * Cập nhật cả 3 tab (dùng cho Áp dụng mẫu, Khôi phục mã) trong 1 transaction duy nhất
   */
  public setAllCode(code: { htmlCode: string; cssCode: string; jsCode: string }): void {
    if (!this.canEdit || this.isDestroyed) return;
    this.ydoc.transact(() => {
      applyStringDiffToYText(this.yHtml, code.htmlCode, COLLAB_LOCAL_BULK_ORIGIN);
      applyStringDiffToYText(this.yCss, code.cssCode, COLLAB_LOCAL_BULK_ORIGIN);
      applyStringDiffToYText(this.yJs, code.jsCode, COLLAB_LOCAL_BULK_ORIGIN);
    }, COLLAB_LOCAL_BULK_ORIGIN);
  }

  /**
   * Áp dụng các patch tối thiểu theo từng tab trong đúng 1 Yjs transaction
   */
  public applyPatches(
    patchesByTab: Partial<Record<EditorTab, Array<{ from: number; to: number; insert: string }>>>
  ): void {
    if (!this.canEdit || this.isDestroyed) return;
    this.ydoc.transact(() => {
      (['html', 'css', 'js'] as EditorTab[]).forEach((tab) => {
        const patches = patchesByTab[tab];
        if (!patches || patches.length === 0) return;
        const yText = this.getYText(tab);
        const sortedDesc = [...patches].sort((a, b) => b.from - a.from);
        for (const patch of sortedDesc) {
          const len = yText.length;
          const safeFrom = Math.max(0, Math.min(patch.from, len));
          const safeTo = Math.max(safeFrom, Math.min(patch.to, len));
          const deleteLen = safeTo - safeFrom;
          if (deleteLen > 0) {
            yText.delete(safeFrom, deleteLen);
          }
          if (patch.insert.length > 0) {
            yText.insert(safeFrom, patch.insert);
          }
        }
      });
    }, COLLAB_LOCAL_BULK_ORIGIN);
  }

  public undoTabs(tabs: EditorTab[]): boolean {
    if (!this.canEdit || this.isDestroyed) return false;
    let undone = false;
    for (const tab of tabs) {
      const manager = this.undoManagers[tab];
      if (manager && manager.canUndo()) {
        manager.undo();
        undone = true;
      }
    }
    return undone;
  }

  private setSyncState(next: CollabSyncState): void {
    if (this.syncState === next) return;
    this.syncState = next;
    this.onSyncStateChange?.(next);
  }

  private emitCode(): void {
    if (this.isDestroyed) return;
    this.onCodeChange?.(this.getCodeSnapshot());
  }

  private saveOfflineQueueSync(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      if (this.pendingUpdates.length === 0) {
        localStorage.removeItem(this.offlineQueueStorageKey);
        return;
      }
      const merged =
        this.pendingUpdates.length === 1
          ? this.pendingUpdates[0]
          : Y.mergeUpdates(this.pendingUpdates);
      const b64 = uint8ToBase64(merged);
      if (b64.length <= MAX_SNAPSHOT_BASE64_LENGTH) {
        localStorage.setItem(this.offlineQueueStorageKey, b64);
      }
    } catch {
      // Bỏ qua nếu trình duyệt chặn hoặc hết quota localStorage
    }
  }

  private scheduleOfflineBackup(): void {
    if (this.isDestroyed) return;
    if (this.offlineBackupTimer) return;
    this.offlineBackupTimer = setTimeout(() => {
      this.offlineBackupTimer = null;
      if (!this.isDestroyed) {
        this.saveOfflineQueueSync();
      }
    }, 250);
  }

  private restoreOfflineQueue(): boolean {
    if (typeof localStorage === 'undefined' || !this.canEdit) return false;
    try {
      const b64 = localStorage.getItem(this.offlineQueueStorageKey);
      if (!b64) return false;
      const bytes = base64ToUint8Array(b64);
      Y.applyUpdate(this.ydoc, bytes, COLLAB_OFFLINE_RESTORE_ORIGIN);
      this.pendingUpdates.push(bytes);
      this.metrics.pendingLocalUpdates = this.pendingUpdates.length;
      return true;
    } catch {
      return false;
    }
  }

  private updateCursorTracking(docId: string, createdAt: unknown): void {
    this.knownServerUpdateIds.add(docId);
    if (typeof createdAt === 'string' && createdAt.length > 0) {
      this.knownUpdateCreatedAt.set(docId, createdAt);
      if (!this.lastUpdateCursor || createdAt > this.lastUpdateCursor) {
        this.lastUpdateCursor = createdAt;
      }
    }
  }

  private buildUpdatesQuery(cursor: string | null) {
    if (!db) return null;
    const colRef = collection(db, 'collabProjects', this.projectId, 'updates');
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'asc')];
    if (cursor) {
      constraints.push(startAfter(cursor));
    }
    return query(colRef, ...constraints);
  }

  private attachUpdatesListener(cursor: string | null): void {
    if (!db || this.isDestroyed) return;
    this.unsubUpdates?.();
    this.unsubUpdates = null;
    this.updatesListenerErrored = false;

    const updatesQuery = this.buildUpdatesQuery(cursor);
    if (!updatesQuery) return;

    this.unsubUpdates = onSnapshot(
      updatesQuery,
      (querySnap) => {
        if (this.isDestroyed) return;

        const incomingBytes: Uint8Array[] = [];
        let docReadBytes = 0;
        let changedCount = 0;

        querySnap.docChanges().forEach((change) => {
          const docId = change.doc.id;
          if (change.type === 'removed') {
            this.knownServerUpdateIds.delete(docId);
            this.knownUpdateCreatedAt.delete(docId);
            return;
          }
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            const createdAt = data?.createdAt;

            if (!change.doc.metadata.hasPendingWrites) {
              this.updateCursorTracking(docId, createdAt);
            }

            if (
              shouldSkipUpdateChunk({
                docId,
                hasPendingWrites: change.doc.metadata.hasPendingWrites,
                chunkClientId: data?.clientId,
                localClientId: this.localClientId,
                seenDocIds: this.seenUpdateDocIds,
              })
            ) {
              this.seenUpdateDocIds.add(docId);
              return;
            }

            this.seenUpdateDocIds.add(docId);
            const b64 = data?.updateBase64;
            if (typeof b64 === 'string' && b64.length > 0) {
              changedCount += 1;
              docReadBytes += b64.length;
              try {
                incomingBytes.push(base64ToUint8Array(b64));
              } catch (decodeErr) {
                console.warn('[CollabProvider:decode] Gói cập nhật không hợp lệ:', docId, decodeErr);
              }
            }
          }
        });

        if (changedCount > 0) {
          this.recordRead(changedCount, docReadBytes);
        }

        if (incomingBytes.length > 0) {
          this.enqueueRemoteBytes(incomingBytes);
        }

        if (!this.isSynced) {
          this.isSynced = true;
          if (this.pendingUpdates.length === 0) {
            this.setSyncState(
              typeof navigator !== 'undefined' && navigator.onLine === false
                ? 'offline'
                : 'synced'
            );
          }
        }

        if (
          this.isCompactionLeader &&
          this.canEdit &&
          this.knownServerUpdateIds.size >= STAGE1_SYNC_TIMINGS.COMPACTION_UPDATE_THRESHOLD
        ) {
          this.scheduleIdleCompaction();
        }
      },
      (error: any) => {
        if (this.isDestroyed) return;
        this.updatesListenerErrored = true;
        console.error('[CollabProvider:updates] Lỗi đồng bộ cập nhật:', error);
        if (error?.code === 'permission-denied') {
          this.setSyncState('error');
          this.onError?.('Bạn không còn quyền đọc hoặc đồng bộ dự án nhóm này.');
        } else {
          this.setSyncState('offline');
        }
      }
    );
  }

  public async start(): Promise<void> {
    if (!db || this.isDestroyed) {
      this.setSyncState('error');
      this.onError?.('Cơ sở dữ liệu Firestore chưa sẵn sàng');
      return;
    }

    this.setSyncState('connecting');

    try {
      // 1. Đọc bản chụp mới nhất (snapshots/latest) TRƯỚC TIÊN (từ mạng hoặc bộ nhớ đệm cục bộ)
      const snapRef = doc(db, 'collabProjects', this.projectId, 'snapshots', 'latest');
      let snapDoc = null;
      try {
        snapDoc = await getDoc(snapRef);
        this.recordRead(1, snapDoc.exists() ? String(snapDoc.data()?.stateBase64 || '').length : 0);
      } catch (snapReadErr: any) {
        // Nếu ngoại tuyến và chưa có cache Firestore, tiếp tục với hàng đợi cục bộ nếu có
        console.warn('[CollabProvider:snapshot-init] Không thể đọc snapshot từ mạng/cache:', snapReadErr);
      }
      if (this.isDestroyed) return;

      if (snapDoc && snapDoc.exists()) {
        const data = snapDoc.data();
        const stateBase64 = data?.stateBase64;
        if (typeof stateBase64 === 'string' && stateBase64.length > 0) {
          this.lastAppliedSnapshotStamp =
            typeof data.updatedAt === 'string' ? data.updatedAt : null;
          this.snapshotCursor = getSnapshotCursor(data);
          this.lastUpdateCursor = this.snapshotCursor;
          Y.applyUpdate(this.ydoc, base64ToUint8Array(stateBase64), COLLAB_REMOTE_ORIGIN);
        }
      }

      // Khôi phục thay đổi ngoại tuyến còn chờ (nếu có) trước khi mở trình soạn thảo
      const restoredOffline = this.restoreOfflineQueue();

      // Hiển thị trình soạn thảo NGAY LẬP TỨC từ snapshot mà không chờ tải toàn bộ lịch sử update
      this.hasAppliedInitialSnapshot = true;
      this.emitCode();
      this.onSnapshotReady?.();

      if (restoredOffline && this.canEdit) {
        this.setSyncState(
          typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'syncing'
        );
      }

      // 2. Lắng nghe bản chụp mới nhất để đồng bộ nếu có trưởng nhóm nén snapshot mới
      this.unsubSnapshot = onSnapshot(
        snapRef,
        (docSnap) => {
          if (this.isDestroyed || !docSnap.exists()) return;
          if (docSnap.metadata.hasPendingWrites) return;
          const data = docSnap.data();
          if (typeof data?.clientId === 'number' && data.clientId === this.localClientId) return;

          const stateBase64 = data?.stateBase64;
          const stamp = typeof data?.updatedAt === 'string' ? data.updatedAt : null;
          if (
            typeof stateBase64 === 'string' &&
            stateBase64.length > 0 &&
            stamp !== this.lastAppliedSnapshotStamp
          ) {
            this.lastAppliedSnapshotStamp = stamp;
            const nextCursor = getSnapshotCursor(data);
            if (nextCursor && (!this.snapshotCursor || nextCursor > this.snapshotCursor)) {
              this.snapshotCursor = nextCursor;
            }
            this.recordRead(1, stateBase64.length);
            this.enqueueRemoteBytes([base64ToUint8Array(stateBase64)]);
          }
        },
        (error) => {
          console.warn('[CollabProvider:snapshot] Lỗi lắng nghe snapshot:', error);
        }
      );

      // 3. Chỉ truy vấn & đăng ký các gói cập nhật MỚI HƠN bản chụp (cursor startAfter)
      this.attachUpdatesListener(this.lastUpdateCursor || this.snapshotCursor);

      if (restoredOffline && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
        void this.flushPendingUpdates();
      }
    } catch (error: any) {
      if (this.isDestroyed) return;
      console.error('[CollabProvider:start] Lỗi khởi tạo đồng bộ:', error);
      this.setSyncState('error');
      this.onError?.('Không thể kết nối đồng bộ mã nguồn dự án nhóm.');
    }
  }

  private handleAfterTransaction = (tr: Y.Transaction): void => {
    if (this.isDestroyed) return;
    const changed = tr.changedParentTypes as unknown as Map<unknown, unknown>;
    if (changed.has(this.yHtml) || changed.has(this.yCss) || changed.has(this.yJs)) {
      this.emitCode();
    }
  };

  /**
   * Gửi đầu đợt gần như tức thì (16ms, không chờ mạng trong luồng gõ), sau đó gộp các thay đổi
   * liên tiếp trong ~75ms bằng Y.mergeUpdates để giảm mạnh số lượt ghi Firestore.
   */
  private handleYDocUpdate = (update: Uint8Array, origin: unknown): void => {
    if (
      this.isDestroyed ||
      origin === COLLAB_REMOTE_ORIGIN ||
      origin === COLLAB_OFFLINE_RESTORE_ORIGIN ||
      !this.canEdit
    ) {
      return;
    }

    this.lastActivityAt = Date.now();
    this.resetIdleCompactionTimerIfPending();

    this.pendingUpdates.push(update);
    this.metrics.pendingLocalUpdates = this.pendingUpdates.length;
    this.scheduleOfflineBackup();

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.setSyncState('offline');
      return;
    }

    this.setSyncState('syncing');
    this.scheduleBatchFlush();
  };

  private scheduleBatchFlush(): void {
    if (this.isDestroyed || this.pendingUpdates.length === 0) return;

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const now = Date.now();
    const isLeadingEligible =
      !this.isFlushing &&
      !this.maxWaitTimer &&
      now - this.lastFlushDispatchedAt >= STAGE1_SYNC_TIMINGS.LEADING_COOLDOWN_MS;

    const delay = isLeadingEligible
      ? STAGE1_SYNC_TIMINGS.LEADING_FLUSH_DELAY_MS
      : STAGE1_SYNC_TIMINGS.TRAILING_BATCH_MS;

    this.flushTimer = setTimeout(() => {
      this.clearFlushTimers();
      void this.flushPendingUpdates();
    }, delay);

    if (!this.maxWaitTimer) {
      this.maxWaitTimer = setTimeout(() => {
        this.clearFlushTimers();
        void this.flushPendingUpdates();
      }, STAGE1_SYNC_TIMINGS.MAX_BATCH_WAIT_MS);
    }
  }

  private clearFlushTimers(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.maxWaitTimer) {
      clearTimeout(this.maxWaitTimer);
      this.maxWaitTimer = null;
    }
  }

  private resetIdleCompactionTimerIfPending(): void {
    if (this.idleCompactionTimer) {
      clearTimeout(this.idleCompactionTimer);
      this.idleCompactionTimer = null;
      if (
        this.isCompactionLeader &&
        this.canEdit &&
        this.knownServerUpdateIds.size >= STAGE1_SYNC_TIMINGS.COMPACTION_UPDATE_THRESHOLD
      ) {
        this.scheduleIdleCompaction();
      }
    }
  }

  private scheduleIdleCompaction(): void {
    if (this.isDestroyed || !this.canEdit || !this.isCompactionLeader || this.isCompacting) {
      return;
    }

    // Nếu số gói tăng quá lớn khi dán liên tục, nén bảo vệ mà không đợi thêm
    if (this.knownServerUpdateIds.size >= STAGE1_SYNC_TIMINGS.COMPACTION_FORCE_THRESHOLD) {
      if (this.idleCompactionTimer) {
        clearTimeout(this.idleCompactionTimer);
        this.idleCompactionTimer = null;
      }
      void this.compactUpdates();
      return;
    }

    if (this.idleCompactionTimer) return;
    this.idleCompactionTimer = setTimeout(() => {
      this.idleCompactionTimer = null;
      if (this.isDestroyed || !this.canEdit || !this.isCompactionLeader) return;
      if (this.pendingUpdates.length > 0 || this.isFlushing) {
        this.scheduleIdleCompaction();
        return;
      }
      const idleFor = Date.now() - this.lastActivityAt;
      if (idleFor < STAGE1_SYNC_TIMINGS.COMPACTION_IDLE_DELAY_MS) {
        this.scheduleIdleCompaction();
        return;
      }
      if (this.knownServerUpdateIds.size >= STAGE1_SYNC_TIMINGS.COMPACTION_UPDATE_THRESHOLD) {
        void this.compactUpdates();
      }
    }, STAGE1_SYNC_TIMINGS.COMPACTION_IDLE_DELAY_MS);
  }

  private handlePageUnload = (): void => {
    this.saveOfflineQueueSync();
    if (
      !this.isDestroyed &&
      this.canEdit &&
      this.activeEditorSessionCount <= 1 &&
      this.isCompactionLeader &&
      this.knownServerUpdateIds.size > 0 &&
      (typeof navigator === 'undefined' || navigator.onLine !== false)
    ) {
      // Best-effort compaction nếu là người sửa cuối rời tab
      void this.compactUpdates();
    }
  };

  private handleNetworkOnline = (): void => {
    if (this.isDestroyed) return;
    void this.handleReconnect();
  };

  private handleNetworkOffline = (): void => {
    if (this.isDestroyed) return;
    this.saveOfflineQueueSync();
    this.setSyncState('offline');
  };

  /**
   * Khi kết nối lại: gộp mọi thay đổi chờ thành 1 gói duy nhất, rồi đồng bộ bù theo State Vector.
   */
  public async handleReconnect(): Promise<void> {
    if (this.isDestroyed) return;
    if (this.pendingUpdates.length > 0 && this.canEdit) {
      this.setSyncState('syncing');
      await this.flushPendingUpdates();
    }
    await this.runReconnectCatchUp();
    if (!this.isDestroyed && this.pendingUpdates.length === 0 && this.syncState !== 'error') {
      this.setSyncState('synced');
    }
  }

  /**
   * Đồng bộ bù dựa trên Yjs State Vector sau khi mất mạng/gián đoạn.
   */
  public async runReconnectCatchUp(): Promise<void> {
    if (!db || this.isDestroyed || this.isCatchingUp) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    this.isCatchingUp = true;
    this.metrics.reconnectCatchUpsCount += 1;
    activeSessionMetrics = this.metrics;

    try {
      const localStateVector = Y.encodeStateVector(this.ydoc);
      const snapRef = doc(db, 'collabProjects', this.projectId, 'snapshots', 'latest');
      let snapDoc = null;
      try {
        snapDoc = await getDocFromServer(snapRef);
      } catch {
        snapDoc = await getDoc(snapRef).catch(() => null);
      }
      if (this.isDestroyed) return;

      const bytesToApply: Uint8Array[] = [];

      if (snapDoc && snapDoc.exists()) {
        const data = snapDoc.data();
        const stateBase64 = data?.stateBase64;
        const stamp = typeof data?.updatedAt === 'string' ? data.updatedAt : null;
        this.recordRead(1, typeof stateBase64 === 'string' ? stateBase64.length : 0);

        if (
          typeof stateBase64 === 'string' &&
          stateBase64.length > 0 &&
          stamp !== this.lastAppliedSnapshotStamp
        ) {
          this.lastAppliedSnapshotStamp = stamp;
          const nextCursor = getSnapshotCursor(data);
          if (nextCursor && (!this.snapshotCursor || nextCursor > this.snapshotCursor)) {
            this.snapshotCursor = nextCursor;
          }
          // Chỉ lấy phần chênh lệch mà máy cục bộ chưa có dựa vào state vector
          const diff = Y.diffUpdate(base64ToUint8Array(stateBase64), localStateVector);
          if (diff.byteLength > 2) {
            bytesToApply.push(diff);
          }
        }
      }

      const catchUpCursor = this.lastUpdateCursor || this.snapshotCursor;
      const catchUpQuery = this.buildUpdatesQuery(catchUpCursor);
      if (catchUpQuery) {
        const missedSnap = await getDocs(catchUpQuery);
        if (this.isDestroyed) return;

        let readBytes = 0;
        let readDocs = 0;
        missedSnap.forEach((d) => {
          const docId = d.id;
          const data = d.data();
          this.updateCursorTracking(docId, data?.createdAt);

          if (
            shouldSkipUpdateChunk({
              docId,
              hasPendingWrites: d.metadata.hasPendingWrites,
              chunkClientId: data?.clientId,
              localClientId: this.localClientId,
              seenDocIds: this.seenUpdateDocIds,
            })
          ) {
            this.seenUpdateDocIds.add(docId);
            return;
          }

          this.seenUpdateDocIds.add(docId);
          const b64 = data?.updateBase64;
          if (typeof b64 === 'string' && b64.length > 0) {
            readDocs += 1;
            readBytes += b64.length;
            try {
              bytesToApply.push(base64ToUint8Array(b64));
            } catch {
              // Bỏ qua chunk lỗi
            }
          }
        });
        if (readDocs > 0) {
          this.recordRead(readDocs, readBytes);
        }
      }

      if (bytesToApply.length > 0) {
        this.enqueueRemoteBytes(bytesToApply);
      }

      if (this.updatesListenerErrored || !this.unsubUpdates) {
        this.attachUpdatesListener(this.lastUpdateCursor || this.snapshotCursor);
      }
    } catch (err) {
      console.warn('[CollabProvider:catchUp] Không thể chạy đồng bộ bù sau kết nối lại:', err);
    } finally {
      this.isCatchingUp = false;
    }
  }

  private scheduleRetry(): void {
    if (this.isDestroyed || this.retryTimer) return;
    const delay = Math.min(15_000, 2000 * Math.pow(2, this.retryAttempt));
    this.retryAttempt = Math.min(this.retryAttempt + 1, 4);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (!this.isDestroyed && this.pendingUpdates.length > 0 && this.canEdit) {
        void this.handleReconnect();
      }
    }, delay);
  }

  public async flushPendingUpdates(): Promise<void> {
    if (
      !db ||
      this.isDestroyed ||
      !this.canEdit ||
      this.isFlushing ||
      this.pendingUpdates.length === 0
    ) {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.saveOfflineQueueSync();
      this.setSyncState('offline');
      return;
    }

    this.isFlushing = true;
    this.lastFlushDispatchedAt = Date.now();
    const batch = this.pendingUpdates.splice(0, this.pendingUpdates.length);
    const merged = batch.length === 1 ? batch[0] : Y.mergeUpdates(batch);
    const updateBase64 = uint8ToBase64(merged);

    if (updateBase64.length > MAX_CHUNK_BASE64_LENGTH) {
      const fullCheckBase64 = uint8ToBase64(Y.encodeStateAsUpdate(this.ydoc));
      if (fullCheckBase64.length > MAX_SNAPSHOT_BASE64_LENGTH) {
        this.isFlushing = false;
        this.setSyncState('error');
        if (!this.hasEmittedSizeExceeded) {
          this.hasEmittedSizeExceeded = true;
          this.onError?.(
            'Dự án nhóm đã vượt giới hạn dung lượng đồng bộ (~920 KB). Vui lòng rút gọn bớt mã nguồn để tiếp tục lưu lên đám mây.'
          );
        }
        return;
      }
      this.isFlushing = false;
      this.saveOfflineQueueSync();
      await this.compactUpdates();
      return;
    }

    const nextSeq = ++this.seq;
    const chunkId = `u_${Date.now().toString(36)}_${nextSeq}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    this.seenUpdateDocIds.add(chunkId);

    try {
      const now = new Date().toISOString();
      await setDoc(doc(db, 'collabProjects', this.projectId, 'updates', chunkId), {
        updateBase64,
        authorId: this.userId,
        createdAt: now,
        clientId: this.localClientId,
        seq: nextSeq,
      });

      this.recordWrite('chunk', 1, updateBase64.length);
      this.updateCursorTracking(chunkId, now);
      this.retryAttempt = 0;

      // Chỉ cập nhật updatedAt dự án tối đa 1 lần / phút khi có chỉnh sửa (không có nhịp tim nhàn rỗi)
      const nowMs = Date.now();
      if (nowMs - this.lastMetaTouchAt > STAGE1_SYNC_TIMINGS.META_TOUCH_THROTTLE_MS) {
        this.lastMetaTouchAt = nowMs;
        updateDoc(doc(db, 'collabProjects', this.projectId), { updatedAt: now })
          .then(() => {
            this.recordWrite('meta', 1, now.length);
          })
          .catch(() => {});
      }

      if (this.pendingUpdates.length > 0) {
        this.saveOfflineQueueSync();
        this.isFlushing = false;
        this.scheduleBatchFlush();
        return;
      }

      this.metrics.pendingLocalUpdates = 0;
      this.saveOfflineQueueSync();
      this.setSyncState('synced');

      if (
        this.isCompactionLeader &&
        this.knownServerUpdateIds.size >= STAGE1_SYNC_TIMINGS.COMPACTION_UPDATE_THRESHOLD
      ) {
        this.scheduleIdleCompaction();
      }
    } catch (error: any) {
      this.seenUpdateDocIds.delete(chunkId);
      this.pendingUpdates.unshift(merged);
      this.metrics.pendingLocalUpdates = this.pendingUpdates.length;
      this.saveOfflineQueueSync();

      if (error?.code === 'permission-denied') {
        console.error('[CollabProvider:flush] Bị từ chối quyền ghi cập nhật:', error);
        this.setSyncState('error');
        this.onError?.('Bạn không còn quyền chỉnh sửa dự án nhóm này.');
      } else {
        console.warn('[CollabProvider:flush] Tạm gián đoạn kết nối, sẽ tự đồng bộ lại:', error);
        this.setSyncState('offline');
        this.scheduleRetry();
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Nén toàn bộ trạng thái Yjs vào snapshots/latest và dọn các gói update cũ đã bao gồm.
   * Thiết kế bất biến (idempotent): nếu hai client vô tình chạy sát nhau, ghi snapshot & xóa batch đều an toàn.
   */
  public async compactUpdates(): Promise<void> {
    if (!db || !this.canEdit || this.isCompacting || this.isDestroyed) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    this.isCompacting = true;

    const idsToDelete = Array.from(this.knownServerUpdateIds);
    let maxIncludedCreatedAt = '';
    for (const id of idsToDelete) {
      const ts = this.knownUpdateCreatedAt.get(id);
      if (ts && ts > maxIncludedCreatedAt) {
        maxIncludedCreatedAt = ts;
      }
    }

    try {
      const fullState = Y.encodeStateAsUpdate(this.ydoc);
      const stateBase64 = uint8ToBase64(fullState);

      if (stateBase64.length > MAX_SNAPSHOT_BASE64_LENGTH) {
        this.setSyncState('error');
        if (!this.hasEmittedSizeExceeded) {
          this.hasEmittedSizeExceeded = true;
          this.onError?.(
            'Dự án nhóm đã vượt giới hạn dung lượng (~920 KB). Hãy xóa bớt mã dư thừa hoặc chia nhỏ dự án để tiếp tục đồng bộ.'
          );
        }
        return;
      }

      this.hasEmittedSizeExceeded = false;
      if (stateBase64.length >= WARN_SNAPSHOT_BASE64_LENGTH && !this.hasEmittedSizeWarning) {
        this.hasEmittedSizeWarning = true;
        this.onSizeWarning?.(
          'Dự án nhóm sắp đạt giới hạn dung lượng lưu trữ (~80%). Bạn nên giữ mã nguồn gọn gàng.'
        );
      } else if (stateBase64.length < WARN_SNAPSHOT_BASE64_LENGTH * 0.85) {
        this.hasEmittedSizeWarning = false;
      }

      const now = new Date().toISOString();
      const watermarkAt =
        maxIncludedCreatedAt && maxIncludedCreatedAt > now ? maxIncludedCreatedAt : now;

      this.lastAppliedSnapshotStamp = now;
      this.snapshotCursor = watermarkAt;

      await setDoc(doc(db, 'collabProjects', this.projectId, 'snapshots', 'latest'), {
        stateBase64,
        updatedBy: this.userId,
        updatedAt: now,
        clientId: this.localClientId,
        watermarkAt,
      });
      this.recordWrite('snapshot', 1, stateBase64.length);
      this.metrics.compactionsCount += 1;

      await updateDoc(doc(db, 'collabProjects', this.projectId), {
        updatedAt: now,
      })
        .then(() => {
          this.recordWrite('meta', 1, now.length);
        })
        .catch(() => {});

      // Xóa theo lô tối đa 400 tài liệu để an toàn với giới hạn Firestore batch (500)
      for (let i = 0; i < idsToDelete.length; i += 400) {
        const chunkIds = idsToDelete.slice(i, i + 400);
        const batch = writeBatch(db);
        for (const id of chunkIds) {
          batch.delete(doc(db, 'collabProjects', this.projectId, 'updates', id));
        }
        await batch.commit();
        this.recordWrite('delete', chunkIds.length, 0);
        for (const id of chunkIds) {
          this.knownServerUpdateIds.delete(id);
          this.knownUpdateCreatedAt.delete(id);
        }
      }
    } catch (error) {
      console.warn('[CollabProvider:compact] Không thể nén snapshot lúc này:', error);
    } finally {
      this.isCompacting = false;
    }
  }

  /**
   * Đẩy toàn bộ thay đổi còn chờ và nén snapshot ngay (dùng khi bấm Lưu / Ctrl+S)
   */
  public async flushAndCompact(): Promise<void> {
    if (!this.canEdit || this.isDestroyed) return;
    this.clearFlushTimers();
    this.setSyncState('syncing');
    await this.flushPendingUpdates();
    await this.compactUpdates();
    if (!this.isDestroyed && this.pendingUpdates.length === 0) {
      this.setSyncState('synced');
    }
  }

  public async destroy(): Promise<void> {
    if (this.isDestroyed) return;
    this.clearFlushTimers();
    if (this.idleCompactionTimer) {
      clearTimeout(this.idleCompactionTimer);
      this.idleCompactionTimer = null;
    }
    if (this.offlineBackupTimer) {
      clearTimeout(this.offlineBackupTimer);
      this.offlineBackupTimer = null;
    }
    if (this.imeFlushSafetyTimer) {
      clearTimeout(this.imeFlushSafetyTimer);
      this.imeFlushSafetyTimer = null;
    }
    if (this.remoteApplyRafId !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.remoteApplyRafId);
      this.remoteApplyRafId = null;
    }
    if (this.remoteApplyTimeoutId !== null) {
      clearTimeout(this.remoteApplyTimeoutId);
      this.remoteApplyTimeoutId = null;
    }
    this.pendingRemoteQueue = [];
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    // Gửi nốt các thay đổi chưa kịp đẩy trước khi hủy tài liệu Y.Doc
    if (this.pendingUpdates.length > 0 && this.canEdit && db) {
      this.saveOfflineQueueSync();
      try {
        if (this.isFlushing) {
          const remaining = this.pendingUpdates.splice(0, this.pendingUpdates.length);
          const merged = remaining.length === 1 ? remaining[0] : Y.mergeUpdates(remaining);
          const updateBase64 = uint8ToBase64(merged);
          if (updateBase64.length <= MAX_CHUNK_BASE64_LENGTH) {
            const nextSeq = ++this.seq;
            const chunkId = `u_${Date.now().toString(36)}_${nextSeq}_${Math.random()
              .toString(36)
              .slice(2, 7)}`;
            await setDoc(doc(db, 'collabProjects', this.projectId, 'updates', chunkId), {
              updateBase64,
              authorId: this.userId,
              createdAt: new Date().toISOString(),
              clientId: this.localClientId,
              seq: nextSeq,
            });
            this.knownServerUpdateIds.add(chunkId);
            this.saveOfflineQueueSync();
          }
        } else {
          await this.flushPendingUpdates();
        }
      } catch {
        // Giữ nguyên trong hàng đợi localStorage nếu mất mạng lúc đóng
      }
    }

    // Nén gọn lần cuối nếu đây là phiên chỉnh sửa cuối cùng rời dự án
    if (
      this.canEdit &&
      db &&
      this.activeEditorSessionCount <= 1 &&
      this.isCompactionLeader &&
      this.knownServerUpdateIds.size > 0 &&
      (typeof navigator === 'undefined' || navigator.onLine !== false)
    ) {
      try {
        await this.compactUpdates();
      } catch {
        // Bỏ qua lỗi khi đang đóng phiên
      }
    }

    this.isDestroyed = true;

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleNetworkOnline);
      window.removeEventListener('offline', this.handleNetworkOffline);
      window.removeEventListener('pagehide', this.handlePageUnload);
      window.removeEventListener('beforeunload', this.handlePageUnload);
    }

    this.unsubUpdates?.();
    this.unsubSnapshot?.();
    this.unsubUpdates = null;
    this.unsubSnapshot = null;

    this.yHtml.unobserve(this.handleHtmlObserve);
    this.yCss.unobserve(this.handleCssObserve);
    this.yJs.unobserve(this.handleJsObserve);
    this.ydoc.off('update', this.handleYDocUpdate);
    this.ydoc.off('afterTransaction', this.handleAfterTransaction);

    this.undoManagers.html.destroy();
    this.undoManagers.css.destroy();
    this.undoManagers.js.destroy();
    this.ydoc.destroy();
  }
}
