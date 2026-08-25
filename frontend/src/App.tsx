import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildQuery,
  fetchUsaTourRequests,
  type Filters,
  type UsaTourRequest,
} from './api'
import { exportToExcel } from './exportExcel'
import TopNav from './TopNav'
import './App.css'

const EVENT_TYPES = [
  { value: '', label: 'All' },
  { value: 'Public', label: 'Public' },
  { value: 'Private', label: 'Private' },
]
const PAGE_SIZES = [10, 25, 50, 100]

const DEFAULT_FILTERS: Filters = {
  event_type: 'Public',
  // Left blank on purpose: the API matches `location` exactly, so seeding it
  // with a city would load an empty table on first paint.
  location: '',
  limit: 25,
  offset: 0,
}

type Result = {
  key: string
  rows: UsaTourRequest[]
  total: number
  error: string | null
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [locationInput, setLocationInput] = useState(DEFAULT_FILTERS.location)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // One request is identified by its query plus the manual-refresh counter, so
  // "still loading" is simply "the settled result is not for this request".
  const requestKey = `${reloadKey}|${buildQuery(filters)}`
  const loading = result?.key !== requestKey
  const rows = result?.rows ?? []
  const total = result?.total ?? 0
  const error = result?.error ?? null

  // Debounce the free-text location field into the applied filters.
  useEffect(() => {
    if (locationInput === filters.location) return
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, location: locationInput, offset: 0 }))
    }, 350)
    return () => clearTimeout(timer)
  }, [locationInput, filters.location])

  useEffect(() => {
    const controller = new AbortController()

    fetchUsaTourRequests(filters, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setResult({
          key: requestKey,
          rows: data.list ?? [],
          total: data.total ?? 0,
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setResult({
          key: requestKey,
          rows: [],
          total: 0,
          error: err instanceof Error ? err.message : 'Something went wrong',
        })
      })

    return () => controller.abort()
  }, [filters, requestKey])

  const patch = useCallback((next: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, offset: 0, ...next }))
  }, [])

  const handleExport = useCallback(async () => {
    setExporting(true)
    setExportError(null)
    try {
      // Export every row matching the current filters, not just this page.
      const data = await fetchUsaTourRequests({
        ...filters,
        offset: 0,
        limit: Math.max(total, filters.limit),
      })
      await exportToExcel(data.list ?? [], filters)
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }, [filters, total])

  const page = Math.floor(filters.offset / filters.limit) + 1
  const pageCount = Math.max(1, Math.ceil(total / filters.limit))
  const rangeStart = total === 0 ? 0 : filters.offset + 1
  const rangeEnd = Math.min(filters.offset + filters.limit, total)

  const resultLabel = useMemo(() => {
    if (loading) return 'Loading…'
    if (error) return 'Could not load requests'
    if (total === 0) return 'No requests found'
    return `Showing ${rangeStart}–${rangeEnd} of ${total}`
  }, [loading, error, total, rangeStart, rangeEnd])

  return (
    <>
      <TopNav
        onExport={handleExport}
        exporting={exporting}
        canExport={!loading && total > 0}
      />

      <div className="page">
        <header className="page-header">
          <div>
            <h1>USA Tour Requests</h1>
            <p className="subtitle">
              Admin view of incoming tour requests, filtered by event type and
              location.
            </p>
          </div>
          <button
            type="button"
            className="btn ghost"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </header>

        <section className="filters" aria-label="Filters">
          <div className="filter-group">
            <span className="filter-label" id="event-type-label">
              Event type
            </span>
            <div className="segmented" role="group" aria-labelledby="event-type-label">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={
                    filters.event_type === type.value ? 'seg active' : 'seg'
                  }
                  aria-pressed={filters.event_type === type.value}
                  onClick={() => patch({ event_type: type.value })}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <label className="filter-group grow">
            <span className="filter-label">Location</span>
            <span className="search">
              <svg className="search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="5.25" stroke="currentColor" strokeWidth="1.7" />
                <path d="m13 13 3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Exact location, e.g. Dallas"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
              {locationInput && (
                <button
                  type="button"
                  className="search-clear"
                  aria-label="Clear location"
                  onClick={() => setLocationInput('')}
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="m6.5 6.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </span>
          </label>

          <label className="filter-group">
            <span className="filter-label">Rows</span>
            <select
              className="control"
              value={filters.limit}
              onChange={(e) => patch({ limit: Number(e.target.value) })}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn ghost reset"
            onClick={() => {
              setLocationInput(DEFAULT_FILTERS.location)
              setFilters(DEFAULT_FILTERS)
            }}
          >
            Reset
          </button>
        </section>

        <div className="table-meta">
          <span className={error ? 'meta-error' : undefined}>{resultLabel}</span>
        </div>

        {error && (
          <div className="alert" role="alert">
            <span>
              <strong>Request failed.</strong> {error}
            </span>
            <button
              type="button"
              className="btn small ghost"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {exportError && (
          <div className="alert" role="alert">
            <span>
              <strong>Export failed.</strong> {exportError}
            </span>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Name</th>
                <th>Mobile number</th>
                <th>Event type</th>
                <th>Tour date</th>
                <th>Location</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j}>
                        <span className="skeleton" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td className="empty" colSpan={7}>
                    No tour requests match these filters.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="num">{filters.offset + index + 1}</td>
                    <td className="strong">{row.name}</td>
                    <td>
                      {row.mobile_number ? (
                        <a href={`tel:${row.mobile_number}`}>
                          {row.mobile_number}
                        </a>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={
                          row.event_type?.toLowerCase() === 'private'
                            ? 'badge private'
                            : 'badge public'
                        }
                      >
                        {row.event_type}
                      </span>
                    </td>
                    <td>{row.tour_date}</td>
                    <td>{row.location}</td>
                    <td className="muted">{formatDateTime(row.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <footer className="pagination">
          <span className="muted">
            Page {page} of {pageCount}
          </span>
          <div className="pager-buttons">
            <button
              type="button"
              className="btn ghost"
              disabled={loading || filters.offset === 0}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit),
                }))
              }
            >
              Previous
            </button>
            <button
              type="button"
              className="btn ghost"
              disabled={loading || rangeEnd >= total}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App
