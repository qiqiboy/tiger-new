/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require('fs');
const path = require('path');
const url = require('url');
const address = require('address');
const chalk = require('chalk');
const detect = require('detect-port-alt');
const clearConsole = require('./clearConsole');
const formatWebpackMessages = require('./formatWebpackMessages');
const typescriptFormatter = require('./typescriptFormatter.js');
const getProcessForPort = require('./getProcessForPort');
const forkTsCheckerWebpackPlugin = require('./ForkTsCheckerWebpackPlugin');
const inquirer = require('./inquirer');

const isInteractive = process.stdout.isTTY;

function prepareUrls(protocol, host, port, pathname = '/') {
    const formatUrl = (hostname) =>
        url.format({
            protocol,
            hostname,
            port,
            pathname
        });
    const prettyPrintUrl = (hostname) =>
        url.format({
            protocol,
            hostname,
            port: chalk.bold(port),
            pathname
        });

    const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
    let prettyHost, lanUrlForConfig, lanUrlForTerminal;

    if (isUnspecifiedHost) {
        prettyHost = 'localhost';

        try {
            // This can only return an IPv4 address
            lanUrlForConfig = address.ip();

            if (lanUrlForConfig) {
                // Check if the address is a private ip
                // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
                if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
                    // Address is private, format it for later use
                    lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
                } else {
                    // Address is not private, so we will discard it
                    lanUrlForConfig = undefined;
                }
            }
        } catch (_e) {
            // ignored
        }
    } else {
        prettyHost = host;
    }

    const localUrlForTerminal = prettyPrintUrl(prettyHost);
    const localUrlForBrowser = formatUrl(prettyHost);

    return {
        lanUrlForConfig,
        lanUrlForTerminal,
        localUrlForTerminal,
        localUrlForBrowser
    };
}

function createCompiler({ appName, config, devSocket, urls, tscCompileOnError, webpack, spinner }) {
    let compiler;
    let stime = Date.now();

    try {
        compiler = webpack(config);
    } catch (err) {
        spinner.fail(chalk.red('启动编译失败！'));
        console.log();
        console.log(err.message || err);
        console.log();
        process.exit(1);
    }

    compiler.hooks.invalid.tap('invalid', () => {
        if (isInteractive) {
            clearConsole();
        }

        stime = Date.now();
        spinner.text = chalk.cyan('重新编译...');
    });

    let isFirstCompile = true;
    let tsMessagesPromise;
    let tsMessagesResolver;
    let tsCompilerIndex;

    compiler.compilers.forEach((compiler, index) => {
        compiler.hooks.beforeCompile.tap('beforeCompile', () => {
            tsMessagesPromise = new Promise(resolve => {
                tsMessagesResolver = msgs => resolve(msgs);
            });

            tsCompilerIndex = index;
        });

        forkTsCheckerWebpackPlugin
            .getCompilerHooks(compiler)
            .issues.tap('afterTypeScriptCheck', (issues, compilation) => {
                const allMsgs = [...issues];
                const format = message => `${message.file}\n${typescriptFormatter(message, true)}`;

                tsCompilerIndex === index &&
                    tsMessagesResolver({
                        errors: allMsgs.filter(msg => msg.severity === 'error').map(format),
                        warnings: allMsgs.filter(msg => msg.severity === 'warning').map(format)
                    });
            });
    });

    // "done" event fires when Webpack has finished recompiling the bundle.
    // Whether or not you have warnings or errors, you will get this event.
    compiler.hooks.done.tap('done', async ({ stats: [stats, ...otherStats] }) => {
        if (isInteractive) {
            clearConsole();
        }

        const useTimer = (isTotal = false) =>
            chalk.grey(`(编译${isTotal ? '总' : '已'}耗时: ${(Date.now() - stime) / 1000}s)`);

        const statsData = stats.toJson({
            all: false,
            warnings: true,
            errors: true
        });

        for (let stats of otherStats) {
            const otherData = stats.toJson({
                all: false,
                warnings: true,
                errors: true
            });

            if (statsData.errors.length === 0) {
                statsData.errors.push(...otherData.errors);
            }

            if (statsData.warnings.length === 0) {
                statsData.warnings.push(...otherData.warnings);
            }
        }

        if (statsData.errors.length === 0) {
            const delayedMsg = setTimeout(() => {
                spinner.text = chalk.cyan('文件已编译，正在TSC检查...') + useTimer();
            }, 100);

            const messages =
                process.env.DISABLE_TSC_CHECK === 'true' ? { errors: [], warnings: [] } : await tsMessagesPromise;

            clearTimeout(delayedMsg);

            if (tscCompileOnError) {
                statsData.warnings.push(...messages.errors);
            } else {
                statsData.errors.push(...messages.errors);
            }

            statsData.warnings.push(...messages.warnings);

            const tsStats = otherStats[tsCompilerIndex - 1] || stats;

            if (tscCompileOnError) {
                tsStats.compilation.warnings.push(...messages.errors);
            } else {
                tsStats.compilation.errors.push(...messages.errors);
            }

            tsStats.compilation.warnings.push(...messages.warnings);

            if (messages.errors.length > 0) {
                if (tscCompileOnError) {
                    devSocket.warnings(messages.errors);
                } else {
                    devSocket.errors(messages.errors);
                }
            } else if (messages.warnings.length > 0) {
                devSocket.warnings(messages.warnings);
            }

            if (isInteractive) {
                // clearConsole();
            }
        }

        const messages = formatWebpackMessages(statsData);
        const isSuccessful = !messages.errors.length && !messages.warnings.length;

        if (isSuccessful && (isInteractive || isFirstCompile)) {
            spinner.succeed(chalk.green(`编译通过！${useTimer(true)}`));
            console.log();
            spinner.succeed(chalk.green(`应用(${appName})已启动:`));
            console.log();

            if (urls.lanUrlForTerminal) {
                console.log(`  ${chalk.bold('本地:')}  ${chalk.cyan(urls.localUrlForTerminal)}`);
                console.log(`  ${chalk.bold('远程:')}  ${chalk.cyan(urls.lanUrlForTerminal)}`);
            } else {
                console.log(`  ${urls.localUrlForTerminal}`);
            }
        }

        isFirstCompile = false;

        // If errors exist, only show errors.
        if (messages.errors.length) {
            if (messages.errors.length > 1) {
                messages.errors.length = 1;
            }

            spinner.fail(chalk.red(`编译失败！！${useTimer(true)}`));
            console.log();
            console.log(messages.errors.join('\n\n'));
            console.log();
        }

        // Show warnings if no errors were found.
        if (messages.warnings.length) {
            spinner.warn(chalk.yellow(`编译有警告产生：${useTimer(true)}`));
            console.log();
            console.log(messages.warnings.join('\n\n'));
            console.log();

            // Teach some ESLint tricks.
            console.log(`\n搜索相关${chalk.underline(chalk.yellow('关键词'))}以了解更多关于警告产生的原因.`);

            console.log(
                `如果要忽略警告, 可以将 ${chalk.cyan('// eslint-disable-next-line')} 添加到产生警告的代码行上方\n`
            );
        }

        console.log();
        spinner.text = chalk.cyan('webpack运行中...');
        spinner.render().start();
    });

    return compiler;
}

function resolveLoopback(proxy) {
    const o = url.parse(proxy);

    o.host = undefined;

    if (o.hostname !== 'localhost') {
        return proxy;
    }
    // Unfortunately, many languages (unlike node) do not yet support IPv6.
    // This means even though localhost resolves to ::1, the application
    // must fall back to IPv4 (on 127.0.0.1).
    // We can re-enable this in a few years.
    /* try {
    o.hostname = address.ipv6() ? '::1' : '127.0.0.1';
  } catch (_ignored) {
    o.hostname = '127.0.0.1';
  }*/

    try {
        // Check if we're on a network; if we are, chances are we can resolve
        // localhost. Otherwise, we can just be safe and assume localhost is
        // IPv4 for maximum compatibility.
        if (!address.ip()) {
            o.hostname = '127.0.0.1';
        }
    } catch (_ignored) {
        o.hostname = '127.0.0.1';
    }

    return url.format(o);
}

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
function onProxyError(proxy) {
    return (err, req, res) => {
        const host = req.headers && req.headers.host;

        console.log(
            `${chalk.red('代理错误：')}无法将 ${chalk.cyan(req.url)} 的请求从 ${chalk.cyan(host)} 转发到 ${chalk.cyan(
                proxy
            )}.`
        );

        console.log(
            `点击 https://nodejs.org/api/errors.html#errors_common_system_errors 查看更多信息 (${chalk.cyan(
                err.code
            )}).`
        );

        console.log();

        // And immediately send the proper error response to the client.
        // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
        if (res.writeHead && !res.headersSent) {
            res.writeHead(500);
        }

        res.end(`代理错误： 无法将 ${req.url} 的请求从 ${host} 转发到 ${proxy} (${err.code}).`);
    };
}

function prepareProxy(proxy, appPublicFolder, servedPathname) {
    // `proxy` lets you specify alternate servers for specific requests.
    if (!proxy) {
        return undefined;
    }

    if (typeof proxy !== 'string') {
        return Object.keys(proxy).map(function(path) {
            const opt =
                typeof proxy[path] === 'object'
                    ? proxy[path]
                    : {
                          target: proxy[path]
                      };
            const target = opt.target;

            return Object.assign(
                {
                    logLevel: 'silent'
                },
                opt,
                {
                    context: function(pathname, req) {
                        return (
                            req.method !== 'GET' ||
                            (mayProxy(pathname) && req.headers.accept && req.headers.accept.indexOf('text/html') === -1)
                        );
                    },
                    onProxyReq: (proxyReq) => {
                        if (proxyReq.getHeader('origin')) {
                            proxyReq.setHeader('origin', target);
                        }
                    },
                    onError: onProxyError(target),
                    secure: false,
                    changeOrigin: true,
                    ws: true,
                    xfwd: true
                }
            );
        });
    }

    function mayProxy(pathname) {
        // If proxy is specified, let it handle any request except for
        // files in the public folder and requests to the WebpackDevServer socket endpoint.
        // https://github.com/facebook/create-react-app/issues/6720
        const sockPath = process.env.WDS_SOCKET_PATH || '/ws';
        const isDefaultSockHost = !process.env.WDS_SOCKET_HOST;
        const maybePublicPath = path.resolve(appPublicFolder, pathname.replace(new RegExp('^' + servedPathname), ''));
        const isPublicFileRequest = fs.existsSync(maybePublicPath);
        // used by webpackHotDevClient
        const isWdsEndpointRequest = isDefaultSockHost && pathname.startsWith(sockPath);

        return !(isPublicFileRequest || isWdsEndpointRequest);
    }

    if (!/^http(s)?:\/\//.test(proxy)) {
        console.log(
            chalk.red(`package.json 中的 "proxy" 字段必须以 http:// 或 https:// 开头的字符串或者一个object配置`)
        );

        console.log(chalk.red(`当前 proxy 的类型是 "${typeof proxy}"`));
        console.log(chalk.red('你可以从 package.json 中移除它，或者设置一个字符串地址（目标服务器）'));

        process.exit(1);
    }

    let target;

    if (process.platform === 'win32') {
        target = resolveLoopback(proxy);
    } else {
        target = proxy;
    }

    return [
        {
            target,
            logLevel: 'silent',
            context: function(pathname, req) {
                return (
                    req.method !== 'GET' ||
                    (mayProxy(pathname) && req.headers.accept && req.headers.accept.indexOf('text/html') === -1)
                );
            },
            onProxyReq: (proxyReq) => {
                // Browsers may send Origin headers even with same-origin
                // requests. To prevent CORS issues, we have to change
                // the Origin to match the target URL.
                if (proxyReq.getHeader('origin')) {
                    proxyReq.setHeader('origin', target);
                }
            },
            onError: onProxyError(target),
            secure: false,
            changeOrigin: true,
            ws: true,
            xfwd: true
        }
    ];
}

function choosePort(host, defaultPort, spinner) {
    return detect(defaultPort, host).then(
        (port) =>
            new Promise((resolve) => {
                if (port === defaultPort) {
                    return resolve(port);
                }

                spinner.stop();
                clearConsole();

                const existingProcess = getProcessForPort(defaultPort);
                const question = {
                    type: 'confirm',
                    name: 'shouldChangePort',
                    message:
                        `端口（${chalk.yellow(defaultPort)}）被占用，可能的程序是： \n  ${existingProcess}\n\n` +
                        `  要换一个端口运行本程序吗？`,
                    default: true
                };

                inquirer.prompt(question).then((answer) => {
                    if (answer.shouldChangePort) {
                        resolve(port);
                        console.log();

                        spinner.start();
                    } else {
                        resolve(null);
                    }
                });
            }),
        (err) => {
            throw new Error(
                `${chalk.red(`无法为 ${chalk.bold(host)} 找到可用的端口.`)}\n${`错误信息: ${err.message}` || err}\n`
            );
        }
    );
}

module.exports = {
    choosePort,
    createCompiler,
    prepareProxy,
    prepareUrls
};
