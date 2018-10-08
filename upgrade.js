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
                        default: true
                    });
                }

                inquirer.prompt(questions).then(answers => {
                    console.log();

                    copyScripts(root);
                    spinner.succeed('scripts构建目录已更新！');

                    console.log();

                    if (answers.rmGulpfile) {
                        fs.removeSync(gulpfile);
                        spinner.succeed('gulpfile.js 已删除！');
                    }

                    if (!package.husky) {
                        delete package.scripts.precommit;

                        package.husky = {
                            hooks: {}
                        };
                    }

                    if (answers.addPrettier) {
                        package.husky.hooks['pre-commit'] = 'lint-staged';
                        package.prettier = {
                            printWidth: 120,
                            tabWidth: 4,
                            parser: 'babylon',
                            trailingComma: 'none',
                            jsxBracketSameLine: true,
                            semi: true,
                            singleQuote: true,
                            overrides: [
                                {
                                    files: '*.json',
                                    options: {
                                        tabWidth: 2
                                    }
                                }
                            ]
                        };
                    }

                    if (answers.addCommitlint) {
                        package.husky.hooks['commit-msg'] = 'node_modules/.bin/commitlint --edit $HUSKY_GIT_PARAMS';
                    }

                    if (answers.supportDecorator) {
                        if (!package.babel.plugins) {
                            package.babel.plugins = [];
                        }
                        package.babel.plugins.push('transform-decorators-legacy');
                    }

                    package.commitlint = {
                        extends: ['@commitlint/config-conventional'],
                        rules: {
                            'subject-case': [0],
                            'scope-case': [0]
                        }
                    };

                    package['lint-staged'] = {
                        '{app,static}/**/*.{js,jsx,mjs}': [
                            'node_modules/.bin/eslint --fix',
                            'node_modules/.bin/prettier --write',
                            'git add'
                        ],
                        '{app,static}/**/*.{css,scss,less,json,ts}': ['node_modules/.bin/prettier --write', 'git add']
                    };

                    package['stylelint'] = {
                        extends: 'stylelint-config-recommended'
                    };

                    if (package.cdn) {
                        package.scripts.cdn = 'node scripts/cdn.js';
                        package.scripts.pack = 'npm run build && npm run cdn';
                    }

                    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(package, null, 2));

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
