"use client";

import LocationsHeroSection from "../../LocationsHeroSection";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const VideoPlayer = dynamic(() => import("@/components/videos/VideoPlayer"), {
    ssr: false,
});

export default function SublocationClient({ stateSlug, sublocationSlug }) {
    const [videos, setVideos] = useState([]);
    const [sublocationName, setSublocationName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!stateSlug || !sublocationSlug) return;

        async function fetchData() {
            try {
                const subRes = await fetch("/api/sublocations");
                const subData = await subRes.json();

                console.log("Sublocations Data:", subData); // Debugging

                if (subData.success && Array.isArray(subData.data)) {
                    const sublocation = subData.data.find((s) => s.slug === sublocationSlug);
                    console.log("Matched Sublocation:", sublocation); // Debugging

                    if (sublocation) {
                        setSublocationName(sublocation.name);

                        // Fetch videos for this sublocation
                        const vidRes = await fetch(`/api/videos?sublocation_id=${sublocation.sublocation_id}`);
                        const vidData = await vidRes.json();

                        console.log("Fetched Videos:", vidData); // Debugging
                        setVideos(Array.isArray(vidData.data) ? vidData.data : []);
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [stateSlug, sublocationSlug]);

    if (loading) {
        return <div>Loading sublocation & videos...</div>;
    }

    console.log("State Slug:", stateSlug);
    console.log("Sublocation Slug:", sublocationSlug);


    return (
        <>
            <LocationsHeroSection title={sublocationName} slug={sublocationSlug} alt={sublocationName} />
            <div className="page-container">
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        {videos.map((video) => (
                            <div key={video.video_id}>
                                <h4>{video.title}</h4>
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
                ) : (
                    <p>No videos available for this sublocation.</p>
                )}
            </div>
        </>
    );
}
