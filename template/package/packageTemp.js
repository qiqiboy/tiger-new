module.exports = {
    files: ['LICENSE', 'README.md', 'dist/', 'src/'],
    scripts: {
        build: 'npm run lint && npm run clear && npm run build:declaration && npm run build:bundle',
        'build:bundle': 'rollup -c',
        'build:declaration': 'tsc --emitDeclarationOnly',
        clear: 'rimraf dist',
        lint: "node_modules/.bin/eslint 'src/**/*.{js,jsx,ts,tsx}'",
        test: 'node jest/test.js',
        tsc:
            "node -e \"require('fs-extra').outputJsonSync('.git-tsconfig.json',{ extends: './tsconfig.json', include: ['*.d.ts'].concat(process.env.StagedFiles.split(/\\n+/)) })\" && echo 'TS checking...\\n' && tsc -p .git-tsconfig.json --noEmit --checkJs false"
    },
    browserslist: ['>0.2%', 'not dead', 'not op_mini all'],
    husky: {
        hooks: {
            'commit-msg': 'node_modules/.bin/commitlint --edit $HUSKY_GIT_PARAMS',
            'pre-commit':
                'lint-staged && export StagedFiles=$(git diff --diff-filter AM --name-only --relative --staged | grep -E \'^src/.*\\.m?[jt]sx?$\') && if [ -n "$StagedFiles"  ]; then npm run tsc ; fi'
        }
    },
    babel: {
        presets: ['react-app']
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
    peerDependencies: {},
    engines: { node: '>=8.10.0' }
};
