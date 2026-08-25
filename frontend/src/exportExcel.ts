import writeXlsxFile, { type Column } from 'write-excel-file/browser'
import type { Filters, UsaTourRequest } from './api'

function header(value: string) {
  return {
    value,
    fontWeight: 'bold' as const,
    backgroundColor: '#293088', // OMG secondary
    color: '#FFFFFF',
    align: 'left' as const,
  }
}

const columns: Column<UsaTourRequest>[] = [
  {
    header: header('#'),
    width: 6,
    cell: (_row, index) => ({ value: index + 1, type: Number }),
  },
  {
    header: header('Name'),
    width: 26,
    cell: (row) => ({ value: row.name, type: String }),
  },
  {
    header: header('Mobile number'),
    width: 18,
    cell: (row) =>
      row.mobile_number ? { value: row.mobile_number, type: String } : null,
  },
  {
    header: header('Event type'),
    width: 14,
    cell: (row) => ({ value: row.event_type, type: String }),
  },
  {
    header: header('Tour date'),
    width: 14,
    cell: (row) => ({ value: row.tour_date, type: String }),
  },
  {
    header: header('Location'),
    width: 18,
    cell: (row) => ({ value: row.location, type: String }),
  },
  {
    header: header('Created'),
    width: 22,
    cell: (row) => {
      const date = new Date(row.createdAt)
      if (Number.isNaN(date.getTime())) {
        return { value: row.createdAt, type: String }
      }
      return { value: date, type: Date, format: 'mmm d, yyyy hh:mm' }
    },
  },
]

function fileName(filters: Filters): string {
  const parts = ['usa-tour-requests']
  if (filters.event_type) parts.push(filters.event_type.toLowerCase())
  if (filters.location.trim()) {
    parts.push(filters.location.trim().toLowerCase().replace(/\s+/g, '-'))
  }
  parts.push(new Date().toISOString().slice(0, 10))
  return `${parts.join('_')}.xlsx`
}

export async function exportToExcel(
  rows: UsaTourRequest[],
  filters: Filters,
): Promise<void> {
  await writeXlsxFile(rows, {
    columns,
    sheet: 'Tour requests',
    stickyRowsCount: 1,
  }).toFile(fileName(filters))
}
