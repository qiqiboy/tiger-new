# tiger-new

快速生成一个标准开发项目的CLI。(本项目自facebook官方出品的 [create-react-app](https://github.com/facebookincubator/create-react-app) 修改而来)

* CLI-QA形式初始化配置项目
* 生成的项目支持webpack + es6 开发环境
* 也支持jsx语法，所以也同时可以用来开发react应用
* 不仅支持SPA，也支持多页面项目开发
* 多页面应用支持模板分离
* 打包构建支持抽取打包公共组件、库、样式
* 支持scss、less
* 支持eslint语法检查

更多特性及使用细节请安装后创建项目查看

![screenshot](https://cloud.githubusercontent.com/assets/3774036/26042794/b2ee8ce0-396a-11e7-97e1-b52f31309c2c.png)

## v2.x新功能
* 持久化缓存的优化
* webpack升级到2.x
* webpack-dev-server的升级，带来更好的proxy支持

## 安装
    $ npm install tiger-new -g

## 使用
    $ tiger-new <项目名|路径>

例如：

    $ tiger-new my-new-project
    $ cd my-new-project/
    $ npm start
