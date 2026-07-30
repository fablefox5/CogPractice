import Header from "../components/Header";
import Footer from "../components/Footer";

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />

      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section
          aria-labelledby="hero-heading"
          className="grid items-center gap-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-12"
        >
          <section className="space-y-6">
            <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              Simple banking for modern life
            </p>
            <h1
              id="hero-heading"
              className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
            >
              Bank with confidence, grow with clarity.
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Manage everyday spending, save smarter, and access support
              whenever you need it with a trusted digital banking experience.
            </p>
          </section>

          <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-md">
            <h2 className="text-xl font-semibold">Why customers choose us</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>• No hidden fees on everyday accounts</li>
              <li>• Instant transfers and secure payments</li>
              <li>• Helpful support from real people</li>
            </ul>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
