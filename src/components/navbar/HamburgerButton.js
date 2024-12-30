// HamburgerButton.jsx
'use client';

import { FiMenu, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const iconVariants = {
    open: { rotate: 90, scale: 1.2, transition: { duration: 0.3 } },
    closed: { rotate: 0, scale: 1, transition: { duration: 0.3 } },
};

export default function HamburgerButton({ menuOpen, toggleMenu }) {
    return (
        <button
            className="block text-4xl md:hidden p-2 text-text hover:text-subtext0 transition"
            onClick={toggleMenu}
            aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
        >
            <motion.div
                variants={iconVariants}
                animate={menuOpen ? 'open' : 'closed'}
            >
                {menuOpen ? <FiX /> : <FiMenu />}
            </motion.div>
        </button>
    );
}