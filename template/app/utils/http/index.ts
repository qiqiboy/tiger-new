// 文档查看：https://github.com/mzabriskie/axios
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export default axios;

type ErrorCode = number | string | undefined;
type ErrorMsg = string | undefined;
interface IError extends Error {
    error_code: ErrorCode;
    error_msg: ErrorMsg;
    response: AxiosResponse;
}

interface IHttpConfig extends AxiosRequestConfig {
    useJson: boolean;
    noToken: boolean;
}

interface IData {
    error_msg?: ErrorMsg;
    error_description?: ErrorMsg;
    error_message? : ErrorMsg;
    message?: ErrorMsg;
    description?: ErrorMsg;
    msg?: ErrorMsg;

    error_code?: ErrorCode;
    code?: ErrorCode;
}

const ERROR_MSG = {
    /* 网络类异常 */
    OFF_LINE: '抱歉，您貌似还没连接到网络，请检查网络连接',
    CANCEL: '抱歉，请求已取消',
    200: '抱歉，请求失败',
    401: '抱歉，您貌似还没有登录',
    403: '抱歉，您没有权限访问该页面',
    413: '抱歉，您上传文件太大',

    404: '抱歉，您访问的接口地址貌似不存在',
    500: '抱歉，当前服务器异常，请稍后再试',
    503: '抱歉，当前服务器异常，请稍后再试'
};

function dataSerializer(data: object | string) {
    let key: string;
    const result: string[] = [];

    if (typeof data === 'string') {
        return data;
    }

    for (key in data as object) {
        if (data.hasOwnProperty(key)) {
            result.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
    }

    return result.join('&');
}

axios.interceptors.request.use((config: IHttpConfig) => {
    if (!config.timeout) {
        config.timeout = 60 * 1000;
    }

    config.params = Object.assign(
        {
            _s: Date.now()
        },
        config.params
    );

    // 增加对表单数组提交的支持
    if (!config.useJson && (config.method === 'post' || config.method === 'put')) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        config.transformRequest = dataSerializer;
    }

    // 请求添加token头
    /* if (!config.noToken) {
     *     config.headers.Authorization = 'Bearer YOUR_TOKEN';
     * }
     */

    return config;
});

axios.interceptors.response.use((response: AxiosResponse) => {
    let data = response.data;

    if (data && typeof data === 'object') {
        if (data.is_succ === false) {
            return createError({ response } as AxiosError);
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
function createError(responseError: AxiosError) {
    let error_code: ErrorCode;
    let error_msg: ErrorMsg;
    let response: AxiosResponse = {} as AxiosResponse;

    const pickError = function(data: IData) {
        if (data && typeof data === 'object') {
            const msg =
                data.error_msg ||
                data.error_description ||
                data.error_message ||
                data.message ||
                data.msg ||
                data.description;
            const code = data.error_code || data.code;

            if (msg && !error_msg) {
                error_msg = msg;
            }

            if (code && !error_code) {
                error_code = code;
            }
        }
    };

    // 请求已经发送，并且服务器有返回
    if (responseError.response) {
        response = responseError.response;

        // 接口的返回内容
        const body = response.data;

        if (body && typeof body === 'object') {
            // 有的接口错误描述还被包了一层，所以也尝试解析
            pickError(body.data);
            pickError(body);
        }

        // 如果依然没有取到错误code，这使用http code当作错误code
        if (!error_code) {
            error_code = response.status;
        }
    } else if (responseError.request) {
        // 请求已发送但是没有收到服务器响应
        if ('onLine' in navigator && navigator.onLine === false) {
            error_code = 'OFF_LINE';
        } else if (responseError.code === 'ECONNABORTED') {
            error_code = 504;
            error_msg = '网络请求超时(' + responseError.config.timeout + 'ms)，请确认网络正常并重试';
        }
    } else {
        // 请求未发出
        error_msg = responseError.message;

        if (axios.isCancel(responseError)) {
            error_code = 'CANCEL';
        }
    }

    if (!error_code) {
        error_code = -1;
    }

    if (!error_msg) {
        error_msg = ERROR_MSG[error_code] || response.statusText || `抱歉，当前请求异常(${error_code})`;
    }

    const error = new Error(error_msg) as IError;

    error.error_code = error_code;
    error.error_msg = error_msg;
    error.response = response;

    return Promise.reject(error as IError);
}
