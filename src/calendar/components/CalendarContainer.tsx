import { useCallback, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { format } from 'date-fns'
import type { Locale } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import type { TCalendarView } from '@/calendar/types'
import type { IEvent, ICalendarCommand, ICalendarCommandSelect } from '@/calendar/interfaces'
import type { ICalendarLabels } from '@/calendar/labels'
import {
  DEFAULT_LABELS,
  CalendarLabelsContext,
  CalendarFlagsContext,
  CalendarDateLocaleContext,
} from '@/calendar/labels'
import { useCalendarStore } from '@/stores/calendar'
import { useFilteredEvents } from '@/calendar/hooks/useFilteredEvents'
import CalendarContextMenu from '@/calendar/components/CalendarContextMenu'
import CalendarHeader from '@/calendar/components/header/CalendarHeader'
import CalendarMonthView from '@/calendar/components/month-view/CalendarMonthView'
import CalendarWeekView from '@/calendar/components/week-view/CalendarWeekView'
import CalendarDayView from '@/calendar/components/day-view/CalendarDayView'
import CalendarYearView from '@/calendar/components/year-view/CalendarYearView'
import CalendarAgendaView from '@/calendar/components/agenda-view/CalendarAgendaView'
import EventDetailsDialog from '@/calendar/components/dialogs/EventDetailsDialog'
import EditEventDialog from '@/calendar/components/dialogs/EditEventDialog'
import AddEventDialog from '@/calendar/components/dialogs/AddEventDialog'

export interface BigCalendarProps {
  /** Active view (controlled). Pair with `onViewChange` — the React analog of Vue's `v-model:view`. */
  view: TCalendarView
  onViewChange?: (view: TCalendarView) => void

  canAdd?: boolean
  canEdit?: boolean
  canDelete?: boolean
  availableViews?: TCalendarView[]
  showUserSelect?: boolean
  labels?: Partial<ICalendarLabels>
  showViewTooltips?: boolean
  dateLocale?: Locale
  navigateOnDayClick?: boolean
  openDetailsOnEventClick?: boolean

  // Right-click command menu (opt-in): when provided, right-clicking an event /
  // day opens a built-in Base UI menu of these commands and fires `onCommand`.
  // Each command may set `views` to scope itself; the stock Edit/Delete toggles
  // accept `true` (all views) or an array of views to scope them too.
  eventCommands?: ICalendarCommand[]
  dayCommands?: ICalendarCommand[]
  showEditCommand?: boolean | TCalendarView[]
  showDeleteCommand?: boolean | TCalendarView[]

  // Backend hooks
  onEventCreated?: (event: IEvent) => void
  onEventUpdated?: (event: IEvent) => void
  onEventDeleted?: (event: IEvent) => void
  // Fired when a day is clicked in month/year views. Payload is the local
  // calendar date as a `yyyy-MM-dd` string (built with date-fns `format`, so it
  // is never shifted by UTC conversion).
  onDayClick?: (date: string) => void
  // Fired when an event chip is clicked in any view.
  onEventClick?: (event: IEvent) => void
  // Fired on right-click of a day/event. The native browser menu is suppressed
  // only when the matching callback (or a command menu) is provided.
  onDayContextMenu?: (payload: { date: string; x: number; y: number; originalEvent: MouseEvent }) => void
  onEventContextMenu?: (payload: { event: IEvent; x: number; y: number; originalEvent: MouseEvent }) => void
  // Fired when a right-click menu command is selected. The library performs no
  // action itself — the consumer handles the command (e.g. open its own editor).
  onCommand?: (payload: ICalendarCommandSelect) => void
}

type MenuTarget = { type: 'event'; event: IEvent } | { type: 'day'; date: string }

export default function BigCalendar({
  view,
  onViewChange,
  canAdd = true,
  canEdit = true,
  canDelete = true,
  availableViews = ['day', 'week', 'month', 'year', 'agenda'],
  showUserSelect = true,
  labels,
  showViewTooltips = true,
  dateLocale,
  navigateOnDayClick = true,
  openDetailsOnEventClick = true,
  eventCommands = [],
  dayCommands = [],
  showEditCommand = false,
  showDeleteCommand = false,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
  onDayClick,
  onEventClick,
  onDayContextMenu,
  onEventContextMenu,
  onCommand,
}: BigCalendarProps) {
  const deleteEvent = useCalendarStore((s) => s.deleteEvent)

  const mergedLabels = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels])
  const flags = useMemo(() => ({ showViewTooltips }), [showViewTooltips])

  const { filteredEvents, singleDayEvents, multiDayEvents } = useFilteredEvents(view)

  // Dialog state
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null)
  const [addEventStartDate, setAddEventStartDate] = useState<Date>()
  const [addEventStartTime, setAddEventStartTime] = useState<{ hour: number; minute: number }>()

  // Right-click menu staging (Base UI owns open state & positioning).
  const [menuCommands, setMenuCommands] = useState<ICalendarCommand[]>([])
  const menuTarget = useRef<MenuTarget | null>(null)

  // Callbacks handed down to the (memoized) view/leaf components are wrapped in
  // useCallback so their identity is stable across container re-renders (e.g.
  // when dialog open state changes). Without this, React.memo on DayCell/
  // YearViewMonth/etc. would be defeated by a fresh closure every render.
  const handleChangeView = useCallback(
    (next: TCalendarView) => {
      onViewChange?.(next)
    },
    [onViewChange]
  )

  const handleOpenDetails = useCallback(
    (event: IEvent) => {
      onEventClick?.(event)
      // Built-in read dialog is opt-out: set `openDetailsOnEventClick={false}` to
      // handle event clicks entirely in your own app.
      if (openDetailsOnEventClick) {
        setSelectedEvent(event)
        setDetailsOpen(true)
      }
    },
    [onEventClick, openDetailsOnEventClick]
  )

  const handleEdit = useCallback((event: IEvent) => {
    setDetailsOpen(false)
    setSelectedEvent(event)
    setEditOpen(true)
  }, [])

  const handleDelete = useCallback(
    (event: IEvent) => {
      deleteEvent(event.id)
      setDetailsOpen(false)
      setSelectedEvent(null)
      onEventDeleted?.(event)
    },
    [deleteEvent, onEventDeleted]
  )

  const handleAddEvent = useCallback(
    (startDate?: Date, startTime?: { hour: number; minute: number }) => {
      setAddEventStartDate(startDate)
      setAddEventStartTime(startTime)
      setAddOpen(true)
    },
    []
  )

  // Day click in month/year views: emit the clicked day as a `yyyy-MM-dd` string.
  // By default we also navigate to the day view; set `navigateOnDayClick={false}`
  // to only fire `onDayClick`.
  const handleDayClick = useCallback(
    (date: Date) => {
      onDayClick?.(format(date, 'yyyy-MM-dd'))
      if (navigateOnDayClick) onViewChange?.('day')
    },
    [onDayClick, navigateOnDayClick, onViewChange]
  )

  // Per-view scoping helpers.
  function commandInView(command: ICalendarCommand) {
    return !command.views || command.views.includes(view)
  }
  function stockInView(setting: boolean | TCalendarView[] | undefined) {
    return Array.isArray(setting) ? setting.includes(view) : !!setting
  }

  const eventMenuCommands = useMemo<ICalendarCommand[]>(() => {
    const custom = (eventCommands ?? []).filter(commandInView)
    const stock: ICalendarCommand[] = []
    const showEdit = stockInView(showEditCommand)
    const showDelete = stockInView(showDeleteCommand)
    const separate = custom.length > 0
    if (showEdit) {
      stock.push({ id: 'edit', label: mergedLabels.buttonEdit, icon: Pencil, separatorBefore: separate })
    }
    if (showDelete) {
      stock.push({
        id: 'delete',
        label: mergedLabels.buttonDelete,
        icon: Trash2,
        destructive: true,
        separatorBefore: separate && !showEdit,
      })
    }
    return [...custom, ...stock]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventCommands, showEditCommand, showDeleteCommand, view, mergedLabels])

  const dayMenuCommands = useMemo<ICalendarCommand[]>(
    () => (dayCommands ?? []).filter(commandInView),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayCommands, view]
  )

  function handleCommandSelect(command: ICalendarCommand) {
    const target = menuTarget.current
    if (!target) return
    const payload: ICalendarCommandSelect = { commandId: command.id }
    if (target.type === 'event') payload.event = target.event
    else payload.date = target.date
    onCommand?.(payload)
  }

  // Stop Base UI's ContextMenu from opening (no blank menu) without touching the
  // native menu — we deliberately do NOT preventDefault here. `stopPropagation`
  // in the capture phase prevents Base UI's own (bubble-phase, synthetic
  // onContextMenu) trigger handler from firing.
  function blockMenu(e: ReactMouseEvent) {
    setMenuCommands([])
    menuTarget.current = null
    e.stopPropagation()
  }

  // Runs in the capture phase, before Base UI's ContextMenu trigger. Decides
  // whether a menu should open, mirroring the Vue container:
  //  - target has commands -> stage them and let Base UI open + position the menu
  //  - no commands but a raw callback -> fire it instead
  //  - otherwise -> block Base UI and leave the native browser menu alone
  function handleContextMenu(e: ReactMouseEvent) {
    const targetEl = e.target as HTMLElement | null
    if (!targetEl) {
      blockMenu(e)
      return
    }

    const eventEl = targetEl.closest<HTMLElement>('[data-event-id]')
    if (eventEl) {
      const found = filteredEvents.find((ev) => ev.id === Number(eventEl.dataset.eventId))
      if (found) {
        if (eventMenuCommands.length) {
          setMenuCommands(eventMenuCommands)
          menuTarget.current = { type: 'event', event: found }
          return // let Base UI open + position the menu
        }
        if (onEventContextMenu) {
          e.preventDefault()
          onEventContextMenu({ event: found, x: e.clientX, y: e.clientY, originalEvent: e.nativeEvent })
        }
        blockMenu(e)
        return
      }
    }

    const dayEl = targetEl.closest<HTMLElement>('[data-date]')
    if (dayEl?.dataset.date) {
      const date = dayEl.dataset.date
      if (dayMenuCommands.length) {
        setMenuCommands(dayMenuCommands)
        menuTarget.current = { type: 'day', date }
        return
      }
      if (onDayContextMenu) {
        e.preventDefault()
        onDayContextMenu({ date, x: e.clientX, y: e.clientY, originalEvent: e.nativeEvent })
      }
      blockMenu(e)
      return
    }

    // Right-clicked neither an event nor a day (e.g. the header).
    blockMenu(e)
  }

  return (
    <CalendarLabelsContext.Provider value={mergedLabels}>
      <CalendarFlagsContext.Provider value={flags}>
        <CalendarDateLocaleContext.Provider value={dateLocale}>
          <CalendarContextMenu commands={menuCommands} onSelect={handleCommandSelect}>
            <div className="overflow-hidden rounded-xl border" onContextMenuCapture={handleContextMenu}>
              <CalendarHeader
                view={view}
                events={filteredEvents}
                canAdd={canAdd}
                availableViews={availableViews}
                showUserSelect={showUserSelect}
                onAddEvent={() => handleAddEvent()}
                onViewChange={handleChangeView}
              />

              {view === 'month' && (
                <CalendarMonthView
                  singleDayEvents={singleDayEvents}
                  multiDayEvents={multiDayEvents}
                  onOpenDetails={handleOpenDetails}
                  onSelectDay={handleDayClick}
                />
              )}

              {view === 'week' && (
                <CalendarWeekView
                  singleDayEvents={singleDayEvents}
                  multiDayEvents={multiDayEvents}
                  canAdd={canAdd}
                  onOpenDetails={handleOpenDetails}
                  onAddEvent={handleAddEvent}
                />
              )}

              {view === 'day' && (
                <CalendarDayView
                  singleDayEvents={singleDayEvents}
                  multiDayEvents={multiDayEvents}
                  canAdd={canAdd}
                  onOpenDetails={handleOpenDetails}
                  onAddEvent={handleAddEvent}
                />
              )}

              {view === 'year' && (
                <CalendarYearView
                  allEvents={filteredEvents}
                  onSelectDay={handleDayClick}
                  onSelectMonth={() => onViewChange?.('month')}
                />
              )}

              {view === 'agenda' && (
                <CalendarAgendaView
                  singleDayEvents={singleDayEvents}
                  multiDayEvents={multiDayEvents}
                  onOpenDetails={handleOpenDetails}
                />
              )}
            </div>
          </CalendarContextMenu>

          {/* Dialogs rendered outside the calendar border */}
          {selectedEvent && (
            <EventDetailsDialog
              event={selectedEvent}
              open={detailsOpen}
              canEdit={canEdit}
              canDelete={canDelete}
              onOpenChange={setDetailsOpen}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {selectedEvent && canEdit && (
            <EditEventDialog
              key={selectedEvent.id}
              event={selectedEvent}
              open={editOpen}
              onOpenChange={setEditOpen}
              onEventUpdated={(event) => onEventUpdated?.(event)}
            />
          )}

          {canAdd && (
            <AddEventDialog
              open={addOpen}
              startDate={addEventStartDate}
              startTime={addEventStartTime}
              onOpenChange={setAddOpen}
              onEventCreated={(event) => onEventCreated?.(event)}
            />
          )}
        </CalendarDateLocaleContext.Provider>
      </CalendarFlagsContext.Provider>
    </CalendarLabelsContext.Provider>
  )
}
