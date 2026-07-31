import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Fragment } from 'react'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="overflow-x-auto">
      <ol className="flex items-center gap-1.5 whitespace-nowrap text-sm text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={item.label}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />}
              <li>
                {item.to && !isLast ? (
                  <Link to={item.to} className="hover:text-text-primary hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-medium text-text-primary' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
