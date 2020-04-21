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
const nodePaths = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter(Boolean)
    .map(resolveApp);
const pkg = require(resolveApp('package.json'));
const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === 'development' && process.env.WEBPACK_BUILDING !== 'true',
    pkg.homepage || (pkg.noRewrite ? '.' : undefined),
    process.env.NODE_ENV === 'production' && process.env.SKIP_CDN !== 'true' && pkg.cdn
        ? pkg.cdn.host + pkg.cdn.path
        : process.env.PUBLIC_URL || process.env.BASE_NAME
);
const moduleFileExtensions = ['mjs', 'js', 'ts', 'tsx', 'jsx'];

const webModuleFileExtensions = moduleFileExtensions.map(ext => 'web.' + ext).concat(moduleFileExtensions, 'json');
const nodeModuleFileExtensions = moduleFileExtensions.map(ext => 'node.' + ext).concat(moduleFileExtensions, 'json');

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

const htmlEntries = glob.sync(resolveApp('public/!(_)*.html')).map(function(file) {
    return path.basename(file, '.html');
});

const moduleAlias = Object.assign(
    {
        components: resolveApp('app/components'),
        modules: resolveApp('app/modules'),
        utils: resolveApp('app/utils'),
        stores: resolveApp('app/stores'),
        types: resolveApp('app/types'),
        hooks: resolveApp('app/hooks')
    },
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
    appHtml: resolveApp('public/' + (htmlEntries.includes('index') ? 'index' : htmlEntries[0]) + '.html'),
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
    entries: webJSEntries,
    nodeEntries: nodeJSEntries,
    pageEntries: htmlEntries,
    // 一些命令检测
    serve: hasInstall('serve'),
    npmCommander: ['tnpm', 'cnpm', 'npm'].find(hasInstall),
    useNodeEnv
};

function hasInstall(command) {
    try {
        execSync(command + ' --version', {
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
