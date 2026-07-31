import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { Switch } from './Switch'

/** Sun/moon theme toggle. Not placed in any layout yet — Phase 2 puts it in the top nav. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="inline-flex items-center gap-2 text-text-secondary">
      <Sun className="h-4 w-4" />
      <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} label="Toggle dark mode" showLabel={false} />
      <Moon className="h-4 w-4" />
    </div>
  )
}
