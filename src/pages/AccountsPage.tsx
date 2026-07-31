import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import TransactionHistoryTable from '../components/TransactionHistoryTable'
import { deposit, getCustomerAccounts, getTransactions, withdraw } from '../services/accounts'
import { getStoredAuthUser } from '../services/login-signup'
import type { Account, LoginResult, Transaction } from '../types/ServiceTypes/services.types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function AccountsPage() {
  const navigate = useNavigate()
  const [authUser, setAuthUser] = useState<LoginResult | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [transactionLoading, setTransactionLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const user = getStoredAuthUser()

    if (!user) {
      navigate('/login')
      return
    }

    setAuthUser(user)
  }, [navigate])

  useEffect(() => {
    if (!authUser) {
      return
    }

    let isActive = true

    async function loadAccounts() {
      setLoading(true)

      try {
        const userAccounts = await getCustomerAccounts(authUser.user_id)

        if (!isActive) {
          return
        }

        setAccounts(userAccounts)

        if (!userAccounts.length) {
          setSelectedAccountId(null)
          setTransactions([])
          return
        }

        setSelectedAccountId((currentSelection) => {
          if (currentSelection && userAccounts.some((account) => account.account_id === currentSelection)) {
            return currentSelection
          }

          return userAccounts[0].account_id
        })
      } catch (error) {
        if (!isActive) {
          return
        }

        setFeedback(error instanceof Error ? error.message : 'Unable to load accounts right now.')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadAccounts()

    return () => {
      isActive = false
    }
  }, [authUser, transactions])

  useEffect(() => {
    if (!selectedAccountId) {
      setTransactions([])
      return
    }

    let isActive = true

    async function loadTransactions() {
      setTransactionLoading(true)

      try {
        const history = await getTransactions(selectedAccountId)

        if (!isActive) {
          return
        }

        setTransactions(history)
      } catch (error) {
        if (!isActive) {
          return
        }

        setFeedback(error instanceof Error ? error.message : 'Unable to load transaction history right now.')
      } finally {
        if (isActive) {
          setTransactionLoading(false)
        }
      }
    }

    void loadTransactions()

    return () => {
      isActive = false
    }
  }, [selectedAccountId])

  const selectedAccount = accounts.find((account) => account.account_id === selectedAccountId) ?? null

  async function handleTransaction(action: 'deposit' | 'withdraw') {
    if (!selectedAccountId || !authUser) {
      return
    }

    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFeedback('Please enter a valid amount greater than zero.')
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      if (action === 'deposit') {
        const response = await deposit(selectedAccountId, numericAmount)
        setAccounts((currentAccounts) =>
          currentAccounts.map((account) =>
            account.account_id === response.account_id ? { ...account, balance: response.new_balance } : account,
          ),
        )
        setFeedback(`Deposit completed. New balance: ${formatCurrency(response.new_balance)}.`)
      } else {
        const response = await withdraw(selectedAccountId, numericAmount)

        setAccounts((currentAccounts) =>
          currentAccounts.map((account) =>
            account.account_id === response.account_id ? { ...account, balance: response.new_balance } : account,
          ),
        )
        setFeedback(`Withdrawal completed. New balance: ${formatCurrency(response.new_balance)}.`)
      }

      setAmount('')
      const history = await getTransactions(selectedAccountId)
      setTransactions(history)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to complete that transaction right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Your accounts</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Manage balances and review activity</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Select any account to deposit or withdraw funds and review the latest transaction history.
          </p>
        </div>

        {feedback && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            {feedback}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Current accounts</h2>
                <p className="mt-1 text-sm text-slate-600">Choose an account to manage it.</p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Loading accounts...
              </div>
            ) : !accounts.length ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                No accounts are available yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Account</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Balance</th>
                      <th className="px-4 py-3 font-medium">Opened</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {accounts.map((account, index) => {
                      const isSelected = account.account_id === selectedAccountId

                      return (
                        <tr
                          key={account.account_id}
                          onClick={() => setSelectedAccountId(account.account_id)}
                          className={`cursor-pointer transition ${isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900">#{index+1}</td>
                          <td className="px-4 py-3 capitalize text-slate-700">{account.account_type}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(account.balance)}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {account.created_at ? new Date(account.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedAccount
                    ? `Manage ${selectedAccount.account_type} account #${selectedAccount.account_id}.`
                    : 'Select an account to begin.'}
                </p>
              </div>

              {!selectedAccount ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  Choose an account from the list to deposit or withdraw funds.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Selected account</p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-lg font-semibold text-slate-900">#{selectedAccount.account_id}</p>
                      <p className="text-sm font-medium text-slate-700">{formatCurrency(selectedAccount.balance)}</p>
                    </div>
                  </div>

                  <label className="block text-sm font-medium text-slate-700">
                    Amount
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      placeholder="Enter amount"
                    />
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => void handleTransaction('deposit')}
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                    >
                      {isSubmitting ? 'Processing...' : 'Deposit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleTransaction('withdraw')}
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {isSubmitting ? 'Processing...' : 'Withdraw'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <TransactionHistoryTable
              transactions={transactions}
              loading={transactionLoading}
              accountId={selectedAccountId}
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AccountsPage
