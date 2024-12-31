import db from "@/lib/db";

export async function POST(req) {
    try {
        const data = await req.json();
        const { title, src, type, category_id, status } = data;

        // Insert into the database
        const [result] = await db.query(
            `INSERT INTO videos (title, src, type, category_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [title, src, type, category_id, status]
        );

        return new Response(
            JSON.stringify({ success: true, message: "Video added successfully." }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error adding video:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Failed to add video." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
