import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Allow necessary any types in infrastructure code
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      
      // Warn about unused variables (allow _ prefix for intentionally unused)
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      
      // Responsive Design Rules
      
      // Warn about potential fixed-width issues
      'no-restricted-syntax': [
        'warn',
        {
          selector: "JSXAttribute[name.name='style'] Property[key.name='width'][value.value=/^[0-9]+px$/]",
          message: 'Avoid fixed pixel widths. Use max-width with responsive units or Tailwind classes instead.',
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/w-\\[[0-9]+px\\]/]",
          message: 'Avoid fixed pixel widths in Tailwind. Use max-w-* classes instead.',
        },
      ],
      
      // Encourage use of responsive components (informational warnings)
      'no-warning-comments': [
        'warn',
        {
          terms: ['RESPONSIVE', 'responsive'],
          location: 'start',
        },
      ],
    },
  },
)

