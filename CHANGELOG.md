# Changelog

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
