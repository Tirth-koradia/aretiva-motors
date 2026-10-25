import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'

import { ReviewerRoleSwitcher } from '../../auth/components/ReviewerRoleSwitcher'
import { clearSession, readSession } from '../../auth/session'
import { DeliveryLifecycleTracker } from '../components/DeliveryLifecycleTracker'
import { getPurchaseHistory, type PurchaseHistoryItem } from '../api/purchasesApi'

function formatPrice(price: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price))
}

export function PurchaseHistoryPage() {
  const session = readSession()
  const navigate = useNavigate()
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseHistoryItem | null>(null)

  const handleSignOut = () => {
    clearSession()
    navigate('/login')
  }

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
          <div className="flex items-center gap-5 text-sm">
            <Link
              className="text-ink/65 hover:text-brand underline underline-offset-4 transition-colors"
              to="/showroom"
            >
              Return to showroom
            </Link>
            <ReviewerRoleSwitcher currentRole={session.user.role} />
            <div className="flex items-center gap-3">
              <span className="text-ink/75 font-medium">{session.user.full_name}</span>
              <button
                className="rounded-xs border border-ink/20 px-2.5 py-1 text-xs font-semibold text-ink/70 hover:border-brand hover:text-brand transition-colors cursor-pointer"
                onClick={handleSignOut}
                type="button"
              >
                Sign out
              </button>
            </div>
          </div>
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
                className="border-ink/15 bg-mist border p-5 sm:p-7"
                key={purchase.id}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
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
                  <div className="flex flex-col sm:items-end justify-between gap-3">
                    <p className="font-display text-2xl">
                      {formatPrice(purchase.vehicle.price)}
                    </p>
                    <button
                      className="inline-flex items-center gap-1.5 rounded-xs border border-ink/20 bg-canvas px-3 py-1.5 text-xs font-semibold text-ink/80 hover:border-brand hover:text-brand transition-colors cursor-pointer"
                      onClick={() => setSelectedReceipt(purchase)}
                      type="button"
                    >
                      <span>Acquisition receipt</span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                </div>

                <DeliveryLifecycleTracker
                  purchaseId={purchase.id}
                  purchasedAt={purchase.purchased_at}
                  vehicleName={`${purchase.vehicle.make} ${purchase.vehicle.model}`}
                  currentStageId={purchase.delivery_status}
                />
              </article>
            ))}
          </section>
        ) : null}
      </main>

      {selectedReceipt ? (
        <div
          aria-modal="true"
          className="bg-ink/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
        >
          <div className="bg-canvas border-ink/20 w-full max-w-xl rounded-sm border p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-ink/15 pb-4">
              <div>
                <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
                  Aretiva Motors · Private Ledger
                </p>
                <h2 className="font-display mt-1 text-2xl tracking-tight">
                  Certificate of Acquisition
                </h2>
              </div>
              <button
                className="text-ink/50 hover:text-ink text-xl font-bold leading-none p-1 cursor-pointer"
                onClick={() => setSelectedReceipt(null)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-ink/10 pb-4">
                <div>
                  <span className="text-ink/50 text-xs uppercase tracking-wider block">Acquisition Reference</span>
                  <span className="font-mono text-xs">{selectedReceipt.id}</span>
                </div>
                <div>
                  <span className="text-ink/50 text-xs uppercase tracking-wider block">Acquisition Date</span>
                  <span>
                    {new Intl.DateTimeFormat('en-IN', {
                      dateStyle: 'long',
                    }).format(new Date(selectedReceipt.purchased_at))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-ink/10 pb-4">
                <div>
                  <span className="text-ink/50 text-xs uppercase tracking-wider block">Registered Collector</span>
                  <span className="font-semibold text-ink">{session.user.full_name}</span>
                  <span className="text-ink/60 block text-xs">{session.user.email}</span>
                </div>
                <div>
                  <span className="text-ink/50 text-xs uppercase tracking-wider block">Allocation</span>
                  <span>{selectedReceipt.quantity} unit reserved</span>
                </div>
              </div>

              <div className="bg-mist p-4 rounded-xs border border-ink/10">
                <span className="text-brand text-xs font-semibold tracking-[0.16em] uppercase block">
                  Vehicle Specification
                </span>
                <p className="font-display text-2xl mt-1 text-ink">
                  {selectedReceipt.vehicle.year} {selectedReceipt.vehicle.make} {selectedReceipt.vehicle.model}
                </p>
                <p className="font-display text-xl text-brand mt-2">
                  {formatPrice(selectedReceipt.vehicle.price)}
                </p>
              </div>

              <p className="text-ink/50 text-[11px] leading-relaxed pt-2">
                This document certifies the formal consideration and acquisition reservation of the vehicle listed above under the governance of the Aretiva private collection repository.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-ink/15">
              <button
                className="border-ink/20 text-ink/75 hover:border-ink hover:text-ink min-h-10 border px-4 text-xs font-semibold transition-colors cursor-pointer"
                onClick={() => setSelectedReceipt(null)}
                type="button"
              >
                Close
              </button>
              <button
                className="bg-brand text-canvas hover:bg-ink min-h-10 px-5 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                onClick={() => window.print()}
                type="button"
              >
                <span>Print document</span>
                <span aria-hidden="true">⎙</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
