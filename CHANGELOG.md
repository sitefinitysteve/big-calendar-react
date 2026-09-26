# Changelog

## 1.3.2

Clock labels now follow the locale's own clock, and hosts can format them. One additive prop, no
removals.

### Fixed

- **The hour axis no longer pads a 12-hour clock.** The week and day time axis rendered `08 AM`;
  it now renders `8 AM`. A 24-hour locale keeps its own CLDR shape (`08` for en-GB, `14 h` for
  fr-CA, `14時` for ja).
- **Event times, the current-time marker and the details dialog use `Intl.DateTimeFormat`.** They
  used to take the date-fns `formatLong` time pattern, which does not always match the CLDR clock
  (fr-CA printed `14:30` where the locale writes `14 h 30`). Times are now formatted with the
  `dateLocale`'s `code` and its hour cycle, so they agree with the 12/24-hour time inputs in the
  Add/Edit dialogs. A 12-hour clock never shows a leading zero (`8:05 AM`).

### Added

- **`formatTime?: (date: Date, kind: 'axis' | 'now' | 'event') => string`** on `BigCalendar`
  (and on `ICalendarCustomization`). When given, every clock label goes through it: `'axis'` is
  the hour-only label on the week/day time axis, `'now'` the current-time marker, and `'event'`
  the event start and end times in every view plus the details dialog. Use it to apply house
  rules the locale data does not carry. The types `TTimeFormatter` and `TTimeFormatKind` and the
  `useTimeFormatter()` hook (for custom renderers) are exported.

### Upgrading

No action is needed for the new prop. Expect these visible changes with no code change on your
side:

- 12-hour axis labels lose the leading zero (`08 AM` becomes `8 AM`).
- Clock text follows `Intl` CLDR data for your `dateLocale` (`14:30` becomes `14 h 30` for fr-CA).
  A hand-rolled `Locale` without a valid `code` keeps the previous pattern-based output.
- Some ICU builds print a narrow no-break space (U+202F) before AM/PM. Snapshot or text
  assertions that match a plain space may need `\s` or a normalising helper.

If you need the previous output, or a house style, pass `formatTime`.

## 1.3.1

Four display and interaction fixes. No prop removals and no breaking changes.

### Fixed

- **The week view header now stays pinned while you scroll.** The calendar root used
  `overflow-hidden`, which makes it a scroll container, so the header's `sticky top-0` stuck to
  the root instead of the page; a plain wrapper around the header was also acting as its
  containing block. The root now uses `overflow-clip` (same rounded clipping, not a scroll
  container) and the wrapper is `display: contents`.
- **Clicking the already-selected event now clears the selection.** `onSelectedEventChange`
  receives `null` when the selected event is clicked again, so a controlled `selectedEventId`
  can toggle off.
- **A selected custom-rendered event block now sits above its neighbours.** The `z-10` applied
  to a selected block had no effect on a static box; the block is now `relative`.
- **Custom event renderers in the week and day all-day strips receive the right `view`.** The
  badge those strips reuse always reported `view: 'month'`; it now reports `'week'` or `'day'`.

### Upgrading

No action is needed. If your app worked around the week header by passing
`classNames={{ root: '… overflow-clip' }}` (or an `overflow-clip` wrapper), you can drop that
override: the root now clips without becoming a scroll container. Hosts that toggle a selected
event with `selectedEventId` should expect `onSelectedEventChange(null)` on a second click.

## 1.3.0

Two packaging correctness fixes. No component, prop, or markup changes: if your app already
installed the form peers and is on zod 3, this release is a no-op for you.

### Fixed

- **`react-hook-form`, `@hookform/resolvers` and `zod` are no longer marked optional.**
  They were declared in `peerDependenciesMeta` as `optional: true`, but `BigCalendar` imports
  `AddEventDialog` / `EditEventDialog` at the top of `CalendarContainer`, which pull in
  `react-hook-form` and `zod` through the form and schema modules. Those imports are static,
  so a bundler resolves them whether or not the dialogs render: setting `canAdd` / `canEdit`
  to `false` skips the render, not the import. Consumers who took the peers at their word and
  omitted them hit a hard build failure (`MISSING_EXPORT` against Vite's optional-peer stub)
  rather than a graceful degrade. All three are now plain required peers.
- **Validation messages are no longer dropped on zod 4.** `createEventSchema` passed
  `required_error`, which zod 4 silently ignores, so every custom or localized message
  (`validationStartDateRequired` and friends) was replaced by zod's built-in English text such
  as "Invalid input: expected date, received undefined". The schema now uses `message`, which
  zod 3 and zod 4 both honour, so the declared `zod: ^3.0.0 || ^4.0.0` peer range is finally
  accurate. `ICalendarLabels` is unchanged.

### Upgrading

If you already install `react-hook-form`, `@hookform/resolvers` and `zod`, no action is needed.
If you did not, your package manager now resolves them as required peers; npm 7+ installs them
automatically. On zod 4 you will start seeing your own validation copy where zod's default
English appeared before.

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
