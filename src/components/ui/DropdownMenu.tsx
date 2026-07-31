import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface DropdownMenuItemConfig {
  label: string
  icon?: ReactNode
  onSelect: () => void
  destructive?: boolean
  disabled?: boolean
}

interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownMenuItemConfig[]
  align?: 'start' | 'center' | 'end'
  /** Non-interactive content above the items, e.g. a name/email block in a profile menu. */
  header?: ReactNode
}

export function DropdownMenu({ trigger, items, align = 'end', header }: DropdownMenuProps) {
  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger asChild>{trigger}</RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-44 rounded-lg border border-border-strong bg-surface-elevated p-1 shadow-lg data-[state=open]:animate-[ft-fade-in_120ms_ease-out]"
        >
          {header && (
            <>
              <div className="px-3 py-2">{header}</div>
              <RadixDropdown.Separator className="my-1 h-px bg-border" />
            </>
          )}
          {items.map((item) => (
            <RadixDropdown.Item
              key={item.label}
              disabled={item.disabled}
              onSelect={item.onSelect}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors',
                'data-[highlighted]:bg-surface-sunken',
                'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                item.destructive ? 'text-status-critical' : 'text-text-primary',
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              {item.label}
            </RadixDropdown.Item>
          ))}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  )
}
