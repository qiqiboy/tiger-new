/**
 * @desc 对URL的重新封装，增加了merge方法
 *      文档参考：http://nodejs.cn/api/url.html#url_legacy_url_api
 */
import URL, { UrlWithParsedQuery, UrlObject } from 'url';

export default {
    /**
     * @desc 合并生成新的url
     * @param {String|Object} base 原始url或者URLObject
     * @param {String|Object} url 要合并过去的url或者urlObject
     *
     * @return {String} 返回merge过后的新的url
     *
     * @example
     *     URL.merge(location.href, {
     *         query: {
     *             lang: 'zh_CN'
     *         }
     *     })
     */
    merge(base: string | UrlObject, url: string | UrlObject, strict = false): string {
        if (typeof base === 'string') {
            base = URL.parse(base, true);

            delete base.search;
            delete base.host;
        }

        if (typeof url === 'string') {
            url = URL.parse(url, true);

            delete url.search;
        }

        if (strict) {
            Object.assign(base, url);
        } else {
            Object.keys(url).forEach(key => {
                if (key === 'query') {
                    // @ts-ignore
                    base.query = { ...base.query, ...url.query };
                } else if (url[key]) {
                    base[key] = url[key];
                }
            });
        }

        return URL.format(base);
    },
    current(url?: string): UrlWithParsedQuery {
        return URL.parse(url || (typeof window !== 'undefined' ? window.location.href : ''), true);
    },
    // 以下方法参考：http://nodejs.cn/api/url.html#url_legacy_url_api
    parse: URL.parse,
    format: URL.format,
    resolve: URL.resolve
};
