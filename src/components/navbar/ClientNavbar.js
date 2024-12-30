'use client';

import dynamic from "next/dynamic";
import { useState } from 'react';

const HamburgerButton = dynamic(() => import('./HamburgerButton'));
const NavLinks = dynamic(() => import('./NavLinks'));


export default function ClientNavbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <>
            {/* Hamburger Menu */}
            <HamburgerButton menuOpen={menuOpen} toggleMenu={toggleMenu} />

            {/* Navigation Links */}
            <NavLinks menuOpen={menuOpen} />
        </>
    );
}