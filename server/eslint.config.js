import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      // allow `_next` (express needs 4 args) and `{ lock, ...rest }` to drop a field
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }]
    }
  }
];
