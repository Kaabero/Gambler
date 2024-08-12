const { defineConfig } = require('eslint-define-config');
const nodePlugin = require('eslint-plugin-node');
const securityPlugin = require('eslint-plugin-security');
const globals = require('globals');

module.exports = defineConfig([
  {
    files: ['**/*.js'],
    ignores: ['dist', 'eslint.config.js', 'node_modules'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
    plugins: {
      node: nodePlugin,
      security: securityPlugin,
    },
    rules: {
      'no-console': 'off',
      'strict': ['error', 'global'],
      'eqeqeq': 'error',
      'curly': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'security/detect-object-injection': 'off',
      'node/no-missing-require': 'off',
    },
  },
]);
