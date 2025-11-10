import { useLocale } from '@/hooks/useLocale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core-erp/ui/components/ui'
import { Globe } from 'lucide-react'

export function LocaleSelector() {
  const { locale, changeLocale } = useLocale()

  const handleLocaleChange = (value: string) => {
    changeLocale(value as 'en' | 'th')
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={locale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">
            <div className="flex items-center gap-2">
              <span>🇺🇸</span>
              <span>English</span>
            </div>
          </SelectItem>
          <SelectItem value="th">
            <div className="flex items-center gap-2">
              <span>🇹🇭</span>
              <span>ไทย</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

