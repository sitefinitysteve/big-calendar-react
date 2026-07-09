import { useMemo } from 'react'
import { parseISO, isSameDay } from 'date-fns'
import { useCalendarStore } from '@/stores/calendar'
import type { TCalendarView } from '@/calendar/types'

export function useFilteredEvents(view: TCalendarView) {
  const selectedDate = useCalendarStore((s) => s.selectedDate)
  const selectedUserId = useCalendarStore((s) => s.selectedUserId)
  const events = useCalendarStore((s) => s.events)

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventStartDate = parseISO(event.startDate)
      const eventEndDate = parseISO(event.endDate)

      const isUserMatch = selectedUserId === 'all' || event.user.id === selectedUserId

      if (view === 'year') {
        const yearStart = new Date(selectedDate.getFullYear(), 0, 1)
        const yearEnd = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999)
        return eventStartDate <= yearEnd && eventEndDate >= yearStart && isUserMatch
      }

      if (view === 'month' || view === 'agenda') {
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999)
        return eventStartDate <= monthEnd && eventEndDate >= monthStart && isUserMatch
      }

      if (view === 'week') {
        const dayOfWeek = selectedDate.getDay()
        const weekStart = new Date(selectedDate)
        weekStart.setDate(selectedDate.getDate() - dayOfWeek)
        weekStart.setHours(0, 0, 0, 0)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)
        return eventStartDate <= weekEnd && eventEndDate >= weekStart && isUserMatch
      }

      if (view === 'day') {
        const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0)
        const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59)
        return eventStartDate <= dayEnd && eventEndDate >= dayStart && isUserMatch
      }

      return false
    })
  }, [events, selectedDate, selectedUserId, view])

  const singleDayEvents = useMemo(
    () =>
      filteredEvents.filter(
        (event) => isSameDay(parseISO(event.startDate), parseISO(event.endDate)) && !event.isAllDay
      ),
    [filteredEvents]
  )

  const multiDayEvents = useMemo(
    () =>
      filteredEvents.filter(
        (event) => !isSameDay(parseISO(event.startDate), parseISO(event.endDate)) || !!event.isAllDay
      ),
    [filteredEvents]
  )

  // For year view: only use start dates as indicators
  const eventStartDates = useMemo(
    () => filteredEvents.map((event) => ({ ...event, endDate: event.startDate })),
    [filteredEvents]
  )

  return { filteredEvents, singleDayEvents, multiDayEvents, eventStartDates }
}
