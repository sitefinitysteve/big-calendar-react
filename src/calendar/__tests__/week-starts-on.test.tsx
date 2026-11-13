import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import BigCalendar from '@/calendar/components/CalendarContainer'
import { SingleDayPicker } from '@/components/ui/single-day-picker'
import { useCalendarStore } from '@/stores/calendar'
import { getCalendarCells, getEventsCount, leadingDays, rangeText, rotateWeekdays } from '@/calendar/helpers'
import type { IEvent, IUser } from '@/calendar/interfaces'
import type { TWeekStartsOn } from '@/calendar/types'

const USER: IUser = { id: 'u1', name: 'Ada', picturePath: null }

// 1 Oct 2026 is a Thursday; 15 Oct 2026 is a Thursday; 18 Oct 2026 is a Sunday.
const OCT_15 = new Date(2026, 9, 15)

const SUNDAY_EVENT: IEvent = {
  id: 7,
  title: 'Sunday brunch',
  description: 'weekend',
  color: 'green',
  user: USER,
  startDate: new Date(2026, 9, 18, 11).toISOString(),
  endDate: new Date(2026, 9, 18, 12).toISOString(),
}

beforeEach(() => {
  useCalendarStore.getState().initialize([USER], [SUNDAY_EVENT])
  useCalendarStore.getState().setSelectedDate(OCT_15)
})

function leadingCells(container: HTMLElement, monthPrefix: string, firstOfMonth: string) {
  const cells = Array.from(container.querySelectorAll<HTMLElement>('[data-date]'))
  const firstIndex = cells.findIndex((el) => el.dataset.date === firstOfMonth)
  return cells.slice(0, firstIndex).filter((el) => el.dataset.date!.startsWith(monthPrefix)).length
}

describe('month view', () => {
  it.each<[TWeekStartsOn | undefined, number, string, string]>([
    [undefined, 4, 'Sun', 'Sat'],
    [0, 4, 'Sun', 'Sat'],
    [1, 3, 'Mon', 'Sun'],
  ])('weekStartsOn=%s: %i leading blanks, header %s..%s', (weekStartsOn, blanks, first, last) => {
    const { container } = render(<BigCalendar view="month" weekStartsOn={weekStartsOn} />)

    const firstCell = container.querySelector('[data-date="2026-10-01"]')!
    const grid = firstCell.parentElement!
    const header = grid.previousElementSibling!
    const headerLabels = Array.from(header.children).map((el) => el.textContent)

    expect(headerLabels).toHaveLength(7)
    expect(headerLabels[0]).toBe(first)
    expect(headerLabels[6]).toBe(last)
    expect(leadingCells(grid, '2026-09', '2026-10-01')).toBe(blanks)
    expect(grid.children.length % 7).toBe(0)
    // The first column never draws a left border.
    expect(grid.children[0]!.className).toContain('border-l-0')
  })

  it('getCalendarCells defaults to Sunday-first and rotates for Monday', () => {
    expect(getCalendarCells(OCT_15)[0]!.date).toEqual(new Date(2026, 8, 27))
    expect(getCalendarCells(OCT_15, 1)[0]!.date).toEqual(new Date(2026, 8, 28))
    // A month starting on Sunday has no leading cells Sunday-first, six Monday-first.
    const nov = new Date(2026, 10, 1)
    expect(getCalendarCells(nov)[0]!.date).toEqual(nov)
    expect(getCalendarCells(nov, 1).findIndex((c) => c.currentMonth)).toBe(6)
    expect(leadingDays(OCT_15)).toBe(4)
    expect(leadingDays(OCT_15, 1)).toBe(3)
    expect(rotateWeekdays([0, 1, 2, 3, 4, 5, 6], 1)).toEqual([1, 2, 3, 4, 5, 6, 0])
  })
})

describe('week view', () => {
  function weekHeader(container: HTMLElement) {
    const header = container.querySelector('.sticky.top-0 .grid-cols-7')!
    return Array.from(header.children).map((el) => el.textContent)
  }

  it('is Sunday-first by default', () => {
    const { container } = render(<BigCalendar view="week" />)
    const days = weekHeader(container)
    expect(days[0]).toBe('Sun11')
    expect(days[6]).toBe('Sat17')
    expect(container.textContent).toContain('Oct 11, 2026 - Oct 17, 2026')
    expect(container.querySelector('[data-event-id="7"]')).toBeNull()
  })

  it('is Monday-first with weekStartsOn=1, and keeps that Sunday in range', () => {
    const { container } = render(<BigCalendar view="week" weekStartsOn={1} />)
    const days = weekHeader(container)
    expect(days[0]).toBe('Mon12')
    expect(days[6]).toBe('Sun18')
    expect(container.textContent).toContain('Oct 12, 2026 - Oct 18, 2026')
    expect(container.querySelector('[data-event-id="7"]')).not.toBeNull()
  })

  it('helpers honour weekStartsOn for range text and event counts', () => {
    expect(rangeText('week', OCT_15)).toBe('Oct 11, 2026 - Oct 17, 2026')
    expect(rangeText('week', OCT_15, undefined, 1)).toBe('Oct 12, 2026 - Oct 18, 2026')
    expect(getEventsCount([SUNDAY_EVENT], OCT_15, 'week')).toBe(0)
    expect(getEventsCount([SUNDAY_EVENT], OCT_15, 'week', 1)).toBe(1)
  })
})

describe('year view', () => {
  it.each<[TWeekStartsOn, number, string]>([
    [0, 4, 'S'],
    [1, 3, 'M'],
  ])('weekStartsOn=%s: October has %i blanks, header starts %s', (weekStartsOn, blanks, first) => {
    const { container } = render(<BigCalendar view="year" weekStartsOn={weekStartsOn} />)

    const firstDay = container.querySelector('[data-date="2026-10-01"]')!
    const grid = firstDay.parentElement!
    const children = Array.from(grid.children)
    const before = children.slice(0, children.indexOf(firstDay))

    expect(before).toHaveLength(7 + blanks)
    expect(before[0]!.textContent).toBe(first)
  })
})

describe('SingleDayPicker', () => {
  function firstWeekdayHeader(weekStartsOn?: 0 | 1) {
    const { getByRole } = render(
      <SingleDayPicker value={OCT_15} onChange={() => {}} weekStartsOn={weekStartsOn} />
    )
    fireEvent.click(getByRole('button'))
    const headers = document.querySelectorAll('th[aria-label], [role="columnheader"]')
    return headers[0]?.getAttribute('aria-label')
  }

  it('starts on Sunday by default', () => {
    expect(firstWeekdayHeader()).toBe('Sunday')
  })

  it('starts on Monday with weekStartsOn=1', () => {
    expect(firstWeekdayHeader(1)).toBe('Monday')
  })
})

describe('day view mini calendar', () => {
  function miniCalendarWeekdays(container: HTMLElement) {
    return Array.from(container.querySelectorAll('th[aria-label]')).map((el) => el.getAttribute('aria-label'))
  }

  it('follows dateLocale for weekday names', async () => {
    const { frCA } = await import('date-fns/locale')
    const { container } = render(<BigCalendar view="day" dateLocale={frCA} />)
    expect(miniCalendarWeekdays(container)[0]).toBe('dimanche')
  })

  it('combines dateLocale with weekStartsOn', async () => {
    const { frCA } = await import('date-fns/locale')
    const { container } = render(<BigCalendar view="day" dateLocale={frCA} weekStartsOn={1} />)
    expect(miniCalendarWeekdays(container)[0]).toBe('lundi')
  })

  it('stays English with no dateLocale', () => {
    const { container } = render(<BigCalendar view="day" />)
    expect(miniCalendarWeekdays(container)[0]).toBe('Sunday')
  })
})
