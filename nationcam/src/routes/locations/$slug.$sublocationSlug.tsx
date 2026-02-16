import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Video } from 'lucide-react'
import type { Sublocation, Video as VideoType } from '@/lib/types'
import { fetchSublocations, fetchVideosBySublocation } from '@/lib/api'
import LocationsHeroSection from '@/components/LocationsHeroSection'
import AdvertisementLayout from '@/components/AdvertisementLayout'
import StreamPlayer from '@/components/StreamPlayer'
import Reveal from '@/components/Reveal'

export const Route = createFileRoute('/locations/$slug/$sublocationSlug')({
  component: SublocationPage,
})

function SublocationPage() {
  const { slug, sublocationSlug } = Route.useParams()
  const [sublocation, setSublocation] = useState<Sublocation | null>(null)
  const [videos, setVideos] = useState<Array<VideoType>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const allSubs = await fetchSublocations()
        const matched = allSubs.find((s) => s.slug === sublocationSlug)
        if (!matched) return

        setSublocation(matched)

        const subVideos = await fetchVideosBySublocation(matched.sublocation_id)
        setVideos(subVideos)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [sublocationSlug])

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

  if (!sublocation) {
    return (
      <div className="page-container text-center page-enter">
        <h2>Location not found</h2>
        <p>The location you are looking for does not exist.</p>
        <Link
          to="/locations/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 font-sans font-semibold text-crust transition-all duration-350 ease-[var(--spring-snappy)] hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
        >
          Back to state
        </Link>
      </div>
    )
  }

  return (
    <div>
      <LocationsHeroSection title={sublocation.name} slug={sublocation.slug} />

      <div className="page-container">
        <AdvertisementLayout>
          {videos.length > 0 ? (
            <Reveal stagger>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <div
                    key={video.video_id}
                    className="reveal-scale group overflow-hidden rounded-xl border border-overlay0 bg-surface0 shadow-lg transition-all duration-350 ease-[var(--spring-snappy)] hover:border-accent/30 hover:shadow-xl"
                  >
                    <StreamPlayer
                      src={video.src}
                      type={video.type}
                      muted
                      controls
                      fluid
                    />
                    <div className="px-4 py-3">
                      <h5 className="mb-0 truncate transition-colors group-hover:text-accent">
                        {video.title}
                      </h5>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          ) : (
            <Reveal variant="scale">
              <div className="section-container py-12 text-center">
                <Video size={32} className="mx-auto mb-4 text-overlay1" />
                <p className="mb-0">
                  No cameras available for {sublocation.name} yet. Check back
                  soon!
                </p>
              </div>
            </Reveal>
          )}
        </AdvertisementLayout>
      </div>
    </div>
  )
}
