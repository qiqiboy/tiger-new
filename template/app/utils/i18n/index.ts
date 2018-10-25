import URL from 'utils/URL';

// 可用的语言
const avaliable: string[] = ['zh_CN', 'en_US', 'zh_TW'];

let language = URL.current().query.lang || sessionStorage.getItem('lang');

if (avaliable.indexOf(language as string) > -1) {
    sessionStorage.setItem('lang', language as string);
} else {
    language = 'zh_CN';
}

// tslint:disable-next-line
const langConfig = require(`./config/${language}`);

export { langConfig as default, language };
