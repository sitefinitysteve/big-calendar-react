import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { IEvent } from '@/calendar/interfaces'
import type { TBadgeVariant, TLegacyEventColor } from '@/calendar/types'

/** The seven colors that ship with their own Tailwind class maps. */
export const LEGACY_EVENT_COLORS: TLegacyEventColor[] = [
  'blue',
  'green',
  'red',
  'yellow',
  'purple',
  'orange',
  'gray',
]

/**
 * `true` when `color` is one of the seven built-in names (which render through
 * the cva Tailwind maps). Anything else is treated as a raw CSS color and
 * rendered via `.bc-event-custom-color` + the `--bc-event-color` variable.
 */
export function isLegacyColor(color: string | undefined | null): color is TLegacyEventColor {
  return !!color && (LEGACY_EVENT_COLORS as string[]).includes(color)
}

/** Which surface the event is being rendered on. */
export type TEventRenderView = 'week' | 'day' | 'month' | 'agenda'

/** Context handed to a custom event renderer. */
export interface IEventRenderContext {
  view: TEventRenderView
  selected: boolean
  badgeVariant: TBadgeVariant
  /** The markup the library would have rendered — return it to opt out per event. */
  defaultContent: ReactNode
}

export type TEventRenderer = (event: IEvent, ctx: IEventRenderContext) => ReactNode

/** Which clock label is being formatted: the day/week hour axis, the now-marker, or an event time. */
export type TTimeFormatKind = 'axis' | 'now' | 'event'

/**
 * Host override for every clock label. `axis` receives the top of each hour and
 * should return an hour-only label; `now` and `event` return a full time.
 */
export type TTimeFormatter = (date: Date, kind: TTimeFormatKind) => string

/** Extra class names merged onto the library's own structural elements. */
export interface ICalendarClassNames {
  root?: string
  header?: string
  dayCell?: string
  hourRow?: string
  eventBlock?: string
  timeline?: string
}

export interface ICalendarCustomization {
  renderEvent?: TEventRenderer
  renderMonthEvent?: TEventRenderer
  renderAgendaEvent?: TEventRenderer
  selectedEventId?: number | null
  /** Pixel height of one hour row in the week/day grids. */
  hourHeight: number
  /** Height of the week/day scroll area. `undefined` keeps the stock height. */
  height?: number | string
  autoHeight?: boolean
  maxEventsPerDayCell: number
  /** Cap for the week all-day strip; beyond it the strip scrolls internally. */
  allDayMaxRows?: number
  onShowMore?: (date: string) => void
  classNames?: ICalendarClassNames
  dayCellClassName?: (date: Date) => string | undefined
  /** Replaces the built-in Intl clock for the hour axis, now-marker and event times. */
  formatTime?: TTimeFormatter
}

/** Defaults reproduce v1.1.0 behavior exactly for standalone-exported views. */
export const DEFAULT_CUSTOMIZATION: ICalendarCustomization = {
  hourHeight: 96,
  maxEventsPerDayCell: 3,
}

export const CalendarCustomizationContext =
  createContext<ICalendarCustomization>(DEFAULT_CUSTOMIZATION)

export function useCalendarCustomization(): ICalendarCustomization {
  return useContext(CalendarCustomizationContext)
}
