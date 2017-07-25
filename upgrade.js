var inquirer = require('inquirer');
var fs = require('fs-extra');
var path = require('path');
var chalk = require('chalk');
var _ = require('lodash');
var ora = require('ora');
var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');

var spinner = ora();

var ownPath = __dirname;

function appUpgrade(projectName) {
    var root = path.resolve(projectName);
    var packageJson = path.resolve(root, 'package.json');
    var gulpfile = path.resolve(root, 'gulpfile.js');

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
        .prompt([{
            name: 'upgrade',
            type: 'confirm',
            message: '请确认是否要将 ' + package.name + ' 升级到最新？\n' +
                chalk.dim('1. 向package.json的devDependencies字段下写入需要的依赖') + '\n' +
                chalk.dim('2. 覆盖原来的构建配置目录 /scripts') + '\n',
            default: true
        }])
        .then(answers => {
            if (answers.upgrade) {
                var questions = [];

                if (fs.existsSync(gulpfile)) {
                    questions.push({
                        name: 'rmGulpfile',
                        type: 'confirm',
                        message: '新配置下gulpfile.js已经废弃，是否需要删除它？\n' +
                            chalk.dim('如果你的项目有使用gulp进行其它的操作，请谨慎删除。') + '\n',
                        default: false
                    });
                }

                questions.push({
                    name: 'install',
                    type: 'confirm',
                    message: '由于安装以及升级了部分依赖，为了保证项目正常运行，需要重新安装所有依赖，请确认是否继续？\n' +
                        chalk.dim('该操作将会： 1. 删除 node_modules 目录; 2. 重新运行 npm install 命令') + '\n',
                    default: true
                });

                inquirer
                    .prompt(questions)
                    .then(answers => {
                        console.log();

                        saveDevDependencies(root, package, currentDevDependencies, newDevDependencies);
                        spinner.succeed('package.json中依赖配置已更新！');

                        copyScripts(root);
                        spinner.succeed('scripts构建目录已更新！');

                        if (answers.rmGulpfile) {
                            fs.removeSync(gulpfile);
                            spinner.succeed('gulpfile.js 已删除！');
                        }

                        if (answers.install) {
                            process.chdir(root);
                            spinner.text = '删除 node_modules ...';
                            spinner.start();
                            fs.removeSync(path.join(root, 'node_modules'));
                            spinner.stop();
                            spinner.succeed('删除 node_modules 目录成功！即将重新安装所有依赖...');

                            install(function() {
                                console.log();
                                spinner.succeed('恭喜！项目升级成功！全部依赖已成功重新安装！');
                            });
                        } else {
                            console.log();
                            spinner.succeed('项目升级成功！但是你可能需要重新手动安装确实的依赖。\n  运行 ' + chalk.green((shouldUseCnpm() ? 'cnpm' : 'npm') + ' install'));
                        }
                    });
            } else {
                spinner.fail('升级已取消！');
            }
        });
}

function saveDevDependencies(root, package, currentDevDependencies, newDevDependencies) {
    package.devDependencies = Object.assign(currentDevDependencies, newDevDependencies);

    if (package.cdn) {
        package.scripts.cdn = "node scripts/cdn.js";
        package.scripts.pack = "npm run build & npm run cdn";
    }

    fs.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(package, null, 2)
    );
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

function install(callback) {
    var command;
    var args;
    if (shouldUseCnpm()) {
        command = 'cnpm';
    } else {
        command = 'npm';
    }

    args = ['install'];

    var child = spawn(command, args, {
        stdio: 'inherit'
    });

    child.on('close', function(code) {
        callback(code, command, args);
    });
}


module.exports = appUpgrade;
