// eslint.config.mjs
const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next', 'next/core-web-vitals'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
