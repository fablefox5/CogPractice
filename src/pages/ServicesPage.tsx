import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import type { EditParams, Customer } from '../types/ServiceTypes/services.types'
import { getCustomers, deleteCustomer, getCustomer, editCustomer, addCustomer } from '../services/customers'
import EditCustomerModal from '../components/ServicesComponents/EditCustomerModal'
import CreateCustomerModal from '../components/ServicesComponents/CreateCustomerModal'

export default function ServicesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeEditId, setActiveEditId] = useState<number>(-1)
  const [editPlaceholders, setEditPlaceholders] = useState<EditParams>({
    name: "",
    email: "",
    username: "",
    password: "",
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)


    
  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setErrorMessage(null)
    setIsLoading(true)

    try {
      const allCustomerData = await getCustomers() ?? []
      setCustomers(allCustomerData)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load customers right now.')
    } finally {
      setIsLoading(false)
    }
  }

  function cancelEditModal() {
    setEditPlaceholders({
      name: "",
      email: "",
      username: "",
      password: "",
    })
  }
  

  async function removeCustomer(userId: number) {
    await deleteCustomer(userId)
    loadCustomers()
  }

  function openCreateModal() {
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false)
  }

  async function submitCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newCustomer: EditParams = {
      name: (formData.get('name') as string) || '',
      email: (formData.get('email') as string) || '',
      username: (formData.get('username') as string) || '',
      password: (formData.get('password') as string) || '',
    }

    try {
      await addCustomer(newCustomer)
      closeCreateModal()
      await loadCustomers()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to add customer right now.')
    }
  }

  async function enableEditing(userId: number) {
    const customer = await getCustomer(userId)
    setEditPlaceholders(customer)
    setActiveEditId(userId)
  }

  async function submitEdit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData: FormData = new FormData(e.currentTarget)
    const updatedUsername = formData.get("username") as string
    const updatedPassword = formData.get("password") as string
    const updatedName = formData.get("name") as string
    const updatedEmail = formData.get("email") as string

    await editCustomer(activeEditId, {
      username: updatedUsername,
      password: updatedPassword,
      name: updatedName,
      email: updatedEmail
    })
    
    cancelEditModal()
    setActiveEditId(-1)
    loadCustomers()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:p-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Services dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-600">
                Load customer data to view a clean table with controls for editing and deleting records.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add Customer
            </button>
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
            {customers.length === 0 ? (
              <div className="bg-slate-50 px-6 py-12 text-center text-sm text-slate-600">
                No customer data yet. Click “Get Customers” to load the sample list.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">User ID</th>
                      <th className="px-4 py-3 font-semibold">Username</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Is Admin</th>
                      <th className="px-4 py-3 font-semibold">Created At</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {customers.map((customer) => (
                      <tr key={customer.user_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{customer.user_id}</td>
                        <td className="px-4 py-3 text-slate-900">{customer.username}</td>
                        <td className="px-4 py-3 text-slate-700">{customer.email}</td>
                        <td className="px-4 py-3 text-slate-700">{customer.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              customer.is_admin ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {customer.is_admin ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{customer.created_at}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => enableEditing(customer.user_id)}
                              className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCustomer(customer.user_id)}
                              className="cursor-pointer rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {editPlaceholders.username.length > 0 && <EditCustomerModal placeholderData={editPlaceholders} onCancel={cancelEditModal} onSubmit={submitEdit}/>}

      {isCreateModalOpen && <CreateCustomerModal onCancel={closeCreateModal} onSubmit={submitCreate} />}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl" role="dialog" aria-modal="true">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            <h2 className="text-lg font-semibold text-slate-900">Loading customers</h2>
            <p className="mt-2 text-sm text-slate-600">Please wait while the latest customer list is being prepared.</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true">
            <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={loadCustomers}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}