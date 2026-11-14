import * as Y from 'yjs';
import { diffLines } from 'diff';

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

export interface TextPatch {
  from: number;
  to: number;
  insert: string;
}

/**
 * Tính danh sách các bản vá tối thiểu theo từng đoạn dòng thay đổi (kèm cắt tiền tố/hậu tố chung)
 * để khi định dạng hoặc sửa nhanh cục bộ không làm dịch chuyển con trỏ của đồng đội ở các dòng khác.
 */
export function computeMinimalTextPatches(prevText: string, nextText: string): TextPatch[] {
  if (prevText === nextText) return [];

  const parts = diffLines(prevText, nextText);
  const patches: TextPatch[] = [];
  let prevOffset = 0;

  let i = 0;
  while (i < parts.length) {
    const part = parts[i];
    if (!part.added && !part.removed) {
      prevOffset += part.value.length;
      i++;
      continue;
    }

    const hunkFrom = prevOffset;
    let removedText = '';
    let addedText = '';

    while (i < parts.length && (parts[i].removed || parts[i].added)) {
      if (parts[i].removed) {
        removedText += parts[i].value;
        prevOffset += parts[i].value.length;
      } else if (parts[i].added) {
        addedText += parts[i].value;
      }
      i++;
    }

    let pStart = 0;
    const minLen = Math.min(removedText.length, addedText.length);
    while (pStart < minLen && removedText.charCodeAt(pStart) === addedText.charCodeAt(pStart)) {
      pStart++;
    }

    let rEnd = removedText.length;
    let aEnd = addedText.length;
    while (
      rEnd > pStart &&
      aEnd > pStart &&
      removedText.charCodeAt(rEnd - 1) === addedText.charCodeAt(aEnd - 1)
    ) {
      rEnd--;
      aEnd--;
    }

    const patchFrom = hunkFrom + pStart;
    const patchTo = hunkFrom + rEnd;
    const patchInsert = addedText.slice(pStart, aEnd);

    if (patchFrom !== patchTo || patchInsert.length > 0) {
      patches.push({
        from: patchFrom,
        to: patchTo,
        insert: patchInsert,
      });
    }
  }

  return patches;
}

/**
 * Cập nhật nội dung một Y.Text bằng các bản vá tối thiểu theo dòng bên trong 1 transaction
 * để giữ con trỏ tương đối của cộng tác viên ở các dòng khác luôn ổn định và gộp thành 1 bước hoàn tác.
 */
export function applyStringDiffToYText(
  yText: Y.Text,
  nextText: string,
  origin?: unknown
): void {
  const prevText = yText.toString();
  if (prevText === nextText) return;

  const patches = computeMinimalTextPatches(prevText, nextText);
  if (patches.length === 0) return;

  const sortedDesc = [...patches].sort((a, b) => b.from - a.from);

  const apply = () => {
    for (const patch of sortedDesc) {
      const deleteCount = patch.to - patch.from;
      if (deleteCount > 0) {
        yText.delete(patch.from, deleteCount);
      }
      if (patch.insert.length > 0) {
        yText.insert(patch.from, patch.insert);
      }
    }
  };

  if (yText.doc) {
    yText.doc.transact(apply, origin);
  } else {
    apply();
  }
}


