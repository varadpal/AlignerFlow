import { useTimer } from '../../contexts/TimerContext';
import { getOutTimeStatus, formatMinutesToDisplay } from '../../utils/timeFormatters';
import './DailySummary.css';

export default function DailySummary() {
  const { todaySummary, goalHours } = useTimer();
  const status = getOutTimeStatus(todaySummary.totalRemovalMinutes, goalHours);

  const stats = [
    {
      label: 'Worn',
      value: formatMinutesToDisplay(todaySummary.totalWearMinutes),
      accent: false
    },
    {
      label: 'Removed',
      value: formatMinutesToDisplay(todaySummary.totalRemovalMinutes),
      accent: true
    },
    {
      label: 'Sessions',
      value: todaySummary.sessionCount.toString(),
      accent: false
    }
  ];

  return (
    <div className="daily-summary card" id="daily-summary">
      <div className="daily-summary__header">
        <h3 className="text-h3">Today's Summary</h3>
        <span className={`badge badge--${status.type}`}>{status.label}</span>
      </div>

      <div className="daily-summary__stats">
        {stats.map((stat, i) => (
          <div key={i} className="daily-summary__stat">
            <div className={`daily-summary__stat-value ${stat.accent ? 'daily-summary__stat-value--accent' : ''}`}>
              {stat.value}
            </div>
            <div className="daily-summary__stat-label text-caption">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
