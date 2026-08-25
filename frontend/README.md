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
- **Filters** — a segmented control for `event_type` (All / Public / Private)
  and a search field for `location` with a clear button (debounced 350 ms);
  both reset the offset back to page 1.
- **Pagination** — `limit` / `offset`; `data.total` drives the page count and
  the "Showing 1–25 of N" label.
- **States** — skeleton rows while loading, an empty state when nothing
  matches, and a retryable error banner when the request fails or returns
  `success: false`.
- In-flight requests are aborted when the filters change, so a slow response
  can't overwrite a newer one.

## Files

| File | Purpose |
| --- | --- |
| [src/api.ts](src/api.ts) | Request/response types, query builder, the fetch |
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

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with the API proxy |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
