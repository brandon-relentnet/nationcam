import StateClient from "./StateClient";

export default async function StatePage({ params }) {
    const { slug } = await params; // Await params to access slug
    return <StateClient slug={slug} />;
}
