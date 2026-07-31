import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

const COLLAPSE_STORAGE_KEY = 'ft-sidebar-collapsed'

function getInitialCollapsed(): boolean {
  const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY)
  if (stored === 'true' || stored === 'false') return stored === 'true'
  return window.innerWidth < 1024
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed))
  }, [collapsed])

  // Runs here (not just inside DashboardPage) so search/quick-actions have
  // account data even before the user visits /dashboard. React Query
  // dedupes this against DashboardPage's identical query key.
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get })

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav onOpenMobileSidebar={() => setMobileOpen(true)} accounts={data?.accounts ?? []} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
