#!/usr/bin/env node

var chalk = require('chalk');
var ora = require('ora');
var semver = require('semver');

var spinner = ora();

var currentNodeVersion = process.versions.node;

if (semver.lt(currentNodeVersion, '4.0.0')) {
    spinner.fail(
        '你当前node版本为 ' +
            chalk.red(currentNodeVersion) +
            '。\n' +
            '  该项目要求node版本必须 ' +
            chalk.cyan('>= 4.0.0') +
            ' 。\n' +
            '  请升级你的node！'
    );
    process.exit(1);
}

var commander = require('commander');
var inquirer = require('inquirer');
var fs = require('fs-extra');
var path = require('path');
var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');
var appUpgrade = require('./upgrade');
var pkgTemp = require('./packageTemp');

var ownPath = __dirname;
var oldPath = process.cwd();
var projectName;
var projectCustom;

var program = commander
    .version(require('./package.json').version)
    .arguments('<project-directory>')
    .usage(chalk.green('<project-directory>') + ' [options]')
    .option('-u, --upgrade', '升级项目到tiger-new最新构建版本')
    .action(function(name) {
        projectName = name;
    })
    .parse(process.argv);

if (typeof projectName === 'undefined') {
    spinner.fail('请指定要' + (program.upgrade ? '升级' : '创建') + '的项目目录名:');
    console.log('  ' + chalk.cyan(program.name()) + chalk.green(' <项目目录>'));
    console.log();
    console.log('例如:');
    console.log('  ' + chalk.cyan(program.name()) + chalk.green(' my-react-app'));
    console.log();
    process.exit(1);
}

if (program.upgrade) {
    appUpgrade(projectName);
} else if (!isSafeToCreateProjectIn(path.resolve(projectName))) {
    spinner.fail('该文件夹（' + chalk.green(projectName) + '）已经存在，且存在导致冲突的文件.');
    console.log('  请使用一个新的文件夹名，或者使用升级命令将项目构建方式升级到最新版本：');
    console.log();
    console.log('   ' + chalk.cyan(program.name()) + ' ' + chalk.green(projectName) + chalk.cyan(' --upgrade'));
    console.log();
    process.exit(1);
} else {
    inquirer
        .prompt([
            {
                name: 'version',
                type: 'input',
                message: '请输入项目版本号:',
                default: '1.0.0',
                validate: function(input) {
                    return semver.valid(input) ? true : chalk.cyan(input) + ' 不是一个有效的版本号';
                }
            },
            {
                name: 'useCdn',
                type: 'confirm',
                message: '该项目是否需要托管静态资源到cdn服务器?' + chalk.grey('（默认仅支持ssh rsync方式上传到cdn）'),
                default: false
            }
        ])
        .then(function(answers) {
            var questions = [
                {
                    name: 'author',
                    type: 'input',
                    message: '请输入项目所属者（组织）的名字或邮箱:',
                    validate: function(input) {
                        return !!input || '该字段不能为空';
                    }
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
                    message: '请选择项目框架' + chalk.grey('（将会默认安装所选相关框架依赖）') + ':',
                    default: 3
                },
                {
                    name: 'supportDecorator',
                    type: 'confirm',
                    message: '是否开启装饰器' + chalk.grey('@Decoators') + '特性?',
                    default: false
                },
                {
                    name: 'proxy',
                    type: 'input',
                    message: '项目接口代理服务器地址' + chalk.grey('（没有请留空）') + '：',
                    validate: function(input) {
                        return !input || /^http/.test(input) ? true : '请输入一个服务器地址';
                    }
                },
                {
                    name: 'isSpa',
                    type: 'confirm',
                    message: '该项目是否为SPA' + chalk.grey('（单页面应用）') + '?',
                    default: false
                },
                {
                    name: 'enableSW',
                    type: 'confirm',
                    message: '是否启用' + chalk.red('Service Worker Precache') + '离线功能支持?',
                    default: false
                }
            ];

            if (answers.useCdn) {
                questions.unshift(
                    {
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
                            return /\s|\//.test(input.replace(/^\//, ''))
                                ? '文件夹名不能包含 空格、/ 等其它字符'
                                : true;
                        }
                    }
                );
            }

            return inquirer.prompt(questions).then(function(answers_rest) {
                return Object.assign(answers, answers_rest);
            });
        })
        .then(function(answers) {
            projectCustom = answers;

            createApp(projectName);
        });
}

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

    if (projectCustom.enableSW) {
        pkgVendor.push('utils/serviceWorker/register');
    }

    pkgVendor.push('normalize.css', './static/css/vendor.scss');

    fs.ensureDirSync(name);

    console.log('即将在 ' + chalk.green(root) + ' 下创建新的开发项目');
    console.log();

    var packageJson = Object.assign(
        {
            name: appName,
            author: projectCustom.author,
            version: projectCustom.version,
            private: true,
            vendor: pkgVendor,
            noRewrite: !projectCustom.isSpa,
            proxy: projectCustom.proxy || null
        },
        pkgTemp
    );

    if (projectCustom.supportDecorator) {
        packageJson.babel.plugins.push('transform-decorators-legacy');
    }

    if (projectCustom.useCdn) {
        packageJson.cdn = {
            server: 'static:/data0/webservice/static',
            host: projectCustom.host,
            path: '/' + projectCustom.pathname.replace(/^\//g, '')
        };

        packageJson.scripts.cdn = 'node scripts/cdn.js';
        packageJson.scripts.pack += ' && npm run cdn';
    }

    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));

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

    process.on('exit', function() {
        child.kill();
    });
}

function run(appPath, appName) {
    var appPackage = require(path.join(appPath, 'package.json'));

    // Copy over some of the devDependencies
    appPackage.dependencies = appPackage.dependencies || {};
    appPackage.devDependencies = appPackage.devDependencies || {};

    fs.writeFileSync(path.join(appPath, 'package.json'), JSON.stringify(appPackage, null, 2));

    var templatePath = path.join(ownPath, 'template');

    if (fs.existsSync(templatePath)) {
        fs.copySync(templatePath, appPath);
    }

    fs.move(path.join(appPath, 'gitignore'), path.join(appPath, '.gitignore'), function(err) {
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

    // for ternjs config
    fs.move(path.join(appPath, 'tern-project'), path.join(appPath, '.tern-project'), { overwrite: true }, function(
        err
    ) {
        if (err) {
            spinner.fail('create ternjs config error!');
        }
    });
    fs.move(
        path.join(appPath, 'tern-webpack-config.js'),
        path.join(appPath, '.tern-webpack-config.js'),
        { overwrite: true },
        function(err) {
            if (err) {
                spinner.fail('create ternjs config error!');
            }
        }
    );

    var templateDependenciesPath = path.join(ownPath, 'dependencies.json');

    if (fs.existsSync(templateDependenciesPath)) {
        var templateDependencies = require(templateDependenciesPath).devDependencies;

        install(
            Object.keys(templateDependencies).map(function(key) {
                return key + '@' + templateDependencies[key];
            }),
            true,
            function(code, command, args) {
                if (code !== 0) {
                    console.error('`' + command + ' ' + args.join(' ') + '` 运行失败');
                    return;
                }

                var templateDependencies = require(templateDependenciesPath).dependencies;

                install(
                    Object.keys(templateDependencies).map(function(key) {
                        return key + '@' + templateDependencies[key].replace(/^[\^~]/, '');
                    }),
                    false,
                    function(code, command, args) {
                        if (code !== 0) {
                            console.error('`' + command + ' ' + args.join(' ') + '` 运行失败');
                            return;
                        }

                        console.log();
                        spinner.succeed('项目 ' + chalk.green(appName) + ' 已创建成功，路径：' + chalk.green(appPath));
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
                    }
                );
            }
        );
    }
}

// If project only contains files generated by GH, it’s safe.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebookincubator/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root) {
    var validFiles = ['.DS_Store', 'Thumbs.db', '.git', '.gitignore', '.idea', 'README.md', 'LICENSE'];

    return (
        !fs.existsSync(root) ||
        fs.readdirSync(root).every(function(file) {
            return validFiles.indexOf(file) >= 0;
        })
    );
}
