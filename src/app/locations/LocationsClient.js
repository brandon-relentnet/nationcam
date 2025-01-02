"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LocationsClient() {
    const [states, setStates] = useState([]);

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const res = await fetch("/api/states");
                const result = await res.json();

                if (result.success && Array.isArray(result.data)) {
                    setStates(result.data);
                } else {
                    setStates([]);
                }
            } catch (err) {
                console.error("Error fetching states:", err);
                setStates([]);
            }
        };

        fetchStates();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {states.map((state) => (
                <Link
                    key={state.state_id}
                    href={`/locations/${state.slug}`}
                    className={`block p-4 rounded shadow-md border-2 border-transparent hover:border-accent transition duration-300 ${state.video_count > 0
                        ? "bg-surface0 text-accent"
                        : "bg-mantle text-subtext1"
                        }`}
                >
                    <div>
                        <span className="font-semibold text-lg hover:underline block">
                            {state.name}
                        </span>
                        <p className="text-sm text-subtext0">
                            {state.video_count > 0
                                ? `${state.video_count} video(s) available`
                                : "Coming soon..."}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
