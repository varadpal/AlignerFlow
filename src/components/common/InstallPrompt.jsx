import { useState, useEffect } from 'react';
import './InstallPrompt.css';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // If user hasn't dismissed it this session/ever, show our custom UI
      const dismissed = localStorage.getItem('pwaPromptDismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For testing purposes during development, you can uncomment this:
    // if (!localStorage.getItem('pwaPromptDismissed')) setIsVisible(true);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS/safari or when prompt isn't available
      alert('To install, tap the Share icon and select "Add to Home Screen".');
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Remember the choice so we don't spam the user
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="install-prompt-overlay animate-fade-in-up">
      <div className="install-prompt-card">
        <button className="install-prompt-close" onClick={handleDismiss} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1L1 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="install-prompt-content">
          <div className="install-prompt-icon">
            <img src="/icon.svg" alt="AlignerFlow Icon" />
          </div>
          
          <div className="install-prompt-text">
            <h3 className="install-prompt-title">Add to Home Screen</h3>
            <p className="install-prompt-desc">
              Quick access to your clear aligner progress and tracking — no app store needed.
            </p>
            
            <div className="install-prompt-actions">
              <button className="install-prompt-btn-primary" onClick={handleInstall}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Install
              </button>
              <button className="install-prompt-btn-text" onClick={handleDismiss}>
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
