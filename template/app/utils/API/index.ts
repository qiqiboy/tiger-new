import path from 'path';

// 导入接口定义
import { API as PORTAL } from './apis/PORTAL';

type API<T> = { [P in keyof T]: T[P] extends object ? API<T[P]> : (...args: Array<string | number>) => string };

interface IAPI {
    // 这里需要传递接口结构声明
    PORTAL: typeof PORTAL;
}

const isDev = process.env.NODE_ENV === 'development';
// @ts-ignore
const apiCtx = require.context('./apis', false, /\.[jt]sx?$/);

export default apiCtx.keys().reduce((exports, file) => {
    exports[path.basename(file, path.extname(file))] = enhanced(apiCtx(file));

    return exports;
}, {}) as API<
    IAPI & {
        [key: string]: any;
    }
>;

function enhanced(config) {
    const host = isDev ? config.HOST[0] : config.HOST[1];
    const createAPI = apis =>
        Object.keys(apis).reduce((result, key) => {
            const pathname = apis[key];

            result[key] =
                typeof pathname === 'string'
                    ? (...args) => {
                          let index = 0;

                          return (
                              host +
                              pathname.replace(/:[^/]+/gi, match => {
                                  const arg = args[index++];

                                  return arg === undefined ? match : arg;
                              })
                          );
                      }
                    : createAPI(pathname);

            return result;
        }, {});

    return createAPI(config.API);
}
