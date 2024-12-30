import db from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await db.query('SELECT * FROM videos');
        return new Response(JSON.stringify({ success: true, data: rows }), {
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
