import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';

export default [
  { ignores: ['dist/', 'node_modules/', 'coverage/', 'reports/', 'docs/'] },
  js.configs.recommended,
  security.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', '*.js'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/no-danger': 'error', // dangerouslySetInnerHTML is the main XSS risk in React
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**', '**/*.cjs'],
    languageOptions: { globals: { ...globals.jest } },
    rules: { 'security/detect-object-injection': 'off', 'react/display-name': 'off' },
  },
];
