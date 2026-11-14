import {
  Decoration,
  DecorationSet,
  EditorView,
  GutterMarker,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  gutter,
} from '@codemirror/view';
import {
  Annotation,
  Extension,
  Range,
  RangeSet,
  RangeSetBuilder,
  StateEffect,
  StateField,
  Text,
} from '@codemirror/state';
import * as Y from 'yjs';
import {
  CollabLineComment,
  EditorTab,
  PresenceSession,
  RemoteInsertFlash,
} from '../types';
import { hexToTranslucent } from './presenceIdentity';
import { getContrastingText } from './themeEngine';

const LABEL_INACTIVITY_MS = 3000;
const FLASH_DURATION_MS = 1050;
const PRESENCE_RENDER_THROTTLE_MS = 100;

export interface PresenceExtensionInput {
  remoteSessions: PresenceSession[];
  activeTab: EditorTab;
  ydoc: Y.Doc | null;
  ytext: Y.Text | null;
  highlightInserts: boolean;
  hideRemoteCursors: boolean;
  lineComments: CollabLineComment[];
}

export const updatePresenceStateEffect = StateEffect.define<PresenceExtensionInput>();
export const addInsertFlashesEffect = StateEffect.define<RemoteInsertFlash[]>();
export const pruneExpiredFlashesEffect = StateEffect.define<number>();
const presenceLabelTickAnnotation = Annotation.define<number>();
const presenceThrottleFlushAnnotation = Annotation.define<number>();

export function resolveCommentLineNumber(
  comment: CollabLineComment,
  doc: Text,
  ydoc: Y.Doc | null,
  ytext: Y.Text | null
): number {
  if (comment.relPosJson && ydoc && ytext) {
    try {
      const parsed = JSON.parse(comment.relPosJson);
      const rel = Y.createRelativePositionFromJSON(parsed);
      const abs = Y.createAbsolutePositionFromRelativePosition(rel, ydoc);
      if (abs && abs.type === ytext) {
        const safePos = Math.max(0, Math.min(abs.index, doc.length));
        return doc.lineAt(safePos).number;
      }
    } catch {
      // Dự phòng về lineNumber lưu trong Firestore
    }
  }
  return Math.max(1, Math.min(comment.lineNumber || 1, doc.lines));
}

class RemoteCaretWidget extends WidgetType {
  constructor(
    public readonly color: string,
    public readonly name: string,
    public readonly isLabelVisible: boolean,
    public readonly isTopLine: boolean,
    public readonly isTyping: boolean
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement('span');
    wrapper.className = [
      'cm-collab-caret',
      this.isLabelVisible ? 'cm-collab-caret-active' : 'cm-collab-caret-idle',
      this.isTopLine ? 'cm-collab-caret-top' : '',
    ]
      .filter(Boolean)
      .join(' ');
    wrapper.style.borderLeftColor = this.color;
    wrapper.setAttribute('aria-label', `Con trỏ của ${this.name}`);

    const dot = document.createElement('span');
    dot.className = 'cm-collab-caret-dot';
    dot.style.backgroundColor = this.color;
    wrapper.appendChild(dot);

    const label = document.createElement('span');
    label.className = 'cm-collab-caret-label';
    label.style.backgroundColor = this.color;
    label.style.color = getContrastingText(this.color);
    label.textContent = this.isTyping ? `${this.name} · đang gõ...` : this.name;
    wrapper.appendChild(label);

    return wrapper;
  }

  eq(other: RemoteCaretWidget): boolean {
    return (
      other.color === this.color &&
      other.name === this.name &&
      other.isLabelVisible === this.isLabelVisible &&
      other.isTopLine === this.isTopLine &&
      other.isTyping === this.isTyping
    );
  }

  get estimatedHeight(): number {
    return -1;
  }

  ignoreEvent(): boolean {
    return true;
  }
}

class PresenceGutterDotMarker extends GutterMarker {
  constructor(public readonly users: { name: string; color: string }[]) {
    super();
  }

  toDOM(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'cm-collab-gutter-dots';
    const namesText = this.users.map((u) => u.name).join(', ');
    container.title = `Đang ở dòng này: ${namesText}`;
    container.setAttribute('aria-label', `Đang ở dòng này: ${namesText}`);

    const visible = this.users.slice(0, 3);
    for (const u of visible) {
      const dot = document.createElement('span');
      dot.className = 'cm-collab-gutter-dot';
      dot.style.backgroundColor = u.color;
      container.appendChild(dot);
    }
    return container;
  }

  eq(other: PresenceGutterDotMarker): boolean {
    if (this.users.length !== other.users.length) return false;
    for (let i = 0; i < this.users.length; i++) {
      if (
        this.users[i].name !== other.users[i].name ||
        this.users[i].color !== other.users[i].color
      ) {
        return false;
      }
    }
    return true;
  }
}

class CommentGutterMarker extends GutterMarker {
  constructor(
    public readonly lineNumber: number,
    public readonly openCount: number,
    public readonly totalCount: number
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cm-collab-comment-badge ${
      this.openCount > 0 ? 'cm-collab-comment-open' : 'cm-collab-comment-resolved'
    }`;
    const label =
      this.openCount > 0
        ? `Dòng ${this.lineNumber}: ${this.openCount} bình luận chưa xử lý`
        : `Dòng ${this.lineNumber}: ${this.totalCount} bình luận đã xử lý`;
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.textContent = this.openCount > 0 ? String(this.openCount) : '✓';
    return btn;
  }

  eq(other: CommentGutterMarker): boolean {
    return (
      this.lineNumber === other.lineNumber &&
      this.openCount === other.openCount &&
      this.totalCount === other.totalCount
    );
  }
}

interface InternalFlashItem {
  id: string;
  from: number;
  to: number;
  color: string;
  createdAt: number;
}

const presenceInputField = StateField.define<PresenceExtensionInput>({
  create() {
    return {
      remoteSessions: [],
      activeTab: 'html',
      ydoc: null,
      ytext: null,
      highlightInserts: true,
      hideRemoteCursors: false,
      lineComments: [],
    };
  },
  update(value, tr) {
    for (const eff of tr.effects) {
      if (eff.is(updatePresenceStateEffect)) {
        return eff.value;
      }
    }
    return value;
  },
});

const insertFlashField = StateField.define<InternalFlashItem[]>({
  create() {
    return [];
  },
  update(items, tr) {
    const now = Date.now();
    let next = items;

    if (tr.docChanged && next.length > 0) {
      next = next
        .map((item) => {
          const from = tr.changes.mapPos(item.from, 1);
          const to = tr.changes.mapPos(item.to, -1);
          return { ...item, from, to };
        })
        .filter((item) => item.from < item.to && now - item.createdAt < FLASH_DURATION_MS);
    }

    for (const eff of tr.effects) {
      if (eff.is(addInsertFlashesEffect)) {
        const docLen = tr.state.doc.length;
        const additions: InternalFlashItem[] = [];
        for (const f of eff.value) {
          const from = Math.max(0, Math.min(f.from, docLen));
          const to = Math.max(0, Math.min(f.to, docLen));
          if (from < to) {
            additions.push({
              id: f.id,
              from,
              to,
              color: f.color,
              createdAt: f.createdAt,
            });
          }
        }
        if (additions.length > 0) {
          next = [
            ...next.filter((item) => now - item.createdAt < FLASH_DURATION_MS),
            ...additions,
          ].slice(-30);
        }
      } else if (eff.is(pruneExpiredFlashesEffect)) {
        next = next.filter((item) => eff.value - item.createdAt < FLASH_DURATION_MS);
      }
    }

    return next;
  },
  provide(field) {
    return EditorView.decorations.from(field, (items) => {
      if (items.length === 0) return Decoration.none;
      const now = Date.now();
      const decos: Range<Decoration>[] = [];
      for (const item of items) {
        if (now - item.createdAt >= FLASH_DURATION_MS) continue;
        if (item.from < item.to) {
          decos.push(
            Decoration.mark({
              class: 'cm-collab-insert-flash',
              attributes: {
                style: `--collab-flash-bg: ${hexToTranslucent(item.color, 0.28)}`,
              },
            }).range(item.from, item.to)
          );
        }
      }
      return Decoration.set(decos, true);
    });
  },
});

const presenceGutterField = StateField.define<RangeSet<GutterMarker>>({
  create() {
    return RangeSet.empty;
  },
  update(_value, tr) {
    const input = tr.state.field(presenceInputField);
    const { remoteSessions, activeTab, ydoc, ytext, hideRemoteCursors } = input;
    if (hideRemoteCursors || !ydoc || !ytext || remoteSessions.length === 0) {
      return RangeSet.empty;
    }

    const doc = tr.state.doc;
    const docLen = doc.length;
    const lineUsersMap = new Map<number, Map<string, { name: string; color: string }>>();

    for (const sess of remoteSessions) {
      if (sess.tab !== activeTab || !sess.cursor?.head) continue;
      try {
        const relHead = Y.createRelativePositionFromJSON(sess.cursor.head);
        const absHead = Y.createAbsolutePositionFromRelativePosition(relHead, ydoc);
        if (!absHead || absHead.type !== ytext) continue;

        const pos = Math.max(0, Math.min(absHead.index, docLen));
        const line = doc.lineAt(pos);
        let byUid = lineUsersMap.get(line.from);
        if (!byUid) {
          byUid = new Map();
          lineUsersMap.set(line.from, byUid);
        }
        if (!byUid.has(sess.uid)) {
          byUid.set(sess.uid, { name: sess.name, color: sess.color });
        }
      } catch {
        // Bỏ qua vị trí không giải mã được
      }
    }

    if (lineUsersMap.size === 0) {
      return RangeSet.empty;
    }

    const builder = new RangeSetBuilder<GutterMarker>();
    const sortedLineStarts = Array.from(lineUsersMap.keys()).sort((a, b) => a - b);
    for (const lineStart of sortedLineStarts) {
      const users = Array.from(lineUsersMap.get(lineStart)!.values());
      builder.add(lineStart, lineStart, new PresenceGutterDotMarker(users));
    }
    return builder.finish();
  },
});

const commentGutterField = StateField.define<RangeSet<GutterMarker>>({
  create() {
    return RangeSet.empty;
  },
  update(_value, tr) {
    const input = tr.state.field(presenceInputField);
    const { lineComments, activeTab, ydoc, ytext } = input;
    if (!lineComments || lineComments.length === 0) {
      return RangeSet.empty;
    }

    const doc = tr.state.doc;
    const byLineStart = new Map<number, { lineNum: number; openCount: number; totalCount: number }>();

    for (const c of lineComments) {
      if (c.tab !== activeTab) continue;
      const lineNum = resolveCommentLineNumber(c, doc, ydoc, ytext);
      const line = doc.line(lineNum);
      const entry = byLineStart.get(line.from) || {
        lineNum,
        openCount: 0,
        totalCount: 0,
      };
      entry.totalCount += 1;
      if (!c.resolved) {
        entry.openCount += 1;
      }
      byLineStart.set(line.from, entry);
    }

    if (byLineStart.size === 0) {
      return RangeSet.empty;
    }

    const builder = new RangeSetBuilder<GutterMarker>();
    const sortedStarts = Array.from(byLineStart.keys()).sort((a, b) => a - b);
    for (const lineStart of sortedStarts) {
      const entry = byLineStart.get(lineStart)!;
      builder.add(
        lineStart,
        lineStart,
        new CommentGutterMarker(entry.lineNum, entry.openCount, entry.totalCount)
      );
    }
    return builder.finish();
  },
});

function createRemoteCursorsPlugin(
  onLocalCursorChange?: (anchor: number, head: number) => void
) {
  return ViewPlugin.fromClass(
    class {
      public decorations: DecorationSet = Decoration.none;
      private labelActivityMap = new Map<string, { cursorSig: string; activeUntil: number }>();
      private labelFadeTimer: ReturnType<typeof setTimeout> | null = null;
      private renderThrottleTimer: ReturnType<typeof setTimeout> | null = null;
      private lastRenderAt = 0;
      private view: EditorView;

      constructor(view: EditorView) {
        this.view = view;
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate): void {
        if (update.selectionSet || update.docChanged) {
          const sel = update.state.selection.main;
          if (update.view.hasFocus) {
            onLocalCursorChange?.(sel.anchor, sel.head);
          }
        }

        const hasPresenceEffect = update.transactions.some((tr) =>
          tr.effects.some((e) => e.is(updatePresenceStateEffect))
        );
        const hasTickAnnotation = update.transactions.some(
          (tr) => tr.annotation(presenceLabelTickAnnotation) !== undefined
        );
        const hasThrottleFlush = update.transactions.some(
          (tr) => tr.annotation(presenceThrottleFlushAnnotation) !== undefined
        );

        if (update.docChanged || update.viewportChanged || hasTickAnnotation || hasThrottleFlush) {
          this.clearRenderThrottle();
          this.decorations = this.buildDecorations(update.view);
        } else if (hasPresenceEffect) {
          const elapsed = Date.now() - this.lastRenderAt;
          if (elapsed >= PRESENCE_RENDER_THROTTLE_MS) {
            this.clearRenderThrottle();
            this.decorations = this.buildDecorations(update.view);
          } else if (!this.renderThrottleTimer) {
            this.renderThrottleTimer = setTimeout(() => {
              this.renderThrottleTimer = null;
              try {
                this.view.dispatch({
                  annotations: [presenceThrottleFlushAnnotation.of(Date.now())],
                });
              } catch {
                // Editor đã unmount
              }
            }, PRESENCE_RENDER_THROTTLE_MS - elapsed);
          }
        }
      }

      private clearRenderThrottle(): void {
        if (this.renderThrottleTimer) {
          clearTimeout(this.renderThrottleTimer);
          this.renderThrottleTimer = null;
        }
      }

      private buildDecorations(view: EditorView): DecorationSet {
        this.lastRenderAt = Date.now();
        const input = view.state.field(presenceInputField);
        const { remoteSessions, activeTab, ydoc, ytext, hideRemoteCursors } = input;
        if (hideRemoteCursors || !ydoc || !ytext || remoteSessions.length === 0) {
          this.clearFadeTimer();
          return Decoration.none;
        }

        const now = this.lastRenderAt;
        const doc = view.state.doc;
        const docLen = doc.length;
        const decos: Range<Decoration>[] = [];
        const activeSessionIds = new Set<string>();
        let soonestFadeAt = Infinity;

        // Giới hạn tạo line-decoration trong khung nhìn hiện tại để mượt với tệp ~5.000 dòng
        const vpFromLine = doc.lineAt(Math.max(0, Math.min(view.viewport.from, docLen))).number;
        const vpToLine = doc.lineAt(Math.max(0, Math.min(view.viewport.to, docLen))).number;

        for (const sess of remoteSessions) {
          if (sess.tab !== activeTab || !sess.cursor?.anchor || !sess.cursor?.head) continue;
          activeSessionIds.add(sess.sessionId);

          try {
            const relAnchor = Y.createRelativePositionFromJSON(sess.cursor.anchor);
            const relHead = Y.createRelativePositionFromJSON(sess.cursor.head);
            const absAnchor = Y.createAbsolutePositionFromRelativePosition(relAnchor, ydoc);
            const absHead = Y.createAbsolutePositionFromRelativePosition(relHead, ydoc);

            if (!absAnchor || !absHead || absAnchor.type !== ytext || absHead.type !== ytext) {
              continue;
            }

            const anchorIdx = Math.max(0, Math.min(absAnchor.index, docLen));
            const headIdx = Math.max(0, Math.min(absHead.index, docLen));
            const cursorSig = `${anchorIdx}:${headIdx}`;
            const isTyping = sess.typingUntil > now;

            const prevActivity = this.labelActivityMap.get(sess.sessionId);
            let activeUntil = prevActivity?.activeUntil ?? now + LABEL_INACTIVITY_MS;

            if (!prevActivity || prevActivity.cursorSig !== cursorSig || isTyping) {
              activeUntil = Math.max(now + LABEL_INACTIVITY_MS, sess.typingUntil + 1200);
            }
            this.labelActivityMap.set(sess.sessionId, { cursorSig, activeUntil });

            const isLabelVisible = now < activeUntil;
            if (isLabelVisible && activeUntil < soonestFadeAt) {
              soonestFadeAt = activeUntil;
            }

            // 1. Vùng chọn bán trong suốt (Selection highlight)
            if (anchorIdx !== headIdx) {
              const start = Math.min(anchorIdx, headIdx);
              const end = Math.max(anchorIdx, headIdx);
              const startLine = doc.lineAt(start);
              const endLine = doc.lineAt(end);
              const selectionColor = hexToTranslucent(sess.color, 0.22);

              if (startLine.number === endLine.number) {
                decos.push(
                  Decoration.mark({
                    class: 'cm-collab-selection',
                    attributes: { style: `background-color: ${selectionColor}` },
                  }).range(start, end)
                );
              } else {
                if (start < startLine.to) {
                  decos.push(
                    Decoration.mark({
                      class: 'cm-collab-selection',
                      attributes: { style: `background-color: ${selectionColor}` },
                    }).range(start, startLine.to)
                  );
                }
                if (endLine.from < end) {
                  decos.push(
                    Decoration.mark({
                      class: 'cm-collab-selection',
                      attributes: { style: `background-color: ${selectionColor}` },
                    }).range(endLine.from, end)
                  );
                }
                const firstMidLine = Math.max(startLine.number + 1, vpFromLine);
                const lastMidLine = Math.min(endLine.number - 1, vpToLine);
                for (let lineNum = firstMidLine; lineNum <= lastMidLine; lineNum++) {
                  const line = doc.line(lineNum);
                  decos.push(
                    Decoration.line({
                      class: 'cm-collab-line-selection',
                      attributes: { style: `background-color: ${selectionColor}` },
                    }).range(line.from)
                  );
                }
              }
            }

            // 2. Con trỏ mảnh kèm nhãn tên phía trên (tự mờ sau ~3s, hiện lại khi hover hoặc gõ)
            const headLine = doc.lineAt(headIdx);
            const isTopLine = headLine.number === 1;
            decos.push(
              Decoration.widget({
                side: headIdx - anchorIdx > 0 ? -1 : 1,
                block: false,
                widget: new RemoteCaretWidget(
                  sess.color,
                  sess.name,
                  isLabelVisible,
                  isTopLine,
                  isTyping
                ),
              }).range(headIdx)
            );
          } catch {
            // Bỏ qua nếu vị trí tương đối không hợp lệ
          }
        }

        // Dọn cache các session đã rời đi
        for (const cachedSid of Array.from(this.labelActivityMap.keys())) {
          if (!activeSessionIds.has(cachedSid)) {
            this.labelActivityMap.delete(cachedSid);
          }
        }

        this.scheduleFadeTick(soonestFadeAt);
        return Decoration.set(decos, true);
      }

      private clearFadeTimer(): void {
        if (this.labelFadeTimer) {
          clearTimeout(this.labelFadeTimer);
          this.labelFadeTimer = null;
        }
      }

      private scheduleFadeTick(soonestFadeAt: number): void {
        this.clearFadeTimer();
        if (soonestFadeAt === Infinity) return;
        const delay = Math.max(60, soonestFadeAt - Date.now() + 30);
        this.labelFadeTimer = setTimeout(() => {
          this.labelFadeTimer = null;
          try {
            this.view.dispatch({
              annotations: [presenceLabelTickAnnotation.of(Date.now())],
            });
          } catch {
            // Editor có thể đã unmount
          }
        }, delay);
      }

      destroy(): void {
        this.clearFadeTimer();
        this.clearRenderThrottle();
        this.labelActivityMap.clear();
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

export function createCollabPresenceExtension(callbacks: {
  onLocalCursorChange?: (anchor: number, head: number) => void;
  onLocalTyping?: () => void;
  onLocalInteraction?: () => void;
  onCompositionChange?: (isComposing: boolean) => void;
  onLineNumberClick?: (lineNumber: number, clientY: number) => void;
}): Extension {
  const {
    onLocalCursorChange,
    onLocalTyping,
    onLocalInteraction,
    onCompositionChange,
    onLineNumberClick,
  } = callbacks;

  const openLineAtClientY = (view: EditorView, clientY: number) => {
    if (!onLineNumberClick) return;
    try {
      const yOffset = Math.max(0, clientY - view.documentTop);
      const block = view.lineBlockAtHeight(yOffset);
      const line = view.state.doc.lineAt(block.from);
      onLineNumberClick(line.number, clientY);
    } catch {
      // Bỏ qua nếu ngoài vùng dòng
    }
  };

  return [
    presenceInputField,
    insertFlashField,
    presenceGutterField,
    commentGutterField,
    gutter({
      class: 'cm-collab-comment-gutter',
      markers: (view) => view.state.field(commentGutterField),
      domEventHandlers: {
        click: (view, lineBlock, event) => {
          const line = view.state.doc.lineAt(lineBlock.from);
          onLineNumberClick?.(line.number, (event as MouseEvent).clientY);
          return true;
        },
      },
    }),
    gutter({
      class: 'cm-collab-presence-gutter',
      markers: (view) => view.state.field(presenceGutterField),
    }),
    createRemoteCursorsPlugin(onLocalCursorChange),
    EditorView.domEventHandlers({
      mousedown: () => {
        onLocalInteraction?.();
        return false;
      },
      click: (event, view) => {
        const target = event.target as HTMLElement | null;
        if (target && target.closest('.cm-lineNumbers .cm-gutterElement')) {
          openLineAtClientY(view, event.clientY);
          return true;
        }
        return false;
      },
      keydown: (e) => {
        if (
          e.key !== 'Shift' &&
          e.key !== 'Control' &&
          e.key !== 'Alt' &&
          e.key !== 'Meta' &&
          e.key !== 'Escape'
        ) {
          onLocalInteraction?.();
        }
        return false;
      },
      input: () => {
        onLocalTyping?.();
        return false;
      },
      compositionstart: () => {
        onCompositionChange?.(true);
        return false;
      },
      compositionend: () => {
        onCompositionChange?.(false);
        return false;
      },
    }),
  ];
}
