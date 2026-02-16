import { useState } from 'react'

interface PasswordProtectionProps {
  children: React.ReactNode
  password: string
}

export default function PasswordProtection({
  children,
  password,
}: PasswordProtectionProps) {
  const [input, setInput] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === password) {
      setAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password.')
    }
  }

  if (authenticated) {
    return <>{children}</>
  }

  return (
    <div className="page-container flex items-center justify-center">
      <div className="section-container w-full max-w-md">
        <h3 className="text-center">Password Required</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-lg border border-overlay0 bg-base px-4 py-3 text-text"
          />
          {error && <p className="mb-0 text-sm text-red">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-3 font-semibold text-crust transition-colors hover:opacity-90"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}
