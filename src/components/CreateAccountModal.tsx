import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsApi } from '../api/accounts'
import { parseAmountInput } from '../utils/number'
import type { AccountType } from '../types/api'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { useToast } from './ui/Toast'

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'Checking', label: 'Checking' },
  { value: 'Savings', label: 'Savings' },
]

interface CreateAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Shared with the top nav's quick-actions menu. DashboardPage still has its
 * own inline CreateAccountForm for now (Phase 3 migrates it to this modal).
 */
export function CreateAccountModal({ open, onOpenChange }: CreateAccountModalProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [nickname, setNickname] = useState('')
  const [type, setType] = useState<AccountType>('Checking')
  const [startingBalance, setStartingBalance] = useState('')

  const reset = () => {
    setNickname('')
    setType('Checking')
    setStartingBalance('')
  }

  const mutation = useMutation({
    mutationFn: () =>
      accountsApi.create({
        nickname,
        type,
        startingBalance: parseAmountInput(startingBalance),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast({ title: 'Account created', description: nickname, variant: 'success' })
      reset()
      onOpenChange(false)
    },
    onError: () => toast({ title: "Couldn't create that account", variant: 'error' }),
  })

  const canSubmit = nickname.trim() !== ''

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create an account"
      description="Give it a name, pick a type, and set a starting balance."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
            Create account
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Nickname" placeholder="e.g. Everyday Checking" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <Select
          label="Account type"
          value={type}
          onValueChange={(value) => setType(value as AccountType)}
          options={ACCOUNT_TYPE_OPTIONS}
        />
        <Input
          label="Starting balance"
          variant="currency"
          placeholder="0.00"
          value={startingBalance}
          onChange={(e) => setStartingBalance(e.target.value)}
        />
      </div>
    </Modal>
  )
}
