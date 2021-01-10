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
      data: [{ id: "1", name: "1", children: null }],
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
              { id: "1-1", name: "1-1" },
              { id: "1-2", name: "1-2" },
            ];
            callback();
          }, 1000);
        }
      }
    },
  },
};
</script>
