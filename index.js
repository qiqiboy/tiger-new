#!/usr/bin/env node

var chalk = require('chalk');
var ora = require('ora');
var semver = require('semver');
var validatePkgName = require('validate-npm-package-name');

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
var ownPkg = require('./package.json');

var ownPath = __dirname;
var oldPath = process.cwd();
var projectName;
var projectCustom = {};

var program = commander
    .version(require('./package.json').version, '-v, --version')
    .arguments('<project-directory>')
    .usage(chalk.green('<project-directory>') + ' [options]')
    .option('-u, --upgrade', '升级项目到tiger-new最新构建版本')
    .option('-m, --mode <mode>', '选择模板类型，application 或 package', function (val) {
        if (['application', 'package'].indexOf(val) < 0) {
            spinner.fail('参数错误：-m --mode 只能是 application 或 package');
            process.exit(1);
        }

        return val;
    })
    .action(function (name, mode) {
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

var mode = program.mode;

if (program.upgrade) {
    appUpgrade(projectName, mode);
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
                name: 'type',
                type: 'list',
                choices: [
                    { name: '普通项目(application)', value: 'application' },
                    { name: 'npm包项目(package)', value: 'package' }
                ],
                message: '请选择该项目用途？',
                default: 'application',
                when: !mode
            }
        ])
        .then(function (answers) {
            if (!answers.type) {
                answers.type = mode;
            }

            Object.assign(projectCustom, answers);

            const questions = [
                {
                    name: 'version',
                    type: 'input',
                    message: '请输入项目版本号(version):',
                    default: answers.type === 'application' ? '1.0.0' : '0.0.1',
                    validate: function (input) {
                        return semver.valid(input) ? true : chalk.cyan(input) + ' 不是一个有效的版本号';
                    }
                },
                {
                    name: 'name',
                    type: 'input',
                    message: '请输入项目名称(name):',
                    default: path.basename(path.resolve(projectName)),
                    validate: function (input) {
                        const result = validatePkgName(input);

                        if (result.validForNewPackages) {
                            return true;
                        } else {
                            return (
                                chalk.cyan(input) +
                                ' 不是一个有效的package名称：\n' +
                                chalk.red((result.errors || result.warnings).map(text => '* ' + text).join('\n'))
                            );
                        }
                    }
                },
                {
                    name: 'description',
                    type: 'input',
                    message: '请输入项目描述(description):'
                },
                {
                    name: 'author',
                    type: 'input',
                    message: '请输入项目所属者（组织）的名字或邮箱:',
                    validate: function (input) {
                        return !!input || '该字段不能为空';
                    }
                }
            ];

            if (answers.type === 'application') {
                questions.push(
                    {
                        name: 'useCdn',
                        type: 'confirm',
                        message:
                            '该项目是否需要托管静态资源到cdn服务器?' +
                            chalk.grey('（默认仅支持ssh rsync方式上传到cdn）'),
                        default: false
                    },
                    {
                        name: 'host',
                        type: 'input',
                        message: '请输入cdn服务器host地址:',
                        default: 'https://static.example.com',
                        validate: function (input) {
                            return /^http/.test(input) ? true : '请输入一个服务器地址';
                        },
                        when: function (answers) {
                            return answers.useCdn;
                        }
                    },
                    {
                        name: 'pathname',
                        type: 'input',
                        message: '请输入项目在cdn服务器上的存储文件夹名:',
                        default: '/' + path.basename(projectName),
                        validate: function (input) {
                            return /\s|\//.test(input.replace(/^\//, ''))
                                ? '文件夹名不能包含 空格、/ 等其它字符'
                                : true;
                        },
                        when: function (answers) {
                            return answers.useCdn;
                        }
                    },
                    {
                        name: 'useLocals',
                        type: 'confirm',
                        message: '是否要支持多语言/国际化？',
                        default: false
                    },
                    {
                        name: 'locals',
                        type: 'input',
                        message: '请输入要支持的语言' + chalk.grey('（半角逗号相隔）') + '：',
                        default: 'zh_CN,en_US',
                        validate: function (input) {
                            return input ? true : '该字段不能为空';
                        },
                        when: function (answers) {
                            return answers.useLocals;
                        }
                    },
                    {
                        name: 'supportDecorator',
                        type: 'confirm',
                        message: '是否开启装饰器' + chalk.grey('@Decoators') + '特性?',
                        default: true
                    },
                    {
                        name: 'proxy',
                        type: 'input',
                        message: '项目接口代理服务器地址' + chalk.grey('（没有请留空）') + '：',
                        validate: function (input) {
                            return !input || /^http/.test(input) ? true : '请输入一个服务器地址';
                        }
                    },
                    {
                        name: 'isSpa',
                        type: 'confirm',
                        message: '该项目是否为SPA' + chalk.grey('（单页面应用）') + '?',
                        default: true
                    },
                    {
                        name: 'useRem',
                        type: 'confirm',
                        message: '是否使用页面等比例缩放模式（使用rem）？',
                        default: false
                    }
                );
            }

            if (answers.type === 'package') {
                questions.push(
                    {
                        name: 'entryFile',
                        type: 'input',
                        default: 'src/index.ts',
                        message: '请输入项目入口文件:',
                        validate: function (input) {
                            return !!input || '该字段不能为空';
                        }
                    },
                    {
                        name: 'exportName',
                        type: 'input',
                        default: function (answers) {
                            return answers.name.split('/').slice(-1)[0];
                        },
                        message: '请输入模块导出名称:',
                        validate: function (input) {
                            return /^[\w-]+$/.test(input) || '只能输入数字、字母和短横杠字符';
                        }
                    }
                );
            }

            return inquirer.prompt(questions).then(function (answers) {
                Object.assign(projectCustom, answers);

                if (projectCustom.type === 'application') {
                    createApp(projectName);
                } else {
                    createLibrary(projectName);
                }
            });
        });
}

function createApp(name) {
    var root = path.resolve(name);
    var appName = projectCustom.name;

    fs.ensureDirSync(name);

    console.log();
    console.log('即将在 ' + chalk.green(root) + ' 下创建新的开发项目');
    console.log();

    var packageJson = {
        name: appName,
        version: projectCustom.version,
        private: true,
        description: projectCustom.description,
        author: projectCustom.author,
        vendor: ['react', 'react-dom', 'react-router-dom'],
        noRewrite: !projectCustom.isSpa,
        proxy: projectCustom.proxy || null
    };

    if (projectCustom.useRem) {
        packageJson.useRem = true;
    }

    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));

    process.chdir(root);

    console.log('即将安装package依赖，这将花费几分钟时间...');
    console.log();

    run(root, appName, function () {
        console.log();
        spinner.succeed('项目 ' + chalk.green(appName) + ' 已创建成功，路径：' + chalk.green(root));
        console.log();
        console.log('在该项目，你可以运行以下几个命令：');
        console.log();
        console.log(chalk.cyan('  npm start'));
        console.log('    启动本地服务，进行开发.');
        console.log();
        console.log(chalk.cyan('  npm run build:dev'));
        console.log('    构建测试包，部署测试.');
        console.log();
        console.log(chalk.cyan('  npm run pack'));
        console.log('    构建线上包，部署线上.');
        console.log();
        console.log('运行下面的命令切换到项目目录开始工作:');
        console.log(chalk.green('  cd ' + path.relative(oldPath, root)));
    });
}

function createLibrary(name) {
    var root = path.resolve(name);
    var appName = projectCustom.name;

    fs.ensureDirSync(name);

    console.log();
    console.log('即将在 ' + chalk.green(root) + ' 下创建新的开发项目');
    console.log();

    var appPackage = {
        name: appName,
        version: projectCustom.version,
        description: projectCustom.description,
        author: projectCustom.author,
        main: 'dist/index.cjs.js',
        module: 'dist/index.esm.js',
        browser: 'dist/index.esm.js',
        types: 'dist/' + path.basename(projectCustom.entryFile, path.extname(projectCustom.entryFile)) + '.d.ts',
        entryFile: projectCustom.entryFile,
        exportName: projectCustom.exportName
    };

    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(appPackage, null, 2));

    process.chdir(root);

    console.log('即将安装package依赖，这将花费几分钟时间...');
    console.log();

    run(root, appName, function () {
        console.log();
        spinner.succeed('项目 ' + chalk.green(appName) + ' 已创建成功，路径：' + chalk.green(root));
        console.log();
        console.log('在该项目，你可以运行以下几个命令：');
        console.log();
        console.log(chalk.cyan('  npm run build:lint'));
        console.log('    进行lint检查');
        console.log();
        console.log(chalk.cyan('  npm run build:declaration'));
        console.log('    生成.d.ts文件');
        console.log();
        console.log(chalk.cyan('  npm run build:bundle'));
        console.log('    生成发布包');
        console.log();
        console.log(chalk.cyan('  npm run build'));
        console.log('    按顺序执行以上所有命令');
        console.log();
        console.log();
        console.log('运行下面的命令切换到项目目录开始工作:');
        console.log(chalk.green('  cd ' + path.relative(oldPath, root)));
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

    child.on('close', function (code) {
        callback(code, command, args);
    });

    process.on('exit', function () {
        child.kill();
    });
}

function getGitRepoUrl() {
    let result = execSync('git ls-remote --get-url').toString().trim();

    if (/^(git|http)/.test(result)) {
        return result;
    }
}

function run(appPath, appName, onSuccess) {
    var templatePath = path.join(ownPath, 'template', projectCustom.type);

    if (fs.existsSync(templatePath)) {
        fs.copySync(templatePath, appPath);
    } else {
        throw new Error(chalk.cyan(templatePath) + ' not exists!');
    }

    var templateDependenciesPath = path.join(appPath, 'dependencies.json');
    var pkgTempPath = path.join(appPath, 'packageTemp.js');
    var appPackage = require(path.join(appPath, 'package.json'));
    var pkgTemp = require(pkgTempPath);

    Object.assign(appPackage, pkgTemp);

    appPackage.engines['tiger-new'] = ownPkg.version;

    if (projectCustom.supportDecorator) {
        appPackage.babel.plugins.push(['@babel/plugin-proposal-decorators', { legacy: true }]);
    }

    if (projectCustom.useCdn) {
        appPackage.cdn = {
            host: projectCustom.host,
            path: '/' + projectCustom.pathname.replace(/^\//g, '')
        };
    }

    if (projectCustom.locals) {
        appPackage.locals = projectCustom.locals.split(/\s+|\s*,\s*/g);
    }

    if (fs.existsSync(path.join(appPath, '.git'))) {
        var repoUrl = getGitRepoUrl();

        if (repoUrl) {
            appPackage.repository = {
                type: 'git',
                url: repoUrl
            };
        }
    }

    // Copy over some of the devDependencies
    appPackage.dependencies = appPackage.dependencies || {};
    appPackage.devDependencies = appPackage.devDependencies || {};

    fs.writeFileSync(path.join(appPath, 'package.json'), JSON.stringify(appPackage, null, 2));

    var dotfiles = [
        'tern-project',
        'tern-webpack-config.js',
        'editorconfig',
        'babelrc',
        'eslintrc',
        'gitignore',
        'npmignore'
    ];

    dotfiles.forEach(function (file) {
        if (fs.existsSync(path.join(appPath, file))) {
            fs.move(path.join(appPath, file), path.join(appPath, '.' + file), { overwrite: true }, function (err) {
                if (err) {
                    if (err.code === 'EEXIST' && (file === 'gitignore' || file === 'npmignore')) {
                        var data = fs.readFileSync(path.join(appPath, file), 'utf8');

                        fs.appendFileSync(path.join(appPath, '.' + file), data);
                        fs.unlinkSync(path.join(appPath, file));
                    } else {
                        spinner.fail('create ' + file + ' error!');

                        throw err;
                    }
                }
            });
        }
    });

    if (fs.pathExistsSync(path.join(appPath, 'npm'))) {
        var exportName = projectCustom.exportName;

        ['index.cjs.js', 'index.esm.js', 'index.umd.js'].forEach(function (file) {
            var data = fs.readFileSync(path.join(appPath, 'npm', file), 'utf8');

            fs.outputFileSync(path.join(appPath, 'npm', file), data.replace(/\{name\}/g, exportName));
        });
    }

    if (fs.pathExistsSync(path.join(appPath, 'README.md'))) {
        var data = fs.readFileSync(path.join(appPath, 'README.md'), 'utf8');

        fs.outputFileSync(
            path.join(appPath, 'README.md'),
            data
                .replace(/\{name\}/g, projectCustom.name)
                .replace(/\{description\}/g, projectCustom.description || 'created by tiger-new')
        );
    }

    if (fs.existsSync(templateDependenciesPath)) {
        var templateDependencies = require(templateDependenciesPath).devDependencies;

        install(
            Object.keys(templateDependencies).map(function (key) {
                return !templateDependencies[key] || templateDependencies[key] === 'latest'
                    ? key
                    : key + '@' + templateDependencies[key];
            }),
            true,
            function (code, command, args) {
                if (code !== 0) {
                    console.error('`' + command + ' ' + args.join(' ') + '` 运行失败');

                    return;
                }

                var templateDependencies = require(templateDependenciesPath).dependencies;

                if (templateDependencies) {
                    install(
                        Object.keys(templateDependencies).map(function (key) {
                            return !templateDependencies[key] || templateDependencies[key] === 'latest'
                                ? key
                                : key + '@' + templateDependencies[key];
                        }),
                        false,
                        function (code, command, args) {
                            if (code !== 0) {
                                console.error('`' + command + ' ' + args.join(' ') + '` 运行失败');

                                return;
                            }

                            onSuccess();
                        }
                    );
                } else {
                    onSuccess();
                }
            }
        );

        fs.removeSync(templateDependenciesPath);
        fs.removeSync(pkgTempPath);
    }
}

// If project only contains files generated by GH, it’s safe.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebookincubator/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root) {
    var validFiles = ['.DS_Store', 'Thumbs.db', '.git', '.gitignore', '.idea', 'README.md', 'LICENSE'];

    return (
        !fs.existsSync(root) ||
        fs.readdirSync(root).every(function (file) {
            return validFiles.indexOf(file) >= 0;
        })
    );
}
