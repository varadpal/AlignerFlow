import { useTimer } from '../../contexts/TimerContext';
import { calcWearPercentage, formatMinutesToDisplay } from '../../utils/timeFormatters';
import './RadialRing.css';

export default function RadialRing() {
  const { todaySummary, goalHours, activeSession } = useTimer();
  const percentageRaw = calcWearPercentage(todaySummary.totalWearMinutes, goalHours);
  const percentage = Math.min(100, percentageRaw); // Cap visual ring at 100%

  // SVG circle math
  const size = 220;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const isActive = activeSession?.isActive;
  const wearDisplay = formatMinutesToDisplay(todaySummary.totalWearMinutes);

  // Out-Time Budget calculation
  const outTimeBudgetMinutes = (24 - goalHours) * 60;
  const outTimeLeftMinutes = Math.max(0, outTimeBudgetMinutes - todaySummary.totalRemovalMinutes);
  const outTimeLeftDisplay = formatMinutesToDisplay(outTimeLeftMinutes);

  return (
    <div className={`radial-ring ${isActive ? 'radial-ring--active' : ''}`} id="radial-ring">
      <svg
        className="radial-ring__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Glow filter */}
        <defs>
          <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="hsl(15, 85%, 58%)" floodOpacity="0.3" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(15, 85%, 62%)" />
            <stop offset="50%" stopColor="hsl(15, 80%, 55%)" />
            <stop offset="100%" stopColor="hsl(25, 75%, 50%)" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          className="radial-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={strokeWidth}
        />

        {/* Progress ring */}
        <circle
          className="radial-ring__progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={percentage > 0 ? "url(#ring-glow)" : "none"}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Decorative dots on track */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle - 90) * (Math.PI / 180);
          const cx = size / 2 + radius * Math.cos(rad);
          const cy = size / 2 + radius * Math.sin(rad);
          return (
            <circle
              key={angle}
              cx={cx}
              cy={cy}
              r={2}
              fill="var(--border)"
              opacity={0.5}
            />
          );
        })}
      </svg>

      <div className="radial-ring__content">
        <div className="radial-ring__time text-display">{wearDisplay}</div>
        <div className="radial-ring__label text-body-sm">of {goalHours}h goal</div>
        
        <div className="radial-ring__budget" style={{ marginTop: 'var(--space-xs)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '12px' }}>
          <span className="text-caption" style={{ color: outTimeLeftMinutes <= 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
            {outTimeLeftMinutes <= 0 ? 'Over out-time budget' : `${outTimeLeftDisplay} out-time left`}
          </span>
        </div>
      </div>

      {/* Ambient glow when active (aligners out) */}
      {isActive && <div className="radial-ring__pulse" />}
    </div>
  );
}
