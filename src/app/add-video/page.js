"use client";

import { useEffect, useState } from "react";
import AddVideoForm from "./AddVideoForm";
import AddStateForm from "./AddStateForm";
import AddSublocationForm from "./AddSublocationForm";

export default function AddVideoPage() {
    const [states, setStates] = useState([]);
    const [sublocations, setSublocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch states
                const statesRes = await fetch("/api/states");
                const statesData = await statesRes.json();

                if (!statesData.success) {
                    throw new Error("Failed to fetch states");
                }

                setStates(statesData.data);

                // Fetch sublocations
                const sublocationsRes = await fetch("/api/sublocations");
                const sublocationsData = await sublocationsRes.json();

                if (!sublocationsData.success) {
                    throw new Error("Failed to fetch sublocations");
                }

                setSublocations(sublocationsData.data);
            } catch (err) {
                console.error(err);
                setError("Error loading data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red">{error}</p>;
    }

    return (
        <>
            <AddVideoForm states={states} sublocations={sublocations} />
            <AddStateForm />
            <AddSublocationForm />
        </>
    );
}
