'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

const Logo = () => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Ensure the component is only rendered after the theme is mounted
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Link href="/" passHref>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded cursor-pointer ${theme === "dark" ? "bg-accent" : ""}`}
            >
                <Image
                    src="/logos/nc_default_logo.webp"
                    alt="Houz2Home Logo"
                    width={250}
                    height={223}
                    style={{ width: "100%", height: "auto" }}
                />
            </motion.div>
        </Link>
    );
};

export default Logo;
