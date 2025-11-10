import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LocaleProvider } from './contexts/LocaleContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoadingScreen } from './components/LoadingScreen'
import { PluginProvider, usePluginRoutes } from './lib/plugin-system'
import pluginConfig from '../plugins.config'

// Lazy load all page components for better performance
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Users = lazy(() => import('./pages/Users'))
const Roles = lazy(() => import('./pages/Roles'))
const Plugins = lazy(() => import('./pages/Plugins'))
const UserForm = lazy(() => import('./pages/Users/UserForm'))
const RoleDetail = lazy(() => import('./pages/Roles/RoleDetail'))
const TranslationManagement = lazy(() => import('./pages/TranslationManagement'))
const NotFound = lazy(() => import('./pages/NotFound'))

/**
 * App Routes Component
 * 
 * Renders core routes + dynamically loaded plugin routes
 */
function AppRoutes() {
  const pluginRoutes = usePluginRoutes()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Core User routes */}
        <Route path="/users" element={<ProtectedRoute requiredPermission="users:view"><Users /></ProtectedRoute>} />
        <Route path="/users/new" element={<ProtectedRoute requiredPermission="users:create"><UserForm /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute requiredPermission="users:edit"><UserForm /></ProtectedRoute>} />
        
        {/* Core Role routes */}
        <Route path="/roles" element={<ProtectedRoute requiredPermission="roles:view"><Roles /></ProtectedRoute>} />
        <Route path="/roles/:id" element={<ProtectedRoute requiredPermission="permissions:assign"><RoleDetail /></ProtectedRoute>} />
        
        {/* Core Plugin routes */}
        <Route path="/plugins" element={<ProtectedRoute requiredPermission="system:configure"><Plugins /></ProtectedRoute>} />
        
        {/* Core Translation routes */}
        <Route path="/translations" element={<ProtectedRoute requiredPermission="system:configure"><TranslationManagement /></ProtectedRoute>} />
        
        {/* Plugin routes (dynamically loaded) */}
        {pluginRoutes.map((route) => {
          const Component = route.component
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.requiredPermission ? (
                  <ProtectedRoute requiredPermission={route.requiredPermission}>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          )
        })}
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <LocaleProvider>
      <PluginProvider config={pluginConfig} autoInitialize={true}>
        <AppRoutes />
      </PluginProvider>
    </LocaleProvider>
  )
}

export default App

