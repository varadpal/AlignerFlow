/**
 * App constants for AlignerFlow
 */

export const DEFAULT_WEAR_GOAL_HOURS = 22;
export const MIN_WEAR_GOAL_HOURS = 18;
export const MAX_WEAR_GOAL_HOURS = 24;
export const DEFAULT_TRAY_DURATION_DAYS = 14;
export const MINUTES_IN_DAY = 1440;

/** Reminder notification thresholds (minutes with aligners out) */
export const REMOVAL_ALERTS = [30, 60, 120];

/** Achievement definitions */
export const ACHIEVEMENTS = {
  FIRST_DAY: {
    id: 'first_day',
    title: 'First Full Day',
    description: 'Met your wear goal for the first time',
    emoji: '🌟'
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: '7-day streak of meeting your goal',
    emoji: '⚔️'
  },
  IRON_MOUTH: {
    id: 'iron_mouth',
    title: 'Iron Mouth',
    description: '30-day streak — incredible discipline!',
    emoji: '🏆'
  },
  HALFWAY: {
    id: 'halfway',
    title: 'Halfway There',
    description: 'Reached 50% of your total trays',
    emoji: '🎯'
  },
  FINAL_STRETCH: {
    id: 'final_stretch',
    title: 'Final Stretch',
    description: 'You\'re on your last tray!',
    emoji: '🏁'
  },
  PERFECT_WEEK: {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: '7 days all above goal — perfection',
    emoji: '💎'
  },
  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Logged your first session before 8 AM',
    emoji: '🐦'
  },
  NIGHT_OWL: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Used sleep mode for the first time',
    emoji: '🦉'
  }
};

/** Note tag definitions */
export const NOTE_TAGS = [
  { id: 'dental', label: 'Dental Visit', emoji: '🦷' },
  { id: 'discomfort', label: 'Discomfort', emoji: '😣' },
  { id: 'switch', label: 'Tray Switch', emoji: '🔄' },
  { id: 'milestone', label: 'Milestone', emoji: '🎉' },
  { id: 'general', label: 'General Note', emoji: '📝' }
];

/** Default reminder presets */
export const DEFAULT_REMINDERS = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    time: '07:30',
    enabled: true,
    isDefault: true,
    bestPracticeNote: 'Recommended: Keep removal under 30 min for meals'
  },
  {
    id: 'lunch',
    label: 'Lunch',
    time: '12:30',
    enabled: true,
    isDefault: true,
    bestPracticeNote: 'Recommended: Keep removal under 30 min for meals'
  },
  {
    id: 'dinner',
    label: 'Dinner',
    time: '19:00',
    enabled: true,
    isDefault: true,
    bestPracticeNote: 'Recommended: Keep removal under 45 min for dinner'
  },
  {
    id: 'bedtime',
    label: 'Bedtime',
    time: '22:00',
    enabled: true,
    isDefault: true,
    bestPracticeNote: 'Best practice: Always wear aligners while sleeping'
  },
  {
    id: 'morning_check',
    label: 'Morning Check',
    time: '08:00',
    enabled: false,
    isDefault: true,
    bestPracticeNote: 'Reminder to confirm aligners are in after breakfast'
  }
];

/** Motivational messages */
export const MOTIVATIONAL_MESSAGES = [
  "Every hour counts toward your perfect smile! 😊",
  "Consistency is the secret to great results ✨",
  "Your future self will thank you for wearing them today 💪",
  "Small daily effort, life-changing results 🌟",
  "You're building a habit that transforms your smile 🦷",
  "One tray at a time, one day at a time 🎯",
  "Discipline today, confidence tomorrow 💎",
  "Keep going — you're doing amazing! 🔥",
  "Your smile journey is beautiful — just like you 💫",
  "Progress, not perfection. You've got this! 🙌"
];
