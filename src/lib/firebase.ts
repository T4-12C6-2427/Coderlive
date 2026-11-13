import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;
let isFirebaseAvailable = false;
let isFirebaseConfigValid = false;
let firebaseConfigError: string | null = null;

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
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Pass firestoreDatabaseId when provided for isolated databases
    const databaseId = (firebaseConfig as any).firestoreDatabaseId;
    db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

    const envRtdbUrl = String((import.meta as any).env?.VITE_FIREBASE_DATABASE_URL || '').trim();
    const configRtdbUrl = String(firebaseConfig.databaseURL || '').trim();
    const databaseURL = envRtdbUrl || configRtdbUrl;
    if (databaseURL) {
      try {
        rtdb = getDatabase(app, databaseURL);
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

export {
  app,
  auth,
  db,
  rtdb,
  isFirebaseAvailable,
  isFirebaseConfigValid,
  firebaseConfigError,
  firebaseConfig,
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
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error(`[Firestore:${operationType}] Lỗi tại "${path}":`, error, JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
