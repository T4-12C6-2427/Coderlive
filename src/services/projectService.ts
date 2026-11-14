import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Project } from '../types';
import { migrateProjectCode } from '../lib/codeCompiler';
import { formatPublicEmailOrUsername } from '../lib/usernameAuth';

const GUEST_PROJECTS_KEY = 'coderlive_guest_projects_v1';

/**
 * Lấy danh sách dự án của người dùng khách (Guest) từ localStorage
 */
export function getGuestProjects(): Project[] {
  try {
    const raw = localStorage.getItem(GUEST_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((p) => ({
        ...p,
        description: p.description || '',
        languages: p.languages && Array.isArray(p.languages) && p.languages.length > 0 ? p.languages : ['html', 'css', 'js'],
      }));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Lưu danh sách dự án của người dùng khách (Guest) vào localStorage
 */
export function saveGuestProjects(projects: Project[]): void {
  try {
    localStorage.setItem(GUEST_PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Lỗi khi lưu dự án khách vào localStorage:', err);
  }
}

/**
 * Sinh ID ngẫu nhiên hợp lệ cho dự án (chữ cái, số, gạch nối)
 */
export function generateProjectId(): string {
  return 'proj_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Lấy danh sách tất cả dự án của người dùng từ Firestore (hoặc localStorage nếu là khách)
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  if (!userId || userId === 'guest') {
    return getGuestProjects();
  }

  if (!db) return [];
  const colPath = `users/${userId}/projects`;

  try {
    const colRef = collection(db, 'users', userId, 'projects');
    const q = query(colRef);
    const snapshot = await getDocs(q);

    const projects: Project[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      const migrated = migrateProjectCode(data);

      projects.push({
        id: data.id || d.id,
        userId: data.userId || userId,
        title: data.title || 'Dự án không tên',
        description: data.description || '',
        languages: data.languages && Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : ['html', 'css', 'js'],
        htmlCode: migrated.htmlCode,
        cssCode: migrated.cssCode,
        jsCode: migrated.jsCode,
        isShared: !!data.isShared,
        sharedAt: data.sharedAt || undefined,
        authorEmail: formatPublicEmailOrUsername(data.authorEmail) || undefined,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    // Sắp xếp theo updatedAt giảm dần (mới nhất lên đầu)
    projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return projects;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
  }
}

/**
 * Lấy một dự án cụ thể theo ID
 */
export async function getProject(userId: string, projectId: string): Promise<Project | null> {
  if (!userId || userId === 'guest') {
    const list = getGuestProjects();
    return list.find((p) => p.id === projectId) || null;
  }

  if (!db) return null;
  const docPath = `users/${userId}/projects/${projectId}`;

  try {
    const docRef = doc(db, 'users', userId, 'projects', projectId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    const migrated = migrateProjectCode(data);

    return {
      id: data.id || snapshot.id,
      userId: data.userId || userId,
      title: data.title || 'Dự án không tên',
      description: data.description || '',
      languages: data.languages && Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : ['html', 'css', 'js'],
      htmlCode: migrated.htmlCode,
      cssCode: migrated.cssCode,
      jsCode: migrated.jsCode,
      isShared: !!data.isShared,
      sharedAt: data.sharedAt || undefined,
      authorEmail: formatPublicEmailOrUsername(data.authorEmail) || undefined,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

/**
 * Lấy dự án công khai được chia sẻ (được phép đọc nếu isShared == true)
 */
export async function getSharedProject(userId: string, projectId: string): Promise<Project | null> {
  if (!db) return null;
  const docPath = `users/${userId}/projects/${projectId}`;

  try {
    const docRef = doc(db, 'users', userId, 'projects', projectId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    // Kiểm tra dự án có đang được chia sẻ không
    if (!data.isShared) {
      return null;
    }

    const migrated = migrateProjectCode(data);

    return {
      id: data.id || snapshot.id,
      userId: data.userId || userId,
      title: data.title || 'Dự án chia sẻ',
      description: data.description || '',
      languages: data.languages && Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : ['html', 'css', 'js'],
      htmlCode: migrated.htmlCode,
      cssCode: migrated.cssCode,
      jsCode: migrated.jsCode,
      isShared: true,
      sharedAt: data.sharedAt || undefined,
      authorEmail: formatPublicEmailOrUsername(data.authorEmail) || undefined,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Không thể tải dự án chia sẻ:', error);
    return null;
  }
}

/**
 * Tạo mới hoặc lưu đè dự án lên Cloud Firestore (hoặc localStorage cho khách)
 */
export async function saveProject(
  userId: string,
  projectData: {
    id?: string;
    title: string;
    description?: string;
    languages?: ('html' | 'css' | 'js')[];
    htmlCode: string;
    cssCode?: string;
    jsCode?: string;
    isShared?: boolean;
    authorEmail?: string;
  }
): Promise<Project> {
  const projectId = projectData.id || generateProjectId();
  const now = new Date().toISOString();

  const project: Project = {
    id: projectId,
    userId: userId || 'guest',
    title: projectData.title.trim() || 'Dự án mới',
    description: projectData.description !== undefined ? projectData.description.trim() : '',
    languages: projectData.languages && projectData.languages.length > 0 ? projectData.languages : ['html', 'css', 'js'],
    htmlCode: projectData.htmlCode || '',
    cssCode: projectData.cssCode || '',
    jsCode: projectData.jsCode || '',
    isShared: !!projectData.isShared,
    authorEmail: formatPublicEmailOrUsername(projectData.authorEmail) || undefined,
    createdAt: now,
    updatedAt: now,
  };

  // If user is guest or not authenticated, persist in localStorage
  if (!userId || userId === 'guest') {
    const list = getGuestProjects();
    const existingIdx = list.findIndex((p) => p.id === projectId);
    if (existingIdx >= 0) {
      list[existingIdx] = {
        ...list[existingIdx],
        ...project,
        createdAt: list[existingIdx].createdAt,
        updatedAt: now,
      };
    } else {
      list.unshift(project);
    }
    saveGuestProjects(list);
    return project;
  }

  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa được kết nối');
  const docPath = `users/${userId}/projects/${projectId}`;

  try {
    const docRef = doc(db, 'users', userId, 'projects', projectId);
    // Clean any undefined properties to prevent Firestore SDK validation errors
    const cleanProject: Record<string, any> = {};
    for (const [key, value] of Object.entries(project)) {
      if (value !== undefined) {
        cleanProject[key] = value;
      }
    }
    await setDoc(docRef, cleanProject);
    return project;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Cập nhật một phần dự án (HTML, CSS, JS, tiêu đề, mô tả, ngôn ngữ, trạng thái chia sẻ)
 */
export async function updateProject(
  userId: string,
  projectId: string,
  updates: Partial<Pick<Project, 'title' | 'description' | 'languages' | 'htmlCode' | 'cssCode' | 'jsCode' | 'isShared' | 'sharedAt' | 'authorEmail'>>
): Promise<void> {
  const now = new Date().toISOString();

  // If user is guest, update localStorage
  if (!userId || userId === 'guest') {
    const list = getGuestProjects();
    const existingIdx = list.findIndex((p) => p.id === projectId);
    if (existingIdx >= 0) {
      list[existingIdx] = {
        ...list[existingIdx],
        ...updates,
        title: updates.title !== undefined ? updates.title.trim() : list[existingIdx].title,
        description: updates.description !== undefined ? updates.description.trim() : list[existingIdx].description,
        languages: updates.languages !== undefined ? updates.languages : list[existingIdx].languages,
        updatedAt: now,
      };
      saveGuestProjects(list);
    }
    return;
  }

  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa được kết nối');
  const docPath = `users/${userId}/projects/${projectId}`;

  try {
    const docRef = doc(db, 'users', userId, 'projects', projectId);
    const payload: Record<string, any> = {
      ...updates,
      updatedAt: now,
    };
    if (payload.title !== undefined) {
      payload.title = payload.title.trim();
    }
    if (payload.description !== undefined) {
      payload.description = payload.description.trim();
    }
    if (payload.authorEmail !== undefined) {
      payload.authorEmail = formatPublicEmailOrUsername(payload.authorEmail) || '';
    }
    // Clean any undefined properties
    const cleanPayload: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) {
        cleanPayload[key] = value;
      }
    }
    await updateDoc(docRef, cleanPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Bật / tắt tính năng chia sẻ dự án công khai
 */
export async function toggleShareProject(
  userId: string,
  projectId: string,
  isShared: boolean,
  authorEmail?: string
): Promise<void> {
  const updates: any = {
    isShared,
    sharedAt: isShared ? new Date().toISOString() : null,
  };
  if (authorEmail) {
    updates.authorEmail = authorEmail;
  }
  await updateProject(userId, projectId, updates);
}

/**
 * Sao chép (Fork) dự án được chia sẻ về tài khoản của người dùng hiện tại
 */
export async function forkProject(
  targetUserId: string,
  targetEmail: string,
  sourceProject: Project
): Promise<Project> {
  const newTitle = `Bản sao của ${sourceProject.title}`.slice(0, 60);
  return await saveProject(targetUserId, {
    title: newTitle,
    description: sourceProject.description,
    languages: sourceProject.languages,
    htmlCode: sourceProject.htmlCode,
    cssCode: sourceProject.cssCode,
    jsCode: sourceProject.jsCode,
    authorEmail: targetEmail,
    isShared: false,
  });
}

/**
 * Xóa một dự án khỏi Firestore (hoặc localStorage cho khách)
 */
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  if (!userId || userId === 'guest') {
    const list = getGuestProjects();
    const remaining = list.filter((p) => p.id !== projectId);
    saveGuestProjects(remaining);
    return;
  }

  if (!db) throw new Error('Cơ sở dữ liệu Firestore chưa được kết nối');
  const docPath = `users/${userId}/projects/${projectId}`;

  try {
    const docRef = doc(db, 'users', userId, 'projects', projectId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
