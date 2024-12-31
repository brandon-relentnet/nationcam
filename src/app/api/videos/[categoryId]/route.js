import db from '@/lib/db';

export async function GET(req, context) {
    const { params } = context; // Extract params from context
    const { categoryId } = await params; // Await params to resolve categoryId

    try {
        // Query videos based on the category ID
        const [videos] = await db.query(
            'SELECT * FROM videos WHERE category_id = ?',
            [categoryId]
        );
        return new Response(JSON.stringify(videos || []), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return new Response(JSON.stringify([]), { status: 500 });
    }
}
