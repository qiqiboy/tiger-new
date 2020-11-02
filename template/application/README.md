# {name}

{description}

<!-- vim-markdown-toc GFM -->

- [目录结构](#目录结构)
- [公共组件](#公共组件)
    + [`<Button />`](#button-)
    + [`<Debug />`](#debug-)
    + [`<Dialog />`](#dialog-)
    + [`<Modal />`](#modal-)
    + [`<Toast />`](#toast-)
    + [`<ErrorBox />`](#errorbox-)
    + [`<Loading />`](#loading-)
    + [`<Transition />`](#transition-)
    + [`utils/API`](#utilsapi)
    + [`utils/i18n`](#utilsi18n)
- [开始开发](#开始开发)
- [环境变量](#环境变量)
- [部署测试](#部署测试)
- [上线](#上线)
- [国际化/多语言](#国际化多语言)
    + [错误的用法](#错误的用法)
    + [正确的用法](#正确的用法)

<!-- vim-markdown-toc -->

> ### 如果要了解 **SSR** 功能，请[参考这里](https://github.com/qiqiboy/tiger-new/blob/master/README.md#ssr)的文档说明。

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

### 公共组件

项目组件框架主要基于[`react-bootstrap`](https://react-bootstrap.github.io/components/alerts) + [`bootstrap@4.x`](https://getbootstrap.com)，我们在此基础上，也添加及扩展了一些自定义的组件等。

**特别需要强调的是，你应该总是用`compoennts`目录下的 Button、Modal 来代替`react-bootstrap`中的同名组件！！**

#### `<Button />`

与默认的`Button`相比，增加了`loading` `ghost` `round`属性，另外`size`也支持`xs`尺寸

```typescript
interface ButtonProps extends Omit<BSButtonProps, 'type' | 'variant' | 'size'> {
    loading?: boolean; // 显示加载中状态
    round?: boolean; // 大圆角按钮
    ghost?: boolean; // 是否背景透明模式（幽灵模式）
    type?:
        | 'default'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'danger'
        | 'warning'
        | 'info'
        | 'dark'
        | 'light'
        | 'blue'
        | 'link'; // 风格定义，同variant
    size?: 'lg' | 'sm' | 'xs';
    htmlType?: string; // 传递给按钮dom节点的type属性，type="submit"
}

<Button loading type="primary" htmlType="submit">
    提交中
</Button>;
```

#### `<Debug />`

辅助调试内容输出到页面上。

该组件无需在上线前移除，`NODE_ENV=production`下会停止渲染。另外也可以通过`disabled`属性来控制其是否渲染。

```typescript
interface DebugProps {
    data: object;
    title: string;
    maxHeight?: number;
    disabled?: boolean;
}

<Debug data={any} disabled />;
```

#### `<Dialog />`

创建对话框，基于 Modal 组件实现。另外它具有两个静态方法：

```javascript
Dialog.alert({ title, content });
Dialog.confirm({ title, content });
```

> 注： 其它形式的弹窗，应该自行使用 Modal.open 实现。

#### `<Modal />`

创建模态框。该组件同`react-bootstrap`中的同名方法，我们支持给它额外扩展了一个`open`方法：

其中，`component`参数中传递的组件，将会接收到`close`和`dismiss`两个关闭 Modal 的方法。

其它属性参考：[Modal](https://react-bootstrap.github.io/components/modal/#modals-props)

```javascript
function SomeComponent(props) {
    return <button onClick={props.close}>关闭</button>;
}

Modal.open({
    component: <SomeComponent />
    // ... 可以继续传其它react-bootstrap中Modal组件的同名props参数
});

// OR

Modal.open({
    component: SomeComponent
    // ... 可以继续传其它react-bootstrap中Modal组件的同名props参数
});
```

#### `<Toast />`

创建非模态框，主要用来显示那些无需用户回应的消息，或者显示全局的 `loading` 遮罩状态。

```javascript
Toast.show('任意文本');
Toast.loading(true / false);
```

#### `<ErrorBox />`

显示错误信息等

```typescript
ErrorBoxProps {
    error: Error | string;
    onClick?: React.MouseEventHandler;
    title: string;
}

<ErrorBox error={Error} />
```

#### `<Loading />`

显示加载中状态

```typescript
interface LoadingProps extends Omit<SpinnerProps, 'variant' | 'animation'> {
    type?: SpinnerProps['animation'];
    color?: SpinnerProps['variant'];
    tip?: React.ReactNode; // 加载中的文字
    className?: string;
    inline?: boolean;
}

<Loading tip="加载中" />;
```

#### `<Transition />`

辅助动画组件。默认支持 `Fade`、`Zoom`、`FLow`、`Collapse` 等动画效果，基于`react-transition-group`的二次封装:

```javascript
import { Fade, Zoom, Flow, Collapse } from 'components/Transition';

<Fade in={true} timeout={600}>
    <div>这个节点将引用fade动效</div>
</Fade>;
```

> 需要注意的是，由于动画基于 css3 实现，所以提供了 100ms 到 3000ms 区间（每间隔 100ms）的动画时间设定，在这个区间里的动画时间无需额外的 css 设置。超出这个范围外的动画，需要额外提供 css 对动画时间进行设置。

#### `utils/API`

用于配置接口，支持多服务器配置。每个服务器用一个文件进行表示，放到目录中的`apis`目录下（建议以大写字母命名）。
然后就可以通过`API.xxx`来进行层级式访问

```javascript
// API/apis/CUSTOME.js
export const HOST = ['https://test.xxx.com', 'https://www.test.com'];
export const API = {
    userStatus: '/api/v1/status' // 用户状态
};

// app.js
API.CUSTOM.userStatus(); // 获取到接口地址

API.CUSTOM.userStatus.get(); // 直接发起get请求，当然也可以用其他post、put、delete等axios支持的请求方发
```

每个 API 实例的接口定义如下：

```typescript
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
```

#### `utils/i18n`

参考[国际化/多语言](#国际化多语言)。

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

### 环境变量

本项目支持通过环境变量配置一些项目运行规则，可用的环境变量如下：

-   `PORT` 指定本地服务的端口
-   `HOST` 指定本地服务的 host；请注意，单独设置该变量，将导致本地的`localhost`失效，只能使用指定的`HOST`访问服务
-   `HTTPS` 配置使用 https；需要有本地的 SSL 证书
-   `PROXY` 配置本地代理服务器
-   `DANGEROUSLY_DISABLE_HOST_CHECK` 关闭 host 检测；`DANGEROUSLY_DISABLE_HOST_CHECK=true`将允许任意的 host 访问
-   `IGNORE_CSS_ORDER_WARNINGS` 禁止`mini-css-extract-plugin`插件输出`conflicting order`警告信息
-   `PUBLIC_URL` 类似 webpack 配置中的`config.publicPath`，可以用来控制生成的代码的入口位置
-   `BASE_NAME` 指定项目的`basename`，例如`BASE_NAME=/account`
-   `SKIP_CDN` 跳过 CDN 上传阶段；`SKIP_CDN=true npm run pack`即表示本次构建不上传 cdn，仅本地构建
-   `BUILD_DIR` 指定项目构建输出目录；不传递该变量情况下，`prodcution`环境输出到`build`目录，`development`环境输出到`buildDev`目录
-   `SSR` 是否启用`SSR`。默认情况下，当项目存在`SSR`入口文件，将自动启用`SSR`。你可以通过`SSR=false`来禁用这一功能
-   `RUNTIME` 运行时标记，`web` 或者 `node`
-   `COMPILE_ON_WARNING` 构建时允许警告
-   `TSC_COMPILE_ON_ERROR` 开发时允许 ts 编译器错误
-   `DISABLE_NEW_JSX_TRANSFORM` 不使用react新的JSX transform
-   `TIGER_*` 任意的以`TIGER_`开头的变量。**该变量也会传递给 webpack 构建，所以你可以在项目代码中访问该变量：`process.env.TIGER_*`**

以上环境变量，你可以在运行相关命令时指定，也可以通过项目根目录下的`.env` `.env.production` `.env.developement` `.env.local` `.env.production.local` `.env.developement.local` 等文件配置。

但是，请注意，默认以`.local`结尾的环境变量文件，是不包含在项目 git 仓库中的。

### 部署测试

要在测试环境部署，可以部署测试包：

```
$ npm run build:dev
```

该命令会创建与本地开发环境一致的构建包，方便查看、调试错误。

### 上线

如果项目需要上线，可以运行：

```
$ npm run pack
```

该命令会开启代码压缩混淆、css 提取合并、图片压缩等，构建出尽可能小的代码包。如果创建项目时配置了 cdn 服务，该命令也会在构建完成后自动自行 cdn 上传操作。

该命令模式下，`process.env.NODE_ENV === 'production'`。

### 国际化/多语言

项目中的`utils/i18n`模块提供了对语言国际化支持。

我们提供了一个全局语言匹配函数: `__()`，任何需要配置多语言的文本，都可以使用该函数包装。但是，需要注意的是，只能传递普通的文本字符串，**不可传递字符串拼接、变量、或者 ES6 的字符串模板！**

> 请注意，全局的 `__()` 仅可用于纯浏览器端，如果启用了SSR，那么不可以全局调用 `__()`，否则代码在服务端将会报错。SSR模式下i18n使用请参考：[`SSR: 国际化 i18n`](https://github.com/qiqiboy/tiger-new/blob/master/README.md#国际化-i18n))

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
