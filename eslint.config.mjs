import eslintConfig from 'eslint-config-next';

export default [
  {
    ...eslintConfig,
    rules: {
      ...eslintConfig.rules,
      '@typescript-eslint/no-explicit-any': 'off', // <-- disables the 'no-explicit-any' rule
    },
  },
];
