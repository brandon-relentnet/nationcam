interface AdvertisementLayoutProps {
  children: React.ReactNode
  leftAd?: string
  rightAd?: string
}

export default function AdvertisementLayout({
  children,
  leftAd = '/ads/left-banner.webp',
  rightAd = '/ads/right-banner.webp',
}: AdvertisementLayoutProps) {
  return (
    <>
      {/* Mobile top banner */}
      <div className="flex justify-center py-2 lg:hidden">
        <img
          src="/ads/mobile-banner.webp"
          alt="Advertisement"
          className="h-auto max-w-full"
        />
      </div>

      <div className="flex gap-4">
        {/* Desktop left sidebar */}
        <aside className="hidden w-40 flex-shrink-0 lg:block">
          <div className="sticky top-28">
            <img src={leftAd} alt="Advertisement" className="w-full" />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>

        {/* Desktop right sidebar */}
        <aside className="hidden w-40 flex-shrink-0 lg:block">
          <div className="sticky top-28">
            <img src={rightAd} alt="Advertisement" className="w-full" />
          </div>
        </aside>
      </div>

      {/* Mobile bottom banner */}
      <div className="flex justify-center py-2 lg:hidden">
        <img
          src="/ads/mobile-banner.webp"
          alt="Advertisement"
          className="h-auto max-w-full"
        />
      </div>
    </>
  )
}
