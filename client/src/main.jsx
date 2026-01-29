import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handler to catch any crash before the app even starts
window.addEventListener('error', (event) => {
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.innerHTML === '') {
    rootElement.innerHTML = `
      <div style="background: #0F0F0F; color: #ff4d4d; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px;">
        <div>
          <h1 style="font-size: 24px;">Application Startup Failed</h1>
          <p style="color: #888; margin: 10px 0;">The JavaScript bundle crashed during startup. Check the browser console for details.</p>
          <pre style="background: #1a1a1a; padding: 15px; border-radius: 8px; font-size: 12px; margin-top: 20px; border: 1px solid #333; overflow: auto; max-width: 80vw;">${event.error ? event.error.message : event.message}</pre>
          <button onclick="window.location.reload()" style="background: white; color: black; border: none; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin-top: 20px; cursor: pointer;">RELOAD</button>
        </div>
      </div>
    `;
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
