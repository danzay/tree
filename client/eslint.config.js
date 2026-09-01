import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import jsxA11y from 'eslint-plugin-jsx-a11y-x'
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
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@stylistic': stylistic,
      'jsx-a11y-x': jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-constant-binary-expression': 'error',
      'no-debugger': 'error',
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
      'no-else-return': 'error',
      'no-nested-ternary': 'error',
      'no-promise-executor-return': 'error',
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
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: ['if', 'switch'] },
        { blankLine: 'always', prev: ['if', 'switch'], next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      '@stylistic/jsx-closing-bracket-location': ['error', 'line-aligned'],
      '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
    },
  },
])
