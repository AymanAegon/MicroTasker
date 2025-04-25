'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {useRouter} from 'next/navigation';
import {FirebaseApp, initializeApp} from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  getAuth as getFirebaseAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

interface FirebaseContextProps {
  app: FirebaseApp;
  auth: Auth;
}

const FirebaseContext = createContext<FirebaseContextProps | null>(null);

export function FirebaseAuthProvider({children}: {children: ReactNode}) {
  return (
    <FirebaseProvider>{children}</FirebaseProvider>
  );
}

function FirebaseProvider({children}: {children: ReactNode}) {
  const [initialized, setInitialized] = useState(false);
  const [firebaseData, setFirebaseData] = useState<FirebaseContextProps | null>(
    null
  );

  useEffect(() => {
    const initializeFirebase = async () => {
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        throw new Error(
          'NEXT_PUBLIC_FIREBASE_API_KEY environment variable is not set. ' +
            'Make sure you have defined it in your .env file and added it to your ' +
            'hosting environment variables.'
        );
      }

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);
      setFirebaseData({app, auth});
      setInitialized(true);
    };
    initializeFirebase();
  }, []);

  if (!initialized || !firebaseData) {
    return <div>Loading</div>;
  }

  return (
    <FirebaseContext.Provider value={firebaseData}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  createUser: (email: string, password?: string) => Promise<void>;
  signIn: (email: string, password?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUser: (userId: string, fieldsToUpdate: {}) => Promise<void>;
  firestorePromises: Promise<{getFirestore: any, doc: any, updateDoc: any}>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [auth, setAuth] = useState<Auth | null>(null);
    const firebase = useFirebase();

  useEffect(() => {
    if (firebase) {
      setAuth(firebase.auth);
    }
  }, [firebase])

  const loadFirestore = async () => {
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      return { getFirestore, doc, updateDoc };
    }
    catch (error) {
      console.error('Error loading Firestore:', error);
      throw error;
    }
  };

  const firestorePromises = loadFirestore();
  
  useEffect(() => {
    if(auth){
        const unsubscribe = auth.onAuthStateChanged(
          async (authUser) => {
             if (authUser && firebase) {
                // User is signed in.
                const { getFirestore, doc, getDoc } = await import('firebase/firestore');
                const db = getFirestore(firebase.app);
    
              if(!db){
                console.error("Firestore database instance is not available.");
                setUser(authUser);
              } else {
                const userDocRef = doc(db, 'users', authUser.uid);
                const userDocSnap = await getDoc(userDocRef);
    
              if (userDocSnap.exists()) {
                // User document exists, update state with full data
                const userData = userDocSnap.data();
                setUser({ ...authUser, ...userData });
              } else {
                // User document does not exist
                console.warn(`User document not found for user ID: ${authUser.uid}`);
                setUser(authUser);
              }
            }
            } else {
              // User is signed out.
              setUser(null);
            }
            setLoading(false);
          },
          error => {
            console.error(
              'Firebase auth state change error:',
              error
            );
            setLoading(false);
          }
        );
    
        return () => unsubscribe();
    }
    
  }, [auth, firebase]);

  const signInWithGoogle = async () => {
    if (auth) {
        const provider = new GoogleAuthProvider();
        try {
          await signInWithPopup(auth, provider);
          router.push('/');
        } catch (error) {
          console.error('Google sign-in error:', error);
        }
      }
    };

  const createUser = async (email: string, password?: string) => {
    if(auth){
      try {
        if (!password) {
          throw new Error('Password is required to create a user.');
        }
        await createUserWithEmailAndPassword(auth, email, password);
        router.push('/');
      } catch (error: any) {
        // console.error('Error creating user:', error.message);
        throw error;
      }
    }
  };

  const signIn = async (email: string, password?: string) => {
    if (auth){
      try {
        if (!password) {
          throw new Error('Password is required to sign in.');
        }
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      } catch (error: any) {
        // console.error('Error signing in:', error.message);
        throw error;
      }
    }
  };

    const signOutUser = async () => {
        if (auth) {
            try {
                await signOut(auth);
                router.push('/login');
            } catch (error) {
                console.error('Sign-out error:', error);
            }
        }
      };
  const updateUser = async (userId: string, fieldsToUpdate: {}) => {
    const { getFirestore, doc, updateDoc } = await firestorePromises;    
    let db
    if (firebase){
        db = getFirestore(firebase.app);
    }

    try {
      if (!userId) {
        throw new Error('User ID is required to update the user.');
      }
      if (!fieldsToUpdate) {
        throw new Error('Fields to update are required to update the user.');
      }
      if (!db) {
        throw new Error('Firestore database instance is not available.');
      }
        const { getDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, fieldsToUpdate);
      const userDocSnap = await getDoc(userRef);
      if (userDocSnap.exists()) {
          setUser({ ...user!, ...userDocSnap.data() });
      }
      console.log('User document updated successfully!');
    } catch (error: any) {
      console.error('Error updating user document:', error.message);
    }
  };

  const value : AuthContextProps = {
    user,
    loading,
    signInWithGoogle,
    createUser,
    signIn,
    updateUser,
    signOutUser,
    firestorePromises,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
