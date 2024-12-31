import { motion } from "framer-motion";

export default function NavLinkItem({ href, currentPath, children, menuOpen }) {
    const isActive =
        href === "/" ? currentPath === href : currentPath.startsWith(href);

    return (
        <li>
            <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href={href}
                aria-label={`${children} link`}
                className={`block font-bold px-4 py-2 md:p-0 active:text-accent text-xl ${menuOpen ? "text-center" : ""
                    } ${isActive ? "text-accent hover:text-accent" : "hover:text-subtext0"}`}
            >
                {children}
            </motion.a>
        </li>
    );
}
