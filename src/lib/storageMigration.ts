const LEGACY_PREFIX = 'htmlive_';
const NEW_PREFIX = 'coderlive_';
const DEPRECATED_KEYS = new Set(['htmlive_dev_badge_visible']);

/**
 * Di chuyển một vùng lưu trữ (localStorage hoặc sessionStorage) từ tiền tố `htmlive_`
 * sang `coderlive_` một cách an toàn:
 * - Đọc toàn bộ khóa cũ trước
 * - Chỉ ghi sang khóa mới nếu khóa mới chưa tồn tại
 * - Chỉ xóa khóa cũ sau khi đã xác nhận khóa mới tồn tại
 */
export function migrateStorageArea(storage: Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem' | 'removeItem'>): number {
  let migratedCount = 0;
  try {
    const legacyKeys: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const k = storage.key(i);
      if (k && k.startsWith(LEGACY_PREFIX)) {
        legacyKeys.push(k);
      }
    }

    for (const oldKey of legacyKeys) {
      try {
        if (DEPRECATED_KEYS.has(oldKey)) {
          storage.removeItem(oldKey);
          continue;
        }
        const suffix = oldKey.slice(LEGACY_PREFIX.length);
        const newKey = `${NEW_PREFIX}${suffix}`;
        const oldVal = storage.getItem(oldKey);
        const existingNew = storage.getItem(newKey);

        if (oldVal !== null && existingNew === null) {
          storage.setItem(newKey, oldVal);
          // Chỉ xóa khóa cũ khi xác nhận giá trị đã lưu an toàn ở khóa mới
          if (storage.getItem(newKey) !== null) {
            storage.removeItem(oldKey);
            migratedCount += 1;
          }
        } else if (existingNew !== null) {
          // Khóa mới đã có dữ liệu — dọn dẹp khóa cũ tránh trùng lặp
          storage.removeItem(oldKey);
        }
      } catch {
        // Bỏ qua lỗi quota hoặc quyền truy cập đối với từng khóa riêng lẻ
      }
    }
  } catch {
    // Bỏ qua nếu môi trường không cho phép truy cập storage
  }
  return migratedCount;
}

let hasRunGlobalMigration = false;

export function migrateLegacyStorageKeys(force = false): void {
  if (hasRunGlobalMigration && !force) return;
  hasRunGlobalMigration = true;

  try {
    if (typeof localStorage !== 'undefined') {
      migrateStorageArea(localStorage);
    }
  } catch {
    // Bỏ qua lỗi truy cập localStorage
  }

  try {
    if (typeof sessionStorage !== 'undefined') {
      migrateStorageArea(sessionStorage);
    }
  } catch {
    // Bỏ qua lỗi truy cập sessionStorage
  }
}
