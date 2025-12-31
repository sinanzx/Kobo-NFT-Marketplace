import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'
import App from './App.tsx'
import { withErrorOverlay } from './components/with-error-overlay'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from './utils/wagmiConfig'
import { initSentry } from './lib/sentry'
import { initSupabaseErrorTracking } from './lib/supabaseErrorTracking'
import { registerServiceWorker } from './utils/serviceWorker'

// Initialize Sentry error tracking
initSentry()

// Initialize Supabase error tracking
initSupabaseErrorTracking()

// Register service worker for caching
registerServiceWorker()

const AppWithErrorOverlay = withErrorOverlay(App)
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppWithErrorOverlay />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
