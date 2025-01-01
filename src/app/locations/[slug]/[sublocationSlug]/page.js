import SublocationClient from "./SublocationClient";

export default function SublocationPage({ params }) {
    const { slug: stateSlug, sublocationSlug } = params;

    console.log("State Slug:", stateSlug); // Debugging
    console.log("Sublocation Slug:", sublocationSlug); // Debugging

    return <SublocationClient stateSlug={stateSlug} sublocationSlug={sublocationSlug} />;
}
