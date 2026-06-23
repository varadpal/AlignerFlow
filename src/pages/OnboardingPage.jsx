import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_WEAR_GOAL_HOURS, DEFAULT_TRAY_DURATION_DAYS, DEFAULT_REMINDERS } from '../utils/constants';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const { completeOnboarding, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form data
  const [totalTrays, setTotalTrays] = useState('');
  const [trayDurationDays, setTrayDurationDays] = useState(DEFAULT_TRAY_DURATION_DAYS);
  const [currentTray, setCurrentTray] = useState('1');
  const [trayStartDate, setTrayStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [alignerBrand, setAlignerBrand] = useState('');
  const [dailyWearGoalHours, setDailyWearGoalHours] = useState(DEFAULT_WEAR_GOAL_HOURS);

  const totalSteps = 3;

  const handleComplete = async () => {
    setSaving(true);
    try {
      await completeOnboarding({
        totalTrays: parseInt(totalTrays) || 20,
        trayDurationDays: parseInt(trayDurationDays) || DEFAULT_TRAY_DURATION_DAYS,
        currentTray: parseInt(currentTray) || 1,
        trayStartDate,
        alignerBrand: alignerBrand || '',
        dailyWearGoalHours
      });
    } catch (err) {
      console.error('Onboarding error:', err);
    }
    setSaving(false);
  };

  const canProceedStep1 = totalTrays && currentTray && trayStartDate;

  return (
    <div className="onboarding-page" id="onboarding-page">
      <div className="onboarding-page__content">
        {/* Progress */}
        <div className="onboarding__progress">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`onboarding__progress-dot ${s <= step ? 'onboarding__progress-dot--active' : ''} ${s < step ? 'onboarding__progress-dot--done' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding__step-label text-label">
          Step {step} of {totalSteps}
        </div>

        {/* Step 1: Treatment Setup */}
        {step === 1 && (
          <div className="onboarding__step animate-fade-in-up" key="step1">
            <h1 className="text-h1 onboarding__title">Set up your treatment</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
              Tell us about your aligner treatment so we can track your progress.
            </p>

            <div className="stack stack--md">
              <div className="onboarding__field">
                <label className="text-label onboarding__label">How many trays total? *</label>
                <input
                  type="number"
                  className="input input--lg"
                  placeholder="e.g., 20"
                  value={totalTrays}
                  onChange={e => setTotalTrays(e.target.value)}
                  min="1"
                  max="99"
                  id="onb-total-trays"
                />
              </div>

              <div className="onboarding__field">
                <label className="text-label onboarding__label">Days per tray</label>
                <input
                  type="number"
                  className="input input--lg"
                  value={trayDurationDays}
                  onChange={e => setTrayDurationDays(e.target.value)}
                  min="5"
                  max="30"
                  id="onb-tray-duration"
                />
                <span className="onboarding__hint text-caption">Most treatments use 7-14 days per tray</span>
              </div>

              <div className="onboarding__field">
                <label className="text-label onboarding__label">Which tray are you on now? *</label>
                <input
                  type="number"
                  className="input input--lg"
                  placeholder="e.g., 1"
                  value={currentTray}
                  onChange={e => setCurrentTray(e.target.value)}
                  min="1"
                  max={totalTrays || 99}
                  id="onb-current-tray"
                />
              </div>

              <div className="onboarding__field">
                <label className="text-label onboarding__label">When did you start this tray?</label>
                <input
                  type="date"
                  className="input input--lg"
                  value={trayStartDate}
                  onChange={e => setTrayStartDate(e.target.value)}
                  id="onb-tray-start"
                />
              </div>

              <div className="onboarding__field">
                <label className="text-label onboarding__label">Aligner brand (optional)</label>
                <input
                  type="text"
                  className="input input--lg"
                  placeholder="e.g., Invisalign, ClearCorrect"
                  value={alignerBrand}
                  onChange={e => setAlignerBrand(e.target.value)}
                  id="onb-brand"
                />
              </div>
            </div>

            <button
              className="btn btn--primary btn--lg btn--full onboarding__next"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              id="onb-next-1"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Wear Goal */}
        {step === 2 && (
          <div className="onboarding__step animate-fade-in-up" key="step2">
            <h1 className="text-h1 onboarding__title">Set your daily goal</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
              How many hours per day should you wear your aligners?
            </p>

            <div className="onboarding__goal-display">
              <span className="onboarding__goal-value text-display">{dailyWearGoalHours}h</span>
              <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>per day</span>
            </div>

            <div className="onboarding__slider-container">
              <input
                type="range"
                className="onboarding__slider"
                min="18"
                max="24"
                step="0.5"
                value={dailyWearGoalHours}
                onChange={e => setDailyWearGoalHours(parseFloat(e.target.value))}
                id="onb-goal-slider"
              />
              <div className="onboarding__slider-labels">
                <span className="text-caption">18h</span>
                <span className="text-caption">24h</span>
              </div>
            </div>

            <div className="onboarding__info-card card card--accent">
              <p className="text-body-sm">
                Most orthodontists recommend <strong>20-22 hours</strong> of daily wear. We default to 22h for optimal results.
              </p>
            </div>

            <div className="onboarding__actions">
              <button className="btn btn--secondary btn--lg" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn--primary btn--lg" onClick={() => setStep(3)} id="onb-next-2" style={{ flex: 1 }}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="onboarding__step animate-fade-in-up" key="step3">
            <h1 className="text-h1 onboarding__title">You're all set!</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
              Here's your treatment summary. You can update these anytime in Settings.
            </p>

            <div className="onboarding__summary card">
              <div className="onboarding__summary-row">
                <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Total trays</span>
                <span className="text-body" style={{ fontWeight: 'var(--fw-semibold)' }}>{totalTrays || 20}</span>
              </div>
              <div className="onboarding__summary-row">
                <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Current tray</span>
                <span className="text-body" style={{ fontWeight: 'var(--fw-semibold)' }}>Tray {currentTray}</span>
              </div>
              <div className="onboarding__summary-row">
                <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Days per tray</span>
                <span className="text-body" style={{ fontWeight: 'var(--fw-semibold)' }}>{trayDurationDays} days</span>
              </div>
              <div className="onboarding__summary-row">
                <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Daily goal</span>
                <span className="text-body" style={{ fontWeight: 'var(--fw-semibold)' }}>{dailyWearGoalHours}h</span>
              </div>
              {alignerBrand && (
                <div className="onboarding__summary-row">
                  <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Brand</span>
                  <span className="text-body" style={{ fontWeight: 'var(--fw-semibold)' }}>{alignerBrand}</span>
                </div>
              )}
            </div>

            <div className="onboarding__actions">
              <button className="btn btn--secondary btn--lg" onClick={() => setStep(2)}>Back</button>
              <button
                className="btn btn--primary btn--lg"
                onClick={handleComplete}
                disabled={saving}
                id="onb-complete"
                style={{ flex: 1 }}
              >
                {saving ? 'Setting up...' : 'Start Tracking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
