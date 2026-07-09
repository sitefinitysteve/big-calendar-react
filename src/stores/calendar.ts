import { create } from 'zustand'
import type { IEvent, IUser } from '@/calendar/interfaces'
import type { TBadgeVariant, TCalendarView, TVisibleHours, TWorkingHours } from '@/calendar/types'

const DEFAULT_WORKING_HOURS: TWorkingHours = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 8, to: 12 },
}

const DEFAULT_VISIBLE_HOURS: TVisibleHours = { from: 7, to: 18 }

export interface ICalendarState {
  selectedDate: Date
  selectedUserId: string | 'all'
  badgeVariant: TBadgeVariant
  users: IUser[]
  events: IEvent[]
  workingHours: TWorkingHours
  visibleHours: TVisibleHours
  availableViews: TCalendarView[]
  showUserSelect: boolean
  canAdd: boolean
  canEdit: boolean
  canDelete: boolean

  setSelectedDate: (date: Date | undefined) => void
  setSelectedUserId: (userId: string | 'all') => void
  setBadgeVariant: (variant: TBadgeVariant) => void
  setWorkingHours: (workingHours: TWorkingHours) => void
  setVisibleHours: (visibleHours: TVisibleHours) => void
  setAvailableViews: (views: TCalendarView[]) => void
  setShowUserSelect: (value: boolean) => void
  setCanAdd: (value: boolean) => void
  setCanEdit: (value: boolean) => void
  setCanDelete: (value: boolean) => void
  addEvent: (event: IEvent) => void
  updateEvent: (updatedEvent: IEvent) => void
  deleteEvent: (eventId: number) => void
  initialize: (initialUsers: IUser[], initialEvents: IEvent[]) => void
}

export const useCalendarStore = create<ICalendarState>((set) => ({
  selectedDate: new Date(),
  selectedUserId: 'all',
  badgeVariant: 'colored',
  users: [],
  events: [],
  workingHours: { ...DEFAULT_WORKING_HOURS },
  visibleHours: { ...DEFAULT_VISIBLE_HOURS },
  availableViews: ['day', 'week', 'month', 'year', 'agenda'],
  showUserSelect: true,
  // Demo default: start events-only so clicking an empty day/slot does NOT pop
  // the built-in Add dialog. The settings switch re-enables it. Note: this is
  // the demo store's default; `BigCalendar`'s own `canAdd` prop still defaults
  // to `true` for library consumers.
  canAdd: false,
  canEdit: true,
  canDelete: true,

  setSelectedDate: (date) => {
    if (!date) return
    set({ selectedDate: date })
  },
  setSelectedUserId: (userId) => set({ selectedUserId: userId }),
  setBadgeVariant: (variant) => set({ badgeVariant: variant }),
  setWorkingHours: (workingHours) => set({ workingHours }),
  setVisibleHours: (visibleHours) => set({ visibleHours }),
  setAvailableViews: (views) => set({ availableViews: views }),
  setShowUserSelect: (value) => set({ showUserSelect: value }),
  setCanAdd: (value) => set({ canAdd: value }),
  setCanEdit: (value) => set({ canEdit: value }),
  setCanDelete: (value) => set({ canDelete: value }),

  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        {
          ...event,
          startDate: new Date(event.startDate).toISOString(),
          endDate: new Date(event.endDate).toISOString(),
        },
      ],
    })),

  updateEvent: (updatedEvent) =>
    set((state) => {
      const index = state.events.findIndex((e) => e.id === updatedEvent.id)
      if (index === -1) return {}
      return {
        events: [
          ...state.events.slice(0, index),
          {
            ...updatedEvent,
            startDate: new Date(updatedEvent.startDate).toISOString(),
            endDate: new Date(updatedEvent.endDate).toISOString(),
          },
          ...state.events.slice(index + 1),
        ],
      }
    }),

  deleteEvent: (eventId) =>
    set((state) => ({ events: state.events.filter((e) => e.id !== eventId) })),

  initialize: (initialUsers, initialEvents) =>
    set({ users: initialUsers, events: initialEvents }),
}))
