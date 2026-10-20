import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  needsProfileSetup: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: { branch: string; academicYear: string; displayName?: string }) => Promise<void>;
  completeInitialProfile: (data: { branch: string; academicYear: string; displayName: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary bootstrap admin email (from prompt configuration)
const BOOTSTRAP_ADMIN_EMAIL = 'shubhamaggrawal15@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState<boolean>(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setRole('student');
        setNeedsProfileSetup(false);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        const isBootstrapAdmin = currentUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          const assignedRole = (isBootstrapAdmin || data.role === 'admin') ? 'admin' : 'student';
          
          setProfile({
            ...data,
            role: assignedRole,
          });
          setRole(assignedRole);

          // Check if onboarding branch & year are filled
          if (!data.branch || !data.academicYear) {
            setNeedsProfileSetup(true);
          } else {
            setNeedsProfileSetup(false);
          }
        } else {
          // First time sign-in: create initial document and trigger setup modal
          const initialRole: UserRole = isBootstrapAdmin ? 'admin' : 'student';
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Campus Student',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            branch: '',
            academicYear: '',
            role: initialRole,
            createdAt: new Date().toISOString(),
          };

          try {
            await setDoc(userRef, {
              ...newProfile,
              serverCreatedAt: serverTimestamp(),
            });
          } catch (writeErr) {
            handleFirestoreError(writeErr, OperationType.WRITE, `users/${currentUser.uid}`);
          }

          setProfile(newProfile);
          setRole(initialRole);
          setNeedsProfileSetup(true);
        }
      } catch (err) {
        console.error('Error fetching or initializing user profile:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google Sign-In Error:', error);
        throw error;
      }
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setProfile(null);
      setRole('student');
      setNeedsProfileSetup(false);
    } catch (error) {
      console.error('Sign-Out Error:', error);
      throw error;
    }
  };

  const completeInitialProfile = async (data: { branch: string; academicYear: string; displayName: string }) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        branch: data.branch,
        academicYear: data.academicYear,
        displayName: data.displayName,
      });

      setProfile((prev) => (prev ? {
        ...prev,
        branch: data.branch,
        academicYear: data.academicYear,
        displayName: data.displayName,
      } : null));
      setNeedsProfileSetup(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateUserProfile = async (data: { branch: string; academicYear: string; displayName?: string }) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updates: Record<string, any> = {
        branch: data.branch,
        academicYear: data.academicYear,
      };
      if (data.displayName) {
        updates.displayName = data.displayName;
      }
      await updateDoc(userRef, updates);

      setProfile((prev) => (prev ? {
        ...prev,
        ...data,
      } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin: role === 'admin',
        loading,
        needsProfileSetup,
        signInWithGoogle,
        signOut,
        updateUserProfile,
        completeInitialProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
