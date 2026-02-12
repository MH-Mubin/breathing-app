import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function DebugInfo() {
  const [backendHealth, setBackendHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        console.log('🔍 Testing backend connection...');
        const response = await api.get('/health');
        console.log('✅ Backend health check:', response.data);
        setBackendHealth(response.data);
      } catch (err) {
        console.error('❌ Backend health check failed:', err);
        setError(err.message);
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="fixed bottom-5 right-5 bg-white border-2 border-primary rounded-lg p-4 max-w-md shadow-lg z-[9999] text-xs font-mono">
      <h3 className="m-0 mb-2.5 text-primary">🔧 Debug Info</h3>
      
      <div className="mb-2.5">
        <strong>Environment:</strong>
        <pre className="my-1.5 bg-surface p-1.5 rounded">
          {JSON.stringify({
            VITE_API_URL: import.meta.env.VITE_API_URL,
            MODE: import.meta.env.MODE,
            DEV: import.meta.env.DEV,
            PROD: import.meta.env.PROD
          }, null, 2)}
        </pre>
      </div>

      <div className="mb-2.5">
        <strong>Backend Health:</strong>
        {backendHealth ? (
          <pre className="my-1.5 bg-green-50 p-1.5 rounded text-green-800">
            {JSON.stringify(backendHealth, null, 2)}
          </pre>
        ) : error ? (
          <pre className="my-1.5 bg-red-50 p-1.5 rounded text-red-800">
            Error: {error}
          </pre>
        ) : (
          <div className="my-1.5 text-muted">Loading...</div>
        )}
      </div>

      <div className="text-[10px] text-muted mt-2.5">
        Check browser console (F12) for detailed logs
      </div>
    </div>
  );
}
