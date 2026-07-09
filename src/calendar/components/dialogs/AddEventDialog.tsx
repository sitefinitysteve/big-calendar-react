import { useEffect, useMemo, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCalendarStore } from '@/stores/calendar'
import type { IEvent } from '@/calendar/interfaces'
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

interface AddEventDialogProps {
  open: boolean
  startDate?: Date
  startTime?: { hour: number; minute: number }
  onOpenChange: (value: boolean) => void
  onEventCreated: (event: IEvent) => void
}

export default function AddEventDialog({
  open,
  startDate,
  startTime,
  onOpenChange,
  onEventCreated,
}: AddEventDialogProps) {
  const users = useCalendarStore((s) => s.users)
  const addEvent = useCalendarStore((s) => s.addEvent)
  const labels = useCalendarLabels()

  const schema = useMemo(() => createEventSchema(labels), [labels])

  const form = useForm<TEventFormData>({
    resolver: zodResolver(schema) as Resolver<TEventFormData>,
    defaultValues: {
      title: '',
      description: '',
      isAllDay: false,
      startDate,
      startTime,
    } as Partial<TEventFormData> as TEventFormData,
  })

  const isAllDay = form.watch('isAllDay')
  // Preserve time values so they can be restored when toggling all-day off.
  const savedStartTime = useRef<{ hour: number; minute: number }>(startTime ?? { hour: 9, minute: 0 })
  const savedEndTime = useRef<{ hour: number; minute: number }>({ hour: 10, minute: 0 })

  // Reset the form whenever the dialog opens or the seeded start date/time changes.
  useEffect(() => {
    if (!open) return
    savedStartTime.current = startTime ?? { hour: 9, minute: 0 }
    savedEndTime.current = { hour: 10, minute: 0 }
    form.reset({
      title: '',
      description: '',
      isAllDay: false,
      startDate,
      startTime,
      user: undefined,
      endDate: undefined,
      endTime: undefined,
      color: undefined,
    } as Partial<TEventFormData> as TEventFormData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, startDate, startTime])

  const onSubmit = form.handleSubmit((values) => {
    const user = users.find((u) => u.id === values.user)
    if (!user) return

    const startDateTime = new Date(values.startDate)
    const endDateTime = new Date(values.endDate)

    if (values.isAllDay) {
      startDateTime.setHours(0, 0, 0, 0)
      endDateTime.setHours(23, 59, 0, 0)
    } else {
      startDateTime.setHours(values.startTime!.hour, values.startTime!.minute)
      endDateTime.setHours(values.endTime!.hour, values.endTime!.minute)
    }

    const newEvent: IEvent = {
      id: Date.now(),
      user,
      title: values.title,
      color: values.color,
      description: values.description,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      ...(values.isAllDay && { isAllDay: true }),
    }

    addEvent(newEvent)
    onEventCreated(newEvent)
    onOpenChange(false)
    form.reset()
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
          <DialogTitle>{labels.dialogAddTitle}</DialogTitle>
          <DialogDescription>
            <AlertTriangle className="mr-1 inline-block size-4 text-yellow-500" />
            {labels.dialogAddDescription}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="add-event-form" className="grid gap-4 py-4" onSubmit={onSubmit}>
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
          <Button form="add-event-form" type="submit">
            {labels.buttonCreate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
