import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { State } from '@/lib/types'
import { fetchStates } from '@/lib/api'
import AdvertisementLayout from '@/components/AdvertisementLayout'

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
        <h1>Locations</h1>
        <p>
          Browse live cameras across the United States. Select a state to view
          available cameras.
        </p>

        {loading ? (
          <p>Loading locations...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {states.map((state) => (
              <Link
                key={state.state_id}
                to="/locations/$slug"
                params={{ slug: state.slug ?? '' }}
                className="section-container block transition-all hover:border-accent hover:shadow-xl"
              >
                <h4 className="mb-1">{state.name}</h4>
                {state.video_count && state.video_count > 0 ? (
                  <p className="mb-0 text-sm text-subtext0">
                    {state.video_count} camera
                    {state.video_count > 1 ? 's' : ''}
                  </p>
                ) : (
                  <p className="mb-0 text-sm text-overlay0">Coming soon...</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </AdvertisementLayout>
    </div>
  )
}
