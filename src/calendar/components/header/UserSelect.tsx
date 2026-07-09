import { useMemo } from 'react'
import { useCalendarStore } from '@/stores/calendar'
import { AvatarGroup } from '@/components/ui/avatar-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useCalendarLabels } from '@/calendar/labels'

export default function UserSelect() {
  const selectedUserId = useCalendarStore((s) => s.selectedUserId)
  const setSelectedUserId = useCalendarStore((s) => s.setSelectedUserId)
  const users = useCalendarStore((s) => s.users)
  const labels = useCalendarLabels()

  const triggerLabel = useMemo(() => {
    if (selectedUserId === 'all') return labels.userAll
    const user = users.find((u) => u.id === selectedUserId)
    return user?.name ?? labels.userSelectPlaceholder
  }, [selectedUserId, users, labels])

  function handleValueChange(value: string | null) {
    if (value) setSelectedUserId(value)
  }

  return (
    <Select value={selectedUserId} onValueChange={handleValueChange}>
      <SelectTrigger className="flex-1 md:w-48">
        <span className="truncate">{triggerLabel}</span>
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
            <AvatarGroup max={2} count={users.length}>
              {users.slice(0, 2).map((user) => (
                <Avatar key={user.id} className="size-6 text-xxs">
                  <AvatarImage src={user.picturePath ?? ''} alt={user.name} />
                  <AvatarFallback className="text-xxs">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            {labels.userAll}
          </div>
        </SelectItem>

        {users.map((user) => (
          <SelectItem key={user.id} value={user.id} className="flex-1">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={user.picturePath ?? ''} alt={user.name} />
                <AvatarFallback className="text-xxs">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <p className="truncate">
                {user.name}
              </p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
