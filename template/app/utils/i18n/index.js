import URL from 'utils/URL';

//可用的语言
const avaliable = ['zh_CN', 'en_US', 'zh_TW'];

let language = URL.current().query.lang || sessionStorage.getItem('lang');

if (avaliable.indexOf(language) > -1) {
    sessionStorage.setItem('lang', language);
} else {
    language = 'zh_CN';
}

const langConfig = require(`./config/${language}`);

export { langConfig as default, language };
