"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LocationsPage() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const result = await res.json();
                console.log('Categories data:', result); // Log API response
                if (result.success && Array.isArray(result.data)) {
                    setCategories(result.data);
                } else {
                    setCategories([]);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div>
            <h1>Locations</h1>
            <ul>
                {categories.map((category) => (
                    <li key={category.category_id}>
                        <Link href={`/locations/${category.slug}`}>
                            {category.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
