//文档查看：https://github.com/mzabriskie/axios
import axios from 'axios';

export default axios;

const ERROR_MSG = {
    /* 网络类异常 */
    OFF_LINE: '抱歉，您貌似还没连接到网络，请检查网络连接',
    200: '抱歉，请求失败',
    401: '抱歉，您貌似还没有登录',
    403: '抱歉，您没有权限访问该页面',
    413: '抱歉，您上传文件太大',

    404: '抱歉，您访问的接口地址貌似不存在',
    500: '抱歉，当前服务器异常，请稍后再试',
    503: '抱歉，当前服务器异常，请稍后再试'
};

function dataSerializer(data) {
    var key,
        result = [];

    if (typeof data === 'string') {
        return data;
    }

    for (key in data) {
        if (data.hasOwnProperty(key)) {
            result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
    }
    return result.join('&');
}

axios.interceptors.request.use(config => {
    if (!config.timeout) {
        config.timeout = 60 * 1000;
    }

    config.params = Object.assign(
        {
            _s: Date.now()
        },
        config.params
    );

    //增加对表单数组提交的支持
    if (!config.useJson && (config.method == 'post' || config.method == 'put')) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        config.transformRequest = dataSerializer;
    }

    //请求添加token头
    /* if (!config.noToken) {
     *     config.headers.Authorization = 'Bearer YOUR_TOKEN';
     * }
     */

    return config;
});

axios.interceptors.response.use(response => {
    let data = response.data;

    if (data && typeof data == 'object') {
        if (data.is_succ === false) {
            return createError(response);
        }

        return data;
    }

    return response;
}, createError);

/**
 * @description 返回一个以包装后的error对象为拒绝原因的promise
 *
 * @return {promise}
 */
function createError(responseError) {
    let error_code,
        error_msg,
        response = {};

    //请求已经发送，并且服务器有返回
    if (responseError.response || responseError.status) {
        response = responseError.response || responseError;
        //接口的返回内容
        let body = response.data;

        if (body && typeof body === 'object') {
            //有的接口错误描述还被包了一层，所以也尝试解析
            const realBody = body.data;
            if (realBody && typeof realBody === 'object') {
                const msg =
                    realBody.error_msg ||
                    realBody.error_description ||
                    realBody.error_message ||
                    realBody.message ||
                    realBody.msg ||
                    realBody.description;
                const code = realBody.error_code || realBody.code;

                if (msg) {
                    error_msg = msg;
                }

                if (code) {
                    error_code = code;
                }
            }

            //如果error_msg error_code有任何一个还没有取到
            if (!error_msg || !error_code) {
                const msg =
                    body.error_msg ||
                    body.error_description ||
                    body.error_message ||
                    body.message ||
                    body.msg ||
                    body.description;
                const code = body.error_code || body.code;

                if (!error_msg) {
                    error_msg = msg;
                }

                if (!error_code) {
                    error_code = code;
                }
            }
        }

        if (!error_code) {
            error_code = response.status;
        }
    } else if (responseError.request) {
        //请求已发送但是没有收到服务器响应
        if ('onLine' in navigator && navigator.onLine === false) {
            error_code = 'OFF_LINE';
        } else if (responseError.code === 'ECONNABORTED') {
            error_code = 504;
            error_msg = '网络请求超时(' + responseError.config.timeout + 'ms)，请确认网络正常并重试';
        }
    } else {
        //请求未发出
        error_msg = responseError.message;
    }

    if (!error_code) {
        error_code = -1;
    }

    if (!error_msg) {
        error_msg = ERROR_MSG[error_code] || response.statusText || `抱歉，当前请求异常(${error_code})`;
    }

    const error = new Error(error_msg);
    error.error_code = error_code;
    error.error_msg = error_msg;
    error.response = response;

    return Promise.reject(error);
}
