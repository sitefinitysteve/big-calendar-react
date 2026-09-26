import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BigCalendar from '@/calendar/components/CalendarContainer'
import { useCalendarStore } from '@/stores/calendar'
import { isLegacyColor } from '@/calendar/customization'
import type { IEvent, IUser } from '@/calendar/interfaces'

const USER: IUser = { id: 'u1', name: 'Ada', picturePath: null }

// Fixed date so the month/week grids are deterministic.
const DAY = new Date(2025, 0, 15)

function iso(hour: number, minute = 0, day = 15) {
  return new Date(2025, 0, day, hour, minute).toISOString()
}

function makeEvent(overrides: Partial<IEvent> = {}): IEvent {
  return {
    id: 1,
    title: 'Standup',
    description: 'daily',
    color: 'blue',
    user: USER,
    startDate: iso(9),
    endDate: iso(10),
    ...overrides,
  }
}

function seed(events: IEvent[]) {
  useCalendarStore.getState().initialize([USER], events)
  useCalendarStore.getState().setSelectedDate(DAY)
}

beforeEach(() => {
  seed([makeEvent()])
})

describe('isLegacyColor', () => {
  it('recognises the seven built-ins and rejects anything else', () => {
    expect(isLegacyColor('blue')).toBe(true)
    expect(isLegacyColor('gray')).toBe(true)
    expect(isLegacyColor('#ff0000')).toBe(false)
    expect(isLegacyColor(undefined)).toBe(false)
  })
})

describe('zero new props', () => {
  it('renders the built-in header and stock event markup', () => {
    const { container } = render(<BigCalendar view="week" />)

    expect(container.querySelector('.bc-header')).not.toBeNull()
    const block = container.querySelector('[data-event-id="1"]')
    expect(block).not.toBeNull()
    expect(block!.getAttribute('data-selected')).toBeNull()
    expect(block!.className).toContain('truncate')
    expect(block!.className).not.toContain('bc-event-custom-color')
    expect((block as HTMLElement).style.height).toBe('88px')
    expect(screen.getByText('Standup')).toBeInTheDocument()
  })

  it('keeps the stock week scroll-area height', () => {
    const { container } = render(<BigCalendar view="week" />)
    expect(container.innerHTML).toContain('h-[736px]')
  })
})

describe('renderers', () => {
  it('replaces week event content and receives the default content', () => {
    const { container } = render(
      <BigCalendar
        view="week"
        renderEvent={(event, ctx) => (
          <span data-testid="custom">
            {ctx.view}:{event.title}
          </span>
        )}
      />
    )

    expect(screen.getByTestId('custom')).toHaveTextContent('week:Standup')
    const block = container.querySelector('[data-event-id="1"]')!
    expect(block.className).not.toContain('truncate')
  })

  it('renderMonthEvent wins over renderEvent in the month view', () => {
    render(
      <BigCalendar
        view="month"
        renderEvent={() => <span data-testid="generic">generic</span>}
        renderMonthEvent={() => <span data-testid="month">month</span>}
      />
    )

    expect(screen.getByTestId('month')).toBeInTheDocument()
    expect(screen.queryByTestId('generic')).toBeNull()
  })

  it('renderAgendaEvent wins over renderEvent in the agenda view', () => {
    render(
      <BigCalendar
        view="agenda"
        renderEvent={() => <span data-testid="generic">generic</span>}
        renderAgendaEvent={() => <span data-testid="agenda">agenda</span>}
      />
    )

    expect(screen.getByTestId('agenda')).toBeInTheDocument()
    expect(screen.queryByTestId('generic')).toBeNull()
  })
})

describe('selection', () => {
  it('marks only the matching event', () => {
    seed([makeEvent(), makeEvent({ id: 2, title: 'Retro', startDate: iso(11), endDate: iso(12) })])

    const { container } = render(<BigCalendar view="week" selectedEventId={2} />)

    expect(container.querySelector('[data-event-id="1"]')!.hasAttribute('data-selected')).toBe(false)
    expect(container.querySelector('[data-event-id="2"]')!.hasAttribute('data-selected')).toBe(true)
  })

  it('fires onSelectedEventChange on click', () => {
    const onSelectedEventChange = vi.fn()
    const { container } = render(
      <BigCalendar
        view="week"
        openDetailsOnEventClick={false}
        onSelectedEventChange={onSelectedEventChange}
      />
    )

    fireEvent.click(container.querySelector('[data-event-id="1"]')!)
    expect(onSelectedEventChange).toHaveBeenCalledTimes(1)
    expect(onSelectedEventChange.mock.calls[0]?.[0].id).toBe(1)
  })

  it('uses minHeight (not height) for a selected custom-rendered block', () => {
    const { container } = render(
      <BigCalendar view="week" selectedEventId={1} renderEvent={(e) => <span>{e.title}</span>} />
    )

    const block = container.querySelector('[data-event-id="1"]') as HTMLElement
    expect(block.style.minHeight).toBe('88px')
    expect(block.style.height).toBe('')
    expect(block.className).toContain('z-10')
    // z-index is inert on a static box.
    expect(block.className).toContain('relative')
  })

  it('emits null when the already-selected event is clicked again', () => {
    const onSelectedEventChange = vi.fn()
    const { container } = render(
      <BigCalendar
        view="week"
        selectedEventId={1}
        openDetailsOnEventClick={false}
        onSelectedEventChange={onSelectedEventChange}
      />
    )

    fireEvent.click(container.querySelector('[data-event-id="1"]')!)
    expect(onSelectedEventChange).toHaveBeenCalledWith(null)
  })

  it('tells a renderer in the week all-day strip that it is in the week view', () => {
    seed([makeEvent({ id: 5, startDate: iso(9, 0, 13), endDate: iso(10, 0, 16) })])
    const views: string[] = []
    render(
      <BigCalendar
        view="week"
        renderEvent={(event, ctx) => {
          views.push(ctx.view)
          return <span>{event.title}</span>
        }}
      />
    )

    expect(views.length).toBeGreaterThan(0)
    expect(views).not.toContain('month')
    expect(views).toContain('week')
  })

  it('keeps the root a non-scrolling clip so the week header can stick', () => {
    const { container } = render(<BigCalendar view="week" />)
    const root = container.querySelector('.rounded-xl.border') as HTMLElement

    expect(root.className).toContain('overflow-clip')
    expect(root.className).not.toContain('overflow-hidden')
    // The header's own wrapper must not be its containing block, or it un-sticks early.
    const header = container.querySelector('.sticky.top-0') as HTMLElement
    expect(header.parentElement!.className).toContain('contents')
  })
})

describe('header control', () => {
  it('hideHeader removes the built-in header', () => {
    const { container } = render(<BigCalendar view="week" hideHeader />)
    expect(container.querySelector('.bc-header')).toBeNull()
  })

  it('headerSlot replaces the built-in header', () => {
    const { container } = render(
      <BigCalendar view="week" headerSlot={<div data-testid="slot">toolbar</div>} />
    )
    expect(screen.getByTestId('slot')).toBeInTheDocument()
    expect(container.querySelector('.bc-header')).toBeNull()
  })
})

describe('hourHeight', () => {
  it('scales the block height and the hour rows', () => {
    const { container } = render(<BigCalendar view="week" hourHeight={48} />)

    const block = container.querySelector('[data-event-id="1"]') as HTMLElement
    // (60 / 60) * 48 - 8
    expect(block.style.height).toBe('40px')
    expect(container.innerHTML).toContain('height: 48px')
  })
})

describe('month day cell', () => {
  const many = [1, 2, 3, 4, 5].map((id) =>
    makeEvent({ id, title: `E${id}`, startDate: iso(8 + id), endDate: iso(9 + id) })
  )

  it('caps at three events by default and renders a static "+N more"', () => {
    seed(many)
    const { container } = render(<BigCalendar view="month" />)

    const cell = container.querySelector('[data-date="2025-01-15"]')!
    expect(cell.querySelectorAll('[data-event-id]:not([data-event-bullet])')).toHaveLength(3)
    expect(cell.querySelector('button[type="button"]')).toBeNull()
    expect(cell.textContent).toContain('2')
  })

  it('honours maxEventsPerDayCell', () => {
    seed(many)
    const { container } = render(<BigCalendar view="month" maxEventsPerDayCell={5} />)

    const cell = container.querySelector('[data-date="2025-01-15"]')!
    expect(cell.querySelectorAll('[data-event-id]:not([data-event-bullet])')).toHaveLength(5)
  })

  it('makes "+N more" a button when onShowMore is provided', () => {
    seed(many)
    const onShowMore = vi.fn()
    const { container } = render(<BigCalendar view="month" onShowMore={onShowMore} />)

    const cell = container.querySelector('[data-date="2025-01-15"]')!
    const button = cell.querySelector('button[type="button"]')!
    fireEvent.click(button)
    expect(onShowMore).toHaveBeenCalledWith('2025-01-15')
  })

  it('applies dayCellClassName and classNames.dayCell', () => {
    const { container } = render(
      <BigCalendar
        view="month"
        classNames={{ dayCell: 'all-cells' }}
        dayCellClassName={(date) => (date.getDate() === 15 ? 'the-15th' : undefined)}
      />
    )

    const cell = container.querySelector('[data-date="2025-01-15"]')!
    expect(cell.className).toContain('all-cells')
    expect(cell.className).toContain('the-15th')
  })
})

describe('open color system', () => {
  it('legacy colors keep their Tailwind classes and get no inline variable', () => {
    const { container } = render(<BigCalendar view="week" />)
    const block = container.querySelector('[data-event-id="1"]') as HTMLElement

    expect(block.className).toContain('bg-blue-50')
    expect(block.className).not.toContain('bc-event-custom-color')
    expect(block.style.getPropertyValue('--bc-event-color')).toBe('')
  })

  it('custom colors get the class + inline variable', () => {
    seed([makeEvent({ color: '#ff7a00' })])
    const { container } = render(<BigCalendar view="week" />)
    const block = container.querySelector('[data-event-id="1"]') as HTMLElement

    expect(block.className).toContain('bc-event-custom-color')
    expect(block.style.getPropertyValue('--bc-event-color')).toBe('#ff7a00')
  })
})

describe('height and autoHeight', () => {
  it('applies an inline height to the week scroll area', () => {
    const { container } = render(<BigCalendar view="week" height={400} />)
    const scroll = container.querySelector('[style*="height: 400px"]')

    expect(scroll).not.toBeNull()
    expect(container.innerHTML).not.toContain('h-[736px]')
  })

  it('applies an inline height to the day scroll area', () => {
    const { container } = render(<BigCalendar view="day" height="50vh" />)

    expect(container.innerHTML).toContain('height: 50vh')
    expect(container.innerHTML).not.toContain('h-[800px]')
  })

  it('autoHeight leaves the week grid with no fixed height at all', () => {
    const { container } = render(<BigCalendar view="week" autoHeight />)

    expect(container.innerHTML).not.toContain('h-[736px]')
    expect(container.innerHTML).not.toContain('height: 736px')
  })

  it('autoHeight leaves the day grid with no fixed height at all', () => {
    const { container } = render(<BigCalendar view="day" autoHeight />)

    expect(container.innerHTML).not.toContain('h-[800px]')
    expect(container.innerHTML).not.toContain('height: 800px')
  })

  it('autoHeight wins over an explicit height', () => {
    const { container } = render(<BigCalendar view="week" autoHeight height={400} />)
    expect(container.innerHTML).not.toContain('height: 400px')
  })
})

describe('classNames', () => {
  it('root and header land on their elements', () => {
    const { container } = render(
      <BigCalendar view="week" classNames={{ root: 'my-root', header: 'my-header' }} />
    )

    expect(container.querySelector('.my-root')).not.toBeNull()
    expect(container.querySelector('.bc-header')!.className).toContain('my-header')
  })

  it('eventBlock lands on the week block, month badge and agenda card', () => {
    const week = render(<BigCalendar view="week" classNames={{ eventBlock: 'chip' }} />)
    expect(week.container.querySelector('[data-event-id="1"]')!.className).toContain('chip')
    week.unmount()

    const month = render(<BigCalendar view="month" classNames={{ eventBlock: 'chip' }} />)
    expect(month.container.querySelector('[data-event-id="1"]:not([data-event-bullet])')!.className).toContain('chip')
    month.unmount()

    const agenda = render(<BigCalendar view="agenda" classNames={{ eventBlock: 'chip' }} />)
    expect(agenda.container.querySelector('[data-event-id="1"]')!.className).toContain('chip')
  })

  it('hourRow lands on the week and day hour rows', () => {
    const week = render(<BigCalendar view="week" classNames={{ hourRow: 'my-hour' }} />)
    expect(week.container.querySelectorAll('.my-hour').length).toBeGreaterThan(0)
    week.unmount()

    const day = render(<BigCalendar view="day" classNames={{ hourRow: 'my-hour' }} />)
    expect(day.container.querySelectorAll('.my-hour').length).toBeGreaterThan(0)
  })

  it('timeline lands on the current-time line', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // Inside the default visible hours (7 to 18) on the seeded day.
    vi.setSystemTime(new Date(2025, 0, 15, 10, 30))

    try {
      const { container } = render(<BigCalendar view="week" classNames={{ timeline: 'my-line' }} />)
      const line = container.querySelector('.my-line')

      expect(line).not.toBeNull()
      expect(line!.className).toContain('border-primary')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('hideHeader precedence', () => {
  it('wins over headerSlot when both are provided', () => {
    const { container } = render(
      <BigCalendar view="week" hideHeader headerSlot={<div data-testid="slot">toolbar</div>} />
    )

    expect(screen.queryByTestId('slot')).toBeNull()
    expect(container.querySelector('.bc-header')).toBeNull()
  })
})

describe('hourHeight in the day view', () => {
  it('scales the block height and the hour rows', () => {
    const { container } = render(<BigCalendar view="day" hourHeight={120} />)

    const block = container.querySelector('[data-event-id="1"]') as HTMLElement
    // (60 / 60) * 120 - 8
    expect(block.style.height).toBe('112px')
    expect(container.innerHTML).toContain('height: 120px')
  })
})

describe('custom colors across every leaf', () => {
  beforeEach(() => {
    seed([makeEvent({ color: 'rebeccapurple' })])
  })

  it('month badge gets the class and the variable', () => {
    const { container } = render(<BigCalendar view="month" />)
    const badge = container.querySelector('[data-event-id="1"]:not([data-event-bullet])') as HTMLElement

    expect(badge.className).toContain('bc-event-custom-color')
    expect(badge.style.getPropertyValue('--bc-event-color')).toBe('rebeccapurple')
  })

  it('agenda card gets the class and the variable', () => {
    const { container } = render(<BigCalendar view="agenda" />)
    const card = container.querySelector('[data-event-id="1"]') as HTMLElement

    expect(card.className).toContain('bc-event-custom-color')
    expect(card.style.getPropertyValue('--bc-event-color')).toBe('rebeccapurple')
  })

  it('the month EventBullet gets the class and the variable', () => {
    const { container } = render(<BigCalendar view="month" />)
    const bullet = container.querySelector('.bc-event-bullet') as HTMLElement

    expect(bullet.className).toContain('bc-event-custom-color')
    expect(bullet.style.getPropertyValue('--bc-event-color')).toBe('rebeccapurple')
  })

  it('a legacy color leaves the bullet on its Tailwind class', () => {
    seed([makeEvent({ color: 'green' })])
    const { container } = render(<BigCalendar view="month" />)
    const bullet = container.querySelector('.bc-event-bullet') as HTMLElement

    expect(bullet.className).toContain('bg-green-600')
    expect(bullet.className).not.toContain('bc-event-custom-color')
  })
})
