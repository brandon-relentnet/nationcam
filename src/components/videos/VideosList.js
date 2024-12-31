'use client';

import { useEffect, useState } from 'react';

export default function VideosList() {
    const [videos, setVideos] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch('/api/videos');
                if (!res.ok) {
                    throw new Error('Failed to fetch videos');
                }
                const data = await res.json();
                setVideos(data.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchVideos();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Videos</h2>
            <ul>
                {videos.map((video, index) => (
                    <li key={video.id || index}> {/* Fallback to `index` if `id` is missing */}
                        <strong>{video.title}</strong> - {video.src}
                    </li>
                ))}
            </ul>
        </div>
    );
}
