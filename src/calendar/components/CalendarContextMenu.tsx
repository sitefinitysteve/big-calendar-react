import type { ReactElement } from 'react'
import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu'
import { cn } from '@/lib/utils'
import type { ICalendarCommand } from '@/calendar/interfaces'

// Wraps the calendar in Base UI's ContextMenu (purpose-built for right-click):
// it opens at the cursor and — crucially — repositions natively on each new
// right-click, so there is no dismiss/reopen flicker. The parent decides
// *whether* a menu should appear (and with which commands) via the `commands`
// prop; when it is empty nothing renders, so a plain right-click keeps the
// native browser menu.
interface CalendarContextMenuProps {
  commands: ICalendarCommand[]
  onSelect?: (command: ICalendarCommand) => void
  children: ReactElement
}

export default function CalendarContextMenu({ commands, onSelect, children }: CalendarContextMenuProps) {
  function handleSelect(command: ICalendarCommand) {
    if (command.disabled) return
    onSelect?.(command)
  }

  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger render={children} />
      <ContextMenuPrimitive.Portal>
        {commands.length > 0 && (
          <ContextMenuPrimitive.Positioner className="z-50" collisionPadding={8}>
            <ContextMenuPrimitive.Popup className="bc-context-menu min-w-[9rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95">
              {commands.map((command, index) => {
                const Icon = command.icon
                return (
                  <div key={command.id}>
                    {command.separatorBefore && index > 0 && (
                      <ContextMenuPrimitive.Separator className="-mx-1 my-1 h-px bg-border" />
                    )}
                    <ContextMenuPrimitive.Item
                      disabled={command.disabled}
                      data-command-id={command.id}
                      onClick={() => handleSelect(command)}
                      className={cn(
                        'bc-context-menu-item relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                        command.destructive &&
                          'text-red-600 data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-600 dark:text-red-400 dark:data-[highlighted]:bg-red-500/15 dark:data-[highlighted]:text-red-400'
                      )}
                    >
                      {Icon && <Icon className="size-4 shrink-0" />}
                      <span className="truncate">{command.label}</span>
                    </ContextMenuPrimitive.Item>
                  </div>
                )
              })}
            </ContextMenuPrimitive.Popup>
          </ContextMenuPrimitive.Positioner>
        )}
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  )
}
