const inquirer = require('inquirer');
const semver = require('semver');
const chalk = require('chalk');
const paths = require('./config/paths');
const pkg = require(paths.appPackageJson);
const spawn = require('cross-spawn');
const { execSync } = require('child_process');
const ora = require('ora');

const spinner = ora();

// 是否已经处于发布tag分支
let alreadyInTag = false;

try {
    const curName = execSync('git rev-parse --abbrev-ref HEAD').toString();

    alreadyInTag = curName.startsWith('online/');
} catch (error) {}

const lastCommitMsg = execSync(`git log -1 --pretty='%s'`)
    .toString()
    .trim();

inquirer
    .prompt([
        {
            name: 'confirm',
            type: 'confirm',
            message: `我已经${chalk.red('切换到了要发布的分支，并且已经同步了最新的提交！')}！`,
            default: alreadyInTag
        }
    ])
    .then(answers => {
        if (answers.confirm) {
            inquirer
                .prompt([
                    {
                        name: 'title',
                        type: 'input',
                        message: '请输入本次发布更新了什么内容：',
                        default: lastCommitMsg,
                        validate: function(input) {
                            return input ? true : '发布内容不能为空';
                        }
                    },
                    {
                        name: 'type',
                        type: 'list',
                        choices: [
                            { name: '修订版本发布（影响第三位版本号）', value: 'patch' },
                            { name: '次版本发布（影响第二位版本号）', value: 'minor' },
                            { name: '主版本发布（影响第一位版本号）', value: 'major' }
                        ],
                        when: !alreadyInTag,
                        message: '请选择本次发布的类型:',
                        default: 'patch'
                    },
                    {
                        name: 'version',
                        type: 'input',
                        message: '请确认要发布的版本号:',
                        default(answers) {
                            return answers.type ? semver.inc(pkg.version, answers.type) : pkg.version;
                        },
                        validate: function(input) {
                            return semver.valid(input) ? true : chalk.cyan(input) + ' 不是一个有效的版本号';
                        }
                    },
                    {
                        name: 'rebuild',
                        type: 'confirm',
                        message: `是否进行代码构建操作？${chalk.grey('(执行 npm run pack 命令)')}`,
                        default: !alreadyInTag
                    }
                ])
                .then(answers => {
                    console.log();

                    const tagName = `v${answers.version}`;
                    const branchName = `online/${tagName}`;

                    try {
                        spinner.start(chalk.cyan('创建分支...'));

                        spawn.sync('git', ['fetch', '--all']);
                        spawn.sync('git', ['pull']);
                        spawn.sync('git', ['branch', '-D', branchName]);
                        spawn.sync('git', ['branch', branchName]);
                        spawn.sync('git', ['checkout', branchName]);

                        // 删除tag
                        spawn.sync('git', ['tag', '-d', tagName]);
                        spawn.sync('git', ['push', 'origin', ':' + tagName]);

                        spinner.succeed(chalk.green(`Branch: ${branchName} 分支创建成功\n`));

                        if (answers.rebuild) {
                            spinner.start(chalk.cyan('开始代码构建...\n'));

                            spawn.sync('npm', ['run', 'pack'], {
                                stdio: 'inherit'
                            });

                            spinner.succeed(chalk.green(`代码构建成功`));
                            console.log();
                        }

                        spinner.start(chalk.cyan('正在提交代码...'));

                        spawn.sync('npm', ['version', answers.version, '--allow-same-version', '--no-git-tag-version']);

                        spawn.sync('git', ['add', '.']);

                        let result = spawn.sync('git', [
                            'commit',
                            '-m',
                            `build(${answers.version}): Release v${answers.version}`
                        ]);

                        let data = result.stderr.toString();

                        if (data.includes('hook failed')) {
                            spinner.fail(chalk.red(`代码提交失败，请修改后重试！\n`));
                            console.error(data);

                            process.exit(1);
                        }

                        spinner.succeed(chalk.green(`Branch: ${branchName} 已经提交更新\n`));

                        spinner.start(chalk.cyan('正在推送Tag...'));

                        spawn.sync('git', ['tag', '-f', '-a', tagName, '-m', answers.title]);

                        spawn.sync('git', ['push', 'origin', tagName]);

                        spinner.succeed(chalk.green(`Tag: ${tagName} 推送到远程origin，现在可以进行发布操作\n`));

                        spinner.start(chalk.cyan('正在推送分支...'));
                        spawn.sync('git', ['push', 'origin', branchName, '--force']);

                        spinner.succeed(
                            chalk.green(`Branch: ${branchName} 推送到远程origin，现在可以提交merge request请求\n`)
                        );
                    } catch (error) {
                        console.error(error);
                        process.exit(1);
                    }
                });
        } else {
            console.log();
            spinner.warn(chalk.yellow(`请将本地分支切换到要发布的分支，并确保代码是最新的`));
        }
    });
