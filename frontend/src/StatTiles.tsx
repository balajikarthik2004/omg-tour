import type { ReactNode } from 'react'
import type { Overview } from './api'

type StatTilesProps = {
  overview: Overview | null
}

function share(part: number, whole: number): number {
  if (!whole) return 0
  return Math.round((part / whole) * 100)
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const ICONS: Record<string, ReactNode> = {
  total: <path d="M3 5.5h14M3 10h14M3 14.5h9" {...stroke} />,
  public: (
    <>
      <circle cx="10" cy="10" r="6.75" {...stroke} fill="none" />
      <path d="M3.5 10h13M10 3.25c3.4 3.6 3.4 9.9 0 13.5-3.4-3.6-3.4-9.9 0-13.5Z" {...stroke} />
    </>
  ),
  private: (
    <>
      <rect x="4.5" y="9" width="11" height="7.5" rx="2" {...stroke} fill="none" />
      <path d="M7.25 9V6.75a2.75 2.75 0 0 1 5.5 0V9" {...stroke} />
    </>
  ),
  locations: (
    <>
      <path d="M10 17.5s5.5-4.4 5.5-8.5a5.5 5.5 0 0 0-11 0c0 4.1 5.5 8.5 5.5 8.5Z" {...stroke} fill="none" />
      <circle cx="10" cy="8.75" r="1.9" {...stroke} fill="none" />
    </>
  ),
}

function Tile({
  icon,
  tone,
  label,
  value,
  feature,
  children,
}: {
  icon: string
  tone: 'navy' | 'slate' | 'amber'
  label: string
  value: ReactNode
  feature?: boolean
  children: ReactNode
}) {
  return (
    <div className={feature ? 'stat feature' : 'stat'}>
      <span className="stat-head">
        <span className={`stat-icon ${tone}`}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {ICONS[icon]}
          </svg>
        </span>
        <span className="stat-label">{label}</span>
      </span>
      <span className="stat-value">{value}</span>
      <span className="stat-foot">{children}</span>
    </div>
  )
}

function Meter({ percent }: { percent: number }) {
  return (
    <span
      className="meter"
      role="img"
      aria-label={`${percent}% of all requests`}
    >
      <span className="meter-fill" style={{ width: `${percent}%` }} />
    </span>
  )
}

/**
 * A KPI row, not a chart: four headline numbers describing the whole dataset.
 * Public/Private carry a meter because their job is share-of-total — one hue
 * on a lighter step of its own ramp, since each meter is its own measure
 * rather than two series being told apart.
 */
function StatTiles({ overview }: StatTilesProps) {
  if (!overview) {
    return (
      <section className="stats" aria-label="Summary">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="stat" key={`stat-skeleton-${i}`}>
            <span className="skeleton skeleton-label" />
            <span className="skeleton skeleton-value" />
          </div>
        ))}
      </section>
    )
  }

  const publicShare = share(overview.publicCount, overview.total)
  const privateShare = share(overview.privateCount, overview.total)

  return (
    <section className="stats" aria-label="Summary">
      <Tile
        icon="total"
        tone="navy"
        label="Total requests"
        value={overview.total.toLocaleString()}
        feature
      >
        <span className="stat-note">All event types and locations</span>
      </Tile>

      <Tile
        icon="public"
        tone="navy"
        label="Public"
        value={overview.publicCount.toLocaleString()}
      >
        <Meter percent={publicShare} />
        <span className="stat-note">{publicShare}% of all requests</span>
      </Tile>

      <Tile
        icon="private"
        tone="slate"
        label="Private"
        value={overview.privateCount.toLocaleString()}
      >
        <Meter percent={privateShare} />
        <span className="stat-note">{privateShare}% of all requests</span>
      </Tile>

      <Tile
        icon="locations"
        tone="amber"
        label="Locations"
        value={overview.locations.length}
      >
        <span className="stat-note">
          {overview.locations.slice(0, 3).join(', ')}
          {overview.locations.length > 3 ? '…' : ''}
        </span>
      </Tile>
    </section>
  )
}

export default StatTiles
