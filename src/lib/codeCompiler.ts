import { EditorTab } from '../types';

export interface SourceRange {
  kind: 'runtime' | 'wrapper' | 'html' | 'css' | 'js';
  docStartLine: number;
  docEndLine: number;
  origStartLine: number;
  firstLineColOffset: number;
}

export interface PreviewSourceMap {
  ranges: SourceRange[];
  totalLines: number;
  htmlLineCount: number;
  cssLineCount: number;
  jsLineCount: number;
}

export interface CompiledPreviewResult {
  srcDoc: string;
  sourceMap: PreviewSourceMap;
}

export interface MappedLocation {
  tab: EditorTab | null;
  line: number | null;
  col: number | null;
  stack: string | null;
  isInternalOrExtension: boolean;
}

const EXTENSION_OR_HOST_PATTERNS = [
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'safari-web-extension://',
  'edge-extension://',
  '/@vite/',
  '/@fs/',
  '/node_modules/',
  '/src/lib/',
  '/src/components/',
];

export function isExtensionOrHostUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = String(url).toLowerCase();
  return EXTENSION_OR_HOST_PATTERNS.some((p) => lower.includes(p));
}

function countLines(text: string): number {
  if (!text) return 0;
  let count = 1;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) count++;
  }
  return count;
}

function buildRuntimeCaptureScript(channelToken: string): string {
  const tokenLiteral = JSON.stringify(channelToken);
  return `<script data-coderlive-runtime="1">
(function() {
  var CHANNEL_TOKEN = ${tokenLiteral};
  var HOST_FILTER = ['chrome-extension://', 'moz-extension://', 'safari-extension://', 'safari-web-extension://', 'edge-extension://', '/@vite/', '/@fs/', '/node_modules/'];

  function isIgnoredSource(src) {
    if (!src) return false;
    var s = String(src).toLowerCase();
    for (var i = 0; i < HOST_FILTER.length; i++) {
      if (s.indexOf(HOST_FILTER[i]) !== -1) return true;
    }
    return false;
  }

  function safeStringify(val, depth) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'bigint') return String(val);
    if (typeof val === 'symbol') return val.toString();
    if (typeof val === 'function') return '[Function ' + (val.name || 'anonymous') + ']';
    if (val instanceof Error) {
      return (val.name || 'Error') + ': ' + (val.message || '');
    }
    if (typeof Element !== 'undefined' && val instanceof Element) {
      return '<' + val.tagName.toLowerCase() + (val.id ? '#' + val.id : '') + '>';
    }
    if ((depth || 0) > 2) return '[Object]';
    try {
      var seen = [];
      return JSON.stringify(val, function(k, v) {
        if (typeof v === 'object' && v !== null) {
          if (seen.indexOf(v) !== -1) return '[Circular]';
          seen.push(v);
        }
        return v;
      });
    } catch (e) {
      try { return String(val); } catch (e2) { return '[Object]'; }
    }
  }

  function formatArgs(args) {
    var parts = [];
    for (var i = 0; i < args.length; i++) {
      parts.push(safeStringify(args[i], 0));
    }
    return parts.join(' ');
  }

  function extractStackFromArgs(args) {
    for (var i = 0; i < args.length; i++) {
      if (args[i] instanceof Error && args[i].stack) {
        return String(args[i].stack);
      }
    }
    try {
      throw new Error();
    } catch (e) {
      return e && e.stack ? String(e.stack) : null;
    }
  }

  function emit(payload) {
    try {
      payload.source = 'coderlive-preview';
      payload.token = CHANNEL_TOKEN;
      payload.time = new Date().toLocaleTimeString('vi-VN');
      window.parent.postMessage(payload, '*');
    } catch (e) {}
  }

  window.onerror = function(msg, url, lineNo, columnNo, error) {
    var stack = error && error.stack ? String(error.stack) : null;
    if (isIgnoredSource(url) || (stack && isIgnoredSource(stack) && (!url || url === 'about:srcdoc'))) {
      return false;
    }
    emit({
      sourceType: 'runtime',
      type: 'error',
      message: error && error.message && typeof msg === 'string' && msg.indexOf('Script error') !== -1
        ? error.message
        : (typeof msg === 'object' ? safeStringify(msg, 0) : String(msg)),
      url: url ? String(url) : '',
      line: lineNo || null,
      col: columnNo || null,
      stack: stack
    });
    return false;
  };

  window.addEventListener('error', function(e) {
    try {
      var target = e && e.target;
      if (!target || target === window || !target.tagName) return;
      var tag = String(target.tagName).toUpperCase();
      if (tag !== 'IMG' && tag !== 'SCRIPT' && tag !== 'LINK') return;
      var rawUrl = '';
      try {
        rawUrl = target.getAttribute('src') || target.getAttribute('href') || target.src || target.href || '';
      } catch (err) {}
      if (isIgnoredSource(rawUrl)) return;
      var label = tag === 'IMG'
        ? 'Không tải được hình ảnh'
        : tag === 'SCRIPT'
        ? 'Không tải được tệp JavaScript'
        : 'Không tải được tài nguyên liên kết (<link>)';
      emit({
        sourceType: 'resource',
        type: 'error',
        message: label + (rawUrl ? ': ' + rawUrl : ''),
        resourceTag: tag,
        resourceUrl: rawUrl,
        line: null,
        col: null,
        stack: null
      });
    } catch (err2) {}
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    var reason = e ? e.reason : null;
    var stack = reason && reason.stack ? String(reason.stack) : null;
    if (stack && isIgnoredSource(stack)) return;
    var reasonText = reason instanceof Error
      ? ((reason.name || 'Error') + ': ' + (reason.message || ''))
      : safeStringify(reason, 0);
    emit({
      sourceType: 'promise',
      type: 'error',
      message: 'Lỗi Promise chưa xử lý: ' + (reasonText || 'Không rõ nguyên nhân'),
      url: '',
      line: null,
      col: null,
      stack: stack
    });
  });

  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;
  var origInfo = console.info;

  console.log = function() {
    if (origLog) origLog.apply(console, arguments);
    emit({ sourceType: 'console', type: 'log', message: formatArgs(arguments), line: null, col: null, stack: null });
  };

  console.info = function() {
    if (origInfo) origInfo.apply(console, arguments);
    emit({ sourceType: 'console', type: 'info', message: formatArgs(arguments), line: null, col: null, stack: null });
  };

  console.warn = function() {
    if (origWarn) origWarn.apply(console, arguments);
    var stack = extractStackFromArgs(arguments);
    emit({ sourceType: 'console', type: 'warn', message: formatArgs(arguments), url: '', line: null, col: null, stack: stack });
  };

  console.error = function() {
    if (origError) origError.apply(console, arguments);
    var stack = extractStackFromArgs(arguments);
    emit({ sourceType: 'console', type: 'error', message: formatArgs(arguments), url: '', line: null, col: null, stack: stack });
  };
})();
</script>`;
}

interface BuildSegment {
  kind: SourceRange['kind'];
  text: string;
  origStartLine: number;
  firstLineColOffset: number;
}

function finalizeSegments(
  segments: BuildSegment[],
  htmlLineCount: number,
  cssLineCount: number,
  jsLineCount: number
): CompiledPreviewResult {
  let srcDoc = '';
  const ranges: SourceRange[] = [];
  let curLine = 1;
  let curColOffset = 0;

  for (const seg of segments) {
    if (!seg.text) continue;
    const startLine = curLine;
    const firstColOffset = curColOffset;

    let newlines = 0;
    let lastNewlineIdx = -1;
    for (let i = 0; i < seg.text.length; i++) {
      if (seg.text.charCodeAt(i) === 10) {
        newlines++;
        lastNewlineIdx = i;
      }
    }

    const endLine = startLine + newlines;
    if (seg.kind === 'html' || seg.kind === 'css' || seg.kind === 'js' || seg.kind === 'runtime') {
      ranges.push({
        kind: seg.kind,
        docStartLine: startLine,
        docEndLine: endLine,
        origStartLine: seg.origStartLine,
        firstLineColOffset: seg.firstLineColOffset || firstColOffset,
      });
    }

    srcDoc += seg.text;
    curLine = endLine;
    if (newlines > 0) {
      curColOffset = seg.text.length - lastNewlineIdx - 1;
    } else {
      curColOffset += seg.text.length;
    }
  }

  return {
    srcDoc,
    sourceMap: {
      ranges,
      totalLines: curLine,
      htmlLineCount,
      cssLineCount,
      jsLineCount,
    },
  };
}

/**
 * Biên dịch mã nguồn HTML/CSS/JS cho sandbox preview iframe kèm bản đồ dòng chính xác
 * và script bắt lỗi runtime, Promise rejection, console.error/warn, lỗi tải tài nguyên.
 */
export function compilePreviewDocument(
  htmlCode: string,
  cssCode: string,
  jsCode: string,
  channelToken: string
): CompiledPreviewResult {
  const rawHtml = htmlCode || '';
  const rawCss = cssCode || '';
  const rawJs = jsCode || '';

  const htmlLineCount = countLines(rawHtml);
  const cssLineCount = countLines(rawCss);
  const jsLineCount = countLines(rawJs);

  const runtimeScript = buildRuntimeCaptureScript(channelToken);
  const hasCss = rawCss.trim().length > 0;
  const hasJs = rawJs.trim().length > 0;

  const isFullHtml = /<html[\s>]|<!doctype/i.test(rawHtml);
  const segments: BuildSegment[] = [];

  const pushCssSegments = () => {
    if (!hasCss) return;
    segments.push({ kind: 'wrapper', text: '\n<style id="coderlive-user-css">\n', origStartLine: 1, firstLineColOffset: 0 });
    segments.push({ kind: 'css', text: rawCss, origStartLine: 1, firstLineColOffset: 0 });
    segments.push({ kind: 'wrapper', text: '\n</style>\n', origStartLine: 1, firstLineColOffset: 0 });
  };

  const pushJsSegments = () => {
    if (!hasJs) return;
    segments.push({ kind: 'wrapper', text: '\n<script id="coderlive-user-js">', origStartLine: 1, firstLineColOffset: 0 });
    segments.push({ kind: 'js', text: rawJs, origStartLine: 1, firstLineColOffset: 0 });
    segments.push({ kind: 'wrapper', text: '\n//# sourceURL=coderlive-tab-js.js\n</script>\n', origStartLine: 1, firstLineColOffset: 0 });
  };

  if (!isFullHtml) {
    segments.push({
      kind: 'wrapper',
      text: '<!DOCTYPE html>\n<html lang="vi">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Coderlive Preview</title>\n',
      origStartLine: 1,
      firstLineColOffset: 0,
    });
    segments.push({ kind: 'runtime', text: runtimeScript, origStartLine: 1, firstLineColOffset: 0 });
    pushCssSegments();
    segments.push({ kind: 'wrapper', text: '\n</head>\n<body>\n', origStartLine: 1, firstLineColOffset: 0 });
    if (rawHtml.length > 0) {
      segments.push({ kind: 'html', text: rawHtml, origStartLine: 1, firstLineColOffset: 0 });
    }
    pushJsSegments();
    segments.push({ kind: 'wrapper', text: '\n</body>\n</html>', origStartLine: 1, firstLineColOffset: 0 });

    return finalizeSegments(segments, htmlLineCount, cssLineCount, jsLineCount);
  }

  // Full HTML document: tính chính xác các điểm chèn trong rawHtml
  type Insertion = { pos: number; order: number; emit: () => void };
  const insertions: Insertion[] = [];

  // 1. Chèn runtime script sớm nhất có thể (ngay sau <head>, hoặc sau <html>, hoặc đầu file)
  const headOpenMatch = rawHtml.match(/<head\b[^>]*>/i);
  const htmlOpenMatch = rawHtml.match(/<html\b[^>]*>/i);
  const doctypeMatch = rawHtml.match(/<!doctype[^>]*>/i);

  let runtimePos = 0;
  if (headOpenMatch && headOpenMatch.index !== undefined) {
    runtimePos = headOpenMatch.index + headOpenMatch[0].length;
  } else if (htmlOpenMatch && htmlOpenMatch.index !== undefined) {
    runtimePos = htmlOpenMatch.index + htmlOpenMatch[0].length;
  } else if (doctypeMatch && doctypeMatch.index !== undefined) {
    runtimePos = doctypeMatch.index + doctypeMatch[0].length;
  }

  insertions.push({
    pos: runtimePos,
    order: 0,
    emit: () => {
      segments.push({ kind: 'wrapper', text: '\n', origStartLine: 1, firstLineColOffset: 0 });
      segments.push({ kind: 'runtime', text: runtimeScript, origStartLine: 1, firstLineColOffset: 0 });
      segments.push({ kind: 'wrapper', text: '\n', origStartLine: 1, firstLineColOffset: 0 });
    },
  });

  // 2. Chèn CSS trước </head>, hoặc sau <head>, hoặc trước <body, hoặc sau runtime
  if (hasCss) {
    const headCloseMatch = rawHtml.match(/<\/head>/i);
    const bodyOpenMatch = rawHtml.match(/<body\b[^>]*>/i);
    let cssPos = runtimePos;
    if (headCloseMatch && headCloseMatch.index !== undefined) {
      cssPos = headCloseMatch.index;
    } else if (headOpenMatch && headOpenMatch.index !== undefined) {
      cssPos = headOpenMatch.index + headOpenMatch[0].length;
    } else if (bodyOpenMatch && bodyOpenMatch.index !== undefined) {
      cssPos = bodyOpenMatch.index;
    }
    insertions.push({
      pos: cssPos,
      order: 1,
      emit: pushCssSegments,
    });
  }

  // 3. Chèn JS trước </body> hoặc cuối tài liệu
  if (hasJs) {
    const bodyCloseMatch = rawHtml.match(/<\/body>/i);
    const jsPos =
      bodyCloseMatch && bodyCloseMatch.index !== undefined ? bodyCloseMatch.index : rawHtml.length;
    insertions.push({
      pos: jsPos,
      order: 2,
      emit: pushJsSegments,
    });
  }

  insertions.sort((a, b) => (a.pos !== b.pos ? a.pos - b.pos : a.order - b.order));

  let cursor = 0;
  let origLine = 1;
  let origColOffset = 0;

  const emitHtmlSlice = (start: number, end: number) => {
    if (end <= start) return;
    const chunk = rawHtml.slice(start, end);
    segments.push({
      kind: 'html',
      text: chunk,
      origStartLine: origLine,
      firstLineColOffset: origColOffset,
    });
    let newlines = 0;
    let lastNl = -1;
    for (let i = 0; i < chunk.length; i++) {
      if (chunk.charCodeAt(i) === 10) {
        newlines++;
        lastNl = i;
      }
    }
    origLine += newlines;
    if (newlines > 0) {
      origColOffset = chunk.length - lastNl - 1;
    } else {
      origColOffset += chunk.length;
    }
  };

  for (const ins of insertions) {
    if (ins.pos > cursor) {
      emitHtmlSlice(cursor, ins.pos);
      cursor = ins.pos;
    }
    ins.emit();
  }
  if (cursor < rawHtml.length) {
    emitHtmlSlice(cursor, rawHtml.length);
  }

  return finalizeSegments(segments, htmlLineCount, cssLineCount, jsLineCount);
}

interface ParsedStackFrame {
  source: string;
  line: number;
  col: number;
}

function parseStackFrames(stack?: string | null): ParsedStackFrame[] {
  if (!stack) return [];
  const frames: ParsedStackFrame[] = [];
  const lines = String(stack).split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // V8: at fn (source:line:col) | at source:line:col
    // Firefox / Safari: fn@source:line:col | source:line:col
    const match =
      line.match(/\(([^()\s]+):(\d+):(\d+)\)$/) ||
      line.match(/(?:at\s+|@)([^\s@()]+):(\d+):(\d+)$/) ||
      line.match(/^([^\s@()]+):(\d+):(\d+)$/);

    if (match) {
      const source = match[1];
      const lineNum = parseInt(match[2], 10);
      const colNum = parseInt(match[3], 10);
      if (!isNaN(lineNum) && lineNum > 0) {
        frames.push({
          source,
          line: lineNum,
          col: isNaN(colNum) || colNum <= 0 ? 1 : colNum,
        });
      }
    }
  }

  return frames;
}

function mapDocLineToTab(
  docLine: number,
  docCol: number,
  sourceMap: PreviewSourceMap
): { kind: SourceRange['kind'] | null; line: number | null; col: number | null } {
  for (const r of sourceMap.ranges) {
    if (docLine >= r.docStartLine && docLine <= r.docEndLine) {
      if (r.kind === 'runtime') {
        return { kind: 'runtime', line: docLine, col: docCol };
      }
      const lineOffset = docLine - r.docStartLine;
      const mappedLine = r.origStartLine + lineOffset;
      const mappedCol =
        lineOffset === 0 && r.firstLineColOffset > 0
          ? Math.max(1, docCol - r.firstLineColOffset)
          : docCol;
      return { kind: r.kind, line: mappedLine, col: mappedCol };
    }
  }
  return { kind: null, line: null, col: null };
}

function findResourceInHtml(
  htmlCode: string,
  resourceTag?: string,
  resourceUrl?: string
): { line: number | null; col: number | null } {
  const lines = (htmlCode || '').split('\n');
  const needle = (resourceUrl || '').trim();

  if (needle) {
    for (let i = 0; i < lines.length; i++) {
      const idx = lines[i].indexOf(needle);
      if (idx !== -1) {
        return { line: i + 1, col: idx + 1 };
      }
    }
  }

  if (resourceTag) {
    const tagRegex = new RegExp(`<${resourceTag}\\b`, 'i');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(tagRegex);
      if (m && m.index !== undefined) {
        return { line: i + 1, col: m.index + 1 };
      }
    }
  }

  return { line: null, col: null };
}

function sanitizeStackForDisplay(
  stack: string | null | undefined,
  sourceMap: PreviewSourceMap
): string | null {
  if (!stack) return null;
  const kept = String(stack)
    .split('\n')
    .filter((ln) => {
      if (isExtensionOrHostUrl(ln)) return false;
      const frames = parseStackFrames(ln);
      if (frames.length > 0) {
        const f = frames[0];
        if (!f.source.includes('coderlive-tab-js.js')) {
          const mapped = mapDocLineToTab(f.line, f.col, sourceMap);
          if (mapped.kind === 'runtime') return false;
        }
      }
      return true;
    });
  const text = kept.join('\n').trim();
  return text || null;
}

/**
 * Ánh xạ thông tin lỗi/cảnh báo từ iframe preview về đúng Tab (html/css/js), Dòng và Cột trong editor.
 */
export function mapPreviewLocationToTab(
  params: {
    sourceType?: string;
    url?: string;
    line?: number | null;
    col?: number | null;
    stack?: string | null;
    resourceTag?: string;
    resourceUrl?: string;
  },
  sourceMap: PreviewSourceMap,
  htmlCode: string,
  cssCode: string,
  jsCode: string
): MappedLocation {
  const { sourceType, url, line, col, stack, resourceTag, resourceUrl } = params;

  if (isExtensionOrHostUrl(url)) {
    return { tab: null, line: null, col: null, stack: null, isInternalOrExtension: true };
  }

  if (sourceType === 'resource') {
    const loc = findResourceInHtml(htmlCode, resourceTag, resourceUrl);
    return {
      tab: loc.line ? 'html' : null,
      line: loc.line,
      col: loc.col,
      stack: null,
      isInternalOrExtension: false,
    };
  }

  const jsMax = Math.max(1, countLines(jsCode));
  const htmlMax = Math.max(1, countLines(htmlCode));
  const cssMax = Math.max(1, countLines(cssCode));

  // 1. Nếu URL trực tiếp là sourceURL của JS tab
  if (url && url.includes('coderlive-tab-js.js') && line && line > 0) {
    const mappedLine = Math.min(jsMax, Math.max(1, line));
    return {
      tab: 'js',
      line: mappedLine,
      col: col && col > 0 ? col : 1,
      stack: sanitizeStackForDisplay(stack, sourceMap),
      isInternalOrExtension: false,
    };
  }

  // 2. Thử phân tích theo frames trong stack (ưu tiên frame đầu tiên thuộc mã người dùng)
  const frames = parseStackFrames(stack);
  for (const frame of frames) {
    if (isExtensionOrHostUrl(frame.source)) continue;

    if (frame.source.includes('coderlive-tab-js.js')) {
      const mappedLine = Math.min(jsMax, Math.max(1, frame.line));
      return {
        tab: 'js',
        line: mappedLine,
        col: frame.col,
        stack: sanitizeStackForDisplay(stack, sourceMap),
        isInternalOrExtension: false,
      };
    }

    const mapped = mapDocLineToTab(frame.line, frame.col, sourceMap);
    if (mapped.kind === 'runtime') continue;
    if (mapped.kind === 'js' && mapped.line) {
      return {
        tab: 'js',
        line: Math.min(jsMax, Math.max(1, mapped.line)),
        col: mapped.col ?? 1,
        stack: sanitizeStackForDisplay(stack, sourceMap),
        isInternalOrExtension: false,
      };
    }
    if (mapped.kind === 'html' && mapped.line) {
      return {
        tab: 'html',
        line: Math.min(htmlMax, Math.max(1, mapped.line)),
        col: mapped.col ?? 1,
        stack: sanitizeStackForDisplay(stack, sourceMap),
        isInternalOrExtension: false,
      };
    }
    if (mapped.kind === 'css' && mapped.line) {
      return {
        tab: 'css',
        line: Math.min(cssMax, Math.max(1, mapped.line)),
        col: mapped.col ?? 1,
        stack: sanitizeStackForDisplay(stack, sourceMap),
        isInternalOrExtension: false,
      };
    }
  }

  // 3. Nếu có line từ window.onerror (ví dụ SyntaxError trên about:srcdoc)
  if (line && line > 0) {
    const colNum = col && col > 0 ? col : 1;
    const mapped = mapDocLineToTab(line, colNum, sourceMap);
    if (mapped.kind === 'runtime') {
      return { tab: null, line: null, col: null, stack: null, isInternalOrExtension: true };
    }
    if (mapped.kind === 'js' && mapped.line) {
      return {
        tab: 'js',
        line: Math.min(jsMax, Math.max(1, mapped.line)),
        col: mapped.col ?? 1,
        stack: sanitizeStackForDisplay(stack, sourceMap),
        isInternalOrExtension: false,
      };
    }
    if (mapped.kind === 'html' && mapped.line) {
      return {
        tab: 'html',
        line: Math.min(htmlMax, Math.max(1, mapped.line)),
        col: mapped.col ?? 1,
        stack: sanitizeStackForDisplay(stack, sourceMap),
        isInternalOrExtension: false,
      };
    }
    if (mapped.kind === 'css' && mapped.line) {
      return {
        tab: 'css',
        line: Math.min(cssMax, Math.max(1, mapped.line)),
        col: mapped.col ?? 1,
        stack: sanitizeStackForDisplay(stack, sourceMap),
        isInternalOrExtension: false,
      };
    }
  }

  return {
    tab: null,
    line: null,
    col: null,
    stack: sanitizeStackForDisplay(stack, sourceMap),
    isInternalOrExtension: false,
  };
}

/**
 * Kết hợp 3 phần HTML, CSS, JS thành một tài liệu HTML hoàn chỉnh sạch
 * dùng để tải tệp .html/.htm (không chèn script bắt lỗi nội bộ).
 */
export function combineCode(htmlCode: string, cssCode: string, jsCode: string): string {
  const trimmedHtml = (htmlCode || '').trim();
  const trimmedCss = (cssCode || '').trim();
  const trimmedJs = (jsCode || '').trim();

  const styleTag = trimmedCss ? `\n  <style>\n${trimmedCss}\n  </style>` : '';
  const scriptTag = trimmedJs ? `\n  <script>\n${trimmedJs}\n  </script>` : '';

  // Nếu người dùng đã tự viết cấu trúc <html> đầy đủ trong tab HTML
  if (trimmedHtml.includes('<html') || trimmedHtml.includes('<!DOCTYPE')) {
    let result = trimmedHtml;

    // Chèn CSS vào cuối <head> nếu có
    if (styleTag) {
      if (result.includes('</head>')) {
        result = result.replace('</head>', `${styleTag}\n</head>`);
      } else if (result.includes('<head>')) {
        result = result.replace('<head>', `<head>${styleTag}`);
      } else if (result.includes('<body')) {
        result = result.replace('<body', `${styleTag}\n<body`);
      } else {
        result = `${styleTag}\n${result}`;
      }
    }

    // Chèn JS vào cuối <body> nếu có
    if (scriptTag) {
      if (result.includes('</body>')) {
        result = result.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        result = `${result}\n${scriptTag}`;
      }
    }

    return result;
  }

  // Cấu trúc chuẩn bao bọc fragment
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coderlive Preview</title>${styleTag}
</head>
<body>
${trimmedHtml || ''}
${scriptTag}
</body>
</html>`;
}

/**
 * Tự động di chuyển (migrate) dự án cũ chỉ có 1 trường htmlCode sang cấu trúc 3 tab
 */
export function migrateProjectCode(data: {
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  code?: string;
}): { htmlCode: string; cssCode: string; jsCode: string } {
  // Nếu đã có cssCode hoặc jsCode thì dùng luôn
  if (data.cssCode !== undefined || data.jsCode !== undefined) {
    return {
      htmlCode: data.htmlCode || '',
      cssCode: data.cssCode || '',
      jsCode: data.jsCode || '',
    };
  }

  // Trường hợp dự án cũ chỉ có htmlCode hoặc code gộp
  const legacyCombined = data.htmlCode || data.code || '';
  return {
    htmlCode: legacyCombined,
    cssCode: '',
    jsCode: '',
  };
}
