export default function AdvertisementLayout({ children, leftAd, rightAd }) {
    return (
        <div className="flex flex-col lg:flex-row mt-20">
            {/* Top Advertisement (Mobile/Tablet) */}
            <div className="lg:hidden w-full">
                {leftAd || (
                    <div className="p-4">
                        <img src="/ads/mobile-banner.png" alt="Top Ad" className="w-full" />
                    </div>
                )}
            </div>

            {/* Left Sidebar (Desktop) */}
            <aside className="hidden lg:block sticky top-40 h-screen overflow-y-auto">
                {leftAd || (
                    <div className="p-4">
                        <img src="/ads/left-banner.png" alt="Left Ad" className="w-full" />
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-4">{children}</main>

            {/* Right Sidebar (Desktop) */}
            <aside className="hidden lg:block sticky top-40 h-screen overflow-y-auto">
                {rightAd || (
                    <div className="p-4">
                        <img src="/ads/right-banner.png" alt="Right Ad" className="w-full" />
                    </div>
                )}
            </aside>

            {/* Bottom Advertisement (Mobile/Tablet) */}
            <div className="lg:hidden w-full">
                {rightAd || (
                    <div className="p-4">
                        <img src="/ads/mobile-banner.png" alt="Bottom Ad" className="w-full" />
                    </div>
                )}
            </div>
        </div>
    );
}
