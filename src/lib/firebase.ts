import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';
import { getPublicUserEmail } from './usernameAuth';

export type FirestorePersistenceMode = 'persistent-multi-tab' | 'memory-fallback' | 'unavailable';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;
let rtdbUrl: string | null = null;
let isFirebaseAvailable = false;
let isFirebaseConfigValid = false;
let firebaseConfigError: string | null = null;
let firestorePersistenceMode: FirestorePersistenceMode = 'unavailable';
let firestorePersistenceError: string | null = null;

/**
 * Chuẩn hóa URL Firebase Realtime Database về đúng origin gốc (không chứa child path).
 * Bỏ qua các URL không phải endpoint RTDB (ví dụ link trang quản trị Firebase Console).
 */
export function normalizeRealtimeDatabaseUrl(rawUrl: string | undefined | null): string | null {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    const isFirebaseRtdbHost =
      hostname.endsWith('.firebasedatabase.app') || hostname.endsWith('.firebaseio.com');
    const isEmulatorHost =
      hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

    if (isFirebaseRtdbHost) {
      if (parsed.protocol !== 'https:') return null;
      return parsed.origin;
    }

    if (isEmulatorHost && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
      const ns = parsed.searchParams.get('ns');
      return ns ? `${parsed.origin}?ns=${encodeURIComponent(ns)}` : parsed.origin;
    }

    return null;
  } catch {
    return null;
  }
}

export function resolveRealtimeDatabaseUrl(
  envUrl?: string | null,
  configUrl?: string | null
): string | null {
  const rawEnv = String(envUrl || '').trim();
  const normalizedEnv = normalizeRealtimeDatabaseUrl(rawEnv);
  if (rawEnv && !normalizedEnv) {
    console.warn(
      '[Firebase:Init] VITE_FIREBASE_DATABASE_URL không phải URL gốc hợp lệ của Realtime Database (ví dụ: https://<db>.firebasedatabase.app). Hệ thống sẽ bỏ qua biến môi trường này và dùng cấu hình mặc định.'
    );
  }

  const rawConfig = String(configUrl || '').trim();
  const normalizedConfig = normalizeRealtimeDatabaseUrl(rawConfig);
  if (rawConfig && !normalizedConfig) {
    console.warn(
      '[Firebase:Init] databaseURL trong firebase-applet-config.json không hợp lệ và sẽ được bỏ qua.'
    );
  }

  return normalizedEnv || normalizedConfig || null;
}

// Validate that all required Firebase configuration keys are present and not empty or placeholder
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
const missingKeys: string[] = [];

for (const key of requiredKeys) {
  const val = (firebaseConfig as any)?.[key];
  if (!val || typeof val !== 'string' || val.trim() === '' || val === 'remixed-project-id') {
    missingKeys.push(key);
  }
}

if (missingKeys.length > 0) {
  firebaseConfigError = `Thiếu các khóa cấu hình Firebase bắt buộc: ${missingKeys.join(', ')}`;
  console.warn(`[Firebase:Init] ${firebaseConfigError}. Ứng dụng sẽ hoạt động ở chế độ Khách (Guest mode).`);
  isFirebaseConfigValid = false;
  isFirebaseAvailable = false;
} else {
  try {
    const envRtdbUrl = String((import.meta as any).env?.VITE_FIREBASE_DATABASE_URL || '').trim();
    const configRtdbUrl = String((firebaseConfig as any)?.databaseURL || '').trim();
    rtdbUrl = resolveRealtimeDatabaseUrl(envRtdbUrl, configRtdbUrl);

    const { databaseURL: _rawDatabaseUrl, ...restFirebaseConfig } = firebaseConfig as Record<string, any>;
    const sanitizedConfig = rtdbUrl
      ? { ...restFirebaseConfig, databaseURL: rtdbUrl }
      : restFirebaseConfig;

    app = getApps().length === 0 ? initializeApp(sanitizedConfig) : getApp();
    auth = getAuth(app);
    // Pass firestoreDatabaseId when provided for isolated databases, enabling multi-tab IndexedDB persistence
    const databaseId = (firebaseConfig as any).firestoreDatabaseId;
    try {
      const fsSettings = {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      };
      db = databaseId
        ? initializeFirestore(app, fsSettings, databaseId)
        : initializeFirestore(app, fsSettings);
      firestorePersistenceMode = 'persistent-multi-tab';
      firestorePersistenceError = null;
    } catch (persistenceErr: any) {
      const msg = persistenceErr instanceof Error ? persistenceErr.message : String(persistenceErr);
      db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
      if (msg.includes('already been started')) {
        // Instance was already initialized in this JS context (e.g., module reload)
        firestorePersistenceMode = 'persistent-multi-tab';
        firestorePersistenceError = null;
      } else {
        firestorePersistenceMode = 'memory-fallback';
        firestorePersistenceError = msg;
        console.warn('[Firebase:Init] Không thể bật bộ nhớ đệm cục bộ đa tab cho Firestore, dùng bộ nhớ tạm:', msg);
      }
    }

    if (rtdbUrl) {
      try {
        rtdb = getDatabase(app, rtdbUrl);
      } catch (rtdbErr) {
        console.warn('[Firebase:Init] Không thể khởi tạo Realtime Database, sẽ dùng chế độ dự phòng Firestore:', rtdbErr);
        rtdb = null;
      }
    }

    isFirebaseConfigValid = true;
    isFirebaseAvailable = true;
    console.log('[Firebase:Init] Khởi tạo Firebase thành công với project:', firebaseConfig.projectId);
  } catch (error) {
    firebaseConfigError = error instanceof Error ? error.message : String(error);
    console.error('[Firebase:Init] Lỗi khi khởi tạo Firebase:', error);
    isFirebaseConfigValid = false;
    isFirebaseAvailable = false;
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  app,
  auth,
  db,
  rtdb,
  rtdbUrl,
  isFirebaseAvailable,
  isFirebaseConfigValid,
  firebaseConfigError,
  firebaseConfig,
  firestorePersistenceMode,
  firestorePersistenceError,
};

// Validate connection to Firestore
export async function testConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore:testConnection] Thiết bị hoặc ứng dụng đang ở chế độ ngoại tuyến (offline).');
    } else {
      console.warn('[Firestore:testConnection] Kiểm tra kết nối Firestore:', error);
    }
    return false;
  }
}

// Error handling helper per skill guideline
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: getPublicUserEmail(auth?.currentUser?.email) || null,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: getPublicUserEmail(provider.email) || null,
      })) || [],
    },
    operationType,
    path,
  };
  console.error(`[Firestore:${operationType}] Lỗi tại "${path}":`, error, JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
