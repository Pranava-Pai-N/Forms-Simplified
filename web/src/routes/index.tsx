import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="text-5xl font-bold leading-tight">
          Build beautiful surveys
          <br />
          <span className="text-indigo-400">in minutes</span>
        </h2>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
          Create, share, and analyze surveys effortlessly. A clean, fast and powerful experience for
          modern creators.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold hover:bg-indigo-400 transition"
          >
            Go to Dashboard
          </Link>

          <Link
            to="/survey/new"
            className="rounded-full border border-slate-700 px-6 py-3 text-sm hover:border-slate-500 transition"
          >
            Create Survey
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 p-6 bg-slate-900 hover:border-indigo-500 transition">
          <h3 className="text-lg font-semibold">Fast Creation</h3>
          <p className="mt-2 text-sm text-slate-400">
            Build surveys instantly with a smooth and intuitive interface.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 p-6 bg-slate-900 hover:border-indigo-500 transition">
          <h3 className="text-lg font-semibold">Share Anywhere</h3>
          <p className="mt-2 text-sm text-slate-400">
            Generate public links and collect responses effortlessly.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 p-6 bg-slate-900 hover:border-indigo-500 transition">
          <h3 className="text-lg font-semibold">Insights</h3>
          <p className="mt-2 text-sm text-slate-400">
            Analyze responses and understand your audience better.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        Built with ❤️ using TanStack Router & Hono
      </footer>
    </div>
  )
}
