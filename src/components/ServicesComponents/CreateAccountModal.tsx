import type { CreateAccountModalProps } from '../../types/ServiceTypes/services.types'

export default function CreateCustomerModal({ onCancel, onSubmit }: CreateAccountModalProps) {
  
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const accountType = formData.get('type') as string
    const accountBalance = Number(formData.get('balance'))

    onSubmit({account_type: accountType, balance: accountBalance})

  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Enter the new account details below.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Account Type</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              name="type">
                <option value={'Checking'}>Checking</option>
                <option value={'Savings'}>Savings</option>
                <option value={'High-Yield Savings'}>High-Yield Savings</option>
            </ select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Starting Balance</label>
            <input
              type=""
              step={0.01}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              placeholder="Enter starting balance (optional)"
              name="balance"
            />
          </div>

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
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}