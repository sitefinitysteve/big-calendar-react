import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Settings, Copy, Clock, CalendarPlus } from 'lucide-react'
import './assets/styles/globals.css'

import BigCalendar from '@/calendar/components/CalendarContainer'
import { useCalendarStore } from '@/stores/calendar'
import { USERS_MOCK, CALENDAR_ITEMS_MOCK } from '@/calendar/mocks'
import type { TCalendarView } from '@/calendar/types'
import type { IEvent, ICalendarCommand, ICalendarCommandSelect } from '@/calendar/interfaces'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import ChangeBadgeVariantInput from '@/calendar/components/settings/ChangeBadgeVariantInput'
import ChangeCalendarOptionsInput from '@/calendar/components/settings/ChangeCalendarOptionsInput'
import ChangeVisibleHoursInput from '@/calendar/components/settings/ChangeVisibleHoursInput'
import ChangeWorkingHoursInput from '@/calendar/components/settings/ChangeWorkingHoursInput'
import AppHeader from '@/demo/AppHeader'
import { useLocale } from '@/demo/useLocale'

// Defined ONCE, shared by every view. `views` scopes an entry to specific views;
// omit it to show everywhere. Mirrors components/DemoCalendar.vue.
const eventCommands: ICalendarCommand[] = [
  { id: 'duplicate', label: 'Duplicate', icon: Copy }, // every view
  { id: 'reschedule', label: 'Reschedule', icon: Clock, views: ['week', 'day'] }, // timed views only
]
const dayCommands: ICalendarCommand[] = [
  { id: 'new-log', label: 'New log entry', icon: CalendarPlus }, // month/year day cells
]

// One shared demo host, matching Vue's DemoCalendar.vue. Shows the events-only
// integration (BigCalendar fires events; this host decides what to do) with a
// single command config reused across all views.
function App() {
  const initialize = useCalendarStore((s) => s.initialize)
  const availableViews = useCalendarStore((s) => s.availableViews)
  const showUserSelect = useCalendarStore((s) => s.showUserSelect)
  const canAdd = useCalendarStore((s) => s.canAdd)
  const canEdit = useCalendarStore((s) => s.canEdit)
  const canDelete = useCalendarStore((s) => s.canDelete)

  const { currentLabels, currentDateLocale } = useLocale()

  const [view, setView] = useState<TCalendarView>('month')

  const [lastDayClick, setLastDayClick] = useState<string | null>(null)
  const [lastEventClick, setLastEventClick] = useState<string | null>(null)
  const [lastCommand, setLastCommand] = useState<string | null>(null)

  // Show each fired event in its chip, then clear it a few seconds later so the
  // panels don't accumulate stale values.
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  // Stable across renders (only refs + stable setters), so the callbacks handed
  // to BigCalendar below can be memoized with useCallback([]).
  const flash = useCallback((key: string, setter: (v: string | null) => void, value: string) => {
    setter(value)
    const existing = timers.current.get(key)
    if (existing) clearTimeout(existing)
    timers.current.set(
      key,
      setTimeout(() => setter(null), 4000),
    )
  }, [])

  // Mirror layouts/CalendarLayout.vue — seed the store with mock data on mount.
  useEffect(() => {
    initialize(USERS_MOCK, CALENDAR_ITEMS_MOCK)
  }, [initialize])

  useEffect(() => {
    const map = timers.current
    return () => map.forEach(clearTimeout)
  }, [])

  const onDayClick = useCallback(
    (date: string) => {
      flash('day', setLastDayClick, date)
    },
    [flash]
  )
  const onEventClick = useCallback(
    (event: IEvent) => {
      flash('event', setLastEventClick, `${event.title} (#${event.id})`)
    },
    [flash]
  )
  const onCommand = useCallback(
    (p: ICalendarCommandSelect) => {
      flash(
        'command',
        setLastCommand,
        p.event ? `${p.commandId} → "${p.event.title}" (#${p.event.id})` : `${p.commandId} → day ${p.date}`,
      )
    },
    [flash]
  )

  return (
    <>
      <AppHeader />

      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-8 py-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span
              className="rounded-md border border-dashed bg-muted/40 px-3 py-1.5 text-muted-foreground"
              data-testid="last-day-click"
            >
              <code className="text-foreground">@day-click</code> →{' '}
              <span className="font-medium text-foreground">{lastDayClick ?? '— click a day —'}</span>
            </span>
            <span
              className="rounded-md border border-dashed bg-muted/40 px-3 py-1.5 text-muted-foreground"
              data-testid="last-event-click"
            >
              <code className="text-foreground">@event-click</code> →{' '}
              <span className="font-medium text-foreground">{lastEventClick ?? '— click an event —'}</span>
            </span>
            <span
              className="rounded-md border border-dashed bg-muted/40 px-3 py-1.5 text-muted-foreground"
              data-testid="last-command"
            >
              <code className="text-foreground">@command</code> →{' '}
              <span className="font-medium text-foreground">{lastCommand ?? '— right-click for menu —'}</span>
            </span>
          </div>

          <BigCalendar
            view={view}
            onViewChange={setView}
            labels={currentLabels}
            dateLocale={currentDateLocale}
            availableViews={availableViews}
            showUserSelect={showUserSelect}
            canAdd={canAdd}
            canEdit={canEdit}
            canDelete={canDelete}
            navigateOnDayClick={false}
            openDetailsOnEventClick={false}
            eventCommands={eventCommands}
            dayCommands={dayCommands}
            showEditCommand
            showDeleteCommand={['month', 'week', 'day']}
            onDayClick={onDayClick}
            onEventClick={onEventClick}
            onCommand={onCommand}
          />
        </div>

        <div className="flex justify-start">
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm">
                  <Settings className="size-4" />
                  Calendar settings
                </Button>
              }
            />

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Calendar settings</DialogTitle>
                <DialogDescription>Configure calendar appearance and behavior.</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-6 py-4">
                <ChangeBadgeVariantInput />
                <ChangeCalendarOptionsInput />
                <ChangeVisibleHoursInput />
                <ChangeWorkingHoursInput />
              </div>

              <DialogFooter>
                <DialogClose render={<Button>Close</Button>} />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
