import { createLazyFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Film,
  Landmark,
  Loader2,
  LogIn,
  MapPin,
  Pencil,
  Radio,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react'
import type {
  PaginatedResponse,
  State,
  StreamDetail,
  Sublocation,
  Video,
} from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import Reveal from '@/components/Reveal'
import {
  createState,
  createStream,
  createSublocation,
  createVideo,
  deleteState,
  deleteStream,
  deleteSublocation,
  deleteVideo,
  fetchStates,
  fetchStatesPaginated,
  fetchStreams,
  fetchSublocationsByState,
  fetchSublocationsPaginated,
  fetchVideos,
  fetchVideosPaginated,
  restartStream,
  updateState,
  updateSublocation,
  updateVideo,
} from '@/lib/api'

/* ──── Constants ──── */

type Tab = 'cameras' | 'states' | 'sublocations' | 'streams'

const TABS: Array<{ id: Tab; label: string; icon: typeof Film }> = [
  { id: 'cameras', label: 'Cameras', icon: Film },
  { id: 'states', label: 'States', icon: MapPin },
  { id: 'sublocations', label: 'Sublocations', icon: Landmark },
  { id: 'streams', label: 'Streams', icon: Radio },
]

const VIDEO_TYPE_OPTIONS = [
  { value: 'application/x-mpegURL', label: 'HLS (recommended)' },
  { value: 'video/mp4', label: 'MP4' },
  { value: 'video/webm', label: 'WebM' },
  { value: 'video/ogg', label: 'Ogg' },
  { value: 'application/dash+xml', label: 'DASH' },
]

const VIDEO_TYPE_LABELS: Record<string, string> = {
  'video/mp4': 'MP4',
  'video/webm': 'WebM',
  'video/ogg': 'Ogg',
  'application/x-mpegURL': 'HLS',
  'application/dash+xml': 'DASH',
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const PER_PAGE = 20

export const Route = createLazyFileRoute('/dashboard')({
  component: DashboardPage,
})

/* ──── Auth Gate ──── */

function DashboardPage() {
  const { isAuthenticated, isLoading, user, login } = useAuth()

  // Track whether the initial auth check has completed. The Logto SDK's
  // proxy wraps every method with setIsLoading(true/false), so calling
  // getAccessToken or getIdTokenClaims causes isLoading to flicker.
  // Without this guard, each flicker unmounts DashboardContent (which
  // triggers fetchOverview → getToken → getAccessToken → isLoading
  // flicker → unmount → remount → infinite loop).
  const authSettled = useRef(false)
  if (!isLoading) authSettled.current = true

  if (!authSettled.current) {
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

/* ──── Dashboard Content ──── */

function DashboardContent({ userName }: { userName: string | null }) {
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('cameras')

  // Non-paginated data for dropdowns + stats
  const [allStates, setAllStates] = useState<Array<State>>([])
  const [allSublocations, setAllSublocations] = useState<Array<Sublocation>>([])
  const [allVideos, setAllVideos] = useState<Array<Video>>([])
  const [allStreams, setAllStreams] = useState<Array<StreamDetail>>([])
  const [dataLoading, setDataLoading] = useState(true)

  // Paginated responses per tab
  const [statesPage, setStatesPage] = useState(1)
  const [statesPaginated, setStatesPaginated] =
    useState<PaginatedResponse<State> | null>(null)
  const [subsPage, setSubsPage] = useState(1)
  const [subsPaginated, setSubsPaginated] =
    useState<PaginatedResponse<Sublocation> | null>(null)
  const [videosPage, setVideosPage] = useState(1)
  const [videosPaginated, setVideosPaginated] =
    useState<PaginatedResponse<Video> | null>(null)

  // Fetch non-paginated data (for dropdowns + stat cards)
  const fetchOverview = async () => {
    setDataLoading(true)
    try {
      const token = await getToken()
      const [statesData, videosData] = await Promise.all([
        fetchStates(),
        fetchVideos(),
      ])
      setAllStates(statesData)
      setAllVideos(videosData)

      const allSubs = await Promise.all(
        statesData.map((s) => fetchSublocationsByState(s.slug)),
      )
      setAllSublocations(allSubs.flat())

      // Streams require auth — fetch silently, empty array on failure.
      try {
        const streamsData = await fetchStreams(token)
        setAllStreams(streamsData)
      } catch {
        setAllStreams([])
      }
    } finally {
      setDataLoading(false)
    }
  }

  // Silent refresh — re-fetches data without showing skeleton loaders.
  // Used after create/update/delete so the UI stays interactive.
  const refreshData = async () => {
    try {
      const token = await getToken()
      const [statesData, videosData] = await Promise.all([
        fetchStates(),
        fetchVideos(),
      ])
      setAllStates(statesData)
      setAllVideos(videosData)

      const allSubs = await Promise.all(
        statesData.map((s) => fetchSublocationsByState(s.slug)),
      )
      setAllSublocations(allSubs.flat())

      try {
        const streamsData = await fetchStreams(token)
        setAllStreams(Array.isArray(streamsData) ? streamsData : [])
      } catch {
        setAllStreams([])
      }
    } catch {
      // Silent refresh — don't crash the page on failure
    }
  }

  // Fetch paginated data for current tab
  const fetchPaginated = async (tab: Tab, page: number) => {
    const token = await getToken()
    if (tab === 'states') {
      const res = await fetchStatesPaginated(page, PER_PAGE, token)
      setStatesPaginated(res)
    } else if (tab === 'sublocations') {
      const res = await fetchSublocationsPaginated(page, PER_PAGE, token)
      setSubsPaginated(res)
    } else {
      const res = await fetchVideosPaginated(page, PER_PAGE, token)
      setVideosPaginated(res)
    }
  }

  // Refresh everything (after create/update/delete)
  const refreshAll = async () => {
    await refreshData()
    if (activeTab !== 'streams') {
      await fetchPaginated(activeTab, currentPage)
    }
  }

  const currentPage =
    activeTab === 'states'
      ? statesPage
      : activeTab === 'sublocations'
        ? subsPage
        : videosPage

  useEffect(() => {
    fetchOverview()
  }, [])

  useEffect(() => {
    if (activeTab !== 'streams') {
      fetchPaginated(activeTab, currentPage)
    }
  }, [activeTab, statesPage, subsPage, videosPage])

  const tabIndex = TABS.findIndex((t) => t.id === activeTab)

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <Reveal variant="blur">
        <div>
          <p className="mb-2 font-mono text-xs font-medium tracking-widest text-accent uppercase">
            Dashboard
          </p>
          <h1 className="!mb-1">
            {userName ? (
              <>
                Welcome back,{' '}
                <span className="text-accent">{userName}</span>
              </>
            ) : (
              'Dashboard'
            )}
          </h1>
          <p className="mb-0 max-w-lg text-subtext0">
            Manage your cameras, states, sublocations, and streams.
          </p>
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal variant="float">
        {dataLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={Film}
              value={allVideos.length}
              label="Active cameras"
              delay={0}
            />
            <StatCard
              icon={MapPin}
              value={allStates.length}
              label="States"
              delay={80}
            />
            <StatCard
              icon={Landmark}
              value={allSublocations.length}
              label="Sublocations"
              delay={160}
            />
            <StatCard
              icon={Radio}
              value={allStreams.length}
              label="Live streams"
              delay={240}
            />
          </div>
        )}
      </Reveal>

      {/* Tab bar */}
      <div className="relative flex border-b border-overlay0">
        {/* Sliding indicator */}
        <div
          className="absolute bottom-0 h-0.5 rounded-full bg-accent transition-transform duration-300 ease-[var(--spring-snappy)]"
          style={{
            width: `${100 / TABS.length}%`,
            transform: `translateX(${tabIndex * 100}%)`,
          }}
        />
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-accent'
                : 'text-subtext0 hover:text-text'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        key={activeTab}
        style={{
          opacity: 0,
          animation: 'fade-in 250ms var(--spring-ease-out) forwards',
        }}
      >
        {activeTab === 'cameras' && (
          <CamerasPanel
            states={allStates}
            sublocations={allSublocations}
            paginated={videosPaginated}
            page={videosPage}
            setPage={setVideosPage}
            getToken={getToken}
            onSuccess={refreshAll}
            loading={dataLoading}
          />
        )}
        {activeTab === 'states' && (
          <StatesPanel
            paginated={statesPaginated}
            page={statesPage}
            setPage={setStatesPage}
            getToken={getToken}
            onSuccess={refreshAll}
            loading={dataLoading}
          />
        )}
        {activeTab === 'sublocations' && (
          <SublocationsPanel
            states={allStates}
            paginated={subsPaginated}
            page={subsPage}
            setPage={setSubsPage}
            getToken={getToken}
            onSuccess={refreshAll}
            loading={dataLoading}
          />
        )}
        {activeTab === 'streams' && (
          <StreamsPanel
            streams={allStreams}
            getToken={getToken}
            onSuccess={refreshAll}
            loading={dataLoading}
          />
        )}
      </div>
    </div>
  )
}

/* ──── Stats ──── */

function StatCard({
  icon: Icon,
  value,
  label,
  delay,
}: {
  icon: typeof Film
  value: number
  label: string
  delay: number
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-overlay0 bg-surface0 p-5 transition-[border-color,box-shadow] duration-300 ease-[var(--spring-gentle)] hover:border-accent/30 hover:shadow-lg"
      style={{
        opacity: 0,
        animation: `scale-fade-in 400ms var(--spring-poppy) ${delay}ms forwards`,
      }}
    >
      {/* Decorative corner orb */}
      <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-accent/5 transition-transform duration-500 ease-[var(--spring-smooth)] group-hover:scale-[2]" />
      <div className="relative flex items-center gap-3.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
          <Icon size={20} className="text-accent" />
        </div>
        <div>
          <p className="mb-0 font-display text-2xl leading-none font-bold text-text">
            {value}
          </p>
          <p className="mb-0 text-xs font-medium text-subtext0">{label}</p>
        </div>
      </div>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-overlay0 bg-surface0 p-5">
      <div className="h-10 w-10 animate-pulse rounded-lg bg-surface1" />
      <div className="space-y-2">
        <div className="h-6 w-12 animate-pulse rounded bg-surface1" />
        <div className="h-3 w-16 animate-pulse rounded bg-surface1" />
      </div>
    </div>
  )
}

/* ──── Cameras Panel ──── */

function CamerasPanel({
  states,
  sublocations,
  paginated,
  page,
  setPage,
  getToken,
  onSuccess,
  loading,
}: {
  states: Array<State>
  sublocations: Array<Sublocation>
  paginated: PaginatedResponse<Video> | null
  page: number
  setPage: (p: number) => void
  getToken: () => Promise<string | null>
  onSuccess: () => void
  loading: boolean
}) {
  const [title, setTitle] = useState('')
  const [src, setSrc] = useState('')
  const [type, setType] = useState('')
  const [stateId, setStateId] = useState<number | ''>('')
  const [sublocationId, setSublocationId] = useState<number | ''>('')
  const [status, setStatus] = useState('active')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<FormMsg>(null)

  useAutoHide(msg, setMsg)

  const [confirmDelete, setConfirmDelete] = useState<{
    id: number
    name: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState<Video | null>(null)

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const token = await getToken()
      await deleteVideo(confirmDelete.id, token)
      setConfirmDelete(null)
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to delete camera.', ok: false })
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const filteredSubs = sublocations.filter((s) => s.state_id === stateId)
  const videos = paginated?.data ?? []
  const total = paginated?.total ?? 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !src || !type || !stateId) {
      setMsg({ text: 'Please fill in all required fields.', ok: false })
      return
    }
    setSubmitting(true)
    setMsg(null)
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
      setMsg({ text: 'Camera added successfully!', ok: true })
      setTitle('')
      setSrc('')
      setType('')
      setStateId('')
      setSublocationId('')
      setStatus('active')
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to add camera.', ok: false })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <FormCard title="Add Camera" icon={Film}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DashInput
                label="Title"
                value={title}
                onChange={setTitle}
                placeholder="e.g. Miami Beach South Cam"
              />
              <DashInput
                label="Source URL"
                value={src}
                onChange={setSrc}
                placeholder="e.g. https://stream.example.com/live.m3u8"
              />
              <Dropdown
                label="Video Type"
                options={VIDEO_TYPE_OPTIONS}
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
                options={STATUS_OPTIONS}
                selectedValue={status}
                onSelect={(v) => setStatus(String(v))}
              />
              <StatusBanner msg={msg} />
              <SubmitBtn submitting={submitting} label="Add Camera" />
            </form>
          </FormCard>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          <ListCard
            title="Existing Cameras"
            count={total}
            loading={loading}
            empty={videos.length === 0}
            emptyIcon={Film}
            emptyText="No cameras yet. Add one to get started."
          >
            {videos.map((v, i) => (
              <VideoRow
                key={v.video_id}
                video={v}
                index={i}
                onEdit={(video) => setEditing(video)}
                onDelete={(id, name) => setConfirmDelete({ id, name })}
              />
            ))}
            <PaginationControls
              page={page}
              perPage={PER_PAGE}
              total={total}
              onPageChange={setPage}
            />
          </ListCard>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDeleteDialog
          name={confirmDelete.name}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {editing && (
        <EditVideoModal
          video={editing}
          states={states}
          sublocations={sublocations}
          getToken={getToken}
          onSuccess={() => {
            setEditing(null)
            onSuccess()
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

/* ──── States Panel ──── */

function StatesPanel({
  paginated,
  page,
  setPage,
  getToken,
  onSuccess,
  loading,
}: {
  paginated: PaginatedResponse<State> | null
  page: number
  setPage: (p: number) => void
  getToken: () => Promise<string | null>
  onSuccess: () => void
  loading: boolean
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<FormMsg>(null)

  useAutoHide(msg, setMsg)

  const [confirmDelete, setConfirmDelete] = useState<{
    slug: string
    name: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState<State | null>(null)

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const token = await getToken()
      await deleteState(confirmDelete.slug, token)
      setConfirmDelete(null)
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to delete state.', ok: false })
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const states = paginated?.data ?? []
  const total = paginated?.total ?? 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      setMsg({ text: 'Please enter a state name.', ok: false })
      return
    }
    setSubmitting(true)
    setMsg(null)
    try {
      const token = await getToken()
      await createState(
        { name, description: description || undefined },
        token,
      )
      setMsg({ text: 'State added successfully!', ok: true })
      setName('')
      setDescription('')
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to add state.', ok: false })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <FormCard title="Add State" icon={MapPin}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DashInput
                label="State Name"
                value={name}
                onChange={setName}
                placeholder="e.g. Florida"
              />
              <DashInput
                label="Description"
                value={description}
                onChange={setDescription}
                placeholder="Brief description (optional)"
              />
              <StatusBanner msg={msg} />
              <SubmitBtn submitting={submitting} label="Add State" />
            </form>
          </FormCard>
        </div>

        <div className="lg:col-span-3">
          <ListCard
            title="Existing States"
            count={total}
            loading={loading}
            empty={states.length === 0}
            emptyIcon={MapPin}
            emptyText="No states yet. Add one to get started."
          >
            {states.map((s, i) => (
              <StateRow
                key={s.state_id}
                state={s}
                index={i}
                onEdit={(state) => setEditing(state)}
                onDelete={(stateSlug, label) =>
                  setConfirmDelete({ slug: stateSlug, name: label })
                }
              />
            ))}
            <PaginationControls
              page={page}
              perPage={PER_PAGE}
              total={total}
              onPageChange={setPage}
            />
          </ListCard>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDeleteDialog
          name={confirmDelete.name}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {editing && (
        <EditStateModal
          state={editing}
          getToken={getToken}
          onSuccess={() => {
            setEditing(null)
            onSuccess()
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

/* ──── Sublocations Panel ──── */

function SublocationsPanel({
  states,
  paginated,
  page,
  setPage,
  getToken,
  onSuccess,
  loading,
}: {
  states: Array<State>
  paginated: PaginatedResponse<Sublocation> | null
  page: number
  setPage: (p: number) => void
  getToken: () => Promise<string | null>
  onSuccess: () => void
  loading: boolean
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stateId, setStateId] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<FormMsg>(null)

  useAutoHide(msg, setMsg)

  const [confirmDelete, setConfirmDelete] = useState<{
    id: number
    name: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState<Sublocation | null>(null)

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const token = await getToken()
      await deleteSublocation(confirmDelete.id, token)
      setConfirmDelete(null)
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to delete sublocation.', ok: false })
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const sublocations = paginated?.data ?? []
  const total = paginated?.total ?? 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !stateId) {
      setMsg({ text: 'Please fill in all required fields.', ok: false })
      return
    }
    setSubmitting(true)
    setMsg(null)
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
      setMsg({ text: 'Sublocation added successfully!', ok: true })
      setName('')
      setDescription('')
      setStateId('')
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to add sublocation.', ok: false })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <FormCard title="Add Sublocation" icon={Landmark}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DashInput
                label="Sublocation Name"
                value={name}
                onChange={setName}
                placeholder="e.g. Miami Beach"
              />
              <Dropdown
                label="Parent State"
                options={states.map((s) => ({
                  value: s.state_id,
                  label: s.name,
                }))}
                selectedValue={stateId}
                onSelect={(v) => setStateId(Number(v))}
              />
              <DashInput
                label="Description"
                value={description}
                onChange={setDescription}
                placeholder="Brief description (optional)"
              />
              <StatusBanner msg={msg} />
              <SubmitBtn submitting={submitting} label="Add Sublocation" />
            </form>
          </FormCard>
        </div>

        <div className="lg:col-span-3">
          <ListCard
            title="Existing Sublocations"
            count={total}
            loading={loading}
            empty={sublocations.length === 0}
            emptyIcon={Landmark}
            emptyText="No sublocations yet. Add one to get started."
          >
            {sublocations.map((s, i) => (
              <SublocationRow
                key={s.sublocation_id}
                sublocation={s}
                index={i}
                onEdit={(sub) => setEditing(sub)}
                onDelete={(id, label) =>
                  setConfirmDelete({ id, name: label })
                }
              />
            ))}
            <PaginationControls
              page={page}
              perPage={PER_PAGE}
              total={total}
              onPageChange={setPage}
            />
          </ListCard>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDeleteDialog
          name={confirmDelete.name}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {editing && (
        <EditSublocationModal
          sublocation={editing}
          states={states}
          getToken={getToken}
          onSuccess={() => {
            setEditing(null)
            onSuccess()
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

/* ──── Streams Panel ──── */

function StreamsPanel({
  streams,
  getToken,
  onSuccess,
  loading,
}: {
  streams: Array<StreamDetail>
  getToken: () => Promise<string | null>
  onSuccess: () => void
  loading: boolean
}) {
  const [name, setName] = useState('')
  const [rtspUrl, setRtspUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<FormMsg>(null)

  useAutoHide(msg, setMsg)

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    name: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [restarting, setRestarting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const token = await getToken()
      await deleteStream(confirmDelete.id, token)
      setConfirmDelete(null)
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to delete stream.', ok: false })
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleRestart = async (id: string) => {
    setRestarting(id)
    try {
      const token = await getToken()
      await restartStream(id, token)
      setMsg({ text: 'Stream restarting...', ok: true })
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to restart stream.', ok: false })
    } finally {
      setRestarting(null)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !rtspUrl) {
      setMsg({ text: 'Please fill in all fields.', ok: false })
      return
    }
    setSubmitting(true)
    setMsg(null)
    try {
      const token = await getToken()
      await createStream({ name, rtspUrl }, token)
      setMsg({ text: 'Stream created successfully!', ok: true })
      setName('')
      setRtspUrl('')
      onSuccess()
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('400')
          ? 'Invalid RTSP URL. Must start with rtsp:// or rtsps://'
          : 'Failed to create stream.'
      setMsg({ text: message, ok: false })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <FormCard title="Add Stream" icon={Radio}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DashInput
                label="Stream Name"
                value={name}
                onChange={setName}
                placeholder="e.g. Pavilion Front Camera"
              />
              <DashInput
                label="RTSP URL"
                value={rtspUrl}
                onChange={setRtspUrl}
                placeholder="rtsp://user:pass@ip:554/path"
              />
              <div className="rounded-lg border border-overlay0/50 bg-base/50 px-3.5 py-2.5">
                <p className="mb-0 text-xs text-subtext0">
                  Creates an RTSP-to-HLS stream on Restreamer. The stream will
                  appear in the Restreamer UI where you can set up YouTube or
                  Facebook egress.
                </p>
              </div>
              <StatusBanner msg={msg} />
              <SubmitBtn submitting={submitting} label="Create Stream" />
            </form>
          </FormCard>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          <ListCard
            title="Active Streams"
            count={streams.length}
            loading={loading}
            empty={streams.length === 0}
            emptyIcon={Radio}
            emptyText="No streams yet. Create one to get started."
          >
            {streams.map((s, i) => (
              <StreamRow
                key={s.streamId}
                stream={s}
                index={i}
                restarting={restarting === s.streamId}
                copied={copied === s.streamId}
                onRestart={() => handleRestart(s.streamId)}
                onCopy={() => handleCopy(s.hlsUrl, s.streamId)}
                onDelete={() =>
                  setConfirmDelete({
                    id: s.streamId,
                    name: s.name,
                  })
                }
              />
            ))}
          </ListCard>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDeleteDialog
          name={confirmDelete.name}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}

/* ──── Form Shared Components ──── */

type FormMsg = { text: string; ok: boolean } | null

/** Auto-dismiss form messages after 4 seconds. */
function useAutoHide(msg: FormMsg, setMsg: (m: FormMsg) => void) {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 4000)
    return () => clearTimeout(t)
  }, [msg, setMsg])
}

function FormCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Film
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-overlay0 bg-surface0 shadow-lg">
      {/* Accent top bar */}
      <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
      <div className="p-5">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10">
            <Icon size={14} className="text-accent" />
          </div>
          <h5 className="mb-0 !text-base font-semibold text-text">{title}</h5>
        </div>
        {children}
      </div>
    </div>
  )
}

function DashInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-xs font-medium text-subtext0">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-overlay0 bg-base px-3.5 py-2.5 font-sans text-sm text-text transition-[border-color,box-shadow] duration-200 placeholder:text-overlay1 focus:border-accent focus:ring-2 focus:ring-accent-glow focus:outline-none"
      />
    </div>
  )
}

function SubmitBtn({
  submitting,
  label,
}: {
  submitting: boolean
  label: string
}) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 font-sans text-sm font-semibold text-crust shadow-md transition-[scale,background-color,box-shadow,opacity] duration-350 ease-[var(--spring-snappy)] hover:scale-[1.02] hover:bg-accent-hover hover:shadow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
    >
      {submitting && <Loader2 size={16} className="animate-spin" />}
      {submitting ? 'Adding...' : label}
    </button>
  )
}

function StatusBanner({ msg }: { msg: FormMsg }) {
  if (!msg) return null
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium ${
        msg.ok
          ? 'border-teal/20 bg-teal/10 text-teal'
          : 'border-live/20 bg-live/10 text-live'
      }`}
      style={{
        opacity: 0,
        animation: 'scale-fade-in 300ms var(--spring-poppy) forwards',
      }}
    >
      {msg.ok ? <Check size={16} /> : <AlertCircle size={16} />}
      {msg.text}
    </div>
  )
}

/* ──── List Shared Components ──── */

function ListCard({
  title,
  count,
  loading,
  empty,
  emptyIcon: EmptyIcon,
  emptyText,
  children,
}: {
  title: string
  count: number
  loading: boolean
  empty: boolean
  emptyIcon: typeof Film
  emptyText: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-overlay0 bg-surface0 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-overlay0/50 px-5 py-3.5">
        <h5 className="mb-0 !text-sm font-medium text-subtext1">{title}</h5>
        <span className="rounded-full bg-surface1 px-2.5 py-0.5 font-mono text-xs font-medium text-subtext0">
          {count}
        </span>
      </div>

      {/* Body */}
      {loading ? (
        <ListSkeleton />
      ) : empty ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface1">
            <EmptyIcon size={22} className="text-subtext0" />
          </div>
          <p className="mb-0 max-w-[200px] text-sm text-subtext0">
            {emptyText}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-overlay0/30">{children}</div>
      )}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="divide-y divide-overlay0/30">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-surface1" />
            <div className="h-3 w-20 animate-pulse rounded bg-surface1" />
          </div>
          <div className="h-5 w-12 animate-pulse rounded-full bg-surface1" />
        </div>
      ))}
    </div>
  )
}

function PaginationControls({
  page,
  perPage,
  total,
  onPageChange,
}: {
  page: number
  perPage: number
  total: number
  onPageChange: (p: number) => void
}) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between border-t border-overlay0/30 px-5 py-3">
      <p className="mb-0 text-xs text-subtext0">
        {from}&ndash;{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-subtext0 transition-colors duration-150 hover:bg-surface1 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="px-2 font-mono text-xs text-subtext0">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-subtext0 transition-colors duration-150 hover:bg-surface1 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

/* ──── Item Rows ──── */

function VideoRow({
  video,
  index,
  onEdit,
  onDelete,
}: {
  video: Video
  index: number
  onEdit: (video: Video) => void
  onDelete: (id: number, name: string) => void
}) {
  const typeLabel = VIDEO_TYPE_LABELS[video.type] ?? video.type
  const isActive = video.status === 'active'
  return (
    <div
      className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface1/50"
      style={staggerStyle(index)}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-0 truncate text-sm font-medium text-text">
          {video.title}
        </p>
        <p className="mb-0 truncate text-xs text-subtext0">
          {video.state_name}
          {video.sublocation_name ? ` \u00B7 ${video.sublocation_name}` : ''}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
        {typeLabel}
      </span>
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${isActive ? 'text-teal' : 'text-subtext0'}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-teal' : 'bg-overlay2'}`}
        />
        {isActive ? 'Live' : 'Off'}
      </span>
      <EditBtn onClick={() => onEdit(video)} />
      <DeleteBtn onClick={() => onDelete(video.video_id, video.title)} />
    </div>
  )
}

function StateRow({
  state,
  index,
  onEdit,
  onDelete,
}: {
  state: State
  index: number
  onEdit: (state: State) => void
  onDelete: (slug: string, name: string) => void
}) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface1/50"
      style={staggerStyle(index)}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-0 truncate text-sm font-medium text-text">
          {state.name}
        </p>
        <p className="mb-0 text-xs text-subtext0">
          {timeAgo(state.created_at)}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-surface1 px-2.5 py-0.5 font-mono text-xs text-subtext0">
        {state.video_count} cam{state.video_count !== 1 ? 's' : ''}
      </span>
      <EditBtn onClick={() => onEdit(state)} />
      <DeleteBtn onClick={() => onDelete(state.slug, state.name)} />
    </div>
  )
}

function SublocationRow({
  sublocation,
  index,
  onEdit,
  onDelete,
}: {
  sublocation: Sublocation
  index: number
  onEdit: (sublocation: Sublocation) => void
  onDelete: (id: number, name: string) => void
}) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface1/50"
      style={staggerStyle(index)}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-0 truncate text-sm font-medium text-text">
          {sublocation.name}
        </p>
        <p className="mb-0 truncate text-xs text-subtext0">
          {sublocation.state_name}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-surface1 px-2.5 py-0.5 font-mono text-xs text-subtext0">
        {sublocation.video_count} cam
        {sublocation.video_count !== 1 ? 's' : ''}
      </span>
      <EditBtn onClick={() => onEdit(sublocation)} />
      <DeleteBtn
        onClick={() =>
          onDelete(sublocation.sublocation_id, sublocation.name)
        }
      />
    </div>
  )
}

function StreamRow({
  stream,
  index,
  restarting,
  copied,
  onRestart,
  onCopy,
  onDelete,
}: {
  stream: StreamDetail
  index: number
  restarting: boolean
  copied: boolean
  onRestart: () => void
  onCopy: () => void
  onDelete: () => void
}) {
  const isRunning = stream.status === 'running'
  const isFailed = stream.status === 'failed'
  const statusColor = isRunning
    ? 'text-teal'
    : isFailed
      ? 'text-live'
      : 'text-subtext0'
  const dotColor = isRunning
    ? 'bg-teal'
    : isFailed
      ? 'bg-live'
      : 'bg-overlay2'

  const runtime = formatRuntime(stream.runtimeSeconds)

  return (
    <div
      className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-surface1/50"
      style={staggerStyle(index)}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-0 truncate text-sm font-medium text-text">
          {stream.name}
        </p>
        <p className="mb-0 truncate text-xs text-subtext0">
          {runtime}
          {stream.fps ? ` \u00B7 ${stream.fps.toFixed(1)} fps` : ''}
          {stream.bitrateKbit
            ? ` \u00B7 ${(stream.bitrateKbit / 1000).toFixed(1)} Mbps`
            : ''}
        </p>
      </div>

      {/* Status badge */}
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${statusColor}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {stream.status}
      </span>

      {/* Copy HLS URL */}
      <button
        type="button"
        onClick={onCopy}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-subtext0 transition-colors duration-150 hover:bg-accent/10 hover:text-accent"
        title={copied ? 'Copied!' : 'Copy HLS URL'}
      >
        {copied ? <Check size={14} className="text-teal" /> : <Copy size={14} />}
      </button>

      {/* Restart */}
      <button
        type="button"
        onClick={onRestart}
        disabled={restarting}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-subtext0 transition-colors duration-150 hover:bg-accent/10 hover:text-accent disabled:pointer-events-none disabled:opacity-40"
        title="Restart stream"
      >
        <RefreshCw
          size={14}
          className={restarting ? 'animate-spin' : ''}
        />
      </button>

      {/* Delete */}
      <DeleteBtn onClick={onDelete} />
    </div>
  )
}

/* ──── Row Action Buttons ──── */

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-subtext0 transition-colors duration-150 hover:bg-accent/10 hover:text-accent"
      title="Edit"
    >
      <Pencil size={14} />
    </button>
  )
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-subtext0 transition-colors duration-150 hover:bg-live/10 hover:text-live"
      title="Delete"
    >
      <Trash2 size={14} />
    </button>
  )
}

/* ──── Confirm Delete Dialog ──── */

function ConfirmDeleteDialog({
  name,
  deleting,
  onConfirm,
  onCancel,
}: {
  name: string
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-sm rounded-xl border border-overlay0 bg-surface0 p-6 shadow-2xl"
        style={{
          opacity: 0,
          animation: 'scale-fade-in 250ms var(--spring-poppy) forwards',
        }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-live/10">
            <Trash2 size={18} className="text-live" />
          </div>
          <div>
            <h5 className="mb-0 !text-base font-semibold text-text">
              Confirm Delete
            </h5>
            <p className="mb-0 text-xs text-subtext0">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="mb-5 text-sm text-subtext1">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-text">{name}</span>?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-lg border border-overlay0 bg-surface1 px-4 py-2 text-sm font-medium text-text transition-colors duration-150 hover:bg-surface2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-live px-4 py-2 text-sm font-semibold text-white transition-[background-color,opacity] duration-150 hover:bg-live/90 disabled:opacity-60"
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──── Edit Modals ──── */

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-md rounded-xl border border-overlay0 bg-surface0 shadow-2xl"
        style={{
          opacity: 0,
          animation: 'scale-fade-in 250ms var(--spring-poppy) forwards',
        }}
      >
        <div className="flex items-center justify-between border-b border-overlay0/50 px-5 py-3.5">
          <h5 className="mb-0 !text-base font-semibold text-text">{title}</h5>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-subtext0 transition-colors duration-150 hover:bg-surface1"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function EditStateModal({
  state,
  getToken,
  onSuccess,
  onClose,
}: {
  state: State
  getToken: () => Promise<string | null>
  onSuccess: () => void
  onClose: () => void
}) {
  const [name, setName] = useState(state.name)
  const [description, setDescription] = useState(state.description)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<FormMsg>(null)

  useAutoHide(msg, setMsg)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      setMsg({ text: 'Name is required.', ok: false })
      return
    }
    setSubmitting(true)
    setMsg(null)
    try {
      const token = await getToken()
      await updateState(state.state_id, { name, description }, token)
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to update state.', ok: false })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell title="Edit State" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DashInput
          label="State Name"
          value={name}
          onChange={setName}
          placeholder="e.g. Florida"
        />
        <DashInput
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Brief description (optional)"
        />
        <StatusBanner msg={msg} />
        <SubmitBtn submitting={submitting} label="Save Changes" />
      </form>
    </ModalShell>
  )
}

function EditSublocationModal({
  sublocation,
  states,
  getToken,
  onSuccess,
  onClose,
}: {
  sublocation: Sublocation
  states: Array<State>
  getToken: () => Promise<string | null>
  onSuccess: () => void
  onClose: () => void
}) {
  const [name, setName] = useState(sublocation.name)
  const [description, setDescription] = useState(sublocation.description)
  const [stateId, setStateId] = useState<number>(sublocation.state_id)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<FormMsg>(null)

  useAutoHide(msg, setMsg)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !stateId) {
      setMsg({ text: 'Name and state are required.', ok: false })
      return
    }
    setSubmitting(true)
    setMsg(null)
    try {
      const token = await getToken()
      await updateSublocation(
        sublocation.sublocation_id,
        { name, description, state_id: stateId },
        token,
      )
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to update sublocation.', ok: false })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell title="Edit Sublocation" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DashInput
          label="Sublocation Name"
          value={name}
          onChange={setName}
          placeholder="e.g. Miami Beach"
        />
        <Dropdown
          label="Parent State"
          options={states.map((s) => ({
            value: s.state_id,
            label: s.name,
          }))}
          selectedValue={stateId}
          onSelect={(v) => setStateId(Number(v))}
        />
        <DashInput
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Brief description (optional)"
        />
        <StatusBanner msg={msg} />
        <SubmitBtn submitting={submitting} label="Save Changes" />
      </form>
    </ModalShell>
  )
}

function EditVideoModal({
  video,
  states,
  sublocations,
  getToken,
  onSuccess,
  onClose,
}: {
  video: Video
  states: Array<State>
  sublocations: Array<Sublocation>
  getToken: () => Promise<string | null>
  onSuccess: () => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(video.title)
  const [src, setSrc] = useState(video.src)
  const [type, setType] = useState(video.type)
  const [stateId, setStateId] = useState<number>(video.state_id)
  const [sublocationId, setSublocationId] = useState<number | ''>(
    video.sublocation_id ?? '',
  )
  const [status, setStatus] = useState(video.status)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<FormMsg>(null)

  useAutoHide(msg, setMsg)

  const filteredSubs = sublocations.filter((s) => s.state_id === stateId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !src || !type || !stateId) {
      setMsg({ text: 'Please fill in all required fields.', ok: false })
      return
    }
    setSubmitting(true)
    setMsg(null)
    try {
      const token = await getToken()
      await updateVideo(
        video.video_id,
        {
          title,
          src,
          type,
          state_id: stateId,
          sublocation_id: sublocationId ? Number(sublocationId) : null,
          status,
        },
        token,
      )
      onSuccess()
    } catch {
      setMsg({ text: 'Failed to update camera.', ok: false })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell title="Edit Camera" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DashInput
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="e.g. Miami Beach South Cam"
        />
        <DashInput
          label="Source URL"
          value={src}
          onChange={setSrc}
          placeholder="e.g. https://stream.example.com/live.m3u8"
        />
        <Dropdown
          label="Video Type"
          options={VIDEO_TYPE_OPTIONS}
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
          options={STATUS_OPTIONS}
          selectedValue={status}
          onSelect={(v) => setStatus(String(v))}
        />
        <StatusBanner msg={msg} />
        <SubmitBtn submitting={submitting} label="Save Changes" />
      </form>
    </ModalShell>
  )
}

/* ──── Utilities ──── */

function staggerStyle(index: number): React.CSSProperties | undefined {
  if (index >= 10) return undefined
  return {
    opacity: 0,
    animation: `fade-in-up 400ms var(--spring-smooth) ${index * 50}ms forwards`,
  }
}

function formatRuntime(seconds: number): string {
  if (seconds <= 0) return 'not started'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m uptime`
  if (m > 0) return `${m}m uptime`
  return `${seconds}s uptime`
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
