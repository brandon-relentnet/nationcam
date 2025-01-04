import Logo from "@/components/Logo";
import VideoPlayer from "@/components/videos/VideoPlayer";

export default function HomeHeroSection() {
    return (
        <section className="w-full h-screen flex items-center justify-center relative">
            {/* Background Video */}
            <div className="bg-base opacity-70 w-full h-full absolute z-0">
                <video
                    src="/videos/nc_default_hero.webm"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-full"
                    aria-label="Background Video"
                />
            </div>

            {/* Content Section */}
            <div className="z-10 flex w-9/12 h-full items-center justify-center px-8 space-x-6">
                {/* Left Side: Text */}
                <div className="flex-1 text-left section-container">
                    <div className="w-1/2 mb-4">
                        <Logo />
                    </div>
                    <p>Welcome to NationCam, a website dedicated to showing some of the best views in the country while giving you a taste for the local culture and life.</p>
                    <p>Our network of cameras is slowly coming online so be sure to come back to see more.</p>
                    <a href="/locations" className="inline-block bg-accent text-base font-semibold px-6 py-3 rounded-lg hover:opacity-60 transition-opacity duration-300">
                        View All Locations
                    </a>
                </div>

                {/* Right Side: Video Player */}
                <div className="flex-1 justify-end hidden lg:flex">
                    <VideoPlayer
                        options={{
                            controls: true,
                            responsive: true,
                            fluid: true,
                            autoplay: true,
                            muted: true,
                            sources: [
                                {
                                    src: "https://streamer.nationcam.com/memfs/4cdb363f-2bfa-4a0a-b954-ac9b16200665.m3u8",
                                    type: "application/x-mpegURL",
                                },
                            ],
                            className: "rounded",
                        }}
                    />
                </div>
            </div>

            {/* SVG at the Bottom */}
            <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
                <svg
                    id="visual"
                    viewBox="0 0 900 600"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    className="w-full h-80"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 417L150 374L300 437L450 437L600 413L750 386L900 434L900 601L750 601L600 601L450 601L300 601L150 601L0 601Z"
                        className="fill-crust"
                    ></path>
                    <path
                        d="M0 453L150 470L300 502L450 452L600 486L750 433L900 491L900 601L750 601L600 601L450 601L300 601L150 601L0 601Z"
                        className="fill-mantle"
                    ></path>
                    <path
                        d="M0 495L150 519L300 519L450 517L600 543L750 519L900 532L900 601L750 601L600 601L450 601L300 601L150 601L0 601Z"
                        className="fill-base"
                    ></path>
                </svg>
            </div>
        </section>
    );
}