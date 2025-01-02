"use client";

import { FaCog } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Settings() {
    return (
        <Link href="/admin" passHref>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <FaCog className="text-3xl text-text hover:text-subtext0" />
            </motion.div>
        </Link>
    );
}