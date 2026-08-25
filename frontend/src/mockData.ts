import type { UsaTourRequest } from './api'

/**
 * Placeholder rows used while the admin API is not wired up.
 * Set VITE_USE_MOCK_DATA=false (or delete the flag) to hit the real endpoint.
 */
export const MOCK_REQUESTS: UsaTourRequest[] = [
  ['Ragul Vishnu Kumar', '+19995551234', 'Public', 'Sep 4', 'Houston'],
  ['Priya Raman', '+19995551235', 'Private', 'Sep 5', 'Houston'],
  ['Daniel Ortiz', '+19995551236', 'Public', 'Sep 6', 'Dallas'],
  ['Aisha Khan', '+19995551237', 'Public', 'Sep 7', 'Houston'],
  ['Marcus Bell', '+19995551238', 'Private', 'Sep 9', 'Austin'],
  ['Sneha Iyer', '+19995551239', 'Public', 'Sep 11', 'Houston'],
  ['Tom Whitfield', '+19995551240', 'Private', 'Sep 12', 'Chicago'],
  ['Lakshmi Narayanan', '+19995551241', 'Public', 'Sep 13', 'Houston'],
  ['Grace Adeyemi', '+19995551242', 'Public', 'Sep 15', 'Atlanta'],
  ['Vikram Desai', '+19995551243', 'Private', 'Sep 16', 'Houston'],
  ['Elena Petrova', '+19995551244', 'Public', 'Sep 18', 'New York'],
  ['Arun Prakash', '+19995551245', 'Public', 'Sep 19', 'Houston'],
  ['Hannah Cole', '+19995551246', 'Private', 'Sep 20', 'Seattle'],
  ['Divya Menon', '+19995551247', 'Public', 'Sep 22', 'Houston'],
  ['Chris Delaney', '+19995551248', 'Public', 'Sep 23', 'Houston'],
].map(([name, mobile_number, event_type, tour_date, location], i) => {
  const stamp = `2026-08-${String(4 + i).padStart(2, '0')}T10:15:30.000Z`
  return {
    id: `b3f1c2e4-7a2d-4e9a-9c1f-2d6a8e0b5${(3072 + i).toString(16)}`,
    name,
    mobile_number,
    event_type,
    tour_date,
    location,
    createdAt: stamp,
    updatedAt: stamp,
  }
})
