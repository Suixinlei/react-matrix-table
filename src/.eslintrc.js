const path = require('path');

module.exports = {
  root: true,
  extends: ['eslint-config-ali/typescript/react'],
  parserOptions: {
    tsconfigRootDir: path.join(__dirname, '..'),
  },
  rules: {
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    'react-refresh/only-export-components': 'off',
  },
};
