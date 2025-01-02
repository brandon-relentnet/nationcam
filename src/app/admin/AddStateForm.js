"use client";

import { useState } from "react";

export default function AddStateForm() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/states", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (result.success) {
                setSuccessMessage("State added successfully!");
                setFormData({ name: "", description: "" });
            } else {
                setErrorMessage(result.message || "An error occurred.");
            }
        } catch (error) {
            console.error("Error adding state:", error);
            setErrorMessage("An error occurred.");
        }
    };

    return (
        <div className="page-container">
            <h2 className="mb-2">States</h2>
            <form onSubmit={handleSubmit} className="space-y-4 section-container">
                <div>
                    <label className="block font-semibold mb-1" htmlFor="name">
                        State Name
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
                {successMessage && <p className="text-green">{successMessage}</p>}
                {errorMessage && <p className="text-red">{errorMessage}</p>}
                <button
                    type="submit"
                    className="bg-surface1 text-subtext0 hover:text-base p-2 rounded hover:bg-accent transition duration-300"
                >
                    Add State
                </button>
            </form>
        </div>
    );
}
