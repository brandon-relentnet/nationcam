"use client";

import LocationsHeroSection from "../LocationsHeroSection";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

const VideoPlayer = dynamic(() => import("@/components/videos/VideoPlayer"), {
    ssr: false,
});

export default function StateClient({ slug }) {
    const [videos, setVideos] = useState([]);
    const [stateName, setStateName] = useState("");
    const [sublocations, setSublocations] = useState([]);
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

                        // Fetch sublocations for the state
                        const subRes = await fetch("/api/sublocations");
                        const subData = await subRes.json();
                        const filteredSublocations = subData.data.filter(
                            (sub) => sub.state_id === state.state_id
                        );

                        setSublocations(filteredSublocations);
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
                {sublocations.map((sub) => (
                    <div key={sub.sublocation_id} className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">
                            <Link href={`/locations/${slug}/${sub.slug}`} className="text-accent hover:underline">
                                {sub.name}
                            </Link>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            {videos
                                .filter((video) => video.sublocation_id === sub.sublocation_id)
                                .map((video) => (
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
                    </div>
                ))}
                {videos.filter((video) => !video.sublocation_id).length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Uncategorized Videos</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            {videos
                                .filter((video) => !video.sublocation_id)
                                .map((video) => (
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
                    </div>
                )}
            </div>
        </>
    );
}
