import dynamic from 'next/dynamic';

const AddVideoClient = dynamic(() => import('./AddVideoClient'));

export default function AdminPage() {
    return (
        <AddVideoClient />
    );
}
