import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, login } from '../services/login-signup'
import { useAuth } from '../context/AuthContext'
import { getSelf } from '../services/customers'

function SignupPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSignupAttempt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const username = (formData.get('username') as string) || ''
    const password = (formData.get('password') as string) || ''
    try {

      if (username.length < 5 || username.length > 20) {
        setErrorMessage('Username must be between 5 and 20 characters.')
        return
      }

      if (password.length < 6 || password.length > 14) {
        setErrorMessage('Password must be between 6 and 14 characters.')
        return
      }

      await signup({
        name: (formData.get('name') as string) || '',
        email: (formData.get('email') as string) || '',
        username: username,
        password: password,
      })

    try {
      const result = await login(username, password)
      auth?.login(result.access_token)
      
      const selfData = await getSelf()
      navigate(selfData.is_admin ? '/services' : '/accounts')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to log in right now.')
    }

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create account right now.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      <main className="mx-auto flex max-w-5xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Create account</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Sign Up</h1>
            <p className="mt-2 text-sm text-slate-600">Create a new account with your details below.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSignupAttempt}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Enter your full name"
                name="name"
                minLength={1}
                maxLength={100}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Enter your email"
                name="email"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Choose a username"
                name="username"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Choose a password"
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
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-slate-900 hover:underline">
              Login
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}

export default SignupPage
