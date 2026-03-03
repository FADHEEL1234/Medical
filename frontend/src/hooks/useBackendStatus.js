import { useState, useEffect } from 'react';
import api from '../api/api';

// simple hook that probes the health endpoint once and reports whether
// the backend was reachable.  Components can use the returned values to
// disable forms and show a persistent error message.
export default function useBackendStatus() {
  const [backendUp, setBackendUp] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const WARMUP_INTERVAL_MS = 5 * 60 * 1000;

    const probe = async () => {
      try {
        await api.get('/health/', { timeout: 8000 });
        if (!cancelled) {
          setBackendUp(true);
          setError('');
        }
      } catch (e) {
        if (!cancelled) {
          setBackendUp(false);
          setError('Unable to reach backend. Please make sure the Django server is running.');
        }
      }
    };

    probe();
    const intervalId = setInterval(probe, WARMUP_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return { backendUp, error };
}
