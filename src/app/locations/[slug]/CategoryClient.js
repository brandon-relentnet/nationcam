"use client";

import LocationsHeroSection from "../LocationsHeroSection";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const VideoPlayer = dynamic(() => import("@/components/videos/VideoPlayer"), {
    ssr: false,
});

export default function CategoryClient({ slug }) {
    const [videos, setVideos] = useState([]);
    const [stateName, setStateName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        async function fetchData() {
            try {
                // Fetch states to resolve slug to state_id
                const statesRes = await fetch("/api/states");
                const statesData = await statesRes.json();

                if (statesData.success && Array.isArray(statesData.data)) {
                    const state = statesData.data.find((s) => s.slug === slug);
                    if (state) {
                        setStateName(state.name);

                        // Fetch videos using state_id
                        const vidRes = await fetch(`/api/videos/${state.state_id}`);
                        const vidData = await vidRes.json();

                        console.log("Fetched videos:", vidData); // Debug videos
                        setVideos(Array.isArray(vidData) ? vidData : []);
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [slug]);

    if (loading) {
        return <div>Loading state & videos...</div>;
    }

    return (
        <>
            <LocationsHeroSection title={stateName} slug={slug} alt={stateName} />
            <div className="page-container">
                {videos.length > 0 ? (
                    <>
                        <h2 className="mb-4">Here are some of our Local Cameras!</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 section-container">
                            {videos.map((video) => (
                                <div key={video.video_id}>
                                    <h3>{video.title}</h3>
                                    <VideoPlayer
                                        options={{
                                            controls: true,
                                            responsive: true,
                                            fluid: true,
                                            autoplay: true,
                                            muted: true,
                                            sources: [
                                                {
                                                    src: video.src,
                                                    type: video.type || "video/mp4",
                                                },
                                            ],
                                            className: "rounded",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>No videos available for this location.</p>
                )}
            </div>
        </>
    );
}
