import js from '@eslint/js'
import globals from 'globals'
import nextPlugin from '@next/eslint-plugin-next'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

const tsTypeChecked = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: ['**/*.{ts,tsx}'],
}))

export default defineConfig([
  {
    ignores: ['.next/', '.vercel/', '.turbo/', 'dist/', 'node_modules/', 'scripts/**', 'next-env.d.ts'],
  },
  js.configs.recommended,
  ...tsTypeChecked,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
])
