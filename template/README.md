# tiger-new

支持 `ES6` + `TypeScript` + `React` 的开发环境

<!-- vim-markdown-toc GFM -->

- [目录结构](#目录结构)
- [公共组件](#公共组件)
    + [`<Button />`](#button-)
    + [`<FAQ />`](#faq-)
    + [`<Debug />`](#debug-)
    + [`<Dialog />`](#dialog-)
    + [`<Modal />`](#modal-)
    + [`<Toast />`](#toast-)
    + [`<MessageBox />`](#messagebox-)
    + [`<ErrorBox />`](#errorbox-)
    + [`<Loading />`](#loading-)
    + [`<Switch />`](#switch-)
    + [`<Portal />`](#portal-)
    + [`<DatePicker />`](#datepicker-)
    + [`<Transition />`](#transition-)
    + [`utils/API`](#utilsapi)
    + [`utils/i18n`](#utilsi18n)
- [开始开发](#开始开发)
- [部署测试](#部署测试)
- [上线](#上线)
- [国际化/多语言](#国际化多语言)
    + [单文件直接使用](#单文件直接使用)
    + [手动提取语言配置](#手动提取语言配置)
    + [自动提取配置](#自动提取配置)

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

### 公共组件

项目组件框架主要基于[`react-bootstrap`](https://5c507d49471426000887a6a7--react-bootstrap.netlify.com/getting-started/introduction) + [`bootstrap@3`](https://getbootstrap.com/docs/3.3/getting-started/)，我们在此基础上，也添加及扩展了一些自定义的组件等。

**特别需要强调的是，你应该总是用`compoennts`目录下的 Button、Modal 来代替`react-bootstrap`中的同名组件！！**

> 首次生成项目后，你可以运行该项目来查看项目中公共组件的调用示例。

> 注意：`components` 目录下的组件为基础组件，例如输入型组件 `Switch`、`Telcodes` 等，如果要使用于表单，也需要和 `react-bootstrap-formutil` 中的 `FormGroup` 搭配使用！

> 而 `components/forms` 下的组件，则为表单子组件（可以理解为组合成大表单的片段），无需搭配 `FormGroup`。

#### `<Button />`

基于`react-bootstrap`中的 Button 组件实现。相比与原来的 Button，增加了 `loading` 设置。

其它属性参考：[Button](https://react-bootstrap.github.io/components/buttons/#buttons-props)

```javascript
<Button loading bsStyle="primary">
    提交中
</Button>
```

#### `<FAQ />`

通过一个小问号，用户点击后在弹出面板中显示一段内容解释说明

```javascript
<FAQ>
    <h5>名词解释</h5>
    <p>...</p>
</FAQ>
```

#### `<Debug />`

辅助调试内容输出到页面上。

该组件无需在上线前移除，`NODE_ENV=production`下会停止渲染。另外也可以通过`disabled`属性来控制其是否渲染。

```javascript
<Debug data={any} disabled />
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

#### `<MessageBox />`

显示一段信息描述，支持情景配置。

```javascript
<MessageBox msg="any" type="primary" />
```

#### `<ErrorBox />`

显示错误信息等

```javascript
<ErrorBox error={Error} />
```

#### `<Loading />`

显示加载中状态

```javascript
<Loading label="加载中" />
```

#### `<Switch />`

开关组件，一般用于和 `FormGroup` 配合使用

```javascript
<FormGroup name="switch" checked="yes" unchecked="no">
    <Switch />
</FormGroup>
```

#### `<Portal />`

创建组件树外的组件。一般情况下，可以考虑使用 `Modal` 来创建弹窗

```javascript
<Portal>
    <div>这个节点将渲染到react节点树以外</div>
</Portal>
```

#### `<DatePicker />`

日期选择组件，一般用于和 `FormGroup` 配合使用。可以通过`minDate` `maxDate`来设置可选择的最大最小时间

```javascript
<FormGroup name="birthday" checked="yes" unchecked="no">
    <DatePicker />
</FormGroup>
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

项目中的`utils/i18n`模块提供了对语言国际化支持，现在支持三种使用方法：

#### 单文件直接使用

你可以直接在需要处理多语言的文件中，导入`i18n`模块下的`language`变量，判断语言标识。

```javascript
import { language } from 'i18n';

const label = language === 'en_US' ? 'username' : '用户名';

// jsx
<div>{language === 'en_US' ? 'username' : '用户名'}</div>;
```

或者也可以将 `i18n` 当作一个函数调用，传递文本配置参数，然后利用返回值就行访问：


```javascript
import i18n from 'utils/i18n';

const lang = i18n({
    title: {
        en: 'title',
        tw: '繁体',
        cn: '简体'
    }
});

lang.title; // 获取相关文案
```

#### 集中提取语言配置

这种用法要求现将语言文本，都提取到`utils/i18n/config/xxx`目录下，可以自由按照模块、业务划分。

```javascript
import i18n from 'i18n';

const label = i18n.xxx.label;

// jsx
<div>{i18n.xxx.label}</div>;
```

#### 自动提取配置

这是我们推荐的用法，相比上面两种，更加容易维护管理。

我们提供了一个全局语言匹配函数: `__()`，任何需要配置多语言的文本，都可以使用该函数包装。但是，需要注意的是，只能传递普通的文本字符串，**不可传递字符串拼接、变量、或者 ES6 的字符串模板！**

##### 正确的用法

```javascript
const label = __('用户名');

// jsx
<div>{__('用户名')}</div>;
```

##### 错误的用法

```javascript
const label = __('用户名' + '：'); // 应该是： __('用户名') + __('：'))

// jsx
<div>{__(label)}</div>; // 不可以传递变量名
```

每次语言包有更新，需要更新语言包时，可以运行：

```bash
npm run i18n-scan
```

该命令会在项目的`locals`目录下，生成相关的待翻译的 excel 文件。待翻译完成后，将文件返回原来位置，再次运行：

```bash
npm run i18n-read
```

该命令会提取 excel 中的文本，转成语言包配置。

然后即可正常构建上线！

> **提醒**：需要尽可能将`utils/i18n`模块在代码中前置引用，例如在放到项目公共的`vendor.js`中，或者页面入口文件顶端引入本模块，确保语言包优先生效！
