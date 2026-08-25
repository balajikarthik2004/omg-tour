export type UsaTourRequest = {
  id: string
  name: string
  mobile_number: string | null
  event_type: string
  tour_date: string
  location: string
  createdAt: string
  updatedAt: string
}

export type UsaTourRequestsResponse = {
  success: boolean
  message: string
  data: {
    total: number
    list: UsaTourRequest[]
    limit: number
    offset: number
  }
}

export type Filters = {
  event_type: string
  location: string
  limit: number
  offset: number
}

const TOKEN = import.meta.env.VITE_API_TOKEN as string | undefined

const DEFAULT_API_BASE_URL =
  'https://omg-temple-service-966169042016.asia-south1.run.app'

/** Trailing slashes stripped so the path below always joins cleanly. */
const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  DEFAULT_API_BASE_URL
).replace(/\/+$/, '')

export function buildQuery(filters: Filters): string {
  const params = new URLSearchParams()
  if (filters.event_type) params.set('event_type', filters.event_type)
  if (filters.location) params.set('location', filters.location)
  params.set('limit', String(filters.limit))
  params.set('offset', String(filters.offset))
  return params.toString()
}

export async function fetchUsaTourRequests(
  filters: Filters,
  signal?: AbortSignal,
): Promise<UsaTourRequestsResponse['data']> {
  const url = `${API_BASE_URL}/admin/usa-tour-requests?${buildQuery(filters)}`

  const res = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  })

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }

  const body = (await res.json()) as UsaTourRequestsResponse
  if (!body.success) {
    throw new Error(body.message || 'Request was not successful')
  }

  return body.data
}
