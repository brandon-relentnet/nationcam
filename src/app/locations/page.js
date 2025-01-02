import dynamic from "next/dynamic";

// Dynamically import the client-side component
const LocationsClient = dynamic(() => import("./LocationsClient"));

export default function LocationsPage() {
    return (
        <div className="page-container">
            <h1 className="mb-4">Locations</h1>
            {/* Render the client-side component */}
            <LocationsClient />
        </div>
    );
}
