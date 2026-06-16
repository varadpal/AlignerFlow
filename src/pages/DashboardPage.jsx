import { useState, useEffect } from 'react';
import { MOTIVATIONAL_MESSAGES } from '../utils/constants';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import RadialRing from '../components/stopwatch/RadialRing';
import SessionStopwatch from '../components/stopwatch/SessionStopwatch';
import ToggleButton from '../components/stopwatch/ToggleButton';
import DailySummary from '../components/dashboard/DailySummary';
import SessionPills from '../components/dashboard/SessionPills';
import TrayProgress from '../components/dashboard/TrayProgress';
import StreakBadge from '../components/dashboard/StreakBadge';
import ManualEntrySheet from '../components/manual-entry/ManualEntrySheet';
import SleepModeSheet from '../components/sleep/SleepModeSheet';
import './DashboardPage.css';

export default function DashboardPage() {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showSleepMode, setShowSleepMode] = useState(false);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    // Pick a random motivational message
    const idx = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    setMotivation(MOTIVATIONAL_MESSAGES[idx]);
  }, []);

  return (
    <div className="dashboard-page" id="dashboard-page">
      <Header />

      <div className="page">
        <div className="page-inner">
          <div className="desktop-grid stagger">
            {/* LEFT COLUMN */}
            <div className="stack stack--md">
              <div className="dashboard__motivation text-body-sm">
                {motivation}
              </div>
              <RadialRing />
              <SessionStopwatch />
              <ToggleButton />
              <button
                className="btn btn--ghost dashboard__manual-btn"
                onClick={() => setShowManualEntry(true)}
                id="open-manual-entry"
              >
                + Add manual entry
              </button>
            </div>

            {/* RIGHT COLUMN */}
            <div className="stack stack--md">
              <DailySummary />
              <SessionPills />
              <div className="dashboard__streak-tray">
                <StreakBadge />
              </div>
              <TrayProgress />
              <button
                className="dashboard__sleep-btn btn btn--secondary btn--full"
                onClick={() => setShowSleepMode(true)}
                id="open-sleep-mode"
              >
                <span>🌙</span>
                <span>Sleep Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Bottom Sheets */}
      <ManualEntrySheet
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
      />
      <SleepModeSheet
        isOpen={showSleepMode}
        onClose={() => setShowSleepMode(false)}
      />
    </div>
  );
}
