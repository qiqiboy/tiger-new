// 在生产环境，注册SW来利用本地缓存来处理静态资源

// 该功能将会赋予app离线访问的能力
// 但是离线访问只能在N+1次访问后才可以，即如果初次访问，离线功能将不会生效

import './style.scss';

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
        // [::1] IPv6
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 IPv4
        window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// 注册
export default function register() {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = process.env.SPA ? `/service-worker.js` : `./service-worker.js`;

            if (isLocalhost) {
                // 本地环境，检查SW是否还在，因为本地可能多个项目，前后会运行在同一个端口，彼此间是否开启sw会相互产生影响
                checkValidServiceWorker(swUrl);
            } else {
                registerValidSW(swUrl);
            }
        });
    }
}

// 清理
export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.unregister();
        });
    }
}

function registerValidSW(swUrl) {
    navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // 内容有更新，由于是异步的，所以我们需要提示用户刷新页面
                            // 为了更好的体验，所以我们不直接做 location.reload()
                            createNotification();
                            console.log('New content is available; please refresh.');
                        } else {
                            // 初次访问安装
                            console.log('Content is cached for offline use.');
                        }
                    }
                };
            };
        })
        .catch(error => {
            console.error('Error during service worker registration:', error);
        });
}

function checkValidServiceWorker(swUrl) {
    fetch(swUrl)
        .then(response => {
            // 如果链接有效，则会返回标准js文件内容
            if (response.status === 404 || response.headers.get('content-type').indexOf('javascript') === -1) {
                // SW文件不存在，则意味着可能此时运行了其它项目，所以我们清除掉SW，并刷新页面
                navigator.serviceWorker.ready.then(registration => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                // SW存在，就继续执行注册
                registerValidSW(swUrl);
            }
        })
        .catch(() => {
            console.log('No internet connection found. App is running in offline mode.');
        });
}

function createNotification() {
    document.body.insertAdjacentHTML('afterBegin', `<div class="sw-reload-notification">
        <p>页面有新的内容更新</p>
        <button class="sw-reload" onclick="window.location.reload()">立即刷新</button>
    </div>`);
}
