import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Sublocation, Video } from '@/lib/types'
import { fetchSublocations, fetchVideosBySublocation } from '@/lib/api'
import LocationsHeroSection from '@/components/LocationsHeroSection'
import AdvertisementLayout from '@/components/AdvertisementLayout'
import VideoPlayer from '@/components/videos/VideoPlayer'

export const Route = createFileRoute('/locations/$slug/$sublocationSlug')({
  component: SublocationPage,
})

function SublocationPage() {
  const { slug, sublocationSlug } = Route.useParams()
  const [sublocation, setSublocation] = useState<Sublocation | null>(null)
  const [videos, setVideos] = useState<Array<Video>>([])
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
        <p>Loading...</p>
      </div>
    )
  }

  if (!sublocation) {
    return (
      <div className="page-container">
        <h2>Location not found</h2>
        <Link to="/locations/$slug" params={{ slug }}>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <div key={video.video_id} className="section-container">
                  <VideoPlayer
                    options={{
                      autoplay: false,
                      controls: true,
                      responsive: true,
                      fluid: true,
                      sources: [{ src: video.src, type: video.type }],
                    }}
                  />
                  <h5 className="mt-3 mb-0">{video.title}</h5>
                </div>
              ))}
            </div>
          ) : (
            <div className="section-container text-center">
              <p className="mb-0">
                No cameras available for {sublocation.name} yet. Check back
                soon!
              </p>
            </div>
          )}
        </AdvertisementLayout>
      </div>
    </div>
  )
}
