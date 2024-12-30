'use client';

import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Socials() {
    return (
        <div>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <a href="https://github.com/brandon-relentnet/responsive-website-template" aria-label="github link">
                    <FaGithub className="text-3xl text-text hover:text-subtext0" />
                </a>
            </motion.div>
        </div>
    );
}