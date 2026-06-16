# AlignerFlow — Project Context & Goals

## Project Vision & Goals
**AlignerFlow** is a mobile-first Progressive Web App (PWA) designed to help users track and maintain their clear aligner journey. The core feature is a highly reliable stopwatch to track removal time (when aligners are out of the mouth) and calculate exact wear time against a 24-hour goal. 

The application is built to be a premium, production-grade utility with a distinct "Warm Clinical Serenity" aesthetic — moving away from generic blue medical themes and opting instead for a warm, glassmorphic, and dynamic interface that feels like a high-end habit tracker.

### Key Functional Requirements
- **Persistent Stopwatch:** A timer that calculates elapsed time reliably based on a start timestamp, so it survives browser restarts and tab closures.
- **Treatment Setup:** Users can configure their total trays, current tray, duration per tray, and aligner brand.
- **Goal Tracking:** A daily wear goal (typically 20-22 hours) mapped against actual wear time.
- **Data Persistence:** Backed by Firebase Auth and Firestore, supporting offline capabilities.
- **Analytics & Reports:** Deep insights into wear habits, streaks, and compliance rates via charts and heatmaps.
- **Sleep & Manual Modes:** Allowances for offline tracking or edge cases (sleeping without aligners, forgot to tap stopwatch).

## Architecture & Tech Stack
- **Frontend Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Vanilla CSS Custom Properties (CSS variables) + BEM methodology + custom glassmorphism and animations. **No Tailwind.**
- **Backend/DB:** Firebase (Authentication + Firestore)
- **State Management:** React Context API (`AuthContext`, `TimerContext`)
- **Hosting / PWA:** Configured for eventual PWA deployment (manifest, service workers).

---

## Project Phases & Status

### Phase 1: Foundation & Auth 
**Status: ✅ Completed**
- Initialized Vite + React project.
- Established CSS design system (tokens, typography, base utilities).
- Firebase configuration and initialization.
- Google Sign-In flow via `AuthContext`.
- Protected routing and App shell implementation (Header, BottomNav).
- *Added a Demo backdoor in LoginPage to test UI without Firebase.*

### Phase 2: Onboarding & Treatment Setup 
**Status: ✅ Completed**
- 3-step onboarding flow (Treatment specs, Daily Goal, Confirmation summary).
- Storage of treatment configuration in Firestore/Context.
- Tray progress calculation logic.

### Phase 3: Core Stopwatch Logic 
**Status: ✅ Completed**
- `RadialRing` SVG component for visual feedback.
- `ToggleButton` with spring animations for "Aligners In/Out".
- `SessionStopwatch` ticking counter display.
- Firestore persistence via `activeSession` singleton.
- Timer resume logic (calculating delta from server timestamp).
- Session completion, duration calculation, and daily summary aggregation.

### Phase 4: Main Dashboard 
**Status: ✅ Completed**
- Daily summary metric cards.
- Session pills (timeline of today's removals).
- Streak badge logic and display.
- Tray progress visual bar.
- Manual Entry bottom sheet (retroactive addition of forgotten times).
- Sleep Mode bottom sheet (sleeping with vs. without aligners).

### Phase 5: Analytics 
**Status: ✅ Completed**
- Weekly bar chart (built with pure CSS and React logic, no chart library dependencies).
- 30-Day monthly heatmap grid.
- Stats summary cards (Avg daily, Compliance %, Best day).
- Achievements gallery (Badge UI).

### Phase 6: Reports & Settings 
**Status: ✅ Completed**
- Auto-generated weekly/monthly analysis text and metrics.
- Report export/share UI shell.
- Settings page for Profile info, Treatment Setup editing, Goal adjustment.
- Reminders toggle UI with best-practice notes.

### Phase 7: Polish, Offline & PWA 
**Status: ⏳ Pending**
- Notes & Journal feature implementation.
- Browser push notification integration for reminders.
- PWA manifest completion and Service Worker setup for full offline installability.
- Actual PDF export functionality (`html2canvas` + `jsPDF`).
- Live Firebase credential integration (requires user to provide `.env` config from their Firebase console).

---

## Current Development State (As of Checkpoint)
- The entire frontend interface is structurally complete and fully styled.
- **Firebase integration is complete**. The application now uses live Authentication and Firestore data persistence via the `.env` configuration. 
- The Demo Mode backdoor has been removed for production readiness.

## Design System Notes (for future agents)
- Use standard CSS in respective component `.css` files.
- Stick to the defined CSS variables (`var(--accent)`, `var(--bg-base)`, etc.) found in `index.css`.
- Ensure new components maintain the "Warm Clinical Serenity" feel (light backgrounds, subtle gradients, glass overlays, rounded corners).
- Mobile-first approach: always assume mobile viewport dimensions for layout and touch interactions.
