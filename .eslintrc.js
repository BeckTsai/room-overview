module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  parser: 'vue-eslint-parser',
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'no-var': 'error',
    allowEmptyCatch: 'off',
    'prettier/prettier': 'error',
    'prefer-const': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'vue/no-unused-vars': [
      'error',
      {
        ignorePattern: '^_',
      },
    ],
    'vue/multi-word-component-names': 'off',
    'vue/no-parsing-error': [
      'error',
      {
        'control-character-reference': false,
      },
    ],
    'vue/no-v-html': 'off',
    'arrow-body-style': 0,
    'import/prefer-default-export': 0,
    'no-console': 0,
    'no-debugger': 0,
    'no-plusplus': 0,
    'import/no-extraneous-dependencies': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^h$',
        varsIgnorePattern: '^h$',
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['off'],
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
};
