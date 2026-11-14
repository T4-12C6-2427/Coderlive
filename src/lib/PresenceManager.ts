import * as Y from 'yjs';
import {
  ref,
  onValue,
  set,
  update,
  remove,
  onDisconnect,
  Unsubscribe,
} from 'firebase/database';
import { rtdb } from './firebase';
import {
  CollabRole,
  EditorTab,
  PresenceCursor,
  PresenceSelection,
  PresenceSession,
  PresenceUser,
} from '../types';
import { IDLE_THRESHOLD_MS } from './presenceIdentity';

const CURSOR_THROTTLE_MS = 100;
const REMOTE_STATE_THROTTLE_MS = 60;
const TYPING_WINDOW_MS = 2000;
const ACTIVITY_THROTTLE_MS = 15000;
const IDLE_RECHECK_INTERVAL_MS = 10000;
const NOTICE_BATCH_WINDOW_MS = 1400;

export interface PresenceJoinLeaveNotice {
  type: 'join' | 'leave';
  users: { uid: string; name: string }[];
}

export interface PresenceManagerOptions {
  projectId: string;
  uid: string;
  name: string;
  photoURL: string | null;
  color: string;
  role: CollabRole;
  initialTab: EditorTab;
  hideOwnCursor?: boolean;
  onStateChange?: (payload: {
    onlineUsers: PresenceUser[];
    remoteSessions: PresenceSession[];
  }) => void;
  onConnectionChange?: (isConnected: boolean) => void;
  onJoinLeaveNotice?: (notice: PresenceJoinLeaveNotice) => void;
  onPermissionError?: () => void;
}

/**
 * Loại bỏ các thuộc tính `undefined` đệ quy để an toàn khi ghi JSON vào Firebase Realtime Database
 */
function stripUndefined<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v !== undefined) {
      out[k] = stripUndefined(v);
    }
  }
  return out as T;
}

export function generateSessionId(): string {
  return `sess_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function aggregatePresenceSessions(
  rawSessions: Iterable<PresenceSession>,
  localSessionId: string,
  localUid: string,
  now = Date.now()
): { onlineUsers: PresenceUser[]; remoteSessions: PresenceSession[] } {
  const remoteSessions: PresenceSession[] = [];
  const groupedByUid = new Map<string, PresenceSession[]>();

  for (const sess of rawSessions) {
    if (sess.sessionId !== localSessionId) {
      remoteSessions.push(sess);
    }
    const arr = groupedByUid.get(sess.uid);
    if (arr) {
      arr.push(sess);
    } else {
      groupedByUid.set(sess.uid, [sess]);
    }
  }

  const onlineUsers: PresenceUser[] = [];
  groupedByUid.forEach((sessions, uid) => {
    // Chọn phiên hoạt động gần nhất làm đại diện cho trạng thái tab / idle của người dùng
    const sorted = [...sessions].sort((a, b) => b.lastActive - a.lastActive);
    const primary = sorted[0];
    const maxLastActive = primary.lastActive;
    const elapsedIdle = Math.max(0, now - maxLastActive);
    const isIdle = elapsedIdle >= IDLE_THRESHOLD_MS;
    const idleMinutes = Math.floor(elapsedIdle / 60000);
    const isTyping = sorted.some((s) => s.typingUntil > now);

    onlineUsers.push({
      uid,
      name: primary.name,
      photoURL: primary.photoURL,
      color: primary.color,
      role: primary.role,
      tab: primary.tab,
      isTyping,
      isIdle,
      idleMinutes,
      lastActive: maxLastActive,
      sessionCount: sessions.length,
      primarySessionId: primary.sessionId,
      sessions: sorted,
    });
  });

  // Sắp xếp: bản thân hoặc người đang hoạt động trước, người vắng mặt sau
  onlineUsers.sort((a, b) => {
    if (a.isIdle !== b.isIdle) return a.isIdle ? 1 : -1;
    if (a.uid === localUid && b.uid !== localUid) return -1;
    if (b.uid === localUid && a.uid !== localUid) return 1;
    return b.lastActive - a.lastActive;
  });

  return { onlineUsers, remoteSessions };
}

/**
 * Quản lý trạng thái hiện diện thời gian thực (Realtime Database) tại đường dẫn:
 * `presence/{projectId}/{sessionId}`
 */
export class PresenceManager {
  public readonly projectId: string;
  public readonly sessionId: string;
  public readonly uid: string;

  private name: string;
  private photoURL: string | null;
  private color: string;
  private role: CollabRole;
  private currentTab: EditorTab;
  private currentCursor: PresenceCursor | null = null;
  private currentSelection: PresenceSelection | null = null;
  private typingUntil = 0;
  private lastActive = Date.now();
  private hideOwnCursor: boolean;
  private isLockHolder = false;
  private lockClaimedAt = 0;

  private onStateChange?: PresenceManagerOptions['onStateChange'];
  private onConnectionChange?: PresenceManagerOptions['onConnectionChange'];
  private onJoinLeaveNotice?: PresenceManagerOptions['onJoinLeaveNotice'];
  private onPermissionError?: PresenceManagerOptions['onPermissionError'];

  private isDestroyed = false;
  private isConnected = false;
  private hasConnectedOnce = false;
  private hasReceivedInitialSnapshot = false;

  private rawSessionsMap = new Map<string, PresenceSession>();
  private knownOnlineUids = new Map<string, string>(); // uid -> name

  private unsubConnected: Unsubscribe | null = null;
  private unsubPresence: Unsubscribe | null = null;
  private disconnectHandle: ReturnType<typeof onDisconnect> | null = null;

  private lastCursorEmitAt = 0;
  private pendingCursorPayload: {
    tab: EditorTab;
    cursor: PresenceCursor | null;
    selection: PresenceSelection | null;
  } | null = null;
  private cursorThrottleTimer: ReturnType<typeof setTimeout> | null = null;

  private lastStateEmitAt = 0;
  private stateEmitThrottleTimer: ReturnType<typeof setTimeout> | null = null;

  private lastActivityEmitAt = 0;
  private lastTypingEmitAt = 0;
  private typingRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  private idleCheckTimer: ReturnType<typeof setInterval> | null = null;

  private pendingJoins = new Map<string, string>();
  private pendingLeaves = new Map<string, string>();
  private noticeBatchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: PresenceManagerOptions) {
    this.projectId = options.projectId;
    this.sessionId = generateSessionId();
    this.uid = options.uid;
    this.name = options.name;
    this.photoURL = options.photoURL;
    this.color = options.color;
    this.role = options.role;
    this.currentTab = options.initialTab;
    this.hideOwnCursor = Boolean(options.hideOwnCursor);
    this.onStateChange = options.onStateChange;
    this.onConnectionChange = options.onConnectionChange;
    this.onJoinLeaveNotice = options.onJoinLeaveNotice;
    this.onPermissionError = options.onPermissionError;
  }

  public get isRealtimeAvailable(): boolean {
    return Boolean(rtdb);
  }

  public start(): void {
    if (this.isDestroyed) return;

    // Vẫn phát trạng thái cục bộ tối thiểu nếu Realtime Database chưa được cấu hình
    if (!rtdb) {
      this.rawSessionsMap.set(this.sessionId, this.buildLocalSessionPayload());
      this.emitAggregatedState();
      return;
    }

    const connectedRef = ref(rtdb, '.info/connected');
    const projectPresenceRef = ref(rtdb, `presence/${this.projectId}`);
    const mySessionRef = ref(rtdb, `presence/${this.projectId}/${this.sessionId}`);

    this.unsubConnected = onValue(connectedRef, (snap) => {
      if (this.isDestroyed) return;
      const connected = snap.val() === true;
      this.isConnected = connected;

      if (connected) {
        this.hasConnectedOnce = true;
        this.onConnectionChange?.(true);

        // Đăng ký onDisconnect().remove() trước khi ghi session để tab đóng biến mất sau vài giây
        const dc = onDisconnect(mySessionRef);
        this.disconnectHandle = dc;
        dc.remove()
          .then(() => {
            if (this.isDestroyed) return;
            return set(mySessionRef, this.buildLocalSessionPayload());
          })
          .catch((err) => {
            if (this.isDestroyed) return;
            console.warn('[PresenceManager] Không thể ghi phiên hiện diện:', err);
            if (String(err?.message || '').toLowerCase().includes('permission')) {
              this.onPermissionError?.();
            }
          });
      } else if (this.hasConnectedOnce || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
        this.onConnectionChange?.(false);
      }
    });

    this.unsubPresence = onValue(
      projectPresenceRef,
      (snapshot) => {
        if (this.isDestroyed) return;
        const val = snapshot.val() as Record<string, any> | null;
        const nextMap = new Map<string, PresenceSession>();

        if (val && typeof val === 'object') {
          for (const [sid, raw] of Object.entries(val)) {
            if (!raw || typeof raw !== 'object' || !raw.uid) continue;
            nextMap.set(sid, {
              sessionId: sid,
              uid: String(raw.uid),
              name: typeof raw.name === 'string' && raw.name ? raw.name : 'Thành viên',
              photoURL: typeof raw.photoURL === 'string' ? raw.photoURL : null,
              color: typeof raw.color === 'string' && raw.color ? raw.color : '#4F46E5',
              tab: raw.tab === 'css' || raw.tab === 'js' ? raw.tab : 'html',
              cursor: raw.cursor && raw.cursor.anchor && raw.cursor.head ? raw.cursor : null,
              selection:
                raw.selection && typeof raw.selection.isEmpty === 'boolean'
                  ? { isEmpty: raw.selection.isEmpty, length: Number(raw.selection.length) || 0 }
                  : null,
              typingUntil: typeof raw.typingUntil === 'number' ? raw.typingUntil : 0,
              lastActive: typeof raw.lastActive === 'number' ? raw.lastActive : Date.now(),
              role:
                raw.role === 'owner' || raw.role === 'viewer' ? raw.role : 'editor',
              isLockHolder: Boolean(raw.isLockHolder),
              lockClaimedAt: typeof raw.lockClaimedAt === 'number' ? raw.lockClaimedAt : 0,
            });
          }
        }

        // Đảm bảo phiên cục bộ luôn xuất hiện ngay cả khi đang chờ vòng lặp mạng
        if (!nextMap.has(this.sessionId)) {
          nextMap.set(this.sessionId, this.buildLocalSessionPayload());
        }

        this.processJoinLeaveDiff(nextMap);
        this.rawSessionsMap = nextMap;
        this.scheduleEmitAggregatedState();
        this.scheduleTypingRefresh();
      },
      (error) => {
        if (this.isDestroyed) return;
        console.warn('[PresenceManager] Lỗi lắng nghe presence:', error);
        if (String((error as any)?.message || '').toLowerCase().includes('permission')) {
          this.onPermissionError?.();
        }
      }
    );

    this.idleCheckTimer = setInterval(() => {
      if (!this.isDestroyed) {
        this.emitAggregatedState();
      }
    }, IDLE_RECHECK_INTERVAL_MS);
  }

  private buildLocalSessionPayload(): PresenceSession {
    return stripUndefined({
      sessionId: this.sessionId,
      uid: this.uid,
      name: this.name,
      photoURL: this.photoURL,
      color: this.color,
      tab: this.currentTab,
      cursor: this.currentCursor,
      selection: this.currentSelection,
      typingUntil: this.typingUntil,
      lastActive: this.lastActive,
      role: this.role,
      isLockHolder: this.isLockHolder,
      lockClaimedAt: this.lockClaimedAt,
    });
  }

  private buildRtdbWritablePayload(): Record<string, any> {
    return stripUndefined({
      uid: this.uid,
      name: this.name,
      photoURL: this.photoURL ?? null,
      color: this.color,
      tab: this.currentTab,
      cursor: this.currentCursor ?? null,
      selection: this.currentSelection ?? null,
      typingUntil: this.typingUntil,
      lastActive: this.lastActive,
      role: this.role,
      isLockHolder: this.isLockHolder,
      lockClaimedAt: this.lockClaimedAt,
    });
  }

  private processJoinLeaveDiff(nextMap: Map<string, PresenceSession>): void {
    const nextUids = new Map<string, string>();
    nextMap.forEach((sess) => {
      if (!nextUids.has(sess.uid)) {
        nextUids.set(sess.uid, sess.name);
      }
    });

    if (!this.hasReceivedInitialSnapshot) {
      this.hasReceivedInitialSnapshot = true;
      this.knownOnlineUids = nextUids;
      return;
    }

    let hasChanges = false;
    nextUids.forEach((name, uid) => {
      if (uid === this.uid) return;
      if (!this.knownOnlineUids.has(uid)) {
        if (this.pendingLeaves.has(uid)) {
          this.pendingLeaves.delete(uid);
        } else {
          this.pendingJoins.set(uid, name);
        }
        hasChanges = true;
      }
    });

    this.knownOnlineUids.forEach((name, uid) => {
      if (uid === this.uid) return;
      if (!nextUids.has(uid)) {
        if (this.pendingJoins.has(uid)) {
          this.pendingJoins.delete(uid);
        } else {
          this.pendingLeaves.set(uid, name);
        }
        hasChanges = true;
      }
    });

    this.knownOnlineUids = nextUids;

    if (hasChanges && (this.pendingJoins.size > 0 || this.pendingLeaves.size > 0)) {
      if (this.noticeBatchTimer) {
        clearTimeout(this.noticeBatchTimer);
      }
      this.noticeBatchTimer = setTimeout(() => {
        this.noticeBatchTimer = null;
        if (this.isDestroyed) return;
        if (this.pendingJoins.size > 0) {
          const joined = Array.from(this.pendingJoins.entries()).map(([uid, name]) => ({
            uid,
            name,
          }));
          this.pendingJoins.clear();
          this.onJoinLeaveNotice?.({ type: 'join', users: joined });
        }
        if (this.pendingLeaves.size > 0) {
          const left = Array.from(this.pendingLeaves.entries()).map(([uid, name]) => ({
            uid,
            name,
          }));
          this.pendingLeaves.clear();
          this.onJoinLeaveNotice?.({ type: 'leave', users: left });
        }
      }, NOTICE_BATCH_WINDOW_MS);
    }
  }

  private scheduleTypingRefresh(): void {
    if (this.typingRefreshTimer) {
      clearTimeout(this.typingRefreshTimer);
      this.typingRefreshTimer = null;
    }
    const now = Date.now();
    let soonestExpiry = Infinity;
    this.rawSessionsMap.forEach((sess) => {
      if (sess.typingUntil > now && sess.typingUntil < soonestExpiry) {
        soonestExpiry = sess.typingUntil;
      }
    });
    if (soonestExpiry !== Infinity) {
      const delay = Math.max(80, Math.min(3000, soonestExpiry - now + 60));
      this.typingRefreshTimer = setTimeout(() => {
        this.typingRefreshTimer = null;
        if (!this.isDestroyed) {
          this.emitAggregatedState();
        }
      }, delay);
    }
  }

  private scheduleEmitAggregatedState(): void {
    if (this.isDestroyed) return;
    const elapsed = Date.now() - this.lastStateEmitAt;
    if (this.lastStateEmitAt === 0 || elapsed >= REMOTE_STATE_THROTTLE_MS) {
      if (this.stateEmitThrottleTimer) {
        clearTimeout(this.stateEmitThrottleTimer);
        this.stateEmitThrottleTimer = null;
      }
      this.emitAggregatedState();
      return;
    }
    if (!this.stateEmitThrottleTimer) {
      this.stateEmitThrottleTimer = setTimeout(() => {
        this.stateEmitThrottleTimer = null;
        if (!this.isDestroyed) {
          this.emitAggregatedState();
        }
      }, REMOTE_STATE_THROTTLE_MS - elapsed);
    }
  }

  private emitAggregatedState(): void {
    if (this.isDestroyed) return;
    this.lastStateEmitAt = Date.now();
    const { onlineUsers, remoteSessions } = aggregatePresenceSessions(
      this.rawSessionsMap.values(),
      this.sessionId,
      this.uid,
      this.lastStateEmitAt
    );
    this.onStateChange?.({ onlineUsers, remoteSessions });
  }

  private writeLocalPatch(patch: Record<string, any>): void {
    if (this.isDestroyed) return;
    this.rawSessionsMap.set(this.sessionId, this.buildLocalSessionPayload());
    this.emitAggregatedState();

    if (!rtdb || !this.isConnected) return;
    const mySessionRef = ref(rtdb, `presence/${this.projectId}/${this.sessionId}`);
    update(mySessionRef, stripUndefined(patch)).catch(() => {});
  }

  public updateTab(tab: EditorTab): void {
    if (this.isDestroyed || this.currentTab === tab) return;
    this.currentTab = tab;
    this.currentCursor = null;
    this.currentSelection = null;
    this.lastActive = Date.now();
    this.writeLocalPatch({
      tab,
      cursor: null,
      selection: null,
      lastActive: this.lastActive,
    });
  }

  public updateRole(role: CollabRole): void {
    if (this.isDestroyed || this.role === role) return;
    this.role = role;
    this.writeLocalPatch({ role });
  }

  public updateEditLockClaim(isLockHolder: boolean, lockClaimedAt: number): void {
    if (this.isDestroyed) return;
    if (this.isLockHolder === isLockHolder && this.lockClaimedAt === lockClaimedAt) return;
    this.isLockHolder = isLockHolder;
    this.lockClaimedAt = lockClaimedAt;
    this.writeLocalPatch({ isLockHolder, lockClaimedAt });
  }

  public updateIdentity(name: string, photoURL: string | null): void {
    if (this.isDestroyed) return;
    if (this.name === name && this.photoURL === photoURL) return;
    this.name = name;
    this.photoURL = photoURL;
    this.writeLocalPatch({ name, photoURL });
  }

  public setHideOwnCursor(hide: boolean): void {
    if (this.isDestroyed || this.hideOwnCursor === hide) return;
    this.hideOwnCursor = hide;
    if (hide) {
      this.currentCursor = null;
      this.currentSelection = null;
      this.pendingCursorPayload = null;
      if (this.cursorThrottleTimer) {
        clearTimeout(this.cursorThrottleTimer);
        this.cursorThrottleTimer = null;
      }
      this.writeLocalPatch({
        cursor: null,
        selection: null,
      });
    }
  }

  public updateCursor(tab: EditorTab, anchorIndex: number, headIndex: number, ytext: Y.Text): void {
    if (this.isDestroyed) return;
    if (this.hideOwnCursor) {
      this.currentTab = tab;
      this.currentCursor = null;
      this.currentSelection = null;
      this.markActivity();
      return;
    }
    const maxLen = ytext.length;
    const safeAnchor = Math.max(0, Math.min(anchorIndex, maxLen));
    const safeHead = Math.max(0, Math.min(headIndex, maxLen));

    const anchorRel = Y.relativePositionToJSON(
      Y.createRelativePositionFromTypeIndex(ytext, safeAnchor)
    );
    const headRel = Y.relativePositionToJSON(
      Y.createRelativePositionFromTypeIndex(ytext, safeHead)
    );

    const cursor: PresenceCursor = stripUndefined({
      anchor: anchorRel,
      head: headRel,
    });
    const selection: PresenceSelection = {
      isEmpty: safeAnchor === safeHead,
      length: Math.abs(safeHead - safeAnchor),
    };

    this.currentTab = tab;
    this.currentCursor = cursor;
    this.currentSelection = selection;
    this.lastActive = Date.now();

    const now = Date.now();
    const elapsed = now - this.lastCursorEmitAt;

    if (elapsed >= CURSOR_THROTTLE_MS) {
      this.lastCursorEmitAt = now;
      this.pendingCursorPayload = null;
      if (this.cursorThrottleTimer) {
        clearTimeout(this.cursorThrottleTimer);
        this.cursorThrottleTimer = null;
      }
      this.writeLocalPatch({
        tab,
        cursor,
        selection,
        lastActive: this.lastActive,
      });
    } else {
      this.pendingCursorPayload = { tab, cursor, selection };
      if (!this.cursorThrottleTimer) {
        this.cursorThrottleTimer = setTimeout(() => {
          this.cursorThrottleTimer = null;
          if (this.isDestroyed || !this.pendingCursorPayload) return;
          const pending = this.pendingCursorPayload;
          this.pendingCursorPayload = null;
          this.lastCursorEmitAt = Date.now();
          this.writeLocalPatch({
            tab: pending.tab,
            cursor: pending.cursor,
            selection: pending.selection,
            lastActive: this.lastActive,
          });
        }, CURSOR_THROTTLE_MS - elapsed);
      }
    }
  }

  public notifyTyping(tab: EditorTab): void {
    if (this.isDestroyed) return;
    const now = Date.now();
    this.currentTab = tab;
    this.typingUntil = now + TYPING_WINDOW_MS;
    this.lastActive = now;

    if (now - this.lastTypingEmitAt >= 450) {
      this.lastTypingEmitAt = now;
      this.writeLocalPatch({
        tab,
        typingUntil: this.typingUntil,
        lastActive: this.lastActive,
      });
    }
  }

  public markActivity(): void {
    if (this.isDestroyed) return;
    const now = Date.now();
    const wasIdle = now - this.lastActive >= IDLE_THRESHOLD_MS;
    this.lastActive = now;
    if (wasIdle || now - this.lastActivityEmitAt >= ACTIVITY_THROTTLE_MS) {
      this.lastActivityEmitAt = now;
      this.writeLocalPatch({ lastActive: now });
    }
  }

  public async destroy(): Promise<void> {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.cursorThrottleTimer) {
      clearTimeout(this.cursorThrottleTimer);
      this.cursorThrottleTimer = null;
    }
    if (this.stateEmitThrottleTimer) {
      clearTimeout(this.stateEmitThrottleTimer);
      this.stateEmitThrottleTimer = null;
    }
    if (this.typingRefreshTimer) {
      clearTimeout(this.typingRefreshTimer);
      this.typingRefreshTimer = null;
    }
    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer);
      this.idleCheckTimer = null;
    }
    if (this.noticeBatchTimer) {
      clearTimeout(this.noticeBatchTimer);
      this.noticeBatchTimer = null;
    }

    this.unsubConnected?.();
    this.unsubPresence?.();
    this.unsubConnected = null;
    this.unsubPresence = null;

    if (rtdb) {
      const mySessionRef = ref(rtdb, `presence/${this.projectId}/${this.sessionId}`);
      try {
        await this.disconnectHandle?.cancel();
      } catch {}
      try {
        await remove(mySessionRef);
      } catch {}
    }

    this.rawSessionsMap.clear();
    this.knownOnlineUids.clear();
  }
}
