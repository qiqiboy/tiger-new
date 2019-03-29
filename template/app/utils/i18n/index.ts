/**
 * 用于多语言翻译。该模块提供了两种用法：
 *
 * **** 手动维护翻译包 ****
 * 将需要翻译的文本手动整理到config目录下对应的语言目录下，然后可以通过引用该模块：
 * i18n.xxx.xxx
 * 获得相应的翻译后文本
 *
 * **** 自动提取翻译 ****
 * 在需要多语言的文本处，将文本提取使用全局函数 __() 包装即可（为了避免下面注释中的示例被捕获到，所以下面示例使用__1()代替）：
 * const text = __1('需要翻译的文案');
 *
 * <div className="title">{__1('需要翻译的文案')}</div>
 *
 * 然后需要运行 npm run i18n-scan 命令，扫描所有源文件中需要翻译的文案，并整理输出为excel文件。
 *
 * 你可以将输出的excel进行翻译，翻译好后返回原来位置，再次运行 npm run i18n-read 即可将翻译好的文件同步回语言包。
 *
 *
 *
 * ********************************************************************************************************
 *
 * 另外由于语言包会动态引入，所以也提供了一个i18n.ready的promise对象，用来判断语言包是否加载完毕。
 *
 * i18n.ready.then(() => {
 *  $('xxx').html(__1('xxx'));
 * })
 *
 * 如果是react项目，可以直接使用我们提供的 Provider 组件。
 * <Provider>
 *  <App />
 * </Provider>
 */
import { Component } from 'react';
import * as zh_CN from './config/zh_CN';
import URL from 'utils/URL';
import pkg from 'package.json';
import warning from 'warning';

interface ILangConfig {
    [key: string]: {
        cn?: string;
        tw?: string;
        en?: string;
    };
}

type LangReturn<T> = { [P in keyof T]: string };

type DefaultLang = typeof zh_CN;

interface I18n extends DefaultLang {
    <T extends ILangConfig>(config: T): LangReturn<T>;
    language: string;
}

// 可用的语言
// @ts-ignore
const avaliable = pkg.locals || ['zh_CN', 'en_US'];
const lang2code = {
    zh_CN: 'cn',
    zh_TW: 'tw',
    en_US: 'en'
};

export let language = (URL.current().query.lang || localStorage.getItem('lang')) as string;

if (avaliable.includes(language)) {
    localStorage.setItem('lang', language);
} else {
    const { language: browserlang } = window.navigator;

    if (/en/i.test(browserlang)) {
        language = 'en_US';
    } else if (/tw|hk/i.test(browserlang)) {
        language = 'zh_TW';
    } else {
        language = avaliable[0];
    }
}

if (!avaliable.includes(language)) {
    language = avaliable[0];
}

function each(obj: object, callback: (item: any, key: any) => void) {
    if (Array.isArray(obj)) {
        obj.forEach(callback);
    } else {
        Object.keys(obj).forEach(key => callback(obj[key], key));
    }
}

function ensureLang(base, checkedLang, name) {
    each(base, (item, key) => {
        if (typeof item === 'string') {
            if (!(key in checkedLang)) {
                warning(process.env.NODE_ENV === 'production', `【i18n】: "${name}.${key}" is mising.`);

                checkedLang[key] = item;
            }
        } else {
            if (!checkedLang[key]) {
                checkedLang[key] = Array.isArray(item) ? [] : {};
            }
            ensureLang(item, checkedLang[key], `${name}.${key}`);
        }
    });
}

/**
 * @description
 * 处理语言包配置
 *
 * @param {Object} config 语言包配置
 *
 * @return {Object} 返回语言包中对应的当前语言文案对象
 *
 * @eg
 * const lang = i18n({
 *      title: {
 *          cn: '简体文案',
 *          zh_CN: '简体文案',
 *          tw: '繁体文案',
 *          zh_TW: '繁体文案',
 *          en: '英文文案',
 *          en_US: '英文文案',
 *      }
 * });
 *
 * lang.title // ‘英文文案'
 */
const i18n: I18n = (config => {
    const code = lang2code[language];

    return Object.keys(config).reduce(function(ret, key) {
        const langs = config[key];
        const text = [langs[code], langs[language], key].find(str => typeof str === 'string');

        ret[key] = text;

        return ret;
    }, {});
}) as I18n;

i18n.language = language;

// tslint:disable-next-line
const langConfig = require(`./config/${language}`);

// 我们以zh_CN为基础语言配置，对其它语言包的完整性进行检查和修复
if (language !== 'zh_CN') {
    ensureLang(zh_CN, langConfig, language);
}

// 默认先挂载中文语言包
Object.assign(i18n, langConfig);

export default i18n;

const loadLangs: any[] = [];

// @ts-ignore
if (pkg.locals) {
    loadLangs.push(import(`locals/${language}.json`));
}

export const ready = Promise.all(loadLangs);

let globalTranslation = {};

ready.then(translations => {
    if (translations[0]) {
        globalTranslation = translations[0];
    }
});

/**
 * @description
 * 语言包匹配
 */
window.__ = function(key) {
    return globalTranslation[key] || key;
};

export class Provider extends Component {
    constructor(props) {
        super(props);

        // 语言包加载成功后，强制刷新下组件
        ready.then(() => {
            this.forceUpdate();
        });
    }

    render() {
        return this.props.children;
    }
}
