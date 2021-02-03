

## 基本使用

<DemoSource componentName='examples-base'>
```js
<template>
  <div class="demo">
    <fancy-select :tree-data="data" :normalizer="normalizer"></fancy-select>
  </div>
</template>
<script>
import { createTree } from "../../../../src/utils";
export default {
  data() {
    return {
      data: createTree(10, 2),
    };
  },
  methods: {
    normalizer(node) {
      return {
        label: node.name,
        children: node.children,
      };
    },
  },
};
</script>
```
</DemoSource>

## 限制显示选中的个数

<DemoSource componentName="examples-LimitText">
```js
<template>
  <div class="demo">
    <fancy-select :tree-data="data" :normalizer="normalizer"></fancy-select>
  </div>
</template>
<script>
import { createTree } from "../../../../src/utils";
export default {
  data() {
    return {
      data: createTree(10, 2),
    };
  },
  methods: {
    normalizer(node) {
      return {
        label: node.name,
        children: node.children,
      };
    },
  },
};
</script>
```
</DemoSource>

## 默认展开层级

<DemoSource componentName="examples-defaultExpandLevel">
```js
<template>
  <div class="demo">
    <fancy-select :tree-data="data" :normalizer="normalizer" :limit="3" :limit="3"></fancy-select>
  </div>
</template>
<script>
import { createTree } from "../../../../src/utils";
export default {
  data() {
    return {
      data: createTree(10, 2),
    };
  },
  methods: {
    normalizer(node) {
      return {
        label: node.name,
        children: node.children,
      };
    },
  },
};
</script>
```
</DemoSource>

## 选择包含的值

<DemoSource componentName="examples-includeValue">
```js
<template>
  <div class="demo">
    <fancy-select
      :tree-data="data"
      :normalizer="normalizer"
      :include-value="includeValue"
    ></fancy-select>
    <template>
      <div v-for="value in includeValues" style="display:inline-block">
        <input
          type="radio"
          name="includeValue"
          :id="value"
          :key="value"
          v-model="includeValue"
          :value="value"
        />
        <label :for="value">{{ value }}</label>
      </div>
    </template>
  </div>
</template>
<script>
import { createTree } from "../../../../src/utils";
export default {
  data() {
    return {
      data: createTree(10, 2),
      includeValue: "PARENT",
      includeValues: ["PARENT", "LEAF", "ALL", "ALL_WITH_INDETERMINATE"],
    };
  },
  methods: {
    normalizer(node) {
      return {
        label: node.name,
        children: node.children,
      };
    },
  },
};
</script> 
```
</DemoSource>

## 异步加载子节点

<DemoSource componentName="examples-asyncLoadChildren">
```js
<template>
  <div class="demo">
    <fancy-select
      :tree-data="data"
      :normalizer="normalizer"
      :limit="3"
      :loadOptions="loadOption"
    ></fancy-select>
  </div>
</template>
<script>
export default {
  data() {
    return {
      data: [{ id: "1", name: "1", children: null,isParent:true }],
    };
  },
  methods: {
    normalizer(node) {
      return {
        label: node.name,
        children: node.children,
      };
    },
    loadOption({ action, parentNode,callback} ) {
      if (action === "LOAD_CHILDREN_OPTIONS") {
        if (parentNode.id === "1") {
          setTimeout(() => {
            parentNode.children = [
              { id: "1-1", name: "1-1", children: [] },
              { id: "1-2", name: "1-2", children: [] },
            ];
            callback();
          }, 1000);
        }
      }
    },
  },
};
</script>
```
</DemoSource>

## 一次性加载并展开大量节点

<DemoSource componentName="examples-bigData">
```js
<template>
  <div class="demo">
    <fancy-select
      :tree-data="data"
      :normalizer="normalizer"
      :limit="3"
    ></fancy-select>
  </div>
</template>
<script>
import { createTree } from "../../../../src/utils";
export default {
  data() {
    return {
      data: createTree(10, 3),

    };

},
methods: {
normalizer(node) {
return {
label: node.name,
children: node.children,
};
},
},
};
</script>
```
</DemoSource>

## 双向绑定

<DemoSource componentName="examples-vModel">
```js
<template>
  <div class="demo">
    <fancy-select
      :tree-data="data"
      :normalizer="normalizer"
      :limit="3"
    ></fancy-select>
  </div>
</template>
<script>
import { createTree } from "../../../../src/utils";
export default {
  data() {
    return {
      data: createTree(10, 3),

    };

},
methods: {
normalizer(node) {
return {
label: node.name,
children: node.children,
};
},
},
};
</script>
```
</DemoSource>

