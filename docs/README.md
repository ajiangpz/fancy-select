# fancy-select

> 一个基于 vue 的高性能树形选择组件

## 特点

- 提供树形结构的单选和多选
- 子节点懒加载
- 支持键盘事件
- 自定义树节点
- 上万条数据流畅展示

## 安装

`npm` 安装

```js
npm install --save fancy-select2
```

`script` 引入

```html
<script src="https://unpkg.com/fancy-select2@0.2.2"></script>
```

## 使用

### `npm`引入

`import`组件

```js
import FancySelect from "fancy-select2";
```

在组件中引入

```js
components: {
  FancySelect;
}
```

引入样式文件

```js
import "fancy-select2/dist/fancy-select2.min.css";
```

基本使用

```html
<fancy-select :tree-data="options"></fancy-select>
```

### `script`标签引入

引入样式文件

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/fancy-select2@0.2.2/dist/fancy-select2.min.css"
/>
```

注册组件

```js
Vue.component("fancy-select2", FancySelect.default);
```

基本使用

```html
<fancy-select :tree-data="options"></fancy-select>
```
