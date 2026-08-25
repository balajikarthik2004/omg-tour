import logo from './assets/logo.png'

type TopNavProps = {
  onExport: () => void
  exporting: boolean
  canExport: boolean
}

export const APP_TITLE = 'OMG Tours'

function TopNav({ onExport, exporting, canExport }: TopNavProps) {
  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <div className="brand">
          <span className="brand-mark">
            <img src={logo} alt="" />
          </span>
          <span className="brand-text">
            <span className="brand-title">{APP_TITLE}</span>
            <span className="brand-sub">Admin console</span>
          </span>
        </div>

        <button
          type="button"
          className="btn primary"
          onClick={onExport}
          disabled={exporting || !canExport}
          title={
            canExport ? 'Download all matching rows' : 'Nothing to export yet'
          }
        >
          <svg
            className="btn-icon"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 14.5V16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {exporting ? 'Exporting…' : 'Export to Excel'}
        </button>
      </div>
    </nav>
  )
}

export default TopNav
