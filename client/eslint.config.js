import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src/routeTree.gen.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // TanStack Router route files must export both `Route` and a component.
      // The app also exports small helpers next to components in a few files.
      // This rule only affects hot-reload granularity, not correctness.
      'react-refresh/only-export-components': 'off',

      // The project uses the React Compiler. These three rules are very strict
      // and flag legitimate patterns for this junior-friendly codebase
      // (data loading in effects, refs inside editor callbacks, Date.now for
      // "upcoming" filters). Keep the rest of the hooks rules enabled.
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
    },
  },
])
