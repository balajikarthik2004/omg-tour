import type { SVGProps } from 'react'

/**
 * One icon family, drawn on a single 24x24 grid with a 1.6 stroke and round
 * joins, so every glyph in the app reads at the same weight. Size and colour
 * come from CSS (`width`/`height`/`currentColor`), never from the path data.
 */
function Icon({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

type IconProps = SVGProps<SVGSVGElement>

/* ---------- Actions ---------- */

/** Two-arrow cycle — reads as "fetch again", not as "undo". */
export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 11A8.5 8.5 0 0 0 6.2 5.4L3.5 8" />
      <path d="M3.5 3.5V8H8" />
      <path d="M3.5 13a8.5 8.5 0 0 0 14.3 5.6l2.7-2.6" />
      <path d="M20.5 20.5V16H16" />
    </Icon>
  )
}

/** A sheet with a downward arrow: the file leaves the app. */
export function ExportIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8.5L13.5 3Z" />
      <path d="M13.5 3v4a1.5 1.5 0 0 0 1.5 1.5h4" />
      <path d="M12 11.5v5.5" />
      <path d="m9.5 14.5 2.5 2.5 2.5-2.5" />
    </Icon>
  )
}

/** Counter-clockwise arc — deliberately unlike RefreshIcon, this one reverts. */
export function ResetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 4.5V10H9" />
      <path d="M4.1 13.2a8.5 8.5 0 1 0 1.8-6L3.5 10" />
    </Icon>
  )
}

/* ---------- Stat tiles ---------- */

/** Stacked planes for a running total of records. */
export function StackIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3 8.5 4.4L12 11.8 3.5 7.4 12 3Z" />
      <path d="m3.5 12.4 8.5 4.4 8.5-4.4" />
      <path d="m3.5 16.9 8.5 4.4 8.5-4.4" />
    </Icon>
  )
}

/** Globe — the conventional counterpart to the lock below. */
export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M3.4 9.5h17.2M3.4 14.5h17.2" />
      <path d="M12 3.25c2.7 3.1 2.7 14.4 0 17.5-2.7-3.1-2.7-14.4 0-17.5Z" />
    </Icon>
  )
}

/** Closed padlock for invite-only events. */
export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <path d="M12 14v2.5" />
    </Icon>
  )
}

/** Folded map for the count of distinct places. */
export function MapIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.2 3.4 3.5 5.6v15l5.7-2.2 5.6 2.2 5.7-2.2v-15l-5.7 2.2-5.6-2.2Z" />
      <path d="M9.2 3.4v15.2M14.8 5.6v15.2" />
    </Icon>
  )
}

/* ---------- Filters ---------- */

/** Perforated ticket — the event itself. */
export function TicketIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 8.5A2 2 0 0 1 5.5 6.5h13a2 2 0 0 1 2 2v1.6a2.4 2.4 0 0 0 0 4.8v1.6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-1.6a2.4 2.4 0 0 0 0-4.8V8.5Z" />
      <path d="M14.5 6.5v2M14.5 11v2M14.5 15.5v2" />
    </Icon>
  )
}

/** Teardrop pin for a single place. */
export function PinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.5 10.3c0 5.2-5.9 10.1-7.1 11a.7.7 0 0 1-.8 0c-1.2-.9-7.1-5.8-7.1-11a7.5 7.5 0 0 1 15 0Z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </Icon>
  )
}

/** Divided panel — how many rows fit on a page. */
export function RowsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M3.5 14.5h17" />
    </Icon>
  )
}

/* ---------- Status ---------- */

/** Empty tray for the no-results state. */
export function InboxIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 13h4.6l1.5 2.6a1 1 0 0 0 .9.5h4a1 1 0 0 0 .9-.5l1.5-2.6H21" />
      <path d="M6.6 4.6A2 2 0 0 1 8.4 3.5h7.2a2 2 0 0 1 1.8 1.1L21 13v4.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5V13l3.6-8.4Z" />
    </Icon>
  )
}

/** Filled-feel warning disc for the failure banners. */
export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 7.6v5" />
      <path d="M12 16.2h.01" />
    </Icon>
  )
}

/** Clock for the "Updated hh:mm" stamp. */
export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 7v5.2l3.4 2" />
    </Icon>
  )
}

/* ---------- Pagination ---------- */

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m14.5 6-6 6 6 6" />
    </Icon>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9.5 6 6 6-6 6" />
    </Icon>
  )
}
