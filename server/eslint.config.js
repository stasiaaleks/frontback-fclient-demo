import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: { globals: globals.node },
    rules: {
      // _next: express needs 4 args
      // { lock, ...rest }: drops a field
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }]
    }
  }
];
