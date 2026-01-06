const restrictedGlobals = require('confusing-browser-globals');
const tseslint = require('typescript-eslint');
const baseConfig = require('./base');
const reactConfig = require('./react');
const jsxA11yConfig = require('./jsx-a11y');
const importConfig = require('./import');
const jestConfig = require('./jest');

module.exports = [
    baseConfig,
    reactConfig,
    jsxA11yConfig,
    importConfig,
    jestConfig,
    {
        rules: {
            'array-callback-return': 'warn',
            'default-case': ['warn', { commentPattern: '^no[-\\s]+default$' }],
            'dot-location': ['warn', 'property'],
            eqeqeq: ['warn', 'smart'],
            'new-parens': 'warn',
            'no-array-constructor': 'warn',
            'no-caller': 'warn',
            'no-cond-assign': ['warn', 'except-parens'],
            'no-const-assign': 'warn',
            'no-constructor-return': ['error'],
            'no-control-regex': 'warn',
            'no-delete-var': 'warn',
            'no-dupe-args': 'warn',
            'no-dupe-class-members': 'warn',
            'no-dupe-keys': 'warn',
            'no-duplicate-case': 'warn',
            'no-empty-character-class': 'warn',
            'no-empty-pattern': 'warn',
            'no-eval': 'warn',
            'no-ex-assign': 'warn',
            'no-extend-native': 'warn',
            'no-extra-bind': 'warn',
            'no-extra-label': 'warn',
            'no-fallthrough': 'warn',
            'no-func-assign': 'warn',
            'no-implied-eval': 'warn',
            'no-invalid-regexp': 'warn',
            'no-iterator': 'warn',
            'no-label-var': 'warn',
            'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
            'no-lone-blocks': 'warn',
            'no-loop-func': 'warn',
            'no-mixed-operators': [
                'warn',
                {
                    groups: [
                        ['&', '|', '^', '~', '<<', '>>', '>>>'],
                        ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
                        ['&&', '||'],
                        ['in', 'instanceof']
                    ],
                    allowSamePrecedence: false
                }
            ],
            'no-multi-str': 'warn',
            'no-global-assign': 'warn',
            'no-unsafe-negation': 'warn',
            'no-new-func': 'warn',
            'no-new-object': 'warn',
            'no-new-symbol': 'warn',
            'no-new-wrappers': 'warn',
            'no-obj-calls': 'warn',
            'no-octal': 'warn',
            'no-octal-escape': 'warn',
            'no-redeclare': 'warn',
            'no-regex-spaces': 'warn',
            'no-restricted-syntax': ['warn', 'WithStatement'],
            'no-script-url': 'warn',
            'no-self-assign': 'warn',
            'no-self-compare': 'warn',
            'no-sequences': 'warn',
            'no-shadow-restricted-names': 'warn',
            'no-sparse-arrays': 'warn',
            'no-template-curly-in-string': 'warn',
            'no-this-before-super': 'warn',
            'no-throw-literal': 'warn',
            'no-undef': 'error',
            'no-restricted-globals': ['error'].concat(restrictedGlobals),
            'no-unreachable': 'warn',
            'no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                    allowTaggedTemplates: true
                }
            ],
            'no-unused-labels': 'warn',
            'no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    args: 'after-used',
                    caughtErrors: 'none',
                    ignoreRestSiblings: true,
                    varsIgnorePattern: '^_|^React$',
                    destructuredArrayIgnorePattern: '^_',
                    argsIgnorePattern: '^_|^err|^ev'
                }
            ],
            'no-use-before-define': [
                'warn',
                {
                    functions: false,
                    classes: false,
                    variables: false
                }
            ],
            'no-useless-computed-key': 'warn',
            'no-useless-concat': 'warn',
            'no-useless-constructor': 'warn',
            'no-useless-escape': 'warn',
            'no-useless-rename': [
                'warn',
                {
                    ignoreDestructuring: false,
                    ignoreImport: false,
                    ignoreExport: false
                }
            ],
            'no-with': 'warn',
            'no-whitespace-before-property': 'warn',
            'require-yield': 'warn',
            'rest-spread-spacing': ['warn', 'never'],
            strict: ['warn', 'never'],
            'unicode-bom': ['warn', 'never'],
            'use-isnan': 'warn',
            'valid-typeof': 'warn',

            'no-restricted-properties': [
                'error',
                {
                    object: 'require',
                    property: 'ensure',
                    message:
                        'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting'
                },
                {
                    object: 'System',
                    property: 'import',
                    message:
                        'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting'
                }
            ],
            'getter-return': 'warn',
            'linebreak-style': ['warn', 'unix'],
            'semi-spacing': ['warn', { before: false }],
            'no-extra-semi': 'warn',
            'padded-blocks': ['warn', 'never'],
            'one-var-declaration-per-line': ['warn', 'initializations'],
            'spaced-comment': ['warn', 'always'],
            'space-in-parens': ['warn', 'never'],
            'space-before-function-paren': [
                'warn',
                {
                    anonymous: 'never',
                    named: 'never',
                    asyncArrow: 'always'
                }
            ],
            'space-unary-ops': 'warn',
            'space-infix-ops': 'warn',
            'space-before-blocks': 'warn',
            'no-trailing-spaces': ['warn', { ignoreComments: true }],
            'key-spacing': ['warn', { mode: 'strict' }],
            'switch-colon-spacing': 'warn',
            'func-call-spacing': ['warn', 'never'],
            'keyword-spacing': 'warn',
            'no-multiple-empty-lines': [
                'warn',
                {
                    max: 1,
                    maxEOF: 0,
                    maxBOF: 0
                }
            ],
            'default-param-last': 'error',
            curly: 'error',
            'dot-notation': 'warn',
            'symbol-description': 'error',
            'prefer-template': 'warn',
            'no-unexpected-multiline': 'warn',
            'no-else-return': 'warn',
            'guard-for-in': 'error',
            'no-multi-spaces': [
                'warn',
                {
                    ignoreEOLComments: true,
                    exceptions: {
                        VariableDeclarator: true,
                        ImportDeclaration: true
                    }
                }
            ],
            'no-floating-decimal': 'warn',
            yoda: 'warn',
            'no-unmodified-loop-condition': 'warn',
            'wrap-iife': ['error', 'inside'],
            'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
            'padding-line-between-statements': [
                'warn',
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
            ]
        }
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
        plugins: {
            '@typescript-eslint': tseslint.plugin
        },
        languageOptions: {
            parser: tseslint.parser,
            sourceType: 'module',
            parserOptions: {
                ecmaVersion: 2018,
                ecmaFeatures: {
                    jsx: true
                },
                projectService: false,
                experimentalDecorators: true,
                warnOnUnsupportedTypeScriptVersion: false
            }
        },
        rules: {
            ...tseslint.configs.eslintRecommended.rules,
            'default-case': 'off',
            '@typescript-eslint/ban-tslint-comment': 'warn',
            '@typescript-eslint/consistent-type-assertions': 'warn',
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/array-type': [
                'warn',
                {
                    default: 'array-simple'
                }
            ],
            '@typescript-eslint/class-literal-property-style': 'warn',
            '@typescript-eslint/consistent-indexed-object-style': 'warn',
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'typeLike',
                    format: ['PascalCase']
                }
            ],
            '@typescript-eslint/no-confusing-non-null-assertion': 'warn',
            '@typescript-eslint/no-duplicate-enum-values': 'error',
            '@typescript-eslint/no-extra-non-null-assertion': 'error',
            '@typescript-eslint/no-extraneous-class': 'error',
            '@typescript-eslint/no-invalid-void-type': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/no-namespace': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
            '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'warn',
            '@typescript-eslint/no-unnecessary-type-constraint': 'error',
            '@typescript-eslint/no-unsafe-declaration-merging': 'error',
            '@typescript-eslint/no-empty-object-type': [
                'error',
                {
                    allowInterfaces: 'never',
                    allowObjectTypes: 'always'
                }
            ],
            '@typescript-eslint/no-redeclare': [
                'error',
                {
                    ignoreDeclarationMerge: true
                }
            ],
            '@typescript-eslint/no-require-imports': ['error', {
                allowAsImport: false
            }],
            '@typescript-eslint/no-this-alias': [
                'error',
                {
                    allowDestructuring: true, // Allow `const { props, state } = this`; false by default
                    allowedNames: ['self'] // Allow `const self = this`; `[]` by default
                }
            ],
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/prefer-as-const': 'warn',
            '@typescript-eslint/prefer-literal-enum-member': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/prefer-namespace-keyword': 'error',
            '@typescript-eslint/triple-slash-reference': 'error',
            '@typescript-eslint/unified-signatures': 'warn',

            'default-param-last': 'off',
            '@typescript-eslint/default-param-last': 'error',

            'no-loop-func': 'off',
            '@typescript-eslint/no-loop-func': 'warn',

            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': [
                'warn',
                {
                    functions: false,
                    classes: false,
                    variables: false,
                    typedefs: false
                }
            ],

            'no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                    allowTaggedTemplates: true
                }
            ],

            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    args: 'after-used',
                    caughtErrors: 'none',
                    ignoreRestSiblings: true,
                    varsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    argsIgnorePattern: '^_|^err|^ev'
                }
            ],

            'no-array-constructor': 'off',
            '@typescript-eslint/no-array-constructor': 'warn',

            'no-useless-constructor': 'off',
            '@typescript-eslint/no-useless-constructor': 'warn'
        }
    }
];
