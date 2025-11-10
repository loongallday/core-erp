import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LocaleProvider } from './contexts/LocaleContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PluginProvider, usePluginRoutes } from './lib/plugin-system'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Roles from './pages/Roles'
import UserForm from './pages/Users/UserForm'
import RoleDetail from './pages/Roles/RoleDetail'
import TranslationManagement from './pages/TranslationManagement'
import pluginConfig from '../plugins.config'

/**
 * App Routes Component
 * 
 * Renders core routes + dynamically loaded plugin routes
 */
function AppRoutes() {
  const pluginRoutes = usePluginRoutes()

  return (
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
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <LocaleProvider>
        <PluginProvider config={pluginConfig} autoInitialize={true}>
          <AppRoutes />
        </PluginProvider>
      </LocaleProvider>
    </AuthProvider>
  )
}

export default App

