import { CollabMemberProfile, CollabRole, PresenceUser } from '../types';

/**
 * Bảng 12 màu riêng biệt đạt chuẩn tương phản WCAG AA (>= 4.5:1) khi đặt chữ trắng (#FFFFFF) lên nền màu.
 */
export const PRESENCE_PALETTE = [
  '#4F46E5', // Indigo
  '#0369A1', // Ocean Blue
  '#0F766E', // Deep Teal
  '#15803D', // Forest Green
  '#B45309', // Deep Amber
  '#C2410C', // Burnt Orange
  '#DC2626', // Crimson Red
  '#BE185D', // Berry Pink
  '#A21CAF', // Deep Fuchsia
  '#7C3AED', // Royal Violet
  '#0E7490', // Cerulean Cyan
  '#4D7C0F', // Moss Olive
] as const;

export const IDLE_THRESHOLD_MS = 2 * 60 * 1000; // 2 phút không hoạt động -> Vắng mặt

/**
 * Hàm băm FNV-1a ổn định theo (projectId, uid) để cùng một người dùng luôn giữ nguyên một màu
 * trong phạm vi dự án qua các lần tải lại hoặc nhiều tab khác nhau.
 */
export function getUserPresenceColor(projectId: string, uid: string): string {
  const input = `${projectId}::${uid}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const index = (hash >>> 0) % PRESENCE_PALETTE.length;
  return PRESENCE_PALETTE[index];
}

/**
 * Lấy tên hiển thị ưu tiên từ hồ sơ (displayName), nếu không có thì lấy phần trước @ của email.
 */
export function getPresenceDisplayName(
  user?: { displayName?: string | null; email?: string | null } | null,
  profile?: CollabMemberProfile | null
): string {
  const profileName = profile?.name?.trim();
  if (profileName) return profileName.slice(0, 100);

  const authName = user?.displayName?.trim();
  if (authName) return authName.slice(0, 100);

  const email = user?.email || profile?.email || '';
  if (email.includes('@')) {
    const prefix = email.split('@')[0].trim();
    if (prefix) return prefix.slice(0, 100);
  }

  return 'Thành viên';
}

/**
 * Tạo chữ viết tắt (1-2 ký tự) khi người dùng chưa có ảnh đại diện.
 */
export function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return 'TV';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Chuyển đổi mã màu HEX thành rgba bán trong suốt để tô vùng chọn (selection) và highlight.
 */
export function hexToTranslucent(hex: string, alpha = 0.22): string {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return `rgba(79, 70, 229, ${alpha})`;
}

export function getCollabRoleLabel(role: CollabRole): string {
  if (role === 'owner') return 'Chủ sở hữu';
  if (role === 'editor') return 'Biên tập viên';
  return 'Người xem';
}

export function formatPresenceActivity(user: Pick<PresenceUser, 'isIdle' | 'idleMinutes' | 'role' | 'tab' | 'isTyping'>): string {
  if (user.isIdle) {
    const mins = Math.max(2, user.idleMinutes);
    return `Vắng mặt ${mins} phút`;
  }
  if (user.role === 'viewer') {
    return 'Đang xem';
  }
  const tabLabel = user.tab.toUpperCase();
  return user.isTyping ? `Đang gõ ở tab ${tabLabel}...` : `Đang sửa tab ${tabLabel}`;
}
