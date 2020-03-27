export const HOST = ['https://dev.com', 'https://prod.com'];

/**
 * 配置一些特殊的host，可以通过 setAlias(key) 来动态切换host
 * 项目没有此应用场景可以省略配置
 *
 *  export const HOST_ALIAS = {
 *      key1: ['https://1.dev.com', 'https://1.prod.com'],
 *      key2: ['https://2.dev.com', 'https://2.prod.com']
 *  }
 */

export const API = {
    // 用户状态
    userStatus: '/api/userStatus'
};
