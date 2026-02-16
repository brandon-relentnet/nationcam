import { Link } from '@tanstack/react-router'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-mantle">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Featured Locations */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-text">
              Featured Locations
            </h4>
            <ul className="space-y-2 text-subtext0">
              <li>
                <Link
                  to="/locations"
                  search={{ state: 'louisiana' }}
                  className="transition-colors hover:text-accent"
                >
                  Louisiana
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="transition-colors hover:text-accent"
                >
                  View All
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-text">Resources</h4>
            <ul className="space-y-2 text-subtext0">
              <li>
                <Link to="/" className="transition-colors hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="transition-colors hover:text-accent"
                >
                  Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-text">Company</h4>
            <ul className="space-y-2 text-subtext0">
              <li>
                <Link
                  to="/contact"
                  className="transition-colors hover:text-accent"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* NationCam */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-text">NationCam</h4>
            <p className="mb-0 text-sm text-subtext0">
              View cameras from around the USA. Connecting communities through
              live video feeds.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-crust px-6 py-4">
        <p className="mb-0 text-center text-sm text-subtext0">
          &copy; {year} NationCam. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
