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

/** Get wear status based on percentage (used for historical/analytics views) */
export function getWearStatus(percentage) {
  if (percentage >= 95) return { label: 'On Track', type: 'success' };
  if (percentage >= 80) return { label: 'Needs Attention', type: 'warning' };
  return { label: 'Below Target', type: 'danger' };
}

/**
 * Get out-time budget status (used for live dashboard).
 * Evaluates whether the user is within their daily removal budget.
 */
export function getOutTimeStatus(totalRemovalMinutes, goalHours = 22) {
  const outTimeBudget = (24 - goalHours) * 60;
  if (outTimeBudget <= 0) return { label: 'Max Wear', type: 'warning' };
  const usedPercent = (totalRemovalMinutes / outTimeBudget) * 100;
  if (usedPercent <= 75) return { label: 'On Track', type: 'success' };
  if (usedPercent <= 100) return { label: 'Needs Attention', type: 'warning' };
  return { label: 'Over Budget', type: 'danger' };
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

/**
 * Calculate consecutive-day streak from a summary map.
 * Shared by StreakBadge and ReportPage to ensure consistency.
 *
 * Logic:
 *  - If today has data and goalMet → include today, continue backward
 *  - If today has no data yet  → skip today, start from yesterday
 *  - For any past day: if goalMet → count++, else break
 */
export function calculateStreak(summaryMap, days) {
  let count = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    const summary = summaryMap[day];

    if (summary?.goalMet) {
      count++;
    } else if (!summary && i === days.length - 1) {
      // Today has no data yet — skip and check yesterday
      continue;
    } else {
      // Day has data but didn't meet goal, or past day with no data → streak broken
      break;
    }
  }
  return count;
}
