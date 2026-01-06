const jestPlugin = require('eslint-plugin-jest');
const testingLibraryPlugin = require('eslint-plugin-testing-library');
const globals = require('globals');

module.exports = [
    {
        files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
        languageOptions: {
            globals: {
                ...globals.jest
            }
        },
        plugins: {
            jest: jestPlugin,
            'testing-library': testingLibraryPlugin
        },
        rules: {
            'no-console': 'off',

            'jest/consistent-test-it': ['warn', { fn: 'test' }],
            'jest/expect-expect': 'warn',
            // https://github.com/jest-community/eslint-plugin-jest
            'jest/no-conditional-expect': 'error',
            'jest/no-deprecated-functions': 'error',
            'jest/no-identical-title': 'error',
            'jest/no-interpolation-in-snapshots': 'error',
            'jest/no-jasmine-globals': 'error',
            'jest/no-mocks-import': 'error',
            'jest/valid-describe-callback': 'error',
            'jest/valid-expect': 'error',
            'jest/valid-expect-in-promise': 'error',
            'jest/valid-title': 'warn',

            // https://github.com/testing-library/eslint-plugin-testing-library
            'testing-library/await-async-queries': 'error',
            'testing-library/await-async-utils': 'error',
            'testing-library/no-await-sync-queries': 'error',
            'testing-library/no-container': 'error',
            'testing-library/no-debugging-utils': 'error',
            'testing-library/no-dom-import': ['error', 'react'],
            'testing-library/no-node-access': 'error',
            'testing-library/no-promise-in-fire-event': 'error',
            'testing-library/no-render-in-lifecycle': 'error',
            'testing-library/no-unnecessary-act': 'error',
            'testing-library/no-wait-for-multiple-assertions': 'error',
            'testing-library/no-wait-for-side-effects': 'error',
            'testing-library/no-wait-for-snapshot': 'error',
            'testing-library/prefer-find-by': 'error',
            'testing-library/prefer-presence-queries': 'error',
            'testing-library/prefer-query-by-disappearance': 'error',
            'testing-library/prefer-screen-queries': 'error',
            'testing-library/render-result-naming-convention': 'error'
        }
    }
];
