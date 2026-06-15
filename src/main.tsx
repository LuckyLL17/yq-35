import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initMonitor } from '@/monitoring'

initMonitor({
  enableWebVitals: true,
  enableErrorMonitor: true,
  appId: 'yq-35',
  debug: import.meta.env.DEV,
  sampleRate: 1,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
