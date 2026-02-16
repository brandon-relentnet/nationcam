interface AdvertisementLayoutProps {
  children: React.ReactNode
}

export default function AdvertisementLayout({
  children,
}: AdvertisementLayoutProps) {
  return (
    <div className="relative flex justify-center gap-6">
      {/* Left sidebar ad — desktop only */}
      <aside className="sticky top-20 hidden h-fit w-36 shrink-0 xl:block">
        <div className="overflow-hidden rounded-lg border border-overlay0/30 opacity-60 transition-opacity hover:opacity-100">
          <img
            src="/ads/left-banner.webp"
            alt="Advertisement"
            className="w-full"
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">{children}</div>

      {/* Right sidebar ad — desktop only */}
      <aside className="sticky top-20 hidden h-fit w-36 shrink-0 xl:block">
        <div className="overflow-hidden rounded-lg border border-overlay0/30 opacity-60 transition-opacity hover:opacity-100">
          <img
            src="/ads/right-banner.webp"
            alt="Advertisement"
            className="w-full"
          />
        </div>
      </aside>

      {/* Mobile banners */}
      <div className="fixed right-0 bottom-0 left-0 z-30 xl:hidden">
        <div className="mx-auto max-w-md border-t border-overlay0/30 bg-mantle/90 p-2 backdrop-blur-sm">
          <img
            src="/ads/mobile-banner.webp"
            alt="Advertisement"
            className="mx-auto h-12 object-contain"
          />
        </div>
      </div>
    </div>
  )
}
