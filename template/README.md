# tiger-new

支持 `ES6` + `TypeScript` + `React` 的开发环境

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
