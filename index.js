#!/usr/bin/env node

'use strict';

var chalk = require('chalk');

var currentNodeVersion = process.versions.node
if (currentNodeVersion.split('.')[0] < 4) {
    console.error(
        chalk.red(
            '你当前node版本为 ' + currentNodeVersion + '。\n' +
            '该项目要求node版本必须 >= 4.0 。\n' +
            '请升级你的node！'
        )
    );
    process.exit(1);
}

var commander = require('commander');
var inquirer = require('inquirer');
var fs = require('fs-extra');
var path = require('path');
var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');
var semver = require('semver');

var ownPath = __dirname;
var oldPath = process.cwd();
var projectName;
var projectCustom;

var program = commander
    .version(require('./package.json').version)
    .arguments('<project-directory>')
    .usage(chalk.green('<project-directory>') + ' [options]')
    .action(function(name) {
        projectName = name;
    })
    .parse(process.argv);

if (typeof projectName === 'undefined') {
    console.error('请指定要创建的项目目录名:');
    console.log('  ' + chalk.cyan(program.name()) + chalk.green(' <项目目录>'));
    console.log();
    console.log('例如:');
    console.log('  ' + chalk.cyan(program.name()) + chalk.green(' my-react-app'));
    console.log();
    process.exit(1);
}

inquirer
    .prompt([{
            name: 'version',
            type: 'input',
            message: '请输入项目版本号:',
            default: '1.0.0'
        }, {
            name: 'host',
            type: 'input',
            message: '请输入cdn服务器host地址:',
            default: 'https://static.example.com',
            validate: function(input) {
                return /^http/.test(input) ? true : '请输入一个服务器地址';
            }
        },
        {
            name: 'pathname',
            type: 'input',
            message: '请输入项目在cdn服务器上的存储文件夹名:',
            default: '/spa-' + path.basename(projectName),
            validate: function(input) {
                return /\s|\//.test(input.replace(/^\//, '')) ? '文件夹名不能包含 空格、/ 等其它字符' : true;
            }
        },
        {
            name: 'author',
            type: 'input',
            message: '请输入项目所属者（组织）的联系邮箱:',
            default: 'imqiqiboy@gmail.com'
        },
        {
            name: 'libs',
            type: 'list',
            choices: [
                { name: '无框架依赖', value: 0 },
                { name: 'jquery 项目', value: 1 },
                { name: 'react 项目', value: 2 },
                { name: 'jquery + react 项目', value: 3 }
            ],
            message: '请选择项目框架（将会默认安装所选相关框架依赖）:',
            default: 3
        },
        {
            name: 'proxy',
            type: 'input',
            message: '项目接口代理服务器地址：',
            validate: function(input) {
                return !input || /^http/.test(input) ? true : '请输入一个服务器地址';
            }
        },
        {
            name: 'isSpa',
            type: 'confirm',
            message: '该项目是否为SPA（单页面应用）?',
            default: false
        }
    ])
    .then(function(answers) {
        projectCustom = answers;

        createApp(projectName);
    });

function createApp(name) {
    var root = path.resolve(name);
    var appName = path.basename(root);
    var pkgVendor = [];

    switch (projectCustom.libs) {
        case 1:
            pkgVendor.push('jquery');
            break;
        case 2:
            pkgVendor.push('react', 'react-dom');
            break;
        case 3:
            pkgVendor.push('jquery', 'react', 'react-dom');
            break;
    }

    pkgVendor.push('./static/css/vendor');

    fs.ensureDirSync(name);
    if (!isSafeToCreateProjectIn(root)) {
        console.log('该文件夹（' + chalk.green(name) + '）已经存在，且存在导致冲突的文件.');
        console.log('请使用一个新的文件夹名。');
        process.exit(1);
    }

    console.log(
        '即将在 ' + chalk.green(root) + ' 下创建新的开发项目'
    );
    console.log();

    var packageJson = {
        name: appName,
        author: projectCustom.author,
        version: projectCustom.version,
        private: true,
        cdn: {
            host: projectCustom.host,
            path: '/' + projectCustom.pathname.replace(/^\//, '')
        },
        vendor: pkgVendor,
        noRewrite: !projectCustom.isSpa,
        proxy: projectCustom.proxy || null,
        scripts: {
            start: "node scripts/start.js",
            build: "node scripts/build.js",
            "build:dev": "node scripts/build.js --dev",
            pack: "npm run build && gulp cdn",
            count: "node scripts/count.js"
        },
        babel: {
            presets: [
                "react-app"
            ]
        },
        eslintConfig: {
            extends: [
                "react-app",
                "./scripts/config/eslintrc.js"
            ]
        }
    };
    fs.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    process.chdir(root);

    console.log('即将安装package依赖，这将花费几分钟时间...');
    console.log();

    run(root, appName);
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
}

function run(appPath, appName) {
    var appPackage = require(path.join(appPath, 'package.json'));

    // Copy over some of the devDependencies
    appPackage.dependencies = appPackage.dependencies || {};
    appPackage.devDependencies = appPackage.devDependencies || {};

    fs.writeFileSync(
        path.join(appPath, 'package.json'),
        JSON.stringify(appPackage, null, 2)
    );

    var templatePath = path.join(ownPath, 'template');
    if (fs.existsSync(templatePath)) {
        fs.copySync(templatePath, appPath);
    }

    fs.move(path.join(appPath, 'gitignore'), path.join(appPath, '.gitignore'), [], function(err) {
        if (err) {
            // Append if there's already a `.gitignore` file there
            if (err.code === 'EEXIST') {
                var data = fs.readFileSync(path.join(appPath, 'gitignore'));
                fs.appendFileSync(path.join(appPath, '.gitignore'), data);
                fs.unlinkSync(path.join(appPath, 'gitignore'));
            } else {
                throw err;
            }
        }
    });

    var templateDependenciesPath = path.join(ownPath, 'dependencies.json');

    if (fs.existsSync(templateDependenciesPath)) {
        var templateDependencies = require(templateDependenciesPath).devDependencies;

        install(Object.keys(templateDependencies).map(function(key) {
            return key + '@' + templateDependencies[key];
        }), true, function(code, command, args) {
            if (code !== 0) {
                console.error('`' + command + ' ' + args.join(' ') + '` 运行失败');
                return;
            }

            var templateDependencies = require(templateDependenciesPath).dependencies;

            install(Object.keys(templateDependencies).map(function(key) {
                return key + '@' + templateDependencies[key].replace(/^[\^~]/, '');
            }), false, function(code, command, args) {
                if (code !== 0) {
                    console.error('`' + command + ' ' + args.join(' ') + '` 运行失败');
                    return;
                }

                console.log();
                console.log('项目 ' + chalk.green(appName) + ' 已创建成功，路径：' + chalk.green(appPath));
                console.log('在该项目，你可以运行以下几个命令：');
                console.log();
                console.log(chalk.cyan('  npm start'));
                console.log('    启动本地服务，进行开发.');
                console.log();
                console.log(chalk.cyan('  npm run build:dev'));
                console.log('    打测试包，部署测试.');
                console.log();
                console.log(chalk.cyan('  npm run pack'));
                console.log('    打线上包，部署线上.');
                console.log();
                console.log('运行下面的命令切换到项目目录开始工作:');
                console.log(chalk.green('  cd ' + path.relative(oldPath, appPath)));
            });
        });
    }
}

// If project only contains files generated by GH, it’s safe.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebookincubator/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root) {
    var validFiles = [
        '.DS_Store', 'Thumbs.db', '.git', '.gitignore', '.idea', 'README.md', 'LICENSE'
    ];
    return fs.readdirSync(root)
        .every(function(file) {
            return validFiles.indexOf(file) >= 0;
        });
}
