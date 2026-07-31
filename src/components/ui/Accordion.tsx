import * as RadixAccordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

export interface AccordionItem {
  value: string
  title: ReactNode
  content: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
}

export function Accordion({ items, type = 'single', defaultValue }: AccordionProps) {
  const rootProps =
    type === 'single'
      ? { type: 'single' as const, collapsible: true, defaultValue: defaultValue as string | undefined }
      : { type: 'multiple' as const, defaultValue: defaultValue as string[] | undefined }

  return (
    <RadixAccordion.Root {...rootProps} className="divide-y divide-border rounded-xl border border-border bg-surface-elevated">
      {items.map((item) => (
        <RadixAccordion.Item key={item.value} value={item.value}>
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-text-primary outline-none focus-visible:bg-surface-sunken">
              {item.title}
              <ChevronDown className="h-4 w-4 shrink-0 text-text-muted transition-transform group-data-[state=open]:rotate-180" />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="overflow-hidden px-4 text-sm text-text-secondary data-[state=open]:pb-4 data-[state=open]:animate-[ft-accordion-down_200ms_ease-out] data-[state=closed]:animate-[ft-accordion-up_200ms_ease-out]">
            {item.content}
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  )
}
