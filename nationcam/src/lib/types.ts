export interface State {
  state_id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
  slug?: string
  video_count?: number
}

export interface Sublocation {
  sublocation_id: number
  name: string
  description: string | null
  state_id: number
  slug: string
  created_at: string
  updated_at: string
  state_name?: string
  video_count?: number
}

export interface Video {
  video_id: number
  title: string
  src: string
  type:
    | 'mp4'
    | 'webm'
    | 'ogg'
    | 'application/x-mpegURL'
    | 'application/dash+xml'
  state_id: number
  sublocation_id: number | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  state_name?: string
  sublocation_name?: string
}

export interface User {
  user_id: number
  [key: string]: unknown
}

export interface CreateStateInput {
  name: string
  description?: string
}

export interface CreateSublocationInput {
  name: string
  description?: string
  state_id: number
}

export interface CreateVideoInput {
  title: string
  src: string
  type: string
  state_id: number
  sublocation_id?: number | null
  status?: string
}
