const fs = require('fs');
const chalk = require('tiger-new-utils/chalk');
const errorOverlayMiddleware = require('tiger-new-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('tiger-new-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('tiger-new-utils/noopServiceWorkerMiddleware');
const redirectServedPath = require('tiger-new-utils/redirectServedPathMiddleware');
const getHttpsConfig = require('tiger-new-utils/getHttpsConfig');
const ignoredFiles = require('tiger-new-utils/ignoredFiles');
const devRendererMiddleware = require('tiger-new-utils/devRendererMiddleware');
const paths = require('./paths');
const pkg = paths.appPackageJson;

const sourceMaps = {};

function registerSourceMap(filename, map) {
    sourceMaps[filename] = map;
}

require('source-map-support').install({
    retrieveSourceMap: filename => {
        let map = sourceMaps[`${filename}.map`];

        return (
            map && {
                map: JSON.parse(map)
            }
        );
    }
});

function createDevServerConfig(proxy, allowedHost, host, port, spinner) {
    const disableHostCheck = !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true';

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, HEAD, DELETE, FETCH'
        },
        allowedHosts: disableHostCheck ? 'all' : [allowedHost],
        compress: true,
        webSocketServer: 'ws',
        client: false,
        static: {
            serveIndex: !paths.useNodeEnv,
            directory: paths.appPublic,
            publicPath: paths.publicUrlOrPath,
            staticOptions: paths.useNodeEnv
                ? {
                      index: !paths.useNodeEnv
                  }
                : undefined,
            watch: {
                ignored: ignoredFiles(paths.appSrc)
            }
        },
        hot: true,
        https: getHttpsConfig(paths.root),
        host,
        port,
        historyApiFallback:
            pkg.noRewrite || paths.useNodeEnv
                ? false
                : {
                      disableDotRule: true,
                      index: paths.publicUrlOrPath
                  },
        proxy,
        devMiddleware: {
            publicPath: paths.publicUrlOrPath.slice(0, -1),
            ...(paths.useNodeEnv
                ? {
                      index: '',
                      serverSideRender: true
                  }
                : {})
        },
        setupMiddlewares(middlewares, devServer) {
            const app = devServer.app;

            middlewares.unshift(evalSourceMapMiddleware(devServer), errorOverlayMiddleware());

            if (fs.existsSync(paths.proxySetup)) {
                require(paths.proxySetup)(app);
            }

            middlewares.push(
                redirectServedPath(paths.publicUrlOrPath),
                noopServiceWorkerMiddleware(paths.publicUrlOrPath)
            );

            if (paths.useNodeEnv) {
                middlewares.push(devRendererMiddleware(paths, registerSourceMap, spinner));
            }

            return middlewares;
        }
    };
}

function printServeCommand() {
    const usedEnvs = ['SSR', 'NODE_ENV', 'BUILD_DIR', 'BASE_NAME', 'PUBLIC_URL'].filter(name =>
        Boolean(process.env[name])
    );

    console.log(
        (usedEnvs.length ? `${usedEnvs.map(name => `${name}=${process.env[name]}`).join(' ')} ` : '') +
            chalk.cyan('npm run serve')
    );
}

module.exports = {
    createDevServerConfig,
    printServeCommand
};
