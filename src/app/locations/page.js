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
                // console.log('Categories data:', result);
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
        <div className="page-container">
            <h1 className="mb-4">Locations</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.category_id}
                        href={`/locations/${category.slug}`}
                        className={`block p-4 rounded shadow-md border-2 border-transparent hover:border-accent transition duration-300 ${category.video_count > 0
                            ? 'bg-surface0 text-accent'
                            : 'bg-mantle text-subtext1'
                            }`}
                    >
                        <div>
                            <span className="font-semibold text-lg hover:underline block">
                                {category.name}
                            </span>
                            <p className="text-sm text-subtext0">
                                {category.video_count > 0
                                    ? `${category.video_count} video(s) available`
                                    : 'Coming soon...'}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
