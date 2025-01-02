import dynamic from "next/dynamic";

const Logo = dynamic(() => import("@/components/Logo"));

export default function Socials() {
    return (
        <div className="-mt-0.5">
            <Logo />
        </div>
    );
}