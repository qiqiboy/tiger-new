# tiger-new

[![npm](https://img.shields.io/npm/v/tiger-new.svg?style=flat)](https://npm.im/tiger-new)

<!-- vim-markdown-toc GFM -->

* [安装](#安装)
* [使用](#使用)
    - [创建新项目](#创建新项目)
    - [升级老项目](#升级老项目)
    - [功能说明](#功能说明)
* [更新日志](#更新日志)
    - [v6.x 新功能](#v6x-新功能)
    - [v5.x 新功能](#v5x-新功能)
    - [v4.x 新功能](#v4x-新功能)
    - [v3.x 新功能](#v3x-新功能)
    - [v2.x 新功能](#v2x-新功能)
* [**SSR**](#ssr)
    - [开发](#开发)
    - [发布](#发布)
    - [路由与异步数据处理](#路由与异步数据处理)
    - [`withSSR`](#withssr)
    - [注意事项](#注意事项)

<!-- vim-markdown-toc -->

快速生成一个标准开发项目的 CLI。(本项目自 facebook 官方出品的 [create-react-app](https://github.com/facebookincubator/create-react-app) 修改而来)

-   CLI-QA 形式初始化配置项目
-   生成的项目支持 `webpack` + `es6` 开发环境
-   支持 `Service Worker Precache`，生成离线应用
-   也支持 jsx 语法，所以也同时可以用来开发 `react` 应用
-   提供渐进式对`typescript`语法的支持，支持`tsx`开发`react`应用
-   不仅支持 SPA，也支持**多页面**项目开发
-   **NEW** 支持 jest 自动化测试
-   **NEW** 支持[`SSR`](#ssr)(server side render)
-   多页面应用支持模板分离
-   打包构建支持抽取打包公共组件、库、样式
-   支持 `scss`、`less`
-   支持 `eslint` `tslint` 语法检查
-   支持 `ternjs` 配置

更多特性及使用细节请安装后创建项目查看

![screenshot](https://cloud.githubusercontent.com/assets/3774036/26042794/b2ee8ce0-396a-11e7-97e1-b52f31309c2c.png)

## 安装

    $ npm install tiger-new -g

## 使用

### 创建新项目

    $ tiger-new <项目名|路径>

### 升级老项目

    $ tiger-new <项目名|路径> --upgrade

例如：

    $ tiger-new my-new-project
    $ cd my-new-project/
    $ npm start

### 功能说明

`tiger-new`完全基于`create-react-app`，所以完整支持所有`cra`的所有功能特性。你可以直接参考[`cra官网`](https://create-react-app.dev/)来了解生成项目的基本的使用。

> 注：是指生成的项目的功能特性完全支持`cra`所生成的项目的所有特性。但是`tiger-new`与`cra`的项目创建流程并不一致。

**支持的环境变量**

-   `PORT` 指定本地服务的端口
-   `HOST` 指定本地服务的 host；请注意，单独设置该变量，将导致本地的`localhost`失效，只能使用指定的`HOST`访问服务
-   `HTTPS` 配置使用 https；需要有本地的 SSL 证书
-   `PROXY` 配置本地代理服务器
-   `DANGEROUSLY_DISABLE_HOST_CHECK` 关闭 host 检测；`DANGEROUSLY_DISABLE_HOST_CHECK=true` 将允许任意的 host 访问
-   `IGNORE_CSS_ORDER_WARNINGS` 禁止`mini-css-extract-plugin`插件输出`conflicting order`警告信息
-   `PUBLIC_URL` 类似 webpack 配置中的`config.publicPath`，可以用来控制生成的代码的入口位置
-   `BASE_NAME` 指定项目的`basename`，例如`BASE_NAME=/account`
-   `SKIP_CDN` 跳过 CDN 上传阶段；`SKIP_CDN=true npm run pack`即表示本次构建不上传 cdn，仅本地构建
-   `BUILD_DIR` 指定项目构建输出目录；不传递该变量情况下，`prodcution`环境输出到`build`目录，`development`环境输出到`buildDev`目录
-   `SSR` 是否启用`SSR`。默认情况下，当项目存在`SSR`入口文件，将自动启用`SSR`。你可以通过`SSR=false`来禁用这一功能
-   `RUNTIME` 运行时标记，`web` 或者 `node`
-   `COMPILE_ON_WARNING` 构建时允许警告
-   `TSC_COMPILE_ON_ERROR` 开发时允许 ts 编译器错误
-   `TIGER_*` 任意的以`TIGER_`开头的变量。**该变量也会传递给 webpack 构建，所以你可以在项目代码中访问该变量：`process.env.TIGER_*`**

以上环境变量，你可以在运行相关命令时指定，也可以通过项目根目录下的`.env` `.env.production` `.env.developement` `.env.local` `.env.production.local` `.env.developement.local` 等文件配置。

但是，请注意，默认以`.local`结尾的环境变量文件，是不包含在项目 git 仓库中的。

**支持的运行命令**

-   `npm start` 启动本地开发服务
-   `npm run build` `npm run pack` 构建生产包(默认输出文件到 build 目录)，其中如果配置了 CDN，则`pack`命令还会调用`npm run cdn`命令执行文件上传；否则两者一致
-   `npm run build:dev` 构建测试包(默认输出文件到 buildDev 目录)
-   `npm run cdn` 上传构建文件到从 cdn 服务器
-   `npm test` 运行测试
-   `npm run serve` 启动本地预览服务器
-   `npm run i18n-scan` `npm run i18n-read` 读取或者写入 i18n 文件
-   `npm run count` 查看代码统计

**更多功能请创建项目后查看项目的 README.md 文件**

## 更新日志

### v6.x 新功能

-   支持 [SSR](#ssr) 渲染
-   同步`CRA 3.x`

### v5.x 新功能

-   集成`jest`测试

### v4.x 新功能

-   可以选择创建普通的开发项目，还是 npm 发布包项目

### v3.x 新功能

-   webpack 升级到 v4
-   babel 升级到 v7
-   eslint 升级到 v5
-   更好的 typescript 支持

### v2.x 新功能

-   持久化缓存的优化
-   webpack 升级到 2.x
-   webpack-dev-server 的升级，带来更好的 proxy 支持

## **SSR**

`6.0` 起开始支持`SSR`渲染，感谢 [SSR support #6747](https://github.com/facebook/create-react-app/pull/6747) 这个 PR 带来的灵感。

### 开发

`SSR`是一个可选的功能，并且它与本身的纯静态构建完全兼容，甚至可以共存。要开启项目的`SSR`功能，你只需要添加一个同名入口文件，以`.node.[ext]`作为后缀即可:

```diff
  ├── app
  │   ├── components
  │   ├── hooks
  │   ├── modules
  │   ├── types
  │   ├── utils
  │   ├── index.tsx
+ │   ├── index.node.tsx
  │   ├── about.tsx
+ │   └── about.node.tsx
  ├── public
  │   ├── index.html
+ │   ├── index.node.html
  │   └── service-worker.js
```

> 上述示例以多入口项目做示例，一般来说单入口项目只需要添加一个`index.node.[ext]`即可。对于该示例来说，`/about/*` 的请求都会走`about.node.tsx`，其它请求走默认的`index.node.tsx`。
>
> `.node.html`模板是可选的，如果缺省，则以默认的`index.html`作为 SSR 入口模板。

`index.node.[ext]`是一个导出接收 `templateFile` `request` `response` 三个参数的函数，用来做服务端渲染启动。

-   `templateFile` 模板文件路径
-   `request` `response` 即为 `HTTP request`和`HTTP response` 对象

> 注意：以上几个参数为本地开发环境默认传递的参数，但是服务器部署并一定要求使用 Express 或者必须按照该参数传递。事实上你完全可以自定义你的`index.node.[ext]`入口方法的函数定义，只要做好本地环境和服务器部署环境区分即可。

基本的 `index.node.tsx` 里的内容大致如下：

```typescript
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import fs from 'fs';

const renderer = async (templateFile, request, response) => {
    // 读取模板文件内容
    const template = fs.readFileSync(templateFile, 'utf8');
    // 获取react组件的渲染字符串
    const body = renderToString(<App />);
    // 替换模板中占位注释字符，完成渲染初始化
    const html = template.replace('<!-- root -->', body);

    response.send(html);
};

// 请注意这里需要导出renderer方法
export default renderer;
```

### 发布

要发布测试或者生产环境，依然是运行`npm run build:dev` 或者 `npm run pack`。但是与纯静态项目不一样的是，`SSR`的入口文件会放到 `BUILD_DIR/node` 路径下。

你可以在项目下新建一个`server.js`文件，作为启动入口：

```javascript
// server.js
const path = require('path');
const express = require('express');
const renderer = require(resolveApp('node/index')).default;
const templateFile = resolveApp('node/index.html');

const app = express();
const port = process.env.PORT || 4000; // 默认端口

function resolveApp(...dirs) {
    const buildDir = process.env.NODE_ENV === 'development' ? 'buildDev' : 'build';

    return path.join(process.cwd(), buildDir, ...dirs);
}

// 将 BUILD_DIR 作为静态资源目录
app.use(
    express.static(resolveApp(), {
        index: false
    })
);

app.use(async (req, res, next) => {
    try {
        await renderer(templateFile, req, res);
    } catch (err) {
        next(err);
    }
});

app.listen(port);

process.on('SIGINT', function() {
    process.exit(0);
});
```

再创建`pm2`的配置文件`pm2.config.js`：

```javascript
// pm2.config.js
module.exports = {
    // 区分生产和测试环境，分开配置
    apps: [
        {
            name: 'my-ssr-app-prod',
            script: 'server.js',
            watch: false,
            env: {
                NODE_ENV: 'production',
                PORT: 4100
            },
            instances: -1, // 生产环境使用最大cpu线程数减1，你可以自行修改其他数只或者'max'
            exec_mode: 'cluster',
            source_map_support: true,
            ignore_watch: ['[/\\]./', 'node_modules']
        },
        {
            name: 'my-ssr-app-dev',
            script: 'server.js',
            watch: false,
            env: {
                NODE_ENV: 'development',
                PORT: 4100
            },
            instances: 1, // 测试环境只起一个线程，你也可以自行修改
            source_map_support: true,
            ignore_watch: ['[/\\]./', 'node_modules']
        }
    ]
};
```

最终文件结构大概类似：

```diff
    ├── app
    ├── build
    ├── buildDev
    ├── package.json
    ├── public
    ├── scripts
+   ├── server.js
+   ├── pm2.config.js
    └── tsconfig.json
```

然后你就可以在服务器上通过`pm2`启动、管理你的应用服务：

```bash
# 一键启动、重载应用，因为我们在一个配置文件里配置了多个app，所以需要通过 `--only` 指定要启动的应用

# development环境
pm2 reload pm2.config.js --only my-ssr-app-dev

# production环境
pm2 reload pm2.config.js --only my-ssr-app-prod
```

**注意：构建时会同时生成 static 入口和 node 入口，你可以随时根据切换切换到 SSR 或者使用纯静态部署**

### 路由与异步数据处理

`tiger-new`的`SSR`功能仅提供了对相关入口文件的构建编译支持，并不包含更进一步的路由、异步数据处理等逻辑。但是这部分又是实际中比较常见的需求，这里提供一个基于 [`react-router-config`](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config) 和 [`withSSR`](#withssr) 实现的静态路由异步数据与`code splitting`异步组件的实现：

> **withSSR** 是 tiger-new 内置模板里提供的一个高阶组件，它提供了默认的 `withSSR`（给组件扩展 getInitialProps 异步数据处理） 以及 `prefetchRoutesInitialProps`（SSR 端获取匹配路由的异步数据和预加载异步组件）。

**1. 提取路由配置**

我们要将路由配置抽取出来，方便在服务端以及客户端共用。建议将路由配置统一放置到`stores/routes`：

```typescript
// stores/routes.ts
import { RouteItem } from 'utils/withSSR'; // 定义的路由配置项类型
import withLoadable from 'utils/withLoadable';
import Home from 'modules/Home';

/**
 * 按需加载组件
 *
 * withLoadable是tiger-new内置的异步组件方法，但是这是可选的；
 * 事实上只要异步组件具有一个静态方法 `loadComponent` 即可，这个用于在SSR端预加载组件。
 *
 * 注：'modules/About' 其实是个聚合导出，为了方便统一对这几个组件做按需加载: export { About, AboutUs, AboutCompany }
 */
const About = withLoadable(() => 'modules/About', 'About');
const AboutUs = withLoadable(() => 'modules/About', 'AboutUs');
const AboutCompany = withLoadable(() => 'modules/About', 'AboutCompany');

const routes: RouteItem[] = [
    {
        path: '/',
        exact: true,
        component: Home
    },
    {
        path: '/about',
        component: About,
        routes: [
            {
                path: '/about/us',
                component: AboutUs
            },
            {
                path: '/about/company',
                component: AboutCompany
            }
        ]
    }
];

export default routes;
```

**2. CSR 与 SSR 入口处理**

CSR 入口：

```typescript
// app/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import routes from 'stores/routes';

/**
 * CSR端也需要使用 react-router-config 的 renderRoutes 方法渲染路由
 */
ReactDOM[__SSR__ ? 'hydrate' : 'render'](
    <BrowserRouter>
        <div className="app">{renderRoutes(routes)}</div>
    </BrowserRouter>,
    document.getElementById('wrap')
);
```

SSR 入口：

```typescript
// app/index.node.tsx
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, Route, StaticRouterContext } from 'react-router';
import { renderRoutes } from 'react-router-config';
import App from 'modules/App';
import routes from 'stores/routes';
import { prefetchRoutesInitialProps } from 'utils/withSSR';

/**
 * 拦截未捕获的的promise rejection异常，避免报错
 */
if (!global.__handledRejection__) {
    global.__handledRejection__ = true;

    process.on('unhandledRejection', () => {
        // @TODO 待查明具体的rejection来源，你可以在这里加入对异常的处理逻辑
    });
}

const renderer = async (templateFile, request, response) => {
    /**
     * 获取页面初始数据以及预加载异步组件
     */
    const initialProps = await prefetchRoutesInitialProps(routes, request.url, request, response);
    /**
     * ctx为一个包含 initialProps 的对象，需要传递给StaticRouter的context属性
     * 这一点很重要，确保我们的页面组件可以拿到初始化的数据
     */
    const ctx: StaticRouterContext = {
        initialProps
    };

    let template = fs.readFileSync(templateFile, 'utf8');
    /**
     * SSR端需要使用StaticRouter
     * 并且需要使用 react-router-config 的 renderRoutes 方法渲染路由
     *
     * !!!!! 注意StaticRouter的context属性一定不能忘了哦
     */
    let body = renderToString(
        <StaticRouter location={request.url} context={ctx}>
            <div className="app">{renderRoutes(routes)}</div>
        </StaticRouter>
    );
    /**
     * 将页面的初始数据通过 __DATA__ 渲染到页面上，让 CSR 端的组件读取，以实现同构渲染
     */
    let html = template
        .replace('%ROOT%', body)
        .replace('%DATA%', `var __DATA__=${initialProps ? JSON.stringify(initialProps) : 'null'}`);

    /**
     * 处理页面重定向
     */
    if (ctx.url) {
        response.redirect(ctx.url);
    } else {
        response.send(html);
    }
};

export default renderer;
```

**3. 使用 [`withSSR`](#withssr) 高阶组件给路由页面组件绑定数据获取方法**

我们的页面组件应该尽可能依赖于从其`props`中获取相关页面所需数据，减少其内部自身的数据获取逻辑。

```typescript
// app/modules/Home
import React from 'react';
import withSSR, { SSRProps } from 'utils/withSSR';

const Home: React.FC<
    SSRProps<{
        homeData: any;
    }>
> = props => {
    return <div className="home">{props.homeData}</div>;
};

export default withSSR(Home, async () => {
    const homeData = await fetch('/api/home');

    return {
        homeData
    };
});
```

以上三步配置完，即可实现`SSR`与`CSR`的同构渲染。

### `withSSR`

`utils/withSSR` 是 tiger-new 的项目模板中自带的一个用于 `SSR` 数据与路由处理的解决方法。（老项目中如果不存在这个文件，需要自行下载添加：[`utils/withSSR`](https://github.com/qiqiboy/tiger-new/blob/master/template/application/app/utils/withSSR)

它包含一个高阶组件`withSSR`和一个 SSR 端用于预取数据的方法`prefetchRoutesInitialProps`。

**withSSR(WrappedCompoennt, getInitialProps)**

这是一个高阶组件，其 TS 签名如下:

```typescript
type SSRProps<More> = {
    __error__: Error | undefined;
    __loading__: boolean;
    __getData__(extraProps？: {}): Promise<void>;
} & More;

interface SSRInitialParams extends Partial<Omit<RouteComponentProps, 'match'>> {
    match: RouteComponentProps<any>['match'];
    parentInitialProps: any;
    request?: Request;
    response?: Response;
}

function withSSR<SelfProps, More = {}>(
    WrappedComponent: React.ComponentType<SelfProps & SSRProps<More>>,
    getInitialProps: (props: SSRInitialParams) => Promise<More>
): React.ComponentType<Omit<SelfProps, keyof SSRProps<More>>>;
```

`withSSR`会向组件传递`getInitialProps`返回的对象，以及 `__loading__` `__error__` `__getData__` 等三个属性，你可以用这几个属性来处理异步状态。

第二个参数 `getInitialProps` 接受一个对象参数，该方法在 SSR 和 CSR 端都会被调用，所以参数略有不同：

-   node 环境，包含 `request` 和 `response` 对象，不包含 `location` `history`
-   browser 环境，包含 `location` `history`对象，不包含 `request` 和 `response`
-   `match` 和 `parentInitialProps` 无论哪个环境都存在

`getInitialProps`应该返回一个包含要传递给组件的值的`object`对象（注意，如果是异步调用，需要返回 Promise 对象容器）：

```typescript
withSSR(MyComponent, () =>
    fetch('/data.json').then(resp => ({
        data: resp.toJSON()
    }))
);

/**
 * async/await语法，同上
 */
withSSR(MyComponent, async () => {
    const resp = await fetch('/data.json');
    return { data: resp.toJSON() };
});

/**
 * 动态 path 路由，数据需要根据路由参数获取
 */
withSSR(UserDetail, async ({ match }) => {
    const resp = await fetch(`/api/user/${match.params.userid}`);

    return { userData: resp.toJSON() };
});

/**
 * 嵌套子路由路由，子路由的数据请求依赖于父级路由的数据
 * 这里假设父级路由获取userList数据，该UserDetail组件获取并渲染userList的第一项对应的数据
 * 通过 parentInitialProps 可以拿到父级路由的初始props对象
 */
withSSR(UserDetail, async ({ parentInitialProps }) => {
    const resp = await fetch(`/api/user/${parentInitialProps.userList[0].id}`);

    return { userData: resp.toJSON() };
});
```

> **TypeScript 注意事项：** 如果使用 ts 开发，请使用 `withSSR` 包装的组件需要通过 `SSRProps<{}>` 来声明组件的 props 类型，这样就可以在组件内部安全的通过 props 访问 `passToComponentPropName` `__error__` `__loading__` `__getData__` 等属性了

```typescript
const MyComp: React.FC<
    SSRProps<{
        passToComponentPropName: string;
    }> &
        RouteComponentProps
> = props => {
    if (props.__loading__) {
        return 'loading...';
    }

    if (props.__error__) {
        return props.__error__.message;
    }

    return <div>{props.passToComponentPropName}</div>;
};

export default withSSR(MyComp, async () => ({
    passToComponentPropName: 'I am good!'
}));
```

**prefetchRoutesInitialProps**

`prefetchRoutesInitialProps` 用于在 SSR 端预加载通过 `withSSR` 绑定了 `getInitialProps` 方法的组件。它支持嵌套路由。

当匹配到嵌套路由时，它会预先调用父级路由的 `getInitialProps`，然后将结果(`parentInitialProps`)和子路由的匹配信息(`match`等对象)一起传递给子路由的`getInitialProps`。这是一个递归过程，支持多级路由。

```typescript
function prefetchRoutesInitialProps(routes: RouteItem[], url: string, request: any, response: any): Promise<{}>;
```

具体使用示例请参考上方 [路由与异步数据处理](#路由与异步数据处理)

### 注意事项

-   `SSR`功能并不包含对任何`web` `node`运行时环境的兼容处理，你应当注意自己的代码的环境兼容性
-   `SSR`功能并不包含任何路由的处理，如果有需要，你需要自行解决（使用 react-router 比较容易解决，参考[路由与异步数据处理](#路由与异步数据处理))
-   `SSR`功能并不包含任何页面初始化异步数据的处理，如果有需要，你需要自行解决(参考[路由与异步数据处理](#路由与异步数据处理))
-   `SSR`功能并不包含任何其它对于`SEO`场景的处理，如果有需要，你需要自行解决（建议使用 [`react-helmet`](https://github.com/nfl/react-helmet)，它支持`SSR`）
-   `mobx-react`在`SSR`场景下会导致内存泄漏，请参考[Server Side Rendering with `useStaticRendering`](https://github.com/mobxjs/mobx-react#server-side-rendering-with-usestaticrendering)
