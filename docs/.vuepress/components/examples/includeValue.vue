<template>
  <div class="demo">
    <fancy-select
      :tree-data="data"
      :normalizer="normalizer"
      :include-value="includeValue"
      :limit="3"
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
