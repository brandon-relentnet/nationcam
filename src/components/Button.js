"use client";

import { sendGAEvent } from '@next/third-parties/google'

export default function Button ({ href, label, value, type }) {
    return (
        <button
            type={type}
            onClick={() => sendGAEvent('event', 'buttonClicked', { value: value })}
            href={href || null}
            className="inline-block bg-accent text-base font-semibold px-6 py-3 rounded-lg hover:opacity-60 transition-opacity duration-300"
        >
            {label}
        </button>
    );
}