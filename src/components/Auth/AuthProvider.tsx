"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, Auth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseContextProps {
  app: FirebaseApp;
  auth: Auth;
}

const FirebaseContext = createContext<FirebaseContextProps | null>(null);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  return (
    <FirebaseContext.Provider value={{ app, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseAuthProvider");
  }
  return context;
};

interface AuthContextProps {
  user: any;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  createUser: (email: string, password?: string) => Promise<void>;
  signIn: (email: string, password?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { auth } = useFirebase();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase auth state change error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const createUser = async (email: string, password?: string) => {
    try {
      if (!password) {
        throw new Error("Password is required to create a user.");
      }
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      console.error("Error creating user:", error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password?: string) => {
    try {
      if (!password) {
        throw new Error("Password is required to sign in.");
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  const value = { user, loading, signInWithGoogle, createUser, signIn, signOutUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
