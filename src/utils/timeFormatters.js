/**
 * Time formatting utilities for AlignerFlow
 */

/** Format minutes into "Xh Ym" display */
export function formatMinutesToDisplay(totalMinutes) {
  if (totalMinutes < 0) totalMinutes = 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Format seconds into "HH:MM:SS" stopwatch display */
export function formatSecondsToStopwatch(totalSeconds) {
  if (totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Format minutes into compact form: "22.5h" */
export function formatMinutesToHours(minutes) {
  return `${(minutes / 60).toFixed(1)}h`;
}

/** Calculate wear percentage against goal */
export function calcWearPercentage(wearMinutes, goalHours = 22) {
  const goalMinutes = goalHours * 60;
  return Math.min(100, Math.round((wearMinutes / goalMinutes) * 100));
}

/** Get wear status based on percentage */
export function getWearStatus(percentage) {
  if (percentage >= 95) return { label: 'On Track', type: 'success' };
  if (percentage >= 80) return { label: 'Needs Attention', type: 'warning' };
  return { label: 'Below Target', type: 'danger' };
}

/** Get today's date string in YYYY-MM-DD format */
export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/** Get date string for any date */
export function getDateString(date) {
  return date.toISOString().split('T')[0];
}

/** Format date to display: "Mon, Jun 16" */
export function formatDateDisplay(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/** Get day name abbreviation */
export function getDayAbbr(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
}

/** Calculate days remaining until a date */
export function daysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Get an array of the last N days as YYYY-MM-DD strings */
export function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateString(d));
  }
  return days;
}
