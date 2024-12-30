'use client';

import { motion, useScroll } from 'framer-motion';

export default function ScrollProgressBar() {
    const { scrollYProgress } = useScroll();

    return (
        <motion.div
            className="absolute top-20 left-0 right-0 h-1 bg-accent transform-origin-[0%]"
            style={{ scaleX: scrollYProgress }}
        />
    );
}