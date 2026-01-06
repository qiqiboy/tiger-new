const { defineConfig } = require('eslint/config');
const reactAppConfig = require('eslint-config-react-app-new');
const paths = require('./scripts/config/paths');
const pkg = paths.appPackageJson;

module.exports = defineConfig([
    {
        extends: [reactAppConfig],
        settings: {
            'import/core-modules': Object.keys(pkg.dependencies || {}),
            'import/internal-regex': `^(app|libs|static|${Object.keys(paths.moduleAlias).join('|')})/`
        }
    },
    {
        files: ['app/**/*'],
        ignores: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
        // Optional: other custom rules can be added here
        rules: {
            'no-console': 'warn',
            'no-restricted-globals': [
                'error',
                // Inherit from react-app config, DO NOT remove
                ...reactAppConfig[5].rules['no-restricted-globals']
            ],
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'moment',
                            message: 'Please use dayjs instead.'
                        }
                    ]
                }
            ]
        }
    }
]);
