import { Lock } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/Button'

interface PasswordProtectionProps {
  password: string
  children: React.ReactNode
}

export default function PasswordProtection({
  password,
  children,
}: PasswordProtectionProps) {
  const [input, setInput] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === password) {
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (authenticated) return <>{children}</>

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-overlay0 bg-surface0 p-8 shadow-xl">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Lock size={20} className="text-accent" />
            </div>
            <h4 className="mb-0">Access Required</h4>
            <p className="mb-0 text-sm text-subtext0">
              Enter the password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full rounded-lg border bg-base px-4 py-2.5 text-sm text-text placeholder-subtext0 transition-colors focus:outline-none focus:ring-1 focus:ring-accent/30 ${
                error
                  ? 'border-live focus:border-live'
                  : 'border-overlay0 focus:border-accent'
              }`}
            />
            {error && (
              <p className="mb-0 text-xs text-live">Incorrect password</p>
            )}
            <Button
              text="Unlock"
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            />
          </form>
        </div>
      </div>
    </div>
  )
}
