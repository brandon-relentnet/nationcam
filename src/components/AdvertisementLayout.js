import Image from "next/image";

export default function AdvertisementLayout({ children, leftAd, rightAd }) {
    return (
        <div className="flex flex-col lg:flex-row mt-20">
            {/* Top Advertisement (Mobile/Tablet) */}
            <div className="lg:hidden w-full">
                {leftAd || (
                    <div className="p-4">
                        <Image
                            src="/ads/mobile-banner.webp"
                            alt="Top Ad"
                            width={1200}
                            height={300}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                )}
            </div>

            {/* Left Sidebar (Desktop) */}
            <aside className="hidden lg:block sticky top-40 h-screen overflow-y-auto">
                {leftAd || (
                    <div className="p-4">
                        <Image
                            src="/ads/left-banner.webp"
                            alt="Left Ad"
                            width={300}
                            height={900}
                            className="w-full h-auto"
                        />
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-4">{children}</main>

            {/* Right Sidebar (Desktop) */}
            <aside className="hidden lg:block sticky top-40 h-screen overflow-y-auto">
                {rightAd || (
                    <div className="p-4">
                        <Image
                            src="/ads/right-banner.webp"
                            alt="Right Ad"
                            width={300}
                            height={900}
                            className="w-full h-auto"
                        />
                    </div>
                )}
            </aside>

            {/* Bottom Advertisement (Mobile/Tablet) */}
            <div className="lg:hidden w-full">
                {rightAd || (
                    <div className="p-4">
                        <Image
                            src="/ads/mobile-banner.webp"
                            alt="Bottom Ad"
                            width={1200}
                            height={300}
                            className="w-full h-auto"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
