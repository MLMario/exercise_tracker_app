import { defineConfig } from 'vite'
import { resolve } from 'path'
import preact from '@preact/preset-vite'

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  plugins: [preact()],
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
