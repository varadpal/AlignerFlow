/**
 * Foreground notification helper.
 * Prefers the service-worker registration's showNotification (works on
 * installed PWAs / Android, where `new Notification()` is unsupported),
 * falling back to the Notification constructor on desktop.
 *
 * NOTE: This only fires while the app is open. Delivering reminders when
 * the app is fully closed requires FCM web push + a Cloud Functions
 * scheduler (Firebase Blaze plan) — see NOTIFICATIONS.md.
 */
export async function showAppNotification(title, options = {}) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const opts = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    ...options,
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, opts);
        return;
      }
    }
    new Notification(title, opts);
  } catch {
    try {
      new Notification(title, opts);
    } catch {
      /* notifications unavailable — ignore */
    }
  }
}

/** True when the browser can show notifications and the user has granted it. */
export function canNotify() {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
}
