import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { Decoration, DecorationSet, EditorView, keymap } from '@codemirror/view';
import { RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { yCollab, ySyncAnnotation, ySyncFacet, yUndoManagerKeymap } from 'y-codemirror.next';
import * as Y from 'yjs';
import { AlignLeft, Eye, Loader2, Lock, MessageSquare, Plus, Redo2, Undo2, X } from 'lucide-react';
import {
  ThemeMode,
  EditorTab,
  PresenceSession,
  PresenceUser,
  RemoteInsertFlash,
  CollabLineComment,
} from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useIsMobile, useIsTouch } from '../hooks/useViewport';
import {
  addInsertFlashesEffect,
  createCollabPresenceExtension,
  pruneExpiredFlashesEffect,
  resolveCommentLineNumber,
  updatePresenceStateEffect,
} from '../lib/cmPresenceExtension';
import { getInitials } from '../lib/presenceIdentity';
import { getContrastingText } from '../lib/themeEngine';
import {
  LineCommentsPopover,
  ResolvedLineCommentItem,
} from './collab/LineCommentsPopover';

interface EditorPaneProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  onHtmlChange: (val: string) => void;
  onCssChange: (val: string) => void;
  onJsChange: (val: string) => void;
  theme?: ThemeMode;
  onFormatCode?: () => void;
  isReadOnly?: boolean;
  readOnlyBadgeText?: string;
  enabledLanguages?: ('html' | 'css' | 'js')[];
  onAddLanguage?: (lang: 'html' | 'css' | 'js') => void;
  onRemoveLanguage?: (lang: 'css' | 'js') => void;
  // Collaborative CRDT bindings
  collabProjectId?: string;
  collabYDoc?: Y.Doc | null;
  collabSyncReady?: boolean;
  collabUndoManagers?: Record<EditorTab, Y.UndoManager> | null;
  collabAwareness?: any;
  // Stage 3 Presence & Follow bindings
  onlineUsers?: PresenceUser[];
  remoteSessions?: PresenceSession[];
  currentUserId?: string;
  followingUser?: PresenceUser | null;
  onStopFollowing?: () => void;
  jumpTarget?: { uid: string; tab: EditorTab; nonce: number } | null;
  cursorJumpTarget?: { tab: EditorTab; line: number; col?: number; nonce: number } | null;
  appliedHighlightTarget?: {
    tab: EditorTab;
    ranges: Array<{ fromLine: number; toLine: number }>;
    nonce: number;
  } | null;
  remoteInsertFlashes?: RemoteInsertFlash[];
  onLocalCursorChange?: (tab: EditorTab, anchor: number, head: number) => void;
  onLocalTyping?: (tab: EditorTab) => void;
  onLocalInteraction?: () => void;
  // Stage 4: Privacy, IME composition & Line Comments
  hideRemoteCursors?: boolean;
  onCompositionChange?: (isComposing: boolean) => void;
  lineComments?: CollabLineComment[];
  projectOwnerId?: string;
  onAddLineComment?: (
    tab: EditorTab,
    lineNumber: number,
    relPosJson: string | null,
    text: string
  ) => Promise<void>;
  onReplyLineComment?: (commentId: string, text: string) => Promise<void>;
  onToggleResolveLineComment?: (commentId: string, nextResolved: boolean) => Promise<void>;
  onDeleteLineComment?: (commentId: string) => Promise<void>;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  activeTab,
  onTabChange,
  htmlCode,
  cssCode,
  jsCode,
  onHtmlChange,
  onCssChange,
  onJsChange,
  onFormatCode,
  isReadOnly = false,
  readOnlyBadgeText = 'Chỉ đọc',
  enabledLanguages = ['html', 'css', 'js'],
  onAddLanguage,
  onRemoveLanguage,
  collabProjectId,
  collabYDoc = null,
  collabSyncReady = false,
  collabUndoManagers = null,
  onlineUsers = [],
  remoteSessions = [],
  currentUserId = '',
  followingUser = null,
  onStopFollowing,
  jumpTarget = null,
  cursorJumpTarget = null,
  appliedHighlightTarget = null,
  remoteInsertFlashes = [],
  onLocalCursorChange,
  onLocalTyping,
  onLocalInteraction,
  hideRemoteCursors = false,
  onCompositionChange,
  lineComments = [],
  projectOwnerId = '',
  onAddLineComment,
  onReplyLineComment,
  onToggleResolveLineComment,
  onDeleteLineComment,
}) => {
  const { settings } = useTheme();
  const isTouch = useIsTouch();
  const isMobile = useIsMobile();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [commentPopover, setCommentPopover] = useState<{
    lineNumber: number;
    anchorY: number | null;
  } | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const seenFlashIdsRef = useRef<Set<string>>(new Set());
  const lastFollowedSigRef = useRef<string | null>(null);
  const lastJumpNonceRef = useRef<number>(0);
  const lastCursorJumpNonceRef = useRef<number>(0);
  const lastAppliedHighlightNonceRef = useRef<number>(0);

  const jumpHighlightExt = useMemo(() => {
    const setLinesEffect = StateEffect.define<Array<{ fromLine: number; toLine: number }>>();
    const field = StateField.define<DecorationSet>({
      create() {
        return Decoration.none;
      },
      update(decos, tr) {
        let next = decos.map(tr.changes);
        for (const eff of tr.effects) {
          if (eff.is(setLinesEffect)) {
            const builder = new RangeSetBuilder<Decoration>();
            const lineNums = new Set<number>();
            for (const r of eff.value) {
              const start = Math.max(1, Math.min(r.fromLine, tr.state.doc.lines));
              const end = Math.max(start, Math.min(r.toLine, tr.state.doc.lines));
              for (let ln = start; ln <= end; ln++) {
                lineNums.add(ln);
              }
            }
            const sorted = Array.from(lineNums).sort((a, b) => a - b);
            for (const ln of sorted) {
              const lineObj = tr.state.doc.line(ln);
              builder.add(
                lineObj.from,
                lineObj.from,
                Decoration.line({ class: 'cm-jump-flash-line' })
              );
            }
            next = builder.finish();
          }
        }
        return next;
      },
      provide: (f) => EditorView.decorations.from(f),
    });
    return { setLinesEffect, field };
  }, []);

  const isCollabMode = Boolean(collabProjectId && collabYDoc);
  const isCollabEditorReady = Boolean(isCollabMode && collabSyncReady && collabYDoc);
  const highlightInserts = settings.collabHighlightInserts !== false;

  // Refs ổn định để không tái tạo CodeMirror extension khi callback hoặc tab thay đổi
  const activeTabRef = useRef<EditorTab>(activeTab);
  activeTabRef.current = activeTab;
  const onLocalCursorChangeRef = useRef(onLocalCursorChange);
  onLocalCursorChangeRef.current = onLocalCursorChange;
  const onLocalTypingRef = useRef(onLocalTyping);
  onLocalTypingRef.current = onLocalTyping;
  const onLocalInteractionRef = useRef(onLocalInteraction);
  onLocalInteractionRef.current = onLocalInteraction;
  const onCompositionChangeRef = useRef(onCompositionChange);
  onCompositionChangeRef.current = onCompositionChange;

  useEffect(() => {
    setCommentPopover(null);
  }, [collabProjectId, activeTab, isCollabMode]);

  // Auto-switch to an active tab if current tab is not enabled
  useEffect(() => {
    if (enabledLanguages && !enabledLanguages.includes(activeTab)) {
      const fallback = enabledLanguages[0] || 'html';
      onTabChange(fallback);
    }
  }, [enabledLanguages, activeTab, onTabChange]);

  // Close add menu on outside click
  useEffect(() => {
    if (!showAddMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showAddMenu]);

  // Keep active cursor visible above mobile on-screen keyboard when visualViewport shrinks
  useEffect(() => {
    if (typeof window === 'undefined' || (!isTouch && !isMobile)) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const handleVvResize = () => {
      const view = editorViewRef.current;
      if (!view || !view.hasFocus) return;
      requestAnimationFrame(() => {
        try {
          const head = view.state.selection.main.head;
          view.dispatch({
            effects: EditorView.scrollIntoView(head, { y: 'nearest' }),
          });
        } catch {}
      });
    };

    vv.addEventListener('resize', handleVvResize, { passive: true });
    return () => vv.removeEventListener('resize', handleVvResize);
  }, [isTouch, isMobile]);

  // Dynamic theme extension generated from CSS variables
  const editorThemeExtension = useMemo(() => {
    return EditorView.theme({
      '&': {
        height: '100%',
        backgroundColor: 'var(--bg-editor-surface, var(--code-bg))',
        color: 'var(--text-primary)',
        fontFamily: settings.editorFontFamily || 'var(--font-mono)',
        fontSize: `${settings.editorFontSize}px`,
      },
      '.cm-content': {
        fontFamily: settings.editorFontFamily || 'var(--font-mono)',
        caretColor: 'var(--accent)',
      },
      '.cm-scroller': {
        fontFamily: settings.editorFontFamily || 'var(--font-mono)',
        lineHeight: 'var(--code-line-height)',
        backdropFilter: 'var(--panel-backdrop-filter, blur(16px))',
        WebkitBackdropFilter: 'var(--panel-backdrop-filter, blur(16px))',
      },
      '.cm-cursor, &.cm-focused .cm-cursor': {
        borderLeftColor: 'var(--accent)',
        borderLeftWidth: '2px',
      },
      '.cm-gutters': {
        backgroundColor: 'var(--bg-editor-surface, var(--code-gutter))',
        color: 'var(--text-muted)',
        borderRight: '1px solid var(--border-subtle)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'var(--bg-hover)',
        color: 'var(--accent)',
        fontWeight: 'bold',
      },
      '.cm-activeLine': {
        backgroundColor: 'var(--code-line-highlight)',
      },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: 'var(--code-selection)',
      },
    });
  }, [settings.editorFontFamily, settings.editorFontSize]);

  // Extensions per tab
  const htmlExtensions = useMemo(() => [html({ autoCloseTags: true, matchClosingTags: true })], []);
  const cssExtensions = useMemo(() => [css()], []);
  const jsExtensions = useMemo(() => [javascript({ jsx: false, typescript: false })], []);

  const activeCollabYText = useMemo(() => {
    if (!isCollabEditorReady || !collabYDoc) return null;
    return collabYDoc.getText(activeTab);
  }, [isCollabEditorReady, collabYDoc, activeTab]);

  const activeCollabUndoManager = useMemo(() => {
    if (!isCollabEditorReady || !collabUndoManagers) return null;
    return collabUndoManagers[activeTab] || null;
  }, [isCollabEditorReady, collabUndoManagers, activeTab]);

  // Truyền null thay vì awareness để tắt con trỏ mặc định của y-codemirror.next, dùng extension tùy biến Stage 3
  const collabExtension = useMemo(() => {
    if (!activeCollabYText) return null;
    const undoOpt = activeCollabUndoManager ?? false;
    const ext = [yCollab(activeCollabYText, null, { undoManager: undoOpt })];
    if (!isReadOnly && activeCollabUndoManager) {
      ext.push(keymap.of(yUndoManagerKeymap));
    }
    return ext;
  }, [activeCollabYText, activeCollabUndoManager, isReadOnly]);

  const presenceExtension = useMemo(() => {
    if (!isCollabEditorReady) return null;
    return createCollabPresenceExtension({
      onLocalCursorChange: (anchor, head) => {
        onLocalCursorChangeRef.current?.(activeTabRef.current, anchor, head);
      },
      onLocalTyping: () => {
        onLocalTypingRef.current?.(activeTabRef.current);
      },
      onLocalInteraction: () => {
        onLocalInteractionRef.current?.();
      },
      onCompositionChange: (isComposing) => {
        onCompositionChangeRef.current?.(isComposing);
      },
      onLineNumberClick: (lineNumber, clientY) => {
        setCommentPopover({ lineNumber, anchorY: clientY });
      },
    });
  }, [isCollabEditorReady]);

  const activeExtensions = useMemo(() => {
    const list: any[] = [editorThemeExtension];
    if (settings.editorWordWrap) {
      list.push(EditorView.lineWrapping);
    }
    switch (activeTab) {
      case 'css':
        list.push(...cssExtensions);
        break;
      case 'js':
        list.push(...jsExtensions);
        break;
      case 'html':
      default:
        list.push(...htmlExtensions);
        break;
    }
    if (collabExtension) {
      list.push(...collabExtension);
    }
    if (presenceExtension) {
      list.push(presenceExtension);
    }
    list.push(jumpHighlightExt.field);
    return list;
  }, [
    activeTab,
    editorThemeExtension,
    settings.editorWordWrap,
    htmlExtensions,
    cssExtensions,
    jsExtensions,
    collabExtension,
    presenceExtension,
    jumpHighlightExt,
  ]);

  const editorKey = isCollabEditorReady
    ? `collab:${collabProjectId}:${activeTab}`
    : 'personal-editor';

  // Xóa ref view cũ khi đổi editorKey
  useEffect(() => {
    return () => {
      editorViewRef.current = null;
    };
  }, [editorKey]);

  // Đẩy dữ liệu hiện diện và bình luận vào CodeMirror qua StateEffect mà không làm remount editor
  useEffect(() => {
    const view = editorViewRef.current;
    if (!view || !isCollabEditorReady) return;
    try {
      view.dispatch({
        effects: updatePresenceStateEffect.of({
          remoteSessions,
          activeTab,
          ydoc: collabYDoc,
          ytext: activeCollabYText,
          highlightInserts,
          hideRemoteCursors,
          lineComments,
        }),
      });
    } catch {
      // Bỏ qua nếu editor vừa unmount
    }
  }, [
    isCollabEditorReady,
    remoteSessions,
    activeTab,
    collabYDoc,
    activeCollabYText,
    highlightInserts,
    hideRemoteCursors,
    lineComments,
  ]);

  // Đẩy hiệu ứng sáng nhẹ khi thành viên khác vừa chèn văn bản (~1 giây)
  useEffect(() => {
    const view = editorViewRef.current;
    if (!view || !isCollabEditorReady || !highlightInserts) return;
    if (!remoteInsertFlashes || remoteInsertFlashes.length === 0) return;

    const fresh = remoteInsertFlashes.filter(
      (f) => f.tab === activeTab && !seenFlashIdsRef.current.has(f.id)
    );
    if (fresh.length === 0) return;

    for (const f of fresh) {
      seenFlashIdsRef.current.add(f.id);
    }
    if (seenFlashIdsRef.current.size > 120) {
      const keep = Array.from(seenFlashIdsRef.current).slice(-60);
      seenFlashIdsRef.current = new Set(keep);
    }

    try {
      view.dispatch({
        effects: addInsertFlashesEffect.of(fresh),
      });
    } catch {
      return;
    }

    const timer = setTimeout(() => {
      const currentView = editorViewRef.current;
      if (!currentView) return;
      try {
        currentView.dispatch({
          effects: pruneExpiredFlashesEffect.of(Date.now()),
        });
      } catch {
        // Editor có thể đã unmount
      }
    }, 1100);

    return () => clearTimeout(timer);
  }, [remoteInsertFlashes, activeTab, isCollabEditorReady, highlightInserts]);

  // Chế độ Theo dõi (Follow mode) & Chuyển đến vị trí của thành viên
  useEffect(() => {
    if (!followingUser) {
      lastFollowedSigRef.current = null;
    }

    const view = editorViewRef.current;
    if (!view || !isCollabEditorReady || !collabYDoc || !activeCollabYText) return;

    const resolveSessionPos = (uid: string, tab: EditorTab): number | null => {
      const matching = remoteSessions
        .filter((s) => s.uid === uid && s.tab === tab && s.cursor?.head)
        .sort((a, b) => b.lastActive - a.lastActive);
      const sess = matching[0];
      if (!sess?.cursor?.head) return null;
      try {
        const rel = Y.createRelativePositionFromJSON(sess.cursor.head);
        const abs = Y.createAbsolutePositionFromRelativePosition(rel, collabYDoc);
        if (!abs || abs.type !== activeCollabYText) return null;
        return Math.max(0, Math.min(abs.index, view.state.doc.length));
      } catch {
        return null;
      }
    };

    if (jumpTarget && jumpTarget.tab === activeTab && jumpTarget.nonce !== lastJumpNonceRef.current) {
      lastJumpNonceRef.current = jumpTarget.nonce;
      const pos = resolveSessionPos(jumpTarget.uid, activeTab) ?? 0;
      try {
        view.dispatch({
          effects: EditorView.scrollIntoView(pos, { y: 'center' }),
        });
      } catch {}
      return;
    }

    if (followingUser && followingUser.tab === activeTab) {
      const pos = resolveSessionPos(followingUser.uid, activeTab);
      if (pos !== null) {
        const sig = `${followingUser.uid}:${activeTab}:${pos}`;
        if (lastFollowedSigRef.current !== sig) {
          lastFollowedSigRef.current = sig;
          try {
            view.dispatch({
              effects: EditorView.scrollIntoView(pos, { y: 'center' }),
            });
          } catch {}
        }
      }
    }
  }, [followingUser, jumpTarget, remoteSessions, activeTab, isCollabEditorReady, collabYDoc, activeCollabYText]);

  const applyCursorJump = useCallback((view: EditorView, line: number, col?: number) => {
    try {
      const safeLine = Math.max(1, Math.min(line, view.state.doc.lines));
      const docLine = view.state.doc.line(safeLine);
      const safeCol = Math.max(1, col ?? 1);
      const pos = Math.min(docLine.from + (safeCol - 1), docLine.to);
      view.dispatch({
        selection: { anchor: pos, head: pos },
        effects: EditorView.scrollIntoView(pos, { y: 'center' }),
      });
      view.focus();
    } catch {
      // Bỏ qua nếu tài liệu vừa thay đổi
    }
  }, []);

  // Nhảy tới đúng tab, dòng và cột khi người dùng bấm vào thông báo lỗi / vấn đề
  useEffect(() => {
    if (!cursorJumpTarget) return;
    if (cursorJumpTarget.tab !== activeTab) return;
    if (cursorJumpTarget.nonce === lastCursorJumpNonceRef.current) return;
    if (isCollabMode && !isCollabEditorReady) return;

    const view = editorViewRef.current;
    if (!view) return;

    lastCursorJumpNonceRef.current = cursorJumpTarget.nonce;
    const rafId = requestAnimationFrame(() => {
      if (editorViewRef.current === view) {
        applyCursorJump(view, cursorJumpTarget.line, cursorJumpTarget.col);
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [cursorJumpTarget, activeTab, isCollabMode, isCollabEditorReady, applyCursorJump]);

  // Làm nổi bật ngắn hạn các dòng được đánh dấu
  useEffect(() => {
    if (!appliedHighlightTarget) return;
    if (appliedHighlightTarget.tab !== activeTab) return;
    if (appliedHighlightTarget.nonce === lastAppliedHighlightNonceRef.current) return;
    if (isCollabMode && !isCollabEditorReady) return;

    const view = editorViewRef.current;
    if (!view) return;

    lastAppliedHighlightNonceRef.current = appliedHighlightTarget.nonce;
    let clearTimer: ReturnType<typeof setTimeout> | null = null;
    const rafId = requestAnimationFrame(() => {
      if (editorViewRef.current !== view) return;
      try {
        view.dispatch({
          effects: jumpHighlightExt.setLinesEffect.of(appliedHighlightTarget.ranges),
        });
        clearTimer = setTimeout(() => {
          if (editorViewRef.current === view) {
            try {
              view.dispatch({
                effects: jumpHighlightExt.setLinesEffect.of([]),
              });
            } catch {}
          }
        }, 2300);
      } catch {}
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [
    appliedHighlightTarget,
    activeTab,
    isCollabMode,
    isCollabEditorReady,
    jumpHighlightExt,
  ]);

  const handleEditorCreated = useCallback(
    (view: EditorView) => {
      editorViewRef.current = view;
      if (isCollabEditorReady && activeCollabYText) {
        try {
          const yStr = activeCollabYText.toString();
          const currentStr = view.state.doc.toString();
          if (currentStr !== yStr) {
            const syncConf = view.state.facet(ySyncFacet);
            view.dispatch({
              changes: { from: 0, to: view.state.doc.length, insert: yStr },
              annotations: [ySyncAnnotation.of(syncConf)],
            });
          }
        } catch {
          // Bỏ qua nếu ySync chưa sẵn sàng
        }
      }
      if (isCollabEditorReady) {
        try {
          view.dispatch({
            effects: updatePresenceStateEffect.of({
              remoteSessions,
              activeTab,
              ydoc: collabYDoc,
              ytext: activeCollabYText,
              highlightInserts,
              hideRemoteCursors,
              lineComments,
            }),
          });
        } catch {}
      }
      if (
        cursorJumpTarget &&
        cursorJumpTarget.tab === activeTab &&
        cursorJumpTarget.nonce !== lastCursorJumpNonceRef.current
      ) {
        lastCursorJumpNonceRef.current = cursorJumpTarget.nonce;
        requestAnimationFrame(() => {
          if (editorViewRef.current === view) {
            applyCursorJump(view, cursorJumpTarget.line, cursorJumpTarget.col);
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCollabEditorReady, activeTab, collabYDoc, activeCollabYText, cursorJumpTarget, applyCursorJump]
  );

  // Current code and change handler (personal mode + stats)
  const currentCode = useMemo(() => {
    switch (activeTab) {
      case 'css':
        return cssCode;
      case 'js':
        return jsCode;
      case 'html':
      default:
        return htmlCode;
    }
  }, [activeTab, htmlCode, cssCode, jsCode]);

  const handleCodeChange = (val: string) => {
    if (isReadOnly || isCollabMode) return;
    switch (activeTab) {
      case 'css':
        onCssChange(val);
        break;
      case 'js':
        onJsChange(val);
        break;
      case 'html':
      default:
        onHtmlChange(val);
        break;
    }
  };

  // Compute stats for current tab
  const stats = useMemo(() => {
    const lines = currentCode.split('\n').length;
    const chars = currentCode.length;
    return { lines, chars };
  }, [currentCode]);

  // Tính toán người dùng đang ở từng tab (HTML / CSS / JS)
  const presenceByTab = useMemo(() => {
    const map: Record<EditorTab, PresenceUser[]> = { html: [], css: [], js: [] };
    if (!isCollabMode || !onlineUsers || onlineUsers.length === 0) return map;
    for (const u of onlineUsers) {
      if (u.uid === currentUserId) continue;
      if (u.tab === 'html' || u.tab === 'css' || u.tab === 'js') {
        map[u.tab].push(u);
      }
    }
    return map;
  }, [isCollabMode, onlineUsers, currentUserId]);

  // Danh sách bình luận cho tab hiện tại, neo lại dòng theo Yjs RelativePosition
  const resolvedTabComments: ResolvedLineCommentItem[] = useMemo(() => {
    if (!isCollabMode || !lineComments || lineComments.length === 0) return [];
    const view = editorViewRef.current;
    const filtered = lineComments.filter((c) => c.tab === activeTab);
    if (!view) {
      return filtered.map((c) => ({ comment: c, resolvedLine: c.lineNumber || 1 }));
    }
    return filtered.map((c) => ({
      comment: c,
      resolvedLine: resolveCommentLineNumber(c, view.state.doc, collabYDoc, activeCollabYText),
    }));
  }, [isCollabMode, lineComments, activeTab, collabYDoc, activeCollabYText, htmlCode, cssCode, jsCode]);

  const openCommentCount = useMemo(
    () => resolvedTabComments.filter((item) => !item.comment.resolved).length,
    [resolvedTabComments]
  );

  const handleOpenHeaderComments = useCallback(() => {
    const view = editorViewRef.current;
    let targetLine = 1;
    if (view) {
      try {
        const pos = view.state.selection.main.head;
        targetLine = view.state.doc.lineAt(pos).number;
      } catch {}
    } else if (resolvedTabComments.length > 0) {
      targetLine = resolvedTabComments[0].resolvedLine;
    }
    setCommentPopover((prev) => (prev ? null : { lineNumber: targetLine, anchorY: null }));
  }, [resolvedTabComments]);

  const handleSelectCommentLine = useCallback((lineNum: number) => {
    setCommentPopover((prev) => ({ lineNumber: lineNum, anchorY: prev?.anchorY ?? null }));
    const view = editorViewRef.current;
    if (!view) return;
    try {
      const safeLine = Math.max(1, Math.min(lineNum, view.state.doc.lines));
      const line = view.state.doc.line(safeLine);
      view.dispatch({
        effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
      });
    } catch {}
  }, []);

  const handleCreateLineComment = useCallback(
    async (lineNumber: number, text: string) => {
      if (!onAddLineComment) return;
      let relPosJson: string | null = null;
      const view = editorViewRef.current;
      if (view && activeCollabYText) {
        try {
          const safeLine = Math.max(1, Math.min(lineNumber, view.state.doc.lines));
          const line = view.state.doc.line(safeLine);
          const relPos = Y.createRelativePositionFromTypeIndex(activeCollabYText, line.from);
          relPosJson = JSON.stringify(Y.relativePositionToJSON(relPos));
        } catch {}
      }
      await onAddLineComment(activeTab, lineNumber, relPosJson, text);
    },
    [onAddLineComment, activeCollabYText, activeTab]
  );

  // Quick-insert & Undo/Redo actions for touch accessory bar (preserves focus / keyboard)
  const handleQuickInsert = useCallback(
    (snippet: string, backOffset = 0) => {
      if (isReadOnly) return;
      const view = editorViewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      const nextCursor = from + snippet.length - backOffset;
      view.dispatch({
        changes: { from, to, insert: snippet },
        selection: { anchor: nextCursor, head: nextCursor },
        scrollIntoView: true,
      });
      view.focus();
    },
    [isReadOnly]
  );

  const handleEditorUndo = useCallback(() => {
    if (isReadOnly) return;
    if (isCollabEditorReady && activeCollabUndoManager) {
      activeCollabUndoManager.undo();
      editorViewRef.current?.focus();
      return;
    }
    const view = editorViewRef.current;
    if (!view) return;
    const bindings = view.state.facet(keymap).flat();
    const undoBinding = bindings.find((b) => b.key === 'Mod-z' && typeof b.run === 'function');
    undoBinding?.run?.(view);
    view.focus();
  }, [isReadOnly, isCollabEditorReady, activeCollabUndoManager]);

  const handleEditorRedo = useCallback(() => {
    if (isReadOnly) return;
    if (isCollabEditorReady && activeCollabUndoManager) {
      activeCollabUndoManager.redo();
      editorViewRef.current?.focus();
      return;
    }
    const view = editorViewRef.current;
    if (!view) return;
    const bindings = view.state.facet(keymap).flat();
    const redoBinding = bindings.find(
      (b) => (b.key === 'Mod-y' || b.key === 'Mod-Shift-z') && typeof b.run === 'function'
    );
    if (redoBinding?.run) {
      redoBinding.run(view);
    } else {
      const modZ = bindings.find((b) => b.key === 'Mod-z' && typeof b.shift === 'function');
      modZ?.shift?.(view);
    }
    view.focus();
  }, [isReadOnly, isCollabEditorReady, activeCollabUndoManager]);

  const quickCodingSymbols = useMemo(() => {
    if (activeTab === 'html') {
      return [
        { label: '<>', insert: '<>', back: 1, aria: 'Chèn cặp dấu ngoặc nhọn' },
        { label: '</>', insert: '</>', back: 0, aria: 'Chèn thẻ đóng' },
        { label: '""', insert: '""', back: 1, aria: 'Chèn dấu ngoặc kép' },
        { label: '=', insert: '=', back: 0, aria: 'Chèn dấu bằng' },
        { label: '/', insert: '/', back: 0, aria: 'Chèn dấu gạch chéo' },
        { label: '<', insert: '<', back: 0, aria: 'Chèn dấu nhỏ hơn' },
        { label: '>', insert: '>', back: 0, aria: 'Chèn dấu lớn hơn' },
        { label: '{}', insert: '{}', back: 1, aria: 'Chèn ngoặc nhọn' },
        { label: '()', insert: '()', back: 1, aria: 'Chèn ngoặc đơn' },
        { label: ';', insert: ';', back: 0, aria: 'Chèn dấu chấm phẩy' },
        { label: ':', insert: ':', back: 0, aria: 'Chèn dấu hai chấm' },
      ];
    }
    if (activeTab === 'css') {
      return [
        { label: '{}', insert: '{}', back: 1, aria: 'Chèn cặp ngoặc nhọn' },
        { label: ':', insert: ': ', back: 0, aria: 'Chèn dấu hai chấm' },
        { label: ';', insert: ';', back: 0, aria: 'Chèn dấu chấm phẩy' },
        { label: '#', insert: '#', back: 0, aria: 'Chèn dấu thăng' },
        { label: '.', insert: '.', back: 0, aria: 'Chèn dấu chấm' },
        { label: '()', insert: '()', back: 1, aria: 'Chèn ngoặc đơn' },
        { label: '""', insert: '""', back: 1, aria: 'Chèn ngoặc kép' },
        { label: '-', insert: '-', back: 0, aria: 'Chèn dấu gạch nối' },
        { label: 'px', insert: 'px', back: 0, aria: 'Chèn đơn vị px' },
        { label: '%', insert: '%', back: 0, aria: 'Chèn phần trăm' },
      ];
    }
    return [
      { label: '()', insert: '()', back: 1, aria: 'Chèn ngoặc đơn' },
      { label: '{}', insert: '{}', back: 1, aria: 'Chèn ngoặc nhọn' },
      { label: '=>', insert: ' => ', back: 0, aria: 'Chèn mũi tên hàm' },
      { label: ';', insert: ';', back: 0, aria: 'Chèn dấu chấm phẩy' },
      { label: '""', insert: '""', back: 1, aria: 'Chèn ngoặc kép' },
      { label: "''", insert: "''", back: 1, aria: 'Chèn ngoặc đơn nháy' },
      { label: '``', insert: '``', back: 1, aria: 'Chèn dấu backtick' },
      { label: '[]', insert: '[]', back: 1, aria: 'Chèn ngoặc vuông' },
      { label: '=', insert: ' = ', back: 0, aria: 'Chèn dấu bằng' },
      { label: '.', insert: '.', back: 0, aria: 'Chèn dấu chấm' },
    ];
  }, [activeTab]);

  const renderTabPresence = (tab: EditorTab) => {
    const usersInTab = presenceByTab[tab];
    if (!usersInTab || usersInTab.length === 0) return null;
    const typingUsers = usersInTab.filter((u) => u.isTyping);
    const visible = usersInTab.slice(0, 3);
    const overflow = usersInTab.length - visible.length;
    const summaryLabel = `${usersInTab.map((u) => u.name).join(', ')} đang ở tab ${tab.toUpperCase()}${
      typingUsers.length > 0 ? ', đang gõ' : ''
    }`;

    return (
      <span
        aria-label={summaryLabel}
        className="inline-flex items-center gap-1 ml-0.5 flex-shrink-0"
      >
        <span className="inline-flex items-center -space-x-1">
          {visible.map((u) => (
            <span
              key={u.uid}
              title={`${u.name}${u.isTyping ? ' (đang gõ...)' : ''}`}
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ring-1 ring-[var(--bg-elevated)] overflow-hidden ${
                u.isIdle ? 'opacity-60' : ''
              }`}
              style={{ backgroundColor: u.color, color: getContrastingText(u.color) }}
            >
              {u.photoURL ? (
                <img
                  src={u.photoURL}
                  alt={u.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                getInitials(u.name).slice(0, 1)
              )}
            </span>
          ))}
          {overflow > 0 && (
            <span className="w-4 h-4 rounded-full bg-panel border border-default text-[8px] font-mono text-primary flex items-center justify-center">
              +{overflow}
            </span>
          )}
        </span>
        {typingUsers.length > 0 && (
          <span
            className="text-[10px] font-normal text-accent italic whitespace-nowrap"
            title={`${typingUsers.map((u) => u.name).join(', ')} đang gõ...`}
          >
            đang gõ...
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden select-none bg-transparent text-primary">
      {/* 3 Tabs Header */}
      <div className="h-11 px-2.5 flex items-center justify-between gap-1.5 border-b border-subtle bg-elevated text-xs">
        {/* Tabs: HTML, CSS, JS */}
        <div className="flex flex-1 items-center touch-gap gap-1 min-w-0 overflow-x-auto no-scrollbar">
          {/* HTML Tab */}
          <button
            type="button"
            onClick={() => onTabChange('html')}
            className={`touch-target-h flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === 'html'
                ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/40 shadow-xs'
                : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
            <span>HTML</span>
            {renderTabPresence('html')}
          </button>

          {/* CSS Tab (if enabled) */}
          {enabledLanguages.includes('css') && (
            <div
              className={`flex items-center group/tab rounded-[var(--radius-sm)] transition-all flex-shrink-0 ${
                activeTab === 'css'
                  ? 'bg-accent-soft border border-[var(--accent-base)]/40 shadow-xs'
                  : 'hover:bg-[var(--border-subtle)]'
              }`}
            >
              <button
                type="button"
                onClick={() => onTabChange('css')}
                className={`touch-target-h flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'css' ? 'text-accent pr-1.5' : 'text-secondary hover:text-primary'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--accent-2)] flex-shrink-0" />
                <span>CSS</span>
                {renderTabPresence('css')}
              </button>
              {onRemoveLanguage && !isReadOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveLanguage('css');
                  }}
                  className={`touch-target-h flex items-center justify-center px-1.5 sm:px-1 mr-0.5 rounded text-muted hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer ${
                    activeTab === 'css' ? 'opacity-80 hover:opacity-100' : 'hidden sm:group-hover/tab:flex opacity-60 hover:opacity-100'
                  }`}
                  title="Ẩn tab CSS"
                  aria-label="Ẩn tab CSS"
                >
                  <X className="w-3 h-3" strokeWidth={1.5} />
                </button>
              )}
            </div>
          )}

          {/* JS Tab (if enabled) */}
          {enabledLanguages.includes('js') && (
            <div
              className={`flex items-center group/tab rounded-[var(--radius-sm)] transition-all flex-shrink-0 ${
                activeTab === 'js'
                  ? 'bg-accent-soft border border-[var(--accent-base)]/40 shadow-xs'
                  : 'hover:bg-[var(--border-subtle)]'
              }`}
            >
              <button
                type="button"
                onClick={() => onTabChange('js')}
                className={`touch-target-h flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'js' ? 'text-accent pr-1.5' : 'text-secondary hover:text-primary'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <span>JS</span>
                {renderTabPresence('js')}
              </button>
              {onRemoveLanguage && !isReadOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveLanguage('js');
                  }}
                  className={`touch-target-h flex items-center justify-center px-1.5 sm:px-1 mr-0.5 rounded text-muted hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer ${
                    activeTab === 'js' ? 'opacity-80 hover:opacity-100' : 'hidden sm:group-hover/tab:flex opacity-60 hover:opacity-100'
                  }`}
                  title="Ẩn tab JavaScript"
                  aria-label="Ẩn tab JavaScript"
                >
                  <X className="w-3 h-3" strokeWidth={1.5} />
                </button>
              )}
            </div>
          )}

          {/* Add missing language button (+) */}
          {!isReadOnly && (!enabledLanguages.includes('css') || !enabledLanguages.includes('js')) && onAddLanguage && (
            <div className="relative flex-shrink-0" ref={addMenuRef}>
              <button
                type="button"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="touch-hit-expand w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-muted hover:text-primary hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
                title={isTouch ? undefined : 'Thêm ngôn ngữ vào dự án (+)'}
                aria-label="Thêm ngôn ngữ vào dự án"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>

              {showAddMenu && (
                <div className="absolute left-0 top-10 z-30 min-w-40 max-w-[calc(100vw-24px)] py-1 bg-elevated border border-default rounded-[var(--radius-sm)] shadow-[var(--shadow-overlay)] text-xs animate-in fade-in zoom-in-95 duration-150">
                  {!enabledLanguages.includes('css') && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddLanguage('css');
                        setShowAddMenu(false);
                      }}
                      className="touch-target-h w-full px-3 py-1.5 text-left text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-2)]" />
                      <span>Thêm CSS</span>
                    </button>
                  )}
                  {!enabledLanguages.includes('js') && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddLanguage('js');
                        setShowAddMenu(false);
                      }}
                      className="touch-target-h w-full px-3 py-1.5 text-left text-secondary hover:text-primary hover:bg-[var(--border-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      <span>Thêm JavaScript</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {isReadOnly && (
            <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded text-[10px] bg-warning-soft text-warning border border-warning font-medium whitespace-nowrap flex-shrink-0">
              <Lock className="w-3 h-3" />
              <span>{readOnlyBadgeText}</span>
            </div>
          )}
        </div>

        {/* Tab Actions & Stats */}
        <div className="flex items-center touch-gap gap-2.5 flex-shrink-0">
          {isCollabMode && onAddLineComment && (
            <button
              type="button"
              onClick={handleOpenHeaderComments}
              aria-expanded={Boolean(commentPopover)}
              aria-label={`Bình luận theo dòng (${openCommentCount} chưa xử lý)`}
              title={isTouch ? undefined : 'Nhấp vào số dòng ở lề trái hoặc bấm nút này để xem / thêm bình luận'}
              className={`touch-target-h flex items-center gap-1 px-2 py-1 rounded-[var(--radius-xs)] text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-base)] focus-visible:outline-none ${
                commentPopover
                  ? 'bg-accent text-accent-on'
                  : openCommentCount > 0
                  ? 'bg-accent-soft text-accent border border-[var(--accent-base)]/30'
                  : 'text-secondary hover:text-primary hover:bg-[var(--border-subtle)]'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span className="hidden sm:inline">Bình luận</span>
              {resolvedTabComments.length > 0 && (
                <span className="font-mono text-[10px] tabular-nums">
                  ({openCommentCount > 0 ? openCommentCount : resolvedTabComments.length})
                </span>
              )}
            </button>
          )}

          {!isReadOnly && onFormatCode && (
            <button
              type="button"
              onClick={onFormatCode}
              className="touch-target-h flex items-center gap-1 px-2 py-1 rounded-[var(--radius-xs)] text-[11px] font-medium text-secondary hover:text-primary hover:bg-[var(--border-subtle)] transition-colors cursor-pointer whitespace-nowrap"
              title={isTouch ? undefined : 'Định dạng thụt lề tab hiện tại'}
              aria-label="Định dạng mã nguồn"
            >
              <AlignLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Định dạng</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-muted whitespace-nowrap">
            <span>{stats.lines} dòng</span>
            <span>•</span>
            <span>{stats.chars} ký tự</span>
          </div>
        </div>
      </div>

      {/* Follow Mode Banner */}
      {isCollabMode && followingUser && (
        <div className="px-3 py-1.5 bg-accent-soft border-b border-[var(--accent-base)]/30 flex items-center justify-between gap-2 text-xs text-primary flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: followingUser.color }}
            />
            <Eye className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate">
              Đang theo dõi <strong className="font-semibold">{followingUser.name}</strong> (Tab{' '}
              {followingUser.tab.toUpperCase()})
            </span>
            <span className="hidden sm:inline text-[11px] text-muted truncate">
              · Nhấp hoặc gõ vào trình soạn thảo để dừng
            </span>
          </div>
          {onStopFollowing && (
            <button
              type="button"
              onClick={onStopFollowing}
              className="touch-target-h px-2 py-0.5 rounded-[var(--radius-xs)] bg-elevated border border-default hover:border-[var(--accent-base)] text-[11px] font-medium text-secondary hover:text-primary transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              Dừng theo dõi
            </button>
          )}
        </div>
      )}

      {/* CodeMirror Editor Area */}
      <div
        className={`flex-1 overflow-hidden relative bg-transparent ${
          isCollabEditorReady ? 'cm-collab-editor' : ''
        }`}
      >
        {isCollabMode && !isCollabEditorReady ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-panel text-secondary text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span>Đang đồng bộ mã nguồn dự án nhóm...</span>
          </div>
        ) : (
          <CodeMirror
            key={editorKey}
            value={isCollabEditorReady ? undefined : currentCode}
            height="100%"
            theme={settings.mode === 'dark' ? 'dark' : 'light'}
            extensions={activeExtensions}
            onCreateEditor={handleEditorCreated}
            onChange={isCollabEditorReady ? undefined : handleCodeChange}
            readOnly={isReadOnly}
            editable={!isReadOnly}
            basicSetup={{
              lineNumbers: settings.editorLineNumbers,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              history: !isCollabEditorReady,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: !isCollabEditorReady,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
              tabSize: 2,
            }}
            className="h-full font-mono"
          />
        )}
      </div>

      {/* Touch / Mobile Quick-Coding Accessory Bar (keeps on-screen keyboard open) */}
      {(isTouch || isMobile) && !isReadOnly && (
        <div
          className="h-11 px-2 border-t border-subtle bg-panel flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0"
          role="toolbar"
          aria-label="Thanh ký tự lập trình nhanh"
        >
          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleEditorUndo}
            aria-label="Hoàn tác"
            className="min-w-[40px] h-9 px-2 rounded-[var(--radius-sm)] bg-elevated border border-default text-secondary active:bg-accent-soft active:text-accent flex items-center justify-center flex-shrink-0 cursor-pointer"
          >
            <Undo2 className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleEditorRedo}
            aria-label="Làm lại"
            className="min-w-[40px] h-9 px-2 rounded-[var(--radius-sm)] bg-elevated border border-default text-secondary active:bg-accent-soft active:text-accent flex items-center justify-center flex-shrink-0 cursor-pointer"
          >
            <Redo2 className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <div className="h-5 w-px bg-[var(--border-default)] mx-0.5 flex-shrink-0" />

          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => handleQuickInsert('  ', 0)}
            aria-label="Thụt lề 2 dấu cách"
            className="h-9 px-2.5 rounded-[var(--radius-sm)] bg-elevated border border-default text-primary font-mono text-xs font-semibold active:bg-accent-soft active:text-accent flex items-center justify-center flex-shrink-0 cursor-pointer"
          >
            Tab
          </button>

          {quickCodingSymbols.map((sym) => (
            <button
              key={sym.label}
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => handleQuickInsert(sym.insert, sym.back)}
              aria-label={sym.aria}
              className="min-w-[38px] h-9 px-2.5 rounded-[var(--radius-sm)] bg-elevated border border-default text-accent font-mono text-sm font-bold active:bg-accent active:text-accent-on flex items-center justify-center flex-shrink-0 cursor-pointer"
            >
              {sym.label}
            </button>
          ))}
        </div>
      )}

      {/* Editor Footer */}
      <div className="editor-status-footer h-6 px-3 flex items-center justify-between border-t border-subtle bg-elevated text-[11px] font-mono text-muted overflow-hidden flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 truncate">
          <span>Tab: {activeTab.toUpperCase()}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Thụt lề: 2 spaces</span>
          <span>•</span>
          <span>{settings.editorFontSize}px</span>
          <span className="sm:hidden">• {stats.lines} dòng</span>
          {isCollabMode && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-secondary">
                Nhấp số dòng để bình luận
              </span>
            </>
          )}
        </div>
        <div className="shortcut-hint flex items-center gap-2 flex-shrink-0">
          <span>Ctrl+S: {isCollabMode ? 'Đồng bộ & Nén' : 'Lưu'} • Ctrl+Enter: Chạy</span>
        </div>
      </div>

      {/* Line Comments Popover (Stage 4) */}
      {isCollabMode && commentPopover && onAddLineComment && onReplyLineComment && onToggleResolveLineComment && onDeleteLineComment && (
        <LineCommentsPopover
          isOpen={Boolean(commentPopover)}
          onClose={() => setCommentPopover(null)}
          activeTab={activeTab}
          selectedLine={commentPopover.lineNumber}
          anchorY={commentPopover.anchorY}
          allTabComments={resolvedTabComments}
          currentUserId={currentUserId}
          projectOwnerId={projectOwnerId}
          onSelectLine={handleSelectCommentLine}
          onAddComment={handleCreateLineComment}
          onReply={onReplyLineComment}
          onToggleResolve={onToggleResolveLineComment}
          onDelete={onDeleteLineComment}
        />
      )}
    </div>
  );
};

