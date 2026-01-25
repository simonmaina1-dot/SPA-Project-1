import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { ProjectsProvider } from "./context/ProjectsContext.jsx"
import { ToastProvider } from "./context/ToastContext.jsx"
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProjectsProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ProjectsProvider>
    </BrowserRouter>
  </StrictMode>,
)

