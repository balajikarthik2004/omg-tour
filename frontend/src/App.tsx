import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildQuery,
  fetchUsaTourRequests,
  OVERVIEW_LIMIT,
  summarize,
  type Filters,
  type Overview,
  type UsaTourRequest,
} from './api'
import { exportToExcel } from './exportExcel'
import StatTiles from './StatTiles'
import TopNav from './TopNav'
import {
  AlertIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  GlobeIcon,
  InboxIcon,
  LockIcon,
  PinIcon,
  RefreshIcon,
  ResetIcon,
  RowsIcon,
  TicketIcon,
} from './Icons'
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
  fetchedAt: number
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  // The year is dropped for the current year to keep the column narrow.
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleString(undefined, {
    year: sameYear ? undefined : 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(stamp: number): string {
  return new Date(stamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 1 … 4 5 6 … 12 — keeps the pager a fixed width on long result sets. */
function pageList(current: number, count: number): (number | 'gap')[] {
  if (count <= 7) {
    return Array.from({ length: count }, (_, i) => i + 1)
  }

  const pages: (number | 'gap')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(count - 1, current + 1)

  if (start > 2) pages.push('gap')
  for (let p = start; p <= end; p += 1) pages.push(p)
  if (end < count - 1) pages.push('gap')
  pages.push(count)

  return pages
}

function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // One request is identified by its query plus the manual-refresh counter, so
  // "still loading" is simply "the settled result is not for this request".
  const requestKey = `${reloadKey}|${buildQuery(filters)}`
  const loading = result?.key !== requestKey
  const rows = result?.rows ?? []
  const total = result?.total ?? 0
  const error = result?.error ?? null

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
          fetchedAt: Date.now(),
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setResult({
          key: requestKey,
          rows: [],
          total: 0,
          error: err instanceof Error ? err.message : 'Something went wrong',
          fetchedAt: Date.now(),
        })
      })

    return () => controller.abort()
  }, [filters, requestKey])

  // Unfiltered snapshot behind the summary tiles and the location options. It
  // is supplementary, so a failure stays silent — the table's own banner
  // already reports an unreachable API.
  useEffect(() => {
    const controller = new AbortController()

    fetchUsaTourRequests(
      { event_type: '', location: '', limit: OVERVIEW_LIMIT, offset: 0 },
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) return
        setOverview(summarize(data.list ?? [], data.total ?? 0))
      })
      .catch(() => {})

    return () => controller.abort()
  }, [reloadKey])

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
  const filtersActive = filters.event_type !== '' || filters.location !== ''

  const resultLabel = useMemo(() => {
    if (loading) return 'Loading…'
    if (error) return 'Could not load requests'
    if (total === 0) return 'No requests found'
    return `Showing ${rangeStart}–${rangeEnd} of ${total}`
  }, [loading, error, total, rangeStart, rangeEnd])

  // Keep a location that came from elsewhere selectable even before the
  // snapshot lands.
  const locationOptions = useMemo(() => {
    const known = overview?.locations ?? []
    return filters.location && !known.includes(filters.location)
      ? [filters.location, ...known]
      : known
  }, [overview, filters.location])

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
          <div className="header-actions">
            {result && !error && (
              <span className="stamp">
                <ClockIcon className="stamp-icon" />
                Updated {formatTime(result.fetchedAt)}
              </span>
            )}
            <button
              type="button"
              className="btn ghost"
              onClick={() => setReloadKey((k) => k + 1)}
              disabled={loading}
            >
              <RefreshIcon
                className={loading ? 'btn-icon spinning' : 'btn-icon'}
              />
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </header>

        <StatTiles overview={overview} />

        <section className="filters" aria-label="Filters">
          <div className="filter-group">
            <span className="filter-label" id="event-type-label">
              <TicketIcon className="filter-icon" />
              Event type
            </span>
            <div
              className="segmented"
              role="group"
              aria-labelledby="event-type-label"
            >
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
            <span className="filter-label">
              <PinIcon className="filter-icon" />
              Location
            </span>
            <select
              className="control"
              value={filters.location}
              onChange={(e) => patch({ location: e.target.value })}
            >
              <option value="">All locations</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-group">
            <span className="filter-label">
              <RowsIcon className="filter-icon" />
              Rows
            </span>
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
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            <ResetIcon className="btn-icon" />
            Reset
          </button>
        </section>

        <div className="table-meta">
          <span className={error ? 'meta-error' : undefined}>{resultLabel}</span>
        </div>

        {error && (
          <div className="alert" role="alert">
            <span>
              <AlertIcon className="alert-icon" />
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
              <AlertIcon className="alert-icon" />
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
                <th>Email</th>
                <th>Event type</th>
                <th>Tour date</th>
                <th>Location</th>
                <th>Event venue</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j}>
                        <span className="skeleton" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td className="empty" colSpan={9}>
                    <span className="empty-art">
                      <InboxIcon className="empty-icon" />
                    </span>
                    <span className="empty-title">No tour requests found</span>
                    <span className="empty-hint">
                      {filtersActive
                        ? 'No records match the current filters.'
                        : 'There are no requests to show yet.'}
                    </span>
                    {filtersActive && (
                      <button
                        type="button"
                        className="btn ghost small"
                        onClick={() =>
                          setFilters({
                            event_type: '',
                            location: '',
                            limit: filters.limit,
                            offset: 0,
                          })
                        }
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="num" data-label="#">
                      {filters.offset + index + 1}
                    </td>
                    <td className="strong" data-label="Name">
                      <span className="clamp" title={row.name}>
                        {row.name}
                      </span>
                    </td>
                    <td data-label="Mobile number">
                      {row.mobile_number ? (
                        <a href={`tel:${row.mobile_number}`}>
                          {row.mobile_number}
                        </a>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td data-label="Email">
                      {row.email ? (
                        <a href={`mailto:${row.email}`}>{row.email}</a>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td data-label="Event type">
                      {row.event_type?.toLowerCase() === 'private' ? (
                        <span className="badge private">
                          <LockIcon className="badge-icon" />
                          {row.event_type}
                        </span>
                      ) : (
                        <span className="badge public">
                          <GlobeIcon className="badge-icon" />
                          {row.event_type}
                        </span>
                      )}
                    </td>
                    <td data-label="Tour date">{row.tour_date}</td>
                    <td data-label="Location">
                      <span className="clamp" title={row.location}>
                        {row.location}
                      </span>
                    </td>
                    <td data-label="Event venue">
                      {row.event_venue ? (
                        <span className="clamp" title={row.event_venue}>
                          {row.event_venue}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="muted" data-label="Created">
                      {formatDateTime(row.createdAt)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <nav className="pagination" aria-label="Pagination">
            <span className="muted">
              Page {page} of {pageCount}
            </span>
            <div className="pager-buttons">
              <button
                type="button"
                className="btn ghost small"
                disabled={loading || filters.offset === 0}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    offset: Math.max(0, prev.offset - prev.limit),
                  }))
                }
              >
                <ChevronLeftIcon className="btn-icon sm" />
                Previous
              </button>

              {pageList(page, pageCount).map((entry, i) =>
                entry === 'gap' ? (
                  <span className="pager-gap" key={`gap-${i}`}>
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    key={entry}
                    className={
                      entry === page ? 'pager-page active' : 'pager-page'
                    }
                    aria-current={entry === page ? 'page' : undefined}
                    disabled={loading}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        offset: (entry - 1) * prev.limit,
                      }))
                    }
                  >
                    {entry}
                  </button>
                ),
              )}

              <button
                type="button"
                className="btn ghost small"
                disabled={loading || rangeEnd >= total}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    offset: prev.offset + prev.limit,
                  }))
                }
              >
                Next
                <ChevronRightIcon className="btn-icon sm" />
              </button>
            </div>
          </nav>
        )}
      </div>
    </>
  )
}

export default App
