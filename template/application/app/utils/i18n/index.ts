/**
 * @description
 * 用于国际化多语言支持
 *
 * 在需要多语言的文本处，将文本提取使用全局函数 __() 包装即可（为了避免下面注释中的示例被捕获到，所以下面示例使用 __1 代替）：
 * const text = __1('需要翻译的文案');
 *
 * <div className="title">{__1('需要翻译的文案')}</div>
 *
 * 然后需要运行 npm run i18n-scan 命令，扫描所有源文件中需要翻译的文案，并整理输出为excel文件。
 *
 * 你可以将输出的excel进行翻译，翻译好后返回原来位置，再次运行 npm run i18n-read 即可将翻译好的文件同步回语言包。
 *
 * ********************************************************************************************************
 *
 * 对于有动态变量的字符串，可以使用i18n.printf方法来辅助替换:
 * import { printf } from 'utils/i18n';
 *
 * <div>{printf(__1('我今年%s岁'), age)}</div>
 *
 * ********************************************************************************************************
 * SSR开启时，在Server端，需要注意应当使用withI18n高阶组件来调用i18n对象，不可以直接引用utils/i18n 中的__()方法
 *
 * 更详细用法，参考项目README.md
 */
import { createContext } from 'react';
import cookick from 'cookick';
import URL from 'utils/URL';
import pkg from 'package.json';

// 可用的语言
// @ts-ignore
const allowedLangs = pkg.locals || ['zh_CN', 'en_US'];
const LOCAL_LANG_FLAG = 'lang';
const isBrowser = typeof window !== 'undefined';

/**
 * globalTranslation为以语言标识符作为key，对应的语言包json为内容的对象
 */
const globalTranslation = allowedLangs.reduce((translation, lang) => {
    try {
        // @ts-ignore
        if (pkg.locals) {
            // eslint-disable-next-line
            translation[lang] = require(`locals/${lang}.json`);
        }
    } catch (err) {}

    return translation;
}, {});


const langPatterns = {
    zh_CN: /cn/i,
    en_US: /en/i,
    zh_TW: /tw|hk/i
};

// 从浏览器语言字符串中解析对应的默认语言
function getBrowserLang(browserlang: string, langs: string[] = allowedLangs): string {
    return langs.find(lang => langPatterns[lang]?.test(browserlang)) || langs[0];
}

/**
 * @description
 * 格式化字符串输出
 */
export function printf(text: string, ...args: Array<string | number>): string {
    let i = 0;

    return text.replace(/%s/g, () => {
        const holder = args[i++];

        return holder === undefined ? '' : (holder as string);
    });
}

/**
 * 使用cookie存储lang标识，主要用于开启SSR时
 */
const getLangByCookie = key => cookick.getCookie(key);
const setLangByCookie = (key, lang) => cookick.setCookie(key, lang);

/**
 * 使用localStorage存储lang标识，主要用于未开启SSR时
 */
const getLangByStorage = key => localStorage.getItem(key);
const setlangByStorage = (key, lang) => localStorage.setItem(key, lang);

/**
 * 创建默认的i18n对象
 * 注意，在server端，所有用户共享默认的同一种语言。server端应当通过withI18n高阶组件调用i18n对象，
 * 并且所有的语言文案都应当在组件生命周期内创建，即不可直接声明组件外的变量作为多语言文案
 */
let defaultI18n = isBrowser
    ? createI18n(window.location.href, window.navigator.language)
    : createI18n('/', allowedLangs[0], () => '');

export default defaultI18n;
export const __ = defaultI18n.__;
export const language = defaultI18n.language;
export const context = createContext(defaultI18n);

type I18nParser = typeof __;
declare global {
    const __: I18nParser;
}

/**
 * 如果开启了SSR，那么就不应该调用全局__()
 * 这里故意不创建全局的__函数，那么在node端将会报错，以提醒开发者通过withI18n高阶组件形式调用
 * else {
 *      global.__ = __;
 * }
 */

export function createI18n(
    url: string,
    browserLanguage: string,
    getLocalLang: (langKey: string) => string | undefined | null = __SSR__ ? getLangByCookie : getLangByStorage,
    setLocalLang: (langkey: string, lang: string) => void = __SSR__ ? setLangByCookie : setlangByStorage
) {
    const queryObj = URL.parse(url, true).query;
    // 从地址中解析 ?lang=xxx 或者从本地存储中获取存在标识符
    const queryLang = Array.isArray(queryObj.lang) ? queryObj.lang[0] : queryObj.lang;
    const localLang = getLocalLang?.(LOCAL_LANG_FLAG);
    const browserLang = getBrowserLang(browserLanguage);

    const language =
        [queryLang, localLang, browserLang].find(lang => allowedLangs.includes(lang || '')) || allowedLangs[0];

    // 如果本地的语言标识符与当前不一致，则更新本地存储
    if (localLang !== language) {
        setLocalLang?.(LOCAL_LANG_FLAG, language);
    }

    const translation = globalTranslation[language] || {};

    /**
     * @description
     * 语言包匹配
     */
    function __(text: string): string {
        return translation[text] || text;
    }

    const i18n = {
        __,
        printf,
        language
    };

    return i18n;
}
