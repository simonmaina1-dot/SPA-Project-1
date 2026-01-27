import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { ProjectsProvider } from "./context/ProjectsContext.jsx"
import { ToastProvider } from "./context/ToastContext.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import { FeedbackProvider } from "./context/FeedbackContext.jsx"
import { DonationsProvider } from "./context/DonationsContext.jsx"
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProjectsProvider>
          <DonationsProvider>
            <FeedbackProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </FeedbackProvider>
          </DonationsProvider>
        </ProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
