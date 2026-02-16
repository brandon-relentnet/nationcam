import { Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Github,
  Home,
  Mail,
  MapPin,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import Logo from '@/components/Logo'

const navLinks = [
  { to: '/' as const, label: 'Home', icon: Home },
  { to: '/locations' as const, label: 'Locations', icon: MapPin },
  { to: '/contact' as const, label: 'Contact', icon: Mail },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const currentPath = router.state.location.pathname

  return (
    <nav className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between bg-mantle px-4 py-3 shadow-lg">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Logo />
      </div>

      {/* Center: Desktop nav links */}
      <ul className="hidden items-center gap-6 md:flex">
        {navLinks.map(({ to, label }) => {
          const isActive =
            to === '/' ? currentPath === '/' : currentPath.startsWith(to)
          return (
            <li key={to}>
              <Link
                to={to}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  isActive ? 'text-accent' : 'text-text'
                }`}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/brandon-relentnet/nationcam"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 text-text transition-colors hover:bg-surface0 hover:text-accent"
        >
          <Github size={20} />
        </a>
        <Link
          to="/admin"
          className="rounded-lg p-2 text-text transition-colors hover:bg-surface0 hover:text-accent"
        >
          <Settings size={20} />
        </Link>
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-text transition-colors hover:bg-surface0 hover:text-accent"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-text transition-colors hover:bg-surface0 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`absolute top-full right-0 left-0 border-t border-surface0 bg-mantle shadow-lg transition-all md:hidden ${
          menuOpen
            ? 'max-h-60 opacity-100'
            : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-1 p-4">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === '/' ? currentPath === '/' : currentPath.startsWith(to)
            return (
              <li key={to}>
                <Link
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-surface0 ${
                    isActive ? 'bg-surface0 text-accent' : 'text-text'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
