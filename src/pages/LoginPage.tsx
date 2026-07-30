import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { login } from '../services/login-signup'

function LoginPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleLoginAttempt(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    try {
      await login(username, password)
      navigate('/')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to log in right now.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

      <main className="mx-auto flex max-w-5xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Login</h1>
            <p className="mt-2 text-sm text-slate-600">Enter your username and password to continue.</p>
          </div>

          <form className="space-y-4" onSubmit={handleLoginAttempt}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Enter username"
                name="username"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Enter password"
                name="password"
              />
            </div>

            {errorMessage && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Need an account?{' '}
            <Link to="/signup" className="font-medium text-slate-900 hover:underline">
              Sign up
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default LoginPage
