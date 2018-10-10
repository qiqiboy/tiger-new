module.exports = {
    scripts: {
        start: 'node scripts/start.js',
        build: 'node scripts/build.js',
        'build:dev': 'node scripts/build.js --dev',
        pack: 'npm run build',
        count: 'node scripts/count.js'
    },
    babel: {
        presets: ['react-app'],
        plugins: ['react-hot-loader/babel']
    },
    husky: {
        hooks: {
            'commit-msg': 'node_modules/.bin/commitlint --edit $HUSKY_GIT_PARAMS',
            'pre-commit': 'lint-staged'
        }
    },
    eslintConfig: {
        extends: ['react-app', './scripts/config/eslintrc.js']
    },
    commitlint: {
        extends: ['@commitlint/config-conventional'],
        rules: {
            'subject-case': [0],
            'scope-case': [0]
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
        '{app,static}/**/*.{js,jsx,mjs}': [
            'node_modules/.bin/eslint --fix',
            'node_modules/.bin/prettier --write',
            'git add'
        ],
        '{app,static}/**/*.{css,scss,less,json,ts}': ['node_modules/.bin/prettier --write', 'git add']
    },
    stylelint: {
        extends: 'stylelint-config-recommended'
    }
};
