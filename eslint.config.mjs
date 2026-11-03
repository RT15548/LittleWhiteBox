import fs from 'node:fs';
import path from 'node:path';
import 'eslint';
import { includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';
import security from 'eslint-plugin-security';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import html from 'eslint-plugin-html';
import { collectSourceFiles } from './scripts/workspace-files.mjs';

const HTML_SANITIZERS = { escape: { methods: ['Sanitizer.unwrapSafeHTML', 'unwrapSafeHTML', 'DOMPurify.sanitize'] } };
const root = import.meta.dirname;
// Type-aware lint shares the root compiler policy, but includes authored files only.
fs.mkdirSync(path.join(root, 'output'), { recursive: true });
const lintProjectDirectory = fs.mkdtempSync(path.join(root, 'output/eslint-project-'));
const lintProject = path.join(lintProjectDirectory, 'tsconfig.json');
fs.writeFileSync(lintProject, JSON.stringify({
    extends: path.join(root, 'tsconfig.json'),
    files: collectSourceFiles(root, new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.vue'])),
    include: [],
    exclude: [],
}));
process.once('exit', () => fs.rmSync(lintProjectDirectory, { recursive: true }));

const typedRules = {
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
};
const nodeFiles = [
    'scripts/**/*.{js,mjs}', '*.config.mjs', '**/build.mjs', '**/export-embrace.mjs', '**/*.cjs',
    'server-plugin/**/*.js', 'modules/draw/server/**/*.js', 'modules/draw/server/**/*.mjs',
];

export default [
    includeIgnoreFile(path.join(root, '.gitignore')),
    includeIgnoreFile(path.join(root, '.sourceignore')),
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue,html}'],
        linterOptions: { reportUnusedDisableDirectives: 'error' },
        plugins: {
            jsdoc,
            security,
            'no-unsanitized': noUnsanitized,
            '@typescript-eslint': tsPlugin,
            vue,
            '@eslint-community/eslint-comments': eslintComments,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.jquery,
                ...globals.es2015,
                toastr: 'readonly',
                Fuse: 'readonly',
                globalThis: 'readonly',
                SillyTavern: 'readonly',
                ePub: 'readonly',
                pdfjsLib: 'readonly',
                echarts: 'readonly',
            },
        },
        // Project rules are explicit so a tool upgrade does not silently change policy.
        rules: {
            'jsdoc/check-access': ["warn"],
            'jsdoc/check-alignment': ["warn"],
            'jsdoc/check-examples': ["off"],
            'jsdoc/check-indentation': ["off"],
            'jsdoc/check-line-alignment': ["off"],
            'jsdoc/check-param-names': ["warn"],
            'jsdoc/check-property-names': ["warn"],
            'jsdoc/check-syntax': ["off"],
            'jsdoc/check-tag-names': ["warn"],
            'jsdoc/check-template-names': ["off"],
            'jsdoc/check-values': ["warn"],
            'jsdoc/convert-to-jsdoc-comments': ["off"],
            'jsdoc/empty-tags': ["warn"],
            'jsdoc/implements-on-classes': ["warn"],
            'jsdoc/imports-as-dependencies': ["off"],
            'jsdoc/informative-docs': ["off"],
            'jsdoc/match-description': ["off"],
            'jsdoc/match-name': ["off"],
            'jsdoc/multiline-blocks': ["warn"],
            'jsdoc/no-bad-blocks': ["off"],
            'jsdoc/no-blank-block-descriptions': ["off"],
            'jsdoc/no-blank-blocks': ["off"],
            'jsdoc/no-defaults': ["warn"],
            'jsdoc/no-missing-syntax': ["off"],
            'jsdoc/no-multi-asterisks': ["warn"],
            'jsdoc/no-restricted-syntax': ["off"],
            'jsdoc/no-types': ["off"],
            'jsdoc/require-asterisk-prefix': ["off"],
            'jsdoc/require-description': ["off"],
            'jsdoc/require-description-complete-sentence': ["off"],
            'jsdoc/require-example': ["off"],
            'jsdoc/require-file-overview': ["off"],
            'jsdoc/require-hyphen-before-param-description': ["off"],
            'jsdoc/require-param-name': ["warn"],
            'jsdoc/require-param-type': ["warn"],
            'jsdoc/require-property': ["warn"],
            'jsdoc/require-property-description': ["warn"],
            'jsdoc/require-property-name': ["warn"],
            'jsdoc/require-property-type': ["warn"],
            'jsdoc/require-returns-check': ["warn"],
            'jsdoc/require-returns-type': ["warn"],
            'jsdoc/require-template': ["off"],
            'jsdoc/require-throws': ["off"],
            'jsdoc/require-yields': ["warn"],
            'jsdoc/require-yields-check': ["warn"],
            'jsdoc/sort-tags': ["off"],
            'jsdoc/text-escaping': ["off"],
            'jsdoc/valid-types': ["warn"],
            'constructor-super': ["error"],
            'for-direction': ["error"],
            'getter-return': ["error"],
            'no-async-promise-executor': ["error"],
            'no-case-declarations': ["error"],
            'no-class-assign': ["error"],
            'no-compare-neg-zero': ["error"],
            'no-cond-assign': ["error"],
            'no-const-assign': ["error"],
            'no-debugger': ["error"],
            'no-delete-var': ["error"],
            'no-dupe-args': ["error"],
            'no-dupe-class-members': ["error"],
            'no-dupe-else-if': ["error"],
            'no-dupe-keys': ["error"],
            'no-duplicate-case': ["error"],
            'no-empty-character-class': ["error"],
            'no-empty-pattern': ["error"],
            'no-ex-assign': ["error"],
            'no-extra-boolean-cast': ["error"],
            'no-extra-semi': ["error"],
            'no-fallthrough': ["error"],
            'no-func-assign': ["error"],
            'no-global-assign': ["error"],
            'no-import-assign': ["error"],
            'no-invalid-regexp': ["error"],
            'no-irregular-whitespace': ["error"],
            'no-loss-of-precision': ["error"],
            'no-misleading-character-class': ["error"],
            'no-new-symbol': ["error"],
            'no-nonoctal-decimal-escape': ["error"],
            'no-obj-calls': ["error"],
            'no-octal': ["error"],
            'no-prototype-builtins': ["error"],
            'no-redeclare': ["error"],
            'no-regex-spaces': ["error"],
            'no-self-assign': ["error"],
            'no-setter-return': ["error"],
            'no-shadow-restricted-names': ["error"],
            'no-sparse-arrays': ["error"],
            'no-this-before-super': ["error"],
            'no-unexpected-multiline': ["error"],
            'no-unreachable': ["error"],
            'no-unsafe-finally': ["error"],
            'no-unsafe-negation': ["error"],
            'no-unsafe-optional-chaining': ["error"],
            'no-unused-labels': ["error"],
            'no-useless-backreference': ["error"],
            'no-useless-escape': ["error"],
            'no-with': ["error"],
            'require-yield': ["error"],
            'use-isnan': ["error"],
            'valid-typeof': ["error"],
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
            'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
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
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue,html}'],
        ignores: nodeFiles,
        languageOptions: { globals: globals.browser },
    },
    ...vue.configs['flat/recommended'].map(config => ({ ...config, files: ['**/*.vue'] })),
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        languageOptions: { parser: tsParser },
    },
    {
        files: ['**/*.html'],
        plugins: { html },
    },
    {
        files: nodeFiles,
        languageOptions: {
            globals: globals.node,
            parserOptions: { ecmaFeatures: { globalReturn: true } },
        },
    },
    {
        files: ['**/*.cjs'],
        languageOptions: { sourceType: 'script' },
    },
    {
        files: ['server-plugin/**/*.js', 'modules/draw/server/**/*.js', 'modules/draw/server/**/*.mjs'],
        languageOptions: { sourceType: 'script' },
    },
    {
        files: ['modules/xiaobai-os/**/*.js'],
        rules: { 'no-restricted-imports': ['error', { patterns: ['**/tavern/**'] }] },
    },
    {
        files: ['**/*.{ts,mts,cts}'],
        rules: typedRules,
    },
    {
        files: ['**/*.vue'],
        languageOptions: { parser: vueParser, parserOptions: { parser: tsParser } },
        rules: {
            ...typedRules,
            '@typescript-eslint/no-unused-vars': 'off',
            'vue/comment-directive': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/no-v-html': 'off',
        },
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
        languageOptions: {
            parserOptions: {
                project: lintProject,
                tsconfigRootDir: root,
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            '@typescript-eslint/no-floating-promises': ['error', {
                ignoreVoid: false,
                // node:test owns registered test failures, not arbitrary test-file promises.
                allowForKnownSafeCalls: [{ from: 'package', package: 'node:test', name: ['test', 'it', 'describe', 'suite'] }],
            }],
            '@typescript-eslint/no-misused-promises': 'error',
        },
    },
    {
        // Frozen host fixtures keep upstream directives until the host version retires.
        files: ['modules/xiaobai-os/tests/fixtures/sillytavern-1.14-prompt-functions.js', 'modules/xiaobai-os/tests/fixtures/sillytavern-1.18-prompt-functions.js'],
        rules: { '@eslint-community/eslint-comments/no-use': 'off' },
    },
    {
        files: ['modules/tavern/**/*.{ts,vue}'],
        rules: { 'no-restricted-imports': ['error', { patterns: ['**/xiaobai-os/**'] }] },
    },
    {
        files: ['modules/xiaobai-os/**/*.{ts,vue}'],
        rules: { 'no-restricted-imports': ['error', { patterns: ['**/tavern/**'] }] },
    },
    {
        files: ['modules/xiaobai-os/**/*.vue'],
        rules: {
            'vue/html-indent': ['error', 4],
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
        },
    },
];
