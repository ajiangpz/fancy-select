<template>
  <div id="app">
    <div class="item">
      <fancy-select
        :tree-data="options"
        v-model="fancyData"
        :multiple="true"
        includeValue="PARENT"
        place-holder="就在这里选择数据呀"
        :limit="3"
        :normalizer="normalizer"
      ></fancy-select>
    </div>
    <div class="item">
      <treeselect v-model="value" :multiple="true" :options="options" :normalizer="normalizer" />

    </div>
  </div>
</template>

<script>
// import the component
import FancySelect from "./components/FancySelect";
import "./style/fancy-select.scss";
// import { createTree } from "./utils";
// import the component
import Treeselect from "@riophae/vue-treeselect";
// import the styles

import axios from "axios";
export default {
  data() {
    return {
      value: null,
      options: [],
      fancyData: null,
    };
  },

  name: "App",
  components: {
    FancySelect,
    Treeselect
  },
  created() {
    this.getData()
      .then((res) => (this.options = res.data))
      .catch((err) => console.error(err));
  },
  methods: {
    loadFn({ action, parentNode, callback }) {
      if (action === "LOAD_CHILDREN_OPTIONS") {
        this.getChildren(parentNode.id)
          .then((res) => {
            parentNode.children = res.data;
            callback();
          })
          .catch(() => {
            parentNode.children = [];
            callback();
          });
      }
    },
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children,
      };
    },
    getChildren(pid) {
      const url = `http://localhost:3000/tree/children?id=${pid}`;
      return axios.get(url);
    },
    getData() {
      const url = `http://localhost:3000/tree?d=3&size=5`;
      return axios.get(url);
    },
  },
};
</script>

<style lang="scss" scoped>
body,
html {
  width: 100%;
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  width: 100%;
  height: 100%;
  padding: 60px;
  background: lightblue;
  box-sizing: border-box;
  justify-content: space-around;
  .item {
    width: 40%;
    padding: 10px;
    border-radius: 5px;
    min-height: 400px;
  }
}
</style>
