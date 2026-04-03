import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  // Node globals for lib/, scripts/, config files
  {
    files: ['src/lib/**/*.ts', 'src/types/**/*.ts', 'scripts/**/*.{js,mjs}', '*.{js,mjs,ts}', 'tests/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Browser globals for Astro client scripts and pages
  {
    files: ['src/pages/**/*.astro', 'src/components/**/*.astro', 'src/layouts/**/*.astro'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    rules: {
      // Downgrade pre-existing issues to warn — promote to error once codebase is clean
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'no-undef': 'warn',
      'prefer-const': 'warn',
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'off',
      'no-useless-escape': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**', 'src/env.d.ts'],
  },
];
