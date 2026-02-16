import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { State, Sublocation, Video } from '@/lib/types'
import { fetchStates, fetchSublocations, fetchVideosByState } from '@/lib/api'
import LocationsHeroSection from '@/components/LocationsHeroSection'
import AdvertisementLayout from '@/components/AdvertisementLayout'
import VideoPlayer from '@/components/videos/VideoPlayer'

export const Route = createFileRoute('/locations/$slug')({
  component: StatePage,
})

function StatePage() {
  const { slug } = Route.useParams()
  const [state, setState] = useState<State | null>(null)
  const [videos, setVideos] = useState<Array<Video>>([])
  const [sublocations, setSublocations] = useState<Array<Sublocation>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const states = await fetchStates()
        const matchedState = states.find((s) => s.slug === slug)
        if (!matchedState) return

        setState(matchedState)

        const [stateVideos, allSubs] = await Promise.all([
          fetchVideosByState(matchedState.state_id),
          fetchSublocations(),
        ])

        setVideos(stateVideos)
        setSublocations(
          allSubs.filter((sub) => sub.state_id === matchedState.state_id),
        )
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading...</p>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="page-container">
        <h2>State not found</h2>
        <Link to="/locations">Back to locations</Link>
      </div>
    )
  }

  // Group videos by sublocation
  const sublocationVideos = sublocations.map((sub) => ({
    sublocation: sub,
    videos: videos.filter((v) => v.sublocation_id === sub.sublocation_id),
  }))

  const uncategorizedVideos = videos.filter((v) => !v.sublocation_id)

  return (
    <div>
      <LocationsHeroSection title={state.name} slug={slug} />

      <div className="page-container">
        <AdvertisementLayout>
          {sublocationVideos.map(({ sublocation, videos: subVideos }) =>
            subVideos.length > 0 ? (
              <section key={sublocation.sublocation_id} className="mb-12">
                <Link
                  to="/locations/$slug/$sublocationSlug"
                  params={{
                    slug,
                    sublocationSlug: sublocation.slug,
                  }}
                  className="transition-colors hover:text-accent"
                >
                  <h3>{sublocation.name}</h3>
                </Link>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {subVideos.map((video) => (
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
              </section>
            ) : null,
          )}

          {uncategorizedVideos.length > 0 && (
            <section className="mb-12">
              <h3>Other Cameras</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {uncategorizedVideos.map((video) => (
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
            </section>
          )}

          {videos.length === 0 && (
            <div className="section-container text-center">
              <p className="mb-0">
                No cameras available for {state.name} yet. Check back soon!
              </p>
            </div>
          )}
        </AdvertisementLayout>
      </div>
    </div>
  )
}
