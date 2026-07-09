import { useMemo } from 'react'
import { useCalendarStore } from '@/stores/calendar'
import type { TCalendarView } from '@/calendar/types'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCalendarLabels } from '@/calendar/labels'

export default function ChangeCalendarOptionsInput() {
  const availableViews = useCalendarStore((s) => s.availableViews)
  const setAvailableViews = useCalendarStore((s) => s.setAvailableViews)
  const showUserSelect = useCalendarStore((s) => s.showUserSelect)
  const setShowUserSelect = useCalendarStore((s) => s.setShowUserSelect)
  const canAdd = useCalendarStore((s) => s.canAdd)
  const setCanAdd = useCalendarStore((s) => s.setCanAdd)
  const canEdit = useCalendarStore((s) => s.canEdit)
  const setCanEdit = useCalendarStore((s) => s.setCanEdit)
  const canDelete = useCalendarStore((s) => s.canDelete)
  const setCanDelete = useCalendarStore((s) => s.setCanDelete)
  const labels = useCalendarLabels()

  const allViews = useMemo<{ view: TCalendarView; label: string }[]>(
    () => [
      { view: 'day', label: labels.viewDay },
      { view: 'week', label: labels.viewWeek },
      { view: 'month', label: labels.viewMonth },
      { view: 'year', label: labels.viewYear },
      { view: 'agenda', label: labels.viewAgenda },
    ],
    [labels]
  )

  function toggleView(view: TCalendarView) {
    if (availableViews.includes(view)) {
      if (availableViews.length > 1) {
        setAvailableViews(availableViews.filter((v) => v !== view))
      }
    } else {
      setAvailableViews([...availableViews, view])
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{labels.settingsAvailableViews}</label>
        <div className="flex flex-wrap gap-1.5">
          {allViews.map((v) => (
            <Button
              key={v.view}
              size="sm"
              variant={availableViews.includes(v.view) ? 'default' : 'outline'}
              onClick={() => toggleView(v.view)}
            >
              {v.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={showUserSelect} onCheckedChange={setShowUserSelect} />
        <label className="text-sm font-medium">{labels.settingsShowUserSelect}</label>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={canAdd} onCheckedChange={setCanAdd} />
        <label className="text-sm font-medium">{labels.settingsCanAdd}</label>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={canEdit} onCheckedChange={setCanEdit} />
        <label className="text-sm font-medium">{labels.settingsCanEdit}</label>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={canDelete} onCheckedChange={setCanDelete} />
        <label className="text-sm font-medium">{labels.settingsCanDelete}</label>
      </div>
    </div>
  )
}
