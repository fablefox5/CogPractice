import { useEffect, useMemo, useState } from 'react'
import type { TransferModalProps, TransferResponse } from '../../types/ServiceTypes/services.types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export default function TransferModal({
  onCancel,
  onSubmit,
  accounts,
  initialSourceAccountId,
  isSubmitting = false,
}: TransferModalProps) {
  const [sourceAccountId, setSourceAccountId] = useState<number>(initialSourceAccountId ?? accounts[0]?.account_id ?? 0)
  const [destinationAccountId, setDestinationAccountId] = useState<number>(0)
  const [amount, setAmount] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [transferResult, setTransferResult] = useState<TransferResponse | null>(null)

  const destinationOptions = useMemo(
    () => accounts.filter((account) => account.account_id !== sourceAccountId),
    [accounts, sourceAccountId],
  )

  useEffect(() => {
    if (!accounts.length) {
      return
    }

    const sourceExists = accounts.some((account) => account.account_id === sourceAccountId)

    if (!sourceExists) {
      setSourceAccountId(initialSourceAccountId ?? accounts[0].account_id)
      return
    }

    if (!destinationOptions.some((account) => account.account_id === destinationAccountId)) {
      setDestinationAccountId(destinationOptions[0]?.account_id ?? 0)
    }
  }, [accounts, sourceAccountId, destinationAccountId, initialSourceAccountId, destinationOptions])

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const numericAmount = Number(amount)

    if (!sourceAccountId || !destinationAccountId) {
      setFormError('Please select both source and destination accounts.')
      return
    }

    if (sourceAccountId === destinationAccountId) {
      setFormError('Source and destination accounts must be different.')
      return
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter an amount greater than zero.')
      return
    }

    setFormError(null)

    try {
      const response = await onSubmit({ sourceAccountId, destinationAccountId, amount: numericAmount })
      setTransferResult(response)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to transfer funds right now.')
    }
  }

  function resetForAnotherTransfer() {
    setAmount('')
    setFormError(null)
    setTransferResult(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Transfer Funds</h2>
          <p className="mt-2 text-sm text-slate-600">Choose a source account, destination account, and amount.</p>
        </div>

        {accounts.length < 2 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You need at least two accounts to make a transfer.
          </div>
        ) : transferResult ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Transfer completed successfully.
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Transfer amount</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(transferResult.amount)}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Source account</p>
                <p className="mt-1 text-base font-semibold text-slate-900">#{transferResult.source_account_id}</p>
                <p className="mt-1 text-sm text-slate-700">New balance: {formatCurrency(transferResult.source_account_balance)}</p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Destination account</p>
                <p className="mt-1 text-base font-semibold text-slate-900">#{transferResult.destination_account_id}</p>
                <p className="mt-1 text-sm text-slate-700">New balance: {formatCurrency(transferResult.destination_account_balance)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForAnotherTransfer}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Make Another Transfer
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="transfer-source-account">
                Source Account
              </label>
              <select
                id="transfer-source-account"
                value={sourceAccountId}
                onChange={(event) => setSourceAccountId(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                {accounts.map((account) => (
                  <option key={account.account_id} value={account.account_id}>
                    #{account.account_id} - {account.account_type} ({formatCurrency(account.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="transfer-destination-account">
                Destination Account
              </label>
              <select
                id="transfer-destination-account"
                value={destinationAccountId}
                onChange={(event) => setDestinationAccountId(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                {destinationOptions.map((account) => (
                  <option key={account.account_id} value={account.account_id}>
                    #{account.account_id} - {account.account_type} ({formatCurrency(account.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="transfer-amount">
                Amount
              </label>
              <input
                id="transfer-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Enter transfer amount"
              />
            </div>

            {formError && <p className="text-sm text-rose-600">{formError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? 'Transferring...' : 'Transfer Funds'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
