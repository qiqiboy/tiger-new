const react = require('eslint-plugin-react');
const babelParser = require('@babel/eslint-parser');
const globals = require('globals');

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

module.exports = [
    {
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                sourceType: 'module',
                babelOptions: {
                    babelrc: false,
                    configFile: false,
                    presets: [require.resolve('babel-preset-react-app-new/prod')]
                }
            },
            // true means writeable, false means readonly, 'off' means disabled
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.commonjs,
                ...globals.es2018,
                __: 'readonly',
                __SSR__: 'readonly',
                __DEV__: 'readonly',
                __LOCAL_DEV__: 'readonly'
            }
        }
    }
];
