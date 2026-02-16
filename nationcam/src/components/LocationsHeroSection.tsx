import { useEffect, useState } from 'react'
import { assetExists } from '@/lib/utils'
import buttonRedirects from '@/lib/buttonRedirects'

interface LocationsHeroSectionProps {
  title: string
  slug: string
  alt?: string
}

export default function LocationsHeroSection({
  title,
  slug,
  alt,
}: LocationsHeroSectionProps) {
  const [videoSrc, setVideoSrc] = useState('/videos/nc_default_hero.webm')
  const [logoSrc, setLogoSrc] = useState('/logos/nc_default_logo.webp')
  const [buttonSrc, setButtonSrc] = useState<string | null>(null)

  useEffect(() => {
    async function checkAssets() {
      const customVideo = `/videos/nc_${slug}_hero.webm`
      const customLogo = `/logos/nc_${slug}_logo.webp`
      const customButton = `/buttons/nc_${slug}_button.webp`

      const [hasVideo, hasLogo, hasButton] = await Promise.all([
        assetExists(customVideo),
        assetExists(customLogo),
        assetExists(customButton),
      ])

      if (hasVideo) setVideoSrc(customVideo)
      if (hasLogo) setLogoSrc(customLogo)
      if (hasButton) setButtonSrc(customButton)
    }
    checkAssets()
  }, [slug])

  const redirectUrl = buttonRedirects[slug]

  return (
    <section className="relative overflow-hidden py-20">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoSrc} type="video/webm" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-crust/70" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
        <img
          src={logoSrc}
          alt={alt ?? `${title} Logo`}
          className="h-24 w-24 rounded-full object-cover"
        />
        <h1 className="text-white">{title}</h1>

        {buttonSrc && redirectUrl && (
          <a
            href={redirectUrl}
            target={redirectUrl.startsWith('http') ? '_blank' : undefined}
            rel={
              redirectUrl.startsWith('http') ? 'noopener noreferrer' : undefined
            }
          >
            <img
              src={buttonSrc}
              alt={`${title} sponsor`}
              className="h-12 rounded-lg"
            />
          </a>
        )}
      </div>

      {/* Decorative waves */}
      <div className="absolute right-0 bottom-0 left-0">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full"
        >
          <path
            d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z"
            className="fill-base"
          />
        </svg>
      </div>
    </section>
  )
}
