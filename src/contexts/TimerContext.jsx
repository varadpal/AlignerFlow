import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  doc, getDoc, setDoc, addDoc, collection,
  query, where, getDocs, serverTimestamp, Timestamp, onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { getTodayString } from '../utils/timeFormatters';
import { MINUTES_IN_DAY } from '../utils/constants';

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const { user, userProfile } = useAuth();

  // Active session state
  const [activeSession, setActiveSession] = useState(null); // { isActive, startTime, type }
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [userSettings, setUserSettings] = useState(null);
  const intervalRef = useRef(null);
  const firedNotificationsRef = useRef(new Set());

  // Today's data
  const [todaySessions, setTodaySessions] = useState([]);
  const [todaySummary, setTodaySummary] = useState({
    totalWearMinutes: 0,
    totalRemovalMinutes: 0,
    sessionCount: 0,
    goalMet: false
  });

  const goalHours = userProfile?.dailyWearGoalHours || 22;

  // ─── Listen for user settings ───
  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, 'users', user.uid, 'data', 'settings');
    const unsub = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        setUserSettings(snap.data());
      }
    });
    return () => unsub();
  }, [user]);

  // ─── Listen for active session from Firestore ───
  useEffect(() => {
    if (!user) return;

    const activeRef = doc(db, 'users', user.uid, 'data', 'activeSession');
    const unsub = onSnapshot(activeRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.isActive && data.startTime) {
          const startMs = data.startTime.toDate
            ? data.startTime.toDate().getTime()
            : new Date(data.startTime).getTime();
          setActiveSession({
            isActive: true,
            startTime: startMs,
            type: data.type || 'removal'
          });
        } else {
          setActiveSession(null);
        }
      } else {
        setActiveSession(null);
      }
    });

    return () => unsub();
  }, [user]);

  // ─── Tick the stopwatch when a session is active ───
  useEffect(() => {
    if (activeSession?.isActive && activeSession.startTime) {
      // Calculate initial elapsed
      const calcElapsed = () => {
        return Math.floor((Date.now() - activeSession.startTime) / 1000);
      };
      setElapsedSeconds(calcElapsed());

      // Tick every second
      intervalRef.current = setInterval(() => {
        const currentElapsed = calcElapsed();
        setElapsedSeconds(currentElapsed);

        // Check for notifications
        if (userSettings?.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          const reminders = userSettings.reminders || [];
          reminders.forEach(reminder => {
            if (!reminder.enabled) return;
            
            let thresholdMinutes = 0;
            if (reminder.label.includes('Clean')) thresholdMinutes = 15;
            else if (reminder.label.includes('Snack')) thresholdMinutes = 30;
            else if (reminder.label.includes('Meal')) thresholdMinutes = 45;

            if (thresholdMinutes > 0 && currentElapsed >= thresholdMinutes * 60 && !firedNotificationsRef.current.has(reminder.id)) {
              firedNotificationsRef.current.add(reminder.id);
              new Notification('AlignerFlow Reminder', {
                body: `It's been ${thresholdMinutes} minutes. ${reminder.bestPracticeNote}`,
                icon: '/icon.svg'
              });
            }
          });
        }
      }, 1000);

      return () => clearInterval(intervalRef.current);
    } else {
      setElapsedSeconds(0);
      firedNotificationsRef.current.clear();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [activeSession, userSettings]);

  // ─── Load today's sessions ───
  useEffect(() => {
    if (!user) return;

    const today = getTodayString();
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const q = query(sessionsRef, where('date', '==', today));

    const unsub = onSnapshot(q, (snapshot) => {
      const sessions = [];
      snapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      sessions.sort((a, b) => {
        const aTime = a.startTime?.toDate ? a.startTime.toDate().getTime() : new Date(a.startTime).getTime();
        const bTime = b.startTime?.toDate ? b.startTime.toDate().getTime() : new Date(b.startTime).getTime();
        return aTime - bTime;
      });
      setTodaySessions(sessions);
    });

    return () => unsub();
  }, [user]);

  // ─── Recalculate today's summary whenever sessions change ───
  useEffect(() => {
    const totalRemovalMinutes = todaySessions.reduce((sum, s) => {
      return sum + (s.durationMinutes || 0);
    }, 0);

    // Add currently active session time
    let activeRemovalMinutes = 0;
    if (activeSession?.isActive) {
      activeRemovalMinutes = elapsedSeconds / 60;
    }

    const totalRemoval = totalRemovalMinutes + activeRemovalMinutes;

    // Calculate minutes elapsed so far today
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const minutesElapsedToday = (now - startOfDay) / (1000 * 60);

    // Wear = (Elapsed time today) - total removal time
    const wearMinutes = Math.max(0, Math.min(MINUTES_IN_DAY, minutesElapsedToday) - totalRemoval);

    const goalMinutes = goalHours * 60;

    setTodaySummary({
      totalWearMinutes: Math.round(wearMinutes),
      totalRemovalMinutes: Math.round(totalRemoval),
      sessionCount: todaySessions.length + (activeSession?.isActive ? 1 : 0),
      manualCount: todaySessions.filter(s => s.isManual).length,
      goalMet: wearMinutes >= goalMinutes,
      minutesElapsedToday: Math.round(minutesElapsedToday)
    });
  }, [todaySessions, activeSession, elapsedSeconds, goalHours]);

  // ─── Start removal session (Aligners Out) ───
  const startSession = useCallback(async (type = 'removal') => {
    if (!user) return;

    const activeRef = doc(db, 'users', user.uid, 'data', 'activeSession');
    await setDoc(activeRef, {
      isActive: true,
      startTime: Timestamp.now(),
      type
    });
  }, [user]);

  // ─── Stop removal session (Aligners In) ───
  const stopSession = useCallback(async () => {
    if (!user || !activeSession?.isActive) return;

    const now = Date.now();
    const durationMinutes = Math.round((now - activeSession.startTime) / (1000 * 60));
    const today = getTodayString();

    // Save completed session
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    await addDoc(sessionsRef, {
      startTime: Timestamp.fromMillis(activeSession.startTime),
      endTime: Timestamp.now(),
      durationMinutes: Math.max(1, durationMinutes),
      date: today,
      type: activeSession.type || 'removal',
      isManual: false
    });

    // Clear active session
    const activeRef = doc(db, 'users', user.uid, 'data', 'activeSession');
    await setDoc(activeRef, { isActive: false });

    // Update daily summary in Firestore
    await updateDailySummary(today);
  }, [user, activeSession]);

  // ─── Add manual session ───
  const addManualSession = useCallback(async (date, durationMinutes, note = '') => {
    if (!user) return;

    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    await addDoc(sessionsRef, {
      startTime: Timestamp.now(), // approximate
      endTime: Timestamp.now(),
      durationMinutes: Math.max(1, durationMinutes),
      date,
      type: 'manual',
      isManual: true,
      note
    });

    await updateDailySummary(date);
  }, [user]);

  // ─── Update existing session ───
  const updateSession = useCallback(async (sessionId, date, newDurationMinutes) => {
    if (!user) return;
    
    const sessionRef = doc(db, 'users', user.uid, 'sessions', sessionId);
    await setDoc(sessionRef, {
      durationMinutes: Math.max(1, newDurationMinutes)
    }, { merge: true });

    await updateDailySummary(date);
  }, [user]);

  // ─── Delete existing session ───
  const deleteSession = useCallback(async (sessionId, date) => {
    if (!user) return;
    
    const { deleteDoc } = await import('firebase/firestore');
    const sessionRef = doc(db, 'users', user.uid, 'sessions', sessionId);
    await deleteDoc(sessionRef);

    await updateDailySummary(date);
  }, [user]);

  // ─── Start sleep mode ───
  const startSleepMode = useCallback(async (withAligners = true) => {
    if (!user) return;

    if (withAligners) {
      // Sleeping with aligners — just mark sleep mode active
      const settingsRef = doc(db, 'users', user.uid, 'data', 'settings');
      await setDoc(settingsRef, {
        sleepModeActive: true,
        sleepWithAligners: true,
        sleepStartTime: Timestamp.now()
      }, { merge: true });
    } else {
      // Sleeping without aligners
      // Fix #3: Stop any active removal session first!
      if (activeSession?.isActive) {
        await stopSession();
      }
      
      await startSession('sleep_without');
      const settingsRef = doc(db, 'users', user.uid, 'data', 'settings');
      await setDoc(settingsRef, {
        sleepModeActive: true,
        sleepWithAligners: false,
        sleepStartTime: Timestamp.now()
      }, { merge: true });
    }
  }, [user, startSession, activeSession, stopSession]);

  // ─── End sleep mode ───
  const endSleepMode = useCallback(async () => {
    if (!user) return;

    const settingsRef = doc(db, 'users', user.uid, 'data', 'settings');
    const snap = await getDoc(settingsRef);
    const settings = snap.data();

    if (settings?.sleepModeActive) {
      // If sleeping without aligners, stop the active removal session
      if (!settings.sleepWithAligners && activeSession?.isActive) {
        await stopSession();
      }

      await setDoc(settingsRef, {
        sleepModeActive: false,
        sleepWithAligners: null,
        sleepStartTime: null
      }, { merge: true });
    }
  }, [user, activeSession, stopSession]);

  // ─── Update daily summary in Firestore ───
  const updateDailySummary = async (date) => {
    if (!user) return;

    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const q = query(sessionsRef, where('date', '==', date));
    const snapshot = await getDocs(q);

    let totalRemoval = 0;
    let sleepRemoval = 0;
    let longestRemoval = 0;
    let sessionCount = 0;
    let manualCount = 0;

    snapshot.forEach(docSnap => {
      const s = docSnap.data();
      const dur = s.durationMinutes || 0;
      totalRemoval += dur;
      if (s.type === 'sleep_without') sleepRemoval += dur;
      if (dur > longestRemoval) longestRemoval = dur;
      sessionCount++;
      if (s.isManual) manualCount++;
    });

    const totalWear = MINUTES_IN_DAY - totalRemoval;
    const goalMinutes = goalHours * 60;

    const summaryRef = doc(db, 'users', user.uid, 'dailySummaries', date);
    await setDoc(summaryRef, {
      date,
      totalWearMinutes: Math.max(0, totalWear),
      totalRemovalMinutes: totalRemoval,
      sleepRemovalMinutes: sleepRemoval,
      sessionCount,
      manualSessionCount: manualCount,
      goalMet: totalWear >= goalMinutes,
      longestRemoval
    });
  };

  const value = {
    activeSession,
    elapsedSeconds,
    todaySessions,
    todaySummary,
    goalHours,
    startSession,
    stopSession,
    addManualSession,
    updateSession,
    deleteSession,
    startSleepMode,
    endSleepMode
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export default TimerContext;
