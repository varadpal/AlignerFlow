import { useState } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import './ToggleButton.css';

export default function ToggleButton() {
  const { activeSession, startSession, stopSession } = useTimer();
  const [isAnimating, setIsAnimating] = useState(false);

  const isOut = activeSession?.isActive;

  const handleToggle = async () => {
    setIsAnimating(true);
    try {
      if (isOut) {
        await stopSession();
      } else {
        await startSession('removal');
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <button
      className={`toggle-btn ${isOut ? 'toggle-btn--out' : 'toggle-btn--in'} ${isAnimating ? 'toggle-btn--animating' : ''}`}
      onClick={handleToggle}
      id="aligners-toggle"
      aria-label={isOut ? 'Put aligners back in' : 'Take aligners out'}
    >
      <span className="toggle-btn__icon">
        {isOut ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        )}
      </span>
      <span className="toggle-btn__text">
        {isOut ? 'Aligners In' : 'Aligners Out'}
      </span>
    </button>
  );
}
