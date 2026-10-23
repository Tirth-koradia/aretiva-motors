import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { readSession } from '../../auth/session'
import { getPurchaseHistory } from '../api/purchasesApi'

function formatPrice(price: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price))
}

export function PurchaseHistoryPage() {
  const session = readSession()
  const historyQuery = useQuery({
    queryKey: ['purchases'],
    queryFn: () => getPurchaseHistory(session!),
    enabled: session !== null,
  })

  if (!session) {
    return (
      <main className="bg-canvas text-ink grid min-h-screen place-items-center px-5 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-5xl tracking-[-0.04em]">
            Sign in to view your considerations.
          </h1>
          <Link
            className="bg-brand text-canvas mt-8 inline-flex min-h-12 items-center px-6 font-semibold"
            to="/login"
          >
            Log in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="bg-canvas text-ink min-h-screen">
      <header className="border-ink/15 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            className="font-display text-brand text-2xl tracking-wide"
            to="/"
          >
            Aretiva Motors
          </Link>
          <Link
            className="text-ink/65 text-sm underline underline-offset-4"
            to="/showroom"
          >
            Return to showroom
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-16">
        <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
          Your private record
        </p>
        <h1 className="font-display mt-4 text-[clamp(3.25rem,7vw,6rem)] leading-[0.85] tracking-[-0.05em]">
          Your considerations.
        </h1>
        <p className="text-ink/65 mt-6 max-w-xl leading-7">
          A concise record of the vehicles you have asked our concierge to
          reserve for discussion.
        </p>

        {historyQuery.isPending ? (
          <p className="text-ink/65 mt-12">Gathering your record…</p>
        ) : null}
        {historyQuery.isError ? (
          <p
            className="border-accent bg-accent/10 mt-12 border px-4 py-3"
            role="alert"
          >
            {historyQuery.error.message}
          </p>
        ) : null}
        {historyQuery.data && historyQuery.data.items.length === 0 ? (
          <div className="border-ink/15 mt-12 border py-12 text-center">
            <p className="font-display text-3xl">Nothing considered yet.</p>
            <Link
              className="text-brand mt-4 inline-block font-semibold underline underline-offset-4"
              to="/showroom"
            >
              Explore the showroom
            </Link>
          </div>
        ) : null}
        {historyQuery.data ? (
          <section
            aria-label="Recorded purchase requests"
            className="mt-12 grid gap-4"
          >
            {historyQuery.data.items.map((purchase) => (
              <article
                className="border-ink/15 bg-mist grid gap-5 border p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7"
                key={purchase.id}
              >
                <div>
                  <p className="text-brand text-xs font-semibold tracking-[0.16em] uppercase">
                    Considered ·{' '}
                    {new Intl.DateTimeFormat('en-IN', {
                      dateStyle: 'medium',
                    }).format(new Date(purchase.purchased_at))}
                  </p>
                  <h2 className="font-display mt-3 text-4xl tracking-[-0.03em]">
                    {purchase.vehicle.make} {purchase.vehicle.model}
                  </h2>
                  <p className="text-ink/65 mt-2 text-sm">
                    {purchase.vehicle.year} · one unit requested
                  </p>
                </div>
                <p className="font-display text-2xl">
                  {formatPrice(purchase.vehicle.price)}
                </p>
              </article>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  )
}
