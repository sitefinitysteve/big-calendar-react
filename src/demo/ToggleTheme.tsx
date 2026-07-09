import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getInitialDark() {
  if (typeof localStorage === 'undefined') return false
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function ToggleTheme() {
  const [dark, setDark] = useState(getInitialDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <Button variant="outline" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
