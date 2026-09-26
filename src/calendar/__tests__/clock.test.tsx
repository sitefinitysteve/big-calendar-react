import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { enGB, enUS, frCA, zhCN } from 'date-fns/locale'
import type { Locale } from 'date-fns'
import BigCalendar from '@/calendar/components/CalendarContainer'
import { formatDateTime, formatHour, formatTime } from '@/calendar/date-format'
import { useCalendarStore } from '@/stores/calendar'
import type { TTimeFormatter } from '@/calendar/customization'
import type { IEvent, IUser } from '@/calendar/interfaces'

const USER: IUser = { id: 'u1', name: 'Ada', picturePath: null }

/** Wednesday; also "today" for the now-marker tests. */
const DAY = new Date(2025, 0, 15)

const EIGHT_OH_FIVE = new Date(2025, 0, 15, 8, 5)
const TWO_THIRTY_PM = new Date(2025, 0, 15, 14, 30)

function makeEvent(overrides: Partial<IEvent> = {}): IEvent {
  return {
    id: 1,
    title: 'Standup',
    description: 'daily',
    color: 'blue',
    user: USER,
    startDate: new Date(2025, 0, 15, 9, 0).toISOString(),
    endDate: new Date(2025, 0, 15, 10, 0).toISOString(),
    ...overrides,
  }
}

/** Collapses the narrow/no-break spaces some ICU builds print, so assertions read plainly. */
function plain(text: string | null | undefined): string {
  return (text ?? '').replace(/[  ]/g, ' ')
}

function hasText(expected: string) {
  return (_: string, node: Element | null) =>
    !!node && node.children.length === 0 && plain(node.textContent) === expected
}

beforeEach(() => {
  useCalendarStore.getState().initialize([USER], [makeEvent()])
  useCalendarStore.getState().setSelectedDate(DAY)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Intl clock defaults', () => {
  it('drops the leading zero from a 12-hour axis and event time', () => {
    expect(plain(formatHour(EIGHT_OH_FIVE))).toBe('8 AM')
    expect(plain(formatHour(EIGHT_OH_FIVE, enUS))).toBe('8 AM')
    expect(plain(formatTime(EIGHT_OH_FIVE, enUS))).toBe('8:05 AM')
    expect(plain(formatTime(TWO_THIRTY_PM))).toBe('2:30 PM')
  })

  it('keeps each 24-hour locale on its own CLDR shape', () => {
    expect(plain(formatHour(EIGHT_OH_FIVE, enGB))).toBe('08')
    expect(plain(formatTime(EIGHT_OH_FIVE, enGB))).toBe('08:05')
    expect(plain(formatHour(TWO_THIRTY_PM, frCA))).toBe('14 h')
    expect(plain(formatTime(TWO_THIRTY_PM, frCA))).toBe('14 h 30')
  })

  it('puts a leading meridiem where the locale does', () => {
    expect(plain(formatHour(EIGHT_OH_FIVE, zhCN))).toBe('上午8时')
    expect(plain(formatTime(EIGHT_OH_FIVE, zhCN))).toBe('上午8:05')
  })

  it('falls back to the locale pattern when the Locale has no code', () => {
    const handRolled = { ...enUS, code: undefined } as unknown as Locale

    expect(formatHour(EIGHT_OH_FIVE, handRolled)).toBe('8 AM')
    expect(formatTime(EIGHT_OH_FIVE, handRolled)).toBe('8:05 AM')
  })

  it('splices the Intl clock into the locale date-time joiner', () => {
    expect(plain(formatDateTime(TWO_THIRTY_PM, enUS))).toBe('Jan 15, 2025, 2:30 PM')
    expect(plain(formatDateTime(TWO_THIRTY_PM, frCA))).toBe('15 janv. 2025, 14 h 30')
    expect(plain(formatDateTime(TWO_THIRTY_PM))).toBe('Jan 15, 2025 2:30 PM')
    expect(formatDateTime(TWO_THIRTY_PM, enUS, 'host clock')).toBe('Jan 15, 2025, host clock')
  })
})

describe('rendered clock labels', () => {
  it('labels the week hour axis without a leading zero on a 12-hour clock', () => {
    render(<BigCalendar view="week" />)

    expect(screen.getAllByText(hasText('8 AM')).length).toBeGreaterThan(0)
    expect(screen.queryAllByText(hasText('08 AM'))).toHaveLength(0)
  })

  it('labels the day hour axis per locale', () => {
    render(<BigCalendar view="day" dateLocale={enGB} />)

    expect(screen.getAllByText(hasText('08')).length).toBeGreaterThan(0)
  })
})

describe('formatTime prop', () => {
  const host: TTimeFormatter = (date, kind) => `${kind}@${date.getHours()}`

  it('formats the week axis, event times and now-marker', () => {
    vi.setSystemTime(new Date(2025, 0, 15, 12, 0))
    render(<BigCalendar view="week" formatTime={host} />)

    expect(screen.getAllByText('axis@8').length).toBeGreaterThan(0)
    expect(screen.getByText('event@9 - event@10')).toBeInTheDocument()
    expect(screen.getAllByText('now@12').length).toBeGreaterThan(0)
  })

  it('formats the day view axis and its sidebar event times', () => {
    vi.setSystemTime(new Date(2025, 0, 15, 9, 30))
    render(<BigCalendar view="day" formatTime={host} />)

    expect(screen.getAllByText('axis@8').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/event@9/).length).toBeGreaterThan(0)
  })

  it('formats agenda and month event times', () => {
    const { unmount } = render(<BigCalendar view="agenda" formatTime={host} />)
    expect(screen.getByText('event@9 - event@10')).toBeInTheDocument()
    unmount()

    render(<BigCalendar view="month" formatTime={host} />)
    expect(screen.getAllByText('event@9').length).toBeGreaterThan(0)
  })

  it('formats the details dialog date-time rows', () => {
    render(<BigCalendar view="agenda" formatTime={host} />)

    fireEvent.click(screen.getByText('Standup'))

    expect(screen.getByText('Jan 15, 2025 event@9')).toBeInTheDocument()
    expect(screen.getByText('Jan 15, 2025 event@10')).toBeInTheDocument()
  })
})
