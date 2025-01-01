import db from '@/lib/db';

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove special characters
}

export async function GET() {
    try {
        // Fetch states with video count
        const [states] = await db.query(`
            SELECT 
                s.*, 
                (SELECT COUNT(*) FROM videos v WHERE v.state_id = s.state_id) AS video_count
            FROM states s
        `);

        // Add slugs dynamically
        const statesWithSlugs = states.map((state) => ({
            ...state,
            slug: generateSlug(state.name),
        }));

        return new Response(JSON.stringify({ success: true, data: statesWithSlugs }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching states:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { name, description } = data;

        // Validate required fields
        if (!name) {
            return new Response(
                JSON.stringify({ success: false, message: "State name is required." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Insert state into the database
        const [result] = await db.query(
            `INSERT INTO states (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
            [name, description || null]
        );

        return new Response(
            JSON.stringify({ success: true, message: "State added successfully." }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error adding state:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}