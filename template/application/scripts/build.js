/* eslint @typescript-eslint/no-var-requires: 0 */

const useDevConfig = process.argv[2] === '--dev';

process.env.BABEL_ENV = useDevConfig ? 'development' : 'production';
process.env.NODE_ENV = useDevConfig ? 'development' : 'production';

process.env.WEBPACK_BUILDING = 'true';

process.on('unhandledRejection', err => {
    throw err;
});

require('./config/env');

const path = require('path');
const fs = require('fs-extra');
const { checkBrowsers } = require('tiger-new-utils/browsersHelper');
const chalk = require('tiger-new-utils/chalk');
const checkMissDependencies = require('tiger-new-utils/checkMissDependencies');
const checkRequiredFiles = require('tiger-new-utils/checkRequiredFiles');
const clearConsole = require('tiger-new-utils/clearConsole');
const FileSizeReporter = require('tiger-new-utils/FileSizeReporter');
const formatWebpackMessages = require('tiger-new-utils/formatWebpackMessages');
const ora = require('tiger-new-utils/ora');
const printBuildError = require('tiger-new-utils/printBuildError');
const webpack = require('webpack');
const { printServeCommand } = require('./config/helper');
const paths = require('./config/paths');
const configFactory = require('./config/webpack.config');
const { ensureLocals } = require('./i18n');

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const isInteractive = process.stdout.isTTY;

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    console.log();
    process.exit(1);
}

ensureLocals();

const spinner = ora('webpack启动中...').start();
// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

const config = configFactory(useDevConfig ? 'development' : 'production');
const nodeConfig = configFactory(useDevConfig ? 'development' : 'production', 'node');

checkBrowsers(paths.root, isInteractive).then(() => {
    return checkMissDependencies(paths.root, paths.npmCommander, spinner)
        .then(() => {
            return measureFileSizesBeforeBuild(paths.appBuild);
        })
        .then(previousFileSizes => {
            // Remove all content but keep the directory
            fs.emptyDirSync(paths.appBuild);
            // Merge with the public folder
            copyPublicFolder();

            // Start the webpack build
            return build(previousFileSizes);
        })
        .then(({ stats, previousFileSizes, warnings, compiler }) => {
            if (warnings.length) {
                spinner.warn(chalk.yellow('编译有警告产生：'));
                console.log();
                console.log(warnings.join('\n\n'));
                console.log();

                // Teach some ESLint tricks.
                console.log(`\n搜索相关${chalk.underline(chalk.yellow('关键词'))}以了解更多关于警告产生的原因.`);

                console.log(
                    `如果要忽略警告, 可以将 ${chalk.cyan('// eslint-disable-next-line')} 添加到产生警告的代码行上方\n`
                );

                console.log();
                console.log();

                if (!useDevConfig && process.env.COMPILE_ON_WARNING !== 'true') {
                    spinner.fail(chalk.red('请处理所有的错误和警告后再build代码！'));

                    console.log();
                    console.log();
                    process.exit(1);
                }
            } else {
                spinner.succeed(chalk.green('编译通过！！'));
                console.log();
            }

            spinner.succeed('gzip后的文件大小:');
            console.log();

            printFileSizesAfterBuild(
                stats.stats[0],
                previousFileSizes,
                paths.appBuild,
                WARN_AFTER_BUNDLE_GZIP_SIZE,
                WARN_AFTER_CHUNK_GZIP_SIZE
            );

            console.log();

            if (/^http/.test(paths.publicUrlOrPath) === false) {
                spinner.succeed(chalk.green('项目打包完成，运行以下命令可即时预览：'));
                console.log();

                printServeCommand();
            } else {
                spinner.succeed(`项目打包完成，请确保资源已上传到：${chalk.green(paths.publicUrlOrPath)}.`);
            }

            console.log();

            let timer;
            const startTime = Date.now();
            const logProgress = function(prefix, isStop) {
                let text = `${prefix || '正在生成本地缓存...'}已耗时：${((Date.now() - startTime) / 1000).toFixed(3)}s`;

                if (isStop) {
                    clearTimeout(timer);
                    spinner.succeed(chalk.green(text));
                } else {
                    spinner.text = chalk.cyan(text);

                    timer = setTimeout(logProgress, 100);
                }
            };

            if (config.cache) {
                logProgress();
                spinner.start();
            }

            return new Promise((resolve, reject) =>
                compiler.close(err => {
                    if (err) {
                        return reject(err);
                    }

                    if (config.cache) {
                        logProgress(`本地缓存已生成：${path.resolve(paths.appNodeModules, '.cache/webpack')} | `, true);
                    }

                    resolve();
                })
            );
        })
        .catch(err => {
            spinner.fail(chalk.red('编译失败！！'));
            console.log();

            printBuildError(err);

            process.exit(1);
        });
});

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
    let packText = useDevConfig ? '启动测试环境打包编译...' : '启动生产环境打包压缩...';
    let startTime = Date.now();
    let timer;
    let logProgress = function(stop) {
        let text = `${packText}已耗时：${((Date.now() - startTime) / 1000).toFixed(3)}s`;

        if (stop) {
            clearTimeout(timer);
            spinner.succeed(chalk.green(text));
        } else {
            spinner.text = chalk.cyan(text);

            timer = setTimeout(logProgress, 100);
        }
    };

    clearConsole();
    logProgress();

    let compiler = webpack(paths.useNodeEnv ? [config, nodeConfig] : [config]);

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages;

            logProgress(true); // 停止
            console.log();

            if (err) {
                if (!err.message) {
                    return reject(err);
                }

                let errMessage = err.message;

                // Add additional information for postcss errors
                if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
                    errMessage += `\nCompileError: Begins at CSS selector ${err.postcssNode.selector}`;
                }

                messages = formatWebpackMessages({
                    errors: [errMessage],
                    warnings: []
                });
            } else {
                messages = formatWebpackMessages(stats.toJson({ all: false, warnings: true, errors: true }));
            }

            if (messages.errors.length) {
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }

                return reject(new Error(messages.errors.join('\n\n')));
            }

            const resolveArgs = {
                stats,
                previousFileSizes,
                warnings: messages.warnings,
                compiler
            };

            return resolve(resolveArgs);
        });
    });
}

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => {
            const relative = path.relative(paths.appPublic, file);
            const mayHtmlEntryName = relative.replace(/(\.web|\.node)?\.html$/i, '');
            const basename = path.basename(file);
            const isDirectory = fs.statSync(file).isDirectory();

            return isDirectory
                ? basename !== 'layout' // layout目录不复制
                : !basename.startsWith('_') &&
                      !paths.pageEntries[mayHtmlEntryName] &&
                      !paths.nodePageEntries[mayHtmlEntryName];
        }
    });
}
