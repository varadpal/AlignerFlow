import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { getLastNDays, calculateStreak } from '../../utils/timeFormatters';
import './StreakBadge.css';

export default function StreakBadge() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadStreak();
  }, [user]);

  const loadStreak = async () => {
    try {
      // Check last 90 days for streak
      const days = getLastNDays(90);
      const summariesRef = collection(db, 'users', user.uid, 'dailySummaries');

      // Fetch all summaries
      const snapshot = await getDocs(summariesRef);
      const summaryMap = {};
      snapshot.forEach(doc => {
        summaryMap[doc.id] = doc.data();
      });

      // Count consecutive days meeting goal using the shared utility
      const count = calculateStreak(summaryMap, days);

      setStreak(count);
    } catch (err) {
      console.error('Streak calc error:', err);
    }
  };

  return (
    <div className="streak-badge" id="streak-badge">
      <span className="streak-badge__fire">🔥</span>
      <span className="streak-badge__count">{streak}</span>
      <span className="streak-badge__label">day streak</span>
    </div>
  );
}
