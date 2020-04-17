if (!process.env.NODE_ENV) {
    process.env.BABEL_ENV = 'production';
    process.env.NODE_ENV = 'production';
}

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const express = require('express');
const ora = require('ora');
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const clearConsole = require('react-dev-utils/clearConsole');
const openBrowser = require('react-dev-utils/openBrowser');
const { choosePort } = require('./config/helper');
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const history = require('connect-history-api-fallback');
const paths = require('./config/paths');
const pkg = require(paths.appPackageJson);

const useNodeBuild = false; // paths.appNodeBuild;

const app = useNodeBuild && require(path.join(paths.appNodeBuild, 'index.js')).default;

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const spinner = ora('正在启动服务器...').start();

const isInteractive = process.stdout.isTTY;

checkBrowsers(paths.root, isInteractive)
    .then(() => {
        return choosePort(HOST, DEFAULT_PORT, spinner);
    })
    .then(port => {
        if (port == null) {
            return;
        }

        const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
        const urls = prepareUrls(protocol, HOST, port, paths.publicUrlOrPath.slice(0, -1));

        const server = express();

        if (useNodeBuild) {
            server.use(async (request, response, next) => {
                try {
                    await app(request, response, next);
                } catch (error) {
                    next(error);
                }
            });
        } else {
            server.use(
                history({
                    rewrites:
                        paths.publicUrlOrPath !== '/' && paths.publicUrlOrPath.startsWith('/')
                            ? [
                                  {
                                      from: new RegExp('^' + paths.publicUrlOrPath + '(.+)'),
                                      to: function(context) {
                                          const file = context.parsedUrl.pathname.replace(
                                              new RegExp('^' + paths.publicUrlOrPath.slice(0, -1)),
                                              ''
                                          );

                                          if (fs.existsSync(path.join(paths.appBuild, file))) {
                                              return file;
                                          }

                                          return '/';
                                      }
                                  }
                              ]
                            : undefined
                })
            );
        }

        server.use(
            express.static(paths.appBuild, {
                index: useNodeBuild ? false : 'index.html',
                setHeaders(res) {
                    res.set('Access-Control-Allow-Origin', '*');
                    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, HEAD, DELETE, FETCH');
                }
            })
        );

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
