'use client';

import { useEffect, useState } from 'react';

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (!res.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await res.json();
                setUsers(data.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUsers();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Users</h2>
            <ul>
                {users.map((user, index) => (
                    <li key={user.id || index}> {/* Fallback to `index` if `id` is missing */}
                        <strong>{user.name}</strong> - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}
