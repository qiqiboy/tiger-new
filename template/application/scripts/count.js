/* eslint @typescript-eslint/no-var-requires: 0 */
const { execSync } = require('child_process');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const clearConsole = require('react-dev-utils/clearConsole');
const paths = require('./config/paths');
const pkg = require(paths.appPackageJson);
const onlyJS = process.argv[2] === '--js';

const spinner = ora();

try {
    execSync('cloc --version', {
        stdio: 'ignore'
    });
} catch (error) {
    console.log();
    spinner.fail(chalk.red(`请先安装 cloc 命令：`));
    console.log();
    console.log(chalk.cyan('   npm install cloc -g'));

    process.exit(0);
}

const extraCommand = onlyJS ? ' --include-lang=JavaScript,TypeScript' : '';

const output = JSON.parse(
    execSync(
        `cloc app static --exclude-lang=SVG --force-lang=JavaScript,jsx --exclude-dir=node_modules --json${extraCommand}`
    )
        .toString()
        .trim()
);

const fileColors = {
    JavaScript: 'bgGreen',
    TypeScript: 'bgCyan',
    Sass: 'bgMagenta',
    HTML: 'bgRed',
    LESS: 'bgMagenta',
    CSS: 'bgMagenta',
    JSON: 'bgYellow',
    Markdown: 'bgBlue',
    Python: 'inverse'
};

const tableHeader = ['语言', '文件数', '空白行数', '注释行数', '代码行数', '总行数', '行数占比', '类型占比'].map(
    name => ({
        content: name,
        color: 'cyan'
    })
);
const tableData = Object.keys(output)
    .filter(key => key !== 'header')
    .map(key => {
        const detail = output[key];
        const lineCount = detail.blank + detail.comment + detail.code;
        const totalCount = output.header.n_lines;
        const totalFiles = output.header.n_files;
        const result = [
            { content: key === 'SUM' ? '总计' : key, color: fileColors[key] || 'white', bold: true }
        ].concat(
            [
                detail.nFiles,
                detail.blank,
                detail.comment,
                detail.code,
                lineCount,
                `${((lineCount / totalCount) * 100).toFixed(2)}%`,
                `${((detail.nFiles / totalFiles) * 100).toFixed(2)}%`
            ].map(content => ({ content: String(content), color: 'white' }))
        );

        return result;
    });

function charsLength(str) {
    let len = 0;

    for (let i = 0, j = str.length; i < j; i++) {
        len += str[i].charCodeAt(0) > 255 ? 2 : 1;
    }

    return len;
}

function createLine(data, colsWidth) {
    return data
        .map((item, index) => {
            const { content, color, bold } = item;
            const cellWidth = colsWidth[index];
            const isAlignRight = index > 0;

            const cellPad = new Array(cellWidth - charsLength(content)).fill(' ').join('');
            let colorStr = chalk[color](content);

            if (bold) {
                colorStr = chalk.bold(colorStr);
            }

            return isAlignRight ? cellPad + colorStr : colorStr + cellPad;
        })
        .join('');
}

/**
 * 创建表格输出
 * @param {Array<{ color: string; content: string }>} headerData
 * @param {Array<Array<{ color: string; content: string }>>} bodyData
 */
function createTable(headerData, bodyData, footer = false) {
    const colsWidth = headerData
        .map((data, index) =>
            Math.max.apply(
                null,
                [charsLength(data.content)].concat(bodyData.map(data => charsLength(data[index].content)))
            )
        )
        .map(n => Math.max(n, 10) + 3);
    const border = chalk.grey(new Array(colsWidth.reduce((total, n) => total + n, 0)).fill('-').join(''));

    // output header
    console.log(border);
    console.log(createLine(headerData, colsWidth));
    console.log(border);

    bodyData.forEach((data, index) => {
        if (footer && index === bodyData.length - 1) {
            console.log(border);
        }

        console.log(createLine(data, colsWidth));
    });

    console.log(border);
}

clearConsole();
console.log(chalk.cyan(`${pkg.name} v${pkg.version} 的代码分析汇总: \n`));
spinner.succeed(chalk.green('代码概览：\n'));
createTable(tableHeader, tableData, true);

Object.keys(output)
    .filter(key => key !== 'header' && key !== 'SUM')
    .forEach(lang => {
        const outputStr = execSync(
            `cloc app static --by-file --exclude-lang=SVG --include-lang=${lang} --force-lang=JavaScript,jsx --exclude-dir=node_modules --json`
        )
            .toString()
            .trim();

        if (outputStr) {
            const filesJson = JSON.parse(outputStr);

            const maxLinesFiles = Object.keys(filesJson)
                .filter(key => key !== 'header' && key !== 'SUM')
                .slice(0, 5) // 取前五个文件
                .map(file =>
                    Object.assign(filesJson[file], {
                        file,
                        count: filesJson[file].code + filesJson[file].comment + filesJson[file].blank,
                        size: fs.statSync(file).size
                    })
                );

            console.log();
            spinner.succeed(`${chalk[fileColors[lang] || 'green'](lang)} ${chalk.green('文件概览:')}\n`);

            createTable(
                ['文件', '代码行数', '总行数', '大小'].map(name => ({
                    content: name,
                    color: 'cyan'
                })),
                maxLinesFiles.map(item => [
                    { content: item.file, color: 'grey', bold: true },
                    {
                        content: String(item.code),
                        color: 'white'
                    },
                    {
                        content: String(item.count),
                        color: 'white'
                    },
                    {
                        content: `${(item.size / 100).toFixed(2)} KB`,
                        color: 'white'
                    }
                ])
            );
        }
    });
