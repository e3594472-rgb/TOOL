import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/TOOL/',
  build: {
    rollupOptions: {
      input: 'dev.html',
    },
  },
})
