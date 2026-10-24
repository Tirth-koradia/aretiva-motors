import { Link } from 'react-router-dom'

import heroCarImage from '../../../assets/hero-editorial-car.jpg'

function AretivaMark() {
  return (
    <svg aria-hidden="true" className="h-9 w-9" fill="none" viewBox="0 0 40 40">
      <path d="M20 4 34 34H6L20 4Z" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 25h16" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="20" cy="20" fill="currentColor" r="2.5" />
    </svg>
  )
}

export function LandingPage() {
  return (
    <div className="bg-canvas text-ink relative flex min-h-screen flex-col overflow-hidden">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="border-ink/15 relative z-10 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            className="focus-visible:ring-accent flex items-center gap-3 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
            to="/"
          >
            <span className="text-brand">
              <AretivaMark />
            </span>
            <span className="font-display text-xl tracking-wide">
              Aretiva Motors
            </span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-6">
            <a
              className="text-ink/65 hover:text-brand hidden text-xs font-medium sm:inline-block transition-colors"
              href="https://aretiva-backend.onrender.com/docs"
              rel="noreferrer"
              target="_blank"
            >
              API Docs ↗
            </a>
            <Link
              className="decoration-accent hover:text-brand underline-offset-8 transition-colors hover:underline"
              to="/login"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main
        className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-16 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.12fr_0.88fr] lg:px-10 lg:py-20"
        id="main-content"
      >
        <section className="relative z-10 max-w-3xl">
          <p className="text-brand mb-7 flex items-center gap-3 text-xs font-semibold tracking-[0.24em] uppercase">
            <span className="bg-accent h-px w-10" />
            Independent automotive gallery
          </p>
          <h1 className="font-display text-2xl tracking-wide">
            Aretiva Motors
          </h1>
          <p className="sr-only">Curated automobiles. Considered journeys.</p>
          <p
            aria-hidden="true"
            className="font-display mt-5 text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.84] tracking-[-0.045em]"
          >
            Curated automobiles.{' '}
            <span className="text-brand italic">Considered journeys.</span>
          </p>
          <p className="text-ink/70 mt-8 max-w-xl text-base leading-7 sm:text-lg">
            Discover a focused collection of new and pre-owned vehicles, each
            presented with the detail needed to choose with confidence.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              className="bg-brand text-canvas hover:bg-ink inline-flex min-h-12 items-center justify-center rounded-sm px-7 py-3 font-semibold transition-colors"
              to="/showroom"
            >
              Explore the showroom
              <span aria-hidden="true" className="ml-3">
                →
              </span>
            </Link>
            <p className="text-ink/60 text-sm">
              Engineered through every iteration.
            </p>
          </div>
        </section>

        <aside
          aria-label="Aretiva collection preview"
          className="relative mx-auto w-full max-w-lg lg:mx-0"
        >
          <Link
            className="group focus-visible:ring-accent border-ink/15 bg-mist relative block aspect-[4/5] overflow-hidden border p-4 sm:p-6 transition-all duration-300 hover:border-brand/40 focus:outline-none focus-visible:ring-2"
            to="/showroom"
          >
            <div className="relative h-full w-full overflow-hidden bg-ink">
              <img
                alt="Aretiva curated grand tourer in a modernist architectural pavilion"
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                src={heroCarImage}
              />
              <div className="from-ink/95 via-ink/40 absolute inset-0 bg-gradient-to-t to-transparent" />

              <div className="bg-ink/75 absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1 text-[11px] font-medium tracking-wider text-white/90 backdrop-blur-md uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Edition 01</span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="text-xs font-semibold tracking-[0.24em] text-white/70 uppercase">
                  The Verdigris Gallery
                </p>
                <p className="font-display mt-2 text-3xl sm:text-4xl leading-none tracking-tight">
                  Featured Vehicle
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4 text-xs tracking-wider text-white/80 uppercase">
                  <span>Verified collection</span>
                  <span className="text-accent group-hover:translate-x-1 inline-flex items-center gap-1.5 font-semibold transition-transform">
                    Explore showroom →
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <div
            aria-hidden="true"
            className="bg-accent absolute -right-4 -bottom-4 -z-10 h-28 w-28 sm:-right-7 sm:-bottom-7"
          />
        </aside>
      </main>

      <footer className="border-ink/15 relative z-10 border-t">
        <div className="text-ink/65 mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>An independent automotive gallery.</span>
          <div className="flex items-center gap-4 text-xs">
            <span>Excellence through iteration.</span>
            <span aria-hidden="true" className="text-ink/20">|</span>
            <a
              className="text-brand hover:text-ink underline underline-offset-4 transition-colors font-medium"
              href="https://aretiva-backend.onrender.com/docs"
              rel="noreferrer"
              target="_blank"
            >
              Interactive API Docs (Swagger) ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
