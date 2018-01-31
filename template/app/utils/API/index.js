import * as apis from './apis';

const HOST = '';

const fixApi = cfg => {
    const apis = {};

    Object.keys(cfg).forEach(namespace => {
        let path = cfg[namespace];

        apis[namespace] =
            typeof path == 'object'
                ? fixApi(path)
                : (...args) => {
                      let index = 0;
                      return (
                          HOST +
                          path.replace(/{[^{}]*}/g, match => {
                              let data = args[index++];
                              return data == null ? match : data;
                          })
                      );
                  };
    });

    return apis;
};

export default fixApi(apis);
