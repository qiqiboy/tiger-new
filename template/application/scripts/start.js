process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', err => {
    if (err) {
        throw err;
    }
});

require('./config/env');

const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const ora = require('ora');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const { choosePort, createCompiler, prepareProxy, createDevServerConfig } = require('./config/helper');
const paths = require('./config/paths');
const configFactory = require('./config/webpack.config');
const checkMissDependencies = require('./config/checkMissDependencies');
const { ensureLocals } = require('./i18n');
const pkg = require(paths.appPackageJson);

const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    console.log();
    process.exit(1);
}

// Ensure 'locals' dir exist
ensureLocals();

const spinner = ora('webpack启动中...').start();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

checkMissDependencies(spinner).then(() => {
    return checkBrowsers(paths.root, isInteractive)
        .then(() => {
            return choosePort(HOST, DEFAULT_PORT, spinner);
        })
        .then(port => {
            if (port == null) {
                console.log();

                spinner.fail(
                    `请关闭占用 ${chalk.bold(
                        chalk.yellow(DEFAULT_PORT)
                    )} 端口的程序后再运行；或者指定一个新的端口：${chalk.bold(chalk.yellow('PORT=4000 npm start'))}`
                );

                console.log();
                process.exit(0);
            }

            const config = configFactory('development');
            const nodeConfig = configFactory('development', 'node');
            const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
            const appName = pkg.name;
            const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
            const urls = prepareUrls(protocol, HOST, port, paths.publicUrlOrPath.slice(0, -1));
            const devSocket = {
                warnings: warnings => devServer.sockWrite(devServer.sockets, 'warnings', warnings),
                errors: errors => devServer.sockWrite(devServer.sockets, 'errors', errors)
            };
            const compiler = createCompiler({
                appName,
                config: paths.useNodeEnv ? [config, nodeConfig] : [config],
                devSocket,
                urls,
                tscCompileOnError,
                webpack,
                spinner
            });
            const proxySetting = process.env.PROXY || pkg.proxy;
            const proxyConfig = prepareProxy(proxySetting, paths.appPublic, paths.publicUrlOrPath);
            const serverConfig = createDevServerConfig(proxyConfig, urls.lanUrlForConfig, spinner);
            const devServer = new WebpackDevServer(compiler, serverConfig);

            devServer.listen(port, HOST, err => {
                if (err) {
                    return console.log(err);
                }

                if (isInteractive) {
                    clearConsole();
                }

                spinner.text = chalk.cyan('正在启动测试服务器...');
                openBrowser(urls.localUrlForBrowser);
            });

            ['SIGINT', 'SIGTERM'].forEach(function(sig) {
                process.on(sig, function() {
                    spinner.stop();
                    devServer.close();
                    process.exit();
                });
            });

            if (isInteractive || process.env.CI !== 'true') {
                process.stdin.on('end', function() {
                    devServer.close();
                    process.exit();
                });

                process.stdin.resume();
            }
        })
        .catch(err => {
            if (err) {
                console.log(err.message || err);
                console.log();
            }

            spinner.stop();

            process.kill(process.pid, 'SIGINT');
        });
});
