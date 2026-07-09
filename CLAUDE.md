# Big Calendar React

React port of [big-calendar-vue3](https://github.com/sitefinitysteve/big-calendar-vue3), itself a port of [lramos33/big-calendar](https://github.com/lramos33/big-calendar) (React/Next.js). A clone-and-customize calendar component with 5 views, event CRUD, user filtering, and dark mode.

## Source Project

- **Original**: https://github.com/lramos33/big-calendar by Leonardo Ramos (MIT License)
- **Vue port**: https://github.com/sitefinitysteve/big-calendar-vue3 (feature parity source for this port)
- **Vue source**: Available at `/Users/steve/Apps/vue-plugins/big-calendar-vue3/` for reference during porting
- **Feature parity**: Targets parity with the Vue port. May diverge to add features or leverage React-specific patterns.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Type-check (tsc --noEmit) then build the demo
npm run build:lib    # Type-check then build the library (vite.config.lib.ts)
npm run typecheck    # Type-check only (tsc --noEmit)
npm run preview      # Preview production build
```

## Tech Stack

- **React 19** with function components and hooks (no class components). Peer dep is `^19.0.0` — React 18 is not supported.
- **Zustand** for state management (`create()` store, `useCalendarStore`)
- **shadcn/ui** (new-york style, Base UI primitives via `@base-ui/react`, zinc base color)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no tailwind.config — use `@theme` in globals.css)
- **date-fns v4** for date manipulation
- **react-hook-form + @hookform/resolvers/zod** for form validation
- **lucide-react** for icons
- **TypeScript** with strict mode

## Project Structure

```
src/
├── calendar/                    # Core calendar domain
│   ├── components/              # Calendar-specific React components (.tsx)
│   │   ├── CalendarContainer.tsx    # BigCalendar — the top-level component
│   │   ├── CalendarContextMenu.tsx  # Base UI context-menu wrapper
│   │   ├── header/              # CalendarHeader, DateNavigator, TodayButton, UserSelect
│   │   ├── month-view/          # CalendarMonthView, DayCell, MonthEventBadge, EventBullet
│   │   ├── week-view/           # CalendarWeekView, EventBlock, CalendarTimeline, WeekViewMultiDayEventsRow
│   │   ├── day-view/            # CalendarDayView, DayViewMultiDayEventsRow
│   │   ├── year-view/           # CalendarYearView, YearViewMonth, YearViewDayCell
│   │   ├── agenda-view/         # CalendarAgendaView, AgendaDayGroup, AgendaEventCard
│   │   ├── dialogs/             # EventDetailsDialog, EditEventDialog, AddEventDialog
│   │   └── settings/            # Badge/VisibleHours/WorkingHours/CalendarOptions inputs
│   ├── hooks/                   # React hooks for calendar logic
│   ├── types.ts                 # Type aliases (TCalendarView, TEventColor, etc.)
│   ├── interfaces.ts            # Interfaces (IEvent, IUser, ICalendarCell, ICalendarCommand)
│   ├── helpers.ts               # Pure utility functions (no React dependency)
│   ├── labels.ts                # ICalendarLabels, DEFAULT_LABELS, contexts + hooks
│   ├── schemas.ts               # Zod validation schemas (createEventSchema factory)
│   └── mocks.ts                 # Mock data for demo
├── demo/                        # Demo-only shell (NOT exported from the library)
│   ├── useLocale.ts             # Demo locale store (EN/FR/ES) + label sets
│   ├── AppHeader.tsx, ToggleTheme.tsx, ToggleLanguage.tsx
├── components/ui/               # shadcn/ui components (generated, do not hand-edit)
├── stores/calendar.ts           # Zustand store (useCalendarStore)
├── lib/utils.ts                 # cn() utility
├── assets/styles/globals.css    # Tailwind v4 theme, CSS variables, custom utilities
├── calendar-lib.css             # Library CSS entry (Tailwind + CSS-var defaults)
├── index.ts                     # Library entry point (public exports)
└── main.tsx                     # Demo app entry (mounts App, seeds store with mocks)
```

## Code Conventions

### React Components
- Function components only — never class components
- Props: a TypeScript `interface` destructured in the signature; defaults via destructuring defaults (`canAdd = true`)
- Use `useState` for local state, `useMemo` for derived state, `useEffect` for side effects, `useRef` for mutable refs
- Import shadcn/ui components from their barrel exports: `import { Button } from '@/components/ui/button'`
- Default-export view/dialog/container components; named-export hooks, helpers, types

### React 19 idioms
- **No `forwardRef`** — accept `ref` as a normal prop. For DOM/primitive wrappers type props with `React.ComponentProps<'input'>` / `React.ComponentProps<typeof Primitive>` (both include `ref` in React 19) and forward it; keep `.displayName` for stable dev-tools names.
- **Memoized leaves** — hot components rendered many times per view (`DayCell`, `MonthEventBadge`, `EventBullet`, `EventBlock`, `YearViewDayCell`, `YearViewMonth`, `AgendaEventCard`, `AgendaDayGroup`) are wrapped in `React.memo`. Keep their props memo-friendly: any callback handed down from `CalendarContainer` (and the demo `App`) must be `useCallback`-stable, or the memo is defeated by a fresh closure each render. The context provider values in `CalendarContainer` (`mergedLabels`, `flags`) are `useMemo`'d so label/flag consumers don't re-render on every container render.
- **Selector-based store access** — always call `useCalendarStore(s => s.x)` selecting only the slice(s) a component uses; never destructure the whole store. Use `useShallow` when selecting multiple fields as one object.

### Naming
- Components: PascalCase filenames (`CalendarHeader.tsx`)
- Hooks: `use` prefix, camelCase (`useCalendarGrid.ts`)
- Types: `T` prefix (`TCalendarView`), Interfaces: `I` prefix (`IEvent`)
- Store: `useCalendarStore` (singular)

### Imports
- Path alias: `@/` maps to `src/`
- Import types with `import type` when possible
- Calendar domain imports: `@/calendar/types`, `@/calendar/interfaces`, `@/calendar/helpers`
- Store: `@/stores/calendar`
- UI components: `@/components/ui/<component>`

### Styling
- Tailwind utility classes only — no CSS modules unless absolutely necessary
- Use `cn()` from `@/lib/utils` for conditional class merging
- Use `cva` (class-variance-authority) for component variants
- Custom spacing/sizes defined in globals.css `@theme` block (e.g., `size-6.5`, `w-18`, `text-xxs`)
- Dark mode: class-based via `.dark` on `<html>`
- Custom utility `bg-calendar-disabled-hour` for working-hours pattern
- Key UI elements have `bc-*` CSS class hooks (`.bc-header`, `.bc-event-badge`, `.bc-event-block`, `.bc-event-card`, `.bc-event-bullet`, `.bc-view-buttons`)

### State Management
- Zustand store (`create()` syntax), single store `useCalendarStore`
- Store holds: selectedDate, selectedUserId, badgeVariant, users, events, workingHours, visibleHours, availableViews, showUserSelect, canAdd/canEdit/canDelete
- Store actions: `initialize()`, `addEvent()`, `updateEvent()`, `deleteEvent()`, `setSelectedDate()`, and explicit setters
- Select narrow slices in components: `useCalendarStore((s) => s.events)`
- Hooks derive filtered/computed data from the store — views don't re-implement complex logic
- `BigCalendar` (CalendarContainer) accepts callback props `onEventCreated`, `onEventUpdated`, `onEventDeleted` for backend hooks
- `onDayClick` (payload: `yyyy-MM-dd` string via date-fns `format`, UTC-safe) fires on day clicks in month/year views; `onEventClick` (payload: `IEvent`) fires on event chip clicks in any view
- `onDayContextMenu` / `onEventContextMenu` fire on right-click (payload: `{ date | event, x, y, originalEvent }`), handled via a single delegated capture-phase `onContextMenuCapture` on the calendar root that reads `data-date` (day cells) / `data-event-id` (event chips); the native browser menu is suppressed only when the matching callback prop (or a command menu) is provided
- `BigCalendar` accepts `availableViews`, `showUserSelect`, `labels` (`Partial<ICalendarLabels>`), `showViewTooltips`, `navigateOnDayClick` (default `true`), `openDetailsOnEventClick` (default `true`), and right-click command props (`eventCommands`, `dayCommands`, `showEditCommand`, `showDeleteCommand`, `onCommand`)

### View Control (no router)
- `BigCalendar` is fully controlled: pass `view` + `onViewChange` (React analog of the Vue port's `v-model:view`)
- `CalendarHeader` calls `onViewChange` instead of routing — router-agnostic
- The demo app switches views via local `useState` in `main.tsx` — no router needed. Host apps (e.g. Inertia) own their own routing.

### Multilingual Labels
- All user-facing text uses the label system — no hardcoded strings in calendar components
- `ICalendarLabels` (flat structure, ~90 keys); `DEFAULT_LABELS` provides English defaults
- `BigCalendar` accepts a `labels` prop (`Partial<ICalendarLabels>`) — merged as `{ ...DEFAULT_LABELS, ...labels }` — override only what you need
- `BigCalendar` accepts `dateLocale` (date-fns `Locale`) — localizes month/day names in `format()` calls
- Provided via React contexts in `labels.ts`: `CalendarLabelsContext`, `CalendarFlagsContext` (`{ showViewTooltips }`), `CalendarDateLocaleContext`
- Child components read them via `useCalendarLabels()` / `useCalendarFlags()` / `useDateLocale()` — these return **plain values** (not refs), so use them directly
- Function-valued labels for interpolation: `eventsCount`, `moreEvents`, `dayOfTotal`
- Validation messages also use labels via `createEventSchema(labels)` factory
- When adding new user-facing strings, always add a key to `ICalendarLabels` + `DEFAULT_LABELS` first

### All-Day Events
- All-day events must NEVER show time in any UI element
- Check `event.isAllDay` before rendering time strings
- Show `labels.allDay` text instead of time range for all-day events

### View Button CSS Hooks
- Each view button has `data-view="day|week|month|year|agenda"` and a `bc-view-day` / `bc-view-week` / … class
- Parent container has `bc-view-buttons`

## Dialogs & Forms
- Add/Edit dialogs use **react-hook-form** with `zodResolver(createEventSchema(labels))`
- `Form`/`FormField`/`FormItem`/`FormControl`/`FormLabel`/`FormMessage` are the shadcn/ui form primitives (`@/components/ui/form`), built on react-hook-form's `Controller`
- All-day toggle preserves start/end times in refs so they restore when toggled back off
- The details dialog switches its date display by `isAllDay` (all-day: date + `labels.allDay`, never a time)

## Library Build
- Entry point: `src/index.ts` — exports `BigCalendar`, views, dialogs, store, hooks, types, helpers, labels, schemas, mocks
- CSS entry: `src/calendar-lib.css` — Tailwind + CSS-variable defaults in `@layer big-calendar-base`
- Vite lib config: `vite.config.lib.ts` — ESM output, externalizes peer deps, bundles shadcn/ui components, emits `dist/index.d.ts` via vite-plugin-dts
- Build command: `npm run build:lib` → `dist/big-calendar-react.js`, `dist/style.css`, `dist/index.d.ts`
- `react-hook-form`, `@hookform/resolvers`, and `zod` are **optional** peer deps (only needed for the built-in dialogs)

## Vue → React Conversion Patterns

When porting from the Vue source at `/Users/steve/Apps/vue-plugins/big-calendar-vue3/`:
- `ref()` → `useState()`; `computed()` → `useMemo()`
- `watch()` / `watchEffect()` / `onMounted()` → `useEffect()`
- Pinia store → Zustand store; `store.x` → `useCalendarStore((s) => s.x)`
- `provide/inject` → React context (`createContext` + `useContext`)
- `defineProps` → props interface; `defineEmits` → callback props (`onX`)
- `v-model:view` → controlled `view` + `onViewChange`
- `v-if` → `{cond && <.../>}`; `v-for` → `.map()`
- `@click` → `onClick`; `:class` → `className` + `cn()`
- Template slots (`<slot />`) → `children` prop
- Vue's `@contextmenu.capture` → React `onContextMenuCapture`; `instance.vnode.props?.[name]` listener check → simply test whether the callback prop is defined
