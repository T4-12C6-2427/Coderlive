import { CollabRole, EditorTab, PresenceSession } from '../types';
import { CollabEditLockSnapshot } from './collabPresenceStore';

export interface EditLockEvalParams {
  singleEditorPerAccount: boolean;
  role: CollabRole;
  uid: string;
  localSessionId: string;
  sessionsForUid: PresenceSession[];
  preferredMode: 'auto' | 'readonly';
  localClaimedAt: number;
  wasHoldingLock: boolean;
  wasInConflict: boolean;
  wasPreviousHolderAlive: boolean;
  promptDismissed: boolean;
  broadcastSupersededBy?: {
    sessionId: string;
    claimedAt: number;
    tab?: EditorTab;
  } | null;
}

export interface EditLockEvalResult {
  snapshot: CollabEditLockSnapshot;
  canEdit: boolean;
  shouldHoldLock: boolean;
  justYieldedToOtherSession: boolean;
  hasLiveRemoteHolder: boolean;
}

function compareClaimPriority(
  claimedAtA: number,
  sessionIdA: string,
  claimedAtB: number,
  sessionIdB: string
): number {
  if (claimedAtA !== claimedAtB) {
    return claimedAtA - claimedAtB;
  }
  return sessionIdA.localeCompare(sessionIdB);
}

/**
 * Hàm thuần xác định trạng thái khóa chỉnh sửa theo tài khoản cho phiên hiện tại.
 * - Đây là cơ chế bảo vệ trải nghiệm người dùng phía client/RTDB (không thay thế rules bảo mật Firestore).
 * - Người xem (viewer) và dự án tắt `singleEditorPerAccount` luôn bỏ qua hàng đợi khóa.
 */
export function evaluateAccountEditLockState(params: EditLockEvalParams): EditLockEvalResult {
  const {
    singleEditorPerAccount,
    role,
    localSessionId,
    sessionsForUid,
    preferredMode,
    localClaimedAt,
    wasHoldingLock,
    wasInConflict,
    wasPreviousHolderAlive,
    promptDismissed,
    broadcastSupersededBy,
  } = params;

  const activeSessionsCountForUid = sessionsForUid.length;

  if (!singleEditorPerAccount || role === 'viewer') {
    return {
      snapshot: {
        status: 'inactive',
        holderSessionId: null,
        holderTab: null,
        holderLastActive: null,
        promptOpen: false,
        reason: null,
        activeSessionsCountForUid,
      },
      canEdit: role !== 'viewer',
      shouldHoldLock: false,
      justYieldedToOtherSession: false,
      hasLiveRemoteHolder: false,
    };
  }

  const otherEditorSessions = sessionsForUid.filter(
    (s) => s.sessionId !== localSessionId && s.role !== 'viewer'
  );

  interface HolderCandidate {
    sessionId: string;
    claimedAt: number;
    tab: EditorTab;
    lastActive: number;
  }

  const candidates: HolderCandidate[] = [];
  for (const s of otherEditorSessions) {
    if (s.isLockHolder) {
      candidates.push({
        sessionId: s.sessionId,
        claimedAt: typeof s.lockClaimedAt === 'number' && s.lockClaimedAt > 0 ? s.lockClaimedAt : s.lastActive,
        tab: s.tab,
        lastActive: s.lastActive,
      });
    }
  }

  if (broadcastSupersededBy && broadcastSupersededBy.sessionId !== localSessionId) {
    const matched = otherEditorSessions.find(
      (s) => s.sessionId === broadcastSupersededBy.sessionId
    );
    candidates.push({
      sessionId: broadcastSupersededBy.sessionId,
      claimedAt: broadcastSupersededBy.claimedAt,
      tab: matched?.tab ?? broadcastSupersededBy.tab ?? 'html',
      lastActive: matched?.lastActive ?? Date.now(),
    });
  }

  candidates.sort((a, b) =>
    compareClaimPriority(b.claimedAt, b.sessionId, a.claimedAt, a.sessionId)
  );
  const topRemoteHolder = candidates[0] || null;

  if (topRemoteHolder) {
    const localWins =
      wasHoldingLock &&
      !broadcastSupersededBy &&
      compareClaimPriority(
        localClaimedAt,
        localSessionId,
        topRemoteHolder.claimedAt,
        topRemoteHolder.sessionId
      ) > 0;

    if (!localWins) {
      const justYielded = wasHoldingLock;
      const shouldShowInitialPrompt =
        !justYielded && preferredMode !== 'readonly' && !wasInConflict && !promptDismissed;

      return {
        snapshot: {
          status: 'readonly_conflict',
          holderSessionId: topRemoteHolder.sessionId,
          holderTab: topRemoteHolder.tab,
          holderLastActive: topRemoteHolder.lastActive,
          promptOpen: shouldShowInitialPrompt,
          reason: 'conflict',
          activeSessionsCountForUid,
        },
        canEdit: false,
        shouldHoldLock: false,
        justYieldedToOtherSession: justYielded,
        hasLiveRemoteHolder: true,
      };
    }
  }

  // Không còn phiên nào khác đang giữ khóa sửa
  if (wasInConflict && preferredMode === 'readonly' && (wasPreviousHolderAlive || !wasHoldingLock)) {
    return {
      snapshot: {
        status: 'takeover_available',
        holderSessionId: null,
        holderTab: null,
        holderLastActive: null,
        promptOpen: wasPreviousHolderAlive ? true : !promptDismissed,
        reason: 'holder_disconnected',
        activeSessionsCountForUid,
      },
      canEdit: false,
      shouldHoldLock: false,
      justYieldedToOtherSession: false,
      hasLiveRemoteHolder: false,
    };
  }

  if (preferredMode === 'readonly') {
    return {
      snapshot: {
        status: 'takeover_available',
        holderSessionId: null,
        holderTab: null,
        holderLastActive: null,
        promptOpen: false,
        reason: null,
        activeSessionsCountForUid,
      },
      canEdit: false,
      shouldHoldLock: false,
      justYieldedToOtherSession: false,
      hasLiveRemoteHolder: false,
    };
  }

  return {
    snapshot: {
      status: 'holding',
      holderSessionId: localSessionId,
      holderTab: null,
      holderLastActive: Date.now(),
      promptOpen: false,
      reason: null,
      activeSessionsCountForUid,
    },
    canEdit: true,
    shouldHoldLock: true,
    justYieldedToOtherSession: false,
    hasLiveRemoteHolder: false,
  };
}

type BroadcastLockMessage =
  | {
      type: 'CLAIM';
      sessionId: string;
      claimedAt: number;
      tab: EditorTab;
    }
  | {
      type: 'RELEASE';
      sessionId: string;
    };

export interface CollabEditLockManagerOptions {
  projectId: string;
  uid: string;
  localSessionId: string;
  role: CollabRole;
  singleEditorPerAccount: boolean;
  onSyncPresenceLock: (isLockHolder: boolean, lockClaimedAt: number) => void;
  onStateChange: (result: EditLockEvalResult) => void;
  onPreempted?: () => void;
}

/**
 * Điều phối khóa 1 phiên chỉnh sửa mỗi tài khoản bằng BroadcastChannel (tức thời cùng trình duyệt)
 * kết hợp với RTDB Presence session metadata (đa thiết bị / ẩn danh / đóng tab đột ngột).
 */
export class CollabEditLockManager {
  private readonly projectId: string;
  private readonly uid: string;
  private readonly localSessionId: string;
  private role: CollabRole;
  private singleEditorPerAccount: boolean;
  private currentTab: EditorTab = 'html';

  private onSyncPresenceLock: (isLockHolder: boolean, lockClaimedAt: number) => void;
  private onStateChange: (result: EditLockEvalResult) => void;
  private onPreempted?: () => void;

  private channel: BroadcastChannel | null = null;
  private isDestroyed = false;

  private preferredMode: 'auto' | 'readonly' = 'auto';
  private localClaimedAt = 0;
  private highestSeenClaimedAt = 0;
  private wasHoldingLock = false;
  private wasInConflict = false;
  private wasPreviousHolderAlive = false;
  private promptDismissed = false;
  private broadcastSupersededBy: {
    sessionId: string;
    claimedAt: number;
    tab?: EditorTab;
  } | null = null;
  private latestSessionsForUid: PresenceSession[] = [];

  constructor(options: CollabEditLockManagerOptions) {
    this.projectId = options.projectId;
    this.uid = options.uid;
    this.localSessionId = options.localSessionId;
    this.role = options.role;
    this.singleEditorPerAccount = options.singleEditorPerAccount;
    this.onSyncPresenceLock = options.onSyncPresenceLock;
    this.onStateChange = options.onStateChange;
    this.onPreempted = options.onPreempted;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(
          `coderlive_edit_lock_v1_${this.projectId}_${this.uid}`
        );
        this.channel.onmessage = (event: MessageEvent<BroadcastLockMessage>) => {
          this.handleBroadcastMessage(event.data);
        };
      } catch {
        this.channel = null;
      }
    }
  }

  private handleBroadcastMessage(msg: BroadcastLockMessage | undefined): void {
    if (this.isDestroyed || !msg || msg.sessionId === this.localSessionId) return;

    if (msg.type === 'CLAIM') {
      this.highestSeenClaimedAt = Math.max(this.highestSeenClaimedAt, msg.claimedAt);
      if (msg.claimedAt >= this.localClaimedAt) {
        this.broadcastSupersededBy = {
          sessionId: msg.sessionId,
          claimedAt: msg.claimedAt,
          tab: msg.tab,
        };
        this.preferredMode = 'readonly';
        this.promptDismissed = true;
        this.reconcile();
      }
    } else if (msg.type === 'RELEASE') {
      if (this.broadcastSupersededBy?.sessionId === msg.sessionId) {
        this.broadcastSupersededBy = null;
        this.reconcile();
      }
    }
  }

  public updateSessionsForUid(sessions: PresenceSession[]): void {
    if (this.isDestroyed) return;
    this.latestSessionsForUid = sessions;

    for (const s of sessions) {
      if (typeof s.lockClaimedAt === 'number' && s.lockClaimedAt > this.highestSeenClaimedAt) {
        this.highestSeenClaimedAt = s.lockClaimedAt;
      }
    }

    if (this.broadcastSupersededBy) {
      const stillPresent = sessions.some(
        (s) => s.sessionId === this.broadcastSupersededBy?.sessionId && s.isLockHolder
      );
      if (stillPresent) {
        this.broadcastSupersededBy = null;
      }
    }

    this.reconcile();
  }

  public updateConfig(config: {
    role?: CollabRole;
    singleEditorPerAccount?: boolean;
    tab?: EditorTab;
  }): void {
    if (this.isDestroyed) return;
    let changed = false;
    if (config.role && config.role !== this.role) {
      this.role = config.role;
      changed = true;
    }
    if (
      typeof config.singleEditorPerAccount === 'boolean' &&
      config.singleEditorPerAccount !== this.singleEditorPerAccount
    ) {
      this.singleEditorPerAccount = config.singleEditorPerAccount;
      if (config.singleEditorPerAccount) {
        this.preferredMode = 'auto';
        this.promptDismissed = false;
        this.wasInConflict = false;
      }
      changed = true;
    }
    if (config.tab) {
      this.currentTab = config.tab;
    }
    if (changed) {
      this.reconcile();
    }
  }

  public chooseReadOnly(): void {
    if (this.isDestroyed) return;
    this.preferredMode = 'readonly';
    this.promptDismissed = true;
    this.reconcile();
  }

  public dismissPrompt(): void {
    if (this.isDestroyed) return;
    this.promptDismissed = true;
    this.reconcile();
  }

  public claimEditLock(): void {
    if (this.isDestroyed || this.role === 'viewer' || !this.singleEditorPerAccount) return;
    this.preferredMode = 'auto';
    this.promptDismissed = false;
    this.wasInConflict = false;
    this.broadcastSupersededBy = null;
    this.localClaimedAt = Math.max(Date.now(), this.highestSeenClaimedAt + 1);
    this.highestSeenClaimedAt = this.localClaimedAt;
    this.wasHoldingLock = true;

    this.onSyncPresenceLock(true, this.localClaimedAt);
    try {
      this.channel?.postMessage({
        type: 'CLAIM',
        sessionId: this.localSessionId,
        claimedAt: this.localClaimedAt,
        tab: this.currentTab,
      } satisfies BroadcastLockMessage);
    } catch {}

    this.reconcile();
  }

  public reconcile(): void {
    if (this.isDestroyed) return;

    const result = evaluateAccountEditLockState({
      singleEditorPerAccount: this.singleEditorPerAccount,
      role: this.role,
      uid: this.uid,
      localSessionId: this.localSessionId,
      sessionsForUid: this.latestSessionsForUid,
      preferredMode: this.preferredMode,
      promptDismissed: this.promptDismissed,
      localClaimedAt: this.localClaimedAt,
      wasHoldingLock: this.wasHoldingLock,
      wasInConflict: this.wasInConflict,
      wasPreviousHolderAlive: this.wasPreviousHolderAlive,
      broadcastSupersededBy: this.broadcastSupersededBy,
    });

    if (result.shouldHoldLock) {
      if (this.localClaimedAt === 0 || !this.wasHoldingLock) {
        this.localClaimedAt = Math.max(Date.now(), this.highestSeenClaimedAt + 1);
        this.highestSeenClaimedAt = this.localClaimedAt;
      }
      this.wasHoldingLock = true;
      this.wasInConflict = false;
      this.wasPreviousHolderAlive = false;
      this.onSyncPresenceLock(true, this.localClaimedAt);
    } else {
      if (this.wasHoldingLock) {
        this.wasHoldingLock = false;
        this.localClaimedAt = 0;
        this.onSyncPresenceLock(false, 0);
      } else {
        this.onSyncPresenceLock(false, 0);
      }

      if (result.snapshot.status === 'readonly_conflict') {
        this.wasInConflict = true;
        this.preferredMode = 'readonly';
        this.wasPreviousHolderAlive = true;
      } else if (result.snapshot.status === 'takeover_available') {
        if (this.wasPreviousHolderAlive) {
          this.promptDismissed = false;
        }
        this.wasPreviousHolderAlive = false;
      } else {
        this.wasInConflict = false;
        this.wasPreviousHolderAlive = false;
      }
    }

    if (result.justYieldedToOtherSession) {
      this.preferredMode = 'readonly';
      this.promptDismissed = true;
      this.onPreempted?.();
    }

    this.onStateChange(result);
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    if (this.wasHoldingLock) {
      try {
        this.channel?.postMessage({
          type: 'RELEASE',
          sessionId: this.localSessionId,
        } satisfies BroadcastLockMessage);
      } catch {}
    }
    try {
      this.channel?.close();
    } catch {}
    this.channel = null;
  }
}
