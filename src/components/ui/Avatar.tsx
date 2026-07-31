import * as RadixAvatar from '@radix-ui/react-avatar'
import { cn } from '../../utils/cn'

interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return (
    <RadixAvatar.Root
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-ft-navy font-semibold text-white',
        SIZE_CLASSES[size],
        className,
      )}
    >
      <RadixAvatar.Image src={src} alt={name} className="h-full w-full object-cover" />
      <RadixAvatar.Fallback delayMs={src ? 300 : 0}>{getInitials(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
}
