export default function RoadMap() {
    return (
        <section className="w-full mb-40">
            <div className="max-w-6xl mx-auto px-8">
                {/* Section Heading */}
                <div className="text-center mb-4">
                    <h3 className="text-sm text-subtext0 tracking-wide uppercase">Road Map</h3>
                    <h2>Our Planned Network</h2>
                </div>

                {/* Description */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <p>
                        We are looking to team up with local businesses and government agencies like tourism departments
                        to showcase the best this country and each state has to offer.
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stat 1 */}
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-accent rounded-lg">
                        <h3 className="text-5xl font-bold text-accent mb-4">1250</h3>
                        <p className="text-center">
                            We are planning for <strong>1,250 cameras</strong> across the nation
                        </p>
                    </div>

                    {/* Stat 2 */}
                    <div className="flex flex-col items-center justify-center p-6 bg-surface0 rounded-lg">
                        <h3 className="text-5xl font-bold mb-4">50</h3>
                        <p className="text-center">In all 50 States!</p>
                    </div>

                    {/* Stat 3 */}
                    <div className="flex flex-col items-center justify-center p-6 bg-accent rounded-lg">
                        <h3 className="text-5xl font-bold text-surface0 mb-4">25</h3>
                        <p className="!text-surface1 text-center">
                            Starting with <strong>25 in Louisiana</strong>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
