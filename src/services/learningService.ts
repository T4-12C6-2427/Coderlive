import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const GUEST_STORAGE_PREFIX = 'coderlive_completed_lessons';

/**
 * Lấy danh sách ID các bài học đã hoàn thành theo từng khóa học ('html', 'css', 'js')
 */
export async function getCompletedLessons(
  userId?: string | null,
  courseId: string = 'html'
): Promise<(number | string)[]> {
  const storageKey = `${GUEST_STORAGE_PREFIX}_${courseId}`;
  const localData = localStorage.getItem(storageKey) || (courseId === 'html' ? localStorage.getItem(GUEST_STORAGE_PREFIX) : null);
  const localList: (number | string)[] = localData ? JSON.parse(localData) : [];

  if (!userId || !db) {
    return localList;
  }

  const docPath = `users/${userId}/learning/${courseId}`;
  try {
    const docRef = doc(db, 'users', userId, 'learning', courseId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const cloudList: (number | string)[] = data.completedLessons || [];
      const merged = Array.from(new Set([...cloudList, ...localList]));
      return merged;
    }
    // Backward compatibility for html in 'progress' doc
    if (courseId === 'html') {
      const legacyRef = doc(db, 'users', userId, 'learning', 'progress');
      const legSnap = await getDoc(legacyRef);
      if (legSnap.exists()) {
        const data = legSnap.data();
        const cloudList: (number | string)[] = data.completedLessons || [];
        return Array.from(new Set([...cloudList, ...localList]));
      }
    }
    return localList;
  } catch (error) {
    console.error(`[Firestore:learning] Không thể đọc tiến trình học ${courseId} từ Firestore (đường dẫn: ${docPath}):`, error);
    if (error instanceof Error && error.message.includes('insufficient permissions')) {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
    return localList;
  }
}

/**
 * Lưu danh sách bài học đã hoàn thành theo khóa học
 */
export async function saveCompletedLessons(
  completedList: (number | string)[],
  userId?: string | null,
  courseId: string = 'html'
): Promise<void> {
  const storageKey = `${GUEST_STORAGE_PREFIX}_${courseId}`;
  localStorage.setItem(storageKey, JSON.stringify(completedList));
  if (courseId === 'html') {
    localStorage.setItem(GUEST_STORAGE_PREFIX, JSON.stringify(completedList));
  }

  if (!userId || !db) return;

  const docPath = `users/${userId}/learning/${courseId}`;
  try {
    const docRef = doc(db, 'users', userId, 'learning', courseId);
    await setDoc(docRef, {
      completedLessons: completedList,
      courseId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[Firestore:learning] Không thể lưu tiến trình học ${courseId} lên Firestore (đường dẫn: ${docPath}):`, error);
    if (error instanceof Error && error.message.includes('insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  }
}

/**
 * Hợp nhất tiến trình từ phiên khách khi người dùng đăng nhập
 */
export async function mergeGuestProgress(
  userId: string,
  courseId: string = 'html'
): Promise<(number | string)[]> {
  const merged = await getCompletedLessons(userId, courseId);
  await saveCompletedLessons(merged, userId, courseId);
  return merged;
}
