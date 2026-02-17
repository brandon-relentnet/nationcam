export interface State {
  state_id: number
  name: string
  description: string
  slug: string
  created_at: string
  updated_at: string
  video_count: number
}

export interface Sublocation {
  sublocation_id: number
  name: string
  description: string
  state_id: number
  slug: string
  created_at: string
  updated_at: string
  state_name: string
  video_count: number
}

export interface Video {
  video_id: number
  title: string
  src: string
  type: string
  state_id: number
  sublocation_id: number | null
  status: 'active' | 'inactive'
  created_by: string
  created_at: string
  updated_at: string
  state_name: string
  sublocation_name: string
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
