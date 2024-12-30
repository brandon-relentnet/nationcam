import db from '@/lib/db';

export async function GET() {
    try {
        console.log('Connecting to the database...');
        const [rows] = await db.query('SELECT * FROM categories');
        console.log('Query successful:', rows);

        return new Response(JSON.stringify({ success: true, data: rows }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Database query error:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
