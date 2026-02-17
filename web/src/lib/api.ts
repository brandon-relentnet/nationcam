import type {
  CreateStateInput,
  CreateSublocationInput,
  CreateVideoInput,
  State,
  Sublocation,
  Video,
} from '@/lib/types'

const API_BASE = '/api'

/* ──── Helpers ──── */

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

async function post<T>(
  path: string,
  body: unknown,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${path} failed: ${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}

/* ──── States ──── */

export async function fetchStates(): Promise<Array<State>> {
  return get<Array<State>>('/states')
}

export async function fetchStateBySlug(slug: string): Promise<State> {
  return get<State>(`/states/${slug}`)
}

export async function createState(
  input: CreateStateInput,
  token?: string | null,
): Promise<State> {
  return post<State>(
    '/states',
    {
      name: input.name,
      description: input.description ?? '',
    },
    token,
  )
}

/* ──── Sublocations ──── */

export async function fetchSublocationsByState(
  stateSlug: string,
): Promise<Array<Sublocation>> {
  return get<Array<Sublocation>>(`/states/${stateSlug}/sublocations`)
}

export async function fetchSublocationBySlug(
  slug: string,
): Promise<Sublocation> {
  return get<Sublocation>(`/sublocations/${slug}`)
}

export async function createSublocation(
  input: CreateSublocationInput,
  token?: string | null,
): Promise<Sublocation> {
  return post<Sublocation>(
    '/sublocations',
    {
      name: input.name,
      description: input.description ?? '',
      state_id: input.state_id,
    },
    token,
  )
}

/* ──── Videos ──── */

export async function fetchVideos(): Promise<Array<Video>> {
  return get<Array<Video>>('/videos')
}

export async function fetchVideosByState(
  stateId: number,
): Promise<Array<Video>> {
  return get<Array<Video>>(`/videos?state_id=${stateId}`)
}

export async function fetchVideosBySublocation(
  sublocationId: number,
): Promise<Array<Video>> {
  return get<Array<Video>>(`/videos?sublocation_id=${sublocationId}`)
}

export async function createVideo(
  input: CreateVideoInput,
  token?: string | null,
): Promise<Video> {
  return post<Video>(
    '/videos',
    {
      title: input.title,
      src: input.src,
      type: input.type,
      state_id: input.state_id,
      sublocation_id: input.sublocation_id ?? null,
      status: input.status ?? 'active',
    },
    token,
  )
}
