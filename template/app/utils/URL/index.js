/**
 * @desc 对URL的重新封装，增加了merge方法
 *      文档参考：http://nodejs.cn/api/url.html#url_legacy_url_api
 */
import URL from 'url';

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
    merge(base, url) {
        if (typeof base === 'string') {
            base = URL.parse(base, true);

            delete base.search;
        }

        if (typeof url === 'string') {
            url = URL.parse(url, true);

            delete URL.search;
        }

        Object.keys(url).forEach(key => {
            if (key === 'query') {
                base.query = Object.assign(base.query || {}, url.query);
            }

            base[key] = url[key];
        });

        return URL.format(base);
    },
    current(url) {
        return URL.parse(url || window.location.href, true);
    },
    // 以下方法参考：http://nodejs.cn/api/url.html#url_legacy_url_api
    parse: URL.parse,
    format: URL.format,
    resolve: URL.resolve
};
