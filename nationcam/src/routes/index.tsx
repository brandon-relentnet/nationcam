import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import VideoPlayer from '@/components/videos/VideoPlayer'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <div>
      <HomeHeroSection />
      <RoadMap />
      <FAQSection />
      <ContactCTA />
    </div>
  )
}

/* ──────────────────── Hero ──────────────────── */

function HomeHeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/nc_default_hero.webm" type="video/webm" />
      </video>

      <div className="absolute inset-0 bg-crust/60" />

      <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center gap-8 px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: text */}
        <div className="max-w-xl text-center lg:text-left">
          <img
            src="/logos/nc_default_logo.webp"
            alt="NationCam Logo"
            className="mx-auto mb-6 h-20 w-20 rounded-full object-cover lg:mx-0"
          />
          <h1 className="text-white">NationCam</h1>
          <p className="text-gray-300">
            View live cameras from around the United States. Explore cities,
            landmarks, and communities through real-time video feeds.
          </p>
          <Link
            to="/locations"
            className="inline-block rounded-lg bg-accent px-8 py-3 font-semibold text-crust transition-colors hover:opacity-90"
          >
            View All Locations
          </Link>
        </div>

        {/* Right: featured camera */}
        <div className="w-full max-w-lg">
          <VideoPlayer
            options={{
              autoplay: true,
              controls: true,
              responsive: true,
              fluid: true,
              muted: true,
              sources: [
                {
                  src: 'https://streamer.nationcam.com/memfs/4cdb363f-2bfa-4a0a-b954-ac9b16200665.m3u8',
                  type: 'application/x-mpegURL',
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Decorative waves */}
      <div className="absolute right-0 bottom-0 left-0">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full"
        >
          <path
            d="M0,64 C480,150 960,-20 1440,64 L1440,120 L0,120 Z"
            className="fill-mantle"
          />
        </svg>
        <svg
          viewBox="0 0 1440 40"
          preserveAspectRatio="none"
          className="-mt-px w-full"
        >
          <rect width="1440" height="40" className="fill-base" />
        </svg>
      </div>
    </section>
  )
}

/* ──────────────────── RoadMap ──────────────────── */

function RoadMap() {
  const stats = [
    { value: '1,250', label: 'Cameras Planned' },
    { value: '50', label: 'States' },
    { value: '25', label: 'Starting in Louisiana' },
  ]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2>Our Planned Network</h2>
        <p>
          We are building a nationwide network of live cameras, starting with
          Louisiana and expanding across all 50 states.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="section-container">
              <div className="text-4xl font-bold text-accent">{stat.value}</div>
              <div className="mt-2 text-subtext0">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── FAQ ──────────────────── */

const faqItems = [
  {
    question: 'What is NationCam?',
    answer:
      'NationCam is a platform that provides live camera feeds from locations across the United States, allowing you to explore different cities and landmarks in real time.',
  },
  {
    question: 'How can I add my camera?',
    answer:
      'Visit our Contact page and fill out the form with your camera details. Our team will review your submission and get back to you.',
  },
  {
    question: 'Is NationCam free to use?',
    answer:
      'Yes, viewing live camera feeds on NationCam is completely free for all users.',
  },
  {
    question: 'What kind of cameras are supported?',
    answer:
      'We support a variety of camera types including IP cameras, HLS streams, and DASH streams. Contact us for specific compatibility questions.',
  },
]

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-surface0 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-overlay0 bg-base"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-text transition-colors hover:bg-surface0"
              >
                <span className="font-medium">{item.question}</span>
                <span
                  className={`transition-transform ${openIndex === index ? 'rotate-45' : ''}`}
                >
                  <Plus size={20} />
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-40 px-6 pb-4' : 'max-h-0'
                }`}
              >
                <p className="mb-0 text-subtext1">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── Contact CTA ──────────────────── */

function ContactCTA() {
  return (
    <section className="py-16 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <h2>Want your camera on our site?</h2>
        <p>
          We are looking for people who want to share their cameras with the
          world. If you have a camera that you would like to share, please
          contact us.
        </p>
        <Link
          to="/contact"
          className="inline-block rounded-lg bg-accent px-8 py-3 font-semibold text-crust transition-colors hover:opacity-90"
        >
          Contact Us
        </Link>
      </div>
    </section>
  )
}
