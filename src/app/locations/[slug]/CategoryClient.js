"use client";

import LocationsHeroSection from "../LocationsHeroSection";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const VideoPlayer = dynamic(() => import("@/components/videos/VideoPlayer"), {
    ssr: false,
});

export default function CategoryClient({ slug }) {
    const [videos, setVideos] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        async function fetchData() {
            try {
                // Fetch categories to resolve slug to category_id
                const catRes = await fetch("/api/categories");
                const catData = await catRes.json();
                if (catData.success && Array.isArray(catData.data)) {
                    const category = catData.data.find((c) => c.slug === slug);
                    if (category) {
                        setCategoryName(category.name);

                        // Fetch videos using category_id
                        const vidRes = await fetch(`/api/videos/${category.category_id}`);
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
        return <div>Loading category & videos...</div>;
    }

    return (
        <>
            <LocationsHeroSection title={categoryName} slug={slug} alt={categoryName} />
            <div className="page-container">
                {videos.length > 0 ? (
                    videos.map((video) => (
                        <div key={video.video_id} style={{ marginBottom: "20px" }}>
                            <h3>{video.title}</h3>
                            <VideoPlayer
                                options={{
                                    controls: true,
                                    responsive: true,
                                    fluid: true,
                                    sources: [
                                        {
                                            src: video.src,
                                            type: video.type || "video/mp4",
                                        },
                                    ],
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <p>No videos available for this location.</p>
                )}
            </div>
        </>
    );
}
