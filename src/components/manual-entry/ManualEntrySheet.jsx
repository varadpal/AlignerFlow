import { useState } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { getTodayString } from '../../utils/timeFormatters';
import './ManualEntrySheet.css';

export default function ManualEntrySheet({ isOpen, onClose }) {
  const { addManualSession } = useTimer();
  const [date, setDate] = useState(getTodayString());
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    if (totalMinutes <= 0) return;

    setSaving(true);
    try {
      await addManualSession(date, totalMinutes, note);
      onClose();
      // Reset
      setHours(0);
      setMinutes(30);
      setNote('');
    } catch (err) {
      console.error('Manual entry error:', err);
    }
    setSaving(false);
  };

  return (
    <>
      <div
        className={`bottom-sheet-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <div className={`bottom-sheet ${isOpen ? 'visible' : ''}`} id="manual-entry-sheet">
        <div className="bottom-sheet__handle" />

        <h2 className="text-h2" style={{ marginBottom: 'var(--space-xs)' }}>Add Manual Entry</h2>
        <p className="text-body-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
          Forgot to start the stopwatch? Add the removal time manually.
        </p>

        <form onSubmit={handleSubmit} className="stack stack--md">
          <div>
            <label className="text-label" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Date
            </label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={getTodayString()}
              id="manual-date"
            />
          </div>

          <div>
            <label className="text-label" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Duration
            </label>
            <div className="manual-entry__duration-row">
              <div className="manual-entry__duration-input">
                <input
                  type="number"
                  className="input"
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                  min="0"
                  max="23"
                  id="manual-hours"
                />
                <span className="text-caption">hours</span>
              </div>
              <div className="manual-entry__duration-input">
                <input
                  type="number"
                  className="input"
                  value={minutes}
                  onChange={e => setMinutes(e.target.value)}
                  min="0"
                  max="59"
                  id="manual-minutes"
                />
                <span className="text-caption">min</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-label" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Note (optional)
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Forgot to track lunch"
              value={note}
              onChange={e => setNote(e.target.value)}
              id="manual-note"
            />
          </div>

          <div className="manual-entry__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving} id="manual-submit">
              {saving ? 'Adding...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
