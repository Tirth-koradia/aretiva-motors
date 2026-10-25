import { useState } from 'react'

interface DeliveryStage {
  id: string
  title: string
  subtitle: string
  detail: string
}

const DELIVERY_STAGES: DeliveryStage[] = [
  {
    id: 'confirmed',
    title: 'Acquisition Confirmed',
    subtitle: 'Registry Allocation Completed',
    detail: 'Legal title and bespoke registry credentials reserved in the private Aretiva vault.',
  },
  {
    id: 'detailing',
    title: 'Custom Detailing & White-Glove Inspection',
    subtitle: 'Ceramic Coating & 120-Point Audit',
    detail: 'Full multi-point mechanical inspection, bespoke interior conditioning, and micro-finish polish.',
  },
  {
    id: 'en_route',
    title: 'En Route to Private Suite',
    subtitle: 'Climate-Controlled Covered Transit',
    detail: 'Secure enclosed carrier transport under GPS-monitored telemetry to your assigned regional suite.',
  },
  {
    id: 'handover_ready',
    title: 'Handover Ready',
    subtitle: 'White-Glove Key Presentation',
    detail: 'Private client lounge unveiling, key exchange ceremony, and telemetry pairing.',
  },
]

interface DeliveryLifecycleTrackerProps {
  purchaseId: string
  purchasedAt: string
  vehicleName: string
}

export function DeliveryLifecycleTracker({
  purchaseId,
  purchasedAt,
  vehicleName,
}: DeliveryLifecycleTrackerProps) {
  // Determine realistic default stage based on purchase age, default to Detailing (stage index 1)
  const purchaseDate = new Date(purchasedAt)
  const daysSincePurchase = Math.max(
    0,
    Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
  )

  const defaultStageIndex = Math.min(
    DELIVERY_STAGES.length - 1,
    daysSincePurchase < 1 ? 0 : daysSincePurchase < 3 ? 1 : daysSincePurchase < 6 ? 2 : 3
  )

  const [activeStageIndex, setActiveStageIndex] = useState(defaultStageIndex)
  const currentStage: DeliveryStage = DELIVERY_STAGES[activeStageIndex] ?? DELIVERY_STAGES[0]!

  // Estimated delivery: 7 days after purchase date
  const estimatedDelivery = new Date(purchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  const trackingNumber = `AM-TRK-${purchaseId.replace(/-/g, '').slice(0, 8).toUpperCase()}`

  return (
    <div
      aria-label={`Concierge delivery tracker for ${vehicleName}`}
      className="mt-5 border-t border-ink/15 pt-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div>
          <span className="text-brand text-[11px] font-semibold tracking-[0.2em] uppercase">
            Concierge Delivery Lifecycle
          </span>
          <p className="text-xs text-ink/65 mt-0.5">
            Tracking ID: <span className="font-mono font-medium text-ink">{trackingNumber}</span> · Estimated Handover:{' '}
            <span className="font-medium text-ink">
              {new Intl.DateTimeFormat('en-IN', {
                dateStyle: 'medium',
              }).format(estimatedDelivery)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-semibold text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            {currentStage.title}
          </span>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="relative mt-2">
        {/* Background connector line */}
        <div
          aria-hidden="true"
          className="absolute top-4 left-[5%] right-[5%] h-0.5 bg-ink/15 z-0"
        />
        {/* Active connector progress */}
        <div
          aria-hidden="true"
          className="absolute top-4 left-[5%] h-0.5 bg-brand transition-all duration-500 z-0"
          style={{
            width: `${(activeStageIndex / (DELIVERY_STAGES.length - 1)) * 90}%`,
          }}
        />

        <ol className="relative z-10 grid grid-cols-4 gap-2 text-center">
          {DELIVERY_STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStageIndex
            const isCurrent = idx === activeStageIndex
            return (
              <li
                key={stage.id}
                className="flex flex-col items-center group cursor-pointer"
                onClick={() => setActiveStageIndex(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveStageIndex(idx)
                  }
                }}
                aria-label={`Step ${idx + 1}: ${stage.title}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-brand text-canvas ring-4 ring-brand/20 scale-110'
                      : isCompleted
                      ? 'bg-brand text-canvas'
                      : 'bg-canvas border-2 border-ink/25 text-ink/40 group-hover:border-ink/50'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <p
                  className={`mt-2 text-[11px] font-semibold leading-tight tracking-tight ${
                    isCurrent
                      ? 'text-brand'
                      : isCompleted
                      ? 'text-ink'
                      : 'text-ink/40'
                  }`}
                >
                  {stage.title}
                </p>
                <p className="hidden md:block text-[10px] text-ink/50 mt-0.5">
                  {stage.subtitle}
                </p>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Active Stage Callout */}
      <div className="bg-canvas border border-ink/10 rounded-xs p-3.5 mt-5 flex items-start justify-between gap-4">
        <div>
          <span className="text-brand text-[10px] font-semibold uppercase tracking-wider block">
            Current Protocol Status · Step {activeStageIndex + 1} of {DELIVERY_STAGES.length}
          </span>
          <p className="text-xs text-ink/75 mt-1 leading-relaxed">
            {currentStage.detail}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-[10px] uppercase tracking-wider text-ink/40 block">Concierge Liaison</span>
          <span className="text-xs font-medium text-ink">Private Suite Desk</span>
        </div>
      </div>
    </div>
  )
}
