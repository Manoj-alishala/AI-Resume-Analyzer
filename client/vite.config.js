import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'https://ai-resume-analyzer-backend-2x79.onrender.com',
      '/resume': 'https://ai-resume-analyzer-backend-2x79.onrender.com',
    }
  }
})
