import { defineConfig } from 'vite'
import { resolve } from 'path'
import preact from '@preact/preset-vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Resolve preact/compat path for React aliasing
const preactCompatPath = resolve(__dirname, 'node_modules/preact/compat')

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  envDir: '../../',
  plugins: [
    preact({ reactAliasesEnabled: false }), // Disable built-in aliases, use custom ones
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
      // Alias react to preact/compat for @use-gesture/react compatibility
      'react': preactCompatPath,
      'react-dom': preactCompatPath,
      'react/jsx-runtime': resolve(__dirname, 'node_modules/preact/jsx-runtime'),
    },
    // Enable resolving dependencies from root node_modules for workspace packages
    preserveSymlinks: false,
  },
  optimizeDeps: {
    // Include chart.js to ensure it's bundled correctly when used by @ironlift/shared
    include: ['chart.js', '@use-gesture/react'],
  },
})
