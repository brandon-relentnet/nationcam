import dynamic from "next/dynamic";
import Settings from "./Settings";

const Socials = dynamic(() => import('./Socials'));
const ThemeSwitch = dynamic(() => import('./ThemeSwitch'));
const ClientNavbar = dynamic(() => import('./ClientNavbar'));
const Github = dynamic(() => import('./Github'));

export default function Navbar() {
    return (
        <nav className="flex fixed w-full top-0 h-20 px-8 bg-mantle shadow items-center justify-between z-50">
            {/* Socials */}
            <div className="flex items-center space-x-4 flex-1">
                <Socials />
            </div>

            {/* Client Navbar (contains HamburgerButton and NavLinks) */}
            <div className="flex justify-center flex-2 space-x-6">
                <ClientNavbar />
            </div>

            {/* Theme Switch */}
            <div className="flex justify-end items-center flex-1 space-x-4">
                <Github />
                <Settings />
                <ThemeSwitch />
            </div>
        </nav >
    );
}