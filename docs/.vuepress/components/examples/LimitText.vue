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
