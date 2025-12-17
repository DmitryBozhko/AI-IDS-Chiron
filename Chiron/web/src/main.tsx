import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

import { BusinessProvider } from './context/BusinessContext'

import './styles/global.css'   // ← global theme
import './styles/ids.css'      // ← IDS dark

const el = document.getElementById('root')!
createRoot(el).render(
  <React.StrictMode>
    <BrowserRouter>
      <BusinessProvider>
        <App />
      </BusinessProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
