import { useAuth } from '../../contexts/AuthContext';
import './TrayProgress.css';

export default function TrayProgress() {
  const { userProfile } = useAuth();

  if (!userProfile?.totalTrays) return null;

  const { currentTray = 1, totalTrays = 1, trayDurationDays = 14, trayStartDate } = userProfile;
  const progressPercent = Math.round((currentTray / totalTrays) * 100);

  // Calculate days remaining on current tray
  let daysLeft = trayDurationDays;
  if (trayStartDate) {
    const start = new Date(trayStartDate);
    const now = new Date();
    const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    daysLeft = Math.max(0, trayDurationDays - daysPassed);
  }

  return (
    <div className="tray-progress card card--flat" id="tray-progress">
      <div className="tray-progress__row">
        <div className="tray-progress__info">
          <span className="tray-progress__icon">🦷</span>
          <div>
            <div className="text-h3">Tray {currentTray} of {totalTrays}</div>
            <div className="text-caption" style={{ color: 'var(--text-muted)' }}>
              {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} until next switch` : 'Time to switch!'}
            </div>
          </div>
        </div>
        <div className="tray-progress__percent text-body-sm">{progressPercent}%</div>
      </div>

      <div className="tray-progress__bar">
        <div
          className="tray-progress__fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
