const path = require('path');
const fs = require('fs-extra');
const lodash = require('lodash');
const glob = require('glob');
const paths = require('./paths');

const excludeDirs = ['node_modules', 'build', 'buildDev', 'dist'];

const rootFiles = glob.sync('*.*').reduce((mapper, name) => {
    mapper[`^${name}$`] = `<rootDir>/${name}`;

    return mapper;
}, {});
const rootDirs = glob
    .sync('*/')
    .map(name => name.replace(/\/$/, ''))
    .filter(name => !excludeDirs.includes(name))
    .reduce((mapper, name) => {
        mapper[`^${name}/(.+)`] = `<rootDir>/${name}/$1`;

        return mapper;
    }, {});

module.exports = {
    projects: [
        {
            displayName: 'lint',
            runner: 'eslint',
            rootDir: paths.root,
            roots: ['<rootDir>/app', fs.existsSync(path.join(paths.root, 'tests')) && '<rootDir>/tests'].filter(
                Boolean
            ),
            testMatch: [
                '<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}',
                '<rootDir>/{app,tests}/**/*.{spec,test}.{js,jsx,ts,tsx}'
            ]
        },
        {
            displayName: 'test',
            globals: {
                __SSR__: false,
                __DEV__: true,
                __LOCAL_DEV__: true
            },
            rootDir: paths.root,
            roots: ['<rootDir>/app', fs.existsSync(path.join(paths.root, 'tests')) && '<rootDir>/tests'].filter(
                Boolean
            ),
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
                '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
                '^.+\\.module\\.(css|sass|scss|less)$'
            ],
            modulePaths: [],
            moduleNameMapper: lodash.reduce(
                paths.moduleAlias,
                (result, value, key) => {
                    result[`^${key}$`] = value;
                    result[`^${key}/(.*)$`] = `${value}/$1`;

                    return result;
                },
                Object.assign(
                    {
                        '^react-native$': 'react-native-web',
                        '^.+\\.module\\.(css|sass|scss|less)$': 'identity-obj-proxy'
                    },
                    rootFiles,
                    rootDirs
                )
            ),
            moduleFileExtensions: ['web.js', 'js', 'web.ts', 'ts', 'web.tsx', 'tsx', 'json', 'web.jsx', 'jsx', 'node'],
            verbose: false,
            // resetMocks: true,
            watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname']
        }
    ]
};
