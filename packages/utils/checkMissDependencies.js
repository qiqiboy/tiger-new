const checkDependencies = require('check-dependencies');
const inquirer = require('inquirer');
const spawn = require('cross-spawn');
const chalk = require('chalk');

async function checkMissDeps(appPath, npmCommander, spinner) {
    const result = await checkDependencies({
        packageDir: appPath
    });

    if (result.status !== 0) {
        spinner.stop();

        // 输出错误信息
        result.error.forEach(function(err) {
            console.log(err);
        });

        console.log();

        const { reInstall } =
            process.env.CI !== 'true'
                ? await inquirer.prompt([
                      {
                          name: 'reInstall',
                          type: 'confirm',
                          message: `你当前安装的依赖版本和要求的不一致，是否要重新安装所有依赖？\n${chalk.dim(
                              '重新运行 npm install 安装所有依赖项.'
                          )}`,
                          default: true
                      }
                  ])
                : { reInstall: true };

        console.log();

        if (reInstall) {
            await new Promise((resolve, reject) => {
                install(appPath, npmCommander, function(code, command, args) {
                    if (code !== 0) {
                        spinner.fail(`\`${command} ${args.join(' ')}\` 运行失败`);

                        reject();
                    } else {
                        resolve();
                    }
                });
            });

            spinner.succeed(chalk.green('项目依赖已更新'));
            console.log();
            spinner.start();
        } else {
            spinner.warn(chalk.yellow('你需要按照下面命令操作后才能继续：'));
            console.log();

            console.log(chalk.green(`   ${npmCommander} install`));
            console.log();

            return Promise.reject();
        }
    }
}

function install(cwd, command, callback) {
    let args = ['install'];

    var child = spawn(command, args, {
        stdio: 'inherit',
        cwd
    });

    child.on('close', function(code) {
        callback(code, command, args);
    });
}

module.exports = checkMissDeps;
