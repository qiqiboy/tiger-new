process.env.NODE_ENV = 'development';

require('dotenv').config({
    silent: true
});

var chalk = require('chalk');
var webpack = require('webpack');
var childProcess = require('child_process');
var WebpackDevServer = require('webpack-dev-server');
var historyApiFallback = require('connect-history-api-fallback');
var httpProxyMiddleware = require('http-proxy-middleware');
var detect = require('detect-port');
var clearConsole = require('react-dev-utils/clearConsole');
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
var formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
var openBrowser = require('react-dev-utils/openBrowser');
var prompt = require('react-dev-utils/prompt');
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

child.on('exit', function(code){
    console.log('Child_Process Completed with code: ' + code);
});

// Tools like Cloud9 rely on this.
var DEFAULT_PORT = process.env.PORT || 3000;
var compiler;
var handleCompile;

function setupCompiler(host, port, protocol) {
    compiler = webpack(config, handleCompile);

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
            console.log('  ' + chalk.cyan(protocol + '://' + host + ':' + port + '/'));
            console.log();
        }

        // If errors exist, only show errors.
        if (messages.errors.length) {
            console.log(chalk.red('编译失败！！'));
            console.log();
            messages.errors.forEach(message => {
                console.log(message);
                console.log();
            });
            return;
        }

        // Show warnings if no errors were found.
        if (messages.warnings.length) {
            console.log(chalk.yellow('编译有警告产生：'));
            console.log();
            messages.warnings.forEach(message => {
                console.log(message);
                console.log();
            });
            // Teach some ESLint tricks.
            console.log('You may use special comments to disable some warnings.');
            console.log('Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.');
            console.log('Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.');
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

function addMiddleware(devServer) {
    var proxy = require(paths.appPackageJson).proxy;
    var noRewrite = require(paths.appPackageJson).noRewrite;

    if(!noRewrite) {
        devServer.use(historyApiFallback({
            disableDotRule: true,
            htmlAcceptHeaders: proxy ? ['text/html'] : ['text/html', '*/*']
        }));
    }

    if (proxy) {
        if (typeof proxy !== 'string') {
            console.log(chalk.red('proxy 只能是一个字符串。'));
            console.log(chalk.red('当前 proxy 的类型是 "' + typeof proxy + '"。'));
            console.log(chalk.red('你可以从 package.json 中移除它，或者设置一个字符串地址（目标服务器）'));
            process.exit(1);
        }

        var mayProxy = /^(?!\/(\w+\.html$|.*\.hot-update\.json$|sockjs-node\/)).*$/;
        devServer.use(mayProxy,
            httpProxyMiddleware(pathname => mayProxy.test(pathname), {
                target: proxy,
                logLevel: 'silent',
                onProxyReq: function(proxyReq, req, res) {
                    if (proxyReq.getHeader('origin')) {
                        proxyReq.setHeader('origin', proxy);
                    }
                },
                onError: onProxyError(proxy),
                secure: false,
                changeOrigin: true,
                ws: true
            })
        );
    }

    devServer.use(devServer.middleware);
}

function runDevServer(host, port, protocol) {
    var devServer = new WebpackDevServer(compiler, {
        clientLogLevel: 'none',
        contentBase: [paths.appPublic],
        hot: true,
        publicPath: config.output.publicPath,
        quiet: true,
        watchOptions: {
            ignored: /node_modules/
        },
        https: protocol === "https",
        host: host
    });

    addMiddleware(devServer);

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
    var question =
        chalk.yellow('端口被占用： ' + DEFAULT_PORT + '.') +
        '\n\n要换一个端口运行本程序吗？';

    prompt(question, true).then(shouldChangePort => {
        if (shouldChangePort) {
            run(port);
        }
    });
});
