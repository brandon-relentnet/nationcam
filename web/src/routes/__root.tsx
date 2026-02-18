import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GrainOverlay from '@/components/GrainOverlay'
import ThemeProvider from '@/components/ThemeProvider'
import LogtoProvider from '@/components/LogtoProvider'

import '@/styles.css'

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <LogtoProvider>
      <ThemeProvider>
        <GrainOverlay />
        <Navbar />
        <main className="pt-14">
          <Outlet />
        </main>
        <Footer />
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
      </ThemeProvider>
    </LogtoProvider>
  )
}
