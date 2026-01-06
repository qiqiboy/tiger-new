const importPlugin = require('eslint-plugin-import');

module.exports = [
    {
        plugins: {
            import: importPlugin
        },
        rules: {
            // https://github.com/import-js/eslint-plugin-import/tree/main/docs/rules
            'import/first': 'error',
            'import/no-anonymous-default-export': [
                'error',
                {
                    allowArray: true,
                    allowArrowFunction: false,
                    allowAnonymousClass: false,
                    allowAnonymousFunction: false,
                    allowCallExpression: true,
                    allowLiteral: true,
                    allowObject: true,
                    allowNew: true
                }
            ],
            'import/no-duplicates': 'error',
            'import/no-webpack-loader-syntax': 'error',
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
                    sortTypesGroup: false,
                    alphabetize: { order: 'asc', caseInsensitive: true },
                    'newlines-between': 'never'
                }
            ],
            // 负责 { a, b, c } 子导出顺序
            'sort-imports': [
                'warn',
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                    ignoreMemberSort: false
                }
            ],
            'import/no-useless-path-segments': [
                'error',
                {
                    noUselessIndex: true
                }
            ]
        }
    }
];
