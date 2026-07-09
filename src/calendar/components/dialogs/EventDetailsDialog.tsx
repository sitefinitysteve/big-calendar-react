import { format, parseISO, isSameDay } from 'date-fns'
import { Calendar, Clock, Text, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { IEvent } from '@/calendar/interfaces'
import { useCalendarLabels, useDateLocale } from '@/calendar/labels'

interface EventDetailsDialogProps {
  event: IEvent
  open: boolean
  canEdit?: boolean
  canDelete?: boolean
  onOpenChange: (value: boolean) => void
  onEdit: (event: IEvent) => void
  onDelete: (event: IEvent) => void
}

export default function EventDetailsDialog({
  event,
  open,
  canEdit,
  canDelete,
  onOpenChange,
  onEdit,
  onDelete,
}: EventDetailsDialogProps) {
  const labels = useCalendarLabels()
  const dateLocale = useDateLocale()

  const fmtOpts = dateLocale ? { locale: dateLocale } : undefined
  const startDate = parseISO(event.startDate)
  const endDate = parseISO(event.endDate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription className="sr-only">{labels.fieldDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <User className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">{labels.fieldResponsible}</p>
              <p className="text-sm text-muted-foreground">{event.user.name}</p>
            </div>
          </div>

          {event.isAllDay && isSameDay(startDate, endDate) ? (
            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{labels.fieldDate}</p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, 'MMM d, yyyy', fmtOpts)} ({labels.allDay})
                </p>
              </div>
            </div>
          ) : event.isAllDay ? (
            <>
              <div className="flex items-start gap-2">
                <Calendar className="mt-1 size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{labels.fieldStartDate}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, 'MMM d, yyyy', fmtOpts)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-1 size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{labels.fieldEndDate}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(endDate, 'MMM d, yyyy', fmtOpts)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <Calendar className="mt-1 size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{labels.fieldStartDate}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, 'MMM d, yyyy h:mm a', fmtOpts)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-1 size-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{labels.fieldEndDate}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(endDate, 'MMM d, yyyy h:mm a', fmtOpts)}
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex items-start gap-2">
            <Text className="mt-1 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">{labels.fieldDescription}</p>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>
        </div>

        {(canDelete !== false || canEdit !== false) && (
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            {canDelete !== false && (
              <Button type="button" variant="destructive" onClick={() => onDelete(event)}>
                {labels.buttonDelete}
              </Button>
            )}
            {canEdit !== false && (
              <Button type="button" variant="outline" onClick={() => onEdit(event)}>
                {labels.buttonEdit}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
