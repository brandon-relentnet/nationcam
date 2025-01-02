'use client';

import Image from "next/image";
import { motion } from "framer-motion";

const Logo = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Image
                src="/logos/nc_default_hero.png"
                alt="Houz2Home Logo"
                width={250}
                height={223}
                style={{ width: "100%", height: "auto" }}
            />
        </motion.div>
    );
};

export default Logo;