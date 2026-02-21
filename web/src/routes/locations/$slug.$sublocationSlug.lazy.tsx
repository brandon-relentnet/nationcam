import { Link, createLazyFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Video } from 'lucide-react'
import type { Sublocation, Video as VideoType } from '@/lib/types'
import {
  fetchSublocationBySlug,
  fetchVideosBySublocation,
} from '@/lib/api'
import LocationsHeroSection from '@/components/LocationsHeroSection'
import AdvertisementLayout from '@/components/AdvertisementLayout'
import VideoCard from '@/components/VideoCard'
import CameraToolbar from '@/components/CameraToolbar'
import Reveal from '@/components/Reveal'
import { useCameraFilter } from '@/hooks/useCameraFilter'

export const Route = createLazyFileRoute('/locations/$slug/$sublocationSlug')({
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
        const matched = await fetchSublocationBySlug(sublocationSlug)
        setSublocation(matched)

        const subVideos = await fetchVideosBySublocation(matched.sublocation_id)
        setVideos(subVideos)
      } catch {
        // Sublocation not found — leave sublocation as null
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [sublocationSlug])

  const { search, setSearch, sort, setSort, filtered } =
    useCameraFilter(videos)

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
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 font-sans font-semibold text-crust transition-[scale,background-color] duration-350 ease-[var(--spring-snappy)] hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
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
          {/* Toolbar */}
          {videos.length > 0 && (
            <CameraToolbar
              search={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={setSort}
              resultCount={filtered.length}
            />
          )}

          {filtered.length > 0 ? (
            <Reveal stagger>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((video) => (
                  <VideoCard key={video.video_id} video={video} />
                ))}
              </div>
            </Reveal>
          ) : videos.length > 0 && search.trim() ? (
            <Reveal variant="scale">
              <div className="section-container py-12 text-center">
                <p className="mb-0 text-subtext0">
                  No cameras matching &ldquo;{search}&rdquo;
                </p>
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
