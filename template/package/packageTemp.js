module.exports = {
    files: ['LICENSE', 'README.md', 'dist/', 'src/'],
    scripts: {
        build: 'npm run lint && npm run clear && npm run build:declaration && npm run build:bundle',
        'build:bundle': 'rollup -c',
        'build:declaration': 'tsc --emitDeclarationOnly',
        clear: 'rimraf dist',
        lint: "node_modules/.bin/eslint 'src/**/*.{js,jsx,ts,tsx}'"
    },
    babel: {
        presets: [
            [
                'react-app',
                {
                    absoluteRuntime: false
                }
            ]
        ]
    },
    browserslist: ['>0.2%', 'not dead', 'not op_mini all'],
    husky: {
        hooks: {
            'commit-msg': 'node_modules/.bin/commitlint --edit $HUSKY_GIT_PARAMS',
            'pre-commit': 'lint-staged'
        }
    },
    eslintConfig: {
        extends: ['react-app']
    },
    commitlint: {
        extends: ['@commitlint/config-conventional'],
        rules: {
            'subject-case': [0],
            'scope-case': [0]
        }
    },
    config: {
        commitizen: {
            path: 'cz-conventional-changelog'
        }
    },
    prettier: {
        printWidth: 120,
        tabWidth: 4,
        trailingComma: 'none',
        jsxBracketSameLine: true,
        semi: true,
        singleQuote: true,
        overrides: [
            {
                files: '*.json',
                options: {
                    tabWidth: 2
                }
            }
        ]
    },
    'lint-staged': {
        'src/**/*.{js,jsx,mjs,ts,tsx}': [
            'node_modules/.bin/prettier --write',
            'node_modules/.bin/eslint --fix',
            'git add'
        ],
        'src/**/*.{css,scss,less,json,html,md}': ['node_modules/.bin/prettier --write', 'git add']
    },
    stylelint: {
        extends: 'stylelint-config-recommended'
    },
    peerDependencies: {
        '@babel/runtime': '^7.0.0'
    }
};
