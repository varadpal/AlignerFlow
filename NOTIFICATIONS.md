# Notifications

## What's implemented now (foreground / free)

Notifications fire **only while AlignerFlow is open in a tab or the installed PWA**.
No backend or paid plan required.

- **Permission**: requested from Settings → Reminders → "Enable Alerts"
  (`handleMasterNotificationToggle` in `src/pages/SettingsPage.jsx`).
- **Removal-too-long alerts**: while a removal session is active, alerts fire once
  at each threshold in `REMOVAL_ALERTS` (`30 / 60 / 120` min) — skipped for
  "sleep without aligners" sessions. See the tick effect in
  `src/contexts/TimerContext.jsx`.
- **Daily time reminders**: an always-on 30s scheduler checks the enabled
  reminders' `time` (e.g. `07:30`) and fires once per day (guarded by a
  `localStorage` key `af-reminder-<id>-<date>`). Also in `TimerContext.jsx`.
- **Delivery helper**: `src/utils/notify.js` (`showAppNotification`) prefers the
  service worker's `registration.showNotification` (needed on installed/Android)
  and falls back to `new Notification` on desktop.
- **Test**: Settings → Reminders → "Send a test alert".

### Known limitation
If the app is fully closed, nothing fires — browsers don't run our JS then.
That requires push (below).

---

## Future upgrade: background push (app closed)

Delivering reminders when the app is closed needs **Firebase Cloud Messaging
(FCM) web push** plus a **scheduler** to decide when to send. Outline:

### 1. Prerequisites
- Upgrade Firebase project to the **Blaze (pay-as-you-go)** plan (Cloud Functions
  require it). Reminder volume here is tiny, so cost is effectively ~$0, but a
  billing account must be attached.
- In Firebase Console → Project Settings → Cloud Messaging, generate a **Web Push
  certificate (VAPID key)**.
- iOS caveat: web push only works when the user has **Added to Home Screen**
  (iOS 16.4+). Desktop/Android Chrome work in-browser.

### 2. Client
- `npm i firebase` already present; use `firebase/messaging`.
- On enabling notifications, call `getToken(messaging, { vapidKey, serviceWorkerRegistration })`
  and store the token at `users/{uid}/data/settings.fcmTokens[]`.
- Add a `firebase-messaging-sw.js` (or fold into the existing SW via
  `vite-plugin-pwa` `injectManifest` mode) with an `onBackgroundMessage` /
  `push` + `notificationclick` handler (click → focus/open the app).
  - NOTE: the app currently uses `generateSW` mode. Background push needs a
    **custom service worker**, so switch `vite.config.js` PWA to
    `strategies: 'injectManifest'` and author `src/sw.js`.

### 3. Server (Cloud Functions, scheduled)
- A scheduled function (`onSchedule('every 15 minutes')` or every 5) reads each
  user's enabled reminders + timezone, and for any due in the window sends an
  FCM message to their stored tokens.
- Store the user's **timezone** (and ideally last-sent markers) so reminders fire
  at the right local time and don't duplicate.
- Prune invalid/expired tokens on send failures.

### 4. Data model additions
- `users/{uid}/data/settings.fcmTokens: string[]`
- `users/{uid}/data/settings.timezone: string` (IANA, e.g. `Asia/Kolkata`)
- per-reminder last-sent tracking (e.g. `reminderState/{id}: 'YYYY-MM-DD'`)

When ready to do this, say the word and I'll wire up the client token flow, the
custom service worker, and the scheduled Cloud Function.
