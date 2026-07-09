// CSS (extracted to dist/style.css by Vite)
import './calendar-lib.css'

// Main component
export { default as BigCalendar } from '@/calendar/components/CalendarContainer'
export type { BigCalendarProps } from '@/calendar/components/CalendarContainer'

// Dialogs
export { default as EventDetailsDialog } from '@/calendar/components/dialogs/EventDetailsDialog'
export { default as AddEventDialog } from '@/calendar/components/dialogs/AddEventDialog'
export { default as EditEventDialog } from '@/calendar/components/dialogs/EditEventDialog'

// Views & components
export { default as CalendarMonthView } from '@/calendar/components/month-view/CalendarMonthView'
export { default as CalendarWeekView } from '@/calendar/components/week-view/CalendarWeekView'
export { default as CalendarDayView } from '@/calendar/components/day-view/CalendarDayView'
export { default as CalendarYearView } from '@/calendar/components/year-view/CalendarYearView'
export { default as CalendarAgendaView } from '@/calendar/components/agenda-view/CalendarAgendaView'
export { default as CalendarHeader } from '@/calendar/components/header/CalendarHeader'
export { default as CalendarContextMenu } from '@/calendar/components/CalendarContextMenu'

// Settings inputs (for demo/settings pages)
export { default as ChangeBadgeVariantInput } from '@/calendar/components/settings/ChangeBadgeVariantInput'
export { default as ChangeCalendarOptionsInput } from '@/calendar/components/settings/ChangeCalendarOptionsInput'
export { default as ChangeVisibleHoursInput } from '@/calendar/components/settings/ChangeVisibleHoursInput'
export { default as ChangeWorkingHoursInput } from '@/calendar/components/settings/ChangeWorkingHoursInput'

// Store
export { useCalendarStore } from '@/stores/calendar'
export type { ICalendarState } from '@/stores/calendar'

// Hooks
export { useCalendarGrid } from '@/calendar/hooks/useCalendarGrid'
export { useFilteredEvents } from '@/calendar/hooks/useFilteredEvents'
export { useEventPositioning } from '@/calendar/hooks/useEventPositioning'
export { useVisibleHours } from '@/calendar/hooks/useVisibleHours'
export { useCurrentTime } from '@/calendar/hooks/useCurrentTime'
export { useDisclosure } from '@/calendar/hooks/useDisclosure'
export { useUpdateEvent } from '@/calendar/hooks/useUpdateEvent'

// Helpers
export {
  rangeText,
  navigateDate,
  getEventsCount,
  getCurrentEvents,
  groupEvents,
  getEventBlockStyle,
  isWorkingHour,
  getVisibleHours,
  getCalendarCells,
  calculateMonthEventPositions,
  getMonthCellEvents,
} from '@/calendar/helpers'

// Types & Interfaces
export type { TCalendarView, TEventColor, TBadgeVariant, TWorkingHours, TVisibleHours } from '@/calendar/types'
export type { IEvent, IUser, ICalendarCell, ICalendarCommand, ICalendarCommandSelect } from '@/calendar/interfaces'

// Labels
export type { ICalendarLabels } from '@/calendar/labels'
export {
  DEFAULT_LABELS,
  useCalendarLabels,
  useCalendarFlags,
  useDateLocale,
  CalendarLabelsContext,
  CalendarFlagsContext,
  CalendarDateLocaleContext,
} from '@/calendar/labels'

// Schemas
export { eventSchema, createEventSchema, type TEventFormData } from '@/calendar/schemas'

// Mock data (for demos)
export { USERS_MOCK, CALENDAR_ITEMS_MOCK } from '@/calendar/mocks'
