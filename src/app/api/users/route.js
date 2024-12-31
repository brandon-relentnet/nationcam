import { fetchFromTable } from '@/lib/apiHelper';

export async function GET() {
    return fetchFromTable('users');
}
