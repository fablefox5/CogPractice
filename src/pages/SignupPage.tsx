import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { signup } from '../services/login-signup'

function SignupPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSignupAttempt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      await signup({
        name: (formData.get('name') as string) || '',
        email: (formData.get('email') as string) || '',
        username: (formData.get('username') as string) || '',
        password: (formData.get('password') as string) || '',
      })

      navigate('/')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create account right now.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

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

      <Footer />
    </div>
  )
}

export default SignupPage
