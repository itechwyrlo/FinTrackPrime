import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { SkeletonTableRow } from './Skeleton'
import { EmptyState } from './EmptyState'

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  /** high = always visible. medium = hidden below the table's @lg container width. low = hidden below @2xl. */
  priority?: 'high' | 'medium' | 'low'
  align?: 'left' | 'right' | 'center'
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  isLoading?: boolean
  emptyMessage?: string
}

const ALIGN_CLASSES = { left: 'text-left', right: 'text-right', center: 'text-center' }

function priorityClass(priority: TableColumn<unknown>['priority']) {
  if (priority === 'low') return 'hidden @2xl:table-cell'
  if (priority === 'medium') return 'hidden @lg:table-cell'
  return 'table-cell'
}

/**
 * Responsive data table: full table with sticky header when its container
 * is wide enough, columns drop by priority as space tightens, and rows
 * become stacked label/value cards when the container is narrow — driven by
 * the table's own available width (via container queries), not the
 * viewport, so this behaves correctly both on phones and inside narrow
 * desktop layout columns (e.g. Financial Statement's 3-column grid).
 */
export function Table<T>({ columns, data, keyExtractor, isLoading, emptyMessage = 'Nothing to show yet.' }: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonTableRow key={index} columns={columns.length} />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return <EmptyState title="Nothing here yet" description={emptyMessage} />
  }

  return (
    <div className="@container">
      {/* Real table, sticky header, columns hidden by priority — shown once
          this component's own container (not the viewport) has room. */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface-elevated @lg:block">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface-elevated">
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary',
                    ALIGN_CLASSES[column.align ?? 'left'],
                    priorityClass(column.priority),
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="border-b border-border last:border-0 hover:bg-surface-sunken/60">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-text-primary',
                      ALIGN_CLASSES[column.align ?? 'left'],
                      priorityClass(column.priority),
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Narrow container: each row becomes a card of label/value pairs. */}
      <ul className="space-y-3 @lg:hidden">
        {data.map((row) => (
          <li key={keyExtractor(row)} className="rounded-xl border border-border bg-surface-elevated p-4">
            <dl className="space-y-2">
              {columns.map((column) => (
                <div key={column.key} className="flex items-baseline justify-between gap-3 text-sm">
                  <dt className="shrink-0 text-text-secondary">{column.header}</dt>
                  <dd className="truncate text-right text-text-primary">{column.render(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
