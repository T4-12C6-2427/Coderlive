import * as Y from 'yjs';

/**
 * Chuyển đổi Uint8Array sang chuỗi Base64 an toàn cho trình duyệt và kích thước lớn
 */
export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

/**
 * Chuyển đổi chuỗi Base64 về Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Tạo một Y.Doc mới với ba Y.Text chuẩn ("html", "css", "js")
 * và mã hóa toàn bộ trạng thái ban đầu thành Base64.
 */
export function encodeInitialCollabState(code: {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}): string {
  const doc = new Y.Doc();
  doc.transact(() => {
    const yHtml = doc.getText('html');
    const yCss = doc.getText('css');
    const yJs = doc.getText('js');
    if (code.htmlCode) yHtml.insert(0, code.htmlCode);
    if (code.cssCode) yCss.insert(0, code.cssCode);
    if (code.jsCode) yJs.insert(0, code.jsCode);
  });
  const encoded = Y.encodeStateAsUpdate(doc);
  doc.destroy();
  return uint8ToBase64(encoded);
}

/**
 * Áp dụng snapshot và danh sách các update chunk để trích xuất mã nguồn hiện tại
 */
export function decodeCollabStateToCode(
  snapshotBase64?: string | null,
  updateChunksBase64: string[] = []
): { htmlCode: string; cssCode: string; jsCode: string } {
  const doc = new Y.Doc();
  try {
    if (snapshotBase64) {
      Y.applyUpdate(doc, base64ToUint8Array(snapshotBase64));
    }
    for (const chunk of updateChunksBase64) {
      if (chunk) {
        Y.applyUpdate(doc, base64ToUint8Array(chunk));
      }
    }
    return {
      htmlCode: doc.getText('html').toString(),
      cssCode: doc.getText('css').toString(),
      jsCode: doc.getText('js').toString(),
    };
  } finally {
    doc.destroy();
  }
}

/**
 * Cập nhật toàn bộ nội dung một Y.Text bằng khác biệt tối thiểu (common prefix/suffix)
 * bên trong một transaction để giữ con trỏ của cộng tác viên ổn định nhất có thể.
 */
export function applyStringDiffToYText(
  yText: Y.Text,
  nextText: string,
  origin?: unknown
): void {
  const prevText = yText.toString();
  if (prevText === nextText) return;

  let start = 0;
  const minLen = Math.min(prevText.length, nextText.length);
  while (start < minLen && prevText.charCodeAt(start) === nextText.charCodeAt(start)) {
    start++;
  }

  let prevEnd = prevText.length;
  let nextEnd = nextText.length;
  while (
    prevEnd > start &&
    nextEnd > start &&
    prevText.charCodeAt(prevEnd - 1) === nextText.charCodeAt(nextEnd - 1)
  ) {
    prevEnd--;
    nextEnd--;
  }

  const deleteCount = prevEnd - start;
  const insertText = nextText.slice(start, nextEnd);

  const apply = () => {
    if (deleteCount > 0) {
      yText.delete(start, deleteCount);
    }
    if (insertText.length > 0) {
      yText.insert(start, insertText);
    }
  };

  if (yText.doc) {
    yText.doc.transact(apply, origin);
  } else {
    apply();
  }
}

