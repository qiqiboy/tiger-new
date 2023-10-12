# {name}

{description}

<!-- vim-markdown-toc GFM -->

- [目录结构](#目录结构)
- [开始开发](#开始开发)
- [页面适配等比例缩放（rem）](#页面适配等比例缩放rem)
- [环境变量](#环境变量)
- [部署测试](#部署测试)
- [上线](#上线)
- [国际化/多语言](#国际化多语言)
    + [错误的用法](#错误的用法)
    + [正确的用法](#正确的用法)

<!-- vim-markdown-toc -->

### 目录结构

项目初始化完毕后，你将会看到下面的目录结构

```
├── app             - 开发代码目录
│   ├── components  - 项目公共组件目录
│   ├── modules     - 页面（路由）模块组件目录
│   ├── stores      - mobx状态store目录
│   ├── hooks       - React自定义hooks
│   ├── types       - typescript类型定义文件目录
│   └── utils       - 工具类方法函数目录
├── buildDev        - 测试环境构建输出目录
├── public          - 入口页面html文件目录
├── scripts         - 构建工具配置目录
├── static          - 项目公共静态资源目录
```

### 开始开发

通过`npm start`即可以快速在本地创建开发服务。本地开发模式下，`process.env.NODE_ENV === 'development'`。

```bash
# 本地启动 http://localhost:3000 服务
$ npm start

# 启动https https://localhost:3000
$ HTTPS=true npm start

# 指定端口 http://localhost:4000
$ PORT=4000 npm start

# 指定host http://local.test.com:3000
$ HOST='local.test.com' npm start

# 指定代理服务器
$ PROXY='https://api.twitter.com/' npm start
```

### 页面适配等比例缩放（rem）

如果项目要支持等比例放大模式，只需要以下两步即可：

1. 编辑项目下的 `static/css/vendor.scss`，取消掉 `@improt './rem.scss';` 的注释
2. 在项目根目录下的`package.json`中添加 `"useRem": true,` 即可

我们通过 postcss 插件实现了对项目中 px 尺寸的自动转换为 rem 支持，所以你无需特地对设计稿到 rem 的尺寸进行计算，直接像普通项目那样书写 px 单位即可。项目编译时会自动转换为 rem。

如果你在某些情况下不希望转换发生，很简单，属性值使用大写的`PX`（插件会忽略该单位，而浏览器可以正常识别）或者定义 className 类名时以 `px-` 开头即可！

如果你在某些情况下不希望转换发生，很简单，属性值使用大写的`PX`（插件会忽略该单位，而浏览器可以正常识别）或者定义 className 类名时以 `px-` 开头即可！

```scss
.box {
    font-size: 16px; // 小写的px单位将会转换为rem
    /* prettier-ignore */
    line-height: 30PX; // 大写的PX将会被忽略，不进行转换(上方的注释不能缺少，否则prettier会将其格式化成小写)
}

// 以 px- 开头的类选择器下所有属性值都不会被转换
.px-box {
    line-height: 30px;
}
```

### 环境变量

本项目支持通过环境变量配置一些项目运行规则，可用的环境变量如下：

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
-   `DISABLE_TSC_CHECK` 禁用 typescript 编译检查
-   `DISABLE_NEW_JSX_TRANSFORM` 不使用 react 新的 JSX transform
-   `DISABLE_FAST_REFRESH` 不使用 `react-refresh`，对于超大型项目这很有用，因为目前的 `react-refresh` 存在较严重的性能问题
-   `DISABLE_WEBPACK_CACHE` 不使用 `webpack` 的 `cache` 特性，某些项目可能存在构建时使用 `filesystem` 缓存时产生崩溃
-   `TIGER_*` 任意的以`TIGER_`开头的变量。**该变量也会传递给 webpack 构建，所以你可以在项目代码中访问该变量：`process.env.TIGER_*`**

以上环境变量，你可以在运行相关命令时指定，也可以通过项目根目录下的`.env` `.env.production` `.env.developement` `.env.local` `.env.production.local` `.env.developement.local` 等文件配置。

但是，请注意，默认以`.local`结尾的环境变量文件，是不包含在项目 git 仓库中的。

### 部署测试

要在测试环境部署，可以部署测试包：

```

\$ npm run build:dev

```

该命令会创建与本地开发环境一致的构建包，方便查看、调试错误。

### 上线

如果项目需要上线，可以运行：

```

\$ npm run pack

```

该命令会开启代码压缩混淆、css 提取合并、图片压缩等，构建出尽可能小的代码包。如果创建项目时配置了 cdn 服务，该命令也会在构建完成后自动自行 cdn 上传操作。

该命令模式下，`process.env.NODE_ENV === 'production'`。

### 国际化/多语言

项目中的`utils/i18n`模块提供了对语言国际化支持。

我们提供了一个全局语言匹配函数: `__()`，任何需要配置多语言的文本，都可以使用该函数包装。但是，需要注意的是，只能传递普通的文本字符串，**不可传递字符串拼接、变量、或者 ES6 的字符串模板！**

> 请注意，全局的 `__()` 仅可用于纯浏览器端，如果启用了 SSR，那么不可以全局调用 `__()`，否则代码在服务端将会报错。SSR 模式下 i18n 使用请参考：[`SSR: 国际化 i18n`](https://github.com/qiqiboy/tiger-new/blob/master/README.md#国际化-i18n))

#### 错误的用法

```javascript
const text = __('我今年' + age + '岁了'); // 错误：不可以拼接字符串
const text = __(`我今年${age}岁了`); // 错误：不可以使用带变量的字符串模板
const text = __(Age_desc_variable); // 错误：不可以使用变量
```

#### 正确的用法

```javascript
const text = __('我今年') + age + __('岁了'); // 正确：如果翻译文本前后都可以对应，可以使用__()分别对应前后段文本翻译
const text = __('我今年%s岁了').replace('%s', age); // 正确：使用占位符替换，可以更灵活的翻译
const i18n.printf(__('我今年%s岁了'), age); // 正确，使用提供的printf方法来辅助输出
```

**导出语言包**

每次文案有更新，需要进行翻译时，需要导出语言包，可以运行：

```bash
npm run i18n-scan
```

该命令会在项目的`locals`目录下，生成相关的待翻译的 excel 文件。待翻译完成后，将文件放回原来位置（即`locals/xlsx/***.xlsx`），再次运行：

```bash
npm run i18n-read
```

该命令会提取 excel 中的文本，转成语言包配置`locals/***.json`。

然后即可正常构建上线！

> **提醒**：需要尽可能将`utils/i18n`模块在代码中前置引用，例如在放到项目项目入口文件`app/index.tsx`的顶部导入，确保语言包优先生效！

```typescript
// app/index.tsx
import 'utils/i18n';
import React from 'react';
import { render } from 'react-dom';
import App from 'modules/App';

render(<App />, document.querySelector('#root'));
```
