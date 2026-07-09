import { useState } from 'react'
import { Info } from 'lucide-react'
import { useCalendarStore } from '@/stores/calendar'
import { TimeInput } from '@/components/ui/time-input'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCalendarLabels } from '@/calendar/labels'

export default function ChangeVisibleHoursInput() {
  const visibleHours = useCalendarStore((s) => s.visibleHours)
  const setVisibleHours = useCalendarStore((s) => s.setVisibleHours)
  const labels = useCalendarLabels()

  const [from, setFrom] = useState<{ hour: number; minute: number }>({
    hour: visibleHours.from,
    minute: 0,
  })
  const [to, setTo] = useState<{ hour: number; minute: number }>({
    hour: visibleHours.to,
    minute: 0,
  })

  function handleApply() {
    setVisibleHours({
      from: from.hour,
      to: to.hour,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{labels.settingsVisibleHours}</label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<Info className="size-4 text-muted-foreground" />} />
            <TooltipContent>
              <p>{labels.visibleHoursTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 space-y-1">
          <span className="text-xs text-muted-foreground">{labels.from}</span>
          <TimeInput value={from} onChange={setFrom} hourCycle={12} />
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-xs text-muted-foreground">{labels.to}</span>
          <TimeInput value={to} onChange={setTo} hourCycle={12} />
        </div>
      </div>

      <Button size="sm" className="w-full" onClick={handleApply}>
        {labels.apply}
      </Button>
    </div>
  )
}
