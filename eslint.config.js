import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  eslintConfigPrettier,
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-else-return': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXAttribute[name.name=/^on[A-Z]/] > JSXExpressionContainer > ArrowFunctionExpression',
          message: 'Define event handlers as named variables above JSX.',
        },
        {
          selector: 'ConditionalExpression > :matches(JSXElement, JSXFragment)',
          message: 'Do not use conditional expressions to return JSX.',
        },
        {
          selector: 'JSXExpressionContainer > LogicalExpression > LogicalExpression',
          message: 'Move compound JSX conditions into a named boolean.',
        },
        {
          selector: 'JSXText[value=/[A-Za-z0-9]/]',
          message: 'Put user-facing JSX text behind an i18n translation key.',
        },
      ],
      'object-shorthand': 'error',
      'prefer-const': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
      '@stylistic/jsx-closing-bracket-location': ['error', 'line-aligned'],
      '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
    },
  },
  {
    files: ['server/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-else-return': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
  },
])
