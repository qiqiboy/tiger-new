import path from 'path';
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import 'utils/http';

// 导入接口定义
import { API as PORTAL } from './apis/PORTAL';

interface APICollection {
    // 这里需要传递接口结构声明
    PORTAL: typeof PORTAL;
}

interface APIInstance {
    (...args: Array<string | number>): string;

    request<T = any>(config: AxiosRequestConfig, ...args: Array<string | number>): AxiosPromise<T>;
    get<T = any>(config?: AxiosRequestConfig, ...args: Array<string | number>): AxiosPromise<T>;
    delete(config?: AxiosRequestConfig, ...args: Array<string | number>): AxiosPromise;
    head(config?: AxiosRequestConfig, ...args: Array<string | number>): AxiosPromise;
    post<T = any>(data?: any, config?: AxiosRequestConfig, ...args: Array<string | number>): AxiosPromise<T>;
    put<T = any>(data?: any, config?: AxiosRequestConfig, ...args: Array<string | number>): AxiosPromise<T>;
    patch<T = any>(data?: any, config?: AxiosRequestConfig, ...args: Array<string | number>): AxiosPromise<T>;
}

type API<T> = { [P in keyof T]: T[P] extends object ? API<T[P]> : APIInstance };

const isDev = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENV === 'development';
// @ts-ignore
const apiCtx = require.context('./apis', false, /\.[jt]sx?$/);
const axiosMethods = ['request', 'get', 'post', 'put', 'delete', 'delete', 'patch'];

export default apiCtx.keys().reduce((exports, file) => {
    exports[path.basename(file, path.extname(file))] = enhanced(apiCtx(file));

    return exports;
}, {}) as API<APICollection>;

function enhanced(config) {
    const createAPI = apis =>
        Object.keys(apis).reduce((result, key) => {
            const pathname = apis[key];

            function apiInstance(...args) {
                let index = 0;
                const host = isDev ? config.HOST[0] : config.HOST[1];

                return (
                    host +
                    pathname.replace(/:[^/]+/gi, match => {
                        const arg = args[index++];

                        return arg === undefined ? match : arg;
                    })
                );
            }

            axiosMethods.forEach(type => {
                apiInstance[type] = (...args) => {
                    const apiArgs: Array<string | number> = [];
                    const httpArgs: object[] = [];

                    args.forEach(item => {
                        if (typeof item === 'string' || typeof item === 'number') {
                            apiArgs.push(item);
                        } else {
                            httpArgs.push(item);
                        }
                    });

                    // 针对request方法特殊处理
                    if (type === 'request') {
                        return axios.request({
                            ...httpArgs[0],
                            url: apiInstance(...apiArgs)
                        });
                    }

                    return axios[type](apiInstance(...apiArgs), ...httpArgs);
                };
            });

            result[key] = typeof pathname === 'string' ? apiInstance : createAPI(pathname);

            return result;
        }, {});

    return createAPI(config.API);
}

/**
 * 根据配置的HOST_ALIAS切换host
 */
export function setAlias(name: string) {
    apiCtx.keys().forEach(file => {
        const config = apiCtx(file);

        if (config.HOST_ALIAS && name in config.HOST_ALIAS) {
            config.HOST.splice(0, 2, ...config.HOST_ALIAS[name]);
        }
    });
}
