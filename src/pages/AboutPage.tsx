import Header from '../components/Header'
import Footer from '../components/Footer'

function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:p-12">
          <p className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            About Northstar Bank
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Built to make everyday banking feel effortless.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Our mission is to help people and businesses manage money with confidence through simple digital tools, reliable support, and a transparent banking experience.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Trusted</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Secure accounts and dependable service for your everyday needs.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Modern</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                A streamlined digital experience designed for the way you bank today.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Personal</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Friendly guidance and support when you need it most.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AboutPage
