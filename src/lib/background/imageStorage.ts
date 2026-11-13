export const MAX_BG_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
const DB_NAME = 'coderlive_custom_bg_db_v1';
const LEGACY_DB_NAME = 'htmlive_custom_bg_db_v1';
const STORE_NAME = 'images';
const LS_FALLBACK_KEY = 'coderlive_custom_bg_fallback_v1';
const BG_IMAGE_EVENT = 'coderlive-bg-image-updated';

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

export interface StoredBgImageMeta {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  persistedIn: 'indexeddb' | 'localstorage' | 'session';
}

export type ProcessBgImageResult =
  | { ok: true; meta: StoredBgImageMeta }
  | { ok: false; error: string };

// Bộ nhớ đệm trong phiên làm việc hiện tại
const sessionCache = new Map<string, StoredBgImageMeta>();

function emitBgImageChanged(id: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BG_IMAGE_EVENT, { detail: { id } }));
  }
}

export function subscribeBgImageChanged(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(BG_IMAGE_EVENT, cb);
  return () => window.removeEventListener(BG_IMAGE_EVENT, cb);
}

function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

export function validateBgImageFile(file: File): string | null {
  const ext = getFileExtension(file.name || '');
  const mime = (file.type || '').toLowerCase();

  // Từ chối SVG và các định dạng vector/script
  if (mime.includes('svg') || ext === '.svg' || ext === '.svgz') {
    return 'Không hỗ trợ tệp SVG vì lý do bảo mật. Vui lòng chọn ảnh PNG, JPEG, WebP hoặc GIF.';
  }

  const mimeOk = mime ? ALLOWED_MIME_TYPES.has(mime) : false;
  const extOk = ext ? ALLOWED_EXTENSIONS.has(ext) : false;

  if (!mimeOk && !extOk) {
    return 'Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh PNG, JPEG, WebP hoặc GIF.';
  }

  // Nếu có MIME không hợp lệ dù đổi đuôi file
  if (mime && !ALLOWED_MIME_TYPES.has(mime)) {
    return 'Định dạng ảnh không hợp lệ. Chỉ hỗ trợ PNG, JPEG, WebP hoặc GIF.';
  }

  if (file.size <= 0) {
    return 'Tệp ảnh trống, vui lòng chọn tệp khác.';
  }

  if (file.size > MAX_BG_IMAGE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `Ảnh vượt quá giới hạn 15 MB (dung lượng hiện tại: ${sizeMb} MB). Vui lòng chọn ảnh nhẹ hơn.`;
  }

  return null;
}

function openBgDatabase(dbName: string = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB không khả dụng'));
      return;
    }
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Không thể mở IndexedDB'));
  });
}

async function saveBlobToIndexedDb(
  id: string,
  blob: Blob,
  info: { name: string; size: number; type: string; width?: number; height?: number }
): Promise<boolean> {
  try {
    const db = await openBgDatabase(DB_NAME);
    return await new Promise<boolean>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      // Xóa ảnh cũ để tránh phình dung lượng lưu trữ
      store.clear();
      store.put({
        id,
        blob,
        name: info.name,
        size: info.size,
        type: info.type,
        width: info.width,
        height: info.height,
        updatedAt: Date.now(),
      });
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

async function loadBlobFromSingleIndexedDb(
  dbName: string,
  id: string
): Promise<{ blob: Blob; name: string; size: number; type: string; width?: number; height?: number } | null> {
  try {
    const db = await openBgDatabase(dbName);
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        db.close();
        const res = req.result;
        if (res && res.blob instanceof Blob) {
          resolve({
            blob: res.blob,
            name: res.name || 'anh-nen',
            size: res.size || res.blob.size,
            type: res.type || res.blob.type,
            width: res.width,
            height: res.height,
          });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

async function loadBlobFromIndexedDb(
  id: string
): Promise<{ blob: Blob; name: string; size: number; type: string; width?: number; height?: number } | null> {
  const current = await loadBlobFromSingleIndexedDb(DB_NAME, id);
  if (current) return current;

  // Tương thích ngược: đọc từ DB cũ và sao chép sang DB mới nếu tìm thấy
  const legacy = await loadBlobFromSingleIndexedDb(LEGACY_DB_NAME, id);
  if (legacy) {
    await saveBlobToIndexedDb(id, legacy.blob, {
      name: legacy.name,
      size: legacy.size,
      type: legacy.type,
      width: legacy.width,
      height: legacy.height,
    });
    return legacy;
  }
  return null;
}

async function clearIndexedDb(): Promise<void> {
  try {
    const db = await openBgDatabase();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    });
  } catch {}
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Không thể đọc DataURL'));
    };
    reader.onerror = () => reject(reader.error || new Error('Lỗi đọc tệp'));
    reader.readAsDataURL(file);
  });
}

function verifyAndMeasureImage(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || 0,
        height: img.naturalHeight || 0,
      });
    };
    img.onerror = () => {
      reject(new Error('Tệp ảnh bị hỏng hoặc trình duyệt không thể giải mã.'));
    };
    img.src = url;
  });
}

/**
 * Xử lý tệp ảnh nền mới:
 * 1. Kiểm tra định dạng (từ chối SVG) & dung lượng (<= 15 MB)
 * 2. Tạo ObjectURL và kiểm tra giải mã ảnh ngay lập tức để hiển thị tức thì
 * 3. Lưu best-effort vào IndexedDB (hoặc localStorage fallback cho ảnh nhỏ)
 */
export async function processAndStoreBgImage(file: File): Promise<ProcessBgImageResult> {
  const validationError = validateBgImageFile(file);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  let objectUrl = '';
  try {
    objectUrl = URL.createObjectURL(file);
  } catch {
    // Fallback sang DataURL nếu môi trường không hỗ trợ ObjectURL
    try {
      const dataUrl = await readAsDataUrl(file);
      objectUrl = dataUrl;
    } catch {
      return { ok: false, error: 'Không thể khởi tạo đường dẫn xem trước cho ảnh.' };
    }
  }

  let dimensions: { width: number; height: number };
  try {
    dimensions = await verifyAndMeasureImage(objectUrl);
  } catch {
    if (objectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(objectUrl);
    }
    return {
      ok: false,
      error: 'Không thể giải mã tệp ảnh này. Tệp có thể bị hỏng hoặc sai định dạng.',
    };
  }

  const id = `bg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Giải phóng các ObjectURL cũ trong session cache (giữ tối đa 2 mục gần nhất cho Undo)
  if (sessionCache.size >= 2) {
    const oldestKey = sessionCache.keys().next().value;
    if (oldestKey) {
      const oldest = sessionCache.get(oldestKey);
      if (oldest && oldest.url.startsWith('blob:')) {
        URL.revokeObjectURL(oldest.url);
      }
      sessionCache.delete(oldestKey);
    }
  }

  const meta: StoredBgImageMeta = {
    id,
    url: objectUrl,
    name: file.name || 'anh-nen-tuy-chinh',
    size: file.size,
    type: file.type || 'image/png',
    width: dimensions.width,
    height: dimensions.height,
    persistedIn: 'session',
  };

  // Hiển thị ngay lập tức qua session cache
  sessionCache.set(id, meta);
  emitBgImageChanged(id);

  // Lưu bền vững best-effort (không làm hỏng luồng hiển thị nếu quota đầy)
  const savedToIdb = await saveBlobToIndexedDb(id, file, {
    name: meta.name,
    size: meta.size,
    type: meta.type,
    width: meta.width,
    height: meta.height,
  });

  if (savedToIdb) {
    meta.persistedIn = 'indexeddb';
    try {
      localStorage.removeItem(LS_FALLBACK_KEY);
    } catch {}
  } else if (file.size <= 2 * 1024 * 1024) {
    try {
      const dataUrl = objectUrl.startsWith('data:') ? objectUrl : await readAsDataUrl(file);
      localStorage.setItem(
        LS_FALLBACK_KEY,
        JSON.stringify({
          id,
          dataUrl,
          name: meta.name,
          size: meta.size,
          type: meta.type,
          width: meta.width,
          height: meta.height,
        })
      );
      meta.persistedIn = 'localstorage';
    } catch {}
  }

  sessionCache.set(id, meta);
  emitBgImageChanged(id);

  return { ok: true, meta };
}

/**
 * Nạp ảnh nền từ token lưu trong ThemeSettings (`customBgImage`).
 * Hỗ trợ cả token mới (`bg-...`) và DataURL cũ (`data:image/...`).
 */
export async function resolveBgImageMeta(
  imageRef?: string
): Promise<StoredBgImageMeta | null> {
  if (!imageRef) return null;

  // Tương thích ngược với DataURL đã lưu trước đó (loại trừ SVG)
  if (imageRef.startsWith('data:image/')) {
    if (imageRef.startsWith('data:image/svg')) return null;
    return {
      id: imageRef,
      url: imageRef,
      name: 'Ảnh nền đã lưu',
      size: 0,
      type: 'image/*',
      persistedIn: 'localstorage',
    };
  }

  const cached = sessionCache.get(imageRef);
  if (cached) return cached;

  // Tìm trong IndexedDB
  const idbItem = await loadBlobFromIndexedDb(imageRef);
  if (idbItem) {
    const url = URL.createObjectURL(idbItem.blob);
    const meta: StoredBgImageMeta = {
      id: imageRef,
      url,
      name: idbItem.name,
      size: idbItem.size,
      type: idbItem.type,
      width: idbItem.width,
      height: idbItem.height,
      persistedIn: 'indexeddb',
    };
    sessionCache.set(imageRef, meta);
    return meta;
  }

  // Tìm trong localStorage fallback
  try {
    const raw = localStorage.getItem(LS_FALLBACK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id === imageRef && typeof parsed.dataUrl === 'string') {
        const meta: StoredBgImageMeta = {
          id: imageRef,
          url: parsed.dataUrl,
          name: parsed.name || 'Ảnh nền đã lưu',
          size: parsed.size || 0,
          type: parsed.type || 'image/png',
          width: parsed.width,
          height: parsed.height,
          persistedIn: 'localstorage',
        };
        sessionCache.set(imageRef, meta);
        return meta;
      }
    }
  } catch {}

  return null;
}

export async function clearStoredBgImage(): Promise<void> {
  for (const meta of sessionCache.values()) {
    if (meta.url.startsWith('blob:')) {
      URL.revokeObjectURL(meta.url);
    }
  }
  sessionCache.clear();
  try {
    localStorage.removeItem(LS_FALLBACK_KEY);
  } catch {}
  await clearIndexedDb();
  emitBgImageChanged('');
}

export function formatBytesVi(bytes: number): string {
  if (!bytes || bytes <= 0) return 'Không rõ';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
