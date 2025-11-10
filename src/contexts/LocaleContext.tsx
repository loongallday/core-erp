import { createContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@core-erp/entity'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { logError } from '@/lib/logger'
import {
  formatDate as formatDateUtil,
  formatDateTime as formatDateTimeUtil,
  formatNumber as formatNumberUtil,
  formatCurrency as formatCurrencyUtil,
  formatRelativeTime as formatRelativeTimeUtil,
  formatPercentage as formatPercentageUtil,
  type SupportedLocale,
} from '@core-erp/ui/lib'

interface LocaleContextType {
  locale: SupportedLocale
  timezone: string
  changeLocale: (newLocale: SupportedLocale, newTimezone?: string) => Promise<void>
  formatDate: (date: Date | string, formatStr?: string) => string
  formatDateTime: (date: Date | string) => string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (amount: number, currency?: string) => string
  formatRelativeTime: (date: Date | string) => string
  formatPercentage: (value: number, decimals?: number) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export { LocaleContext }

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const { user } = useAuth()
  const [locale, setLocale] = useState<SupportedLocale>('en')
  const [timezone, setTimezone] = useState<string>('Asia/Bangkok')
  const [isUpdating, setIsUpdating] = useState(false)

  // Initialize locale from user profile or browser
  useEffect(() => {
    if (user?.locale) {
      // User has a saved locale preference
      const userLocale = user.locale as SupportedLocale
      setLocale(userLocale)
      setTimezone(user.timezone || 'Asia/Bangkok')
      
      // Sync with i18next
      if (i18n.language !== userLocale) {
        i18n.changeLanguage(userLocale)
      }
    } else {
      // Use browser language or default to 'en'
      const browserLang = navigator.language.startsWith('th') ? 'th' : 'en'
      setLocale(browserLang)
      
      if (i18n.language !== browserLang) {
        i18n.changeLanguage(browserLang)
      }
    }
  }, [user, i18n])

  // Change locale and update user preference in database
  const changeLocale = async (newLocale: SupportedLocale, newTimezone?: string) => {
    if (isUpdating) return

    try {
      setIsUpdating(true)

      // Update local state immediately for better UX
      setLocale(newLocale)
      if (newTimezone) {
        setTimezone(newTimezone)
      }

      // Change i18next language
      await i18n.changeLanguage(newLocale)

      // If user is logged in, save preference to database
      if (user) {
        const { error } = await (supabase
          .from('users') as any)
          .update({
            locale: newLocale,
            timezone: newTimezone || timezone,
          })
          .eq('id', user.id)

        if (error) {
          logError('Error updating locale', new Error(error.message), { component: 'LocaleContext', userId: user.id })
          throw error
        }

        toast.success(
          newLocale === 'th' 
            ? 'เปลี่ยนภาษาสำเร็จ' 
            : 'Language changed successfully'
        )
      }
    } catch (error) {
      logError('Error changing locale', error as Error, { component: 'LocaleContext', locale: newLocale })
      toast.error(
        newLocale === 'th'
          ? 'เปลี่ยนภาษาไม่สำเร็จ'
          : 'Failed to change language'
      )
      
      // Revert on error
      const revertLocale = user?.locale as SupportedLocale || 'en'
      setLocale(revertLocale)
      i18n.changeLanguage(revertLocale)
    } finally {
      setIsUpdating(false)
    }
  }

  // Memoize formatting functions that use current locale
  const formatters = useMemo(() => ({
    formatDate: (date: Date | string, formatStr?: string) => 
      formatDateUtil(date, locale, formatStr),
    formatDateTime: (date: Date | string) => 
      formatDateTimeUtil(date, locale),
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => 
      formatNumberUtil(value, locale, options),
    formatCurrency: (amount: number, currency?: string) => 
      formatCurrencyUtil(amount, locale, currency),
    formatRelativeTime: (date: Date | string) => 
      formatRelativeTimeUtil(date, locale),
    formatPercentage: (value: number, decimals?: number) => 
      formatPercentageUtil(value, locale, decimals),
  }), [locale])

  const contextValue = useMemo(() => ({
    locale,
    timezone,
    changeLocale,
    ...formatters,
  }), [locale, timezone, changeLocale, formatters])

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  )
}
