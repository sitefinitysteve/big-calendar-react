import { Languages } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useLocale } from '@/demo/useLocale'

export default function ToggleLanguage() {
  const { locale, setLocale, LOCALE_OPTIONS } = useLocale()
  const current = LOCALE_OPTIONS.find((o) => o.value === locale)

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as typeof locale)}>
      <SelectTrigger className="w-[140px]">
        <div className="flex items-center gap-2">
          <Languages className="size-4" />
          <span>{current?.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent align="end">
        {LOCALE_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
