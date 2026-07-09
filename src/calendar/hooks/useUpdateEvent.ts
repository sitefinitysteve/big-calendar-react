import { useCalendarStore } from '@/stores/calendar'
import type { IEvent } from '@/calendar/interfaces'

export function useUpdateEvent() {
  const storeUpdateEvent = useCalendarStore((s) => s.updateEvent)

  const updateEvent = (event: IEvent) => {
    storeUpdateEvent(event)
  }

  return { updateEvent }
}
