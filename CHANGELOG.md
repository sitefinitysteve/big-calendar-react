# Changelog

## 1.2.1

Bug fixes plus one additive prop. Existing markup is unchanged except where the previous
output was wrong (agenda heading date, stale timeline, all-day strip order/casing).

### Fixed

- **Agenda day headings** were built with `new Date('yyyy-MM-dd')`, which parses as UTC and
  rendered the previous day in every timezone west of Greenwich. Now uses `parseISO`. This also
  fixes agenda groups appearing to spill into the neighbouring month.
- **Current-time line** no longer renders on a week that does not contain today, or on a day
  view showing anything other than today.
- **Month view below `lg`** rendered event bullets with no click handler, leaving events
  unreachable on small screens. Bullets now carry the same `role="button"` / `data-event-id`
  wiring as badges and fire the details handler on click or Enter/Space. They additionally
  carry `data-event-bullet` so `[data-event-id]` queries can exclude them.
- **Agenda day headings** use `first-letter:uppercase` instead of `capitalize`, which was
  uppercasing every word of a long date.
- **Week all-day strip** now renders BELOW the day-name header row (previously above it), and
  the header row is sticky.

### Added

- **`allDayMaxRows`** — caps the week all-day strip at N badge rows; beyond that the strip
  scrolls internally instead of pushing the grid down. Unset keeps the uncapped behaviour.
- The all-day strip gains a leading gutter label driven by the existing `allDay` label key.

## 1.2.0

Additive customization API. Every new prop is optional; with none of them set the
rendered markup and classes are unchanged from 1.1.0.

### Added

- **Event renderers** — `renderEvent`, `renderMonthEvent`, `renderAgendaEvent`.
  Each receives `(event, { view, selected, badgeVariant, defaultContent })`, so you
  can wrap or fully replace a chip and still fall back to the stock markup.
- **Header control** — `hideHeader` and `headerSlot` for bringing your own toolbar.
- **Controlled selection** — `selectedEventId` + `onSelectedEventChange`. The library
  holds no selection state; selected chips get a `data-selected` attribute. A selected
  chip rendered by a custom renderer switches from `height` to `minHeight` (plus `z-10`)
  so it can expand in place.
- **Sizing** — `hourHeight` (default 96), `height`, `autoHeight` for the week/day grids.
- **Month density** — `maxEventsPerDayCell` (default 3) and `onShowMore(date)`, which
  turns the "+N more" label into a real button.
- **Styling hooks** — `classNames` (`root`, `header`, `dayCell`, `hourRow`, `eventBlock`,
  `timeline`) and `dayCellClassName(date)`.
- **Open color system** — `TEventColor` is now `TLegacyEventColor | (string & {})`. The
  seven built-in names keep their Tailwind class maps; any other CSS color renders with
  the `.bc-event-custom-color` class and an inline `--bc-event-color` variable.
- **`IEvent<TMeta>`** gains an optional `meta` payload, carried through untouched.
- New exports: `CalendarCustomizationContext`, `useCalendarCustomization`, `isLegacyColor`,
  `LEGACY_EVENT_COLORS`, `DEFAULT_CUSTOMIZATION`, and the types `TEventRenderer`,
  `TEventRenderView`, `IEventRenderContext`, `ICalendarClassNames`, `ICalendarCustomization`,
  `TLegacyEventColor`.
- Test suite (vitest + @testing-library/react + jsdom): `npm run test`.

### Changed

- `calculateMonthEventPositions` and `useEventPositioning` take an optional trailing
  `maxVisible` argument (default 3), so existing calls are unaffected.

## 1.1.0

Initial published feature set.
