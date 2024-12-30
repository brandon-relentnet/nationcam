'use client';

import { useEffect, useState } from 'react';

export default function CategoriesList() {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (!res.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data = await res.json();
                setCategories(data.data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchCategories();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Categories</h2>
            <ul>
                {categories.map((category, index) => (
                    <li key={category.id || index}> {/* Fallback to `index` if `id` is missing */}
                        {category.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
