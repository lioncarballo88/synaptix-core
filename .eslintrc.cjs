module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Enforce consistent import order
    'import/order': ['error', { 'alphabetize': { order: 'asc', caseInsensitive: true } }],
    // Prefer const over let when variable is never reassigned
    'prefer-const': 'error',
    // Disallow unused variables (handled by TS as well)
    '@typescript-eslint/no-unused-vars': ['error'],
  },
};