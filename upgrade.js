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
                chalk.yellow('1. 向package.json的devDependencies字段下写入需要的依赖') + '\n' +
                chalk.yellow('2. 覆盖原来的构建配置目录 /scripts') + '\n',
            default: true
        }])
        .then(answers => {
            if (answers.upgrade) {
                saveDevDependencies(root, package, currentDevDependencies, newDevDependencies);
                copyScripts(root);

                inquirer
                    .prompt([{
                        name: 'install',
                        type: 'confirm',
                        message: '项目已成功升级，是否重新安装相关依赖？\n' +
                            chalk.yellow('删除 node_modules 目录，重新运行 npm install 命令') + '\n',
                        default: false
                    }])
                    .then(answers => {
                        if(answers.install) {
                            process.chdir(root);
                            fs.removeSync(path.join(root, 'node_modules'));
                            console.log();
                            spinner.succeed('删除 node_modules 目录成功！即将重新安装所有依赖...');
                            console.log();
                            install(function(){
                                console.log();
                                console.log();
                                spinner.succeed('恭喜！项目升级成功！全部依赖已成功重新安装！');
                                console.log();
                            });
                        } else {
                            console.log();
                            spinner.succeed('项目升级成功！但是你可能需要重新手动安装确实的依赖。\n  运行 ' + chalk.green((shouldUseCnpm() ? 'cnpm' : 'npm') + ' install'));
                            console.log();
                        }
                    });
            } else {
                spinner.fail('升级已取消！');
            }
        });
}

function saveDevDependencies(root, package, currentDevDependencies, newDevDependencies) {
    package.devDependencies = Object.assign(currentDevDependencies, newDevDependencies);

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
