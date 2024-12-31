'use client';

import { motion, useScroll } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ScrollProgressBar() {
    const { scrollYProgress } = useScroll();
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
        };

        // Listen for the scroll event
        window.addEventListener('scroll', handleScroll, { once: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <motion.div
            className={`fixed top-20 left-0 right-0 h-1 bg-accent transform-origin-[0%] transition-opacity duration-300 ${isScrolling ? 'opacity-100' : 'opacity-0'
                }`}
            style={{ scaleX: scrollYProgress }}
        />
    );
}
