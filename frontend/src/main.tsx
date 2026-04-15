import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SidebarProvider } from './components/ui/sidebar.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'

// Initialize the JS client
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
        <SidebarProvider defaultOpen={false}>
          <App />
        </SidebarProvider>
    </TooltipProvider>
  </StrictMode>,
)
