import SublocationClient from "./SublocationClient";

export default async function SublocationPage({ params }) {
    const { slug: stateSlug, sublocationSlug } = await params; // Await `params` to resolve

    return <SublocationClient stateSlug={stateSlug} sublocationSlug={sublocationSlug} />;
}
