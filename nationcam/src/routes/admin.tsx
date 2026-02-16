import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Film, MapPin, Plus, Settings } from 'lucide-react'
import type { State, Sublocation } from '@/lib/types'
import PasswordProtection from '@/components/PasswordProtection'
import Dropdown from '@/components/Dropdown'
import Button from '@/components/Button'
import {
  createState,
  createSublocation,
  createVideo,
  fetchStates,
  fetchSublocations,
} from '@/lib/api'

export const Route = createFileRoute('/admin')({ component: AdminPage })

const ADMIN_PASSWORD = import.meta.env['VITE_PAGE_PASSWORD'] ?? 'admin'

function AdminPage() {
  return (
    <PasswordProtection password={ADMIN_PASSWORD}>
      <AdminDashboard />
    </PasswordProtection>
  )
}

function AdminDashboard() {
  const [states, setStates] = useState<Array<State>>([])
  const [sublocations, setSublocations] = useState<Array<Sublocation>>([])

  const fetchData = async () => {
    const [statesData, subData] = await Promise.all([
      fetchStates(),
      fetchSublocations(),
    ])
    setStates(statesData)
    setSublocations(subData)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="page-container space-y-10">
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
          <Settings size={14} className="text-accent" />
          <span className="font-mono text-xs font-medium text-accent">
            Administration
          </span>
        </div>
        <h1>Admin Dashboard</h1>
        <p className="max-w-lg">
          Manage cameras, states, and sublocations from this panel.
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Film size={18} className="text-accent" />
          <h3 className="mb-0">Add Video</h3>
        </div>
        <AddVideoForm
          states={states}
          sublocations={sublocations}
          onSuccess={fetchData}
        />
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-accent" />
          <h3 className="mb-0">Add State</h3>
        </div>
        <AddStateForm onSuccess={fetchData} />
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} className="text-accent" />
          <h3 className="mb-0">Add Sublocation</h3>
        </div>
        <AddSublocationForm states={states} onSuccess={fetchData} />
      </section>
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
}: {
  states: Array<State>
  sublocations: Array<Sublocation>
  onSuccess: () => void
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
      await createVideo({
        title,
        src,
        type,
        state_id: Number(stateId),
        sublocation_id: sublocationId ? Number(sublocationId) : null,
        status,
      })
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

function AddStateForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createState({ name, description: description || undefined })
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
}: {
  states: Array<State>
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stateId, setStateId] = useState<number | ''>('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSublocation({
        name,
        description: description || undefined,
        state_id: Number(stateId),
      })
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
