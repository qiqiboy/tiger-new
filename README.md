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
-   `DANGEROUSLY_DISABLE_HOST_CHECK` 关闭 host 检测；`DANGEROUSLY_DISABLE_HOST_CHECK=false`将允许任意的 host 访问
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
-   `request` `response` 即为 `HTTP request`和`HTTP response` 对象。如果你使用其它框架，可以自行定义（如果生产环境选择使用其它 HTTP 服务框架，或者传递不一样的参数，请注意区分生产和开发环境，因为开发环境使用 webpack 时，总是固定传递默认的三个参数值）

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

你应当从`BUILD_DIR/node`下获取`SSR`的入口 js 文件和模板文件:

```javascript
const express = require('express');
const renderer = require('YOUR_PROJECT/build/node/index.js').default;
const templateFile = 'YOUR_PROJECT/build/node/index.html';

const app = express();

app.use(async (req, res, next) => {
    try {
        renderer(templateFile, req, res);
    } catch (err) {
        next(err);
    }
});
```

**构建时会同时生成 static 入口和 node 入口，你可以随时根据切换切换到 SSR 或者使用纯静态部署**

### 路由与异步数据处理

`tiger-new`的`SSR`功能仅提供了对相关入口文件的构建编译支持，并不包含更进一步的路由、异步数据处理等逻辑。但是这部分又是实际中比较常见的需求，这里提供个简单的实现思路：

**1. 提取路由配置**

我们要将路由配置抽取出来，方便在服务端以及客户端共用。

```typescript
// stores/routes.ts
interface RouteItem {
    path?: string;
    exact?: boolean;
    component: React.ComponentType;
}

const routes: RouteItem[] = [
    {
        path: '/',
        exact: true,
        component: Home
    },
    {
        path: '/about',
        component: AboutUs
    }
];

export default routes;
```

**2. CSR 与 SSR 入口处理**

SSR 入口：

```typescript
// app/index.node.tsx
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, Route, matchPath } from 'react-router-dom';
import routes from 'stores/routes';

const renderer = async (templateFile, request, response) => {
    let initialProps;

    /**
     * 遍历路由配置，找到与当前请求匹配的路由
     * 然后调用组件的 getInitialProps 方法，获取组件的初始数据（下面会讲到如何定义 getInitialProps）
     */
    for (let i = 0; i < routes.length; i++) {
        const { component, path, exact, ...others } = routes[i];
        const match = matchPath(request.path, {
            path,
            exact
        });

        if (match) {
            // @ts-ignore
            if (component.getInitialProps) {
                // @ts-ignore
                initialProps = await component.getInitialProps({
                    match,
                    request,
                    response
                });
            }

            break;
        }
    }

    let template = fs.readFileSync(templateFile, 'utf8');
    let body = renderToString(
        <StaticRouter location={request.url}>
            <Switch>
                {routes.map(({ component, ...item }, index) => (
                    <Route {...item} component={component} key={index} />
                ))}
            </Switch>
        </StaticRouter>
    );
    let html = template
        .replace('%ROOT%', body)
        .replace('%DATA%', `var __DATA__=${initialProps ? JSON.stringify(initialProps) : 'null'}`);

    response.send(html);
};
```

CSR 入口

```typescript
// app/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import routes from 'stores/routes';

ReactDOM[__SSR__ ? 'hydrate' : 'render'](
    <BrowserRouter>
        <Switch>
            {routes.map(({ component, ...item }, index) => (
                <Route {...item} component={component} key={index} />
            ))}
        </Switch>
    </BrowserRouter>,
    document.getElementById('wrap')
);
```

**3. 使用 [`withSSR`](https://github.com/qiqiboy/tiger-new/blob/master/template/application/app/utils/withSSR/index.tsx) 高阶组件处理路由页面组件**

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

### 注意事项

-   `SSR`功能并不包含对任何`web` `node`运行时环境的兼容处理，你应当注意自己的代码的环境兼容性
-   `SSR`功能并不包含任何路由的处理，如果有需要，你需要自行解决（使用 react-router 比较容易解决）
-   `SSR`功能并不包含任何页面初始化异步数据的处理，如果有需要，你需要自行解决
-   `SSR`功能并不包含任何其它对于`SEO`场景的处理，如果有需要，你需要自行解决
