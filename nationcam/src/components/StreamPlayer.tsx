import Hls from 'hls.js'
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import LiveBadge from '@/components/LiveBadge'

interface StreamPlayerProps {
  /** Video source URL — supports HLS (.m3u8), MP4, WebM, etc. */
  src: string
  /** MIME type hint (optional — auto-detected from URL if omitted) */
  type?: string
  /** Start playing automatically */
  autoplay?: boolean
  /** Start muted */
  muted?: boolean
  /** Show player controls */
  controls?: boolean
  /** Show LIVE badge */
  live?: boolean
  /** Additional CSS classes on the outer container */
  className?: string
  /** Maintain 16:9 aspect ratio */
  fluid?: boolean
}

function detectType(src: string): string {
  if (src.includes('.m3u8')) return 'application/x-mpegURL'
  if (src.includes('.mpd')) return 'application/dash+xml'
  if (src.includes('.mp4')) return 'video/mp4'
  if (src.includes('.webm')) return 'video/webm'
  return ''
}

export default function StreamPlayer({
  src,
  type,
  autoplay = false,
  muted = true,
  controls = true,
  live = false,
  className = '',
  fluid = true,
}: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(autoplay)
  const [isMuted, setIsMuted] = useState(muted)
  const [volume, setVolume] = useState(muted ? 0 : 0.8)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const resolvedType = type ?? detectType(src)
  const isHls = resolvedType === 'application/x-mpegURL'

  // Initialize video source
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setIsLoading(true)
    video.classList.remove('stream-ready')

    const markReady = () => {
      setIsLoading(false)
      // Small delay so the shimmer fade-out and video fade-in overlap nicely
      requestAnimationFrame(() => {
        video.classList.add('stream-ready')
      })
    }

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        markReady()
        if (autoplay) {
          video.play().catch(() => {
            /* browser may block autoplay */
          })
        }
      })
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad()
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError()
          }
        }
      })
      hlsRef.current = hls

      return () => {
        hls.destroy()
        hlsRef.current = null
      }
    } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        markReady()
        if (autoplay) video.play().catch(() => {})
      })
    } else {
      // Native playback (MP4, WebM, etc.)
      video.src = src
      video.addEventListener('loadeddata', () => {
        markReady()
        if (autoplay) video.play().catch(() => {})
      })
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy()
    }
  }, [src, isHls, autoplay])

  // Sync playing state with video element events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
    if (!video.muted && volume === 0) {
      video.volume = 0.5
      setVolume(0.5)
    }
  }, [volume])

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const v = parseFloat(e.target.value)
    video.volume = v
    video.muted = v === 0
    setVolume(v)
    setIsMuted(v === 0)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    } else {
      container.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    }
  }, [])

  // Listen for fullscreen changes (e.g. Escape key)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`stream-player group ${fluid ? 'aspect-video' : ''} ${className}`}
    >
      <video
        ref={videoRef}
        muted={muted}
        playsInline
        className="h-full w-full object-cover"
      />

      {/* Loading shimmer — crossfades out as video fades in */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-crust transition-opacity duration-500"
        style={{ opacity: isLoading ? 1 : 0, pointerEvents: isLoading ? 'auto' : 'none' }}
      >
        <div
          className="h-full w-full bg-gradient-to-r from-crust via-surface0 to-crust bg-[length:200%_100%]"
          style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
        />
      </div>

      {/* LIVE badge */}
      {live && <LiveBadge className="absolute top-3 left-3 z-10" />}

      {/* Custom controls */}
      {controls && (
        <div className="stream-controls">
          <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <div className="volume-group flex items-center">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className="volume-slider">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="ml-1 w-14"
                aria-label="Volume"
              />
            </div>
          </div>

          <div className="flex-1" />

          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      )}
    </div>
  )
}
