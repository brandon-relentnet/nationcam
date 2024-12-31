import db from '@/lib/db';

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove special characters
}

export async function GET() {
    try {
        // Fetch categories with video count
        const [categories] = await db.query(`
            SELECT 
                c.*, 
                (SELECT COUNT(*) FROM videos v WHERE v.category_id = c.category_id) AS video_count
            FROM categories c
        `);

        // Add slugs dynamically
        const categoriesWithSlugs = categories.map((category) => ({
            ...category,
            slug: generateSlug(category.name),
        }));

        return new Response(JSON.stringify({ success: true, data: categoriesWithSlugs }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
