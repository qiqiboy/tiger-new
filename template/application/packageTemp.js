module.exports = {
    scripts: {
        prepare: 'husky || true',
        start: 'node scripts/start.js',
        build: 'node scripts/build.js',
        'build:dev': 'node scripts/build.js --dev',
        serve: 'node scripts/serve.js',
        count: 'node scripts/count.js',
        'count:js': 'node scripts/count.js --js',
        'i18n-scan': 'node scripts/i18n.js --scan',
        'i18n-read': 'node scripts/i18n.js --read',
        test: 'node scripts/test.js'
    },
    babel: {
        presets: ['react-app-new'],
        plugins: []
    },
    browserslist: ['>0.2%', 'not dead', 'not op_mini all'],
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
        bracketSameLine: true,
        semi: true,
        arrowParens: 'avoid',
        singleQuote: true,
        overrides: [
            {
                files: ['*.json', '*.yml'],
                options: {
                    tabWidth: 2
                }
            }
        ]
    },
    'lint-staged': {
        '{app,tests,static}/**/*.{js,jsx,mjs,ts,tsx}': [
            'prettier --write',
            'eslint --fix'
        ],
        '{app,tests,static}/**/*.{css,scss,less,json,html,md}': ['prettier --write']
    },
    stylelint: {
        extends: 'stylelint-config-recommended'
    },
    engines: { node: '>=18.20.0' }
};
