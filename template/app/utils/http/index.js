//文档查看：https://github.com/mzabriskie/axios
import axios from 'axios';

export default axios;

const ERROR_MSG = {
    /* 网络类异常 */
    0: '请求未发出',
    401: '你还未登录',
    403: '你没有权限访问该页面',
    413: '上传文件太大',

    404: '接口不存在',
    500: '服务器错误',
    503: '服务器错误'
};

function dataSerializer(data) {
    var key,
        result = [];

    if (typeof data === "string") {
        return data;
    }

    for (key in data) {
        if (data.hasOwnProperty(key)) {
            result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        }
    }
    return result.join("&");
}

axios.interceptors.request.use(config => {
    if (!config.timeout) {
        config.timeout = 20 * 1000;
    }

    config.url += (/\?/.test(config.url) ? '&' : '?') + '_s=' + Date.now();

    if (!config.useJson && (config.method == 'post' || config.method == 'put')) {
        config.headers["Content-Type"] = "application/x-www-form-urlencoded";
        config.transformRequest = dataSerializer;
    }

    return config;
});

axios.interceptors.response.use(response => {
    let data = response.data,
        error_code;

    if (data && typeof data == 'object') {
        if (data.is_succ === false) {
            error_code = data.error_code || -1;

            return Promise.reject(new Error(ERROR_MSG[error_code] || data.error_msg || '请求失败（' + error_code + '）'));
        }

        return data;
    }

    return response;
}, respError => {console.dir(respError)
    const response = respError.response;
    let error;
    if(respError.code === 'ECONNABORTED') {
        error = new Error('网络请求超时（' + error.config.timeout + 'ms），请确认网络正常并重试。');
    } else {
        let error_code = response.status || -1;
        error = new Error(ERROR_MSG[error_code] || response.statusText || '网络异常（' + error_code + '）');
    }

    return Promise.reject(error);
});
