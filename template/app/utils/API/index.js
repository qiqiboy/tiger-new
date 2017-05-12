import * as apis from './apis';
import pkg from '../../../package.json';

const HOST = process.env.NODE_ENV === 'production' ? pkg.proxy : '';

const fixApi = cfg => {
    const apis = {};

    Object.keys(cfg)
        .forEach(namespace => {
            let path = cfg[namespace];

            apis[namespace] = typeof path == 'object' ?
                fixApi(path) : (...args) => {
                    let index = 0;
                    return HOST + path.replace(/{[^{}]*}/g, match => {
                        let data = args[index++];
                        return data == null ? match : data;
                    })
                }
        });

    return apis;
}

export default fixApi(apis);
