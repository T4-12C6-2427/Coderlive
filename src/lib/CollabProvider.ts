import * as Y from 'yjs';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  applyStringDiffToYText,
  base64ToUint8Array,
  uint8ToBase64,
} from './collabYjsHelpers';
import { CollabSyncState, EditorTab } from '../types';

export const COLLAB_REMOTE_ORIGIN = Symbol('collab-firestore-remote');
export const COLLAB_LOCAL_BULK_ORIGIN = Symbol('collab-local-bulk');

const FLUSH_DEBOUNCE_MS = 300;
const FLUSH_MAX_WAIT_MS = 900;
const COMPACTION_UPDATE_THRESHOLD = 30;
export const MAX_CHUNK_BASE64_LENGTH = 850_000;
export const MAX_SNAPSHOT_BASE64_LENGTH = 920_000;
export const WARN_SNAPSHOT_BASE64_LENGTH = 720_000;
const META_TOUCH_THROTTLE_MS = 15_000;
const IME_BUFFER_MAX_MS = 2500;

export interface RemoteTextInsert {
  tab: EditorTab;
  from: number;
  to: number;
}

export interface CollabProviderOptions {
  projectId: string;
  userId: string;
  canEdit: boolean;
  onSyncStateChange?: (state: CollabSyncState) => void;
  onCodeChange?: (code: { htmlCode: string; cssCode: string; jsCode: string }) => void;
  onRemoteInsert?: (inserts: RemoteTextInsert[]) => void;
  onError?: (message: string) => void;
  onSizeWarning?: (message: string) => void;
}

/**
 * Custom Yjs CRDT Provider trên nền Cloud Firestore (không cần backend riêng).
 * - Văn bản dùng Y.Text("html"), Y.Text("css"), Y.Text("js").
 * - Đồng bộ gia tăng qua subcollection `updates`, tự động nén thành `snapshots/latest`.
 */
export class CollabProvider {
  public readonly projectId: string;
  public readonly userId: string;
  public readonly ydoc: Y.Doc;
  public readonly yHtml: Y.Text;
  public readonly yCss: Y.Text;
  public readonly yJs: Y.Text;
  public readonly undoManagers: Record<EditorTab, Y.UndoManager>;

  private canEdit: boolean;
  private onSyncStateChange?: (state: CollabSyncState) => void;
  private onCodeChange?: (code: { htmlCode: string; cssCode: string; jsCode: string }) => void;
  private onRemoteInsert?: (inserts: RemoteTextInsert[]) => void;
  private onError?: (message: string) => void;
  private onSizeWarning?: (message: string) => void;

  private isDestroyed = false;
  private isSynced = false;
  private syncState: CollabSyncState = 'connecting';

  private pendingUpdates: Uint8Array[] = [];
  private seenUpdateDocIds = new Set<string>();
  private knownServerUpdateIds = new Set<string>();
  private lastAppliedSnapshotStamp: string | null = null;

  private isLocalComposing = false;
  private bufferedRemoteBytes: Uint8Array[] = [];
  private imeFlushSafetyTimer: ReturnType<typeof setTimeout> | null = null;
  private hasEmittedSizeWarning = false;
  private hasEmittedSizeExceeded = false;

  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private maxWaitTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryAttempt = 0;
  private isFlushing = false;
  private isCompacting = false;
  private seq = 0;
  private lastMetaTouchAt = 0;

  private unsubUpdates: Unsubscribe | null = null;
  private unsubSnapshot: Unsubscribe | null = null;

  constructor(options: CollabProviderOptions) {
    this.projectId = options.projectId;
    this.userId = options.userId;
    this.canEdit = options.canEdit;
    this.onSyncStateChange = options.onSyncStateChange;
    this.onCodeChange = options.onCodeChange;
    this.onRemoteInsert = options.onRemoteInsert;
    this.onError = options.onError;
    this.onSizeWarning = options.onSizeWarning;

    this.ydoc = new Y.Doc();
    this.yHtml = this.ydoc.getText('html');
    this.yCss = this.ydoc.getText('css');
    this.yJs = this.ydoc.getText('js');

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
    }
  }

  private emitRemoteDeltaInserts(
    tab: EditorTab,
    event: Y.YTextEvent,
    tr: Y.Transaction
  ): void {
    if (this.isDestroyed || !this.isSynced || tr.origin !== COLLAB_REMOTE_ORIGIN) return;
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
          this.flushBufferedRemoteBytes();
        }, IME_BUFFER_MAX_MS);
      }
    } else {
      if (this.imeFlushSafetyTimer) {
        clearTimeout(this.imeFlushSafetyTimer);
        this.imeFlushSafetyTimer = null;
      }
      this.flushBufferedRemoteBytes();
    }
  }

  private applyOrBufferRemoteBytes(bytesList: Uint8Array[]): void {
    if (this.isDestroyed || bytesList.length === 0) return;
    if (this.isLocalComposing) {
      this.bufferedRemoteBytes.push(...bytesList);
      return;
    }
    this.ydoc.transact(() => {
      for (const bytes of bytesList) {
        Y.applyUpdate(this.ydoc, bytes, COLLAB_REMOTE_ORIGIN);
      }
    }, COLLAB_REMOTE_ORIGIN);
  }

  private flushBufferedRemoteBytes(): void {
    if (this.isDestroyed || this.bufferedRemoteBytes.length === 0) return;
    const queued = this.bufferedRemoteBytes.splice(0, this.bufferedRemoteBytes.length);
    this.ydoc.transact(() => {
      for (const bytes of queued) {
        Y.applyUpdate(this.ydoc, bytes, COLLAB_REMOTE_ORIGIN);
      }
    }, COLLAB_REMOTE_ORIGIN);
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
   * để UndoManager gộp thành 1 bước hoàn tác và không xáo trộn con trỏ cộng tác viên ở đoạn khác.
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

  /**
   * Hoàn tác bước chỉnh sửa gần nhất trên các tab đã thay đổi
   */
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

  public async start(): Promise<void> {
    if (!db || this.isDestroyed) {
      this.setSyncState('error');
      this.onError?.('Cơ sở dữ liệu Firestore chưa sẵn sàng');
      return;
    }

    this.setSyncState('connecting');

    try {
      // 1. Đọc bản chụp mới nhất (snapshots/latest) trước khi gắn listener updates
      const snapRef = doc(db, 'collabProjects', this.projectId, 'snapshots', 'latest');
      const snapDoc = await getDoc(snapRef);
      if (this.isDestroyed) return;

      if (snapDoc.exists()) {
        const data = snapDoc.data();
        const stateBase64 = data?.stateBase64;
        if (typeof stateBase64 === 'string' && stateBase64.length > 0) {
          this.lastAppliedSnapshotStamp =
            typeof data.updatedAt === 'string' ? data.updatedAt : null;
          Y.applyUpdate(this.ydoc, base64ToUint8Array(stateBase64), COLLAB_REMOTE_ORIGIN);
        }
      }

      // 2. Lắng nghe bản chụp mới nhất để đồng bộ nếu có thành viên khác nén snapshot khi ta đang gián đoạn
      this.unsubSnapshot = onSnapshot(
        snapRef,
        (docSnap) => {
          if (this.isDestroyed || !docSnap.exists()) return;
          const data = docSnap.data();
          const stateBase64 = data?.stateBase64;
          const stamp = typeof data?.updatedAt === 'string' ? data.updatedAt : null;
          if (
            typeof stateBase64 === 'string' &&
            stateBase64.length > 0 &&
            stamp !== this.lastAppliedSnapshotStamp
          ) {
            this.lastAppliedSnapshotStamp = stamp;
            this.applyOrBufferRemoteBytes([base64ToUint8Array(stateBase64)]);
          }
        },
        (error) => {
          console.warn('[CollabProvider:snapshot] Lỗi lắng nghe snapshot:', error);
        }
      );

      // 3. Lắng nghe các gói cập nhật Yjs gia tăng từ Firestore
      const updatesQuery = query(
        collection(db, 'collabProjects', this.projectId, 'updates'),
        orderBy('createdAt', 'asc')
      );

      this.unsubUpdates = onSnapshot(
        updatesQuery,
        (querySnap) => {
          if (this.isDestroyed) return;

          const pendingRemoteBytes: Uint8Array[] = [];
          querySnap.docChanges().forEach((change) => {
            const docId = change.doc.id;
            if (change.type === 'removed') {
              this.knownServerUpdateIds.delete(docId);
              return;
            }
            if (change.type === 'added' || change.type === 'modified') {
              this.knownServerUpdateIds.add(docId);
              if (!this.seenUpdateDocIds.has(docId)) {
                this.seenUpdateDocIds.add(docId);
                const b64 = change.doc.data()?.updateBase64;
                if (typeof b64 === 'string' && b64.length > 0) {
                  try {
                    pendingRemoteBytes.push(base64ToUint8Array(b64));
                  } catch (decodeErr) {
                    console.warn('[CollabProvider:decode] Gói cập nhật không hợp lệ:', docId, decodeErr);
                  }
                }
              }
            }
          });

          if (pendingRemoteBytes.length > 0) {
            this.applyOrBufferRemoteBytes(pendingRemoteBytes);
          }

          if (!this.isSynced) {
            this.isSynced = true;
            this.emitCode();
            if (this.pendingUpdates.length === 0) {
              this.setSyncState(
                typeof navigator !== 'undefined' && navigator.onLine === false
                  ? 'offline'
                  : 'synced'
              );
            }
          }
        },
        (error: any) => {
          if (this.isDestroyed) return;
          console.error('[CollabProvider:updates] Lỗi đồng bộ cập nhật:', error);
          if (error?.code === 'permission-denied') {
            this.setSyncState('error');
            this.onError?.('Bạn không còn quyền đọc hoặc đồng bộ dự án nhóm này.');
          } else {
            this.setSyncState('offline');
          }
        }
      );
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

  private handleYDocUpdate = (update: Uint8Array, origin: unknown): void => {
    if (this.isDestroyed || origin === COLLAB_REMOTE_ORIGIN || !this.canEdit) {
      return;
    }

    this.pendingUpdates.push(update);
    this.setSyncState('syncing');

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushTimer = setTimeout(() => {
      this.clearFlushTimers();
      void this.flushPendingUpdates();
    }, FLUSH_DEBOUNCE_MS);

    if (!this.maxWaitTimer) {
      this.maxWaitTimer = setTimeout(() => {
        this.clearFlushTimers();
        void this.flushPendingUpdates();
      }, FLUSH_MAX_WAIT_MS);
    }
  };

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

  private handleNetworkOnline = (): void => {
    if (this.isDestroyed) return;
    if (this.pendingUpdates.length > 0 && this.canEdit) {
      void this.flushPendingUpdates();
    } else if (this.isSynced) {
      this.setSyncState('synced');
    }
  };

  private handleNetworkOffline = (): void => {
    if (this.isDestroyed) return;
    this.setSyncState('offline');
  };

  private scheduleRetry(): void {
    if (this.isDestroyed || this.retryTimer) return;
    const delay = Math.min(15_000, 2000 * Math.pow(2, this.retryAttempt));
    this.retryAttempt = Math.min(this.retryAttempt + 1, 4);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (!this.isDestroyed && this.pendingUpdates.length > 0 && this.canEdit) {
        void this.flushPendingUpdates();
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
      this.setSyncState('offline');
      return;
    }

    this.isFlushing = true;
    const batch = this.pendingUpdates.splice(0, this.pendingUpdates.length);
    const merged = batch.length === 1 ? batch[0] : Y.mergeUpdates(batch);
    const updateBase64 = uint8ToBase64(merged);

    if (updateBase64.length > MAX_CHUNK_BASE64_LENGTH) {
      // Kiểm tra dung lượng toàn bộ tài liệu trước khi nén vào snapshots/latest
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
      // Nếu gói cập nhật lớn nhưng tổng dự án còn trong ngưỡng, nén thẳng vào snapshots/latest
      this.isFlushing = false;
      await this.compactUpdates();
      return;
    }

    const chunkId = `u_${Date.now().toString(36)}_${++this.seq}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    this.seenUpdateDocIds.add(chunkId);

    try {
      const now = new Date().toISOString();
      await setDoc(doc(db, 'collabProjects', this.projectId, 'updates', chunkId), {
        updateBase64,
        authorId: this.userId,
        createdAt: now,
      });

      this.knownServerUpdateIds.add(chunkId);
      this.retryAttempt = 0;

      // Cập nhật dấu thời gian updatedAt của dự án định kỳ (mỗi 15s) để danh sách sắp xếp chính xác
      const nowMs = Date.now();
      if (nowMs - this.lastMetaTouchAt > META_TOUCH_THROTTLE_MS) {
        this.lastMetaTouchAt = nowMs;
        updateDoc(doc(db, 'collabProjects', this.projectId), { updatedAt: now }).catch(() => {});
      }

      if (this.pendingUpdates.length > 0) {
        this.isFlushing = false;
        void this.flushPendingUpdates();
        return;
      }

      this.setSyncState('synced');

      if (this.knownServerUpdateIds.size >= COMPACTION_UPDATE_THRESHOLD) {
        void this.compactUpdates();
      }
    } catch (error: any) {
      this.seenUpdateDocIds.delete(chunkId);
      // Đưa lại vào đầu hàng đợi để không mất bất kỳ ký tự nào
      this.pendingUpdates.unshift(merged);

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
   */
  public async compactUpdates(): Promise<void> {
    if (!db || !this.canEdit || this.isCompacting || this.isDestroyed) return;
    this.isCompacting = true;

    const idsToDelete = Array.from(this.knownServerUpdateIds);

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

      this.lastAppliedSnapshotStamp = now;
      await setDoc(doc(db, 'collabProjects', this.projectId, 'snapshots', 'latest'), {
        stateBase64,
        updatedBy: this.userId,
        updatedAt: now,
      });

      await updateDoc(doc(db, 'collabProjects', this.projectId), {
        updatedAt: now,
      }).catch(() => {});

      // Xóa theo lô tối đa 400 tài liệu để an toàn với giới hạn Firestore batch (500)
      for (let i = 0; i < idsToDelete.length; i += 400) {
        const chunkIds = idsToDelete.slice(i, i + 400);
        const batch = writeBatch(db);
        for (const id of chunkIds) {
          batch.delete(doc(db, 'collabProjects', this.projectId, 'updates', id));
        }
        await batch.commit();
        for (const id of chunkIds) {
          this.knownServerUpdateIds.delete(id);
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
    if (this.imeFlushSafetyTimer) {
      clearTimeout(this.imeFlushSafetyTimer);
      this.imeFlushSafetyTimer = null;
    }
    this.bufferedRemoteBytes = [];
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    // Gửi nốt các thay đổi chưa kịp đẩy trước khi hủy tài liệu Y.Doc
    if (this.pendingUpdates.length > 0 && this.canEdit && db) {
      try {
        if (this.isFlushing) {
          const remaining = this.pendingUpdates.splice(0, this.pendingUpdates.length);
          const merged = remaining.length === 1 ? remaining[0] : Y.mergeUpdates(remaining);
          const updateBase64 = uint8ToBase64(merged);
          if (updateBase64.length <= MAX_CHUNK_BASE64_LENGTH) {
            const chunkId = `u_${Date.now().toString(36)}_${++this.seq}_${Math.random()
              .toString(36)
              .slice(2, 7)}`;
            await setDoc(doc(db, 'collabProjects', this.projectId, 'updates', chunkId), {
              updateBase64,
              authorId: this.userId,
              createdAt: new Date().toISOString(),
            });
          }
        } else {
          await this.flushPendingUpdates();
        }
      } catch {
        // Bỏ qua lỗi khi đóng
      }
    }

    this.isDestroyed = true;

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleNetworkOnline);
      window.removeEventListener('offline', this.handleNetworkOffline);
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
