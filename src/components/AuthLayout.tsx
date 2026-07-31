import type { ReactNode } from 'react'
import { GuillocheMotif } from './GuillocheMotif'

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-ft-navy text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <GuillocheMotif className="pointer-events-none absolute -right-32 top-1/2 h-[640px] w-[640px] -translate-y-1/2 opacity-70" />

        <a href="/" className="relative font-display text-2xl">
          FinTrack&nbsp;<span className="text-ft-gold">Prime</span>
        </a>

        <p className="relative max-w-sm font-display text-3xl leading-tight">
          Clarity for every account, budget, and goal — in one place.
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-surface p-6 sm:p-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl text-text-primary">{title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
