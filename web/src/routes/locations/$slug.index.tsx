import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { MapPin, Radio, Video } from 'lucide-react'
import type { State, Sublocation, Video as VideoType } from '@/lib/types'
import {
  fetchStateBySlug,
  fetchSublocationsByState,
  fetchVideosByState,
} from '@/lib/api'
import LocationsHeroSection from '@/components/LocationsHeroSection'
import AdvertisementLayout from '@/components/AdvertisementLayout'
import StreamPlayer from '@/components/StreamPlayer'
import Reveal from '@/components/Reveal'

export const Route = createFileRoute('/locations/$slug/')({
  component: StatePage,
})

function StatePage() {
  const { slug } = Route.useParams()
  const [state, setState] = useState<State | null>(null)
  const [videos, setVideos] = useState<Array<VideoType>>([])
  const [sublocations, setSublocations] = useState<Array<Sublocation>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const matchedState = await fetchStateBySlug(slug)
        setState(matchedState)

        const [stateVideos, stateSubs] = await Promise.all([
          fetchVideosByState(matchedState.state_id),
          fetchSublocationsByState(slug),
        ])

        setVideos(stateVideos)
        setSublocations(stateSubs)
      } catch {
        // State not found — leave state as null
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="page-container">
        <div
          className="flex flex-col items-center justify-center py-20"
          style={{
            opacity: 0,
            animation: 'scale-fade-in 500ms var(--spring-poppy) forwards',
          }}
        >
          <div
            className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent"
            style={{ animation: 'spin 800ms linear infinite' }}
          />
          <p className="mt-4 font-mono text-sm text-subtext0">Loading...</p>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="page-container text-center page-enter">
        <h2>State not found</h2>
        <p>The location you are looking for does not exist.</p>
        <Link
          to="/locations"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 font-sans font-semibold text-crust transition-all duration-350 ease-[var(--spring-snappy)] hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
        >
          Back to locations
        </Link>
      </div>
    )
  }

  const uncategorizedVideos = videos.filter((v) => !v.sublocation_id)

  return (
    <div>
      <LocationsHeroSection title={state.name} slug={slug} />

      <div className="page-container">
        <AdvertisementLayout>
          {/* Sublocation card grid */}
          {sublocations.length > 0 && (
            <Reveal variant="blur">
              <section className="mb-14">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                  <MapPin size={14} className="text-accent" />
                  <span className="font-mono text-xs font-medium text-accent">
                    Browse by location
                  </span>
                </div>
                <h3>Locations in {state.name}</h3>
                <Reveal stagger>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sublocations.map((sub) => (
                      <SublocationCard
                        key={sub.sublocation_id}
                        sublocation={sub}
                        slug={slug}
                      />
                    ))}
                  </div>
                </Reveal>
              </section>
            </Reveal>
          )}

          {/* Uncategorized videos (not assigned to any sublocation) */}
          {uncategorizedVideos.length > 0 && (
            <Reveal variant="float">
              <section className="mb-14">
                <h3>Other Cameras</h3>
                <Reveal stagger>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {uncategorizedVideos.map((video) => (
                      <VideoCard key={video.video_id} video={video} />
                    ))}
                  </div>
                </Reveal>
              </section>
            </Reveal>
          )}

          {/* Empty state — no sublocations and no videos */}
          {sublocations.length === 0 && videos.length === 0 && (
            <Reveal variant="scale">
              <div className="section-container py-12 text-center">
                <Video size={32} className="mx-auto mb-4 text-overlay1" />
                <p className="mb-0">
                  No cameras available for {state.name} yet. Check back soon!
                </p>
              </div>
            </Reveal>
          )}
        </AdvertisementLayout>
      </div>
    </div>
  )
}

/* ──── Sublocation Card ──── */

function SublocationCard({
  sublocation,
  slug,
}: {
  sublocation: Sublocation
  slug: string
}) {
  return (
    <Link
      to="/locations/$slug/$sublocationSlug"
      params={{ slug, sublocationSlug: sublocation.slug }}
      className="reveal-float group block rounded-xl border border-overlay0 bg-surface0 p-6 shadow-lg transition-all duration-350 ease-[var(--spring-snappy)] hover:scale-[1.01] hover:border-accent/40 hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="mb-1 transition-colors group-hover:text-accent">
            {sublocation.name}
          </h4>
          {sublocation.video_count && sublocation.video_count > 0 ? (
            <div className="flex items-center gap-1.5">
              <Radio size={12} className="text-live" />
              <span className="font-mono text-sm text-subtext0">
                {sublocation.video_count} camera
                {sublocation.video_count > 1 ? 's' : ''}
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
  )
}

/* ──── Video Card ──── */

function VideoCard({ video }: { video: VideoType }) {
  return (
    <div className="reveal-scale group overflow-hidden rounded-xl border border-overlay0 bg-surface0 shadow-lg transition-all duration-350 ease-[var(--spring-snappy)] hover:border-accent/30 hover:shadow-xl">
      <StreamPlayer src={video.src} type={video.type} muted controls fluid />
      <div className="px-4 py-3">
        <h5 className="mb-0 truncate transition-colors group-hover:text-accent">
          {video.title}
        </h5>
      </div>
    </div>
  )
}
