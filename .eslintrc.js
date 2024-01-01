module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-underscore-dangle': ['error', { allow: ['_request', '_validate', '_bindModuleMethods'] }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-param-reassign': ['error', { props: false }],
    'consistent-return': 'off',
    'import/order': ['error', { groups: ['builtin', 'external', 'internal'] }],
    'no-new': 'off',
    'class-methods-use-this': ['error', { exceptMethods: ['createReceipt'] }],
    'no-restricted-syntax': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['example.js'],
      rules: {
        'consistent-return': 'off',
      },
    },
  ],
};
