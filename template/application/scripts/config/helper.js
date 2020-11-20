const fs = require('fs');
const path = require('path');
const Module = require('module');
const getProcessForPort = require('react-dev-utils/getProcessForPort');
const clearConsole = require('react-dev-utils/clearConsole');
const detect = require('detect-port-alt');
const inquirer = require('inquirer');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const forkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const chalk = require('chalk');
const tmp = require('tmp');
const paths = require('./paths');
const pkg = require(paths.appPackageJson);

const isInteractive = process.stdout.isTTY;

function choosePort(host, defaultPort, spinner) {
    return detect(defaultPort, host).then(
        port =>
            new Promise(resolve => {
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

                inquirer.prompt(question).then(answer => {
                    if (answer.shouldChangePort) {
                        resolve(port);
                        console.log();

                        spinner.start();
                    } else {
                        resolve(null);
                    }
                });
            }),
        err => {
            throw new Error(
                `${chalk.red(`无法为 ${chalk.bold(host)} 找到可用的端口.`)}\n${`错误信息: ${err.message}` || err}\n`
            );
        }
    );
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
            .receive.tap('afterTypeScriptCheck', (diagnostics, lints) => {
                const allMsgs = [...diagnostics, ...lints];
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
                clearConsole();
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

// Ensure the certificate and key provided are valid and if not
// throw an easy to debug error
function validateKeyAndCerts({ cert, key, keyFile, crtFile }) {
    let encrypted;

    try {
        // publicEncrypt will throw an error with an invalid cert
        encrypted = crypto.publicEncrypt(cert, Buffer.from('test'));
    } catch (err) {
        throw new Error(`The certificate "${chalk.yellow(crtFile)}" is invalid.\n${err.message}`);
    }

    try {
        // privateDecrypt will throw an error with an invalid key
        crypto.privateDecrypt(key, encrypted);
    } catch (err) {
        throw new Error(`The certificate key "${chalk.yellow(keyFile)}" is invalid.\n${err.message}`);
    }
}

// Read file and throw an error if it doesn't exist
function readEnvFile(file, type) {
    if (!fs.existsSync(file)) {
        throw new Error(
            `You specified ${chalk.cyan(type)} in your env, but the file "${chalk.yellow(file)}" can't be found.`
        );
    }

    return fs.readFileSync(file);
}

// Get the https config
// Return cert files if provided in env, otherwise just true or false
function getHttpsConfig() {
    const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
    const isHttps = HTTPS === 'true';

    if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
        const crtFile = path.resolve(paths.root, SSL_CRT_FILE);
        const keyFile = path.resolve(paths.root, SSL_KEY_FILE);
        const config = {
            cert: readEnvFile(crtFile, 'SSL_CRT_FILE'),
            key: readEnvFile(keyFile, 'SSL_KEY_FILE')
        };

        validateKeyAndCerts({ ...config, keyFile, crtFile });

        return config;
    }

    return isHttps;
}

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

function createDevServerConfig(proxy, allowedHost, spinner) {
    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, HEAD, DELETE, FETCH'
        },
        disableHostCheck: !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
        // Enable gzip
        compress: true,
        clientLogLevel: 'none',
        contentBase: paths.appPublic,
        contentBasePublicPath: paths.publicUrlOrPath,
        watchContentBase: true,
        hot: true,
        transportMode: 'ws',
        injectClient: false,
        publicPath: paths.publicUrlOrPath.slice(0, -1),
        quiet: true,
        watchOptions: {
            ignored: ignoredFiles(paths.appSrc)
        },
        https: getHttpsConfig(),
        host: process.env.HOST || '0.0.0.0',
        overlay: false,
        historyApiFallback:
            pkg.noRewrite || paths.useNodeEnv
                ? false
                : {
                      disableDotRule: true,
                      index: paths.publicUrlOrPath
                  },
        public: allowedHost,
        proxy,
        ...(paths.useNodeEnv
            ? {
                  index: '',
                  serveIndex: false,
                  serverSideRender: true,
                  staticOptions: {
                      index: false
                  }
              }
            : {}),
        before(app, server) {
            app.use(evalSourceMapMiddleware(server));
            app.use(errorOverlayMiddleware());

            if (fs.existsSync(paths.proxySetup)) {
                require(paths.proxySetup)(app);
            }
        },
        after(app) {
            app.use(redirectServedPath(paths.publicUrlOrPath));
            app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));

            if (paths.useNodeEnv) {
                app.use(devRendererMiddleware(paths.appNodeBuild, registerSourceMap, spinner));
            }
        }
    };
}

function onProxyError(proxy) {
    return function(err, req, res) {
        var host = req.headers && req.headers.host;

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

        if (res.writeHead && !res.headersSent) {
            res.writeHead(500);
        }

        res.end(`代理错误： 无法将 ${req.url} 的请求从 ${host} 转发到 ${proxy} (${err.code}).`);
    };
}

function prepareProxy(proxy, appPublicFolder, servedPathname) {
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
                    onProxyReq: proxyReq => {
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
        const maybePublicPath = path.resolve(appPublicFolder, pathname.replace(new RegExp(`^${servedPathname}`), ''));
        const isPublicFileRequest = fs.existsSync(maybePublicPath);

        return !isPublicFileRequest;
    }

    if (!/^http(s)?:\/\//.test(proxy)) {
        console.log(chalk.red('proxy 只能是一个 http:// 或者 https:// 开头的字符串或者一个object配置'));
        console.log(chalk.red(`当前 proxy 的类型是 "${typeof proxy}"。`));
        console.log(chalk.red('你可以从 package.json 中移除它，或者设置一个字符串地址（目标服务器）'));
        process.exit(1);
    }

    return [
        {
            target: proxy,
            logLevel: 'silent',
            context: function(pathname, req) {
                return (
                    req.method !== 'GET' ||
                    (mayProxy(pathname) && req.headers.accept && req.headers.accept.indexOf('text/html') === -1)
                );
            },
            onProxyReq: proxyReq => {
                if (proxyReq.getHeader('origin')) {
                    proxyReq.setHeader('origin', proxy);
                }
            },
            onError: onProxyError(proxy),
            secure: false,
            changeOrigin: true,
            ws: true,
            xfwd: true
        }
    ];
}

function printBuildError(err) {
    const message = err != null && err.message;
    const stack = err != null && err.stack;

    // Add more helpful message for Terser error
    if (stack && typeof message === 'string' && message.indexOf('from Terser') !== -1) {
        try {
            const matched = /(.+)\[(.+):(.+),(.+)\]\[.+\]/.exec(stack);

            if (!matched) {
                throw new Error('Using errors for control flow is bad.');
            }

            const problemPath = matched[2];
            const line = matched[3];
            const column = matched[4];

            console.log(
                '代码压缩有异常: \n\n',
                chalk.yellow(`\t${problemPath}:${line}${column !== '0' ? `:${column}` : ''}`),
                '\n'
            );
        } catch (ignored) {
            console.log('代码压缩出现异常.', err);
        }
    } else {
        console.log(`${message || err}\n`);
    }

    console.log();
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

function devRendererMiddleware(nodeBuildPath, registerSourceMap, spinner) {
    Object.keys(console).forEach(name => {
        const native = console[name];

        console[name] = (...args) => {
            spinner.clear();
            native(...args);
            spinner.render().start();
        };
    });

    function renderError(res, template, error) {
        res.status(500);
        res.send(template);

        clearConsole();
        console.log();
        spinner.fail(chalk.red('服务端渲染出现了异常:'));
        console.log();
        console.error(error);
    }

    return async (req, res, next) => {
        let cache = {};
        let { webpackStats, fs: memoryFs } = res.locals;
        let entryName = (req.path.split(/\/+/)[1] || 'index').replace(/\.html$/, '');
        let htmlEntryFile = path.join(nodeBuildPath, `${entryName}.html`);

        if (!paths.pageEntries[entryName] && !paths.nodePageEntries[entryName]) {
            htmlEntryFile = path.join(nodeBuildPath, path.basename(paths.appHtml));
        }

        let indexHtmlTemplate = memoryFs.readFileSync(htmlEntryFile, 'utf8');
        let { name: indexPathname, fd } = tmp.fileSync();

        fs.writeSync(fd, indexHtmlTemplate, 0, 'utf8');

        let cleanup = () => {
            clearMemotyReuqireCache(cache);
            fs.close(fd);
        };

        let handleError = (error = 'Unknown Error') => {
            try {
                // Handle any errors by injecting the stack trace into the rendered
                // HTML.
                if (error && typeof error !== 'string') {
                    let indexHtml = indexHtmlTemplate
                        .replace(/%\w+%/g, '')
                        .replace(
                            '<body>',
                            `<body><pre style="position: relative; z-index: 999999; background: #fff; border: 5px solid red; outline: 5px solid #fff; margin: 5px; padding: 1rem;">${error.stack}</pre>`
                        );

                    renderError(res, indexHtml, error);
                } else {
                    next(error);
                }
            } finally {
                cleanup();
            }
        };

        try {
            let stats = webpackStats.toJson({
                all: false,
                assets: true,
                entrypoints: true
            });
            const node = stats.children[1];
            const jsEntryName = node.entrypoints[entryName]
                ? entryName
                : node.entrypoints.index
                ? 'index'
                : Object.keys(paths.nodeEntries)[0];
            const nodeEntrypoints = node.entrypoints[jsEntryName].assets
                .filter(asset => new RegExp(`${jsEntryName}\\.js$`).test(asset))
                .map(asset => path.join(nodeBuildPath, asset));

            // Find any source map files, and pass them to the calling app so that
            // it can transform any error stack traces appropriately.
            for (let { name } of node.assets) {
                let pathname = path.join(nodeBuildPath, name);

                if (/\.map$/.test(pathname) && memoryFs.existsSync(pathname)) {
                    registerSourceMap(pathname, memoryFs.readFileSync(pathname, 'utf8'));
                }
            }

            const entryExport = requireFromFS(nodeEntrypoints[0], memoryFs, cache);
            const renderer = typeof entryExport === 'function' ? entryExport : entryExport.default;

            if (typeof renderer !== 'function') {
                throw new Error(`${nodeEntrypoints[0]} 必须导出一个renderer函数！`);
            }

            await renderer(indexPathname, req, res);

            cleanup();
        } catch (error) {
            handleError(error);
        }
    };
}

// Stubs the `require()` function within any evaluated code, so that entire
// bundles can be loaded from a memory FS like the one passed in by Webpack.
//
// Based on require-from-string
// MIT License, Copyright (c) Vsevolod Strukchinsky
// https://github.com/floatdrop/require-from-string/blob/d1575a49065eb7a49b86b4de963f04f1a14dfd60/index.js
function requireFromFS(absoluteFilename, fs, cache = {}) {
    if (typeof absoluteFilename !== 'string') {
        throw new Error(`[requireFromFS] filename must be a string, not ${typeof absoluteFilename}`);
    }

    let cached = cache[absoluteFilename];

    if (cached) {
        return cached.exports;
    }

    let moduleDirname = path.dirname(absoluteFilename);
    let moduleExtension = path.extname(absoluteFilename);
    let code = fs.readFileSync(absoluteFilename, 'utf8');

    if (typeof code !== 'string') {
        throw new Error(`[requireFromFS] code must be a string, not ${typeof code}`);
    }

    if (moduleExtension === '.json') {
        code = `module.exports = ${code}`;
    }

    let paths = Module._nodeModulePaths(moduleDirname);
    let parent = module.parent;
    let m = new Module(absoluteFilename, parent);

    m.filename = absoluteFilename;

    m.require = filename => {
        if (filename[0] === '.') {
            let resolvedFilename = m.require.resolve(filename);

            return requireFromFS(resolvedFilename, fs, cache);
        }

        return require(filename);
    };

    m.require.resolve = filename => {
        if (filename[0] === '.') {
            let resolvedFilename = path.resolve(moduleDirname, filename);

            if (fs.existsSync(resolvedFilename)) {
                return resolvedFilename;
            }

            throw new Error(`Cannot find module '${filename}'`);
        } else {
            return require.resolve(filename);
        }
    };

    m.paths = paths;
    m._compile(code, absoluteFilename);
    cache[absoluteFilename] = m;
    require.cache[absoluteFilename] = m;

    if (parent && parent.children) {
        parent.children.splice(parent.children.indexOf(m), 1);
    }

    return m.exports;
}

function clearMemotyReuqireCache(cache) {
    let keys = Object.keys(cache);

    for (let key of keys) {
        delete cache[key];
        delete require.cache[key];
    }
}

module.exports = {
    choosePort,
    prepareProxy,
    createCompiler,
    createDevServerConfig,
    printBuildError,
    printServeCommand
};
