import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SidebarProvider } from './components/ui/sidebar.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
        <SidebarProvider defaultOpen={false}>
          <App />
        </SidebarProvider>
    </TooltipProvider>
  </StrictMode>,
)
