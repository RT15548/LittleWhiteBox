const HTML_SANITIZERS = { escape: { methods: ['Sanitizer.unwrapSafeHTML', 'unwrapSafeHTML', 'DOMPurify.sanitize'] } };
const fs = require('node:fs');
const path = require('node:path');
const { collectSourceFiles } = require('./scripts/workspace-files.mjs');
// A derived, process-local file list keeps vendored/generated JS out of the typed program.
// Compiler policy still comes exclusively from the root tsconfig.
fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });
const lintProjectDirectory = fs.mkdtempSync(path.join(__dirname, 'output/eslint-project-'));
const lintProject = path.join(lintProjectDirectory, 'tsconfig.json');
fs.writeFileSync(lintProject, JSON.stringify({
    extends: path.join(__dirname, 'tsconfig.json'),
    files: collectSourceFiles(__dirname, new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.vue'])),
    include: [],
    exclude: [],
}));
process.once('exit', () => fs.rmSync(lintProjectDirectory, { recursive: true, force: true }));
const promiseRules = {
    '@typescript-eslint/no-floating-promises': ['error', {
        ignoreVoid: false,
        // node:test owns registered test failures. This is not an exemption for arbitrary test files.
        allowForKnownSafeCalls: [{ from: 'package', package: 'node:test', name: ['test', 'it', 'describe', 'suite'] }],
    }],
    '@typescript-eslint/no-misused-promises': 'error',
};

module.exports = {
    root: true,
    ignorePatterns: fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8')
        .split(/\r?\n/).filter(line => line.trim() && !line.trimStart().startsWith('#')),
    reportUnusedDisableDirectives: true,
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
        '@eslint-community/eslint-comments',
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
        'no-restricted-properties': ['error', {
            property: 'randomUUID',
            message: 'randomUUID is forbidden repository-wide: it requires a secure context and fails on LAN HTTP. Use an HTTP-compatible identifier generator.',
        }],
        '@eslint-community/eslint-comments/require-description': ['error', { ignore: ['eslint-env', 'global', 'globals', 'exported'] }],
        '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
        '@eslint-community/eslint-comments/no-use': ['error', { allow: ['eslint-disable-next-line', 'eslint-disable-line', 'eslint-env', 'global', 'globals', 'exported'] }],
        '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true, 'ts-nocheck': true, 'ts-expect-error': 'allow-with-description', minimumDescriptionLength: 10 }],
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
            {
                selector: 'CatchClause[body.body.length=0], CallExpression[callee.property.name="catch"] > :matches(ArrowFunctionExpression, FunctionExpression)[body.type="BlockStatement"][body.body.length=0]',
                message: 'Handle or report the error; an empty handler or a comment does not observe a failure.',
            },
        ],
        'no-undef': 'error',
        'no-unused-vars': ['warn', { args: 'none' }],
        'eqeqeq': 'off',
        'no-empty': 'error',
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
        'jsdoc/no-undefined-types': ['warn', { definedTypes: ['AsyncGenerator'] }],
        'jsdoc/tag-lines': 'off',
    },
    overrides: [
        {
            files: ['**/*.{js,mjs,cjs}'],
            parser: '@typescript-eslint/parser',
        },
        {
            // Frozen native VM fixtures retain upstream directives until these host versions retire.
            files: ['modules/xiaobai-os/tests/fixtures/sillytavern-1.14-prompt-functions.js', 'modules/xiaobai-os/tests/fixtures/sillytavern-1.18-prompt-functions.js'],
            rules: { '@eslint-community/eslint-comments/no-use': 'off' },
        },
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
            files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
            parserOptions: {
                project: lintProject,
                tsconfigRootDir: __dirname,
                extraFileExtensions: ['.vue'],
            },
            rules: promiseRules,
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
