# babel-preset-react-app-new

`babel-preset-react-app-new` 是从官方的 [`babel-preset-react-app`](https://github.com/facebook/create-react-app/tree/main/packages/babel-preset-react-app) **fork** 而来的 Babel 预设配置。它主要用于 `tiger-new` 及其相关生态，或作为独立项目的通用 React Babel 预设。

---

## 在 tiger-new 项目中的使用

如果你使用的是 **`tiger-new` 脚手架创建的项目**，
**通常不需要手动安装或配置本 preset**。

`tiger-new` 会在内部自动引入并配置 `babel-preset-react-app-new`。

---

## 在非 tiger-new 项目中的使用

### 1. 安装 preset

```sh
$ npm install babel-preset-react-app-new --save-dev
```

### 2. 配置 Babel

在你的 Babel 配置文件（如 `.babelrc` 或 `babel.config.js`）中，添加 `babel-preset-react-app-new` 作为预设：

```json
{
    "presets": ["react-app-new"]
}
```
