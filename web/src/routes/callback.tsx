import { useHandleSignInCallback } from '@logto/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/callback')({ component: CallbackPage })

function CallbackPage() {
  const navigate = useNavigate()

  const { isLoading } = useHandleSignInCallback(() => {
    navigate({ to: '/dashboard' })
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-subtext0">Signing in...</p>
      </div>
    )
  }

  return null
}
