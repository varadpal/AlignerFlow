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
    try {
      // Firebase requires recent authentication before deleting an account.
      await reauthenticateWithPopup(auth, googleProvider);

      // Delete all known Firestore sub-documents under users/{uid}/data/
      const dataCollectionRef = collection(db, 'users', user.uid, 'data');
      const dataSnap = await getDocs(dataCollectionRef);
      const deletePromises = dataSnap.docs.map((d) => deleteDoc(d.ref));

      // Also delete any sessions sub-collection docs
      const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      const sessionsSnap = await getDocs(sessionsRef);
      sessionsSnap.docs.forEach((d) => deletePromises.push(deleteDoc(d.ref)));

      // Delete journal notes
      const notesRef = collection(db, 'users', user.uid, 'notes');
      const notesSnap = await getDocs(notesRef);
      notesSnap.docs.forEach((d) => deletePromises.push(deleteDoc(d.ref)));

      // Delete daily summaries
      const summariesRef = collection(db, 'users', user.uid, 'dailySummaries');
      const summariesSnap = await getDocs(summariesRef);
      summariesSnap.docs.forEach((d) => deletePromises.push(deleteDoc(d.ref)));

      await Promise.all(deletePromises);

      // Finally delete the Firebase Auth user
      await deleteUser(auth.currentUser);

      // AuthContext onAuthStateChanged will handle cleanup automatically
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
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
