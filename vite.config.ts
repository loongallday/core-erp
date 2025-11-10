import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    // Plugin to resolve @/ imports from core-ui
    {
      name: 'resolve-core-ui-aliases',
      enforce: 'pre', // Run before other resolvers
      resolveId(id, importer) {
        // If importing from core-ui and using @/ alias
        if (id.startsWith('@/')) {
          // Check if importer is from core-ui (check various path formats)
          const isFromCoreUi = importer && (
            importer.includes('core-ui') || 
            importer.includes('core-erp/ui') ||
            importer.includes('@core-erp/ui') ||
            importer.replace(/\\/g, '/').includes('core-ui')
          )
          
          if (isFromCoreUi) {
            const relativePath = id.slice(2) // Remove '@/'
            const coreUiSrc = path.resolve(__dirname, '../core-ui/src')
            const possiblePaths = [
              path.resolve(coreUiSrc, relativePath + '.ts'),
              path.resolve(coreUiSrc, relativePath + '.tsx'),
              path.resolve(coreUiSrc, relativePath, 'index.ts'),
              path.resolve(coreUiSrc, relativePath, 'index.tsx'),
              path.resolve(coreUiSrc, relativePath),
            ]
            
            for (const possiblePath of possiblePaths) {
              try {
                if (fs.existsSync(possiblePath)) {
                  // Return the resolved path, ensuring it's a valid module path
                  return possiblePath
                }
              } catch (e) {
                // Continue to next path
              }
            }
          }
        }
        return null
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core-erp/ui': path.resolve(__dirname, '../core-ui/src'),
      '@core-erp/entity': path.resolve(__dirname, '../core-entity/src'),
      '@composable-erp/core-erp': path.resolve(__dirname, './src'),
      // Force React to resolve from core-erp's node_modules to prevent multiple instances
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
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
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      '@tanstack/react-query',
      'sonner',
    ],
    dedupe: ['react', 'react-dom'], // Ensure React is deduplicated
    force: false, // Set to true to force re-optimization (use when cache issues occur)
  },
})

