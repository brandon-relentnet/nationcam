import NavLinkItem from "./NavLinkItem";
import { usePathname } from "next/navigation";

export default function NavLinks({ menuOpen }) {
    const currentPath = usePathname();
    return (
        <ul
            className={`absolute top-full md:top-auto left-0 w-full md:w-auto md:relative md:flex md:gap-8 md:items-center
            bg-crust md:bg-transparent text-center !ml-0
            transition-all duration-300 ease-in-out [transition-property:transform,opacity,max-height]
            overflow-hidden
            ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            md:max-h-none md:opacity-100 md:overflow-visible`}
        >
            <NavLinkItem href="/" currentPath={currentPath}>
                Home
            </NavLinkItem>
            <NavLinkItem href="/about" currentPath={currentPath}>
                About
            </NavLinkItem>
            <NavLinkItem href="/projects" currentPath={currentPath}>
                Projects
            </NavLinkItem>
            <NavLinkItem href="/contact" currentPath={currentPath}>
                Contact
            </NavLinkItem>
        </ul>
    );
}