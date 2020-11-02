/* eslint @typescript-eslint/no-var-requires: 0 */
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const execSync = require('child_process').execSync;
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');
const isDev = process.env.NODE_ENV === 'development';
const lodash = require('lodash');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const nodePaths = (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean).map(resolveApp);
const pkg = require(resolveApp('package.json'));
const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === 'development' && process.env.WEBPACK_BUILDING !== 'true',
    pkg.homepage || (pkg.noRewrite ? '.' : undefined),
    process.env.PUBLIC_URL ||
        (process.env.NODE_ENV === 'production' && process.env.SKIP_CDN !== 'true' && pkg.cdn
            ? pkg.cdn.host + pkg.cdn.path
            : process.env.BASE_NAME)
);
const moduleFileExtensions = ['mjs', 'js', 'ts', 'tsx', 'jsx'];

const hasJsxRuntime = (() => {
    if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
        return false;
    }

    try {
        require.resolve('react/jsx-runtime');

        return true;
    } catch (e) {
        return false;
    }
})();

const webModuleFileExtensions = moduleFileExtensions.map(ext => `web.${ext}`).concat(moduleFileExtensions, 'json');
const nodeModuleFileExtensions = moduleFileExtensions.map(ext => `node.${ext}`).concat(moduleFileExtensions, 'json');

function resolveApp(...relativePaths) {
    return path.resolve(appDirectory, ...relativePaths);
}

const webJSEntries = {};
const nodeJSEntries = {};

glob.sync(resolveApp('app/!(_)*.{j,t}s?(x)')).forEach(function(file) {
    const basename = path.basename(file).replace(/(\.web|\.node)?\.[jt]sx?$/, '');

    if (/\.node\.[jt]sx?$/.test(file)) {
        nodeJSEntries[basename] = file;
    } else {
        webJSEntries[basename] = file;
    }
});

const webHtmlEntries = {};
const nodeHtmlEntries = {};

glob.sync(resolveApp('public/!(_)*.html')).forEach(function(file) {
    const basename = path.basename(file).replace(/(\.web|\.node)?\.html$/, '');

    if (/\.node\.html$/.test(file)) {
        nodeHtmlEntries[basename] = file;
    } else {
        webHtmlEntries[basename] = file;
    }
});

const moduleAlias = Object.assign(
    glob.sync(`${resolveApp('app/*')}/`).reduce((alias, file) => {
        alias[path.basename(file)] = path.resolve(file);

        return alias;
    }, {}),
    lodash.mapValues(pkg.alias, function(relativePath) {
        if (fs.pathExistsSync(resolveApp(relativePath))) {
            return resolveApp(relativePath);
        }

        return relativePath;
    })
);

const useNodeEnv = process.env.SSR !== 'false' && Object.keys(nodeJSEntries).length > 0;
const appBuildName = process.env.BUILD_DIR || (isDev ? 'buildDev' : 'build');

module.exports = {
    dotenv: resolveApp('.env'),
    root: resolveApp(''),
    appBuild: resolveApp(appBuildName),
    appNodeBuild: resolveApp(appBuildName, 'node'),
    appPublic: resolveApp('public'),
    appHtml: webHtmlEntries.index || Object.values(webHtmlEntries)[0],
    appNodeHtml:
        nodeHtmlEntries.index ||
        webHtmlEntries.index ||
        Object.values(nodeHtmlEntries)[0] ||
        Object.values(webHtmlEntries)[0],
    appIndexJs: webJSEntries.index || Object.values(webJSEntries)[0],
    appNodeIndexJs: nodeJSEntries.index || Object.values(nodeJSEntries)[0],
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('app'),
    appTsConfig: resolveApp('tsconfig.json'),
    webpackTsConfig: resolveApp('.webpack-tsconfig.json'),
    staticSrc: resolveApp('static'),
    locals: resolveApp('locals'),
    proxySetup: resolveApp('setupProxy.js'),
    appNodeModules: resolveApp('node_modules'),
    ownNodeModules: resolveApp('node_modules'),
    jestConfigFile: resolveApp('scripts/config/jest.config.js'),
    nodePaths: nodePaths,
    publicUrlOrPath,
    webModuleFileExtensions,
    nodeModuleFileExtensions,
    moduleAlias,
    // js entry
    entries: webJSEntries,
    nodeEntries: nodeJSEntries,
    // html entry
    pageEntries: webHtmlEntries,
    nodePageEntries: nodeHtmlEntries,
    // 一些命令检测
    serve: hasInstall('serve'),
    npmCommander: ['tnpm', 'cnpm', 'npm'].find(hasInstall),
    useNodeEnv,
    hasJsxRuntime
};

function hasInstall(command) {
    try {
        execSync(`${command} --version`, {
            stdio: 'ignore'
        });

        return true;
    } catch (e) {
        return false;
    }
}

const tsconfig = require(module.exports.appTsConfig);

fs.outputJsonSync(
    module.exports.webpackTsConfig,
    {
        extends: './tsconfig.json',
        compilerOptions: {
            allowJs: true,
            checkJs: false
        },
        exclude: tsconfig.exclude.concat('setupTests.ts', 'tests', '**/*.test.*', '**/*.spec.*', '**/__tests__')
    },
    {
        spaces: '  '
    }
);
