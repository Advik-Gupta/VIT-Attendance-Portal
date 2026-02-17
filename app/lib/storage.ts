import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase";

/* ================= LOCAL ================= */

export const saveToLocal = (key: string, data: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const loadFromLocal = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

/* ================= FIREBASE ================= */

const getUserDocId = () => auth.currentUser?.uid;

export const saveToFirebase = async (data: unknown) => {
  try {
    await setDoc(doc(db, "users", getUserDocId()!), { data });
  } catch (err) {
    console.error("Firebase save failed:", err);
  }
};

export const loadFromFirebase = async <T>(fallback: T): Promise<T> => {
  try {
    const snap = await getDoc(doc(db, "users", getUserDocId()!));
    if (snap.exists()) {
      return snap.data().data as T;
    }
    return fallback;
  } catch (err) {
    console.error("Firebase load failed:", err);
    return fallback;
  }
};

/* ================= HYBRID ================= */

export const saveToStorage = async (key: string, data: unknown) => {
  // Always save locally
  saveToLocal(key, data);

  // Save entire app state to firebase
  const localState = {
    subjects: loadFromLocal("subjects", []),
    attendance: loadFromLocal("attendance", {}),
    timetable: loadFromLocal("timetable", {}),
  };

  await saveToFirebase(localState);
};

export const loadFromStorage = async <T>(
  key: string,
  fallback: T,
): Promise<T> => {
  const firebaseData = await loadFromFirebase<{
    subjects: unknown;
    attendance: unknown;
    timetable: unknown;
  } | null>(null);

  if (firebaseData && firebaseData[key as keyof typeof firebaseData]) {
    const value = firebaseData[key as keyof typeof firebaseData] as T;

    // sync local
    saveToLocal(key, value);

    return value;
  }

  // fallback to local
  return loadFromLocal(key, fallback);
};
