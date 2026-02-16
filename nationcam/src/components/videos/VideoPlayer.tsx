import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  options: {
    autoplay?: boolean
    controls?: boolean
    responsive?: boolean
    fluid?: boolean
    loop?: boolean
    muted?: boolean
    sources?: Array<{ src: string; type: string }>
    [key: string]: unknown
  }
}

export default function VideoPlayer({ options }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    if (!playerRef.current) {
      const videoElement = document.createElement('video-js')
      videoElement.classList.add('vjs-big-play-centered')
      videoRef.current.appendChild(videoElement)

      playerRef.current = videojs(videoElement, options)
    } else {
      const player = playerRef.current
      player.autoplay(options.autoplay ?? false)
      if (options.sources) {
        player.src(options.sources)
      }
    }
  }, [options])

  useEffect(() => {
    const player = playerRef.current
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose()
        playerRef.current = null
      }
    }
  }, [])

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  )
}
