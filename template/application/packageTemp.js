module.exports = {
    scripts: {
        start: 'node scripts/start.js',
        build: 'node scripts/build.js',
        'build:dev': 'node scripts/build.js --dev',
        pack: 'npm run build',
        count: 'node scripts/count.js',
        'count:js': 'node scripts/count.js --js',
        'i18n-scan': 'node scripts/i18n.js --scan',
        'i18n-read': 'node scripts/i18n.js --read',
        tsc:
            "node -pe \"require('fs-extra').outputJsonSync('.git-tsconfig.json',{ extends: './tsconfig.json', include: ['*.d.ts'].concat(process.env.StagedFiles.split(/\\n+/)) })\" && tsc -p .git-tsconfig.json --checkJs false"
    },
    babel: {
        presets: ['react-app'],
        plugins: ['react-hot-loader/babel']
    },
    browserslist: ['>0.2%', 'not dead', 'not op_mini all', 'ie > 10'],
    husky: {
        hooks: {
            'commit-msg': 'node_modules/.bin/commitlint --edit $HUSKY_GIT_PARAMS',
            'pre-commit':
                "lint-staged && export StagedFiles=$(git diff --name-only --relative --staged | grep -E '.tsx?$') && if [ -n \"$StagedFiles\"  ]; then echo 'TS checking...' && npm run tsc; fi"
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
        '{app,static}/**/*.{js,jsx,mjs,ts,tsx}': [
            'node_modules/.bin/prettier --write',
            'node_modules/.bin/eslint --fix',
            'git add'
        ],
        '{app,static}/**/*.{css,scss,less,json,html,md}': ['node_modules/.bin/prettier --write', 'git add']
    },
    stylelint: {
        extends: 'stylelint-config-recommended'
    }
};
