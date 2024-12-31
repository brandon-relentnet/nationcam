import AddVideoForm from "./AddVideoForm";
import db from "@/lib/db";

export default async function AddVideoPage() {
    let categories = [];

    try {
        const [rows] = await db.query("SELECT * FROM categories");
        categories = rows;
    } catch (error) {
        console.error("Error fetching categories:", error);
    }

    return (
        <div className="page-container">
            <h1 className="mb-4">Add a New Video</h1>
            <AddVideoForm categories={categories} />
        </div>
    );
}
