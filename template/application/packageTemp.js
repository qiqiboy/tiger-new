module.exports = {
    scripts: {
        start: 'node scripts/start.js',
        build: 'node scripts/build.js',
        'build:dev': 'node scripts/build.js --dev',
        pack: 'npm run build',
        serve: 'node scripts/serve.js',
        count: 'node scripts/count.js',
        'count:js': 'node scripts/count.js --js',
        'i18n-scan': 'node scripts/i18n.js --scan',
        'i18n-read': 'node scripts/i18n.js --read',
        test: 'node scripts/test.js',
        tsc:
            "node -e \"require('fs-extra').outputJsonSync('.git-tsconfig.json',{ extends: './tsconfig.json', include: ['*.d.ts', 'app/utils/i18n/*'].concat(process.env.StagedFiles.split(/\\n+/)) })\" && echo 'TS checking...\\n' && tsc -p .git-tsconfig.json --checkJs false"
    },
    babel: {
        presets: ['react-app'],
        plugins: []
    },
    browserslist: ['>0.2%', 'not dead', 'not op_mini all', 'ie >= 10'],
    husky: {
        hooks: {
            'commit-msg': 'node_modules/.bin/commitlint --edit $HUSKY_GIT_PARAMS',
            'pre-commit':
                'lint-staged && export StagedFiles=$(git diff --name-only --diff-filter AM --relative --staged | grep -E \'.tsx?$\') && if [ -n "$StagedFiles" ]; then npm run tsc; fi',
            'pre-push':
                'CF=$(git diff --diff-filter AM --name-only @{u}..) || CF=$(git diff --diff-filter AM --name-only origin/master...HEAD); FILES=$(echo "$CF" | grep -E \'^app/.*\\.m?[jt]sx?$\'); if [ -n "$FILES" ]; then node_modules/.bin/eslint $FILES --max-warnings 0; fi'
        }
    },
    eslintConfig: {
        extends: ['react-app', 'react-app/jest', './scripts/config/eslintrc.js']
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
        arrowParens: 'avoid',
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
        '{app,tests,static}/**/*.{js,jsx,mjs,ts,tsx}': [
            'node_modules/.bin/prettier --write',
            'node_modules/.bin/eslint --fix'
        ],
        '{app,tests,static}/**/*.{css,scss,less,json,html,md}': ['node_modules/.bin/prettier --write']
    },
    stylelint: {
        extends: 'stylelint-config-recommended'
    },
    engines: { node: '>=10.13.0' }
};
