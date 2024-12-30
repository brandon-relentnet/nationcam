import CategoriesList from "@/components/videos/CategoriesList";
import UsersList from "@/components/videos/UsersList";
import VideosList from "@/components/videos/VideosList";

export default function Home() {
  return (
    <div className="page-container">
      <h1>Home</h1>
      <CategoriesList />
      <UsersList />
      <VideosList />
    </div>
  );
}
