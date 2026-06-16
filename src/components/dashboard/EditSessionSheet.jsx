import { useState, useEffect } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import './EditSessionSheet.css';

export default function EditSessionSheet({ isOpen, onClose, session }) {
  const { updateSession, deleteSession } = useTimer();
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      setDuration(session.durationMinutes.toString());
    }
  }, [session]);

  if (!isOpen || !session) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const mins = parseInt(duration, 10);
    if (isNaN(mins) || mins < 1) return;

    setIsSubmitting(true);
    try {
      await updateSession(session.id, session.date, mins);
      onClose();
    } catch (error) {
      console.error('Failed to update session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;
    
    // Confirm delete
    if (!window.confirm('Are you sure you want to delete this log?')) return;

    setIsSubmitting(true);
    try {
      await deleteSession(session.id, session.date);
      onClose();
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bottom-sheet ${isOpen ? 'bottom-sheet--open' : ''}`}>
      <div className="bottom-sheet__backdrop" onClick={onClose} />
      <div className="bottom-sheet__content">
        <div className="bottom-sheet__header">
          <h2 className="text-h2">Edit Session</h2>
          <button className="bottom-sheet__close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleUpdate} className="bottom-sheet__body">
          <p className="text-body-sm" style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
            Forgot to stop the timer? You can manually adjust the duration or delete the log entirely.
          </p>

          <div className="form-group">
            <label className="text-label" htmlFor="edit-duration">Aligners out for (minutes)</label>
            <input
              type="number"
              id="edit-duration"
              className="input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleDelete}
              disabled={isSubmitting}
              style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger-light)', background: 'transparent' }}
            >
              Delete
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
              style={{ flex: 2 }}
            >
              {isSubmitting ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
