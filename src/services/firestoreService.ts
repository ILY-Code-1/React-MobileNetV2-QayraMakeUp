import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { db } from '../firebase';

export const USERS_COLLECTION = 'users_qayra';
export const ANALYSIS_COLLECTION = 'analysis_qayra';

// ============================================================================
// TYPES
// ============================================================================

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  eventDate: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface AnalysisData {
  id: string;
  userId: string;
  name: string;
  email: string;
  eventDate: string;
  result?: string;
  imageUrl?: string;
  createdAt?: string;

  // ML Result fields (backward compatible)
  modelOutputRaw?: number[];
  predictedLabel?: string;
  predictedLabelDisplay?: string;
  confidenceScore?: number;
  generatedSummary?: string;
  clinicalNotes?: string;

  // New ML fields (optional for backward compatibility)
  summaryType?: 'single_dominant' | 'dual_blend' | 'multi_blend';
  primaryClass?: string;
  secondaryClass?: string;
  tertiaryClass?: string;
  clinicalFocus?: string;
  treatmentPriority?: string[];
  preparationProtocol?: {
    '7_days_before'?: string[];
    '3_days_before'?: string[];
    day_of_makeup?: string[];
  };
  topClasses?: Array<{
    key: string;
    label: string;
    probability: number;
    rank: number;
  }>;

  // Admin notes
  catatan_qayra?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Strip password before returning UserData to the caller */
function stripPassword(data: Record<string, unknown>, id: string): UserData {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _p, ...rest } = data;
  return { id, ...rest } as UserData;
}

// ============================================================================
// AUTH (Firestore-only, no Firebase Authentication)
// ============================================================================

export const loginWithFirebase = async (email: string, password: string): Promise<UserData> => {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('email', '==', email.toLowerCase())
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error('Email atau password salah.');
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  if (userData['status'] === 'inactive') {
    throw new Error('Akun tidak aktif. Hubungi administrator.');
  }

  const storedHash: string = userData['password'] ?? '';
  if (!storedHash) {
    throw new Error('Akun belum memiliki password. Hubungi administrator.');
  }

  const isValid = await bcrypt.compare(password, storedHash);
  if (!isValid) {
    throw new Error('Email atau password salah.');
  }

  await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
    lastLoginAt: new Date().toISOString(),
  });

  return stripPassword(userData, userDoc.id);
};

export const logoutFromFirebase = async (): Promise<void> => {
  // No Firebase Auth session to clear; state is managed by the caller.
};

// ============================================================================
// USERS
// ============================================================================

export const getAllUsers = async (filters?: {
  status?: string;
  role?: string;
}): Promise<UserData[]> => {
  let q;

  if (filters?.status) {
    q = query(
      collection(db, USERS_COLLECTION),
      where('status', '==', filters.status)
    );
  } else if (filters?.role) {
    q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', filters.role)
    );
  } else {
    q = query(collection(db, USERS_COLLECTION));
  }

  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((d) => stripPassword(d.data(), d.id));

  // Sort in memory to include documents without createdAt field
  return users.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    const validA = isNaN(timeA) ? 0 : timeA;
    const validB = isNaN(timeB) ? 0 : timeB;

    return validB - validA; // Descending order
  });
};

export const getUserById = async (userId: string): Promise<UserData | null> => {
  const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (!docSnap.exists()) return null;
  return stripPassword(docSnap.data(), docSnap.id);
};

/**
 * Admin membuat user baru langsung ke Firestore (tanpa Firebase Authentication).
 * Password di-hash menggunakan bcrypt sebelum disimpan.
 */
export const createUserAsAdmin = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  eventDate?: string;
}): Promise<UserData> => {
  const emailLower = userData.email.toLowerCase();

  // Cek duplikasi email
  const q = query(collection(db, USERS_COLLECTION), where('email', '==', emailLower));
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error('Email sudah terdaftar. Gunakan email lain.');
  }

  const password = await bcrypt.hash(userData.password, 10);
  const now = new Date().toISOString();
  const newDocRef = doc(collection(db, USERS_COLLECTION));

  const newUser = {
    name: userData.name,
    email: emailLower,
    password,
    role: userData.role,
    status: 'active' as const,
    eventDate: userData.eventDate ?? '',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, newUser);

  return stripPassword(newUser, newDocRef.id);
};

export const updateUser = async (
  userId: string,
  data: Partial<Omit<UserData, 'id'>> & { password?: string }
): Promise<void> => {
  const { password, ...rest } = data;

  const updateData: Record<string, unknown> = {
    ...rest,
    updatedAt: new Date().toISOString(),
  };

  if (password) {
    updateData['password'] = await bcrypt.hash(password, 10);
  }

  await updateDoc(doc(db, USERS_COLLECTION, userId), updateData);
};

export const deleteUserFromFirestore = async (userId: string): Promise<void> => {
  await deleteDoc(doc(db, USERS_COLLECTION, userId));
};

export const updateUserStatus = async (
  userId: string,
  status: 'active' | 'inactive' | 'pending'
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    status,
    updatedAt: new Date().toISOString(),
  });
};

// ============================================================================
// ANALYSIS
// ============================================================================

export const getAnalysisByUser = async (userId: string): Promise<AnalysisData[]> => {
  const q = query(
    collection(db, ANALYSIS_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const analyses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AnalysisData));

  // Sort in memory by createdAt (descending)
  return analyses.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    const validA = isNaN(timeA) ? 0 : timeA;
    const validB = isNaN(timeB) ? 0 : timeB;

    return validB - validA; // Descending order
  });
};

export const getAnalysisById = async (analysisId: string): Promise<AnalysisData | null> => {
  const docSnap = await getDoc(doc(db, ANALYSIS_COLLECTION, analysisId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as AnalysisData;
};

export const getAllAnalyses = async (): Promise<AnalysisData[]> => {
  const q = query(collection(db, ANALYSIS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AnalysisData));
};

export const saveAnalysis = async (
  data: Omit<AnalysisData, 'id' | 'createdAt'>
): Promise<AnalysisData> => {
  const now = new Date().toISOString();
  const newDoc = doc(collection(db, ANALYSIS_COLLECTION));
  const newData = { ...data, createdAt: now };
  await setDoc(newDoc, newData);
  return { id: newDoc.id, ...newData };
};

export const deleteAnalysis = async (analysisId: string): Promise<void> => {
  await deleteDoc(doc(db, ANALYSIS_COLLECTION, analysisId));
};
