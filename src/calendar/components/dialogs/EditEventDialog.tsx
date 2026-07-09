import { useEffect, useMemo, useRef } from 'react'
import { parseISO } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCalendarStore } from '@/stores/calendar'
import { useUpdateEvent } from '@/calendar/hooks/useUpdateEvent'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { TimeInput } from '@/components/ui/time-input'
import { SingleDayPicker } from '@/components/ui/single-day-picker'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createEventSchema } from '@/calendar/schemas'
import type { TEventFormData } from '@/calendar/schemas'
import { useCalendarLabels } from '@/calendar/labels'
import type { IEvent } from '@/calendar/interfaces'

interface EditEventDialogProps {
  event: IEvent
  open: boolean
  onOpenChange: (value: boolean) => void
  onEventUpdated: (event: IEvent) => void
}

function buildFormValues(event: IEvent): TEventFormData {
  const sp = parseISO(event.startDate)
  const ep = parseISO(event.endDate)
  const allDay = event.isAllDay ?? false
  return {
    user: event.user.id,
    title: event.title,
    description: event.description,
    isAllDay: allDay,
    startDate: sp,
    startTime: allDay ? undefined : { hour: sp.getHours(), minute: sp.getMinutes() },
    endDate: ep,
    endTime: allDay ? undefined : { hour: ep.getHours(), minute: ep.getMinutes() },
    color: event.color,
  } as TEventFormData
}

export default function EditEventDialog({
  event,
  open,
  onOpenChange,
  onEventUpdated,
}: EditEventDialogProps) {
  const users = useCalendarStore((s) => s.users)
  const { updateEvent } = useUpdateEvent()
  const labels = useCalendarLabels()

  const schema = useMemo(() => createEventSchema(labels), [labels])

  const initialValues = useMemo(() => buildFormValues(event), [event])

  const form = useForm<TEventFormData>({
    resolver: zodResolver(schema) as Resolver<TEventFormData>,
    defaultValues: initialValues,
  })

  const isAllDay = form.watch('isAllDay')
  const savedStartTime = useRef<{ hour: number; minute: number }>(initialValues.startTime ?? { hour: 9, minute: 0 })
  const savedEndTime = useRef<{ hour: number; minute: number }>(initialValues.endTime ?? { hour: 10, minute: 0 })

  // Reset the form with fresh event data every time the dialog opens.
  useEffect(() => {
    if (!open) return
    const values = buildFormValues(event)
    form.reset(values)
    savedStartTime.current = values.startTime ?? { hour: 9, minute: 0 }
    savedEndTime.current = values.endTime ?? { hour: 10, minute: 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event])

  const onSubmit = form.handleSubmit((values) => {
    const user = users.find((u) => u.id === values.user)
    if (!user) throw new Error('User not found')

    const startDateTime = new Date(values.startDate)
    const endDateTime = new Date(values.endDate)

    if (values.isAllDay) {
      startDateTime.setHours(0, 0, 0, 0)
      endDateTime.setHours(23, 59, 0, 0)
    } else {
      startDateTime.setHours(values.startTime!.hour, values.startTime!.minute)
      endDateTime.setHours(values.endTime!.hour, values.endTime!.minute)
    }

    const updatedEvent: IEvent = {
      ...event,
      user,
      title: values.title,
      color: values.color,
      description: values.description,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      isAllDay: values.isAllDay || undefined,
    }

    updateEvent(updatedEvent)
    onEventUpdated(updatedEvent)
    onOpenChange(false)
  })

  function handleAllDayChange(val: boolean) {
    const values = form.getValues()
    if (val && values.startTime?.hour != null) {
      savedStartTime.current = { hour: values.startTime.hour, minute: values.startTime.minute ?? 0 }
      if (values.endTime?.hour != null) {
        savedEndTime.current = { hour: values.endTime.hour, minute: values.endTime.minute ?? 0 }
      }
    }
    form.setValue('isAllDay', val)
    if (!val) {
      form.setValue('startTime', savedStartTime.current)
      form.setValue('endTime', savedEndTime.current)
    }
  }

  const EVENT_COLORS = [
    { value: 'blue', label: labels.colorBlue, bg: 'bg-blue-600' },
    { value: 'green', label: labels.colorGreen, bg: 'bg-green-600' },
    { value: 'red', label: labels.colorRed, bg: 'bg-red-600' },
    { value: 'yellow', label: labels.colorYellow, bg: 'bg-yellow-600' },
    { value: 'purple', label: labels.colorPurple, bg: 'bg-purple-600' },
    { value: 'orange', label: labels.colorOrange, bg: 'bg-orange-600' },
    { value: 'gray', label: labels.colorGray, bg: 'bg-neutral-600' },
  ] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{labels.dialogEditTitle}</DialogTitle>
          <DialogDescription>
            <AlertTriangle className="mr-1 inline-block size-4 text-yellow-500" />
            {labels.dialogEditDescription}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="edit-event-form" className="grid gap-4 py-4" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.fieldResponsible}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={labels.placeholderSelectOption}>
                          {(value) => {
                            const user = users.find((u) => u.id === value)
                            if (!user) return labels.placeholderSelectOption
                            return (
                              <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                  <AvatarImage src={user.picturePath ?? ''} alt={user.name} />
                                  <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <p className="truncate">{user.name}</p>
                              </div>
                            )
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarImage src={user.picturePath ?? ''} alt={user.name} />
                                <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
                              </Avatar>
                              <p className="truncate">{user.name}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.fieldTitle}</FormLabel>
                  <FormControl>
                    <Input placeholder={labels.placeholderTitle} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAllDay"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>{labels.allDay}</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={handleAllDayChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{labels.fieldStartDate}</FormLabel>
                    <FormControl>
                      <SingleDayPicker
                        value={field.value}
                        placeholder={labels.placeholderSelectDate}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isAllDay && (
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{labels.fieldStartTime}</FormLabel>
                      <FormControl>
                        <TimeInput value={field.value} hourCycle={12} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{labels.fieldEndDate}</FormLabel>
                    <FormControl>
                      <SingleDayPicker
                        value={field.value}
                        placeholder={labels.placeholderSelectDate}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isAllDay && (
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{labels.fieldEndTime}</FormLabel>
                      <FormControl>
                        <TimeInput value={field.value} hourCycle={12} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.fieldColor}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={labels.placeholderSelectOption}>
                          {(value) => {
                            const color = EVENT_COLORS.find((c) => c.value === value)
                            if (!color) return labels.placeholderSelectOption
                            return (
                              <div className="flex items-center gap-2">
                                <div className={`size-3.5 rounded-full ${color.bg}`} />
                                {color.label}
                              </div>
                            )
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_COLORS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            <div className="flex items-center gap-2">
                              <div className={`size-3.5 rounded-full ${c.bg}`} />
                              {c.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.fieldDescription}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline">
                {labels.buttonCancel}
              </Button>
            }
          />
          <Button form="edit-event-form" type="submit">
            {labels.buttonSave}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
