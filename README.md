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
<script src="https://unpkg.com/fancy-select2"></script>
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

## 组件属性

| 参数               | 说明                                                         | 类型     | 可选值                                 | 默认值                                                       |
| ------------------ | ------------------------------------------------------------ | -------- | -------------------------------------- | ------------------------------------------------------------ |
| treeData           | 原始数据                                                     | Array    |                                        | null                                                         |
| label              | 数据中用于展示的字段名称                                     | String   |                                        | label                                                        |
| multiple           | 是否用于多选                                                 | Boolean  | true/false                             | true                                                         |
| maxHeight          | 下拉菜单的最大高度                                           | Number   |                                        | 300                                                          |
| matchKeys          | 搜索的匹配字段                                               | 数组     |                                        | ['label']                                                    |
| includeValue       | 选中树型数据时，可以选择只返回父节点、子节点、、所有节点包括半选状态的节点、所有节点不包括半选状态 | String   | PARENT/LEAF/ALL/ALL_WITH_INDETERMINATE | PARENT                                                       |
| noResultsText      | 搜索无匹配数据的提示信息                                     | String   |                                        | 暂无数据                                                     |
| loadOptions        | 异步加载函数                                                 | Function |                                        |                                                              |
| noChildrenText     | 无子节点提示信息                                             | String   |                                        | 暂无子节点                                                   |
| value              | 初始值，如果需要双向绑定，则直接使用v-model                  | Array    |                                        | null                                                         |
| placeholder        | placeholder                                                  | String   |                                        | 请选择数据...                                                |
| limit              | 限制选中的值的显示个数                                       | Number   |                                        | Infinity                                                     |
| limitText          | 超过limit值后，显示的内容                                    | Function |                                        | function limitTextDefault(count) {return `+ ${count}`}       |
| normalizer         | 指定数据的id,children,label字段                              | Function |                                        | function(node){return{id:node.id,label:node.label,children:node.children}} |
| defaultExpandLevel | 默认展开的层级                                               | Number   |                                        | 0                                                            |