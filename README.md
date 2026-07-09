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
| `dateLocale` | `date-fns` `Locale` | — | Localizes month/day names in `format()` calls. |
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
- `dateLocale` (a date-fns `Locale`) localizes month/day names produced by `format()`.
- A few labels are functions for interpolation: `eventsCount(n)`, `moreEvents(n)`, `dayOfTotal(day, total)`.
- Validation messages in the Add/Edit forms are also driven by labels via `createEventSchema(labels)`.

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
