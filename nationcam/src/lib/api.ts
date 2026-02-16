import type {
  CreateStateInput,
  CreateSublocationInput,
  CreateVideoInput,
  State,
  Sublocation,
  Video,
} from '@/lib/types'
import { generateSlug } from '@/lib/utils'

const API_BASE = '/api'

const ADMIN_JWT = import.meta.env['VITE_ADMIN_JWT'] ?? ''

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

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'return=representation',
      ...(ADMIN_JWT ? { Authorization: `Bearer ${ADMIN_JWT}` } : {}),
    },
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
  // PostgREST: get states with video count via resource embedding
  const rows = await get<Array<State & { videos?: Array<{ count: number }> }>>(
    '/states?select=*,videos(count)&order=name',
  )

  return rows.map((row) => ({
    ...row,
    video_count: row.videos?.[0]?.count ?? 0,
    slug: row.slug || generateSlug(row.name),
    videos: undefined,
  })) as Array<State>
}

export async function createState(
  input: CreateStateInput,
): Promise<Array<State>> {
  return post<Array<State>>('/states', {
    name: input.name,
    description: input.description ?? null,
    slug: generateSlug(input.name),
  })
}

/* ──── Sublocations ──── */

export async function fetchSublocations(): Promise<Array<Sublocation>> {
  // PostgREST: get sublocations with state name and video count
  const rows = await get<
    Array<
      Sublocation & {
        states?: { name: string }
        videos?: Array<{ count: number }>
      }
    >
  >('/sublocations?select=*,states(name),videos(count)')

  return rows.map((row) => ({
    ...row,
    state_name: row.states?.name,
    video_count: row.videos?.[0]?.count ?? 0,
    slug: row.slug || generateSlug(row.name),
    states: undefined,
    videos: undefined,
  })) as Array<Sublocation>
}

export async function createSublocation(
  input: CreateSublocationInput,
): Promise<Array<Sublocation>> {
  return post<Array<Sublocation>>('/sublocations', {
    name: input.name,
    description: input.description ?? null,
    state_id: input.state_id,
    slug: generateSlug(input.name),
  })
}

/* ──── Videos ──── */

export async function fetchVideosByState(
  stateId: number,
): Promise<Array<Video>> {
  return get<Array<Video>>(
    `/videos?state_id=eq.${stateId}&status=eq.active&order=title`,
  )
}

export async function fetchVideosBySublocation(
  sublocationId: number,
): Promise<Array<Video>> {
  return get<Array<Video>>(
    `/videos?sublocation_id=eq.${sublocationId}&status=eq.active&select=*,states:state_id(name),sublocations:sublocation_id(name)&order=title`,
  )
}

export async function createVideo(
  input: CreateVideoInput,
): Promise<Array<Video>> {
  return post<Array<Video>>('/videos', {
    title: input.title,
    src: input.src,
    type: input.type,
    state_id: input.state_id,
    sublocation_id: input.sublocation_id ?? null,
    status: input.status ?? 'active',
  })
}
