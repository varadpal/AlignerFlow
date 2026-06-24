import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  reauthenticateWithPopup,
  deleteUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { DEFAULT_WEAR_GOAL_HOURS, DEFAULT_TRAY_DURATION_DAYS, DEFAULT_REMINDERS } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profileRef = doc(db, 'users', firebaseUser.uid, 'data', 'profile');
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            setUserProfile(profileSnap.data());
          } else {
            const newProfile = {
              displayName: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              onboardingComplete: false,
              createdAt: serverTimestamp()
            };
            await setDoc(profileRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const profileRef = doc(db, 'users', user.uid, 'data', 'profile');
    await setDoc(profileRef, updates, { merge: true });
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const completeOnboarding = async (treatmentData) => {
    if (!user) return;
    const profileRef = doc(db, 'users', user.uid, 'data', 'profile');
    const settingsRef = doc(db, 'users', user.uid, 'data', 'settings');

    const profileUpdate = {
      ...treatmentData,
      onboardingComplete: true,
      treatmentStartDate: treatmentData.trayStartDate || new Date().toISOString()
    };

    const settingsData = {
      reminders: DEFAULT_REMINDERS,
      notificationsEnabled: false,
      sleepModeActive: false
    };

    await setDoc(profileRef, profileUpdate, { merge: true });
    await setDoc(settingsRef, settingsData, { merge: true });
    setUserProfile(prev => ({ ...prev, ...profileUpdate }));
  };

  const deleteAccount = async () => {
    if (!user) return;
    const uid = user.uid;

    // 1) Firebase requires recent authentication before deleting an account.
    await reauthenticateWithPopup(auth, googleProvider);

    // 2) Best-effort cleanup of Firestore data while still authenticated.
    //    A cleanup failure must NOT block the actual account deletion.
    const clearCollection = async (path) => {
      try {
        const snap = await getDocs(collection(db, 'users', uid, path));
        await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      } catch (err) {
        console.error(`Account data cleanup failed for "${path}":`, err);
      }
    };
    await Promise.all([
      clearCollection('data'),
      clearCollection('sessions'),
      clearCollection('notes'),
      clearCollection('dailySummaries'),
    ]);

    // 3) Delete the Firebase Auth user (re-auth + retry if the window lapsed).
    try {
      await deleteUser(auth.currentUser);
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        await reauthenticateWithPopup(auth, googleProvider);
        await deleteUser(auth.currentUser);
      } else {
        console.error('Delete account error:', error);
        throw error;
      }
    }
    // onAuthStateChanged handles redirect/cleanup once the user is gone.
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
    completeOnboarding,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
