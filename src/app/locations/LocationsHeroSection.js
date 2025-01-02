"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import buttonRedirects from "@/lib/buttonRedirects";

export default function LocationsHeroSection({ title, slug, alt }) {
  const redirectUrl = buttonRedirects[slug] || `/locations/${slug}`;
  const defaultVideoPath = "/videos/nc_default_hero.mp4";
  const defaultLogoPath = "/logos/nc_default_hero.png";
  const defaultButtonPath = "/buttons/nc_default_button.png";

  const [videoPath, setVideoPath] = useState(defaultVideoPath);
  const [logoPath, setLogoPath] = useState(defaultLogoPath);
  const [buttonPath, setButtonPath] = useState(defaultButtonPath);

  useEffect(() => {
    const verifyFiles = async () => {
      if (slug) {
        const customVideoPath = `/videos/nc_${slug}_hero.mp4`;
        const customLogoPath = `/logos/nc_${slug}_hero.png`;
        const customButtonPath = `/buttons/nc_${slug}_button.png`;

        // Check if custom video exists
        try {
          const videoResponse = await fetch(customVideoPath, { method: "HEAD" });
          if (videoResponse.ok) {
            setVideoPath(customVideoPath);
          }
        } catch (err) {
          console.error("Video not found:", customVideoPath);
        }

        // Check if custom logo exists
        try {
          const logoResponse = await fetch(customLogoPath, { method: "HEAD" });
          if (logoResponse.ok) {
            setLogoPath(customLogoPath);
          }
        } catch (err) {
          console.error("Logo not found:", customLogoPath);
        }

        // Check if custom button exists
        try {
          const buttonResponse = await fetch(customButtonPath, { method: "HEAD" });
          if (buttonResponse.ok) {
            setButtonPath(customButtonPath);
          }
        } catch (err) {
          console.error("Button not found:", customButtonPath);
        }
      }
    };

    verifyFiles();
  }, [slug]);

  return (
    <section className="w-full h-screen flex items-center justify-center relative">
      {/* Background Video */}
      <div className="bg-base opacity-70 w-full h-full absolute">
        <video
          src={videoPath}
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full"
          aria-label={alt}
        />
      </div>

      <div className="flex flex-col items-center justify-center h-screen z-10">
        {/* Text Content */}
        <div className="text-center text-text px-4 mb-4">
          {logoPath ? (
            <Image
              src={logoPath}
              alt={alt || "Category Logo"}
              width={260}
              height={260}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          ) : (
            <h1 className="text-4xl font-bold">{title}</h1>
          )}
        </div>

        {/* Button */}
        <div>
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4"
          >
            {buttonPath ? (
              <Image
                src={buttonPath}
                alt="Category Button"
                width={200}
                height={50}
                priority
                style={{ width: "auto", height: "auto" }}
              />
            ) : (
              <span>Explore</span>
            )}
          </a>
        </div>
      </div>

      {/* SVG at the Bottom */}
      <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
        <svg
          id="visual"
          viewBox="0 0 900 600"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="w-full h-80"
          preserveAspectRatio="none"
        >
          <path
            d="M0 417L150 374L300 437L450 437L600 413L750 386L900 434L900 601L750 601L600 601L450 601L300 601L150 601L0 601Z"
            className="fill-crust"
          ></path>
          <path
            d="M0 453L150 470L300 502L450 452L600 486L750 433L900 491L900 601L750 601L600 601L450 601L300 601L150 601L0 601Z"
            className="fill-mantle"
          ></path>
          <path
            d="M0 495L150 519L300 519L450 517L600 543L750 519L900 532L900 601L750 601L600 601L450 601L300 601L150 601L0 601Z"
            className="fill-base"
          ></path>
        </svg>
      </div>
    </section>
  );
}
