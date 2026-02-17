import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Film, LayoutDashboard, LogIn, MapPin, Plus } from 'lucide-react'
import type { State, Sublocation } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import Dropdown from '@/components/Dropdown'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import {
  createState,
  createSublocation,
  createVideo,
  fetchStates,
  fetchSublocationsByState,
} from '@/lib/api'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

function DashboardPage() {
  const { isAuthenticated, isLoading, user, login } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="flex flex-col items-center gap-4"
          style={{
            opacity: 0,
            animation: 'scale-fade-in 500ms var(--spring-poppy) forwards',
          }}
        >
          <div
            className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent"
            style={{ animation: 'spin 800ms linear infinite' }}
          />
          <p className="mb-0 font-mono text-sm text-subtext0">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Reveal variant="scale">
          <div className="w-full max-w-sm">
            <div className="rounded-xl border border-overlay0 bg-surface0 p-8 shadow-xl">
              <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <LogIn size={20} className="text-accent" />
                </div>
                <h4 className="mb-0">Sign in to continue</h4>
                <p className="mb-0 text-sm text-subtext0">
                  You need to be signed in to access the dashboard.
                </p>
              </div>
              <Button
                text="Sign In"
                variant="primary"
                size="lg"
                className="w-full"
                onClick={login}
              />
            </div>
          </div>
        </Reveal>
      </div>
    )
  }

  return <DashboardContent userName={user?.name ?? user?.username ?? null} />
}

function DashboardContent({ userName }: { userName: string | null }) {
  const { getToken } = useAuth()
  const [states, setStates] = useState<Array<State>>([])
  const [sublocations, setSublocations] = useState<Array<Sublocation>>([])

  const fetchData = async () => {
    const statesData = await fetchStates()
    setStates(statesData)

    const allSubs = await Promise.all(
      statesData.map((s) => fetchSublocationsByState(s.slug)),
    )
    setSublocations(allSubs.flat())
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="page-container space-y-10">
      {/* Header */}
      <Reveal variant="blur">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
            <LayoutDashboard size={14} className="text-accent" />
            <span className="font-mono text-xs font-medium text-accent">
              Dashboard
            </span>
          </div>
          <h1>
            {userName ? (
              <>
                Welcome back,{' '}
                <span className="text-accent">{userName}</span>
              </>
            ) : (
              'Dashboard'
            )}
          </h1>
          <p className="max-w-lg">
            Manage cameras, states, and sublocations from this panel.
          </p>
        </div>
      </Reveal>

      {/* Add Video */}
      <Reveal variant="float">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Film size={18} className="text-accent" />
            <h3 className="mb-0">Add Video</h3>
          </div>
          <AddVideoForm
            states={states}
            sublocations={sublocations}
            onSuccess={fetchData}
            getToken={getToken}
          />
        </section>
      </Reveal>

      {/* Add State */}
      <Reveal variant="float">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-accent" />
            <h3 className="mb-0">Add State</h3>
          </div>
          <AddStateForm onSuccess={fetchData} getToken={getToken} />
        </section>
      </Reveal>

      {/* Add Sublocation */}
      <Reveal variant="float">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Plus size={18} className="text-accent" />
            <h3 className="mb-0">Add Sublocation</h3>
          </div>
          <AddSublocationForm
            states={states}
            onSuccess={fetchData}
            getToken={getToken}
          />
        </section>
      </Reveal>
    </div>
  )
}

/* ──── Add Video Form ──── */

const videoTypeOptions = [
  { value: 'video/mp4', label: 'MP4' },
  { value: 'video/webm', label: 'WebM' },
  { value: 'video/ogg', label: 'Ogg' },
  { value: 'application/x-mpegURL', label: 'HLS' },
  { value: 'application/dash+xml', label: 'DASH' },
]

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function AddVideoForm({
  states,
  sublocations,
  onSuccess,
  getToken,
}: {
  states: Array<State>
  sublocations: Array<Sublocation>
  onSuccess: () => void
  getToken: () => Promise<string | null>
}) {
  const [title, setTitle] = useState('')
  const [src, setSrc] = useState('')
  const [type, setType] = useState('')
  const [stateId, setStateId] = useState<number | ''>('')
  const [sublocationId, setSublocationId] = useState<number | ''>('')
  const [status, setStatus] = useState('active')
  const [message, setMessage] = useState('')

  const filteredSubs = sublocations.filter((s) => s.state_id === stateId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      await createVideo(
        {
          title,
          src,
          type,
          state_id: Number(stateId),
          sublocation_id: sublocationId ? Number(sublocationId) : null,
          status,
        },
        token,
      )
      setMessage('Video added successfully!')
      setTitle('')
      setSrc('')
      setType('')
      setStateId('')
      setSublocationId('')
      onSuccess()
    } catch {
      setMessage('Failed to add video.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="section-container space-y-4">
      <AdminInput label="Title" value={title} onChange={setTitle} />
      <AdminInput label="Source URL" value={src} onChange={setSrc} />

      <Dropdown
        label="Video Type"
        options={videoTypeOptions}
        selectedValue={type}
        onSelect={(v) => setType(String(v))}
      />

      <Dropdown
        label="State"
        options={states.map((s) => ({
          value: s.state_id,
          label: s.name,
        }))}
        selectedValue={stateId}
        onSelect={(v) => {
          setStateId(Number(v))
          setSublocationId('')
        }}
      />

      {filteredSubs.length > 0 && (
        <Dropdown
          label="Sublocation"
          options={filteredSubs.map((s) => ({
            value: s.sublocation_id,
            label: s.name,
          }))}
          selectedValue={sublocationId}
          onSelect={(v) => setSublocationId(Number(v))}
        />
      )}

      <Dropdown
        label="Status"
        options={statusOptions}
        selectedValue={status}
        onSelect={(v) => setStatus(String(v))}
      />

      {message && (
        <p className="mb-0 text-sm font-medium text-accent">{message}</p>
      )}
      <Button text="Add Video" type="submit" />
    </form>
  )
}

/* ──── Add State Form ──── */

function AddStateForm({
  onSuccess,
  getToken,
}: {
  onSuccess: () => void
  getToken: () => Promise<string | null>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      await createState(
        { name, description: description || undefined },
        token,
      )
      setMessage('State added successfully!')
      setName('')
      setDescription('')
      onSuccess()
    } catch {
      setMessage('Failed to add state.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="section-container space-y-4">
      <AdminInput label="State Name" value={name} onChange={setName} />
      <AdminInput
        label="Description (optional)"
        value={description}
        onChange={setDescription}
      />
      {message && (
        <p className="mb-0 text-sm font-medium text-accent">{message}</p>
      )}
      <Button text="Add State" type="submit" />
    </form>
  )
}

/* ──── Add Sublocation Form ──── */

function AddSublocationForm({
  states,
  onSuccess,
  getToken,
}: {
  states: Array<State>
  onSuccess: () => void
  getToken: () => Promise<string | null>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stateId, setStateId] = useState<number | ''>('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getToken()
      await createSublocation(
        {
          name,
          description: description || undefined,
          state_id: Number(stateId),
        },
        token,
      )
      setMessage('Sublocation added successfully!')
      setName('')
      setDescription('')
      setStateId('')
      onSuccess()
    } catch {
      setMessage('Failed to add sublocation.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="section-container space-y-4">
      <AdminInput label="Sublocation Name" value={name} onChange={setName} />
      <AdminInput
        label="Description (optional)"
        value={description}
        onChange={setDescription}
      />
      <Dropdown
        label="State"
        options={states.map((s) => ({
          value: s.state_id,
          label: s.name,
        }))}
        selectedValue={stateId}
        onSelect={(v) => setStateId(Number(v))}
      />
      {message && (
        <p className="mb-0 text-sm font-medium text-accent">{message}</p>
      )}
      <Button text="Add Sublocation" type="submit" />
    </form>
  )
}

/* ──── Shared admin input ──── */

function AdminInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-sm font-medium text-subtext1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-overlay0 bg-base px-4 py-3 font-sans text-sm text-text transition-all duration-200 placeholder:text-overlay1 focus:border-accent focus:ring-2 focus:ring-accent-glow focus:outline-none"
      />
    </div>
  )
}
