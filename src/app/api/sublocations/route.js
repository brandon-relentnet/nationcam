import db from '@/lib/db';

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove special characters
}

export async function GET() {
    try {
        // Fetch sublocations with video count and their parent state name
        const [sublocations] = await db.query(`
            SELECT 
                sub.*, 
                (SELECT COUNT(*) FROM videos v WHERE v.sublocation_id = sub.sublocation_id) AS video_count,
                st.name AS state_name
            FROM sublocations sub
            JOIN states st ON sub.state_id = st.state_id
        `);

        // Add slugs dynamically
        const sublocationsWithSlugs = sublocations.map((sublocation) => ({
            ...sublocation,
            slug: generateSlug(sublocation.name),
        }));

        return new Response(
            JSON.stringify({ success: true, data: sublocationsWithSlugs }),
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error fetching sublocations:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const { name, description, state_id } = data;

        // Validate required fields
        if (!name || !state_id) {
            return new Response(
                JSON.stringify({ success: false, message: "Missing required fields." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate slug
        const slug = generateSlug(name);

        // Insert sublocation into the database
        const [result] = await db.query(
            `INSERT INTO sublocations (name, description, state_id, slug, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [name, description || null, state_id, slug]
        );

        return new Response(
            JSON.stringify({ success: true, message: "Sublocation added successfully." }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error adding sublocation:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
