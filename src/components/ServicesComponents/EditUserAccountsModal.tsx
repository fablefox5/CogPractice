import { useEffect, useMemo, useState } from 'react'
import type { EditUserAccountsModalProps } from '../../types/ServiceTypes/services.types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export default function EditUserAccountsModal({
  userId,
  username,
  accounts,
  isLoading,
  isSubmitting,
  errorMessage,
  onClose,
  onRefresh,
  onSubmit,
}: EditUserAccountsModalProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [accountType, setAccountType] = useState('')
  const [balance, setBalance] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.account_id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  )

  useEffect(() => {
    if (!accounts.length) {
      setSelectedAccountId(null)
      return
    }

    setSelectedAccountId((currentSelection) => {
      if (currentSelection && accounts.some((account) => account.account_id === currentSelection)) {
        return currentSelection
      }

      return accounts[0].account_id
    })
  }, [accounts])

  useEffect(() => {
    if (!selectedAccount) {
      setAccountType('')
      setBalance('')
      return
    }

    setAccountType(selectedAccount.account_type)
    setBalance(String(selectedAccount.balance))
  }, [selectedAccount])

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedAccount) {
      setFormError('Please select an account to edit.')
      return
    }

    const numericBalance = Number(balance)

    if (!Number.isFinite(numericBalance) || numericBalance < 0) {
      setFormError('Please enter a valid balance of zero or greater.')
      return
    }

    if (!accountType.trim()) {
      setFormError('Please select an account type.')
      return
    }

    setFormError(null)

    try {
      await onSubmit({
        accountId: selectedAccount.account_id,
        details: {
          account_type: accountType,
          balance: numericBalance,
        },
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to update account right now.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Manage User Accounts</h2>
            <p className="mt-2 text-sm text-slate-600">
              Update account details for user #{userId} ({username}).
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onRefresh()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border border-slate-200">
            {isLoading ? (
              <div className="p-6 text-sm text-slate-600">Loading user accounts...</div>
            ) : !accounts.length ? (
              <div className="p-6 text-sm text-slate-600">No accounts found for this user.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Account ID</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {accounts.map((account) => {
                      const isSelected = account.account_id === selectedAccountId

                      return (
                        <tr
                          key={account.account_id}
                          className={`cursor-pointer transition ${isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                          onClick={() => setSelectedAccountId(account.account_id)}
                        >
                          <td className="px-4 py-3 text-slate-900">{account.account_id}</td>
                          <td className="px-4 py-3 text-slate-700">{account.account_type}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(account.balance)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            {!selectedAccount ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Select an account to edit its details.
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <p className="text-sm text-slate-500">Selected account</p>
                  <p className="text-lg font-semibold text-slate-900">#{selectedAccount.account_id}</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="admin-account-type">
                    Account Type
                  </label>
                  <select
                    id="admin-account-type"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    value={accountType}
                    onChange={(event) => setAccountType(event.target.value)}
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="High-Yield Savings">High-Yield Savings</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="admin-account-balance">
                    Balance
                  </label>
                  <input
                    id="admin-account-balance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={balance}
                    onChange={(event) => setBalance(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    placeholder="Enter updated balance"
                  />
                </div>

                {formError && <p className="text-sm text-rose-600">{formError}</p>}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
