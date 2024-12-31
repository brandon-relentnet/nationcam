import db from '@/lib/db';

export async function fetchFromTable(tableName) {
    try {
        const [rows] = await db.query(`SELECT * FROM ??`, [tableName]);
        return new Response(JSON.stringify({ success: true, data: rows }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
