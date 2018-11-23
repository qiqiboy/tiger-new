import URL from 'utils/URL';
import * as zh_CN from './config/zh_CN';

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
const avaliable = ['zh_CN', 'en_US', 'zh_TW'];
const lang2code = {
    zh_CN: 'cn',
    zh_TW: 'tw',
    en_US: 'en'
};

export let language = (URL.current().query.lang || localStorage.getItem('lang')) as string;

if (avaliable.indexOf(language) > -1) {
    localStorage.setItem('lang', language);
} else {
    const { language: browserlang } = window.navigator;

    if (/en/i.test(browserlang)) {
        language = 'en_US';
    } else if (/tw|hk/i.test(browserlang)) {
        language = 'zh_TW';
    } else {
        language = 'zh_CN';
    }
}

// tslint:disable-next-line
const langConfig: typeof zh_CN = require(`./config/${language}`);

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
                if (process.env.NODE_ENV === 'development') {
                    console.error(`【i18n】: "${name}.${key}" is mising.`);
                }

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

// 我们以zh_CN为基础语言配置，对其它语言包的完整性进行检查和修复
if (language !== 'zh_CN') {
    ensureLang(zh_CN, langConfig, language);
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
 *          tw: '繁体文案',
 *          en: '英文文案'
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

Object.assign(i18n, langConfig);

export default i18n;
