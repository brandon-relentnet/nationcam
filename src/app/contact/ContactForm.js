"use client";

import { useState } from "react";
import Dropdown from "@/components/Dropdown";

const STATUS_OPTIONS = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
];

export default function ContactForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        cameras: "",
        status: "",
        streetAddress: "",
        addressLine2: "", // Optional
        city: "",
        state: "",
        postalCode: "",
        country: "",
        timeline: "",
    });

    const [formMessage, setFormMessage] = useState(""); // Message for validation feedback

    const handleStatusSelect = (value) => {
        setFormData((prev) => ({ ...prev, status: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: Check all required fields (excluding Address Line 2)
        const requiredFields = { ...formData };
        delete requiredFields.addressLine2; // Address Line 2 is optional
        const isFormValid = Object.values(requiredFields).every((value) => value.trim() !== "");

        if (isFormValid) {
            setFormMessage("Successfully submitted!");
        } else {
            setFormMessage("Please fill in all required fields.");
        }
    };

    return (
        <section className="w-full mb-16">
            <div className="max-w-4xl mx-auto px-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* First Name */}
                    <div>
                        <label className="block font-semibold mb-1">
                            First Name <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter your first name"
                            className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block font-semibold mb-1">
                            Last Name <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter your last name"
                            className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                        />
                    </div>

                    {/* Number of Cameras */}
                    <div>
                        <label className="block font-semibold mb-1">
                            How many cameras are you wanting? <span className="text-red">*</span>
                        </label>
                        <input
                            type="number"
                            name="cameras"
                            value={formData.cameras}
                            onChange={handleInputChange}
                            placeholder="Enter the number of cameras"
                            className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                        />
                    </div>

                    {/* Internet Access */}
                    <div>
                        <label className="block font-semibold mb-1">
                            Is there an internet (ethernet) line with access to the internet?{" "}
                            <span className="text-red">*</span>
                        </label>
                        <Dropdown
                            options={STATUS_OPTIONS}
                            onSelect={handleStatusSelect}
                            label="Select status"
                            selectedValue={formData.status}
                        />
                    </div>

                    {/* Address Fields */}
                    <div>
                        <label className="block font-semibold mb-1">
                            Street Address <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            placeholder="Enter the street address"
                            className="mb-2 w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                        />
                        <label className="block font-semibold mb-1">
                            Address Line 2 <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            placeholder="Enter additional address information"
                            className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                        />
                    </div>

                    {/* Split Row Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold mb-1">
                                City <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="Enter the city"
                                className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">
                                State / Region / Province <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="Enter state/region/province"
                                className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">
                                Postal / Zip Code <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                placeholder="Enter postal/zip code"
                                className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">
                                Country <span className="text-red">*</span>
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Enter the country"
                                className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                            />
                        </div>
                    </div>

                    {/* Installation Timeline */}
                    <div>
                        <label className="block font-semibold mb-1">
                            How soon can we install? <span className="text-red">*</span>
                        </label>
                        <input
                            type="text"
                            name="timeline"
                            value={formData.timeline}
                            onChange={handleInputChange}
                            placeholder="Enter a timeline"
                            className="w-full bg-surface1 hover:bg-surface2 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="inline-block bg-accent text-base font-semibold px-6 py-3 rounded-lg hover:opacity-60 transition-opacity duration-300"
                        >
                            Submit
                        </button>
                    </div>
                </form>

                {/* Form Message */}
                {formMessage && (
                    <p
                        className={`text-center mt-4 font-semibold ${formMessage === "Successfully submitted!"
                            ? "text-green"
                            : "text-red"
                            }`}
                    >
                        {formMessage}
                    </p>
                )}
            </div>
        </section>
    );
}
