var inquirer = require('inquirer');
var fs = require('fs-extra');
var path = require('path');
var chalk = require('chalk');
var _ = require('lodash');
var ora = require('ora');
var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');
var pkgTemp = require('./packageTemp');

var spinner = ora();

var ownPath = __dirname;

function appUpgrade(projectName) {
    var root = path.resolve(projectName);
    var packageJson = path.resolve(root, 'package.json');
    var gulpfile = path.resolve(root, 'gulpfile.js');
    var jsconfig = path.resolve(root, 'jsconfig.json');
    var tsconfig = path.resolve(root, 'tsconfig.json');
    var tsconfigLocal = path.resolve(root, 'tsconfig.local.json');
    var tslint = path.resolve(root, 'tslint.json');
    var globalDeclare = path.resolve(root, 'global.d.ts');

    if (!fs.existsSync(root)) {
        spinner.fail(chalk.red(root) + ' 貌似不存在！');
        process.exit();
    }

    if (!fs.existsSync(packageJson)) {
        spinner.fail('项目目录下package.json貌似不存在！');
        process.exit();
    }

    var package = require(packageJson);

    var currentDevDependencies = package.devDependencies || {};
    var newDevDependencies = require(path.join(ownPath, 'dependencies.json')).devDependencies;

    inquirer
        .prompt([
            {
                name: 'upgrade',
                type: 'confirm',
                message:
                    '请确认是否要将 ' +
                    package.name +
                    ' 升级到最新？\n' +
                    chalk.dim('1. 向package.json的devDependencies字段下写入需要的依赖') +
                    '\n' +
                    chalk.dim('2. 覆盖原来的构建配置目录 /scripts') +
                    '\n',
                default: true
            }
        ])
        .then(answers => {
            if (answers.upgrade) {
                var questions = [];

                if (fs.existsSync(gulpfile)) {
                    questions.push({
                        name: 'rmGulpfile',
                        type: 'confirm',
                        message:
                            '新配置下gulpfile.js已经废弃，是否需要删除它？\n' +
                            chalk.dim('如果你的项目有使用gulp进行其它的操作，请谨慎删除。') +
                            '\n',
                        default: false
                    });
                }

                if (!package.prettier) {
                    questions.push({
                        name: 'addPrettier',
                        type: 'confirm',
                        message: '是否需要支持Prettier自动格式化代码？',
                        default: true
                    });
                }

                if (!package.commitlint) {
                    questions.push({
                        name: 'addCommitlint',
                        type: 'confirm',
                        message: '是否需要支持commitlint？',
                        default: true
                    });
                }

                if (!package.babel.plugins || package.babel.plugins.indexOf('transform-decorators-legacy') === -1) {
                    questions.push({
                        name: 'supportDecorator',
                        type: 'confirm',
                        message: '是否开启装饰器' + chalk.grey('@Decoators') + '特性?',
                        default: false
                    });
                }

                inquirer.prompt(questions).then(answers => {
                    console.log();

                    copyScripts(root);
                    spinner.succeed(chalk.green('scripts构建目录已更新！'));

                    if (!fs.existsSync(tsconfig)) {
                        fs.copySync(path.resolve(ownPath, 'template/tsconfig.json'), tsconfig, {
                            overwrite: true
                        });
                        spinner.succeed(chalk.green('tsconfig.json已写入！'));

                        fs.copySync(path.resolve(ownPath, 'template/tsconfig.local.json'), tsconfigLocal, {
                            overwrite: true
                        });
                        spinner.succeed(chalk.green('tsconfig.local.json已写入！'));

                        fs.copySync(path.resolve(ownPath, 'template/tslint.json'), tslint, {
                            overwrite: true
                        });
                        spinner.succeed(chalk.green('tslint.json已写入！'));

                        if (fs.existsSync(jsconfig)) {
                            fs.removeSync(jsconfig);
                            spinner.succeed(chalk.red('jsconfig.json已移除！'));
                        }
                    }

                    if (!fs.existsSync(globalDeclare)) {
                        fs.copySync(path.resolve(ownPath, 'template/global.d.ts'), globalDeclare, {
                            overwrite: true
                        });
                        spinner.succeed(chalk.green('global.d.ts已写入！'));
                    }

                    if (answers.rmGulpfile) {
                        fs.removeSync(gulpfile);
                        spinner.succeed(chalk.red('gulpfile.js 已删除！'));
                    }

                    console.log();

                    if (!package.husky) {
                        package.husky = {
                            hooks: {}
                        };

                        if (package.scripts.precommit) {
                            delete package.scripts.precommit;
                            package.husky.hooks['pre-commit'] = 'lint-staged';
                        }

                        if (package.scripts.commitmsg) {
                            delete package.scripts.commitmsg;
                            package.husky.hooks['commit-msg'] = 'node_modules/.bin/commitlint --edit $HUSKY_GIT_PARAMS';
                        }
                    }

                    if (answers.addPrettier) {
                        package.husky.hooks['pre-commit'] = 'lint-staged';
                        package.prettier = pkgTemp.prettier;
                    }

                    if (answers.addCommitlint) {
                        package.husky.hooks['commit-msg'] = 'node_modules/.bin/commitlint --edit $HUSKY_GIT_PARAMS';
                        package.commitlint = pkgTemp.commitlint;
                    }

                    if (answers.supportDecorator) {
                        if (!package.babel.plugins) {
                            package.babel.plugins = [];
                        }
                        package.babel.plugins.push(['@babel/plugin-proposal-decorators', { legacy: true }]);
                    }

                    if (!package.stylelint) {
                        package['stylelint'] = pkgTemp['stylelint'];
                    }

                    if (!package.browserslist) {
                        package['browserslist'] = pkgTemp['browserslist'];
                    }

                    if (package.babel.plugins.indexOf('transform-decorators-legacy') > -1) {
                        package.babel.plugins.splice(package.babel.plugins.indexOf('transform-decorators-legacy'), 1, [
                            '@babel/plugin-proposal-decorators',
                            { legacy: true }
                        ]);
                    }

                    if (!package.config) {
                        package.config = {};

                        if (!package.config.commitizen) {
                            package.config.commitizen = pkgTemp.config.commitizen;
                        }
                    }

                    if (!package['lint-staged']) {
                        package['lint-staged'] = pkgTemp['lint-staged'];
                    }

                    if (package.cdn) {
                        package.scripts.cdn = 'node scripts/cdn.js';
                        package.scripts.pack = 'npm run build && npm run cdn';
                    }

                    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(package, null, 2));

                    process.chdir(root);

                    install(
                        Object.keys(newDevDependencies).map(function(key) {
                            return key + '@' + newDevDependencies[key];
                        }),
                        true,
                        function() {
                            console.log();
                            spinner.succeed('恭喜！项目升级成功！全部依赖已成功重新安装！');
                        }
                    );
                });
            } else {
                spinner.fail('升级已取消！');
            }
        });
}

function copyScripts(root) {
    fs.copySync(path.resolve(ownPath, 'template/scripts'), path.resolve(root, 'scripts'), {
        overwrite: true
    });
}

function shouldUseCnpm() {
    try {
        execSync('cnpm --version', {
            stdio: 'ignore'
        });
        return true;
    } catch (e) {
        return false;
    }
}

function install(packageToInstall, saveDev, callback) {
    var command;
    var args;

    if (shouldUseCnpm()) {
        command = 'cnpm';
    } else {
        command = 'npm';
    }

    args = ['install', saveDev ? '--save-dev' : '--save', '--save-exact'].concat(packageToInstall);

    var child = spawn(command, args, {
        stdio: 'inherit'
    });

    child.on('close', function(code) {
        callback(code, command, args);
    });

    process.on('exit', function() {
        child.kill();
    });
}

module.exports = appUpgrade;
