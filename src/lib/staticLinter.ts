import { StaticIssue } from '../types';

const HTML_VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

// Danh sách thuộc tính HTML chuẩn (global + element-specific phổ biến)
const VALID_HTML_ATTRIBUTES = new Set([
  // Global HTML attributes
  'accesskey',
  'autocapitalize',
  'autocorrect',
  'autofocus',
  'class',
  'contenteditable',
  'dir',
  'draggable',
  'enterkeyhint',
  'exportparts',
  'hidden',
  'id',
  'inert',
  'inputmode',
  'is',
  'itemid',
  'itemprop',
  'itemref',
  'itemscope',
  'itemtype',
  'lang',
  'nonce',
  'part',
  'popover',
  'popovertarget',
  'popovertargetaction',
  'role',
  'slot',
  'spellcheck',
  'style',
  'tabindex',
  'title',
  'translate',
  'virtualkeyboardpolicy',
  'writingsuggestions',
  // Common element-specific attributes
  'accept',
  'accept-charset',
  'action',
  'allow',
  'allowfullscreen',
  'alt',
  'as',
  'async',
  'autocomplete',
  'autoplay',
  'capture',
  'charset',
  'checked',
  'cite',
  'cols',
  'colspan',
  'content',
  'controls',
  'controlslist',
  'coords',
  'crossorigin',
  'data',
  'datetime',
  'decoding',
  'default',
  'defer',
  'dirname',
  'disabled',
  'download',
  'enctype',
  'fetchpriority',
  'for',
  'form',
  'formaction',
  'formenctype',
  'formmethod',
  'formnovalidate',
  'formtarget',
  'headers',
  'height',
  'high',
  'href',
  'hreflang',
  'http-equiv',
  'imagesizes',
  'imagesrcset',
  'integrity',
  'ismap',
  'kind',
  'label',
  'list',
  'loading',
  'loop',
  'low',
  'max',
  'maxlength',
  'media',
  'method',
  'min',
  'minlength',
  'multiple',
  'muted',
  'name',
  'nomodule',
  'novalidate',
  'open',
  'optimum',
  'pattern',
  'ping',
  'placeholder',
  'playsinline',
  'poster',
  'preload',
  'property',
  'readonly',
  'referrerpolicy',
  'rel',
  'required',
  'reversed',
  'rows',
  'rowspan',
  'sandbox',
  'scope',
  'selected',
  'shadowrootmode',
  'shape',
  'size',
  'sizes',
  'span',
  'src',
  'srcdoc',
  'srclang',
  'srcset',
  'start',
  'step',
  'target',
  'type',
  'usemap',
  'value',
  'width',
  'wrap',
  'xmlns',
  // Legacy / benign attributes still common in tutorials
  'align',
  'bgcolor',
  'border',
  'cellpadding',
  'cellspacing',
  'frameborder',
  'scrolling',
  'valign',
]);

const KNOWN_CSS_AT_DESCRIPTORS = new Set([
  'src',
  'font-display',
  'unicode-range',
  'font-stretch',
  'syntax',
  'inherits',
  'initial-value',
  'size',
  'page-orientation',
]);

function buildLineStarts(text: string): number[] {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      starts.push(i + 1);
    }
  }
  return starts;
}

function offsetToLineCol(lineStarts: number[], offset: number): { line: number; col: number } {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lineStarts[mid] <= offset) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  const lineIdx = Math.max(0, hi);
  return {
    line: lineIdx + 1,
    col: Math.max(1, offset - lineStarts[lineIdx] + 1),
  };
}

function getLineSnippet(lines: string[], line: number): string {
  const idx = line - 1;
  if (idx < 0 || idx >= lines.length) return '';
  return lines[idx].trim().slice(0, 120);
}

function isValidHtmlAttrName(attrName: string): boolean {
  const lower = attrName.toLowerCase();
  if (lower.startsWith('data-') || lower.startsWith('aria-') || lower.startsWith('on')) {
    return lower.length > 2;
  }
  return VALID_HTML_ATTRIBUTES.has(lower);
}

interface ScannedAttr {
  name: string;
  value: string | null;
  offset: number;
}

function parseAttributesFromTag(
  source: string,
  attrStartOffset: number,
  attrEndOffset: number
): ScannedAttr[] {
  const attrs: ScannedAttr[] = [];
  let i = attrStartOffset;

  while (i < attrEndOffset) {
    // Bỏ qua khoảng trắng và '/'
    while (i < attrEndOffset && /[\s/]/.test(source[i])) i++;
    if (i >= attrEndOffset) break;

    const nameStart = i;
    while (i < attrEndOffset && !/[\s=/>]/.test(source[i])) i++;
    const name = source.slice(nameStart, i);
    if (!name) {
      i++;
      continue;
    }

    while (i < attrEndOffset && /\s/.test(source[i])) i++;

    let value: string | null = null;
    if (i < attrEndOffset && source[i] === '=') {
      i++;
      while (i < attrEndOffset && /\s/.test(source[i])) i++;
      if (i < attrEndOffset) {
        const quote = source[i];
        if (quote === '"' || quote === "'") {
          i++;
          const valStart = i;
          while (i < attrEndOffset && source[i] !== quote) i++;
          value = source.slice(valStart, i);
          if (i < attrEndOffset && source[i] === quote) i++;
        } else {
          const valStart = i;
          while (i < attrEndOffset && !/[\s>]/.test(source[i])) i++;
          value = source.slice(valStart, i);
        }
      }
    }

    attrs.push({ name, value, offset: nameStart });
  }

  return attrs;
}

/**
 * Kiểm tra tĩnh HTML bằng DOMParser + bộ quét cấu trúc thẻ để phát hiện lỗi thẻ đóng/lồng nhau,
 * trùng id, thiếu alt trên <img>, và thuộc tính HTML không hợp lệ.
 */
export function lintHtmlCode(htmlCode: string): StaticIssue[] {
  const source = htmlCode || '';
  if (!source.trim()) return [];

  const issues: StaticIssue[] = [];
  const lines = source.split('\n');
  const lineStarts = buildLineStarts(source);

  const idOccurrences = new Map<string, Array<{ line: number; col: number }>>();
  const tagStack: Array<{ tag: string; line: number; col: number }> = [];
  let insideForeignNamespaceDepth = 0;

  let i = 0;
  const n = source.length;

  while (i < n) {
    if (source[i] !== '<') {
      i++;
      continue;
    }

    // HTML comment <!-- ... -->
    if (source.startsWith('<!--', i)) {
      const closeIdx = source.indexOf('-->', i + 4);
      if (closeIdx === -1) {
        const loc = offsetToLineCol(lineStarts, i);
        issues.push({
          id: `html-unclosed-comment-${loc.line}-${loc.col}`,
          severity: 'warn',
          category: 'html',
          tab: 'html',
          line: loc.line,
          col: loc.col,
          message: 'Chú thích HTML <!-- chưa được đóng bằng -->.',
          codeSnippet: getLineSnippet(lines, loc.line),
          ruleId: 'html-unclosed-comment',
        });
        break;
      }
      i = closeIdx + 3;
      continue;
    }

    // <!DOCTYPE ...> hoặc <![CDATA[...]]>
    if (source[i + 1] === '!' || source[i + 1] === '?') {
      const gt = source.indexOf('>', i + 2);
      if (gt === -1) break;
      i = gt + 1;
      continue;
    }

    // Closing tag </tag>
    if (source[i + 1] === '/') {
      const tagStart = i + 2;
      let j = tagStart;
      while (j < n && /[a-zA-Z0-9:-]/.test(source[j])) j++;
      const tagName = source.slice(tagStart, j).toLowerCase();
      const gt = source.indexOf('>', j);
      const loc = offsetToLineCol(lineStarts, i);

      if (tagName) {
        if (tagName === 'svg' || tagName === 'math') {
          insideForeignNamespaceDepth = Math.max(0, insideForeignNamespaceDepth - 1);
        }

        if (!HTML_VOID_TAGS.has(tagName)) {
          const top = tagStack[tagStack.length - 1];
          if (!top) {
            issues.push({
              id: `html-extra-close-${tagName}-${loc.line}-${loc.col}`,
              severity: 'warn',
              category: 'html',
              tab: 'html',
              line: loc.line,
              col: loc.col,
              message: `Thẻ đóng </${tagName}> bị thừa (không tìm thấy thẻ mở <${tagName}> tương ứng).`,
              codeSnippet: getLineSnippet(lines, loc.line),
              ruleId: 'html-extra-closing-tag',
            });
          } else if (top.tag === tagName) {
            tagStack.pop();
          } else {
            // Tìm trong stack xem có thẻ mở phù hợp ở dưới không
            let matchIdx = -1;
            for (let k = tagStack.length - 1; k >= 0; k--) {
              if (tagStack[k].tag === tagName) {
                matchIdx = k;
                break;
              }
            }
            if (matchIdx === -1) {
              issues.push({
                id: `html-mismatch-close-${tagName}-${loc.line}-${loc.col}`,
                severity: 'warn',
                category: 'html',
                tab: 'html',
                line: loc.line,
                col: loc.col,
                message: `Thẻ đóng </${tagName}> không khớp (thẻ gần nhất đang mở là <${top.tag}> ở dòng ${top.line}).`,
                codeSnippet: getLineSnippet(lines, loc.line),
                ruleId: 'html-mismatched-tag',
              });
            } else {
              // Báo cáo các thẻ nằm phía trên chưa được đóng
              while (tagStack.length - 1 > matchIdx) {
                const unclosed = tagStack.pop()!;
                issues.push({
                  id: `html-unclosed-nested-${unclosed.tag}-${unclosed.line}-${unclosed.col}`,
                  severity: 'warn',
                  category: 'html',
                  tab: 'html',
                  line: unclosed.line,
                  col: unclosed.col,
                  message: `Thẻ <${unclosed.tag}> (dòng ${unclosed.line}) chưa được đóng trước khi đóng </${tagName}>.`,
                  codeSnippet: getLineSnippet(lines, unclosed.line),
                  ruleId: 'html-unclosed-tag',
                });
              }
              tagStack.pop();
            }
          }
        }
      }

      if (gt === -1) {
        issues.push({
          id: `html-unterminated-close-${loc.line}-${loc.col}`,
          severity: 'warn',
          category: 'html',
          tab: 'html',
          line: loc.line,
          col: loc.col,
          message: `Thẻ đóng </${tagName || '...'}> bị thiếu dấu '>'.`,
          codeSnippet: getLineSnippet(lines, loc.line),
          ruleId: 'html-malformed-tag',
        });
        break;
      }
      i = gt + 1;
      continue;
    }

    // Opening tag <tag ...>
    if (i + 1 < n && /[a-zA-Z]/.test(source[i + 1])) {
      const tagStart = i + 1;
      let j = tagStart;
      while (j < n && /[a-zA-Z0-9:-]/.test(source[j])) j++;
      const tagName = source.slice(tagStart, j).toLowerCase();
      const loc = offsetToLineCol(lineStarts, i);

      // Tìm dấu '>' kết thúc thẻ mở (tôn trọng chuỗi "..." và '...')
      let k = j;
      let quote: string | null = null;
      while (k < n) {
        const ch = source[k];
        if (quote) {
          if (ch === quote) quote = null;
        } else if (ch === '"' || ch === "'") {
          quote = ch;
        } else if (ch === '>') {
          break;
        }
        k++;
      }

      if (k >= n) {
        issues.push({
          id: `html-unterminated-open-${tagName}-${loc.line}-${loc.col}`,
          severity: 'warn',
          category: 'html',
          tab: 'html',
          line: loc.line,
          col: loc.col,
          message: `Thẻ mở <${tagName} bị thiếu dấu '>' đóng thẻ.`,
          codeSnippet: getLineSnippet(lines, loc.line),
          ruleId: 'html-malformed-tag',
        });
        break;
      }

      const selfClosing = source[k - 1] === '/';
      const isVoid = HTML_VOID_TAGS.has(tagName);
      const isCustomElement = tagName.includes('-');
      const isForeign = tagName === 'svg' || tagName === 'math' || insideForeignNamespaceDepth > 0;

      if (tagName === 'svg' || tagName === 'math') {
        if (!selfClosing) insideForeignNamespaceDepth++;
      }

      // Kiểm tra thuộc tính bên trong thẻ
      const attrs = parseAttributesFromTag(source, j, k);
      let hasAlt = false;

      for (const attr of attrs) {
        const lowerAttr = attr.name.toLowerCase();
        if (lowerAttr === 'alt') hasAlt = true;

        if (lowerAttr === 'id' && attr.value && attr.value.trim()) {
          const idVal = attr.value.trim();
          const attrLoc = offsetToLineCol(lineStarts, attr.offset);
          const list = idOccurrences.get(idVal) || [];
          list.push(attrLoc);
          idOccurrences.set(idVal, list);
        }

        if (!isForeign && !isCustomElement && !isValidHtmlAttrName(attr.name)) {
          const attrLoc = offsetToLineCol(lineStarts, attr.offset);
          issues.push({
            id: `html-unknown-attr-${attr.name}-${attrLoc.line}-${attrLoc.col}`,
            severity: 'warn',
            category: 'html',
            tab: 'html',
            line: attrLoc.line,
            col: attrLoc.col,
            message: `Thuộc tính HTML "${attr.name}" trên thẻ <${tagName}> không hợp lệ hoặc có thể bị gõ sai chính tả.`,
            codeSnippet: getLineSnippet(lines, attrLoc.line),
            ruleId: 'html-unknown-attribute',
          });
        }
      }

      if (tagName === 'img' && !hasAlt) {
        issues.push({
          id: `html-img-missing-alt-${loc.line}-${loc.col}`,
          severity: 'warn',
          category: 'html',
          tab: 'html',
          line: loc.line,
          col: loc.col,
          message: 'Thẻ <img> thiếu thuộc tính alt (mô tả ảnh cho người dùng và trình đọc màn hình).',
          codeSnippet: getLineSnippet(lines, loc.line),
          ruleId: 'html-img-alt',
        });
      }

      if (!isVoid && !selfClosing) {
        tagStack.push({ tag: tagName, line: loc.line, col: loc.col });
      }

      // Bỏ qua nội dung raw text bên trong <script> và <style> để tránh bắt nhầm `<` trong JS/CSS
      if ((tagName === 'script' || tagName === 'style') && !selfClosing) {
        const restLower = source.slice(k + 1).toLowerCase();
        const closeTag = `</${tagName}`;
        const closeRelIdx = restLower.indexOf(closeTag);
        if (closeRelIdx !== -1) {
          i = k + 1 + closeRelIdx;
          continue;
        }
      }

      i = k + 1;
      continue;
    }

    i++;
  }

  // Các thẻ mở chưa đóng ở cuối file
  for (let s = tagStack.length - 1; s >= 0; s--) {
    const unclosed = tagStack[s];
    issues.push({
      id: `html-unclosed-eof-${unclosed.tag}-${unclosed.line}-${unclosed.col}`,
      severity: 'warn',
      category: 'html',
      tab: 'html',
      line: unclosed.line,
      col: unclosed.col,
      message: `Thẻ <${unclosed.tag}> (dòng ${unclosed.line}) chưa có thẻ đóng </${unclosed.tag}>.`,
      codeSnippet: getLineSnippet(lines, unclosed.line),
      ruleId: 'html-unclosed-tag',
    });
  }

  // Dùng DOMParser để xác nhận lại id trùng & ảnh thiếu alt nếu parser DOM thấy thêm trường hợp đặc biệt
  try {
    if (typeof DOMParser !== 'undefined') {
      const doc = new DOMParser().parseFromString(source, 'text/html');
      doc.querySelectorAll('[id]').forEach((el) => {
        const val = el.getAttribute('id')?.trim();
        if (!val) return;
        const list = idOccurrences.get(val);
        if (!list) {
          idOccurrences.set(val, [{ line: 1, col: 1 }]);
        }
      });
    }
  } catch {}

  idOccurrences.forEach((locs, idVal) => {
    if (locs.length > 1) {
      const firstLine = locs[0].line;
      for (let idx = 1; idx < locs.length; idx++) {
        const dup = locs[idx];
        issues.push({
          id: `html-dup-id-${idVal}-${dup.line}-${dup.col}`,
          severity: 'warn',
          category: 'html',
          tab: 'html',
          line: dup.line,
          col: dup.col,
          message: `Trùng lặp id="${idVal}" (đã xuất hiện ở dòng ${firstLine}; mỗi id trong trang nên là duy nhất).`,
          codeSnippet: getLineSnippet(lines, dup.line),
          ruleId: 'html-duplicate-id',
        });
      }
    }
  });

  return issues;
}

function isCssPropertySupported(prop: string): boolean {
  if (!prop) return false;
  if (prop.startsWith('--')) return true;
  const lower = prop.toLowerCase();
  if (KNOWN_CSS_AT_DESCRIPTORS.has(lower)) return true;

  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    if (
      CSS.supports(lower, 'initial') ||
      CSS.supports(lower, 'inherit') ||
      CSS.supports(lower, 'unset') ||
      CSS.supports(lower, 'revert')
    ) {
      return true;
    }
  }

  if (typeof document !== 'undefined') {
    const style = document.documentElement?.style;
    if (style) {
      const camel = lower.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
      if (lower in style || camel in style) return true;
    }
  }

  return false;
}

function isCssDeclarationValueValid(prop: string, rawVal: string): boolean {
  if (prop.startsWith('--')) return true;
  const lowerProp = prop.toLowerCase();
  if (KNOWN_CSS_AT_DESCRIPTORS.has(lowerProp)) return true;

  const cleanedVal = rawVal.replace(/!\s*important\s*$/i, '').trim();
  if (!cleanedVal) return false;

  // Cho phép các hàm động / biến CSS mà CSS.supports không đánh giá ngữ cảnh runtime được
  if (/(?:var|env|calc|min|max|clamp|attr)\s*\(/i.test(cleanedVal)) {
    return true;
  }

  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    return CSS.supports(lowerProp, cleanedVal);
  }

  return true;
}

/**
 * Kiểm tra tĩnh CSS bằng CSS.supports / CSSStyleSheet và bộ phân tích ngoặc/dấu chấm phẩy.
 */
export function lintCssCode(cssCode: string): StaticIssue[] {
  const source = cssCode || '';
  if (!source.trim()) return [];

  const issues: StaticIssue[] = [];
  const lines = source.split('\n');
  const lineStarts = buildLineStarts(source);

  // Tạo bản sao xóa comment & giữ nguyên chỉ mục ký tự (thay nội dung comment bằng khoảng trắng/newline)
  const chars = source.split('');
  const n = source.length;
  let i = 0;

  while (i < n) {
    if (source[i] === '/' && source[i + 1] === '*') {
      const start = i;
      chars[i] = ' ';
      chars[i + 1] = ' ';
      i += 2;
      let closed = false;
      while (i < n) {
        if (source[i] === '*' && source[i + 1] === '/') {
          chars[i] = ' ';
          chars[i + 1] = ' ';
          i += 2;
          closed = true;
          break;
        }
        if (chars[i] !== '\n') chars[i] = ' ';
        i++;
      }
      if (!closed) {
        const loc = offsetToLineCol(lineStarts, start);
        issues.push({
          id: `css-unclosed-comment-${loc.line}-${loc.col}`,
          severity: 'warn',
          category: 'css',
          tab: 'css',
          line: loc.line,
          col: loc.col,
          message: 'Chú thích CSS /* chưa được đóng bằng */.',
          codeSnippet: getLineSnippet(lines, loc.line),
          ruleId: 'css-unclosed-comment',
        });
      }
      continue;
    }

    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i];
      const strStart = i;
      i++;
      let closed = false;
      while (i < n) {
        if (source[i] === '\\') {
          i += 2;
          continue;
        }
        if (source[i] === '\n') {
          break;
        }
        if (source[i] === quote) {
          closed = true;
          i++;
          break;
        }
        i++;
      }
      if (!closed) {
        const loc = offsetToLineCol(lineStarts, strStart);
        issues.push({
          id: `css-unclosed-string-${loc.line}-${loc.col}`,
          severity: 'warn',
          category: 'css',
          tab: 'css',
          line: loc.line,
          col: loc.col,
          message: `Chuỗi ký tự mở bằng ${quote} bị thiếu dấu đóng ${quote}.`,
          codeSnippet: getLineSnippet(lines, loc.line),
          ruleId: 'css-unclosed-string',
        });
      }
      continue;
    }

    i++;
  }

  const stripped = chars.join('');

  // Kiểm tra cân bằng dấu ngoặc nhọn { }
  const braceStack: Array<{ offset: number; line: number; col: number }> = [];
  let inQuote: string | null = null;

  for (let idx = 0; idx < stripped.length; idx++) {
    const ch = stripped[idx];
    if (inQuote) {
      if (ch === '\\') {
        idx++;
        continue;
      }
      if (ch === inQuote || ch === '\n') inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      continue;
    }
    if (ch === '{') {
      const loc = offsetToLineCol(lineStarts, idx);
      braceStack.push({ offset: idx, line: loc.line, col: loc.col });
    } else if (ch === '}') {
      if (braceStack.length === 0) {
        const loc = offsetToLineCol(lineStarts, idx);
        issues.push({
          id: `css-extra-brace-${loc.line}-${loc.col}`,
          severity: 'warn',
          category: 'css',
          tab: 'css',
          line: loc.line,
          col: loc.col,
          message: "Dư dấu đóng ngoặc nhọn '}' (không có '{' mở tương ứng).",
          codeSnippet: getLineSnippet(lines, loc.line),
          ruleId: 'css-extra-brace',
        });
      } else {
        braceStack.pop();
      }
    }
  }

  for (const unclosed of braceStack) {
    issues.push({
      id: `css-unclosed-brace-${unclosed.line}-${unclosed.col}`,
      severity: 'warn',
      category: 'css',
      tab: 'css',
      line: unclosed.line,
      col: unclosed.col,
      message: `Khối CSS mở '{' tại dòng ${unclosed.line} chưa được đóng bằng '}'.`,
      codeSnippet: getLineSnippet(lines, unclosed.line),
      ruleId: 'css-unclosed-brace',
    });
  }

  // Phân tích từng khai báo (declaration) bên trong khối { ... }
  let depth = 0;
  let stmtStart = 0;
  inQuote = null;
  let parenDepth = 0;

  const inspectDeclarationChunk = (rawChunk: string, chunkOffset: number) => {
    const trimmed = rawChunk.trim();
    if (!trimmed || trimmed.startsWith('@')) return;

    // Kiểm tra xem chunk có nhiều dòng mà dòng trước thiếu dấu ';' trước thuộc tính tiếp theo không
    const subLines = rawChunk.split('\n');
    let lineOffsetAcc = chunkOffset;
    const declLineIndices: Array<{ idx: number; line: number; col: number; text: string; offset: number }> = [];

    for (let sIdx = 0; sIdx < subLines.length; sIdx++) {
      const subText = subLines[sIdx];
      const t = subText.trim();
      const firstNonWs = subText.search(/\S/);
      const absOffset = lineOffsetAcc + (firstNonWs === -1 ? 0 : firstNonWs);
      const loc = offsetToLineCol(lineStarts, absOffset);

      if (t && /^[a-zA-Z-]+\s*:\s*[^:;{}]+$/.test(t) && !/url\([^)]*$/i.test(t)) {
        declLineIndices.push({ idx: sIdx, line: loc.line, col: loc.col, text: t, offset: absOffset });
      }
      lineOffsetAcc += subText.length + 1;
    }

    if (declLineIndices.length >= 2) {
      // Mỗi dòng có 'prop: val' mà không có ';' ngăn cách -> thiếu chấm phẩy
      for (let d = 0; d < declLineIndices.length - 1; d++) {
        const cur = declLineIndices[d];
        const propName = cur.text.split(':')[0].trim();
        issues.push({
          id: `css-missing-semi-${cur.line}-${cur.col}`,
          severity: 'warn',
          category: 'css',
          tab: 'css',
          line: cur.line,
          col: cur.col,
          message: `Thiếu dấu chấm phẩy ';' sau khai báo CSS "${propName}".`,
          codeSnippet: getLineSnippet(lines, cur.line),
          ruleId: 'css-missing-semicolon',
        });
      }
      return;
    }

    // Kiểm tra một khai báo đơn: prop: value
    const colonIdx = rawChunk.indexOf(':');
    if (colonIdx === -1) {
      const firstNonWs = rawChunk.search(/\S/);
      if (firstNonWs !== -1) {
        const loc = offsetToLineCol(lineStarts, chunkOffset + firstNonWs);
        issues.push({
          id: `css-malformed-decl-${loc.line}-${loc.col}`,
          severity: 'warn',
          category: 'css',
          tab: 'css',
          line: loc.line,
          col: loc.col,
          message: `Cú pháp khai báo CSS không hợp lệ "${trimmed.slice(0, 40)}" (thiếu dấu ':').`,
          codeSnippet: getLineSnippet(lines, loc.line),
          ruleId: 'css-malformed-declaration',
        });
      }
      return;
    }

    const propRaw = rawChunk.slice(0, colonIdx);
    const valRaw = rawChunk.slice(colonIdx + 1);
    const propName = propRaw.trim();
    const propVal = valRaw.trim();
    const propLeadingWs = propRaw.search(/\S/);
    const propLoc = offsetToLineCol(lineStarts, chunkOffset + (propLeadingWs === -1 ? 0 : propLeadingWs));

    // Nếu tên thuộc tính chứa khoảng trắng hoặc ký tự selector -> có thể thiếu '}' trước selector mới
    if (!propName || /[^a-zA-Z0-9_-]/.test(propName)) {
      return;
    }

    if (!isCssPropertySupported(propName)) {
      issues.push({
        id: `css-unknown-prop-${propName}-${propLoc.line}-${propLoc.col}`,
        severity: 'warn',
        category: 'css',
        tab: 'css',
        line: propLoc.line,
        col: propLoc.col,
        message: `Thuộc tính CSS "${propName}" không tồn tại hoặc trình duyệt không hỗ trợ.`,
        codeSnippet: getLineSnippet(lines, propLoc.line),
        ruleId: 'css-unknown-property',
      });
      return;
    }

    if (!propVal) {
      issues.push({
        id: `css-empty-val-${propName}-${propLoc.line}-${propLoc.col}`,
        severity: 'warn',
        category: 'css',
        tab: 'css',
        line: propLoc.line,
        col: propLoc.col,
        message: `Thuộc tính "${propName}" chưa có giá trị.`,
        codeSnippet: getLineSnippet(lines, propLoc.line),
        ruleId: 'css-empty-value',
      });
      return;
    }

    if (!isCssDeclarationValueValid(propName, propVal)) {
      issues.push({
        id: `css-invalid-val-${propName}-${propLoc.line}-${propLoc.col}`,
        severity: 'warn',
        category: 'css',
        tab: 'css',
        line: propLoc.line,
        col: propLoc.col,
        message: `Giá trị "${propVal.slice(0, 50)}" không hợp lệ cho thuộc tính "${propName}".`,
        codeSnippet: getLineSnippet(lines, propLoc.line),
        ruleId: 'css-invalid-value',
      });
    }
  };

  for (let idx = 0; idx < stripped.length; idx++) {
    const ch = stripped[idx];
    if (inQuote) {
      if (ch === '\\') {
        idx++;
        continue;
      }
      if (ch === inQuote || ch === '\n') inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch;
      continue;
    }
    if (ch === '(') {
      parenDepth++;
      continue;
    }
    if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }
    if (parenDepth > 0) continue;

    if (ch === '{') {
      depth++;
      stmtStart = idx + 1;
    } else if (ch === '}') {
      if (depth > 0) {
        const chunk = stripped.slice(stmtStart, idx);
        inspectDeclarationChunk(chunk, stmtStart);
        depth--;
      }
      stmtStart = idx + 1;
    } else if (ch === ';' && depth > 0) {
      const chunk = stripped.slice(stmtStart, idx);
      inspectDeclarationChunk(chunk, stmtStart);
      stmtStart = idx + 1;
    }
  }

  // Fallback bằng CSSStyleSheet để kiểm tra khả năng phân tích tổng thể
  try {
    if (issues.length === 0 && typeof CSSStyleSheet !== 'undefined') {
      const sheet = new CSSStyleSheet();
      if (typeof sheet.replaceSync === 'function') {
        sheet.replaceSync(source);
      }
    }
  } catch (err: any) {
    issues.push({
      id: 'css-stylesheet-parse-error',
      severity: 'warn',
      category: 'css',
      tab: 'css',
      line: 1,
      col: 1,
      message: `Lỗi cú pháp CSS: ${err?.message || 'Không thể phân tích bảng kiểu'}`,
      codeSnippet: getLineSnippet(lines, 1),
      ruleId: 'css-parse-error',
    });
  }

  return issues;
}

/**
 * Chạy tất cả các kiểm tra tĩnh không cần runtime cho HTML và CSS.
 */
export function runStaticChecks(htmlCode: string, cssCode: string): StaticIssue[] {
  const htmlIssues = lintHtmlCode(htmlCode);
  const cssIssues = lintCssCode(cssCode);

  const seen = new Set<string>();
  const combined: StaticIssue[] = [];

  for (const item of [...htmlIssues, ...cssIssues]) {
    const key = `${item.tab}:${item.line}:${item.col}:${item.ruleId}:${item.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    combined.push(item);
  }

  return combined;
}
