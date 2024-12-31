import CategoryClient from "./CategoryClient";

export default async function CategoryPage({ params }) {
    const { slug } = await params; // Await params to access slug
    return <CategoryClient slug={slug} />;
}
