import FAQSection from "./FAQSection";
import HomeHeroSection from "./HomeHeroSection";
import RoadMap from "./RoadMap";

export default function Home() {
  return (
    <>
      <HomeHeroSection />
      <div className="page-container">
        <RoadMap />
        <FAQSection />
      </div>
    </>
  );
}
