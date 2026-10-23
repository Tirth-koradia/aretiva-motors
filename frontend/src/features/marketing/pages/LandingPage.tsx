import { Link } from 'react-router-dom'

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
          <nav aria-label="Primary">
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
          <div className="border-ink/15 bg-mist relative aspect-[4/5] overflow-hidden border p-5 sm:p-7">
            <div className="from-brand to-ink relative h-full overflow-hidden bg-gradient-to-br">
              <div
                aria-hidden="true"
                className="bg-canvas/10 absolute -top-[18%] -right-[28%] aspect-square w-[85%] rounded-full border border-white/20"
              />
              <div
                aria-hidden="true"
                className="border-accent absolute top-[18%] right-[18%] aspect-square w-[54%] rotate-12 border"
              />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                <p className="text-xs tracking-[0.24em] text-white/65 uppercase">
                  The Verdigris Gallery
                </p>
                <p className="font-display mt-3 text-4xl leading-none">
                  Edition 01
                </p>
                <div className="mt-7 flex items-center justify-between border-t border-white/25 pt-4 text-xs tracking-wider text-white/70 uppercase">
                  <span>Verified collection</span>
                  <span>2026</span>
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="bg-accent absolute -right-4 -bottom-4 -z-10 h-28 w-28 sm:-right-7 sm:-bottom-7"
          />
        </aside>
      </main>

      <footer className="border-ink/15 relative z-10 border-t">
        <div className="text-ink/65 mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>An independent automotive gallery.</span>
          <span>Excellence through iteration.</span>
        </div>
      </footer>
    </div>
  )
}
