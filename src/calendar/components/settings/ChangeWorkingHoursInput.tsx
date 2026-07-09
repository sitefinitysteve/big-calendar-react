import { useMemo, useState } from 'react'
import { Info, Moon } from 'lucide-react'
import { useCalendarStore } from '@/stores/calendar'
import type { TWorkingHours } from '@/calendar/types'
import { Switch } from '@/components/ui/switch'
import { TimeInput } from '@/components/ui/time-input'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCalendarLabels } from '@/calendar/labels'

export default function ChangeWorkingHoursInput() {
  const workingHours = useCalendarStore((s) => s.workingHours)
  const setWorkingHours = useCalendarStore((s) => s.setWorkingHours)
  const labels = useCalendarLabels()

  const DAYS_OF_WEEK = useMemo(
    () => [
      { index: 0, name: labels.sunday },
      { index: 1, name: labels.monday },
      { index: 2, name: labels.tuesday },
      { index: 3, name: labels.wednesday },
      { index: 4, name: labels.thursday },
      { index: 5, name: labels.friday },
      { index: 6, name: labels.saturday },
    ],
    [labels]
  )

  const [localHours, setLocalHours] = useState<TWorkingHours>(() =>
    Object.fromEntries(
      Object.entries(workingHours).map(([key, val]) => [
        key,
        { from: val.from, to: val.to },
      ])
    ) as TWorkingHours
  )

  function isDayActive(dayIndex: number): boolean {
    const day = localHours[dayIndex]!
    return day.from > 0 || day.to > 0
  }

  function handleToggle(dayIndex: number, checked: boolean) {
    setLocalHours((prev) => ({
      ...prev,
      [dayIndex]: checked ? { from: 9, to: 17 } : { from: 0, to: 0 },
    }))
  }

  function handleFromChange(dayIndex: number, value: { hour: number; minute: number }) {
    setLocalHours((prev) => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex]!, from: value.hour },
    }))
  }

  function handleToChange(dayIndex: number, value: { hour: number; minute: number }) {
    setLocalHours((prev) => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex]!, to: value.hour },
    }))
  }

  function getHours(dayIndex: number) {
    return localHours[dayIndex] ?? { from: 0, to: 0 }
  }

  function handleApply() {
    setWorkingHours({ ...localHours })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{labels.settingsWorkingHours}</label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<Info className="size-4 text-muted-foreground" />} />
            <TooltipContent>
              <p>{labels.workingHoursTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.index} className="flex items-center gap-3">
            <Switch
              checked={isDayActive(day.index)}
              onCheckedChange={(checked) => handleToggle(day.index, checked)}
            />

            <span className="w-24 text-sm font-medium">{day.name}</span>

            {isDayActive(day.index) ? (
              <div className="flex flex-1 items-center gap-2">
                <TimeInput
                  value={{ hour: getHours(day.index).from, minute: 0 }}
                  hourCycle={12}
                  onChange={(value) => handleFromChange(day.index, value)}
                />
                <span className="text-sm text-muted-foreground">{labels.to.toLowerCase()}</span>
                <TimeInput
                  value={{ hour: getHours(day.index).to, minute: 0 }}
                  hourCycle={12}
                  onChange={(value) => handleToChange(day.index, value)}
                />
              </div>
            ) : (
              <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
                <Moon className="size-4" />
                <span>{labels.closed}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button size="sm" className="w-full" onClick={handleApply}>
        {labels.apply}
      </Button>
    </div>
  )
}
