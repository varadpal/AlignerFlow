import { useTimer } from '../../contexts/TimerContext';
import { formatMinutesToDisplay } from '../../utils/timeFormatters';
import Icon from '../common/Icon';
import './RadialRing.css';

export default function RadialRing() {
  const { todaySummary, goalHours, activeSession } = useTimer();

  // ── Out-time budget logic ──────────────────────────────────────
  // Goal: user wants to WEAR aligners for `goalHours`.
  // Budget: how many minutes they're allowed OUT per day = (24 - goalHours) * 60
  // Ring:   starts FULL (fully orange) and depletes as out-time is used up.
  // When budget hits 0 → over-budget state.

  const outTimeBudgetMinutes = (24 - goalHours) * 60;           // e.g. 22h goal → 2h = 120 min budget
  const outTimeUsedMinutes   = todaySummary.totalRemovalMinutes; // minutes spent with aligners out
  const outTimeLeftMinutes   = Math.max(0, outTimeBudgetMinutes - outTimeUsedMinutes);
  const isOverBudget         = outTimeUsedMinutes > outTimeBudgetMinutes;
  const overByMinutes        = isOverBudget ? Math.round(outTimeUsedMinutes - outTimeBudgetMinutes) : 0;

  // Ring fill = remaining fraction of the budget (1 = full, 0 = empty)
  const fillFraction = Math.max(0, Math.min(1, outTimeLeftMinutes / outTimeBudgetMinutes));

  // ── SVG math ──────────────────────────────────────────────────
  const size        = 220;
  const strokeWidth = 12;
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // offset 0 = full ring; offset = circumference = empty ring
  const offset = circumference * (1 - fillFraction);

  // ── Display strings ───────────────────────────────────────────
  const outTimeLeftDisplay = formatMinutesToDisplay(outTimeLeftMinutes);
  const overByDisplay      = formatMinutesToDisplay(overByMinutes);

  const isActive = activeSession?.isActive;

  // Stroke colour: orange when fine, transitions to red when <= 15 min left or over budget
  const isWarning = !isOverBudget && outTimeLeftMinutes <= 15;
  const strokeColor = isOverBudget
    ? 'url(#ring-gradient-danger)'
    : isWarning
    ? 'url(#ring-gradient-warning)'
    : 'url(#ring-gradient)';

  return (
    <div
      className={`radial-ring ${isActive ? 'radial-ring--active' : ''} ${isOverBudget ? 'radial-ring--over' : ''}`}
      id="radial-ring"
    >
      <svg
        className="radial-ring__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Out-time remaining: ${isOverBudget ? 'over budget' : outTimeLeftDisplay}`}
      >
        <defs>
          {/* PlayStation Blue glow */}
          <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#0070d1" floodOpacity="0.35" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Danger red glow */}
          <filter id="ring-glow-danger" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor="#c81b3a" floodOpacity="0.35" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* PlayStation Blue gradient */}
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#53b1ff" />
            <stop offset="50%"  stopColor="#0070d1" />
            <stop offset="100%" stopColor="#004d8d" />
          </linearGradient>
          {/* Warning gold gradient */}
          <linearGradient id="ring-gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ffce21" />
            <stop offset="100%" stopColor="#ee8e00" />
          </linearGradient>
          {/* Danger red gradient */}
          <linearGradient id="ring-gradient-danger" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#c81b3a" />
            <stop offset="100%" stopColor="#a0142d" />
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

        {/* Progress ring — depletes as out-time is consumed */}
        <circle
          className="radial-ring__progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={isOverBudget ? 'url(#ring-glow-danger)' : fillFraction > 0 ? 'url(#ring-glow)' : 'none'}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Decorative tick dots */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle - 90) * (Math.PI / 180);
          const cx  = size / 2 + radius * Math.cos(rad);
          const cy  = size / 2 + radius * Math.sin(rad);
          return (
            <circle key={angle} cx={cx} cy={cy} r={2} fill="var(--border)" opacity={0.5} />
          );
        })}
      </svg>

      {/* ── Centre content ── */}
      <div className="radial-ring__content">
        {isOverBudget ? (
          /* Over-budget state */
          <>
            <div className="radial-ring__over-icon"><Icon name="alert-triangle" size={22} /></div>
            <div className="radial-ring__time radial-ring__time--over">
              +{overByDisplay}
            </div>
            <div className="radial-ring__label radial-ring__label--over">
              over {goalHours}h goal
            </div>
            <div className="radial-ring__budget radial-ring__budget--over">
              <span>Put aligners back in</span>
            </div>
          </>
        ) : (
          /* Normal state — heading = time left, sub = goal */
          <>
            <div className="radial-ring__time">
              {outTimeLeftDisplay}
            </div>
            <div className="radial-ring__label">
              {goalHours}h goal
            </div>
            <div className={`radial-ring__budget ${isWarning ? 'radial-ring__budget--warning' : ''}`}>
              <span>out-time left</span>
            </div>
          </>
        )}
      </div>

      {/* Ambient glow pulse when aligners are currently out */}
      {isActive && <div className={`radial-ring__pulse ${isOverBudget ? 'radial-ring__pulse--danger' : ''}`} />}
    </div>
  );
}
