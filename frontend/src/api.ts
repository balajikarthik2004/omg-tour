import { MOCK_REQUESTS } from './mockData'

export type UsaTourRequest = {
  id: string
  name: string
  mobile_number: string
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

/** Serve placeholder rows until the admin API is wired up. */
export const USE_MOCK_DATA =
  (import.meta.env.VITE_USE_MOCK_DATA as string | undefined) !== 'false'

export function buildQuery(filters: Filters): string {
  const params = new URLSearchParams()
  if (filters.event_type) params.set('event_type', filters.event_type)
  if (filters.location) params.set('location', filters.location)
  params.set('limit', String(filters.limit))
  params.set('offset', String(filters.offset))
  return params.toString()
}

function mockResponse(filters: Filters): UsaTourRequestsResponse['data'] {
  const location = filters.location.trim().toLowerCase()
  const matched = MOCK_REQUESTS.filter(
    (row) =>
      (!filters.event_type || row.event_type === filters.event_type) &&
      (!location || row.location.toLowerCase().includes(location)),
  )

  return {
    total: matched.length,
    list: matched.slice(filters.offset, filters.offset + filters.limit),
    limit: filters.limit,
    offset: filters.offset,
  }
}

export async function fetchUsaTourRequests(
  filters: Filters,
  signal?: AbortSignal,
): Promise<UsaTourRequestsResponse['data']> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 250))
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    return mockResponse(filters)
  }

  const url = `/admin/usa-tour-requests?${buildQuery(filters)}`

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
