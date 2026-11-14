import { useSyncExternalStore } from 'react';
import { EditorTab, PresenceSession, PresenceUser, RemoteInsertFlash } from '../types';

export interface CollabEditLockSnapshot {
  status: 'inactive' | 'holding' | 'readonly_conflict' | 'takeover_available';
  holderSessionId: string | null;
  holderTab: EditorTab | null;
  holderLastActive: number | null;
  promptOpen: boolean;
  reason: 'conflict' | 'holder_disconnected' | null;
  activeSessionsCountForUid: number;
}

const DEFAULT_EDIT_LOCK_SNAPSHOT: CollabEditLockSnapshot = {
  status: 'inactive',
  holderSessionId: null,
  holderTab: null,
  holderLastActive: null,
  promptOpen: false,
  reason: null,
  activeSessionsCountForUid: 0,
};

type Listener = () => void;

class CollabPresenceStore {
  private onlineUsers: PresenceUser[] = [];
  private remoteSessions: PresenceSession[] = [];
  private insertFlashes: RemoteInsertFlash[] = [];
  private isConnected = true;
  private editLock: CollabEditLockSnapshot = DEFAULT_EDIT_LOCK_SNAPSHOT;

  private onlineUsersListeners = new Set<Listener>();
  private remoteSessionsListeners = new Set<Listener>();
  private flashesListeners = new Set<Listener>();
  private connectedListeners = new Set<Listener>();
  private editLockListeners = new Set<Listener>();

  public getOnlineUsers = (): PresenceUser[] => this.onlineUsers;
  public getRemoteSessions = (): PresenceSession[] => this.remoteSessions;
  public getInsertFlashes = (): RemoteInsertFlash[] => this.insertFlashes;
  public getIsConnected = (): boolean => this.isConnected;
  public getEditLock = (): CollabEditLockSnapshot => this.editLock;

  public subscribeOnlineUsers = (listener: Listener): (() => void) => {
    this.onlineUsersListeners.add(listener);
    return () => this.onlineUsersListeners.delete(listener);
  };

  public subscribeRemoteSessions = (listener: Listener): (() => void) => {
    this.remoteSessionsListeners.add(listener);
    return () => this.remoteSessionsListeners.delete(listener);
  };

  public subscribeInsertFlashes = (listener: Listener): (() => void) => {
    this.flashesListeners.add(listener);
    return () => this.flashesListeners.delete(listener);
  };

  public subscribeIsConnected = (listener: Listener): (() => void) => {
    this.connectedListeners.add(listener);
    return () => this.connectedListeners.delete(listener);
  };

  public subscribeEditLock = (listener: Listener): (() => void) => {
    this.editLockListeners.add(listener);
    return () => this.editLockListeners.delete(listener);
  };

  public setPresenceState(onlineUsers: PresenceUser[], remoteSessions: PresenceSession[]): void {
    this.onlineUsers = onlineUsers;
    this.remoteSessions = remoteSessions;
    this.onlineUsersListeners.forEach((l) => l());
    this.remoteSessionsListeners.forEach((l) => l());
  }

  public setIsConnected(connected: boolean): void {
    if (this.isConnected === connected) return;
    this.isConnected = connected;
    this.connectedListeners.forEach((l) => l());
  }

  public pushInsertFlashes(flashes: RemoteInsertFlash[]): void {
    if (flashes.length === 0) return;
    const cutoff = Date.now() - 1200;
    const active = this.insertFlashes.filter((f) => f.createdAt > cutoff);
    this.insertFlashes = [...active.slice(-30), ...flashes];
    this.flashesListeners.forEach((l) => l());
  }

  public pruneExpiredFlashes(now = Date.now()): void {
    const cutoff = now - 1200;
    const next = this.insertFlashes.filter((f) => f.createdAt > cutoff);
    if (next.length !== this.insertFlashes.length) {
      this.insertFlashes = next;
      this.flashesListeners.forEach((l) => l());
    }
  }

  public setEditLock(next: CollabEditLockSnapshot): void {
    const prev = this.editLock;
    if (
      prev.status === next.status &&
      prev.holderSessionId === next.holderSessionId &&
      prev.holderTab === next.holderTab &&
      prev.holderLastActive === next.holderLastActive &&
      prev.promptOpen === next.promptOpen &&
      prev.reason === next.reason &&
      prev.activeSessionsCountForUid === next.activeSessionsCountForUid
    ) {
      return;
    }
    this.editLock = next;
    this.editLockListeners.forEach((l) => l());
  }

  public resetPresence(): void {
    this.onlineUsers = [];
    this.remoteSessions = [];
    this.insertFlashes = [];
    this.isConnected = true;
    this.editLock = DEFAULT_EDIT_LOCK_SNAPSHOT;
    this.onlineUsersListeners.forEach((l) => l());
    this.remoteSessionsListeners.forEach((l) => l());
    this.flashesListeners.forEach((l) => l());
    this.connectedListeners.forEach((l) => l());
    this.editLockListeners.forEach((l) => l());
  }
}

export const collabPresenceStore = new CollabPresenceStore();

export function useCollabOnlineUsers(): PresenceUser[] {
  return useSyncExternalStore(
    collabPresenceStore.subscribeOnlineUsers,
    collabPresenceStore.getOnlineUsers,
    collabPresenceStore.getOnlineUsers
  );
}

export function useCollabPresenceConnected(): boolean {
  return useSyncExternalStore(
    collabPresenceStore.subscribeIsConnected,
    collabPresenceStore.getIsConnected,
    collabPresenceStore.getIsConnected
  );
}

export function useCollabEditLock(): CollabEditLockSnapshot {
  return useSyncExternalStore(
    collabPresenceStore.subscribeEditLock,
    collabPresenceStore.getEditLock,
    collabPresenceStore.getEditLock
  );
}
