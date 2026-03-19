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
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../firebase';

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

  // ML Result fields
  modelOutputRaw?: number[];
  predictedLabel?: string;
  predictedLabelDisplay?: string;
  confidenceScore?: number;
  generatedSummary?: string;
  clinicalNotes?: string;

  // Admin notes
  catatan_qayra?: string;
}

// ============================================================================
// AUTH
// ============================================================================

export const loginWithFirebase = async (email: string, password: string): Promise<UserData> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  const userDoc = await getDoc(doc(db, USERS_COLLECTION, credential.user.uid));
  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error('Data user tidak ditemukan. Hubungi administrator.');
  }

  const userData = userDoc.data();

  if (userData['status'] === 'inactive') {
    await signOut(auth);
    throw new Error('Akun tidak aktif. Hubungi administrator.');
  }

  await updateDoc(doc(db, USERS_COLLECTION, credential.user.uid), {
    lastLoginAt: new Date().toISOString(),
  });

  return { id: credential.user.uid, ...userData } as UserData;
};

export const logoutFromFirebase = async (): Promise<void> => {
  await signOut(auth);
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
  const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserData));

  // Sort in memory to include documents without createdAt field
  return users.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    
    // Handle invalid dates (NaN)
    const validA = isNaN(timeA) ? 0 : timeA;
    const validB = isNaN(timeB) ? 0 : timeB;
    
    return validB - validA; // Descending order
  });
};

export const getUserById = async (userId: string): Promise<UserData | null> => {
  const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as UserData;
};

/**
 * Admin membuat user baru menggunakan secondary Firebase app instance
 * agar admin tidak ter-logout saat create user baru
 */
export const createUserAsAdmin = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  eventDate?: string;
}): Promise<UserData> => {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  const secondaryDb = getFirestore(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      userData.email,
      userData.password
    );

    const now = new Date().toISOString();
    const newUser = {
      name: userData.name,
      email: userData.email.toLowerCase(),
      role: userData.role,
      status: 'active' as const,
      eventDate: userData.eventDate ?? '',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(secondaryDb, USERS_COLLECTION, credential.user.uid), newUser);

    return { id: credential.user.uid, ...newUser };
  } finally {
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);
  }
};

export const updateUser = async (
  userId: string,
  data: Partial<Omit<UserData, 'id'>>
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
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
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AnalysisData));
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
