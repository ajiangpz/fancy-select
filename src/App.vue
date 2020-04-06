<template>
  <div id="app">
    <!-- <div class="item">
      <treeselect
        v-model="value"
        :multiple="true"
        :options="options"
        :defaultExpandLevel="Infinity"
        :alwaysOpen="true"
        :disableFuzzyMatching="true"
      />
    </div> -->
    <div class="item">
      <fancy-tree :tree-data="options"> </fancy-tree>
    </div>
  </div>
</template>

<script>
// import the component
// import Treeselect from "@riophae/vue-treeselect";
import FancyTree from "./components/FancyTree";
// import the styles
// import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import "./style/fancy-tree.scss";

import { createTree } from "./utils";
export default {
  data() {
    return {
      value: null,
      options: []
    };
  },

  name: "App",
  components: { 
    // Treeselect,
     FancyTree },
  created() {
    this.options = createTree(10, 2);
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  justify-content: space-around;
  .item {
    width: 40%;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    min-height: 400px;
  }
}
</style>
