export const USERNAME_EMAIL_DOMAIN = 'users.coderlive.app';

export type AuthAccountType = 'username' | 'email' | 'google';

export const RESERVED_USERNAMES = new Set<string>([
  'admin',
  'administrator',
  'root',
  'support',
  'coderlive',
  'system',
  'moderator',
  'mod',
  'staff',
  'official',
  'help',
  'info',
  'contact',
  'security',
  'auth',
  'login',
  'signup',
  'register',
  'null',
  'undefined',
  'api',
  'www',
  'web',
  'app',
  'mail',
  'noreply',
  'no-reply',
  'test',
  'guest',
  'anonymous',
  'owner',
  'superuser',
]);

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export interface UsernameValidationResult {
  valid: boolean;
  normalized: string;
  error: string | null;
}

export function validateUsername(raw: string): UsernameValidationResult {
  const trimmed = raw.trim();
  const normalized = trimmed.toLowerCase();

  if (!trimmed) {
    return {
      valid: false,
      normalized,
      error: 'Vui lòng nhập tên đăng nhập.',
    };
  }

  if (trimmed.includes('@')) {
    return {
      valid: false,
      normalized,
      error: 'Tên đăng nhập không được chứa ký tự @ hoặc có dạng email.',
    };
  }

  if (normalized.length < 3 || normalized.length > 20) {
    return {
      valid: false,
      normalized,
      error: 'Tên đăng nhập phải dài từ 3 đến 20 ký tự.',
    };
  }

  if (!/^[a-z0-9]/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'Tên đăng nhập phải bắt đầu bằng chữ cái (a-z) hoặc số (0-9).',
    };
  }

  if (!/^[a-z0-9._-]+$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error:
        'Chỉ được dùng chữ cái (a-z), số (0-9), dấu chấm (.), gạch dưới (_) hoặc gạch nối (-), không có khoảng trắng.',
    };
  }

  if (/[._-]{2}/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'Không được dùng 2 ký tự đặc biệt (., _, -) liên tiếp nhau.',
    };
  }

  if (normalized.endsWith('.')) {
    return {
      valid: false,
      normalized,
      error: 'Tên đăng nhập không được kết thúc bằng dấu chấm (.).',
    };
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'Tên đăng nhập này thuộc danh sách hệ thống, vui lòng chọn tên khác.',
    };
  }

  return {
    valid: true,
    normalized,
    error: null,
  };
}

export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${USERNAME_EMAIL_DOMAIN}`;
}

export function isSyntheticUsernameEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith(`@${USERNAME_EMAIL_DOMAIN}`);
}

export function extractUsernameFromSyntheticEmail(email: string | null | undefined): string | null {
  if (!isSyntheticUsernameEmail(email)) return null;
  const localPart = email!.trim().toLowerCase().slice(0, -(`@${USERNAME_EMAIL_DOMAIN}`.length));
  return localPart || null;
}

export function getPublicUserEmail(email: string | null | undefined): string | null {
  if (!email || isSyntheticUsernameEmail(email)) return null;
  return email;
}

export function maskEmail(email: string | null | undefined): string | null {
  const pub = getPublicUserEmail(email);
  if (!pub) return null;
  const trimmed = pub.trim();
  const atIdx = trimmed.indexOf('@');
  if (atIdx <= 0 || atIdx === trimmed.length - 1) return null;
  const localPart = trimmed.slice(0, atIdx);
  const domainPart = trimmed.slice(atIdx + 1);
  return `${localPart.charAt(0)}***@${domainPart}`;
}

export interface UserLikeForIdentity {
  email?: string | null;
  emailVerified?: boolean;
  displayName?: string | null;
  photoURL?: string | null;
  providerData?: ReadonlyArray<{
    providerId?: string | null;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  }>;
}

/**
 * Chỉ trả về email công khai đã được xác minh (email Google liên kết hoặc email/mật khẩu đã xác minh).
 * Tuyệt đối không bao giờ trả về email ảo @users.coderlive.app.
 */
export function getVerifiedPublicEmail(user: UserLikeForIdentity | null | undefined): string | null {
  if (!user) return null;
  const providers = Array.isArray(user.providerData) ? user.providerData : [];
  const googleProviderInfo = providers.find((p) => p?.providerId === 'google.com');
  const googleEmail = getPublicUserEmail(googleProviderInfo?.email);
  if (googleEmail) {
    return googleEmail.trim().toLowerCase();
  }
  const directEmail = getPublicUserEmail(user.email);
  if (directEmail && user.emailVerified === true) {
    return directEmail.trim().toLowerCase();
  }
  return null;
}

export interface AccountIdentity {
  username: string | null;
  publicEmail: string | null;
  googleEmail: string | null;
  hasGoogleProvider: boolean;
  hasPasswordProvider: boolean;
  primaryType: AuthAccountType;
  displayLabel: string;
  secondaryLabel: string | null;
}

export function getPasswordProviderEmail(user: UserLikeForIdentity | null | undefined): string | null {
  if (!user) return null;
  const passwordProvider = user.providerData?.find((p) => p?.providerId === 'password');
  if (passwordProvider?.email) return passwordProvider.email;
  return user.email || null;
}

export function getAccountIdentity(user: UserLikeForIdentity | null | undefined): AccountIdentity {
  if (!user) {
    return {
      username: null,
      publicEmail: null,
      googleEmail: null,
      hasGoogleProvider: false,
      hasPasswordProvider: false,
      primaryType: 'email',
      displayLabel: 'Khách',
      secondaryLabel: null,
    };
  }

  const providers = Array.isArray(user.providerData) ? user.providerData : [];
  const googleProviderInfo = providers.find((p) => p?.providerId === 'google.com');
  const passwordProviderInfo = providers.find((p) => p?.providerId === 'password');

  const hasGoogleProvider = Boolean(googleProviderInfo);
  const hasPasswordProvider = Boolean(passwordProviderInfo);

  const username =
    extractUsernameFromSyntheticEmail(user.email) ||
    extractUsernameFromSyntheticEmail(passwordProviderInfo?.email) ||
    null;

  const googleEmail = getPublicUserEmail(googleProviderInfo?.email) || null;
  const publicEmail =
    getPublicUserEmail(user.email) ||
    googleEmail ||
    getPublicUserEmail(passwordProviderInfo?.email) ||
    null;

  const primaryType: AuthAccountType = username
    ? 'username'
    : hasGoogleProvider && !hasPasswordProvider
    ? 'google'
    : publicEmail
    ? 'email'
    : 'google';

  const displayLabel =
    user.displayName?.trim() ||
    username ||
    (publicEmail ? publicEmail.split('@')[0] : null) ||
    'Lập trình viên';

  const secondaryLabel = username
    ? `@${username}`
    : publicEmail || null;

  return {
    username,
    publicEmail,
    googleEmail,
    hasGoogleProvider,
    hasPasswordProvider,
    primaryType,
    displayLabel,
    secondaryLabel,
  };
}

export function formatPublicEmailOrUsername(email: string | null | undefined): string | null {
  if (!email) return null;
  const username = extractUsernameFromSyntheticEmail(email);
  if (username) return `@${username}`;
  return email;
}

export function getUserDiagnosticLabel(user: UserLikeForIdentity | null | undefined): string {
  if (!user) return 'Khách (Guest)';
  const identity = getAccountIdentity(user);
  if (identity.username && identity.googleEmail) {
    return `@${identity.username} (${identity.googleEmail})`;
  }
  if (identity.username) {
    return `@${identity.username}`;
  }
  if (identity.publicEmail) {
    return identity.publicEmail;
  }
  return identity.displayLabel;
}

export interface ParsedLoginIdentifier {
  kind: 'email' | 'username';
  normalizedInput: string;
  authEmail: string;
}

export function parseLoginIdentifier(raw: string): ParsedLoginIdentifier {
  const trimmed = raw.trim();
  if (trimmed.includes('@')) {
    return {
      kind: 'email',
      normalizedInput: trimmed.toLowerCase(),
      authEmail: trimmed.toLowerCase(),
    };
  }
  const normalizedUsername = normalizeUsername(trimmed);
  return {
    kind: 'username',
    normalizedInput: normalizedUsername,
    authEmail: usernameToEmail(normalizedUsername),
  };
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  hint: string;
  meetsMin: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Chưa nhập',
      hint: 'Tối thiểu 6 ký tự (khuyên dùng từ 8 ký tự trở lên).',
      meetsMin: false,
    };
  }

  if (password.length < 6) {
    return {
      score: 1,
      label: 'Quá ngắn',
      hint: `Cần thêm ít nhất ${6 - password.length} ký tự (tối thiểu 6 ký tự).`,
      meetsMin: false,
    };
  }

  let points = 1;
  if (password.length >= 8) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^a-zA-Z0-9]/.test(password)) points++;

  if (points <= 2) {
    return {
      score: 2,
      label: 'Trung bình',
      hint: 'Nên dùng 8+ ký tự kết hợp chữ hoa, chữ thường và số.',
      meetsMin: true,
    };
  }

  if (points === 3) {
    return {
      score: 3,
      label: 'Khá mạnh',
      hint: 'Mật khẩu đạt mức an toàn tốt.',
      meetsMin: true,
    };
  }

  return {
    score: 4,
    label: 'Rất mạnh',
    hint: 'Mật khẩu có độ bảo mật cao.',
    meetsMin: true,
  };
}
