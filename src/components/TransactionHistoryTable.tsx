import type { Transaction } from '../types/ServiceTypes/services.types'

type TransactionHistoryTableProps = {
  transactions: Transaction[]
  loading?: boolean
  accountId?: number | null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatDate(value: Date | string | undefined) {
  if (!value) {
    return '—'
  }

  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return '—'
  }
}

function TransactionHistoryTable({ transactions, loading = false, accountId }: TransactionHistoryTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading transactions...
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 shadow-sm">
        {accountId ? 'No transaction history has been recorded for this account yet.' : 'Select an account to view its transaction history.'}
      </div>
    )
  }

  return (
    <div className="overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm h-100">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction history</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-white text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Txn ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {transactions.map((transaction) => {
              const isDeposit = transaction.txn_type?.toLowerCase() === 'deposit'
              const amountLabel = `${isDeposit ? '+' : '-'}${formatCurrency(transaction.amount)}`

              return (
                <tr key={transaction.txn_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">#{transaction.txn_id}</td>
                  <td className="px-4 py-3 capitalize text-slate-700">{transaction.txn_type}</td>
                  <td className={`px-4 py-3 font-medium ${isDeposit ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {amountLabel}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(transaction.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TransactionHistoryTable
