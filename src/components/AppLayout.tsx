import { useState, useMemo, useCallback, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@core-erp/entity'
import { useTranslation } from 'react-i18next'
import { Button } from '@core-erp/ui/components/ui'
import { ScrollArea } from '@core-erp/ui/components/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@core-erp/ui/components/ui'
import { LayoutDashboard, Users, Shield, Package, Languages, LogOut, Menu } from 'lucide-react'
import { LocaleSelector } from '@/components/LocaleSelector'
import { usePluginMenuItems } from '@/lib/plugin-system'
import { cn } from '@core-erp/ui/lib'
import * as LucideIcons from 'lucide-react'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, hasPermission } = useAuth()
  const { t } = useTranslation('common')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Get plugin menu items
  const pluginMenuItems = usePluginMenuItems()

  // Core menu items
  const coreMenuItems = useMemo(() => [
    { path: '/dashboard', label: t('navigation.dashboard'), icon: LayoutDashboard, permission: null, order: 0 },
    { path: '/users', label: t('navigation.users'), icon: Users, permission: 'users:view', order: 10 },
    { path: '/roles', label: t('navigation.roles'), icon: Shield, permission: 'roles:view', order: 20 },
    { path: '/plugins', label: 'Plugins', icon: Package, permission: 'system:configure', order: 30 },
    { path: '/translations', label: 'Translations', icon: Languages, permission: 'system:configure', order: 40 },
  ], [t])

  // Merge core and plugin menu items, sorted by order
  const menuItems = useMemo(() => {
    const pluginItems = pluginMenuItems.map(item => ({
      ...item,
      // Get Lucide icon by name
      icon: item.icon ? ((LucideIcons as any)[item.icon] || LayoutDashboard) : LayoutDashboard,
    }))

    return [...coreMenuItems, ...pluginItems]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [coreMenuItems, pluginMenuItems])

  const handleSignOut = useCallback(async () => {
    await signOut()
    navigate('/login')
  }, [signOut, navigate])

  const handleMenuItemClick = useCallback((path: string) => {
    navigate(path)
    setMobileMenuOpen(false)
  }, [navigate])

  const MenuItems = memo(() => (
    <>
      {menuItems.map((item) => {
        if (item.permission && !hasPermission(item.permission)) return null

        const Icon = item.icon
        const isActive = location.pathname.startsWith(item.path)

        return (
          <Button
            key={item.path}
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn('w-full justify-start touch-target', isActive && 'bg-secondary')}
            onClick={() => handleMenuItemClick(item.path)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        )
      })}
    </>
  ))

  MenuItems.displayName = 'MenuItems'

  const renderFooter = () => (
    <div className="p-4 border-t space-y-2">
      <div className="px-2">
        <LocaleSelector />
      </div>
      <Button variant="ghost" className="w-full justify-start touch-target" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        {t('actions.logout', { ns: 'auth' })}
      </Button>
    </div>
  )

  return (
    <div className="flex h-screen">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-20 md:hidden bg-card border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold">{t('app_name')}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="touch-target"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{t('app_name')}</SheetTitle>
            {user && <p className="text-sm text-muted-foreground truncate text-left">{user.name}</p>}
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <nav className="p-4 space-y-2">
              <MenuItems />
            </nav>
          </ScrollArea>

          {renderFooter()}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-card border-r flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">{t('app_name')}</h1>
          {user && <p className="text-sm text-muted-foreground truncate">{user.name}</p>}
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-2">
            <MenuItems />
          </nav>
        </ScrollArea>

        {renderFooter()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">{children}</main>
    </div>
  )
}

