import { defineConfig } from 'vite'
import { resolve } from 'path'
import preact from '@preact/preset-vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  envDir: '../../',
  plugins: [
    preact(),
    viteStaticCopy({
      targets: [
        { src: 'css', dest: '.' }
      ]
    })
  ],
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
    // Enable resolving dependencies from root node_modules for workspace packages
    preserveSymlinks: false,
  },
  optimizeDeps: {
    // Include chart.js to ensure it's bundled correctly when used by @ironlift/shared
    include: ['chart.js'],
  },
})
