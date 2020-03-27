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
 *
 * 更详细用法，参考项目README.md
 */

import URL from 'utils/URL';
import pkg from 'package.json';

// 可用的语言
// @ts-ignore
const allowedLangs = pkg.locals || ['zh_CN', 'en_US'];
const LOCAL_LANG_FLAG = 'lang';
// url中的参数对象
const queryObj = URL.current().query;
const localLang = localStorage.getItem(LOCAL_LANG_FLAG);

// 从浏览器地址中解析 ?lang=xxx 或者从本地lcoalStorage中获取存在标识符
const mayLang =
    (Array.isArray(queryObj.lang) ? queryObj.lang[0] : queryObj.lang) || localStorage.getItem(LOCAL_LANG_FLAG);

// 确保得到的语言标识符是允许的、合法的，否则则尝试根据浏览器语言设置默认语言
export let language: string =
    process.env.NODE_ENV === 'test'
        ? 'zh_CN'
        : allowedLangs.includes(mayLang as string)
        ? (mayLang as string)
        : getBrowserLang();

// 如果本地的语言标识符与当前不一致，则更新本地存储
if (localLang !== language) {
    localStorage.setItem(LOCAL_LANG_FLAG, language);
}

// 从浏览器语言字符串中解析对应的默认语言
function getBrowserLang(): string {
    const { language: browserlang } = window.navigator;

    if (/en/i.test(browserlang) && allowedLangs.includes('en_US')) {
        return 'en_US';
    } else if (/tw|hk/i.test(browserlang) && allowedLangs.includes('zh_TW')) {
        return 'zh_TW';
    }

    return allowedLangs[0];
}

/** **********************语言翻译相关方法*************************/

let globalTranslation = {};

// @ts-ignore
if (pkg.locals) {
    globalTranslation = require(`locals/${language}.json`);
}

/**
 * @description
 * 语言包匹配
 */
export function __(text: string): string {
    return globalTranslation[text] || text;
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

type I18nParser = typeof __;
declare global {
    const __: I18nParser;
    interface Window {
        __: I18nParser;
    }
}

window.__ = __;

const i18n = {
    language,
    __,
    printf
};

export default i18n;
