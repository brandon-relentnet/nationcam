import db from '@/lib/db';

export async function GET(req) {
    const url = new URL(req.url);
    const sublocationId = url.searchParams.get("sublocation_id");

    try {
        let query = `
            SELECT v.*, s.name AS state_name, sub.name AS sublocation_name
            FROM videos v
            LEFT JOIN states s ON v.state_id = s.state_id
            LEFT JOIN sublocations sub ON v.sublocation_id = sub.sublocation_id
        `;
        const params = [];

        if (sublocationId) {
            query += ` WHERE v.sublocation_id = ?`;
            params.push(sublocationId);
        }

        const [videos] = await db.query(query, params);

        return new Response(
            JSON.stringify({ success: true, data: videos }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error("Error fetching videos:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Failed to fetch videos." }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { title, src, type, state_id, sublocation_id, status } = data;

        if (!title || !src || !type || !status) {
            return new Response(
                JSON.stringify({ success: false, message: "Missing required fields." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await db.query(
            `
            INSERT INTO videos (title, src, type, state_id, sublocation_id, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `,
            [title, src, type, state_id || null, sublocation_id || null, status]
        );

        return new Response(
            JSON.stringify({ success: true, message: "Video added successfully." }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error("Error adding video:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Failed to add video." }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
