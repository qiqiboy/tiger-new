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

<!-- vim-markdown-toc -->

### 目录结构

项目初始化完毕后，你将会看到下面的目录结构

```
├── app             - 开发代码目录
│   ├── components  - 项目公共组件目录
│   ├── modules     - 页面（路由）模块组件目录
│   ├── stores      - mobx状态store目录
│   ├── types       - typescript类型定义文件目录
│   └── utils       - 工具类方法函数目录
├── buildDev        - 测试环境构建输出目录
├── public          - 入口页面html文件目录
├── scripts         - 构建工具配置目录
├── static          - 项目公共静态资源目录
```

### 公共组件

> 在开发环境，可以打开 [/components](http://localhost:3006/accounts/components) 来查看项目中公共组件的示例

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

辅助动画组件。默认支持 `Fade`、`Zoom`、`FLow` 三种动画效果，其实就是对`react-transition-group`的二次封装:

```javascript
<Fade in={true}>
    <div>这个节点将引用fade动效</div>
</Fade>
```

#### `utils/API`

用于配置接口，支持多服务器配置。每个服务器用一个文件进行表示，放到目录中的`apis`目录下（建议以大写字母命名）。
然后就可以通过`API.xxx`来进行层级式访问


```javascript
// API/apis/CUSTOME.js
export const HOST = ['https://test.xxx.com', 'https://www.test.com'];
export const API = {
    userStatus: '/api/v1/status', // 用户状态
};

// app.js
API.CUSTOM.userStatus() // 获取到接口地址
```

#### `utils/i18n`

用于实现多语言包配置。它可以自动根据页面 url 中的 lang 参数确定当前页面的语言版本。默认支持`zh_CN` `zh_TW` `en_US`三种语言标识符。

可以直接在该目录下的 config 中的相关语言目录中进行配置，然后可以直接引用 i18n 这个对象进行访问。

也可以将 i18n 当作方法，传递文本配置参数，然后利用返回值就行访问：

```javascript
const lang = i18n({
    title: {
        en: 'title',
        tw: '繁体',
        cn: '简体'
    }
});

lang.title; // 获取相关文案
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
