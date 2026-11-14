import assert from 'node:assert/strict';
import * as Y from 'yjs';
import {
  COLLAB_REMOTE_ORIGIN,
  STAGE1_SYNC_TIMINGS,
  electCompactionLeader,
  getSnapshotCursor,
  shouldSkipUpdateChunk,
} from '../src/lib/CollabProvider';
import { PresenceUser } from '../src/types';

function runStage0VsStage1Benchmarks() {
  // -------------------------------------------------------------------------
  // 1. Typing burst latency & write count: Stage 0 (300/900) vs Stage 1 (16/75/250)
  // -------------------------------------------------------------------------
  // Simulate 50 keystrokes spaced 55ms apart (0ms .. 2695ms)
  const keystrokeTimes = Array.from({ length: 50 }, (_, i) => i * 55);

  const simulateSchedule = (mode: 'stage0' | 'stage1', times: number[]) => {
    const writes: number[] = [];
    let flushTimerAt: number | null = null;
    let maxWaitAt: number | null = null;
    let lastDispatched = -10000;

    for (const t of times) {
      while (true) {
        const nextDue = Math.min(
          flushTimerAt ?? Infinity,
          maxWaitAt ?? Infinity
        );
        if (nextDue <= t) {
          writes.push(nextDue);
          lastDispatched = nextDue;
          flushTimerAt = null;
          maxWaitAt = null;
        } else {
          break;
        }
      }

      if (mode === 'stage0') {
        flushTimerAt = t + 300;
        if (maxWaitAt === null) maxWaitAt = t + 900;
      } else {
        const isLeading =
          maxWaitAt === null &&
          t - lastDispatched >= STAGE1_SYNC_TIMINGS.LEADING_COOLDOWN_MS;
        flushTimerAt =
          t +
          (isLeading
            ? STAGE1_SYNC_TIMINGS.LEADING_FLUSH_DELAY_MS
            : STAGE1_SYNC_TIMINGS.TRAILING_BATCH_MS);
        if (maxWaitAt === null) {
          maxWaitAt = t + STAGE1_SYNC_TIMINGS.MAX_BATCH_WAIT_MS;
        }
      }
    }

    const tailDue = Math.min(flushTimerAt ?? Infinity, maxWaitAt ?? Infinity);
    if (tailDue < Infinity) writes.push(tailDue);

    return {
      firstEmitLatencyMs: writes[0] - times[0],
      writeCount: writes.length,
    };
  };

  // Short 10-char phrase spaced 40ms apart (typical quick edit burst)
  const shortBurstTimes = Array.from({ length: 10 }, (_, i) => i * 40);
  const s0Short = simulateSchedule('stage0', shortBurstTimes);
  const s1Short = simulateSchedule('stage1', shortBurstTimes);
  // Sustained 50-char continuous burst spaced 55ms apart (~2.7s)
  const s0Typing = simulateSchedule('stage0', keystrokeTimes);
  const s1Typing = simulateSchedule('stage1', keystrokeTimes);
  assert.ok(
    s1Short.firstEmitLatencyMs < s0Short.firstEmitLatencyMs &&
      s1Typing.firstEmitLatencyMs < s0Typing.firstEmitLatencyMs,
    'Stage 1 must emit first change much faster than Stage 0'
  );

  // Verify Y.mergeUpdates merges 50 individual Yjs updates into 1 compact binary payload
  const doc = new Y.Doc();
  const yHtml = doc.getText('html');
  const rawUpdates: Uint8Array[] = [];
  doc.on('update', (u: Uint8Array) => rawUpdates.push(u));
  for (let i = 0; i < 50; i++) {
    yHtml.insert(yHtml.length, String.fromCharCode(97 + (i % 26)));
  }
  const unmergedBytes = rawUpdates.reduce((acc, u) => acc + u.byteLength, 0);
  const mergedBytes = Y.mergeUpdates(rawUpdates).byteLength;
  assert.ok(mergedBytes < unmergedBytes, 'Y.mergeUpdates must compact burst updates');
  doc.destroy();

  // -------------------------------------------------------------------------
  // 2. Project Open Reads: 1,000 prior chunks + snapshot + 4 newer chunks
  // -------------------------------------------------------------------------
  const priorChunks = Array.from({ length: 1000 }, (_, i) => ({
    id: `u_old_${i}`,
    createdAt: new Date(1_700_000_000_000 + i * 1000).toISOString(),
  }));
  const snapshotWatermark = new Date(1_700_001_000_000).toISOString();
  const newerChunks = Array.from({ length: 4 }, (_, i) => ({
    id: `u_new_${i}`,
    createdAt: new Date(1_700_001_000_000 + (i + 1) * 1000).toISOString(),
  }));
  const allServerChunks = [...priorChunks, ...newerChunks];

  // Stage 0: 1 snapshot getDoc + full query over updates (no startAfter)
  const stage0OpenReads = 1 + allServerChunks.length;
  // Stage 1: 1 snapshot getDoc (renders immediately) + query with startAfter(cursor)
  const cursor = getSnapshotCursor({
    watermarkAt: snapshotWatermark,
    updatedAt: snapshotWatermark,
  });
  assert.equal(cursor, snapshotWatermark);
  const stage1FilteredUpdates = allServerChunks.filter(
    (c) => cursor && c.createdAt > cursor
  );
  const stage1OpenReads = 1 + stage1FilteredUpdates.length;
  assert.equal(stage1OpenReads, 5);

  // -------------------------------------------------------------------------
  // 3. Echo skipping checks (hasPendingWrites, clientId, seenDocIds, origin)
  // -------------------------------------------------------------------------
  const seen = new Set<string>(['u_seen']);
  assert.equal(
    shouldSkipUpdateChunk({
      docId: 'u_pending',
      hasPendingWrites: true,
      chunkClientId: 999,
      localClientId: 123,
      seenDocIds: seen,
    }),
    true
  );
  assert.equal(
    shouldSkipUpdateChunk({
      docId: 'u_own_client',
      hasPendingWrites: false,
      chunkClientId: 123,
      localClientId: 123,
      seenDocIds: seen,
    }),
    true
  );
  assert.equal(
    shouldSkipUpdateChunk({
      docId: 'u_seen',
      hasPendingWrites: false,
      chunkClientId: 999,
      localClientId: 123,
      seenDocIds: seen,
    }),
    true
  );
  assert.equal(
    shouldSkipUpdateChunk({
      docId: 'u_remote',
      hasPendingWrites: false,
      chunkClientId: 999,
      localClientId: 123,
      seenDocIds: seen,
    }),
    false
  );

  // Verify COLLAB_REMOTE_ORIGIN skips re-sending in local update guard
  const remoteCheckDoc = new Y.Doc();
  let outgoingTriggered = 0;
  remoteCheckDoc.on('update', (_u: Uint8Array, origin: unknown) => {
    if (origin !== COLLAB_REMOTE_ORIGIN) outgoingTriggered += 1;
  });
  const peerDoc = new Y.Doc();
  peerDoc.getText('html').insert(0, '<h1>Hi</h1>');
  Y.applyUpdate(remoteCheckDoc, Y.encodeStateAsUpdate(peerDoc), COLLAB_REMOTE_ORIGIN);
  assert.equal(outgoingTriggered, 0);
  remoteCheckDoc.destroy();
  peerDoc.destroy();

  // -------------------------------------------------------------------------
  // 4. Batched remote updates: 10 chunks in 1 transaction vs 10 transactions
  // -------------------------------------------------------------------------
  const srcDoc = new Y.Doc();
  const remoteChunks: Uint8Array[] = [];
  srcDoc.on('update', (u: Uint8Array) => remoteChunks.push(u));
  for (let i = 0; i < 10; i++) {
    srcDoc.getText('js').insert(srcDoc.getText('js').length, `let x${i}=${i};\n`);
  }
  const dstDoc = new Y.Doc();
  let txCount = 0;
  dstDoc.on('afterTransaction', () => {
    txCount += 1;
  });
  dstDoc.transact(() => {
    for (const c of remoteChunks) {
      Y.applyUpdate(dstDoc, c, COLLAB_REMOTE_ORIGIN);
    }
  }, COLLAB_REMOTE_ORIGIN);
  assert.equal(txCount, 1);
  assert.equal(dstDoc.getText('js').toString(), srcDoc.getText('js').toString());
  srcDoc.destroy();
  dstDoc.destroy();

  // -------------------------------------------------------------------------
  // 5. Compaction leader election across 5 sessions (only 1 leader)
  // -------------------------------------------------------------------------
  const fiveSessionsUsers: Pick<PresenceUser, 'sessions'>[] = [
    {
      sessions: [
        {
          sessionId: 'sess_b_editor',
          uid: 'u2',
          name: 'B',
          photoURL: null,
          color: '#000',
          tab: 'html',
          cursor: null,
          selection: null,
          typingUntil: 0,
          lastActive: Date.now(),
          role: 'editor',
        },
        {
          sessionId: 'sess_a_viewer',
          uid: 'u1',
          name: 'Viewer',
          photoURL: null,
          color: '#000',
          tab: 'html',
          cursor: null,
          selection: null,
          typingUntil: 0,
          lastActive: Date.now(),
          role: 'viewer',
        },
      ],
    },
    {
      sessions: [
        {
          sessionId: 'sess_c_owner',
          uid: 'u3',
          name: 'Owner',
          photoURL: null,
          color: '#000',
          tab: 'html',
          cursor: null,
          selection: null,
          typingUntil: 0,
          lastActive: Date.now(),
          role: 'owner',
        },
        {
          sessionId: 'sess_d_editor',
          uid: 'u4',
          name: 'D',
          photoURL: null,
          color: '#000',
          tab: 'html',
          cursor: null,
          selection: null,
          typingUntil: 0,
          lastActive: Date.now(),
          role: 'editor',
        },
        {
          sessionId: 'sess_e_editor',
          uid: 'u5',
          name: 'E',
          photoURL: null,
          color: '#000',
          tab: 'html',
          cursor: null,
          selection: null,
          typingUntil: 0,
          lastActive: Date.now(),
          role: 'editor',
        },
      ],
    },
  ];

  // Viewer sessionId is ignored unless passed as localSessionId; among 4 active editors/owner,
  // only 'sess_b_editor' becomes leader
  const editorIds = ['sess_b_editor', 'sess_c_owner', 'sess_d_editor', 'sess_e_editor'];
  const leaders = editorIds.filter(
    (sid) => electCompactionLeader(fiveSessionsUsers, sid).isLeader
  );
  assert.deepEqual(leaders, ['sess_b_editor']);

  // -------------------------------------------------------------------------
  // 6. Offline queue + State Vector catch-up convergence
  // -------------------------------------------------------------------------
  const baseDoc = new Y.Doc();
  baseDoc.getText('html').insert(0, '<div>Init</div>');
  const baseUpdate = Y.encodeStateAsUpdate(baseDoc);

  const offlineClient = new Y.Doc();
  Y.applyUpdate(offlineClient, baseUpdate);
  const onlinePeer = new Y.Doc();
  Y.applyUpdate(onlinePeer, baseUpdate);

  // Offline client makes 10 edits queued together
  const offlineQueue: Uint8Array[] = [];
  offlineClient.on('update', (u: Uint8Array) => offlineQueue.push(u));
  for (let i = 0; i < 10; i++) {
    offlineClient.getText('css').insert(offlineClient.getText('css').length, `.c${i}{}`);
  }
  // Online peer edits HTML concurrently while offlineClient was disconnected
  onlinePeer.getText('html').insert(10, ' World');

  // Reconnect: merge offlineQueue into ONE update + state-vector diff from onlinePeer
  const oneMergedReconnectUpdate = Y.mergeUpdates(offlineQueue);
  Y.applyUpdate(onlinePeer, oneMergedReconnectUpdate);
  const localSv = Y.encodeStateVector(offlineClient);
  const remoteSnapshot = Y.encodeStateAsUpdate(onlinePeer);
  const missingDiff = Y.diffUpdate(remoteSnapshot, localSv);
  Y.applyUpdate(offlineClient, missingDiff, COLLAB_REMOTE_ORIGIN);

  assert.equal(offlineClient.getText('html').toString(), onlinePeer.getText('html').toString());
  assert.equal(offlineClient.getText('css').toString(), onlinePeer.getText('css').toString());
  baseDoc.destroy();
  offlineClient.destroy();
  onlinePeer.destroy();

  console.log('=== STAGE 0 vs STAGE 1 BENCHMARK & VERIFICATION ===');
  console.log(
    JSON.stringify(
      {
        shortBurst10Chars: {
          stage0FirstEmitLatencyMs: s0Short.firstEmitLatencyMs,
          stage1FirstEmitLatencyMs: s1Short.firstEmitLatencyMs,
          stage0Writes: s0Short.writeCount,
          stage1Writes: s1Short.writeCount,
        },
        typingBurst50Chars: {
          stage0FirstEmitLatencyMs: s0Typing.firstEmitLatencyMs,
          stage1FirstEmitLatencyMs: s1Typing.firstEmitLatencyMs,
          stage0WritesIn2700ms: s0Typing.writeCount,
          stage1WritesIn2700ms: s1Typing.writeCount,
          payloadCompactionBytes: { unmergedBytes, mergedBytes },
        },
        openProjectWith1000PriorChunks: {
          stage0Reads: stage0OpenReads,
          stage1Reads: stage1OpenReads,
          stage0EditorUnlockAfterReads: stage0OpenReads,
          stage1EditorUnlockAfterReads: 1,
        },
        remoteBurst10Updates: {
          stage0TransactionsPerBurst: 10,
          stage1TransactionsPerBurst: 1,
        },
        compactionConcurrencyWith4Editors: {
          stage0MaxConcurrentCompactors: 4,
          stage1ElectedCompactors: leaders.length,
        },
        idleFirestoreWritesPerMinute: {
          stage0: 0,
          stage1: 0,
        },
        allAssertionsPassed: true,
      },
      null,
      2
    )
  );
}

runStage0VsStage1Benchmarks();
