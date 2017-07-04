process.env.NODE_ENV = 'development';
process.on('unhandledRejection', err => {
    throw err;
});

require('dotenv').config({
    silent: true
});

var path = require('path');
var fs = require('fs');
var chalk = require('chalk');
var webpack = require('webpack');
var childProcess = require('child_process');
var address = require('address');
var WebpackDevServer = require('webpack-dev-server');
var detect = require('detect-port');
var clearConsole = require('react-dev-utils/clearConsole');
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
var formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
var openBrowser = require('react-dev-utils/openBrowser');
var errorOverlayMiddleware = require('react-error-overlay/middleware');
var inquirer = require('react-dev-utils/inquirer');
var config = require('./config/webpack.config.dev');
var paths = require('./config/paths');

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

var child = childProcess.exec('gulp watch', function(error, stdout, stderr) {
    if (error) {
        console.log(error.stack);
        console.log('Erro Code: ' + error.code);
        console.log('Error Signal: ' + error.signal);

        process.exit(0);
    }

    console.log('Results: \n' + stdout);

    if (stderr.length) {
        console.log('Errors: ' + stderr);
    }
});

child.on('exit', function(code) {
    console.log('Child_Process Completed with code: ' + code);
});

// Tools like Cloud9 rely on this.
var DEFAULT_PORT = parseInt(process.env.PORT) || 3000;
var compiler;
var handleCompile;

function setupCompiler(host, port, protocol) {
    try {
        compiler = webpack(config, handleCompile);
    } catch (err) {
        console.log(chalk.red('编译失败'));
        console.log();
        console.log(err.message || err);
        console.log();
        process.exit(1);
    }

    compiler.plugin('invalid', function() {
        clearConsole();
        console.log('重新编译...');
    });

    // "done" event fires when Webpack has finished recompiling the bundle.
    // Whether or not you have warnings or errors, you will get this event.
    compiler.plugin('done', function(stats) {
        clearConsole();

        // We have switched off the default Webpack output in WebpackDevServer
        // options so we are going to "massage" the warnings and errors and present
        // them in a readable focused way.
        var messages = formatWebpackMessages(stats.toJson({}, true));
        if (!messages.errors.length && !messages.warnings.length) {
            console.log(chalk.green('编译通过！'));
            console.log();
            console.log('应用已启动:');
            console.log();
            console.log('本地：' + chalk.cyan(protocol + '://' + host + ':' + port + '/'));
            console.log('远程：' + chalk.cyan(protocol + '://' + address.ip() + ':' + port + '/'));
            console.log();
        }

        // If errors exist, only show errors.
        if (messages.errors.length) {
            console.log(chalk.red('编译失败！！'));
            console.log();
            console.log(messages.errors.join('\n\n'));
            console.log();
            return;
        }

        // Show warnings if no errors were found.
        if (messages.warnings.length) {
            console.log(chalk.yellow('编译有警告产生：'));
            console.log();
            console.log(messages.warnings.join('\n\n'));
            console.log();

            // Teach some ESLint tricks.
            console.log(
                '搜索相关' +
                chalk.underline(chalk.yellow('关键词')) +
                '以了解更多关于警告产生的原因.'
            );
            console.log(
                '如果要忽略警告, 可以将 ' +
                chalk.cyan('// eslint-disable-next-line') +
                ' 添加到产生警告的代码行上方'
            );
            console.log();
        }
    });
}

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
function onProxyError(proxy) {
    return function(err, req, res) {
        var host = req.headers && req.headers.host;
        console.log(
            chalk.red('代理错误：') + '无法将 ' + chalk.cyan(req.url) +
            ' 的请求从 ' + chalk.cyan(host) + ' 转发到 ' + chalk.cyan(proxy) + '.'
        );
        console.log(
            '点击 https://nodejs.org/api/errors.html#errors_common_system_errors 查看更多信息 (' +
            chalk.cyan(err.code) + ').'
        );
        console.log();

        // And immediately send the proper error response to the client.
        // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
        if (res.writeHead && !res.headersSent) {
            res.writeHead(500);
        }
        res.end('代理错误： 无法将 ' + req.url + ' 的请求从 ' +
            host + ' 转发到 ' + proxy + ' (' + err.code + ').'
        );
    }
}

function mayProxy(pathname) {
    const maybePublicPath = path.resolve(paths.appPublic, pathname.slice(1));
    return !fs.existsSync(maybePublicPath);
}

function prepareProxy(proxy) {
    if (proxy) {
        if (typeof proxy === 'object') {
            return Object.keys(proxy)
                .map(function(path) {
                    var opt = typeof proxy[path] === 'object' ? proxy[path] : {
                        target: proxy[path]
                    };
                    var target = opt.target;

                    return Object.assign({}, opt, {
                        context: function(pathname) {
                            return mayProxy(pathname) && pathname.match(path);
                        },
                        onProxyReq: proxyReq => {
                            if (proxyReq.getHeader('origin')) {
                                proxyReq.setHeader('origin', target);
                            }
                        },
                        onError: onProxyError(target)
                    });
                });
        }

        if (!/^http(s)?:\/\//.test(proxy)) {
            console.log(chalk.red('proxy 只能是一个 http:// 或者 https:// 开头的字符串或者一个object配置'));
            console.log(chalk.red('当前 proxy 的类型是 "' + (typeof proxy) + '"。'));
            console.log(chalk.red('你可以从 package.json 中移除它，或者设置一个字符串地址（目标服务器）'));
            process.exit(1);
        }

        return [{
            target: proxy,
            logLevel: 'silent',
            context: function(pathname, req) {
                return (
                    mayProxy(pathname) &&
                    req.headers.accept &&
                    req.headers.accept.indexOf('text/html') === -1
                );
            },
            onProxyReq: function(proxyReq, req, res) {
                if (proxyReq.getHeader('origin')) {
                    proxyReq.setHeader('origin', proxy);
                }
            },
            onError: onProxyError(proxy),
            secure: false,
            changeOrigin: true,
            ws: true,
            xfwd: true
        }];
    }
}

function runDevServer(host, port, protocol) {
    var pkg = require(paths.appPackageJson);
    var devServer = new WebpackDevServer(compiler, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, HEAD, DELETE'
        },
        clientLogLevel: 'none',
        contentBase: paths.appPublic,
        hot: true,
        publicPath: config.output.publicPath,
        quiet: true,
        watchOptions: {
            ignored: /node_modules/
        },
        https: protocol === "https",
        host: host,
        overlay: false,
        disableHostCheck: true,
        compress: true,
        watchContentBase: true,
        historyApiFallback: pkg.noRewrite ? false : {
            disableDotRule: true,
        },
        proxy: prepareProxy(pkg.proxy),
        setup: function(app) {
            app.use(errorOverlayMiddleware());
        }
    });

    // Launch WebpackDevServer.
    devServer.listen(port, (err, result) => {
        if (err) {
            return console.log(err);
        }

        clearConsole();
        console.log(chalk.cyan('正在启动服务...'));
        console.log();
        openBrowser(protocol + '://' + host + ':' + port + '/');
    });

    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
        process.on(sig, function() {
            devServer.close();
            process.exit();
        });
    });
}

function run(port) {
    var protocol = process.env.HTTPS === 'true' ? "https" : "http";
    var host = process.env.HOST || 'localhost';
    setupCompiler(host, port, protocol);
    runDevServer(host, port, protocol);
}

detect(DEFAULT_PORT).then(port => {
    if (port === DEFAULT_PORT) {
        run(port);
        return;
    }

    clearConsole();
    var question = [{
        name: 'shouldChangePort',
        type: 'confirm',
        message: '端口被占用： ' + chalk.yellow(DEFAULT_PORT + '，') +
            '要换一个端口运行本程序吗？',
        default: true
    }];

    inquirer.prompt(question).then(({ shouldChangePort }) => {
        if (shouldChangePort) {
            run(port);
        } else {
            console.log();
            console.log('请关闭占用' + chalk.yellow(DEFAULT_PORT) + '的程序后再运行。');
            console.log();
            process.exit(0);
        }
    });
});
