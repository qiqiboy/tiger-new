process.env.NODE_ENV = 'production';

const path = require('path');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const sourceMaps = require('rollup-plugin-sourcemaps');
const filesize = require('rollup-plugin-filesize');
const copy = require('rollup-plugin-copy');
const { terser } = require('rollup-plugin-terser');
const pkg = require('./package.json');

const externalExclude = [
    /*'@babel/runtime', 'regenerator-runtime'*/
];

const exportName = pkg.name.split('/').slice(-1)[0];

function createConfig(env, module) {
    const isProd = env === 'production';

    return {
        input: 'src/index.ts',
        external: id =>
            !id.startsWith('.') && !externalExclude.some(name => id.startsWith(name)) && !path.isAbsolute(id),
        output: {
            file: `dist/${exportName}.${module}.${env}.js`,
            format: module,
            exports: 'named',
            sourcemap: false,
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                'prop-types': 'PropTypes'
            }
        },
        treeshake: {
            pureExternalModules: true
        },
        plugins: [
            replace({
                'process.env.NODE_ENV': JSON.stringify(env)
            }),
            nodeResolve({
                extensions: ['.js', '.jsx', '.ts', '.tsx']
            }),
            commonjs({
                include: /node_modules/
            }),
            babel({
                exclude: 'node_modules/**',
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                runtimeHelpers: true
            }),
            sourceMaps(),
            isProd &&
                terser({
                    sourcemap: true,
                    output: { comments: false },
                    compress: false,
                    warnings: false,
                    ecma: 5,
                    ie8: false,
                    toplevel: true
                }),
            filesize(),
            copy({
                targets: [`npm/index.${module}.js`],
                verbose: true
            })
        ].filter(Boolean)
    };
}

module.exports = [
    createConfig('development', 'cjs'),
    createConfig('production', 'cjs'),
    createConfig('development', 'esm'),
    createConfig('production', 'esm')
];
