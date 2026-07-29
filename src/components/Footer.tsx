function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <span className="font-semibold tracking-wide text-slate-900">Northstar Bank</span>
        <span>© {year} Northstar Bank. All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer
