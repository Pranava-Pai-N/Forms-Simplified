import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 mt-0">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
      <div className="absolute top-[-10%] left-1/2 -z-10 h-125 w-125 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="absolute top-[20%] right-[-10%] -z-10 h-87.5 w-87.5 rounded-full bg-violet-600/5 blur-[100px]" />

      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-6 pb-20 text-center sm:px-6 sm:pt-12">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl bg-clip-text text-transparent bg-linear-to-b from-white via-slate-200 to-slate-500 leading-tight">
          Build beautiful surveys
          <br />
          <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
            in milliseconds
          </span>
        </h1>

        <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
          Engineered for high-throughput feedback pipelines. Create institutional-grade
          questionnaires, orchestrate instantly across channels, and isolate micro-trends with
          real-time computational analytics.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/dashboard"
            className="group relative w-full sm:w-auto overflow-hidden rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100 shadow-xl shadow-white/5 active:scale-98"
          >
            Go to Dashboard
          </Link>

          <Link
            to="/survey/new"
            className="group w-full sm:w-auto rounded-full border border-slate-800 bg-slate-900/40 backdrop-blur-md px-8 py-3.5 text-sm font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-900/80 hover:text-white transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2"
          >
            Create New Survey
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group relative rounded-2xl border border-slate-900 bg-linear-to-b from-slate-900/60 to-slate-950 p-8 hover:border-slate-800 transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="absolute top-0 right-0 h-px w-20 bg-linear-to-r from-transparent via-indigo-500/20 to-transparent group-hover:via-indigo-500/50 transition-all" />
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight">Fast Creation</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Build your surveys instantly with a smooth, clean, and intuitive interface.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-slate-900 bg-linear-to-b from-slate-900/60 to-slate-950 p-8 hover:border-slate-800 transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="absolute top-0 right-0 h-px w-20 bg-linear-to-r from-transparent via-violet-500/20 to-transparent group-hover:via-violet-500/50 transition-all" />
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-violet-400 group-hover:text-violet-300 transition-colors">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight">Share Anywhere</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Generate public links instantly and collect responses effortlessly across any
              platform.
            </p>
          </div>

          <div className="group relative rounded-2xl border border-slate-900 bg-linear-to-b from-slate-900/60 to-slate-950 p-8 hover:border-slate-800 transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="absolute top-0 right-0 h-px w-20 bg-linear-to-r from-transparent via-fuchsia-500/20 to-transparent group-hover:via-fuchsia-500/50 transition-all" />
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight">Smart Insights</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Analyze real-time data data cleanly and understand your target audience better.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/60 py-12 text-center text-xs tracking-wider text-slate-500 uppercase font-mono">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy;{new Date().getFullYear()}. All rights reserved.</div>
          <div className="flex items-center gap-1.5 text-slate-400">
            Built with
            <span className="text-indigo-400 hover:text-indigo-300 transition cursor-default">
              TanStack Router
            </span>
            &amp;
            <span className="text-violet-400 hover:text-violet-300 transition cursor-default">
              Hono
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
