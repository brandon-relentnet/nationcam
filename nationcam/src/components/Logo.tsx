import { Link } from '@tanstack/react-router'
import { useTheme } from '@/components/ThemeProvider'

export default function Logo() {
  const { theme } = useTheme()

  return (
    <Link to="/" className="flex items-center">
      <img
        src="/logos/nc_default_logo.webp"
        alt="NationCam Logo"
        className="h-10 w-10 rounded-full object-cover"
        style={{
          backgroundColor:
            theme === 'dark' ? 'rgba(166, 227, 161, 0.3)' : 'transparent',
        }}
      />
    </Link>
  )
}
