import { memo } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { TEventColor } from '@/calendar/types'

interface EventBulletProps {
  color: TEventColor
  className?: string
}

const eventBulletVariants = cva('bc-event-bullet size-2 rounded-full', {
  variants: {
    color: {
      blue: 'bg-blue-600 dark:bg-blue-500',
      green: 'bg-green-600 dark:bg-green-500',
      red: 'bg-red-600 dark:bg-red-500',
      yellow: 'bg-yellow-600 dark:bg-yellow-500',
      purple: 'bg-purple-600 dark:bg-purple-500',
      gray: 'bg-neutral-600 dark:bg-neutral-500',
      orange: 'bg-orange-600 dark:bg-orange-500',
    },
  },
  defaultVariants: {
    color: 'blue',
  },
})

function EventBullet({ color, className }: EventBulletProps) {
  return <div className={cn(eventBulletVariants({ color }), className)} />
}

export default memo(EventBullet)
