export function LandingPage() {
  return (
    <div className="bg-canvas text-ink flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="border-ink/15 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="font-display text-xl tracking-wide">
            Aretiva Motors
          </span>
          <nav aria-label="Primary" />
        </div>
      </header>

      <main
        className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 py-24"
        id="main-content"
      >
        <div className="max-w-3xl">
          <p className="text-brand mb-5 text-xs font-semibold tracking-[0.24em] uppercase">
            The Verdigris Gallery
          </p>
          <h1 className="font-display text-6xl leading-[0.95] tracking-tight sm:text-8xl">
            Aretiva Motors
          </h1>
        </div>
      </main>

      <footer className="border-ink/15 border-t">
        <div className="mx-auto max-w-7xl px-6 py-5 text-sm">
          An independent automotive gallery.
        </div>
      </footer>
    </div>
  )
}
