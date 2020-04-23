if (!process.env.NODE_ENV) {
    process.env.BABEL_ENV = 'production';
    process.env.NODE_ENV = 'production';
}

process.on('unhandledRejection', err => {
    if (err) {
        throw err;
    }
});

require('./config/env');

const chalk = require('chalk');
const path = require('path');
const express = require('express');
const ora = require('ora');
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const clearConsole = require('react-dev-utils/clearConsole');
const openBrowser = require('react-dev-utils/openBrowser');
const { choosePort } = require('./config/helper');
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');
const history = require('connect-history-api-fallback');
const paths = require('./config/paths');
const pkg = require(paths.appPackageJson);

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const spinner = ora('正在启动服务器...').start();

const isInteractive = process.stdout.isTTY;
const publicUrlOrPath = getPublicUrlOrPath(true, process.env.BASE_NAME || pkg.homepage || process.env.PUBLIC_URL);

checkBrowsers(paths.root, isInteractive)
    .then(() => {
        return choosePort(HOST, DEFAULT_PORT, spinner);
    })
    .then(port => {
        if (port == null) {
            return;
        }

        const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
        const urls = prepareUrls(protocol, HOST, port, publicUrlOrPath.slice(0, -1));

        const server = express();
        const createStatic = basename =>
            server.use(
                basename,
                express.static(paths.appBuild, {
                    index: paths.useNodeEnv ? false : 'index.html',
                    setHeaders(res) {
                        res.set('Access-Control-Allow-Origin', '*');
                        res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, HEAD, DELETE, FETCH');
                    },
                    fallthrough: true
                })
            );

        if (!paths.useNodeEnv) {
            server.use(history());
        }

        createStatic('/');

        if (publicUrlOrPath.startsWith('/') && publicUrlOrPath !== '/') {
            createStatic(paths.publicUrlOrPath);
        }

        if (paths.useNodeEnv) {
            server.use(async (request, response, next) => {
                try {
                    let entryName = (request.path.split(/\/+/)[1] || 'index').replace(/\.html$/, '');
                    let htmlEntryFile = path.join(paths.appNodeBuild, entryName + '.html');

                    if (!paths.pageEntries.includes(entryName)) {
                        htmlEntryFile = path.join(paths.appNodeBuild, path.basename(paths.appHtml));
                    }

                    const { default: app } = require(path.join(
                        paths.appNodeBuild,
                        ((paths.nodeEntries[entryName] && entryName) ||
                            (paths.nodeEntries.index && 'index') ||
                            Object.keys(paths.nodeEntries)[0]) + '.js'
                    ));

                    await app(htmlEntryFile, request, response);
                } catch (error) {
                    spinner.fail(chalk.red('服务器有异常！\n'));
                    next(error);
                }
            });
        }

        server.listen(port, HOST, err => {
            if (err) {
                return console.log(err);
            }

            if (isInteractive) {
                clearConsole();
            }

            spinner.succeed(chalk.green('应用(' + pkg.name + ')已启动:'));
            console.log();

            if (urls.lanUrlForTerminal) {
                console.log(`  ${chalk.bold('本地:')}  ${chalk.cyan(urls.localUrlForTerminal)}`);
                console.log(`  ${chalk.bold('远程:')}  ${chalk.cyan(urls.lanUrlForTerminal)}`);
            } else {
                console.log(`  ${urls.localUrlForTerminal}`);
            }

            console.log();

            openBrowser(urls.localUrlForBrowser);
        });
    })
    .catch(err => {
        if (err && err.message) {
            console.log(err.message);
        }

        process.exit(1);
    });
