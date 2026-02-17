import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { MapPin, Radio } from 'lucide-react'
import type { State } from '@/lib/types'
import { fetchStates } from '@/lib/api'
import AdvertisementLayout from '@/components/AdvertisementLayout'
import Reveal from '@/components/Reveal'

export const Route = createFileRoute('/locations/')({
  component: LocationsPage,
})

function LocationsPage() {
  const [states, setStates] = useState<Array<State>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStates()
      .then(setStates)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-container">
      <AdvertisementLayout>
        {/* Header — blur entrance */}
        <Reveal variant="blur">
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
              <MapPin size={14} className="text-accent" />
              <span className="font-mono text-xs font-medium text-accent">
                Browse by state
              </span>
            </div>
            <h1>Locations</h1>
            <p className="max-w-lg">
              Browse live cameras across the United States. Select a state to
              view available cameras.
            </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-overlay0 bg-surface0"
                style={{
                  opacity: 0,
                  animation: `fade-in 400ms var(--spring-ease-out) ${i * 60}ms forwards`,
                }}
              >
                <div
                  className="h-full w-full rounded-xl bg-gradient-to-r from-surface0 via-mantle to-surface0 bg-[length:200%_100%]"
                  style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
                />
              </div>
            ))}
          </div>
        ) : (
          <Reveal stagger>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {states.map((state) => (
                <Link
                  key={state.state_id}
                  to="/locations/$slug"
                  params={{ slug: state.slug }}
                  className="reveal-float group block rounded-xl border border-overlay0 bg-surface0 p-6 shadow-lg transition-all duration-350 ease-[var(--spring-snappy)] hover:scale-[1.01] hover:border-accent/40 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="mb-1 transition-colors group-hover:text-accent">
                        {state.name}
                      </h4>
                      {state.video_count && state.video_count > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <Radio size={12} className="text-live" />
                          <span className="font-mono text-sm text-subtext0">
                            {state.video_count} camera
                            {state.video_count > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-sm text-overlay2">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <MapPin
                      size={20}
                      className="shrink-0 text-overlay1 transition-colors group-hover:text-accent"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </AdvertisementLayout>
    </div>
  )
}
