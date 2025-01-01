"use client";

import { useState } from "react";
import Dropdown from "@/components/Dropdown";

const VIDEO_TYPES = [
    { label: "MP4", value: "video/mp4" },
    { label: "WebM", value: "video/webm" },
    { label: "Ogg", value: "video/ogg" },
    { label: "HLS (m3u8)", value: "application/x-mpegURL" },
    { label: "DASH (mpd)", value: "application/dash+xml" },
];

const STATUS_OPTIONS = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

export default function AddVideoForm({ states, sublocations }) {
    const [formData, setFormData] = useState({
        title: "",
        src: "",
        type: "",
        state_id: "",
        sublocation_id: "",
        status: "active",
    });

    const [filteredSublocations, setFilteredSublocations] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStateSelect = (value) => {
        setFormData((prev) => ({ ...prev, state_id: value, sublocation_id: "" }));
        setFilteredSublocations(
            sublocations.filter((sublocation) => sublocation.state_id.toString() === value)
        );
    };

    const handleSublocationSelect = (value) => {
        setFormData((prev) => ({ ...prev, sublocation_id: value }));
    };

    const handleTypeSelect = (value) => {
        setFormData((prev) => ({ ...prev, type: value }));
    };

    const handleStatusSelect = (value) => {
        setFormData((prev) => ({ ...prev, status: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/videos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (result.success) {
                setSuccessMessage("Video added successfully!");
                setFormData({
                    title: "",
                    src: "",
                    type: "",
                    state_id: "",
                    sublocation_id: "",
                    status: "active",
                });
                setFilteredSublocations([]);
            } else {
                setErrorMessage(result.message || "An error occurred.");
            }
        } catch (error) {
            console.error("Error adding video:", error);
            setErrorMessage("An error occurred.");
        }
    };

    return (
        <div className="page-container">
            <form onSubmit={handleSubmit} className="space-y-4 section-container">
                <div>
                    <label className="block font-semibold mb-1" htmlFor="title">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="src">
                        Video Source (URL)
                    </label>
                    <input
                        type="url"
                        id="src"
                        name="src"
                        value={formData.src}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Video Type</label>
                    <Dropdown
                        options={VIDEO_TYPES}
                        onSelect={handleTypeSelect}
                        label="Select a video type"
                        selectedValue={formData.type}
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">State</label>
                    <Dropdown
                        options={states.map((state) => ({
                            label: state.name,
                            value: state.state_id.toString(),
                        }))}
                        onSelect={handleStateSelect}
                        label="Select a state"
                        selectedValue={formData.state_id}
                    />
                </div>
                {filteredSublocations.length > 0 && (
                    <div>
                        <label className="block font-semibold mb-1">Sublocation</label>
                        <Dropdown
                            options={filteredSublocations.map((sublocation) => ({
                                label: sublocation.name,
                                value: sublocation.sublocation_id.toString(),
                            }))}
                            onSelect={handleSublocationSelect}
                            label="Select a sublocation"
                            selectedValue={formData.sublocation_id}
                        />
                    </div>
                )}
                <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <Dropdown
                        options={STATUS_OPTIONS}
                        onSelect={handleStatusSelect}
                        label="Select status"
                        selectedValue={formData.status}
                    />
                </div>
                {successMessage && <p className="text-green">{successMessage}</p>}
                {errorMessage && <p className="text-red">{errorMessage}</p>}
                <button
                    type="submit"
                    className="bg-accent text-base p-2 rounded hover:bg-accent/5"
                >
                    Add Video
                </button>
            </form>
        </div>
    );
}
