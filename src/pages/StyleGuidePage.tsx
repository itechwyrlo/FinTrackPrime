import { useState } from 'react'
import { Download, Mail, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { IconButton } from '../components/ui/IconButton'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { Checkbox } from '../components/ui/Checkbox'
import { Switch } from '../components/ui/Switch'
import { Slider } from '../components/ui/Slider'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { StatCard } from '../components/ui/StatCard'
import { Table, type TableColumn } from '../components/ui/Table'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Tabs } from '../components/ui/Tabs'
import { Accordion } from '../components/ui/Accordion'
import { Modal } from '../components/ui/Modal'
import { DropdownMenu } from '../components/ui/DropdownMenu'
import { Tooltip } from '../components/ui/Tooltip'
import { useToast } from '../components/ui/Toast'
import { Skeleton, SkeletonCard, SkeletonChart, SkeletonText } from '../components/ui/Skeleton'
import { Spinner } from '../components/ui/Spinner'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { EmptyState } from '../components/ui/EmptyState'

interface DemoRow {
  id: string
  description: string
  category: string
  amount: number
}

const DEMO_ROWS: DemoRow[] = [
  { id: '1', description: 'Groceries', category: 'Food', amount: -84.21 },
  { id: '2', description: 'Paycheck', category: 'Income', amount: 2400 },
  { id: '3', description: 'Electric bill', category: 'Utilities', amount: -110.4 },
]

const DEMO_COLUMNS: TableColumn<DemoRow>[] = [
  { key: 'description', header: 'Description', render: (r) => r.description, priority: 'high' },
  { key: 'category', header: 'Category', render: (r) => r.category, priority: 'medium' },
  {
    key: 'amount',
    header: 'Amount',
    render: (r) => <span className="tabular-figure">{r.amount < 0 ? '−' : '+'}${Math.abs(r.amount).toFixed(2)}</span>,
    priority: 'high',
    align: 'right',
  },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl text-text-primary">{title}</h2>
      {children}
    </section>
  )
}

export function StyleGuidePage() {
  const { toast } = useToast()
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('checking')
  const [checked, setChecked] = useState(true)
  const [switched, setSwitched] = useState(false)
  const [sliderValue, setSliderValue] = useState(35)
  const [modalOpen, setModalOpen] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  return (
    <div className="mx-auto max-w-5xl space-y-12 p-6 sm:p-8">
      <div>
        <Breadcrumbs items={[{ label: 'Dev', to: '/style-guide' }, { label: 'Style guide' }]} />
        <div className="mt-2 flex items-center justify-between">
          <h1 className="font-display text-3xl text-text-primary">Component style guide</h1>
          <ThemeToggle />
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Dev-only route. Every Phase 1 component in its main states, both themes. Not linked from app nav.
        </p>
      </div>

      <Section title="Buttons">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" isLoading>
              Saving…
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="secondary" leadingIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <IconButton icon={<Pencil className="h-4 w-4" />} label="Edit" variant="secondary" />
            <IconButton icon={<Trash2 className="h-4 w-4" />} label="Delete" variant="ghost" />
          </div>
        </Card>
      </Section>

      <Section title="Form controls">
        <Card>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Description" placeholder="e.g. Groceries" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <Input label="Amount" variant="currency" placeholder="0.00" helperText="Debounced 500ms after typing stops" />
            <Input label="Interest rate" variant="percent" placeholder="0" />
            <Input label="Email" icon={<Mail className="h-4 w-4" />} error="This field is required" />
            <Select
              label="Account type"
              value={selectValue}
              onValueChange={setSelectValue}
              options={[
                { value: 'checking', label: 'Checking' },
                { value: 'savings', label: 'Savings' },
              ]}
            />
            <Textarea label="Notes" placeholder="Optional notes…" />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-6">
            <Checkbox label="Flag unusual transactions" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <Switch label="Enable notifications" checked={switched} onCheckedChange={setSwitched} />
          </div>
          <div className="mt-5 max-w-sm">
            <Slider
              label="Monthly contribution"
              value={sliderValue}
              onValueChange={setSliderValue}
              min={0}
              max={100}
              formatValue={(v) => `$${v}`}
            />
          </div>
        </Card>
      </Section>

      <Section title="Cards & stats">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total income" value="$15,896.50" trend={{ direction: 'up', label: '+4.2% vs last month' }} />
          <StatCard label="Total expenses" value="$10,896.00" trend={{ direction: 'down', label: '-1.1% vs last month' }} />
          <StatCard label="Loading example" value="" isLoading />
        </div>
      </Section>

      <Section title="Badges & avatars">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="gold">Premium</Badge>
            <Badge variant="good">Unlocked</Badge>
            <Badge variant="warning">Unusual</Badge>
            <Badge variant="critical">Overdue</Badge>
            <Avatar name="Samuel Reyes" size="sm" />
            <Avatar name="Ada Lovelace" size="md" />
            <Avatar name="Grace Hopper" size="lg" />
          </div>
        </Card>
      </Section>

      <Section title="Table (resize the window to see mobile card view)">
        <Table columns={DEMO_COLUMNS} data={DEMO_ROWS} keyExtractor={(r) => r.id} />
      </Section>

      <Section title="Tabs & accordion">
        <Card>
          <Tabs
            items={[
              { value: 'overview', label: 'Overview', content: <p className="text-sm text-text-secondary">Overview content.</p> },
              { value: 'details', label: 'Details', content: <p className="text-sm text-text-secondary">Details content.</p> },
            ]}
          />
        </Card>
        <Accordion
          items={[
            { value: 'a', title: 'What is tabular-figure?', content: 'Fixed-width digits so dollar amounts never shift.' },
            { value: 'b', title: 'How does dark mode persist?', content: 'Stored in localStorage under ft-theme.' },
          ]}
        />
      </Section>

      <Section title="Overlays">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
            <DropdownMenu
              trigger={<IconButton icon={<MoreHorizontal className="h-4 w-4" />} label="More actions" variant="secondary" />}
              items={[
                { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onSelect: () => toast({ title: 'Edit selected' }) },
                { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onSelect: () => {}, destructive: true },
              ]}
            />
            <Tooltip content="This is a tooltip">
              <Button variant="ghost">Hover me</Button>
            </Tooltip>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => toast({ title: 'Saved', description: 'Your changes were saved.', variant: 'success' })}>
              Success toast
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: 'Heads up', description: 'This category is over budget.', variant: 'warning' })}>
              Warning toast
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Couldn't save", description: 'Try again.', variant: 'error' })}>
              Error toast
            </Button>
          </div>
        </Card>
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Create an account"
          description="Give it a name, pick a type, and set a starting balance."
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Create account</Button>
            </>
          }
        >
          <Input label="Nickname" placeholder="e.g. Everyday Checking" />
        </Modal>
      </Section>

      <Section title="Loading states">
        <div className="flex flex-wrap items-center gap-4">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <ProgressBar value={68} label="Budget used" className="max-w-xs" />
          <Button variant="secondary" onClick={() => setShowLoading((v) => !v)}>
            Toggle skeletons
          </Button>
        </div>
        {showLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonCard />
            <div className="space-y-3">
              <SkeletonText lines={3} />
              <SkeletonChart />
            </div>
          </div>
        )}
      </Section>

      <Section title="Empty state">
        <EmptyState title="No transactions yet" description="Add your first transaction to see it here." />
      </Section>

      <Section title="Raw skeleton block">
        <Skeleton className="h-4 w-40" />
      </Section>
    </div>
  )
}
