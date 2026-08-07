import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BigCalendar from '@/calendar/components/CalendarContainer'
import { useCalendarStore } from '@/stores/calendar'
import type { IEvent, IUser } from '@/calendar/interfaces'

const USER: IUser = { id: 'u1', name: 'Ada', picturePath: null }

/** Wednesday. Its week is Jan 12 - Jan 18 2025. */
const DAY = new Date(2025, 0, 15)

function local(year: number, month: number, day: number, hour = 9, minute = 0) {
  return new Date(year, month, day, hour, minute).toISOString()
}

let nextId = 1

function makeEvent(overrides: Partial<IEvent> = {}): IEvent {
  return {
    id: nextId++,
    title: 'Standup',
    description: 'daily',
    color: 'blue',
    user: USER,
    startDate: local(2025, 0, 15, 9),
    endDate: local(2025, 0, 15, 10),
    ...overrides,
  }
}

function seed(events: IEvent[], selected: Date = DAY) {
  useCalendarStore.getState().initialize([USER], events)
  useCalendarStore.getState().setSelectedDate(selected)
}

beforeEach(() => {
  nextId = 1
})

afterEach(() => {
  vi.useRealTimers()
})

describe('L1 - agenda day heading date (TZ safe)', () => {
  it('runs in a UTC-negative timezone', () => {
    expect(new Date(2025, 0, 15).getTimezoneOffset()).toBeGreaterThan(0)
  })

  it('labels the group with the local event date, not the UTC-shifted one', () => {
    seed([makeEvent()])
    render(<BigCalendar view="agenda" />)

    // `new Date('2025-01-15')` renders "January 14" west of Greenwich.
    expect(screen.getByText(/January 15, 2025/)).toBeInTheDocument()
    expect(screen.queryByText(/January 14, 2025/)).toBeNull()
  })

  it('keeps a first-of-month event inside its own month', () => {
    seed([
      makeEvent({
        startDate: local(2025, 0, 1, 9),
        endDate: local(2025, 0, 1, 10),
        title: 'New year sync',
      }),
    ])
    render(<BigCalendar view="agenda" />)

    expect(screen.getByText(/January 1, 2025/)).toBeInTheDocument()
    expect(screen.queryByText(/December 31, 2024/)).toBeNull()
  })
})

describe('L2 - timeline only when the range contains today', () => {
  it('hides the week timeline for a week that is not the current one', () => {
    vi.setSystemTime(new Date(2025, 5, 10, 12, 0))
    seed([makeEvent()])

    const { container } = render(
      <BigCalendar view="week" classNames={{ timeline: 'tl-probe' }} />
    )
    expect(container.querySelector('.tl-probe')).toBeNull()
  })

  it('shows the week timeline when the shown week contains today', () => {
    vi.setSystemTime(new Date(2025, 0, 15, 12, 0))
    seed([makeEvent()])

    const { container } = render(
      <BigCalendar view="week" classNames={{ timeline: 'tl-probe' }} />
    )
    expect(container.querySelector('.tl-probe')).not.toBeNull()
  })

  it('hides the day timeline for a day that is not today', () => {
    vi.setSystemTime(new Date(2025, 5, 10, 12, 0))
    seed([makeEvent()])

    const { container } = render(
      <BigCalendar view="day" classNames={{ timeline: 'tl-probe' }} />
    )
    expect(container.querySelector('.tl-probe')).toBeNull()
  })

  it('shows the day timeline on today', () => {
    vi.setSystemTime(new Date(2025, 0, 15, 12, 0))
    seed([makeEvent()])

    const { container } = render(
      <BigCalendar view="day" classNames={{ timeline: 'tl-probe' }} />
    )
    expect(container.querySelector('.tl-probe')).not.toBeNull()
  })
})

describe('L3 - week all-day strip', () => {
  function seedTwoRows() {
    seed([
      makeEvent({
        title: 'Conference',
        startDate: local(2025, 0, 13, 9),
        endDate: local(2025, 0, 16, 17),
      }),
      makeEvent({
        title: 'Offsite',
        startDate: local(2025, 0, 14, 9),
        endDate: local(2025, 0, 17, 17),
      }),
    ])
  }

  it('renders the strip below the day-name header row', () => {
    seedTwoRows()
    const { container } = render(<BigCalendar view="week" />)

    const strip = container.querySelector('[data-all-day-strip]')
    const header = container.querySelector('.sticky.top-0')
    expect(strip).not.toBeNull()
    expect(header).not.toBeNull()
    // DOCUMENT_POSITION_FOLLOWING === the strip comes after the header.
    expect(header!.compareDocumentPosition(strip!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders the all-day gutter label', () => {
    seedTwoRows()
    render(<BigCalendar view="week" />)
    expect(screen.getByText('All day')).toBeInTheDocument()
  })

  it('uses a custom allDay label when supplied', () => {
    seedTwoRows()
    render(<BigCalendar view="week" labels={{ allDay: 'Toute la journee' }} />)
    expect(screen.getByText('Toute la journee')).toBeInTheDocument()
  })

  it('caps and scrolls the strip when allDayMaxRows is exceeded', () => {
    seedTwoRows()
    const { container } = render(<BigCalendar view="week" allDayMaxRows={1} />)

    const strip = container.querySelector('[data-all-day-strip]') as HTMLElement
    expect(strip.className).toContain('overflow-y-auto')
    expect(strip.style.maxHeight).toBe('34px')
  })

  it('leaves the strip uncapped by default', () => {
    seedTwoRows()
    const { container } = render(<BigCalendar view="week" />)

    const strip = container.querySelector('[data-all-day-strip]') as HTMLElement
    expect(strip.className).not.toContain('overflow-y-auto')
    expect(strip.style.maxHeight).toBe('')
  })

  it('does not cap when the row count fits', () => {
    seedTwoRows()
    const { container } = render(<BigCalendar view="week" allDayMaxRows={6} />)

    const strip = container.querySelector('[data-all-day-strip]') as HTMLElement
    expect(strip.className).not.toContain('overflow-y-auto')
  })
})

describe('L4 - month bullets are interactive', () => {
  it('opens details from the mobile bullet', () => {
    seed([makeEvent()])
    const onEventClick = vi.fn()

    const { container } = render(
      <BigCalendar view="month" openDetailsOnEventClick={false} onEventClick={onEventClick} />
    )

    const bullet = container.querySelector('[data-event-id="1"].lg\\:hidden') as HTMLElement
    expect(bullet).not.toBeNull()
    expect(bullet.getAttribute('role')).toBe('button')
    expect(bullet.querySelector('.bc-event-bullet')).not.toBeNull()

    fireEvent.click(bullet)
    expect(onEventClick).toHaveBeenCalledTimes(1)
    expect(onEventClick.mock.calls[0]![0].id).toBe(1)
  })

  it('opens details from the bullet via the keyboard', () => {
    seed([makeEvent()])
    const onEventClick = vi.fn()

    const { container } = render(
      <BigCalendar view="month" openDetailsOnEventClick={false} onEventClick={onEventClick} />
    )

    const bullet = container.querySelector('[data-event-id="1"].lg\\:hidden') as HTMLElement
    fireEvent.keyDown(bullet, { key: 'Enter' })
    expect(onEventClick).toHaveBeenCalledTimes(1)
  })
})

describe('L5 - agenda heading casing', () => {
  it('uppercases only the first letter of the heading', () => {
    seed([makeEvent()])
    const { container } = render(<BigCalendar view="agenda" />)

    const heading = container.querySelector('h3') as HTMLElement
    expect(heading.className).toContain('first-letter:uppercase')
    expect(heading.className).not.toContain('capitalize')
  })
})

describe('L6 - agenda range is the calendar month', () => {
  it('lists only days of the selected month, never the padded grid days', () => {
    seed([
      makeEvent({ title: 'Dec', startDate: local(2024, 11, 31, 9), endDate: local(2024, 11, 31, 10) }),
      makeEvent({ title: 'Jan first', startDate: local(2025, 0, 1, 9), endDate: local(2025, 0, 1, 10) }),
      makeEvent({ title: 'Jan last', startDate: local(2025, 0, 31, 9), endDate: local(2025, 0, 31, 10) }),
      makeEvent({ title: 'Feb', startDate: local(2025, 1, 1, 9), endDate: local(2025, 1, 1, 10) }),
    ])

    const { container } = render(<BigCalendar view="agenda" />)
    const headings = Array.from(container.querySelectorAll('h3')).map((h) => h.textContent ?? '')

    expect(headings).toHaveLength(2)
    expect(headings[0]).toMatch(/January 1, 2025/)
    expect(headings[1]).toMatch(/January 31, 2025/)
    expect(screen.queryByText('Dec')).toBeNull()
    expect(screen.queryByText('Feb')).toBeNull()
  })
})
