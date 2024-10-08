if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

const paths = require('./paths');
const pkg = paths.appPackageJson;

/**
 * 0: off
 * 1: warn
 * 2: error
 */
module.exports = {
    globals: {
        __: true,
        __SSR__: true,
        __DEV__: true,
        __LOCAL_DEV__: true
    },
    settings: {
        'import/core-modules': Object.keys(pkg.dependencies || {}),
        'import/internal-regex': `^(app|libs|static|${Object.keys(paths.moduleAlias).join('|')})/`
    },
    parserOptions: {
        ecmaFeatures: {
            legacyDecorators: true
        }
    },
    rules: {
        'react/react-in-jsx-scope': paths.hasJsxRuntime ? 0 : 2,
        'react/jsx-no-target-blank': 0,
        'react/no-unsafe': [2, { checkAliases: true }],
        'react/no-deprecated': 2,
        'react/no-string-refs': [1, { noTemplateLiterals: true }],
        'react/no-this-in-sfc': 2,
        'jsx-a11y/anchor-is-valid': [
            1,
            {
                aspects: ['invalidHref', 'preferButton']
            }
        ],
        'import/no-anonymous-default-export': [
            1,
            {
                allowArray: true,
                allowArrowFunction: false,
                allowAnonymousClass: false,
                allowAnonymousFunction: false,
                allowCallExpression: true, // The true value here is for backward compatibility
                allowLiteral: true,
                allowObject: true,
                allowNew: true
            }
        ],
        'import/no-duplicates': 1,
        'import/order': [
            1,
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'unknown'],
                alphabetize: { order: 'asc', caseInsensitive: true },
                'newlines-between': 'never'
            }
        ],
        'sort-imports': [
            1,
            {
                ignoreCase: true,
                ignoreDeclarationSort: true
            }
        ],
        'import/no-useless-path-segments': [
            1,
            {
                noUselessIndex: true
            }
        ],
        eqeqeq: [1, 'smart'],
        radix: 0,
        'linebreak-style': [1, 'unix'],
        indent: 0, // process by prettier
        semi: 0, // process by prettier
        'semi-spacing': [1, { before: false }],
        'no-extra-semi': 1,
        'padded-blocks': [1, 'never'],
        'one-var-declaration-per-line': [1, 'initializations'],
        'spaced-comment': [1, 'always'],
        'space-in-parens': [1, 'never'],
        'space-before-function-paren': [
            1,
            {
                anonymous: 'never',
                named: 'never',
                asyncArrow: 'always'
            }
        ],
        'space-unary-ops': 1,
        'space-infix-ops': 1,
        'space-before-blocks': 1,
        'no-trailing-spaces': [1, { ignoreComments: true }],
        'key-spacing': [1, { mode: 'strict' }],
        'switch-colon-spacing': 1,
        'func-call-spacing': [1, 'never'],
        'keyword-spacing': 1,
        'no-multiple-empty-lines': [
            1,
            {
                max: 1,
                maxEOF: 0,
                maxBOF: 0
            }
        ],
        'default-case': [1, { commentPattern: '^no[-\\s]+default$' }],
        'default-param-last': 2,
        curly: 2,
        'dot-notation': 1,
        'symbol-description': 2,
        'prefer-template': 1,
        'no-unexpected-multiline': 1,
        'no-dupe-class-members': 2,
        'no-else-return': 2,
        'guard-for-in': 2,
        'no-empty-pattern': 2,
        'no-implied-eval': 2,
        'no-global-assign': 2,
        'no-multi-spaces': [
            1,
            {
                ignoreEOLComments: true,
                exceptions: {
                    VariableDeclarator: true,
                    ImportDeclaration: true
                }
            }
        ],
        'no-lone-blocks': 2,
        'no-self-compare': 2,
        'no-sequences': 2,
        'no-floating-decimal': 1,
        yoda: 1,
        'no-with': 2,
        'no-useless-escape': 2,
        'no-useless-concat': 2,
        'no-unused-vars': [
            1,
            {
                vars: 'all',
                args: 'after-used',
                ignoreRestSiblings: true,
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_|^err|^ev' // _xxx, err, error, ev, event
            }
        ],
        'no-unmodified-loop-condition': 2,
        'no-unreachable': 1,
        'no-unsafe-negation': 2,
        'wrap-iife': [2, 'inside'],
        'lines-between-class-members': [1, 'always', { exceptAfterSingleLine: true }],
        'padding-line-between-statements': [
            1,
            {
                blankLine: 'always',
                prev: [
                    'multiline-block-like',
                    'multiline-expression',
                    'const',
                    'let',
                    'var',
                    'cjs-import',
                    'import',
                    'export',
                    'cjs-export',
                    'class',
                    'throw',
                    'directive'
                ],
                next: '*'
            },
            {
                blankLine: 'always',
                prev: '*',
                next: [
                    'multiline-block-like',
                    'multiline-expression',
                    'const',
                    'let',
                    'var',
                    'cjs-import',
                    'import',
                    'export',
                    'cjs-export',
                    'class',
                    'throw',
                    'return'
                ]
            },
            { blankLine: 'any', prev: ['cjs-import', 'import'], next: ['cjs-import', 'import'] },
            { blankLine: 'any', prev: ['export', 'cjs-export'], next: ['export', 'cjs-export'] },
            { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }
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
    },
    overrides: [
        {
            files: ['app/**/*'],
            rules: {
                'no-console': 1
            }
        },
        {
            files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
            rules: {
                'no-console': 0,
                'jest/consistent-test-it': [1, { fn: 'test' }],
                'jest/expect-expect': 1,
                'jest/no-deprecated-functions': 2
            }
        },
        {
            files: ['**/*.ts?(x)'],
            /* parserOptions: {
             *     project: paths.appTsConfig,
             * }, */
            rules: {
                // typescript
                '@typescript-eslint/adjacent-overload-signatures': 2,
                '@typescript-eslint/array-type': [
                    1,
                    {
                        default: 'array-simple'
                    }
                ],
                '@typescript-eslint/ban-tslint-comment': 1,
                '@typescript-eslint/ban-types': [
                    2,
                    {
                        extendDefaults: true,
                        types: {
                            '{}': false,
                            object: false
                        }
                    }
                ],
                '@typescript-eslint/class-literal-property-style': 1,
                // '@typescript-eslint/consistent-indexed-object-style': 2,
                '@typescript-eslint/consistent-type-assertions': 2,
                '@typescript-eslint/consistent-type-definitions': [2, 'interface'],
                '@typescript-eslint/member-delimiter-style': [1],
                // '@typescript-eslint/member-ordering': 1,
                '@typescript-eslint/naming-convention': [
                    'error',
                    {
                        selector: 'typeLike',
                        format: ['PascalCase']
                    }
                ],
                '@typescript-eslint/no-confusing-non-null-assertion': 2,
                '@typescript-eslint/no-empty-interface': 2,
                '@typescript-eslint/no-extra-non-null-assertion': 2,
                '@typescript-eslint/no-extraneous-class': 2,
                '@typescript-eslint/no-invalid-void-type': 1,
                '@typescript-eslint/no-misused-new': 2,
                '@typescript-eslint/no-namespace': 2,
                '@typescript-eslint/no-non-null-asserted-optional-chain': 1,
                '@typescript-eslint/no-redeclare': [
                    2,
                    {
                        ignoreDeclarationMerge: true
                    }
                ],
                '@typescript-eslint/no-require-imports': 2,
                '@typescript-eslint/no-var-requires': 2,
                '@typescript-eslint/no-this-alias': [
                    'error',
                    {
                        allowDestructuring: true, // Allow `const { props, state } = this`; false by default
                        allowedNames: ['self'] // Allow `const self = this`; `[]` by default
                    }
                ],
                '@typescript-eslint/no-unnecessary-type-constraint': 1,
                '@typescript-eslint/prefer-as-const': 1,
                // '@typescript-eslint/prefer-function-type': 1,
                '@typescript-eslint/prefer-literal-enum-member': 2,
                '@typescript-eslint/triple-slash-reference': 2,
                '@typescript-eslint/type-annotation-spacing': 1,
                '@typescript-eslint/unified-signatures': 1,

                'no-unused-vars': 0,
                '@typescript-eslint/no-unused-vars': [
                    1,
                    {
                        vars: 'all',
                        args: 'after-used',
                        ignoreRestSiblings: true,
                        varsIgnorePattern: '^_',
                        argsIgnorePattern: '^_|^err|^ev' // _xxx, err, error, ev, event
                    }
                ],

                'default-param-last': 0,
                '@typescript-eslint/default-param-last': 2,

                'no-dupe-class-members': 0,
                '@typescript-eslint/no-dupe-class-members': 2,

                // disabled rules
                '@typescript-eslint/explicit-function-return-type': 0,
                '@typescript-eslint/explicit-member-accessibility': 0,
                '@typescript-eslint/no-explicit-any': 0,
                '@typescript-eslint/no-inferrable-types': 0,
                '@typescript-eslint/no-non-null-assertion': 0
            }
        }
    ]
};
