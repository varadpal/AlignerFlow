import { useState, useRef, useEffect } from 'react';
import './InfoTip.css';

/**
 * Small "i" info control.
 * - Touch (mobile/tablet): tap the button to toggle the popup.
 * - Desktop (hover-capable): the popup reveals on hover/focus — and the
 *   parent section can reveal it too via the .info-tip__popup hover rule.
 */
export default function InfoTip({ label = 'More info', align = 'right', children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span className={`info-tip info-tip--${align} ${open ? 'info-tip--open' : ''}`} ref={ref}>
      <button
        type="button"
        className="info-tip__btn"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      <span className="info-tip__popup" role="tooltip">
        {children}
      </span>
    </span>
  );
}
