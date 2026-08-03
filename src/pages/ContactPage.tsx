function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              Contact us
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              We’re here to help with your banking questions.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Reach out to our support team for account help, product information, or general inquiries.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Get in touch</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>📞 Phone: (800) 555-0142</li>
              <li>✉️ Email: support@northstarbank.com</li>
              <li>📍 Address: 123 Market Street, Suite 400</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ContactPage
