import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeBackend } from './store/backend';

const root = ReactDOM.createRoot(document.getElementById('root')!);

const BackendApp: React.FC = () => {
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    initializeBackend()
      .catch(backendError => {
        console.error('Unable to initialize Supabase:', backendError);
        if (active) setError(backendError instanceof Error ? backendError.message : 'The backend could not be reached.');
      })
      .finally(() => {
        if (active) setReady(true);
      });

    const handleBackendError = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setError(detail || 'A backend operation failed. Your changes may not have been saved.');
    };
    window.addEventListener('sdm:backend-error', handleBackendError);
    return () => {
      active = false;
      window.removeEventListener('sdm:backend-error', handleBackendError);
    };
  }, []);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-obsidian text-sm text-gray-400">Connecting to SDM…</div>;
  }

  return (
    <>
      {error && (
        <div role="alert" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-950/95 px-4 py-3 text-sm text-red-100 shadow-xl">
          <span>{error}. Check Supabase connectivity and refresh before continuing.</span>
          <button onClick={() => window.location.reload()} className="shrink-0 rounded-lg border border-red-300/30 px-3 py-1.5 font-semibold hover:bg-red-500/20">Refresh</button>
        </div>
      )}
      <App />
    </>
  );
};

root.render(
  <React.StrictMode>
    <BackendApp />
  </React.StrictMode>
);
