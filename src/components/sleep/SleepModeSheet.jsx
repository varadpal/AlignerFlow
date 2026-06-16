import { useTimer } from '../../contexts/TimerContext';
import './SleepModeSheet.css';

export default function SleepModeSheet({ isOpen, onClose }) {
  const { startSleepMode, activeSession } = useTimer();

  const handleSleepWith = async () => {
    await startSleepMode(true);
    onClose();
  };

  const handleSleepWithout = async () => {
    await startSleepMode(false);
    onClose();
  };

  // Don't allow sleep mode if already in a removal session
  const isInRemoval = activeSession?.isActive && activeSession.type === 'removal';

  return (
    <>
      <div
        className={`bottom-sheet-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <div className={`bottom-sheet ${isOpen ? 'visible' : ''}`} id="sleep-mode-sheet">
        <div className="bottom-sheet__handle" />

        <h2 className="text-h2" style={{ marginBottom: 'var(--space-xs)' }}>
          🌙 Sleep Mode
        </h2>
        <p className="text-body-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
          How are you sleeping tonight?
        </p>

        {isInRemoval && (
          <div className="sleep-mode__warning card card--flat" style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-sm) var(--space-md)', background: 'var(--warning-surface)' }}>
            <p className="text-body-sm" style={{ color: 'var(--warning-text)' }}>
              ⚠️ You have an active removal session. It will be stopped before sleep mode starts.
            </p>
          </div>
        )}

        <div className="sleep-mode__options">
          <button
            className="sleep-mode__option sleep-mode__option--recommended"
            onClick={handleSleepWith}
            id="sleep-with-aligners"
          >
            <span className="sleep-mode__option-emoji">😴</span>
            <div className="sleep-mode__option-content">
              <div className="sleep-mode__option-title text-h3">Sleeping WITH aligners</div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Recommended. Wear time continues overnight.
              </div>
            </div>
            <span className="badge badge--success">Recommended</span>
          </button>

          <button
            className="sleep-mode__option sleep-mode__option--without"
            onClick={handleSleepWithout}
            id="sleep-without-aligners"
          >
            <span className="sleep-mode__option-emoji">⚠️</span>
            <div className="sleep-mode__option-content">
              <div className="sleep-mode__option-title text-h3">Sleeping WITHOUT aligners</div>
              <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Sleep time will be tracked as removal time.
              </div>
            </div>
          </button>
        </div>

        <button className="btn btn--secondary btn--full" onClick={onClose} style={{ marginTop: 'var(--space-md)' }}>
          Cancel
        </button>
      </div>
    </>
  );
}
