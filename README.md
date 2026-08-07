# Big Calendar React

A fully-featured, clone-and-customize calendar component for **React** — 5 views (day / week / month / year / agenda), event CRUD, user filtering, dark mode, right-click command menus, and full i18n. Built with [shadcn/ui](https://ui.shadcn.com), Tailwind CSS v4, [date-fns](https://date-fns.org), and [Zustand](https://zustand-demo.pmnd.rs).

React port of [big-calendar-vue3](https://github.com/sitefinitysteve/big-calendar-vue3) — using Vue? Grab [`big-calendar-vue3` on npm](https://www.npmjs.com/package/big-calendar-vue3) instead — itself a port of [lramos33/big-calendar](https://github.com/lramos33/big-calendar) (React/Next.js) by Leonardo Ramos.

## Install

```bash
npm install big-calendar-react
```

**Requires React 19** (`react` / `react-dom` `^19.0.0`). The library uses React 19 idioms — `ref` as a regular prop (no `forwardRef`) — so React 18 is not supported.

Install the peer dependencies your app doesn't already have:

```bash
npm install react@^19 react-dom@^19 date-fns zustand \
  @base-ui/react \
  react-day-picker class-variance-authority clsx tailwind-merge lucide-react

# Only needed if you use the built-in Add/Edit dialogs:
npm install react-hook-form @hookform/resolvers zod
```

## Quick start

```tsx
import { useState } from 'react'
import { BigCalendar, useCalendarStore, USERS_MOCK, CALENDAR_ITEMS_MOCK } from 'big-calendar-react'
import type { TCalendarView } from 'big-calendar-react'
import 'big-calendar-react/style.css'

export default function CalendarPage() {
  const [view, setView] = useState<TCalendarView>('month')

  // Seed the store once (in a real app, initialize with your own data).
  useCalendarStore.getState().initialize(USERS_MOCK, CALENDAR_ITEMS_MOCK)

  return <BigCalendar view={view} onViewChange={setView} />
}
```

`view` is **controlled** — you own the state and pass `onViewChange` (the React analog of the Vue port's `v-model:view`).

## Store

The calendar reads its data from a Zustand store, `useCalendarStore`. Seed it with your users and events:

```ts
import { useCalendarStore } from 'big-calendar-react'

useCalendarStore.getState().initialize(users, events)

// Or the fine-grained setters:
const setSelectedDate = useCalendarStore((s) => s.setSelectedDate)
```

`IEvent`/`IUser` shapes:

```ts
interface IUser { id: string; name: string; picturePath: string | null }

interface IEvent {
  id: number
  startDate: string   // ISO 8601
  endDate: string     // ISO 8601
  title: string
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray'
  description: string
  user: IUser
  isAllDay?: boolean
}
```

## Inertia v3 (React) usage

`BigCalendar` emits typed callbacks whenever an event is created, updated, or deleted. Wire them to your backend with the Inertia router (or axios):

```tsx
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { BigCalendar, useCalendarStore } from 'big-calendar-react'
import type { IEvent, TCalendarView } from 'big-calendar-react'
import 'big-calendar-react/style.css'

interface Props { users: IUser[]; events: IEvent[] }

export default function Calendar({ users, events }: Props) {
  const [view, setView] = useState<TCalendarView>('month')

  // Hydrate the store from Inertia page props.
  useCalendarStore.getState().initialize(users, events)

  return (
    <BigCalendar
      view={view}
      onViewChange={setView}
      onEventCreated={(event) =>
        router.post('/events', event, { preserveScroll: true })
      }
      onEventUpdated={(event) =>
        router.put(`/events/${event.id}`, event, { preserveScroll: true })
      }
      onEventDeleted={(event) =>
        router.delete(`/events/${event.id}`, { preserveScroll: true })
      }
    />
  )
}
```

The built-in Add/Edit dialogs update the local Zustand store immediately (optimistic), then fire the callback so you can persist. If you'd rather drive everything yourself, see the **events-only** recipe below.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `view` | `TCalendarView` | — | **Required, controlled.** Active view (`day`/`week`/`month`/`year`/`agenda`). |
| `onViewChange` | `(view) => void` | — | Fired when the user switches view or a day-click navigates. |
| `canAdd` | `boolean` | `true` | Show Add-event affordances and render the Add dialog. |
| `canEdit` | `boolean` | `true` | Show the Edit button and render the Edit dialog. |
| `canDelete` | `boolean` | `true` | Show the Delete button in the details dialog. |
| `availableViews` | `TCalendarView[]` | all 5 | Restrict which view buttons appear. |
| `showUserSelect` | `boolean` | `true` | Toggle the user filter dropdown. |
| `labels` | `Partial<ICalendarLabels>` | `{}` | Override any user-facing string (see i18n). |
| `showViewTooltips` | `boolean` | `true` | Toggle view-button tooltips. |
| `dateLocale` | `date-fns` `Locale` | `en-US` patterns | Localizes every rendered date and time — month/day names **and** field order and clock convention. See [Date & time formatting](#date--time-formatting). |
| `navigateOnDayClick` | `boolean` | `true` | If `false`, a day click only fires `onDayClick` instead of switching to day view. |
| `openDetailsOnEventClick` | `boolean` | `true` | If `false`, an event click only fires `onEventClick` without opening the details dialog. |
| `eventCommands` | `ICalendarCommand[]` | `[]` | Custom right-click menu items for event chips. |
| `dayCommands` | `ICalendarCommand[]` | `[]` | Custom right-click menu items for day cells. |
| `showEditCommand` | `boolean \| TCalendarView[]` | `false` | Add a stock "Edit" command to the event menu (scope with an array of views). |
| `showDeleteCommand` | `boolean \| TCalendarView[]` | `false` | Add a stock "Delete" command to the event menu. |

## Callbacks

| Callback | Payload | Fires when |
| --- | --- | --- |
| `onEventCreated` | `IEvent` | The Add dialog creates an event. |
| `onEventUpdated` | `IEvent` | The Edit dialog saves an event. |
| `onEventDeleted` | `IEvent` | The details dialog deletes an event. |
| `onDayClick` | `string` (`yyyy-MM-dd`) | A day cell is clicked in month/year views. UTC-safe (built with date-fns `format`). |
| `onEventClick` | `IEvent` | An event chip is clicked in any view. |
| `onDayContextMenu` | `{ date, x, y, originalEvent }` | A day cell is right-clicked (and no day command menu is configured). |
| `onEventContextMenu` | `{ event, x, y, originalEvent }` | An event chip is right-clicked (and no event command menu is configured). |
| `onCommand` | `ICalendarCommandSelect` | A right-click menu command is selected. The library performs no action — you handle it. |

The native browser context menu is suppressed **only** when the matching callback (or a command menu) is provided; otherwise a plain right-click behaves normally.

## Labels & i18n

All user-facing text flows through `ICalendarLabels` (~90 flat keys). Pass a partial `labels` object to override only what you need — everything else falls back to English `DEFAULT_LABELS`:

```tsx
import { BigCalendar } from 'big-calendar-react'
import { fr } from 'date-fns/locale/fr'

<BigCalendar
  view={view}
  onViewChange={setView}
  dateLocale={fr}
  labels={{
    addEvent: 'Ajouter un événement',
    viewMonth: 'Mois',
    allDay: 'Toute la journée',
    // ...
  }}
/>
```

- `labels` localizes the calendar's own strings.
- `dateLocale` (a date-fns `Locale`) localizes every rendered date and time — see the next section.
- A few labels are functions for interpolation: `eventsCount(n)`, `moreEvents(n)`, `dayOfTotal(day, total)`.
- Validation messages in the Add/Edit forms are also driven by labels via `createEventSchema(labels)`.

## Date & time formatting

`dateLocale` is the single option that controls how dates and times are rendered. It is optional —
omit it and the calendar renders US English.

```tsx
import { BigCalendar } from 'big-calendar-react'
import { frCA } from 'date-fns/locale/fr-CA'

<BigCalendar view={view} onViewChange={setView} dateLocale={frCA} />
```

The calendar takes the **format patterns themselves** from the locale (date-fns' `formatLong`, which
is CLDR data), so passing a locale changes field order and clock convention, not just the words:

| Surface | no locale | `enUS` | `frCA` | `ja` |
| --- | --- | --- | --- | --- |
| Header range, details dialog, day-view "today" chip | `Dec 1, 2026` | `Dec 1, 2026` | `1 déc. 2026` | `2026/12/01` |
| Agenda day heading | `Tuesday, December 1, 2026` | `Tuesday, December 1st, 2026` | `mardi 1 décembre 2026` | `2026年12月1日火曜日` |
| Event times (week/month/agenda/day) | `2:30 PM` | `2:30 PM` | `14:30` | `14:30` |
| Day & week hour axis | `02 PM` | `02 PM` | `14` | `14` |
| Date + time rows in the details dialog | `Dec 1, 2026 2:30 PM` | `Dec 1, 2026, 2:30 PM` | `1 déc. 2026, 14:30` | `2026/12/01 14:30` |

The hour axis follows the locale's own clock: a 24-hour locale labels it `14`, a 12-hour locale
`02 PM`, so the axis always agrees with the event times printed beside it.

The Add/Edit dialogs follow the same locale — the date field's trigger label and popover are
localized, and the time fields drop the AM/PM control for a 24-hour locale.

**Known limitation:** the week grid always starts on Sunday. `dateLocale` does not yet move it, so
locales that start the week on Monday (`de`, `en-GB`) or Saturday (`ar`) still get a Sunday-first
grid. This is deliberate for now — the month view's weekday header is a fixed `Sun`–`Sat` label
list, and moving one view without the other would leave the calendar disagreeing with itself.

Omitting `dateLocale` is not the same as passing `enUS`. With no locale the calendar uses its
built-in US-English patterns, which is why the two English columns above differ on the agenda
heading (no ordinal) and the date+time row (no comma). Pass `enUS` explicitly to get true CLDR
US-English output.

> **Passing a locale is required for correct non-English output.** Without one you get English
> field order regardless of the `labels` you supply — `labels` translates the calendar's own strings
> (buttons, headings), while `dateLocale` governs everything date-fns renders.

## Events-only integration

To drive every dialog/route yourself (no built-in Add or details dialogs), turn off the navigation/detail behaviors and handle the raw clicks:

```tsx
<BigCalendar
  view={view}
  onViewChange={setView}
  navigateOnDayClick={false}       // day click only fires onDayClick
  openDetailsOnEventClick={false}  // event click only fires onEventClick
  onDayClick={(date) => openMyCreateModal(date)}
  onEventClick={(event) => router.visit(`/events/${event.id}`)}
/>
```

Combine with `eventCommands` / `dayCommands` + `onCommand` for a fully custom right-click experience.

## Customization (v1.2.0)

All of these props are optional. Omit them and the calendar renders exactly as it did in 1.1.0.

### Custom event chips

```tsx
<BigCalendar
  view={view}
  renderEvent={(event, { view, selected, defaultContent }) => (
    selected ? <MyExpandedCard event={event} /> : defaultContent
  )}
  renderMonthEvent={(event) => <MyCompactBadge event={event} />}
  renderAgendaEvent={(event) => <MyAgendaRow event={event} />}
/>
```

`renderMonthEvent` / `renderAgendaEvent` fall back to `renderEvent` when not given.
The renderer context is `{ view, selected, badgeVariant, defaultContent }`.

### Selection

Selection is controlled: the library stores nothing.

```tsx
const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

<BigCalendar
  view={view}
  openDetailsOnEventClick={false}
  selectedEventId={selectedEventId}
  onSelectedEventChange={(event) => setSelectedEventId(event?.id ?? null)}
/>
```

The matching chip gets `data-selected` (and only that one), so you can style it with
`[&[data-selected]]:outline-2` or a plain CSS rule. A selected chip that has a custom
renderer switches from a fixed `height` to `minHeight` and gains `z-10`, so it may grow
past its slot.

### Your own toolbar

```tsx
<BigCalendar view={view} hideHeader />
<BigCalendar view={view} headerSlot={<MyToolbar />} />
```

### Sizing and density

| Prop | Default | Effect |
| --- | --- | --- |
| `hourHeight` | `96` | Pixel height of one hour row in week/day views |
| `height` | stock (736px week / 800px day) | Week/day scroll-area height |
| `autoHeight` | `false` | Grid sizes to content instead of scrolling |
| `maxEventsPerDayCell` | `3` | Month-view badge slots per day |
| `onShowMore` | none | Turns "+N more" into a button firing `(yyyy-MM-dd)` |
| `allDayMaxRows` | none (uncapped) | Week all-day strip: max badge rows before the strip scrolls internally |

The week view's all-day strip sits directly under the day-name header row (which is sticky) and
carries a gutter label taken from the `allDay` label key (`"All day"` by default), so a translated
calendar labels it too.

### Class hooks

```tsx
<BigCalendar
  view={view}
  classNames={{ root, header, dayCell, hourRow, eventBlock, timeline }}
  dayCellClassName={(date) => (isWeekend(date) ? 'bg-muted/40' : undefined)}
/>
```

### Open color system

`event.color` accepts the seven built-in names (`blue`, `green`, `red`, `yellow`, `purple`,
`orange`, `gray`) or **any CSS color string**. Built-ins keep their Tailwind class maps.
Anything else renders with the class `bc-event-custom-color` plus an inline
`--bc-event-color` variable, and the color is derived with `color-mix()`.

If you do **not** import `big-calendar-react/style.css`, copy these rules into your own
stylesheet or custom colors will render unstyled:

```css
.bc-event-custom-color {
  border-color: color-mix(in srgb, var(--bc-event-color, currentColor) 35%, transparent);
  background-color: color-mix(in srgb, var(--bc-event-color, currentColor) 12%, transparent);
  color: color-mix(in srgb, var(--bc-event-color, currentColor) 85%, black);
}
.dark .bc-event-custom-color {
  border-color: color-mix(in srgb, var(--bc-event-color, currentColor) 45%, transparent);
  background-color: color-mix(in srgb, var(--bc-event-color, currentColor) 22%, transparent);
  color: color-mix(in srgb, var(--bc-event-color, currentColor) 75%, white);
}
.bc-event-custom-color .event-dot { fill: var(--bc-event-color, currentColor); }
.bc-event-bullet.bc-event-custom-color {
  background-color: var(--bc-event-color, currentColor);
  border-color: transparent;
}
@media (min-width: 1024px) {
  .bc-day-cell-list { height: var(--bc-day-cell-list-height); flex-direction: column; }
}
```

(The last rule only matters when you set `maxEventsPerDayCell` to something other than 3.)

### Typed event metadata

```ts
type TripMeta = { sourceType: 'trip' | 'client'; sourceId: number }
const events: IEvent<TripMeta>[] = ...
```

`meta` is optional and carried through untouched by the library.

## CSS

Import the stylesheet once, anywhere in your app:

```ts
import 'big-calendar-react/style.css'
```

Dark mode is class-based: add/remove `dark` on `<html>`. Key UI elements expose `bc-*` class hooks (`.bc-header`, `.bc-event-badge`, `.bc-event-block`, `.bc-event-card`, `.bc-event-bullet`, `.bc-view-buttons`) and `data-view` / `data-date` / `data-event-id` attributes for external targeting.

## Exports

`BigCalendar`, the five view components, the dialogs, `useCalendarStore`, all hooks (`useCalendarGrid`, `useFilteredEvents`, `useEventPositioning`, `useVisibleHours`, `useCurrentTime`, `useDisclosure`, `useUpdateEvent`), pure helpers, types/interfaces, `DEFAULT_LABELS` + label hooks/contexts, `createEventSchema`, and the demo mocks (`USERS_MOCK`, `CALENDAR_ITEMS_MOCK`).

## License

MIT.

- Original: [lramos33/big-calendar](https://github.com/lramos33/big-calendar) by Leonardo Ramos (MIT).
- Vue port: [big-calendar-vue3](https://github.com/sitefinitysteve/big-calendar-vue3) ([npm](https://www.npmjs.com/package/big-calendar-vue3)) by Steve McNiven-Scott (MIT).
