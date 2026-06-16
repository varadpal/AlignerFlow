import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_REMINDERS } from '../utils/constants';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, userProfile, updateProfile, signOut } = useAuth();
  const [settings, setSettings] = useState(null);
  const [editingTreatment, setEditingTreatment] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState({});
  const [goalHours, setGoalHours] = useState(userProfile?.dailyWearGoalHours || 22);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      setGoalHours(userProfile.dailyWearGoalHours || 22);
      setTreatmentForm({
        totalTrays: userProfile.totalTrays || '',
        currentTray: userProfile.currentTray || '',
        trayDurationDays: userProfile.trayDurationDays || 14,
        alignerBrand: userProfile.alignerBrand || ''
      });
    }
  }, [userProfile]);

  const loadSettings = async () => {
    const settingsRef = doc(db, 'users', user.uid, 'data', 'settings');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      setSettings(snap.data());
    } else {
      setSettings({ reminders: DEFAULT_REMINDERS, notificationsEnabled: false });
    }
  };

  const handleGoalChange = async (value) => {
    const newGoal = parseFloat(value);
    setGoalHours(newGoal);
    await updateProfile({ dailyWearGoalHours: newGoal });
  };

  const handleTreatmentSave = async () => {
    await updateProfile({
      totalTrays: parseInt(treatmentForm.totalTrays) || userProfile.totalTrays,
      currentTray: parseInt(treatmentForm.currentTray) || userProfile.currentTray,
      trayDurationDays: parseInt(treatmentForm.trayDurationDays) || 14,
      alignerBrand: treatmentForm.alignerBrand || ''
    });
    setEditingTreatment(false);
  };

  const handleReminderToggle = async (reminderId) => {
    if (!settings) return;
    const updated = settings.reminders.map(r =>
      r.id === reminderId ? { ...r, enabled: !r.enabled } : r
    );
    const settingsRef = doc(db, 'users', user.uid, 'data', 'settings');
    await setDoc(settingsRef, { ...settings, reminders: updated }, { merge: true });
    setSettings(prev => ({ ...prev, reminders: updated }));
  };

  const handleMasterNotificationToggle = async () => {
    if (!settings) return;
    const newStatus = !settings.notificationsEnabled;
    
    if (newStatus && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Please allow notifications in your browser settings to receive reminders.');
        return;
      }
    }

    const settingsRef = doc(db, 'users', user.uid, 'data', 'settings');
    await setDoc(settingsRef, { notificationsEnabled: newStatus }, { merge: true });
    setSettings(prev => ({ ...prev, notificationsEnabled: newStatus }));
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  return (
    <div className="settings-page" id="settings-page">
      <Header />
      <div className="page">
        <div className="page-inner">
          <h1 className="text-h1" style={{ marginBottom: 'var(--space-lg)' }}>Settings</h1>

          {/* Profile Section */}
          <div className="card settings__section">
            <h3 className="text-h3 settings__section-title">Profile</h3>
            <div className="settings__profile-row">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt="Profile"
                  className="settings__profile-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="settings__profile-avatar settings__profile-avatar--fallback">
                  {(userProfile?.displayName || 'U').charAt(0)}
                </div>
              )}
              <div>
                <div className="text-body" style={{ fontWeight: 'var(--fw-semibold)' }}>
                  {userProfile?.displayName || 'User'}
                </div>
                <div className="text-caption" style={{ color: 'var(--text-muted)' }}>
                  {userProfile?.email || ''}
                </div>
              </div>
            </div>
          </div>

          {/* Treatment Setup */}
          <div className="card settings__section">
            <div className="row row--between" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="text-h3">Treatment Setup</h3>
              {!editingTreatment ? (
                <button className="btn btn--ghost btn--sm" onClick={() => setEditingTreatment(true)} id="edit-treatment">
                  Edit
                </button>
              ) : (
                <button className="btn btn--ghost btn--sm" onClick={handleTreatmentSave} id="save-treatment" style={{ color: 'var(--success)' }}>
                  Save
                </button>
              )}
            </div>

            {!editingTreatment ? (
              <div className="settings__detail-list">
                <div className="settings__detail-row">
                  <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Total trays</span>
                  <span className="text-body-sm" style={{ fontWeight: 'var(--fw-semibold)' }}>
                    {userProfile?.totalTrays || '—'}
                  </span>
                </div>
                <div className="settings__detail-row">
                  <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Current tray</span>
                  <span className="text-body-sm" style={{ fontWeight: 'var(--fw-semibold)' }}>
                    {userProfile?.currentTray || '—'}
                  </span>
                </div>
                <div className="settings__detail-row">
                  <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Days per tray</span>
                  <span className="text-body-sm" style={{ fontWeight: 'var(--fw-semibold)' }}>
                    {userProfile?.trayDurationDays || 14}
                  </span>
                </div>
                {userProfile?.alignerBrand && (
                  <div className="settings__detail-row">
                    <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Brand</span>
                    <span className="text-body-sm" style={{ fontWeight: 'var(--fw-semibold)' }}>
                      {userProfile.alignerBrand}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="stack stack--sm">
                <input
                  className="input"
                  type="number"
                  placeholder="Total trays"
                  value={treatmentForm.totalTrays}
                  onChange={e => setTreatmentForm(f => ({ ...f, totalTrays: e.target.value }))}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Current tray"
                  value={treatmentForm.currentTray}
                  onChange={e => setTreatmentForm(f => ({ ...f, currentTray: e.target.value }))}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Days per tray"
                  value={treatmentForm.trayDurationDays}
                  onChange={e => setTreatmentForm(f => ({ ...f, trayDurationDays: e.target.value }))}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Aligner brand (optional)"
                  value={treatmentForm.alignerBrand}
                  onChange={e => setTreatmentForm(f => ({ ...f, alignerBrand: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* Appearance */}
          <div className="card settings__section">
            <div className="row row--between">
              <h3 className="text-h3 settings__section-title" style={{ margin: 0 }}>Appearance</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="text-caption" style={{ color: 'var(--text-muted)' }}>Dark Mode</span>
                <button
                  className={`toggle ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                    const newTheme = isDark ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    localStorage.setItem('theme', newTheme);
                    // Force re-render to update toggle state
                    setSettings(prev => ({ ...prev }));
                  }}
                  aria-label="Toggle dark mode"
                />
              </div>
            </div>
          </div>

          {/* Wear Goal */}
          <div className="card settings__section">
            <h3 className="text-h3 settings__section-title">Daily Wear Goal</h3>
            <div className="settings__goal-display">
              <span className="settings__goal-value">{goalHours}h</span>
            </div>
            <input
              type="range"
              className="onboarding__slider"
              min="18"
              max="24"
              step="0.5"
              value={goalHours}
              onChange={e => handleGoalChange(e.target.value)}
              id="settings-goal-slider"
            />
            <div className="onboarding__slider-labels">
              <span className="text-caption" style={{ color: 'var(--text-muted)' }}>18h</span>
              <span className="text-caption" style={{ color: 'var(--text-muted)' }}>24h</span>
            </div>
          </div>

          {/* Reminders */}
          <div className="card settings__section">
            <div className="row row--between" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="text-h3 settings__section-title" style={{ margin: 0 }}>Reminders</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="text-caption" style={{ color: 'var(--text-muted)' }}>Enable Alerts</span>
                <button
                  className={`toggle ${settings?.notificationsEnabled ? 'active' : ''}`}
                  onClick={handleMasterNotificationToggle}
                  aria-label="Toggle all notifications"
                />
              </div>
            </div>
            
            <div className="settings__reminder-list">
              {(settings?.reminders || DEFAULT_REMINDERS).map(reminder => (
                <div key={reminder.id} className="settings__reminder-row">
                  <div className="settings__reminder-info">
                    <div className="text-body-sm" style={{ fontWeight: 'var(--fw-semibold)' }}>
                      {reminder.label}
                    </div>
                    <div className="text-caption" style={{ color: 'var(--text-muted)' }}>
                      {reminder.time} · {reminder.bestPracticeNote}
                    </div>
                  </div>
                  <button
                    className={`toggle ${reminder.enabled ? 'active' : ''}`}
                    onClick={() => handleReminderToggle(reminder.id)}
                    aria-label={`Toggle ${reminder.label} reminder`}
                  />
                </div>
              ))}
            </div>
            <p className="text-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
              ℹ️ Times shown are recommended defaults for each activity
            </p>
          </div>

          {/* Sign Out */}
          <button
            className="btn btn--secondary btn--full settings__signout"
            onClick={handleSignOut}
            id="sign-out"
          >
            Sign Out
          </button>

          <p className="text-caption" style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            AlignerFlow v1.0 · Made with 🦷 for your smile
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
