import db from '@/lib/db';

export async function GET(req, context) {
    const { params } = context; // Extract params from context
    const { stateId } = params; // Get the stateId from the route parameters

    try {
        // Parse query parameters for sublocation_id if provided
        const url = new URL(req.url);
        const sublocationId = url.searchParams.get('sublocation_id');

        let query = 'SELECT * FROM videos WHERE state_id = ?';
        const queryParams = [stateId];

        if (sublocationId) {
            query += ' AND sublocation_id = ?';
            queryParams.push(sublocationId);
        }

        // Fetch videos based on state_id and optional sublocation_id
        const [videos] = await db.query(query, queryParams);

        return new Response(JSON.stringify(videos || []), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
