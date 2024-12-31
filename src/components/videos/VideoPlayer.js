"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function VideoPlayer({ options }) {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (!videoRef.current) {
            console.error("Video element not available in the DOM.");
            return;
        }

        // 1. Initialize Video.js
        playerRef.current = videojs(videoRef.current, options, () => {
            console.log("Player is ready");
        });

        // 2. Cleanup on unmount
        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [options]);

    return (
        <div data-vjs-player>
            <video
                ref={videoRef}
                className="video-js vjs-default-skin"
                playsInline
            />
        </div>
    );
}
