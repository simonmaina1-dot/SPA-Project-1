import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/projects': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/donations': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/feedback': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/admins': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/verificationSubmissions': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
  },
})
