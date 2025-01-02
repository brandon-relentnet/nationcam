import dynamic from "next/dynamic";

const Logo = dynamic(() => import("@/components/Logo"));

export default function Socials() {
    return (
        <div>
            <Logo />
        </div>
    );
}