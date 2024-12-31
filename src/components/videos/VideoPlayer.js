"use client";

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'; // Import Video.js CSS

export default function VideoPlayer({ options }) {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        // Initialize Video.js player
        if (videoRef.current && !playerRef.current) {
            playerRef.current = videojs(videoRef.current, options, () => {
                console.log('Player is ready');
            });
        }

        return () => {
            // Dispose Video.js player on component unmount
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [options]);

    return (
        <div>
            <div data-vjs-player>
                <video ref={videoRef} className="video-js vjs-default-skin" />
            </div>
        </div>
    );
}
