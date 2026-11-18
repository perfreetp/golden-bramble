import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

window.__errors = []
window.addEventListener('error', (e) => window.__errors.push(String(e.message)))
window.addEventListener('unhandledrejection', (e) =>
  window.__errors.push('promise:' + String(e.reason))
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
