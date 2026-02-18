import { Link, createLazyFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Radio, Video } from 'lucide-react'
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

export const Route = createLazyFileRoute('/locations/$slug/')({
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
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 font-sans font-semibold text-crust transition-[scale,background-color] duration-350 ease-[var(--spring-snappy)] hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
        >
          Back to locations
        </Link>
      </div>
    )
  }

  // Group videos by sublocation
  const sublocationSections = sublocations
    .map((sub) => ({
      sublocation: sub,
      videos: videos.filter((v) => v.sublocation_id === sub.sublocation_id),
    }))
    .filter(({ videos: subVideos }) => subVideos.length > 0)

  const uncategorizedVideos = videos.filter((v) => !v.sublocation_id)

  return (
    <div>
      <LocationsHeroSection title={state.name} slug={slug} />

      <div className="page-container">
        <AdvertisementLayout>
          {/* Videos grouped by sublocation */}
          {sublocationSections.map(({ sublocation, videos: subVideos }) => (
            <Reveal key={sublocation.sublocation_id} variant="float">
              <section className="mb-14">
                <SublocationHeader
                  sublocation={sublocation}
                  slug={slug}
                  videoCount={subVideos.length}
                />
                <Reveal stagger>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {subVideos.map((video) => (
                      <VideoCard key={video.video_id} video={video} />
                    ))}
                  </div>
                </Reveal>
              </section>
            </Reveal>
          ))}

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

          {/* Empty state — no videos at all */}
          {videos.length === 0 && (
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

/* ──── Sublocation Section Header ──── */

function SublocationHeader({
  sublocation,
  slug,
  videoCount,
}: {
  sublocation: Sublocation
  slug: string
  videoCount: number
}) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <Link
        to="/locations/$slug/$sublocationSlug"
        params={{ slug, sublocationSlug: sublocation.slug }}
        className="group inline-flex items-baseline gap-2"
      >
        <h3 className="mb-0 transition-colors group-hover:text-accent">
          {sublocation.name}
        </h3>
        <span className="font-mono text-sm text-subtext0 opacity-0 transition-opacity group-hover:opacity-100">
          View all &rarr;
        </span>
      </Link>
      <div className="flex items-center gap-1.5">
        <Radio size={10} className="text-live" />
        <span className="font-mono text-xs text-subtext0">
          {videoCount} camera{videoCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

/* ──── Video Card ──── */

function VideoCard({ video }: { video: VideoType }) {
  return (
    <div className="reveal-scale group overflow-hidden rounded-xl border border-overlay0 bg-surface0 shadow-lg transition-[border-color,box-shadow] duration-350 ease-[var(--spring-snappy)] hover:border-accent/30 hover:shadow-xl">
      <StreamPlayer src={video.src} type={video.type} muted controls fluid />
      <div className="px-4 py-3">
        <h5 className="mb-0 truncate transition-colors group-hover:text-accent">
          {video.title}
        </h5>
      </div>
    </div>
  )
}
