"use client";

import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google'

export default function Button({ href, label, value }) {
    return (
        <Link
            href={href}
            className="inline-block bg-accent text-base font-semibold px-6 py-3 rounded-lg hover:opacity-60 transition-opacity duration-300"
            onClick={() => sendGAEvent('event', 'buttonClicked', { value: value })}
        >
            {label}
        </Link>
    );
}