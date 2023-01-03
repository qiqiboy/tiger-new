var inquirer = require('inquirer');
var fs = require('fs-extra');
var path = require('path');
var chalk = require('chalk');
var _ = require('lodash');
var ora = require('ora');
var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');
var semver = require('semver');
var ownPkg = require('./package.json');

var spinner = ora();

var ownPath = __dirname;

function appUpgrade(projectName, mode) {
    var root = path.resolve(projectName);

    if (mode === 'application' || (!mode && fs.pathExistsSync(path.join(root, 'scripts')))) {
        upgradeAppProject(root);
    } else {
        upgradePackageProject(root);
    }
}

function upgradePackageProject(root) {
    var package = require(path.resolve(root, 'package.json'));
    var tsconfig = path.resolve(root, 'tsconfig.json');
    var pkgTemp = require(path.resolve(ownPath, 'template/package/packageTemp.js'));
    var newDevDependencies = require(path.join(ownPath, 'template/package/dependencies.json')).devDependencies;
    var cleanDeps = [
        '@types/jest',
        '@babel/cli',
        '@babel/core',
        '@babel/runtime',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'babel-eslint',
        'eslint-config-react-app',
        'eslint-plugin-flowtype',
        'eslint-plugin-import',
        'eslint-plugin-jest',
        'eslint-plugin-jsx-a11y',
        'eslint-plugin-react',
        'eslint-plugin-react-hooks',
        'eslint-plugin-testing-library',
        'jest-resolve',
        'jest-environment-jsdom-fourteen',
        'rollup-plugin-babel',
        'rollup-plugin-sourcemaps'
    ];
    var cleanFiles = ['eslint.config.js'];

    inquirer
        .prompt(
            [
                {
                    name: 'upgrade',
                    type: 'confirm',
                    message:
                        '请确认是否要将 ' +
                        package.name +
                        ' 升级到最新？\n' +
                        chalk.dim('1. 向package.json的devDependencies字段下写入需要的依赖') +
                        '\n' +
                        chalk.dim('2. 覆盖原来的构建配置 rollup.config.js') +
                        '\n',
                    default: true
                },
                {
                    when: function (answers) {
                        return answers.upgrade && fs.existsSync(tsconfig);
                    },
                    name: 'updateTsconfig',
                    type: 'confirm',
                    message: '是否更新tsconfig.json？',
                    default: false
                },
                _.some(package.devDependencies, (v, k) => cleanDeps.includes(k)) && {
                    name: 'cleanDeps',
                    type: 'confirm',
                    message: '是否清理过期的devDependencies依赖项？',
                    default: true
                }
            ].filter(Boolean)
        )
        .then(function (answers) {
            if (answers.upgrade) {
                // clean unused files
                cleanFiles.forEach(file => {
                    fs.removeSync(path.resolve(root, file));
                });

                fs.copySync(
                    path.resolve(ownPath, 'template/package/rollup.config.js'),
                    path.resolve(root, 'rollup.config.js'),
                    {
                        overwrite: true
                    }
                );
                spinner.succeed(chalk.green('rollup.config.js 已写入！'));

                fs.copySync(path.resolve(ownPath, 'template/package/eslintrc.js'), path.resolve(root, 'eslintrc.js'), {
                    overwrite: true
                });
                spinner.succeed(chalk.green('eslintrc 已写入！'));

                if (!fs.existsSync(tsconfig) || answers.updateTsconfig) {
                    fs.copySync(path.resolve(ownPath, 'template/package/tsconfig.json'), tsconfig, {
                        overwrite: true
                    });
                    spinner.succeed(chalk.green('tsconfig.json已写入！'));
                }

                fs.copySync(path.resolve(ownPath, 'template/package/jest'), path.resolve(root, 'jest'), {
                    overwrite: true
                });
                spinner.succeed(chalk.green('jest配置 已更新！'));

                if (!fs.existsSync(path.resolve(root, 'jest'))) {
                    fs.copySync(path.resolve(ownPath, 'template/package/jest'), path.resolve(root, 'jest'), {
                        overwrite: true
                    });
                }

                if (answers.cleanDeps) {
                    cleanDeps.forEach(key => {
                        delete package.devDependencies[key];
                    });
                }

                ['build:bundle', 'build:declaration', 'clear', 'lint'].forEach(name => {
                    if (package.scripts[name]) {
                        delete package.scripts[name];
                    }
                });

                if (
                    !package.scripts.build ||
                    /build:bundle|build:declaration|npm run lint/.test(package.scripts.build)
                ) {
                    package.scripts.build = pkgTemp.scripts.build;
                }

                if (!package.scripts.test) {
                    package.scripts.test = pkgTemp.scripts.test;
                }

                if (!package.prettier) {
                    package.prettier = pkgTemp.prettier;
                } else {
                    if (!package.prettier.arrowParens) {
                        package.prettier.arrowParens = pkgTemp.prettier.arrowParens;
                    }

                    if (package.prettier.jsxBracketSameLine) {
                        delete package.prettier.jsxBracketSameLine;
                        package.prettier.bracketSameLine = pkgTemp.prettier.bracketSameLine;
                    }
                }

                if (!package.eslintConfig || !package.eslintConfig.extends) {
                    package.eslintConfig = pkgTemp.eslintConfig;
                }

                var eslintConfigIndex = package.eslintConfig.extends.indexOf('./eslint.config.js');
                var hasEslintUpdate = false;

                if (eslintConfigIndex > -1) {
                    package.eslintConfig.extends[eslintConfigIndex] = './eslintrc.js';

                    hasEslintUpdate = true;
                }

                if (package.eslintConfig.extends.indexOf('react-app/jest') < 0) {
                    var reactAppIndex = package.eslintConfig.extends.indexOf('react-app');

                    if (reactAppIndex > -1) {
                        package.eslintConfig.extends.splice(reactAppIndex + 1, 0, 'react-app/jest');
                    } else {
                        package.eslintConfig = pkgTemp.eslintConfig;
                    }

                    hasEslintUpdate = true;
                }

                if (package.eslintConfig.extends.indexOf('./eslintrc.js') < 0) {
                    package.eslintConfig.extends.push('./eslintrc.js');

                    hasEslintUpdate = true;
                }

                hasEslintUpdate && spinner.succeed(chalk.green('eslint配置 已更新！'));

                if (!package.husky) {
                    package.husky = pkgTemp.husky;
                } else {
                    if (!package.husky.hooks['commit-msg']) {
                        package.husky.hooks['commit-msg'] = pkgTemp.husky.hooks['commit-msg'];
                    }

                    if (!package.husky.hooks['pre-commit']) {
                        package.husky.hooks['pre-commit'] = pkgTemp.husky.hooks['pre-commit'];
                    }
                }

                if (!package.commitlint) {
                    package['commitlint'] = pkgTemp['commitlint'];
                }

                if (!package['lint-staged']) {
                    package['lint-staged'] = pkgTemp['lint-staged'];
                } else {
                    package['lint-staged'] = _.mapKeys(package['lint-staged'], (value, key) => {
                        if (value.indexOf('git add') > -1) {
                            value.splice(value.indexOf('git add'), 1);
                        }

                        if (!/\,tests/.test(key)) {
                            return key.replace(/^\{(.*)\}\//, '{$1,tests}/');
                        }

                        return key;
                    });
                }

                if (!package.scripts.test) {
                    package.scripts.test = pkgTemp.scripts.test;
                }

                if (!package.scripts.tsc) {
                    package.scripts.tsc = pkgTemp.scripts.tsc;
                }

                if (!package.stylelint) {
                    package['stylelint'] = pkgTemp['stylelint'];
                }

                if (!package.browserslist) {
                    package['browserslist'] = pkgTemp['browserslist'];
                }

                if (!package.config) {
                    package.config = {};
                }

                if (!package.config.commitizen) {
                    package.config.commitizen = pkgTemp.config.commitizen;
                }

                package.engines = Object.assign({}, package.engines, pkgTemp.engines, {
                    'tiger-new': ownPkg.version
                });

                fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(package, null, 2));

                process.chdir(root);

                install(
                    Object.keys(newDevDependencies).map(function (key) {
                        return !newDevDependencies[key] || newDevDependencies[key] === 'latest'
                            ? key
                            : key + '@' + newDevDependencies[key];
                    }),
                    true,
                    function () {
                        console.log();
                        spinner.succeed('恭喜！项目升级成功！全部依赖已成功重新安装！');
                    }
                );
            } else {
                spinner.fail('升级已取消！');
            }
        });
}

function upgradeAppProject(root) {
    var pkgTemp = require(path.resolve(ownPath, 'template/application/packageTemp.js'));

    var packageJson = path.resolve(root, 'package.json');
    var gulpfile = path.resolve(root, 'gulpfile.js');
    var jsconfig = path.resolve(root, 'jsconfig.json');
    var tsconfig = path.resolve(root, 'tsconfig.json');
    var setupTests = path.resolve(root, 'setupTests.ts');
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

    var newDependenciesConfig = require(path.join(ownPath, 'template/application/dependencies.json'));
    var newDevDependencies = newDependenciesConfig.devDependencies;
    var patchDeps = ['url', 'raf-dom', 'react', 'react-dom', 'prop-types'].map(
        dep => dep + '@' + newDependenciesConfig.dependencies[dep]
    );
    var cleanDeps = [
        'ora',
        'inquirer',
        'chalk',
        'raf-dom',
        'eslint-loader',
        'raw-loader',
        'url-loader',
        'imagemin-webpack-plugin',
        'jest-environment-jsdom-fourteen',
        'jest-environment-jsdom',
        'jest-resolve',
        '@types/jest',
        'optimize-css-assets-webpack-plugin',
        'postcss-safe-parser',
        'react-dev-utils',
        'sw-precache-webpack-plugin',
        '@babel/core',
        '@babel/runtime',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'babel-eslint',
        'eslint-config-react-app',
        'eslint-plugin-flowtype',
        'eslint-plugin-import',
        'eslint-plugin-jest',
        'eslint-plugin-jsx-a11y',
        'eslint-plugin-react',
        'eslint-plugin-react-hooks',
        'eslint-plugin-testing-library'
    ];
    var cleanFiles = ['config/tslintrc.json', 'config/checkMissDependencies.js'];

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

                if (fs.existsSync(tsconfig)) {
                    questions.push({
                        name: 'updateTsconfig',
                        type: 'confirm',
                        message: '是否更新tsconfig.json？',
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

                if (package.babel && !package.babel.plugins) {
                    questions.push({
                        name: 'supportDecorator',
                        type: 'confirm',
                        message: '是否开启装饰器' + chalk.grey('@Decoators') + '特性?',
                        default: false
                    });
                }

                if (!package.locals || !package.scripts['i18n-scan']) {
                    questions.push(
                        {
                            name: 'addLocals',
                            type: 'confirm',
                            message: '是否升级i18n支持?',
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
                                return answers.addLocals && !package.locals;
                            }
                        }
                    );
                }

                if (!fs.existsSync(path.resolve(root, 'tests/__mocks__/axios'))) {
                    questions.push({
                        name: 'addJestMocks',
                        type: 'confirm',
                        message: '是否增加jest mocks目录？',
                        default: false
                    });
                }

                if (!fs.existsSync(path.resolve(root, 'app/utils/withSSR'))) {
                    questions.push(
                        {
                            name: 'addSSR',
                            type: 'confirm',
                            message: '是否增加SSR相关功能文件？',
                            default: false
                        },
                        {
                            name: 'updateGlobalDTS',
                            type: 'confirm',
                            message: '是否更新 global.d.ts 文件？',
                            default: true,
                            when: function (answers) {
                                return answers.addSSR;
                            }
                        }
                    );
                }

                try {
                    if (package.dependencies && semver.lt(package.dependencies.react || '0.0.0', '17.0.0')) {
                        questions.push({
                            name: 'upgradeReact',
                            type: 'confirm',
                            message: '是否升级react@17.x ？',
                            default: true
                        });
                    }
                } catch (e) {}

                if (_.some(package.devDependencies, (v, k) => cleanDeps.includes(k))) {
                    questions.push({
                        name: 'cleanDeps',
                        type: 'confirm',
                        message: '是否清理过期的devDependencies依赖项？',
                        default: true
                    });
                }

                inquirer.prompt(questions).then(answers => {
                    console.log();

                    // clean unused files
                    cleanFiles.forEach(file => {
                        fs.removeSync(path.resolve(root, 'scripts', file));
                    });

                    copyScripts(root);
                    spinner.succeed(chalk.green('scripts构建目录已更新！'));

                    if (!fs.existsSync(path.resolve(root, 'app')) && fs.existsSync(path.resolve(root, 'src'))) {
                        fs.moveSync(path.resolve(root, 'src'), path.resolve(root, 'app'));
                        spinner.succeed(chalk.green('已将代码路径由 src/ 移动到 app/ !'));
                    }

                    if (!fs.existsSync(path.resolve(root, 'public'))) {
                        fs.copySync(
                            path.resolve(ownPath, 'template/application/public'),
                            path.resolve(root, 'public'),
                            {
                                overwrite: true
                            }
                        );
                        spinner.succeed(chalk.green('已创建 public 目录!'));
                    }

                    if (!fs.existsSync(tsconfig) || answers.updateTsconfig) {
                        fs.copySync(path.resolve(ownPath, 'template/application/tsconfig.json'), tsconfig, {
                            overwrite: true
                        });
                        spinner.succeed(chalk.green('tsconfig.json已写入！'));
                    }

                    if (fs.existsSync(tslint)) {
                        fs.removeSync(tslint);
                        spinner.succeed(chalk.red('tslint.json已移除！'));
                    }

                    if (fs.existsSync(tsconfigLocal)) {
                        fs.removeSync(tsconfigLocal);
                        spinner.succeed(chalk.red('tsconfig.local.json已移除！'));
                    }

                    if (!fs.existsSync(globalDeclare) || answers.updateGlobalDTS) {
                        fs.copySync(path.resolve(ownPath, 'template/application/global.d.ts'), globalDeclare, {
                            overwrite: true
                        });
                        spinner.succeed(chalk.green('global.d.ts已写入！'));
                    }

                    if (answers.rmGulpfile) {
                        fs.removeSync(gulpfile);
                        spinner.succeed(chalk.red('gulpfile.js 已删除！'));
                    }

                    if (!fs.existsSync(setupTests)) {
                        fs.copySync(path.resolve(ownPath, 'template/application/setupTests.ts'), setupTests, {
                            overwrite: true
                        });
                    }

                    if (answers.addJestMocks) {
                        fs.copySync(
                            path.resolve(ownPath, 'template/application/tests/__mocks__/axios'),
                            path.resolve(root, 'tests/__mocks__/axios'),
                            {
                                overwrite: true
                            }
                        );
                        spinner.succeed(chalk.green('tests/__mocks__ 目录已添加！'));
                    }

                    if (fs.existsSync(path.resolve(root, 'scripts/config/webpack.config.dev.js'))) {
                        fs.removeSync(path.resolve(root, 'scripts/config/webpack.config.dev.js'));
                        fs.removeSync(path.resolve(root, 'scripts/config/webpack.config.prod.js'));
                        spinner.succeed(chalk.green('过时的 webpack.config.*.js 文件已移除！'));
                    }

                    if (!package.husky) {
                        package.husky = {
                            hooks: {}
                        };

                        if (package.scripts.precommit) {
                            delete package.scripts.precommit;
                            package.husky.hooks['pre-commit'] = pkgTemp.husky.hooks['pre-commit'];
                        }

                        if (package.scripts.commitmsg) {
                            delete package.scripts.commitmsg;
                            package.husky.hooks['commit-msg'] = pkgTemp.husky.hooks['commit-msg'];
                        }
                    }

                    if (answers.addPrettier) {
                        package.husky.hooks['pre-commit'] = pkgTemp.husky.hooks['pre-commit'];
                        package.prettier = pkgTemp.prettier;
                    }

                    if (answers.addCommitlint) {
                        package.husky.hooks['commit-msg'] = pkgTemp.husky.hooks['commit-msg'];
                        package.commitlint = pkgTemp.commitlint;
                    }

                    if (!package.husky.hooks['pre-push']) {
                        package.husky.hooks['pre-push'] = pkgTemp.husky.hooks['pre-push'];
                    }

                    ['pre-commit', 'pre-push'].forEach(function (hook) {
                        if (!/NODE_ENV=/.test(package.husky.hooks[hook])) {
                            package.husky.hooks[hook] = pkgTemp.husky.hooks[hook];
                        }
                    });

                    if (package.babel) {
                        if (!package.babel.plugins) {
                            package.babel.plugins = [];
                        }

                        if (answers.supportDecorator) {
                            package.babel.plugins.push(['@babel/plugin-proposal-decorators', { legacy: true }]);
                        }

                        if (package.babel.plugins.indexOf('transform-decorators-legacy') > -1) {
                            package.babel.plugins.splice(
                                package.babel.plugins.indexOf('transform-decorators-legacy'),
                                1,
                                ['@babel/plugin-proposal-decorators', { legacy: true }]
                            );
                        }

                        if (package.babel.plugins.indexOf('react-hot-loader/babel') > -1) {
                            package.babel.plugins.splice(package.babel.plugins.indexOf('react-hot-loader/babel'), 1);
                        }
                    }

                    if (!package.stylelint) {
                        package['stylelint'] = pkgTemp['stylelint'];
                    }

                    if (!package.browserslist) {
                        package['browserslist'] = pkgTemp['browserslist'];
                    }

                    if (!package.eslintConfig || !package.eslintConfig.extends) {
                        package.eslintConfig = pkgTemp.eslintConfig;
                    }

                    if (package.eslintConfig.extends.indexOf('react-app/jest') < 0) {
                        var reactAppIndex = package.eslintConfig.extends.indexOf('react-app');

                        if (reactAppIndex > -1) {
                            package.eslintConfig.extends.splice(reactAppIndex + 1, 0, 'react-app/jest');
                        }
                    }

                    if (answers.addLocals) {
                        if (answers.locals) {
                            package.locals = answers.locals.split(/\s+|\s*,\s*/g);
                        }

                        if (!package.scripts['i18n-scan']) {
                            package.scripts['i18n-scan'] = pkgTemp.scripts['i18n-scan'];
                            package.scripts['i18n-read'] = pkgTemp.scripts['i18n-read'];

                            spinner.succeed(chalk.red('已增加 i18n-scan 任务！'));
                            spinner.succeed(chalk.red('已增加 i18n-read 任务！'));
                        }

                        fs.copy(
                            path.resolve(ownPath, 'template/application/app/utils/i18n/index.ts'),
                            path.resolve(root, 'app/utils/i18n/index.ts'),
                            {
                                overwrite: true
                            }
                        );

                        spinner.succeed(chalk.red('已更新 utils/i18n 模块依赖！'));

                        fs.copySync(path.resolve(ownPath, 'template/application/global.d.ts'), globalDeclare, {
                            overwrite: true
                        });

                        spinner.succeed(chalk.red('已成功升级i18n支持！'));
                    }

                    if (answers.addSSR) {
                        fs.copySync(
                            path.resolve(ownPath, 'template/application/app/utils/withSSR'),
                            path.resolve(root, 'app/utils/withSSR'),
                            {
                                overwrite: true
                            }
                        );
                        spinner.succeed(chalk.green('utils/withSSR 目录已添加！'));

                        fs.copySync(
                            path.resolve(ownPath, 'template/application/app/utils/URL'),
                            path.resolve(root, 'app/utils/URL'),
                            {
                                overwrite: true
                            }
                        );
                    }

                    if (answers.cleanDeps) {
                        cleanDeps.forEach(key => {
                            delete package.devDependencies[key];
                        });
                    }

                    package.dependencies && delete package.dependencies['react-refresh'];

                    if (!package.config) {
                        package.config = {};
                    }

                    if (!package.config.commitizen) {
                        package.config.commitizen = pkgTemp.config.commitizen;
                    }

                    console.log();

                    if (!package.prettier.arrowParens) {
                        package.prettier.arrowParens = pkgTemp.prettier.arrowParens;
                    }

                    if (package.prettier.jsxBracketSameLine) {
                        delete package.prettier.jsxBracketSameLine;
                        package.prettier.bracketSameLine = pkgTemp.prettier.bracketSameLine;
                    }

                    if (!package['lint-staged']) {
                        package['lint-staged'] = pkgTemp['lint-staged'];
                    } else {
                        if ('{app,static}/**/*.{ts,tsx}' in package['lint-staged']) {
                            delete package['lint-staged']['{app,static}/**/*.{ts,tsx}'];
                            delete package['lint-staged']['{app,static}/**/*.{js,jsx,mjs}'];

                            Object.assign(package['lint-staged'], pkgTemp['lint-staged']);
                        }

                        package['lint-staged'] = _.mapKeys(package['lint-staged'], (value, key) => {
                            if (value.indexOf('git add') > -1) {
                                value.splice(value.indexOf('git add'), 1);
                            }

                            if (!/\,tests/.test(key)) {
                                return key.replace(/^\{(.*)\}\//, '{$1,tests}/');
                            }

                            return key;
                        });
                    }

                    _.each(pkgTemp.scripts, (value, key) => {
                        if (!package.scripts[key]) {
                            package.scripts[key] = value;
                        }
                    });

                    if (!package.scripts.tsc || /^node -pe/.test(package.scripts.tsc)) {
                        package.scripts.tsc = pkgTemp.scripts.tsc;
                        package.husky.hooks['pre-commit'] = pkgTemp.husky.hooks['pre-commit'];

                        try {
                            var gitignorePath = path.join(root, '.gitignore');
                            var gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

                            if (gitignoreContent.split(/\n+/g).indexOf('.git-tsconfig.json') < 0) {
                                fs.outputFileSync(
                                    gitignorePath,
                                    gitignoreContent.replace(/[\s\n]+$/, '') +
                                        '\n\n# git pre-commit tsc lint\n' +
                                        '.git-tsconfig.json'
                                );
                            }
                        } catch (err) {}
                    }

                    if (package.cdn) {
                        package.scripts.cdn = 'node scripts/cdn.js';
                        package.scripts.pack = 'npm run build && npm run cdn';
                    }

                    package.engines = Object.assign({}, package.engines, pkgTemp.engines, {
                        'tiger-new': ownPkg.version
                    });

                    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(package, null, 2));

                    process.chdir(root);

                    Promise.all([
                        install(
                            Object.keys(newDevDependencies).map(function (key) {
                                return key + '@' + newDevDependencies[key];
                            }),
                            true,
                            function () {
                                console.log();
                                spinner.succeed('项目开发依赖已更新！');
                                console.log();
                            }
                        ),
                        install(patchDeps, false)
                    ])
                        .then(function () {
                            if (answers.upgradeReact) {
                                return install(
                                    ['react@latest', 'react-dom@latest', 'react-formutil@latest'],
                                    false,
                                    function () {
                                        console.log();
                                        spinner.succeed('升级react成功！');
                                        console.log();
                                    }
                                );
                            }
                        })
                        .then(function () {
                            spinner.succeed('恭喜！项目升级成功！全部依赖已成功重新安装！');
                        })
                        .catch(() => {
                            spinner.fail(chalk.red('错误：依赖安装失败，请重试！'));
                        });
                });
            } else {
                spinner.fail('升级已取消！');
            }
        });
}

function copyScripts(root) {
    fs.copySync(path.resolve(ownPath, 'template/application/scripts'), path.resolve(root, 'scripts'), {
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
    return new Promise(function (resolve, reject) {
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
            callback && callback();
            resolve();
        });

        process.on('exit', function () {
            reject();
            child.kill();
        });
    });
}

module.exports = appUpgrade;
