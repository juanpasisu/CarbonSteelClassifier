import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Load the shared root .env while keeping service-role variables server-side.
  envDir: '..',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
