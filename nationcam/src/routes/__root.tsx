import { Outlet, createRootRoute } from '@tanstack/react-router'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThemeProvider from '@/components/ThemeProvider'

import '@/styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <Navbar />
      <main className="pt-14">
        <Outlet />
      </main>
      <Footer />
    </ThemeProvider>
  )
}
