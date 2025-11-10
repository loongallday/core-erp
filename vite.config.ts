import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    preserveSymlinks: false, // Follow symlinks (important for npm linked packages)
  },
  server: {
    port: 5175,
    fs: {
      // Allow serving files from parent directory (for symlinked plugins)
      allow: ['..'],
    },
  },
  optimizeDeps: {
    exclude: ['@composable-erp/core-leave'], // Don't pre-bundle, load directly
  },
})

