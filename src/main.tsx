import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'
import './i18n/config'
import { initializeTranslations } from './lib/preloadTranslations'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1, // Fail faster instead of retrying multiple times
      structuralSharing: true, // Prevent unnecessary re-renders
    },
    mutations: {
      retry: 1,
    },
  },
})

// Preload translations on app startup
initializeTranslations().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  )
})

