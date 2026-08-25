# OMG Tours — USA Tour Requests

Single-page admin table for `GET /admin/usa-tour-requests`, styled with the OMG
design system (navy `#293088`, red `#E22E28`, Montserrat headings, Roboto body).

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

The app calls the deployed service directly:

```
https://omg-temple-service-966169042016.asia-south1.run.app/admin/usa-tour-requests
```

That base URL is the default in [src/api.ts](src/api.ts); override it with
`VITE_API_BASE_URL` to point at a local or staging API. The service sends
`access-control-allow-origin: *`, so no dev proxy is involved and the same
build works in production.

The route is public today. If it ever gets protected, set `VITE_API_TOKEN` and
it is sent as `Authorization: Bearer <token>`.

### API behaviour worth knowing

- `location` is matched **exactly** server-side — `Houston` does not match
  `Sri Venkateswara Temple , Houston`. That is why the default filter leaves
  location blank.
- `mobile_number` can be `null` (16 of 21 records at the time of writing). The
  table shows an em dash and the export leaves the cell empty.

## What the page does

- **Top nav** — the OMG mark on a white tile (the logo is navy + red, so it
  needs a light backing on the navy bar), app title, and *Export to Excel*.
  The mark is [src/assets/logo.png](src/assets/logo.png); the title is
  `APP_TITLE` in [src/TopNav.tsx](src/TopNav.tsx).
- **Export** — downloads a real `.xlsx` (navy header row, frozen top row, typed
  date cells) containing **every row matching the current filters**, not just
  the visible page. Filename encodes the filters and date, e.g.
  `usa-tour-requests_public_houston_2026-08-25.xlsx`.
- **Summary tiles** — total requests, Public / Private counts with share
  meters, and the number of distinct locations. These describe the **whole**
  dataset, not the filtered view, and come from one unfiltered request
  (`OVERVIEW_LIMIT` rows) made alongside the table's own.
- **Filters** — a segmented control for `event_type` (All / Public / Private)
  and a dropdown of the locations that actually exist in the data. Because the
  API matches `location` exactly, a dropdown of real values beats free text.
  Changing either resets the offset to page 1.
- **Pagination** — `limit` / `offset`, with numbered pages (windowed as
  `1 … 4 5 6 … 12`) and Previous/Next. Hidden entirely on a single page.
- **States** — skeleton rows while loading, an empty state with a "Clear
  filters" action when nothing matches, and a retryable error banner when the
  request fails or returns `success: false`.
- **Responsive** — below 720px the table becomes one labelled card per record
  (no horizontal scrolling) and the export button collapses to its icon.
- In-flight requests are aborted when the filters change, so a slow response
  can't overwrite a newer one.

## Files

| File | Purpose |
| --- | --- |
| [src/api.ts](src/api.ts) | Request/response types, query builder, the fetch, `summarize()` |
| [src/StatTiles.tsx](src/StatTiles.tsx) | Summary KPI row |
| [src/TopNav.tsx](src/TopNav.tsx) | Top nav bar and export button |
| [src/exportExcel.ts](src/exportExcel.ts) | Excel column schema and file naming |
| [src/App.tsx](src/App.tsx) | Filters, table, pagination |
| [src/index.css](src/index.css) | Design-system tokens (color ramps, fonts) |
| [src/App.css](src/App.css) | Component styles |

## Notes

- Excel export uses [`write-excel-file`](https://www.npmjs.com/package/write-excel-file).
  The more common `xlsx` (SheetJS) npm package was avoided: its registry build
  carries two unfixable high-severity advisories.
- Fonts load from Google Fonts in [index.html](index.html). Self-host them if
  the deployment must avoid third-party requests.
- `public/favicon.svg` is still a placeholder mark — swap it for a small
  exported version of the real logo when convenient.
### Colour roles

Tokens are taken from the live site, **omgofficial.com**, which publishes them
as CSS custom properties: `--primary #293088`, `--secondary #e22e26`,
`--accent #ffc107`. Its ink is neutral (`#262626` text, `#71717a` muted) rather
than navy-tinted, it is Montserrat throughout at body weight 400, and its
controls use a 10px radius. This app follows all of that.

Each colour has exactly one job:

| Colour | Used for | Not used for |
| --- | --- | --- |
| Navy `#293088` | nav bar, active controls, table-header text, links | data categories that need telling apart at a glance |
| Red `#E22E28` | the primary action (Export), the nav hairline, error states | ordinary categories — red reads as an alert |
| Amber `#FFC107` | the Locations chip, emphasis | actions or errors |
| Slate `#414A63` | the Private badge | anything that is genuinely a problem |
| Navy-500 `#353BBD` | meter fills | chrome |

Depth comes from gradients on the brand hues rather than extra colours: the nav
and the active segment run navy-500 → navy-600, the Export button red-400 →
red-500, meter fills navy-400 → navy-600, and the page carries a navy-tinted
wash that fades out below the nav. The "Total requests" tile is a filled navy
card so one number leads the row.

Three deliberate calls:

- **`Private` wears slate, not red.** Public and Private are peer categories;
  painting one of them in the error colour made a normal record look like a
  problem. Red now means "act" or "something broke", nothing else.
- **The table header is a light navy tint, not a navy slab.** Two saturated
  navy bands (nav + header) competed with each other and pushed the data into
  third place. `#293088` survives as the header *text* colour.
- **Locations wears amber, not red.** Adopting the site's third brand colour
  freed red to mean only "act" or "something broke".
- **Meter fills are navy-500 `#353BBD`, not `#293088`.** As chart marks the
  colours must sit inside a lightness band; `#293088` (L 0.363) falls below it.
  Every text pairing above was checked against WCAG AA — the tightest is white
  on red-500 at 4.51:1.
- The table is not sortable. The API exposes no sort parameter, and sorting
  only the fetched page would be misleading across pagination.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with the API proxy |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
