import globals from 'globals';
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
    { files: ['**/*.js'] },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                jQuery: 'readonly',
                $: 'readonly',
                toastr: 'readonly'
            }
        }
    },
    js.configs.recommended,
    {
        plugins: {
            prettier: prettierPlugin
        }
    },
    {
        ignores: ['**/node_modules/**', '**/.idea/**'],
    },
    {
        rules: {
            ...prettierConfig.rules,
            'prettier/prettier': 'error',
            'prefer-const': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_|^e$', varsIgnorePattern: '^_|^e$', caughtErrorsIgnorePattern: '^_|^e$' }],
            'no-control-regex': 'off',
            'no-constant-condition': ['error', { checkLoops: false }],
            'require-yield': 'off',
            'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
            'no-cond-assign': 'error',
            'no-unneeded-ternary': 'error',
            'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true }],
            'no-empty': 'off',
        },
    },
];
