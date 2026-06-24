import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getLastNDays, getDayAbbr, formatMinutesToHours, calculateStreak } from '../utils/timeFormatters';
import { ACHIEVEMENTS } from '../utils/constants';
import Icon from '../components/common/Icon';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const { user, userProfile } = useAuth();
  const [tab, setTab] = useState('week');
  const [weekData, setWeekData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const goalHours = userProfile?.dailyWearGoalHours || 22;

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Only fetch the last 30 days (doc IDs are YYYY-MM-DD, so range by id)
      const monthDays = getLastNDays(30);
      const summariesRef = collection(db, 'users', user.uid, 'dailySummaries');
      const scopedQuery = query(summariesRef, where(documentId(), '>=', monthDays[0]));
      const snapshot = await getDocs(scopedQuery);
      const summaryMap = {};
      snapshot.forEach(doc => {
        summaryMap[doc.id] = doc.data();
      });

      // Week data
      const weekDays = getLastNDays(7);
      const wData = weekDays.map(d => ({
        date: d,
        day: getDayAbbr(d),
        wearMinutes: summaryMap[d]?.totalWearMinutes || 0,
        goalMet: summaryMap[d]?.goalMet || false
      }));
      setWeekData(wData);

      // Month data (monthDays computed above for the scoped query)
      const mData = monthDays.map(d => ({
        date: d,
        wearMinutes: summaryMap[d]?.totalWearMinutes || 0,
        goalMet: summaryMap[d]?.goalMet || false,
        hasData: !!summaryMap[d]
      }));
      setMonthData(mData);
    } catch (err) {
      console.error('Analytics load error:', err);
    }
    setLoading(false);
  };

  // Calculate max for bar chart scale
  const maxWearHours = Math.max(24, ...weekData.map(d => d.wearMinutes / 60));

  // Determine Unlocked Achievements
  const unlockedAchievements = new Set();
  if (monthData.some(d => d.goalMet)) unlockedAchievements.add('first_day');
  
  const streak = calculateStreak(
    monthData.reduce((acc, d) => ({ ...acc, [d.date]: d }), {}),
    monthData.map(d => d.date)
  );
  if (streak >= 7) unlockedAchievements.add('week_warrior');
  if (streak >= 30) unlockedAchievements.add('iron_mouth');
  
  if (userProfile?.currentTray && userProfile?.totalTrays) {
    if (userProfile.currentTray >= userProfile.totalTrays / 2) unlockedAchievements.add('halfway');
    if (userProfile.currentTray === userProfile.totalTrays) unlockedAchievements.add('final_stretch');
  }

  const perfectWeek = weekData.length === 7 && weekData.every(d => d.goalMet);
  if (perfectWeek) unlockedAchievements.add('perfect_week');

  return (
    <div className="analytics-page" id="analytics-page">
      <Header />
      <div className="page">
        <div className="page-inner">
          <h1 className="text-h1" style={{ marginBottom: 'var(--space-xs)' }}>Analytics</h1>
          <p className="text-body-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
            Your wear time patterns and insights
          </p>

          {/* Tabs */}
          <div className="analytics__tabs">
            {['week', 'month'].map(t => (
              <button
                key={t}
                className={`analytics__tab ${tab === t ? 'analytics__tab--active' : ''}`}
                onClick={() => setTab(t)}
                id={`tab-${t}`}
              >
                {t === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="analytics__loading">
              <div className="analytics__spinner" />
            </div>
          ) : (
            <div className="desktop-grid">
              {/* LEFT COLUMN: Charts & Stats */}
              <div className="stack stack--md">
                {tab === 'week' && (
                  <div className="animate-fade-in-up stack stack--md">
                    {/* Weekly Bar Chart */}
                    <div className="card analytics__chart-card">
                      <h3 className="text-h3" style={{ marginBottom: 'var(--space-md)' }}>Daily Wear Time</h3>
                      <div className="analytics__bar-chart">
                        {/* Goal line */}
                        <div
                          className="analytics__goal-line"
                          style={{ bottom: `${(goalHours / maxWearHours) * 100}%` }}
                        >
                          <span className="analytics__goal-label text-caption">{goalHours}h goal</span>
                        </div>

                        {weekData.map((d, i) => {
                          const hours = d.wearMinutes / 60;
                          const heightPct = (hours / maxWearHours) * 100;
                          // Colour each bar against the user's (dynamic) goal:
                          // at/above goal → blue, within 2h below → gold, further below → red
                          const barLevel = hours >= goalHours
                            ? 'success'
                            : hours >= goalHours - 2
                            ? 'warning'
                            : 'danger';
                          return (
                            <div key={d.date} className="analytics__bar-col">
                              <div className="analytics__bar-wrapper">
                                <div
                                  className={`analytics__bar analytics__bar--${barLevel}`}
                                  style={{
                                    height: `${Math.max(2, heightPct)}%`,
                                    animationDelay: `${i * 80}ms`
                                  }}
                                >
                                  <span className="analytics__bar-value text-caption">
                                    {formatMinutesToHours(d.wearMinutes)}
                                  </span>
                                </div>
                              </div>
                              <span className="analytics__bar-day text-caption">{d.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="analytics__stats-row">
                      <div className="card analytics__stat-card">
                        <div className="analytics__stat-value">
                          {formatMinutesToHours(
                            weekData.reduce((s, d) => s + d.wearMinutes, 0) / Math.max(1, weekData.filter(d => d.wearMinutes > 0).length)
                          )}
                        </div>
                        <div className="text-caption" style={{ color: 'var(--text-muted)' }}>Avg Daily</div>
                      </div>
                      <div className="card analytics__stat-card">
                        <div className="analytics__stat-value" style={{ color: 'var(--success)' }}>
                          {weekData.filter(d => d.goalMet).length}/{weekData.length}
                        </div>
                        <div className="text-caption" style={{ color: 'var(--text-muted)' }}>Days On Goal</div>
                      </div>
                      <div className="card analytics__stat-card">
                        <div className="analytics__stat-value" style={{ color: 'var(--accent)' }}>
                          {formatMinutesToHours(
                            Math.max(...weekData.map(d => d.wearMinutes), 0)
                          )}
                        </div>
                        <div className="text-caption" style={{ color: 'var(--text-muted)' }}>Best Day</div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'month' && (
                  <div className="animate-fade-in-up stack stack--md">
                    {/* Monthly Heatmap */}
                    <div className="card analytics__chart-card">
                      <h3 className="text-h3" style={{ marginBottom: 'var(--space-md)' }}>30-Day Heatmap</h3>
                      <div className="analytics__heatmap">
                        {monthData.map((d, i) => {
                          const hours = d.wearMinutes / 60;
                          let cellClass = 'analytics__heat-cell';
                          if (!d.hasData) cellClass += ' analytics__heat-cell--empty';
                          else if (hours >= goalHours) cellClass += ' analytics__heat-cell--great';
                          else if (hours >= goalHours - 2) cellClass += ' analytics__heat-cell--good';
                          else cellClass += ' analytics__heat-cell--poor';

                          return (
                            <div
                              key={d.date}
                              className={cellClass}
                              title={`${d.date}: ${formatMinutesToHours(d.wearMinutes)}`}
                              style={{ animationDelay: `${i * 20}ms` }}
                            />
                          );
                        })}
                      </div>
                      <div className="analytics__heatmap-legend">
                        <span className="text-caption" style={{ color: 'var(--text-muted)' }}>Less</span>
                        <div className="analytics__heat-cell analytics__heat-cell--empty analytics__heat-cell--legend" />
                        <div className="analytics__heat-cell analytics__heat-cell--poor analytics__heat-cell--legend" />
                        <div className="analytics__heat-cell analytics__heat-cell--good analytics__heat-cell--legend" />
                        <div className="analytics__heat-cell analytics__heat-cell--great analytics__heat-cell--legend" />
                        <span className="text-caption" style={{ color: 'var(--text-muted)' }}>More</span>
                      </div>
                    </div>

                    {/* Monthly Stats */}
                    <div className="analytics__stats-row">
                      <div className="card analytics__stat-card">
                        <div className="analytics__stat-value">
                          {formatMinutesToHours(
                            monthData.reduce((s, d) => s + d.wearMinutes, 0) / Math.max(1, monthData.filter(d => d.hasData).length)
                          )}
                        </div>
                        <div className="text-caption" style={{ color: 'var(--text-muted)' }}>Avg Daily</div>
                      </div>
                      <div className="card analytics__stat-card">
                        <div className="analytics__stat-value" style={{ color: 'var(--success)' }}>
                          {Math.round(
                            (monthData.filter(d => d.goalMet).length / Math.max(1, monthData.filter(d => d.hasData).length)) * 100
                          )}%
                        </div>
                        <div className="text-caption" style={{ color: 'var(--text-muted)' }}>Compliance</div>
                      </div>
                      <div className="card analytics__stat-card">
                        <div className="analytics__stat-value" style={{ color: 'var(--accent)' }}>
                          {monthData.filter(d => d.hasData).length}
                        </div>
                        <div className="text-caption" style={{ color: 'var(--text-muted)' }}>Days Tracked</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Achievements */}
              <div className="stack stack--md">
                <div className="card analytics__achievements">
                  <h3 className="text-h3" style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                    <Icon name="trophy" size={18} /> Achievements
                  </h3>
                  <div className="analytics__badge-grid">
                    {Object.values(ACHIEVEMENTS).map(ach => {
                      const isUnlocked = unlockedAchievements.has(ach.id);
                      return (
                        <div key={ach.id} className={`analytics__badge ${isUnlocked ? '' : 'analytics__badge--locked'}`} title={ach.description}>
                          <span className="analytics__badge-emoji" style={{ background: ach.color }}>
                            <Icon name={ach.icon} size={22} strokeWidth={2.25} />
                          </span>
                          <span className="analytics__badge-title text-caption">{ach.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
