import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  playAsGuest: () => Promise<void>;
  saveGameResult: (score: number, foundTreasure: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      email,
      bestScore: 0,
      gamesPlayed: 0,
      createdAt: serverTimestamp(),
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const playAsGuest = async () => {
    await signInAnonymously(auth);
  };

  const saveGameResult = async (score: number, foundTreasure: boolean) => {
    if (!currentUser || currentUser.isAnonymous) return;

    await addDoc(collection(db, 'gameResults'), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      score,
      foundTreasure,
      timestamp: serverTimestamp(),
    });

    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      await updateDoc(userRef, {
        gamesPlayed: data.gamesPlayed + 1,
        bestScore: Math.max(data.bestScore, score),
      });
    } else {
      await setDoc(userRef, {
        email: currentUser.email,
        bestScore: score,
        gamesPlayed: 1,
        createdAt: serverTimestamp(),
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isGuest: currentUser?.isAnonymous ?? false,
        signIn,
        signUp,
        logout,
        playAsGuest,
        saveGameResult,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
