const HTML_SANITIZERS = { escape: { methods: ['Sanitizer.unwrapSafeHTML', 'unwrapSafeHTML', 'DOMPurify.sanitize'] } };

module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:jsdoc/recommended',
    ],
    plugins: [
        'jsdoc',
        'security',
        'no-unsanitized',
        '@typescript-eslint',
        'vue',
    ],
    env: {
        browser: true,
        jquery: true,
        es6: true,
    },
    globals: {
        toastr: 'readonly',
        Fuse: 'readonly',
        globalThis: 'readonly',
        SillyTavern: 'readonly',
        ePub: 'readonly',
        pdfjsLib: 'readonly',
        echarts: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'no-eval': 'warn',
        'no-implied-eval': 'warn',
        'no-new-func': 'warn',
        'no-script-url': 'warn',
        'no-unsanitized/method': ['warn', HTML_SANITIZERS],
        'no-unsanitized/property': ['warn', HTML_SANITIZERS],
        'security/detect-object-injection': 'off',
        'security/detect-non-literal-regexp': 'off',
        'security/detect-unsafe-regex': 'off',
        'no-restricted-syntax': [
            'warn',
            {
                selector: 'CallExpression[callee.property.name="postMessage"][arguments.1.value="*"]',
                message: 'Avoid postMessage(..., "*"); use a trusted origin or the shared iframe messaging helper.',
            },
            {
                selector: 'CallExpression[callee.property.name="addEventListener"][arguments.0.value="message"]',
                message: 'All message listeners must validate origin/source (use isTrustedMessage).',
            },
        ],
        'no-undef': 'error',
        'no-unused-vars': ['warn', { args: 'none' }],
        'eqeqeq': 'off',
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-inner-declarations': 'off',
        'no-constant-condition': ['error', { checkLoops: false }],
        'no-useless-catch': 'off',
        'no-control-regex': 'off',
        'no-mixed-spaces-and-tabs': 'off',
        'jsdoc/require-jsdoc': 'off',
        'jsdoc/require-param': 'off',
        'jsdoc/require-returns': 'off',
        'jsdoc/require-param-description': 'off',
        'jsdoc/require-returns-description': 'off',
        'jsdoc/check-types': 'off',
        'jsdoc/tag-lines': 'off',
    },
    overrides: [
        {
            files: ['**/*.html'],
            plugins: ['html'],
        },
        {
            files: ['scripts/**/*.{js,mjs}', '*.config.mjs', '**/build.mjs', '**/export-embrace.mjs', '**/*.cjs'],
            env: { node: true, browser: false },
        },
        {
            files: ['**/*.cjs'],
            parserOptions: { sourceType: 'script' },
        },
        {
            files: ['modules/xiaobai-os/**/*.{js,ts,vue}'],
            rules: {
                'no-restricted-properties': ['error', {
                    property: 'randomUUID',
                    message: 'randomUUID requires a secure context and is unavailable on LAN HTTP. Use createStorageId from modules/xiaobai-os/kernel/identity.ts instead.',
                }],
            },
        },
        {
            files: ['modules/xiaobai-os/**/*.js'],
            rules: {
                'no-restricted-imports': ['error', { patterns: ['**/tavern/**'] }],
            },
        },
        {
            files: ['server-plugin/**/*.js'],
            env: {
                browser: false,
                node: true,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'script',
            },
        },
        {
            files: ['**/*.{ts,mts,cts}'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: false,
            },
            rules: {
                'curly': ['error', 'all'],
                'default-case-last': 'error',
                'eqeqeq': ['error', 'always'],
                'no-duplicate-imports': 'error',
                'no-fallthrough': 'error',
                'no-undef': 'off',
                'no-unreachable': 'error',
                'no-unsafe-optional-chaining': 'error',
                'no-unused-vars': 'off',
                '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
                '@typescript-eslint/no-explicit-any': 'warn',
                '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            },
        },
        {
            files: ['**/*.vue'],
            parser: 'vue-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser',
                ecmaVersion: 'latest',
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
            extends: [
                'plugin:vue/recommended',
            ],
            rules: {
                'curly': ['error', 'all'],
                'default-case-last': 'error',
                'eqeqeq': ['error', 'always'],
                'no-duplicate-imports': 'error',
                'no-fallthrough': 'error',
                'no-undef': 'off',
                'no-unreachable': 'error',
                'no-unsafe-optional-chaining': 'error',
                'no-unused-vars': 'off',
                '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
                '@typescript-eslint/no-explicit-any': 'warn',
                '@typescript-eslint/no-unused-vars': 'off',
                'vue/comment-directive': 'off',
                'vue/multi-word-component-names': 'off',
                'vue/no-v-html': 'off',
            },
        },
        {
            files: ['modules/tavern/**/*.{ts,vue}'],
            rules: {
                'no-restricted-imports': ['error', { patterns: ['**/xiaobai-os/**'] }],
            },
        },
        {
            files: ['modules/xiaobai-os/**/*.{ts,vue}'],
            rules: {
                'no-restricted-imports': ['error', { patterns: ['**/tavern/**'] }],
            },
        },
        {
            files: ['modules/xiaobai-os/**/*.vue'],
            rules: {
                'vue/html-indent': ['error', 4],
                'vue/max-attributes-per-line': 'off',
                'vue/singleline-html-element-content-newline': 'off',
            },
        },
    ],
};
