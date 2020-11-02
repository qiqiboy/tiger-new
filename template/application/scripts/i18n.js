/* eslint @typescript-eslint/no-var-requires: 0 */
const fs = require('fs-extra');
const glob = require('glob');
const Parser = require('i18next-scanner').Parser;
const xlsx = require('node-xlsx');
const chalk = require('chalk');
const ora = require('ora');
const lodash = require('lodash');
const paths = require('./config/paths');
const path = require('path');
const pkg = require(paths.appPackageJson);

const spinner = ora();

const terminalArg = process.argv[2];

if (terminalArg === '--scan') {
    ensureLocalsConfig();
    scanner();
} else if (terminalArg === '--read') {
    ensureLocalsConfig();
    reader();
}

function ensureLocalsConfig() {
    if (Array.isArray(pkg.locals) === false) {
        spinner.fail(chalk.red('未在 package.json 中找到相关语言包配置！'));

        spinner.warn(
            chalk.yellow('需要 package.json 中添加 { "locals": ["zh_CN", "en_US"] } 配置后，才能运行该命令！')
        );

        process.exit(0);
    }
}

function requireJson(file) {
    try {
        return require(file);
    } catch (err) {
        return {};
    }
}

/**
 * @description
 * 扫描源代码文件，匹配需要翻译的文案，并输出excel文件待翻译
 */
function scanner() {
    const i18nParser = new Parser({
        lngs: pkg.locals,
        nsSeparator: false,
        keySeparator: false,
        pluralSeparator: false,
        contextSeparator: false
    });

    fs.ensureDirSync(path.join(paths.locals, 'xlsx'));
    fs.emptyDirSync(path.join(paths.locals, 'xlsx'));

    glob.sync(`${paths.appSrc}/**/*.{js,jsx,ts,tsx}`).forEach(file => {
        const content = fs.readFileSync(file);

        i18nParser.parseFuncFromString(
            content,
            { list: ['__', 'i18n.__', 'window.__', 'props.i18n.__', 'this.props.i18n.__'] },
            key => {
                if (key) {
                    i18nParser.set(key, key);
                }
            }
        );
    });

    const i18nJson = i18nParser.get();
    const destination = path.join(paths.locals, 'xlsx', `${pkg.name}.i18n.xlsx`);
    const langConfig = [];

    lodash.each(i18nJson, ({ translation }, key) => {
        const langFile = path.join(paths.locals, `${key}.json`);

        const currentLangs = fs.existsSync(langFile) ? JSON.parse(fs.readFileSync(langFile)) : {};
        const newLangs = lodash.pickBy(currentLangs, (value, key) => key in translation);

        lodash.each(translation, (value, key) => {
            if (!(key in newLangs)) {
                newLangs[key] = value;
            }
        });

        fs.outputFile(path.join(paths.locals, `${key}.json`), JSON.stringify(newLangs, '\n', 2));

        langConfig.push({
            lang: key,
            config: newLangs
        });
    });

    convertJson2Excel(langConfig, destination);

    console.log();
    spinner.warn(chalk.yellow('你可以将生成的excel文件进行翻译后，放回原处。然后运行：'));
    console.log(chalk.green('   npm run i18n-read'));
}

/**
 * @description
 * 读取excel文件，并转换为json语言包
 */
function reader() {
    glob.sync(path.join(paths.locals, 'xlsx', '!(~$)*.xlsx')).forEach(convertExcel2Json);

    console.log();
    spinner.succeed(chalk.green('语言包转换成功！'));
}

function convertJson2Excel(langConfig, destination) {
    const sheets = [
        [`${pkg.name} v${pkg.version}`].concat(langConfig.map(({ lang }) => lang)),
        ['原始文案（禁止修改）'],
        []
    ];

    lodash.each(langConfig[0].config, (text, key) => {
        sheets.push([key].concat(langConfig.map(({ config }) => config[key])));
    });

    const buffer = xlsx.build([{ name: 'i18n_locals', data: sheets }], {
        '!cols': [{ wch: 50 }].concat(
            langConfig.map(() => ({
                wch: 80
            }))
        )
    });

    fs.writeFileSync(destination, buffer);

    spinner.succeed(`语言包已输出到 ${chalk.cyan(destination)}`);
}

function convertExcel2Json(file) {
    const [{ data: sheets }] = xlsx.parse(fs.readFileSync(file));
    const langs = sheets[0].slice(1);

    langs.forEach((lang, index) => {
        const destination = path.join(paths.locals, `${lang}.json`);
        const jsonData = requireJson(destination);

        sheets.slice(2).forEach(item => {
            if (item.length) {
                jsonData[item[0]] = item[index + 1];
            }
        });

        fs.outputFileSync(destination, JSON.stringify(jsonData, '\n', 2));

        spinner.succeed(`输出 ${chalk.bold(chalk.green(lang))} 到 ${chalk.cyan(destination)}`);
    });
}

exports.ensureLocals = function() {
    fs.ensureDirSync(path.join(paths.locals));

    if (Array.isArray(pkg.locals)) {
        pkg.locals.forEach(lang => {
            const file = path.join(paths.locals, `${lang}.json`);

            if (!fs.existsSync(file)) {
                fs.outputJSONSync(file, {});
            }
        });
    }
};
