import { useRegisterSW } from 'virtual:pwa-register/react';
import './ReloadPrompt.css';

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered() {
      console.log('SW Registered');
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  return (
    <div className={`ReloadPrompt-container ${needRefresh ? 'visible' : ''}`}>
      <div className="ReloadPrompt-toast">
        <div className="ReloadPrompt-message">
          <span>New content available, click on reload button to update.</span>
        </div>
        <div className="ReloadPrompt-buttons">
          <button className="ReloadPrompt-toast-button" onClick={() => updateServiceWorker(true)}>
            Reload
          </button>
          <button className="ReloadPrompt-toast-button" onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
