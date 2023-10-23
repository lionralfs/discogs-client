module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        // 'plugin:@typescript-eslint/stylistic-type-checked',
    ],
    overrides: [],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
    },
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
    },
};
