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
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #ff6a00',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '400px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#ff6a00' }}>🔧 Debug Info</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Environment:</strong>
        <pre style={{ margin: '5px 0', background: '#f5f5f5', padding: '5px', borderRadius: '4px' }}>
          {JSON.stringify({
            VITE_API_URL: import.meta.env.VITE_API_URL,
            MODE: import.meta.env.MODE,
            DEV: import.meta.env.DEV,
            PROD: import.meta.env.PROD
          }, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Backend Health:</strong>
        {backendHealth ? (
          <pre style={{ margin: '5px 0', background: '#e8f5e9', padding: '5px', borderRadius: '4px', color: '#2e7d32' }}>
            {JSON.stringify(backendHealth, null, 2)}
          </pre>
        ) : error ? (
          <pre style={{ margin: '5px 0', background: '#ffebee', padding: '5px', borderRadius: '4px', color: '#c62828' }}>
            Error: {error}
          </pre>
        ) : (
          <div style={{ margin: '5px 0', color: '#666' }}>Loading...</div>
        )}
      </div>

      <div style={{ fontSize: '10px', color: '#666', marginTop: '10px' }}>
        Check browser console (F12) for detailed logs
      </div>
    </div>
  );
}
