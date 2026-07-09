import { useCalendarStore } from '@/stores/calendar'
import type { TBadgeVariant } from '@/calendar/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCalendarLabels } from '@/calendar/labels'

export default function ChangeBadgeVariantInput() {
  const badgeVariant = useCalendarStore((s) => s.badgeVariant)
  const setBadgeVariant = useCalendarStore((s) => s.setBadgeVariant)
  const labels = useCalendarLabels()

  function handleChange(value: string | null) {
    if (value) setBadgeVariant(value as TBadgeVariant)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{labels.settingsBadgeVariant}</label>
      <Select value={badgeVariant} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder={labels.selectVariant}>
            {(value) => {
              if (value === 'colored') return labels.badgeColored
              if (value === 'dot') return labels.badgeDot
              if (value === 'mixed') return labels.badgeMixed
              return labels.selectVariant
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="colored">{labels.badgeColored}</SelectItem>
          <SelectItem value="dot">{labels.badgeDot}</SelectItem>
          <SelectItem value="mixed">{labels.badgeMixed}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
