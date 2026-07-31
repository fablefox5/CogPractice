import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStoredAuthUser } from '../services/login-signup'
import type { LoginResult } from '../types/ServiceTypes/services.types'
const navItems = ['Home', 'About', 'Services', 'Contact', 'Accounts']

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authUser, setAuthUser] = useState<LoginResult | null>(null)

  useEffect(() => {
    setAuthUser(getStoredAuthUser())
  }, [])

  function signOut() {
    setAuthUser(null)
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to='/' className="text-xl font-semibold tracking-tight text-slate-900">
          Northstar Bank
        </Link>

        <nav className="hidden gap-2 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item}
              to={item === "Home" ? '/' : `/${item.toLowerCase()}`}
              className="rounded-md px-2 py-3 transition-colors duration-150 ease-in-out hover:bg-slate-100 hover:text-slate-900"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authUser ? (
            <div className='flex gap-5'>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                <span className="text-slate-500">Signed in as</span>{' '}
                <span className="font-semibold text-slate-900">{authUser.username}</span>
              </div>
              <button onClick={signOut} className='rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800'>
                SignOut
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900">
                Login
              </Link>
              <Link to="/signup" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-md border border-slate-300 p-2 text-slate-700 md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <Link key={item} to={item === "Home" ? '/' : `/${item.toLowerCase()}`} className="rounded-md px-2 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                {item}
              </Link>
            ))}
          </nav>

          {authUser ? (
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="text-slate-500">Signed in as</span>{' '}
              <span className="font-semibold text-slate-900">{authUser.username}</span>
            </div>
          ) : null}
        </div>
      )}
    </header>
  )
}

export default Header
