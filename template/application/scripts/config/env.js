const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const pkg = require(paths.appPackageJson);

delete require.cache[require.resolve('./paths')];

const NODE_ENV = process.env.NODE_ENV;

let dotenvFiles = [
    `${paths.dotenv}.${NODE_ENV}.local`,
    `${paths.dotenv}.${NODE_ENV}`,
    NODE_ENV !== 'test' && `${paths.dotenv}.local`,
    paths.dotenv
].filter(Boolean);

dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
        require('dotenv-expand')(
            require('dotenv').config({
                path: dotenvFile
            })
        );
    }
});

const appDirectory = fs.realpathSync(process.cwd());

process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter(folder => folder && !path.isAbsolute(folder))
    .map(folder => path.resolve(appDirectory, folder))
    .join(path.delimiter);

if (!('BASE_NAME' in process.env) && 'basename' in pkg) {
    process.env.BASE_NAME = pkg.basename;
}

const REACT_APP = /^(REACT_APP_|TIGER_|WDS_SOCKET_)/i;
const whitelists = ['BASE_NAME'];

function getClientEnvironment(envRaw) {
    const raw = Object.keys(process.env)
        .filter(key => REACT_APP.test(key) || whitelists.includes(key))
        .reduce(
            (env, key) => {
                env[key] = process.env[key];

                return env;
            },
            {
                FAST_REFRESH: paths.useReactRefresh,
                NODE_ENV: process.env.NODE_ENV || 'development',
                WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST || '',
                WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH || '',
                WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT || '',
                ...envRaw
            }
        );
    // Stringify all values so we can feed into Webpack DefinePlugin
    const stringified = {
        'process.env': Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key]);

            return env;
        }, {})
    };

    return { raw, stringified };
}

module.exports = getClientEnvironment;
