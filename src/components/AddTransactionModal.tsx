import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountsApi } from '../api/accounts'
import { dashboardApi } from '../api/dashboard'
import { parseAmountInput } from '../utils/number'
import type { TransactionDirection } from '../types/api'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { useToast } from './ui/Toast'
import { EmptyState } from './ui/EmptyState'

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-selects an account, e.g. when opened from that account's own "+ Add transaction". */
  initialAccountId?: string
}

/**
 * Shared by the top nav's quick-actions menu (no implicit account) and
 * each Dashboard account card (implicit account, via initialAccountId) —
 * one flow instead of two, with an account picker either way.
 */
export function AddTransactionModal({ open, onOpenChange, initialAccountId }: AddTransactionModalProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  // Reuses the dashboard query key so React Query dedupes this against
  // DashboardPage's own fetch instead of firing a second request.
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get, enabled: open })
  const accounts = data?.accounts ?? []

  const [accountId, setAccountId] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<TransactionDirection>('Expense')

  const reset = () => {
    setAccountId(initialAccountId ?? '')
    setDescription('')
    setCategory('')
    setAmount('')
    setDirection('Expense')
  }

  useEffect(() => {
    if (open) setAccountId(initialAccountId ?? '')
  }, [open, initialAccountId])

  const mutation = useMutation({
    mutationFn: () =>
      accountsApi.addTransaction(accountId, {
        description,
        category,
        amount: parseAmountInput(amount),
        direction,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast({ title: 'Transaction added', description, variant: 'success' })
      reset()
      onOpenChange(false)
    },
    onError: () => toast({ title: "Couldn't save that transaction", variant: 'error' }),
  })

  const canSubmit =
    accountId !== '' && description.trim() !== '' && category.trim() !== '' && parseAmountInput(amount) > 0

  if (accounts.length === 0) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Add a transaction">
        <EmptyState title="No accounts yet" description="Create an account first, then add transactions to it." />
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add a transaction"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
            Add transaction
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Account"
          value={accountId}
          onValueChange={setAccountId}
          placeholder="Choose an account"
          options={accounts.map((account) => ({ value: account.id, label: account.nickname }))}
        />
        <div className="flex gap-2">
          <Button
            variant={direction === 'Expense' ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
            onClick={() => setDirection('Expense')}
          >
            Expense
          </Button>
          <Button
            variant={direction === 'Income' ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
            onClick={() => setDirection('Income')}
          >
            Income
          </Button>
        </div>
        <Input label="Description" placeholder="e.g. Groceries" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label="Category" placeholder="e.g. Food" value={category} onChange={(e) => setCategory(e.target.value)} />
        <Input label="Amount" variant="currency" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
    </Modal>
  )
}
