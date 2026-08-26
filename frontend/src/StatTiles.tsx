import type { ComponentType, ReactNode, SVGProps } from 'react'
import type { Overview } from './api'
import { GlobeIcon, LockIcon, MapIcon, StackIcon } from './Icons'

type StatTilesProps = {
  overview: Overview | null
}

function share(part: number, whole: number): number {
  if (!whole) return 0
  return Math.round((part / whole) * 100)
}

function Tile({
  icon: Glyph,
  tone,
  label,
  value,
  feature,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
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
          <Glyph />
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
        icon={StackIcon}
        tone="navy"
        label="Total requests"
        value={overview.total.toLocaleString()}
        feature
      >
        <span className="stat-note">All event types and locations</span>
      </Tile>

      <Tile
        icon={GlobeIcon}
        tone="navy"
        label="Public"
        value={overview.publicCount.toLocaleString()}
      >
        <Meter percent={publicShare} />
        <span className="stat-note">{publicShare}% of all requests</span>
      </Tile>

      <Tile
        icon={LockIcon}
        tone="slate"
        label="Private"
        value={overview.privateCount.toLocaleString()}
      >
        <Meter percent={privateShare} />
        <span className="stat-note">{privateShare}% of all requests</span>
      </Tile>

      <Tile
        icon={MapIcon}
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
