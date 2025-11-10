import type { Config } from 'tailwindcss'
import uiPreset from '@core-erp/ui/tailwind-preset'

export default {
  presets: [uiPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@core-erp/ui/dist/**/*.js'
  ],
  // Add custom overrides here if needed
  theme: {
    extend: {
      // Your custom extensions
    }
  },
} satisfies Config
