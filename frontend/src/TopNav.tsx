import logo from './assets/logo.png'
import { ExportIcon } from './Icons'

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
          aria-label="Export to Excel"
          title={
            canExport ? 'Download all matching rows' : 'Nothing to export yet'
          }
        >
          <ExportIcon className="btn-icon" />
          <span className="btn-text">
            {exporting ? 'Exporting…' : 'Export to Excel'}
          </span>
        </button>
      </div>
    </nav>
  )
}

export default TopNav
