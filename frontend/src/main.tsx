import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// --- infinite-scroll change ---
// QueryClient is needed anywhere in the tree that calls useInfiniteQuery /
// useQuery. Wrapping at the root lets any component use the cache without
// prop-drilling.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// --- /infinite-scroll change ---
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'

// Initialize the JS client
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

// --- infinite-scroll change ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Pages stay cached briefly so navigating back to a prior search
      // doesn't re-fetch from scratch, but aren't held indefinitely.
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})
// --- /infinite-scroll change ---

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
