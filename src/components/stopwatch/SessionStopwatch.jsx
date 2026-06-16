import { useTimer } from '../../contexts/TimerContext';
import { formatSecondsToStopwatch } from '../../utils/timeFormatters';
import './SessionStopwatch.css';

export default function SessionStopwatch() {
  const { activeSession, elapsedSeconds } = useTimer();

  if (!activeSession?.isActive) return null;

  const typeLabel = activeSession.type === 'sleep_without'
    ? 'Sleeping without aligners'
    : 'Current removal session';

  return (
    <div className="session-stopwatch animate-fade-in-up" id="session-stopwatch">
      <div className="session-stopwatch__icon">
        {activeSession.type === 'sleep_without' ? '😴' : '⏱'}
      </div>
      <div className="session-stopwatch__info">
        <div className="session-stopwatch__time">
          {formatSecondsToStopwatch(elapsedSeconds)}
        </div>
        <div className="session-stopwatch__label text-caption">{typeLabel}</div>
      </div>
      <div className="session-stopwatch__dot" />
    </div>
  );
}
