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
     * } */

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
    let error_code, error_msg, response;

    if (responseError.code === 'ECONNABORTED') {
        error_code = 504;
        error_msg = '网络请求超时(' + responseError.config.timeout + 'ms)，请确认网络正常并重试';
    } else {
        error_code = responseError.code;
        error_msg = responseError.message;
        response = responseError.response || responseError;

        //接口的返回内容
        let body = response.data;

        if (typeof body === 'object') {
            //有的接口错误描述还被包了一层，所以也尝试解析
            const realBody = body.data;
            if (typeof realBody === 'object') {
                const msg =
                    realBody.error_msg ||
                    realBody.error_message ||
                    realBody.error_description ||
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
                    body.error_message ||
                    body.error_description ||
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
    }

    if (!error_code) {
        error_code = response.status || -1;
    }

    if (!error_msg) {
        error_msg = ERROR_MSG[error_code] || `请求异常(${error_code})`;
    }

    const error = new Error(error_msg);
    error.error_code = error_code;
    error.error_msg = error_msg;
    error.response = response;

    return Promise.reject(error);
}
