import { Link } from '@tanstack/react-router'

export default function ContactCTA() {
  return (
    <section className="bg-surface0 py-16 text-center">
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
