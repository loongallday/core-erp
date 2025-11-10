import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider, AuthProvider } from '@core-erp/entity'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { supabase } from '@/lib/supabase'
import { PluginProvider } from '@/lib/plugin-system'
import pluginConfig from '../../plugins.config'

// Mock toast
const mockToast = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
  promise: () => {},
}

/**
 * Create a new QueryClient for each test to ensure isolation
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Custom render function that wraps components with all necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  initialRoute?: string
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialRoute = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Set initial route
  window.history.pushState({}, 'Test page', initialRoute)

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider client={supabase}>
          <AuthProvider supabaseClient={supabase} toast={mockToast as any}>
            <LocaleProvider>
              <PluginProvider config={pluginConfig} autoInitialize={false}>
                <BrowserRouter>{children}</BrowserRouter>
              </PluginProvider>
            </LocaleProvider>
          </AuthProvider>
        </SupabaseProvider>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Render component with minimal providers (for unit tests that don't need all context)
 */
export function renderWithRouter(
  ui: ReactElement,
  { initialRoute = '/' }: { initialRoute?: string } = {}
) {
  window.history.pushState({}, 'Test page', initialRoute)

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>
  }

  return render(ui, { wrapper: Wrapper })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
