import assert from 'node:assert/strict';
import { aggregatePresenceSessions } from '../src/lib/PresenceManager';
import {
  CollabEditLockManager,
  evaluateAccountEditLockState,
} from '../src/lib/CollabEditLockManager';
import { PresenceSession } from '../src/types';

function makeSession(overrides: Partial<PresenceSession>): PresenceSession {
  return {
    sessionId: 'sess_default',
    uid: 'user_a',
    name: 'Nguyễn Văn A',
    photoURL: null,
    color: '#4F46E5',
    tab: 'html',
    cursor: null,
    selection: null,
    typingUntil: 0,
    lastActive: 1_700_000_000_000,
    role: 'editor',
    isLockHolder: false,
    lockClaimedAt: 0,
    ...overrides,
  };
}

function runStage3Tests() {
  const now = 1_700_000_005_000;

  // -------------------------------------------------------------------------
  // 1. Presence grouping: 3 sessions from 2 users -> 2 onlineUsers with sessionCount
  // -------------------------------------------------------------------------
  const sessions: PresenceSession[] = [
    makeSession({ sessionId: 'sess_a1', uid: 'user_a', tab: 'html', lastActive: now - 5000, isLockHolder: true, lockClaimedAt: now - 5000 }),
    makeSession({ sessionId: 'sess_a2', uid: 'user_a', tab: 'css', lastActive: now - 1000, typingUntil: now + 1000 }),
    makeSession({ sessionId: 'sess_b1', uid: 'user_b', name: 'Trần Thị B', tab: 'js', lastActive: now - 2000, role: 'owner' }),
  ];

  const grouped = aggregatePresenceSessions(sessions, 'sess_a1', 'user_a', now);
  assert.equal(grouped.onlineUsers.length, 2, '3 sessions across 2 UIDs must group into 2 onlineUsers');
  assert.equal(grouped.remoteSessions.length, 2, 'Should expose 2 remote sessions excluding localSessionId');

  const userA = grouped.onlineUsers.find((u) => u.uid === 'user_a');
  const userB = grouped.onlineUsers.find((u) => u.uid === 'user_b');
  assert.ok(userA && userB);
  assert.equal(userA.sessionCount, 2, 'User A must show sessionCount = 2');
  assert.equal(userA.tab, 'css', 'Most recently active session determines primary tab');
  assert.equal(userA.isTyping, true);
  assert.equal(userB.sessionCount, 1, 'User B must show sessionCount = 1');

  // -------------------------------------------------------------------------
  // 2. Same-account Tab 1 opens alone -> holds edit lock immediately
  // -------------------------------------------------------------------------
  const tab1Session = makeSession({
    sessionId: 'sess_a1',
    uid: 'user_a',
    role: 'editor',
    lastActive: now,
  });
  const tab1Initial = evaluateAccountEditLockState({
    singleEditorPerAccount: true,
    role: 'editor',
    uid: 'user_a',
    localSessionId: 'sess_a1',
    sessionsForUid: [tab1Session],
    preferredMode: 'auto',
    localClaimedAt: 0,
    wasHoldingLock: false,
    wasInConflict: false,
    wasPreviousHolderAlive: false,
    promptDismissed: false,
  });
  assert.equal(tab1Initial.snapshot.status, 'holding');
  assert.equal(tab1Initial.canEdit, true);
  assert.equal(tab1Initial.shouldHoldLock, true);
  assert.equal(tab1Initial.snapshot.promptOpen, false);

  // -------------------------------------------------------------------------
  // 3. Same-account Tab 2 opens while Tab 1 holds lock -> conflict modal + read-only
  // -------------------------------------------------------------------------
  const tab1Holding = makeSession({
    sessionId: 'sess_a1',
    uid: 'user_a',
    tab: 'css',
    isLockHolder: true,
    lockClaimedAt: 1000,
    lastActive: now,
  });
  const tab2Join = evaluateAccountEditLockState({
    singleEditorPerAccount: true,
    role: 'editor',
    uid: 'user_a',
    localSessionId: 'sess_a2',
    sessionsForUid: [tab1Holding, makeSession({ sessionId: 'sess_a2', uid: 'user_a', lastActive: now })],
    preferredMode: 'auto',
    localClaimedAt: 0,
    wasHoldingLock: false,
    wasInConflict: false,
    wasPreviousHolderAlive: false,
    promptDismissed: false,
  });
  assert.equal(tab2Join.snapshot.status, 'readonly_conflict');
  assert.equal(tab2Join.canEdit, false);
  assert.equal(tab2Join.snapshot.promptOpen, true);
  assert.equal(tab2Join.snapshot.reason, 'conflict');
  assert.equal(tab2Join.snapshot.holderTab, 'css');

  // -------------------------------------------------------------------------
  // 4. Tab 2 claims takeover -> Tab 2 edits, Tab 1 yields cleanly with preemption notice
  // -------------------------------------------------------------------------
  let tab1CanEdit = true;
  let tab1Preempted = false;
  let tab1SyncedHolder = true;
  let tab1ClaimTime = 0;

  let tab2CanEdit = false;
  let tab2SyncedHolder = false;
  let tab2ClaimTime = 0;

  const mgr1 = new CollabEditLockManager({
    projectId: 'proj_1',
    uid: 'user_a',
    localSessionId: 'sess_a1',
    role: 'editor',
    singleEditorPerAccount: true,
    onSyncPresenceLock: (holder, claimedAt) => {
      tab1SyncedHolder = holder;
      tab1ClaimTime = claimedAt;
    },
    onStateChange: (res) => {
      tab1CanEdit = res.canEdit;
    },
    onPreempted: () => {
      tab1Preempted = true;
    },
  });
  mgr1.updateSessionsForUid([makeSession({ sessionId: 'sess_a1' })]);
  assert.equal(tab1CanEdit, true);
  assert.equal(tab1SyncedHolder, true);

  const mgr2 = new CollabEditLockManager({
    projectId: 'proj_1',
    uid: 'user_a',
    localSessionId: 'sess_a2',
    role: 'editor',
    singleEditorPerAccount: true,
    onSyncPresenceLock: (holder, claimedAt) => {
      tab2SyncedHolder = holder;
      tab2ClaimTime = claimedAt;
    },
    onStateChange: (res) => {
      tab2CanEdit = res.canEdit;
    },
  });

  // Tab 2 sees Tab 1 holding lock
  mgr2.updateSessionsForUid([
    makeSession({ sessionId: 'sess_a1', isLockHolder: true, lockClaimedAt: tab1ClaimTime }),
    makeSession({ sessionId: 'sess_a2', isLockHolder: false, lockClaimedAt: 0 }),
  ]);
  assert.equal(tab2CanEdit, false);

  // User clicks "Chiếm quyền chỉnh sửa ở đây" on Tab 2
  mgr2.claimEditLock();
  assert.equal(tab2CanEdit, true);
  assert.equal(tab2SyncedHolder, true);
  assert.ok(tab2ClaimTime > tab1ClaimTime);

  // Simulate RTDB propagating Tab 2's higher claim timestamp back to Tab 1
  mgr1.updateSessionsForUid([
    makeSession({ sessionId: 'sess_a1', isLockHolder: true, lockClaimedAt: tab1ClaimTime }),
    makeSession({ sessionId: 'sess_a2', isLockHolder: true, lockClaimedAt: tab2ClaimTime }),
  ]);
  assert.equal(tab1CanEdit, false, 'Tab 1 must yield to read-only after Tab 2 claims takeover');
  assert.equal(tab1SyncedHolder, false, 'Tab 1 must release RTDB isLockHolder flag');
  assert.equal(tab1Preempted, true, 'Tab 1 must fire onPreempted callback once');

  // -------------------------------------------------------------------------
  // 5. Holder disconnects while read-only tab is open -> offer takeover_available
  // -------------------------------------------------------------------------
  let tab1TakeoverReason: string | null = null;
  let tab1Status = '';
  let tab1Prompt = false;
  const mgr1Watch = new CollabEditLockManager({
    projectId: 'proj_2',
    uid: 'user_a',
    localSessionId: 'sess_a1',
    role: 'editor',
    singleEditorPerAccount: true,
    onSyncPresenceLock: () => {},
    onStateChange: (res) => {
      tab1Status = res.snapshot.status;
      tab1Prompt = res.snapshot.promptOpen;
      tab1TakeoverReason = res.snapshot.reason;
      tab1CanEdit = res.canEdit;
    },
  });
  // Start in read-only conflict because sess_a2 holds lock
  mgr1Watch.updateSessionsForUid([
    makeSession({ sessionId: 'sess_a1' }),
    makeSession({ sessionId: 'sess_a2', isLockHolder: true, lockClaimedAt: 5000 }),
  ]);
  mgr1Watch.chooseReadOnly();
  assert.equal(tab1Status, 'readonly_conflict');
  assert.equal(tab1Prompt, false);

  // Now sess_a2 disconnects
  mgr1Watch.updateSessionsForUid([makeSession({ sessionId: 'sess_a1' })]);
  assert.equal(tab1Status, 'takeover_available', 'Read-only tab must offer takeover instead of silently flipping editable');
  assert.equal(tab1Prompt, true);
  assert.equal(tab1TakeoverReason, 'holder_disconnected');
  assert.equal(tab1CanEdit, false);

  // -------------------------------------------------------------------------
  // 6. Viewer exclusion: viewer opening 2 tabs sees zero lock conflict modals
  // -------------------------------------------------------------------------
  const viewerEval = evaluateAccountEditLockState({
    singleEditorPerAccount: true,
    role: 'viewer',
    uid: 'user_v',
    localSessionId: 'sess_v2',
    sessionsForUid: [
      makeSession({ sessionId: 'sess_v1', uid: 'user_v', role: 'viewer' }),
      makeSession({ sessionId: 'sess_v2', uid: 'user_v', role: 'viewer' }),
    ],
    preferredMode: 'auto',
    localClaimedAt: 0,
    wasHoldingLock: false,
    wasInConflict: false,
    wasPreviousHolderAlive: false,
    promptDismissed: false,
  });
  assert.equal(viewerEval.snapshot.status, 'inactive');
  assert.equal(viewerEval.snapshot.promptOpen, false);
  assert.equal(viewerEval.canEdit, false);
  assert.equal(viewerEval.shouldHoldLock, false);

  // -------------------------------------------------------------------------
  // 7. Owner disables singleEditorPerAccount -> concurrent tabs edit freely
  // -------------------------------------------------------------------------
  const disabledEval = evaluateAccountEditLockState({
    singleEditorPerAccount: false,
    role: 'editor',
    uid: 'user_a',
    localSessionId: 'sess_a2',
    sessionsForUid: [
      makeSession({ sessionId: 'sess_a1', uid: 'user_a', isLockHolder: true, lockClaimedAt: 5000 }),
      makeSession({ sessionId: 'sess_a2', uid: 'user_a' }),
    ],
    preferredMode: 'auto',
    localClaimedAt: 0,
    wasHoldingLock: false,
    wasInConflict: false,
    wasPreviousHolderAlive: false,
    promptDismissed: false,
  });
  assert.equal(disabledEval.snapshot.status, 'inactive');
  assert.equal(disabledEval.canEdit, true);
  assert.equal(disabledEval.snapshot.promptOpen, false);

  mgr1.destroy();
  mgr2.destroy();
  mgr1Watch.destroy();

  console.log('====================================================');
  console.log('✅ STAGE 3 EDIT LOCK & PRESENCE GROUPING PASSED');
  console.log('====================================================');
  console.log(`• Presence grouping: 3 sessions / 2 UIDs -> ${grouped.onlineUsers.length} users (sessionCount: ${userA.sessionCount}, ${userB.sessionCount})`);
  console.log('• Single-editor lock guard: initial claim -> conflict modal -> read-only banner -> takeover preemption passed');
  console.log('• Holder disconnect recovery: transitions to takeover_available prompt without silent edit flip');
  console.log('• Viewer multi-tab exclusion & singleEditorPerAccount=false bypass verified');
  console.log('====================================================');
}

runStage3Tests();
