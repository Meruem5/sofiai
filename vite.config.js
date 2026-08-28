import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the domain root on a custom domain, not from a /repo-name/ subpath.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
