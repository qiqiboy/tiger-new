const fs = require('fs-extra');
const path = require('path');
const paths = require('./paths');
const lodash = require('lodash');

module.exports = {
    rootDir: paths.root,
    roots: ['<rootDir>/app', fs.existsSync(path.join(paths.root, 'tests')) && '<rootDir>/tests'].filter(Boolean),
    collectCoverageFrom: ['app/**/*.{js,jsx,ts,tsx}', '!app/**/*.d.ts'],
    setupFiles: [],
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    testMatch: [
        '<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/{app,tests}/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],
    testEnvironment: 'jest-environment-jsdom-fourteen',
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
        '^.+\\.(css|less|sass|scss$)': '<rootDir>/scripts/config/jest/cssTransform.js',
        '^(?!.*\\.(js|jsx|ts|tsx|css|less|sass|scss|json)$)': '<rootDir>/scripts/config/jest/fileTransform.js'
    },
    transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss|less)$'
    ],
    modulePaths: [],
    moduleNameMapper: lodash.reduce(
        paths.alias,
        (result, value, key) => {
            result[`^${key}/(.*)$`] = `${value}/$1`;

            return result;
        },
        {
            '^react-native$': 'react-native-web',
            '^.+\\.module\\.(css|sass|scss|less)$': 'identity-obj-proxy',
            '^libs/(.+)': '<rootDir>/libs/$1',
            '^static/(.+)': '<rootDir>/static/$1'
        }
    ),
    moduleFileExtensions: ['web.js', 'js', 'web.ts', 'ts', 'web.tsx', 'tsx', 'json', 'web.jsx', 'jsx', 'node'],
    verbose: true,
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname']
};
