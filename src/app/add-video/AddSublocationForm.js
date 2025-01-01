"use client";

import { useState, useEffect } from "react";
import Dropdown from "@/components/Dropdown";

export default function AddSublocationForm() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        state_id: "",
    });
    const [states, setStates] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const res = await fetch("/api/states");
                const result = await res.json();

                if (result.success && Array.isArray(result.data)) {
                    setStates(result.data);
                }
            } catch (err) {
                console.error("Error fetching states:", err);
            }
        };

        fetchStates();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStateSelect = (value) => {
        setFormData((prev) => ({ ...prev, state_id: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/sublocations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (result.success) {
                setSuccessMessage("Sublocation added successfully!");
                setFormData({ name: "", description: "", state_id: "" });
            } else {
                setErrorMessage(result.message || "An error occurred.");
            }
        } catch (error) {
            console.error("Error adding sublocation:", error);
            setErrorMessage("An error occurred.");
        }
    };

    return (
        <div className="page-container">
            <form onSubmit={handleSubmit} className="space-y-4 section-container">
                <div>
                    <label className="block font-semibold mb-1" htmlFor="name">
                        Sublocation Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
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
                {successMessage && <p className="text-green">{successMessage}</p>}
                {errorMessage && <p className="text-red">{errorMessage}</p>}
                <button
                    type="submit"
                    className="bg-accent text-base p-2 rounded hover:bg-accent/5"
                >
                    Add Sublocation
                </button>
            </form>
        </div>
    );
}
