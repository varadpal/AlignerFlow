import { useState } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { formatMinutesToDisplay } from '../../utils/timeFormatters';
import EditSessionSheet from './EditSessionSheet';
import './SessionPills.css';

export default function SessionPills() {
  const { todaySessions } = useTimer();
  const [editingSession, setEditingSession] = useState(null);

  if (todaySessions.length === 0) {
    return (
      <div className="session-pills session-pills--empty" id="session-pills">
        <p className="text-body-sm" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
          No removal sessions today — keep it up! 🎯
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="session-pills" id="session-pills">
        <h3 className="text-h3 session-pills__title">Today's Removals</h3>
        <p className="text-caption" style={{ marginBottom: 'var(--space-md)', color: 'var(--text-muted)' }}>
          Tap a log to edit or delete it.
        </p>
        <div className="session-pills__list">
          {todaySessions.map((session, i) => {
            const typeIcon = session.type === 'sleep_without' ? '😴'
              : session.isManual ? '✏️'
              : '⏱';

            return (
              <div
                key={session.id || i}
                className={`session-pill ${session.isManual ? 'session-pill--manual' : ''} ${session.type === 'sleep_without' ? 'session-pill--sleep' : ''}`}
                onClick={() => setEditingSession(session)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span className="session-pill__icon">{typeIcon}</span>
                <span className="session-pill__duration">
                  {formatMinutesToDisplay(session.durationMinutes || 0)}
                </span>
                {session.isManual && <span className="session-pill__badge">manual</span>}
              </div>
            );
          })}
        </div>
      </div>

      <EditSessionSheet
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        session={editingSession}
      />
    </>
  );
}
