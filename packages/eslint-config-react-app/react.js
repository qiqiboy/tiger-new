const react = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

const hasJsxRuntime = (() => {
    try {
        require.resolve('react/jsx-runtime');

        return true;
    } catch {}

    return false;
})();

module.exports = [
    {
        plugins: {
            react,
            'react-hooks': reactHooksPlugin
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
            'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],
            'react/forward-ref-uses-ref': 'warn',
            'react/jsx-boolean-value': [
                'warn',
                'never',
                {
                    always: ['value']
                }
            ],
            'react/jsx-key': ['warn', { checkFragmentShorthand: true, warnOnDuplicates: true }],
            'react/jsx-no-comment-textnodes': 'warn',
            'react/jsx-no-duplicate-props': 'warn',
            'react/jsx-no-undef': 'error',
            'react/jsx-pascal-case': [
                'warn',
                {
                    allowAllCaps: true,
                    ignore: []
                }
            ],
            'react/jsx-uses-react': hasJsxRuntime ? 'off' : 'warn',
            'react/jsx-uses-vars': 'warn',
            'react/no-arrow-function-lifecycle': 'error',
            'react/no-danger-with-children': 'warn',
            'react/no-deprecated': 'error',
            'react/no-direct-mutation-state': 'warn',
            'react/no-is-mounted': 'warn',
            'react/no-string-refs': ['warn', { noTemplateLiterals: true }],
            'react/no-this-in-sfc': 'error',
            'react/no-typos': 'error',
            'react/no-unsafe': ['error', { checkAliases: true }],
            'react/react-in-jsx-scope': hasJsxRuntime ? 'off' : 'warn',
            'react/require-render-return': 'error',
            'react/style-prop-object': 'warn',

            ...reactHooksPlugin.configs.recommended.rules,
            'react-hooks/refs': 'off'
        }
    }
];
