/* eslint @typescript-eslint/no-var-requires: 0 */
const path = require('path');
const fs = require('fs-extra');
const Rsync = require('rsync');
const OSS = require('ali-oss');
const chalk = require('chalk');
const lodash = require('lodash');
const glob = require('glob');
const paths = require('./config/paths');
const ora = require('ora');
const pkg = require(paths.appPackageJson);

const staticFileName = 'static.config.json';
const staticConfigFile = path.resolve(paths.root, staticFileName);
const oldStaticConfig = lodash.invert(getStaticConfig(staticConfigFile));
const newStaticConfig = {};

const spinner = ora();
let throttleDelay = 0;

/*!
 * 支持两种cdn配置方式，分别需要在package.json中配置相关的cdn字段
 * {
 *      "cdn": {
 *          "host": "https://xxx.com",
 *          "path": "/xxx",
 *          "server": "host:path",
 *          "ali-oss": {
 *              ...
 *          }
 *      }
 * }
 *
 * server和ali-oss字段必选其一配置，别对对应下述两种cdn配置方式：
 *
 * 1. 阿里云的OSS存储服务，对应ali-oss配置（具体需要配置的内容可以参考阿里云文档）
 * 2. 通过ssh的rsync命令传到源服务器上，对应server字段配置，即rasync命令的目标服务器与路径
 */

if (pkg.cdn) {
    runCDN();
} else {
    spinner.info(chalk.cyan('未发现CDN配置信息，已跳过'));
}

function getStaticConfig(path) {
    try {
        return require(path) || {};
    } catch (e) {
        return {};
    }
}

function removeFileNameHash(fileName) {
    const pipes = fileName.split('.');

    pipes.splice(-2, 1);
    return pipes.join('.');
}

function runCDN() {
    throttleDelay = 0;

    spinner.start('开始上传');

    let exitsNum = 0;
    const useOSS = !!pkg.cdn['ali-oss'];
    const allFiles = glob.sync(path.join(paths.appBuild, 'static/**/!(*.map)'));
    const allSyncPromises = allFiles
        .filter(function(file) {
            const relative = path.relative(paths.appBuild, file);

            // 文件夹不处理
            if (fs.statSync(file).isDirectory()) {
                return false;
            }

            newStaticConfig[/js$|css$/.test(relative) ? removeFileNameHash(relative) : relative] = relative;

            // 已经存在
            if (oldStaticConfig[relative]) {
                spinner.succeed(chalk.green('已存在：' + relative));
                exitsNum++;
                return false;
            }

            return true;
        })
        .map(useOSS ? createOSS : createRsync);

    Promise.all(allSyncPromises).then(function(rets) {
        var uploadNum = rets.filter(Boolean).length;
        var failNum = rets.length - uploadNum;

        console.log();
        console.log(
            chalk[failNum ? 'red' : 'cyan'](
                '+++++++++++++++++++++++++++++++\n 文件上传完毕(' +
                    chalk.blue(pkg.cdn.path) +
                    ') \n ' +
                    chalk.magenta('成功: ' + uploadNum) +
                    ' \n ' +
                    chalk.red('失败: ' + failNum) +
                    ' \n ' +
                    chalk.green('重复: ' + exitsNum) +
                    '\n+++++++++++++++++++++++++++++++'
            )
        );

        if (!failNum) {
            fs.outputFile(staticConfigFile, JSON.stringify(newStaticConfig, '\n', 4));
            console.log(chalk.blue('配置文件已经更新: ' + staticConfigFile));
            console.log();
            console.log(chalk.green('项目已经成功编译，运行以下命令可即时预览：'));

            if (!paths.serve) {
                console.log(chalk.cyan('npm') + ' install -g serve');
            }

            console.log(chalk.cyan('serve') + ' -s ' + path.relative('.', paths.appBuild));
        } else {
            console.log(chalk.red('文件未全部上传，请单独运行') + chalk.green(' npm run cdn ') + chalk.red('命令!'));
        }

        console.log();
    });
}

function createRsync(file) {
    return new Promise(resolve => {
        setTimeout(() => {
            const rsync = new Rsync();
            const relative = path.relative(paths.appBuild, file);

            rsync.cwd(paths.appBuild);
            rsync
                .flags('Rz') // 相对路径上传、压缩
                .source(relative)
                .destination(path.join(pkg.cdn.server || 'static:/data0/webservice/static', pkg.cdn.path))
                .execute(function(error, code, cmd) {
                    if (error) {
                        resolve(false);
                        spinner.fail(chalk.red('上传失败(' + error + ')：' + relative));
                    } else {
                        resolve(true);
                        spinner.warn(chalk.yellow('已上传：' + relative));
                    }
                });
        }, 100 * throttleDelay++);
    });
}

function createOSS(file) {
    return new Promise(resolve => {
        setTimeout(() => {
            const client = new OSS(pkg.cdn['ali-oss']);
            const objectName = path.relative(paths.appBuild, file);

            client
                .put(path.join(pkg.cdn.path, objectName), file)
                .then(() => {
                    resolve(true);
                    spinner.warn(chalk.yellow('已上传：' + objectName));
                })
                .catch(error => {
                    resolve(false);
                    spinner.fail(chalk.red('上传失败(' + error + ')：' + objectName));
                });
        }, 100 * throttleDelay++);
    });
}
