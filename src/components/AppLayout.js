import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@core-erp/entity';
import { AppLayout as CoreAppLayout } from '@core-erp/ui/components';
import { LocaleSelector } from '@/components/LocaleSelector';
import { usePluginMenuItems } from '@/lib/plugin-system';
/**
 * AppLayout wrapper that provides core-erp specific configuration
 * Uses the generic AppLayout from core-ui
 */
export function AppLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut, hasPermission } = useAuth();
    const { t } = useTranslation('common');
    const pluginMenuItems = usePluginMenuItems();
    // Core menu items
    const coreMenuItems = useMemo(() => [
        { path: '/dashboard', label: t('navigation.dashboard'), icon: 'LayoutDashboard', permission: null, order: 0 },
        { path: '/users', label: t('navigation.users'), icon: 'Users', permission: 'users:view', order: 10 },
        { path: '/roles', label: t('navigation.roles'), icon: 'Shield', permission: 'roles:view', order: 20 },
        { path: '/plugins', label: 'Plugins', icon: 'Package', permission: 'system:configure', order: 30 },
        { path: '/translations', label: 'Translations', icon: 'Languages', permission: 'system:configure', order: 40 },
    ], [t]);
    // Merge core and plugin menu items
    const allMenuItems = useMemo(() => {
        const pluginItems = pluginMenuItems.map(item => ({
            path: item.path,
            label: item.label,
            icon: item.icon || 'LayoutDashboard',
            permission: item.permission || null,
            order: item.order || 999,
        }));
        return [...coreMenuItems, ...pluginItems]
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [coreMenuItems, pluginMenuItems]);
    return (_jsx(CoreAppLayout, { menuItems: allMenuItems, user: user ? { name: user.name, email: user.email } : null, onSignOut: signOut, hasPermission: hasPermission, localeSelector: _jsx(LocaleSelector, {}), appName: t('app_name'), currentPath: location.pathname, onNavigate: navigate, children: children }));
}
//# sourceMappingURL=AppLayout.js.map