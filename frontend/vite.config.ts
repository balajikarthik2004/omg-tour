import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The app calls the API with an absolute URL (see VITE_API_BASE_URL in
// src/api.ts) and the service sends `access-control-allow-origin: *`,
// so no dev proxy is needed.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
