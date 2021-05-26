<template>
  <div id="app">
    <fancy-select
      :tree-data="options"
      v-model="fancyData"
      place-holder="就在这里选择数据呀"
      :limit="3"
      :normalizer="normalizer"
      :multiple="false"
    ></fancy-select>
  </div>
</template>

<script>
import FancySelect from "./components/FancySelect";
// import the component
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import "./style/fancy-select.scss";
import axios from "axios";
import { data } from "./store.js";
export default {
  data() {
    return {
      options: [],
      fancyData: ["440304000000"],
    };
  },

  name: "App",
  components: {
    FancySelect,
  },
  created() {
    this.options = data.result;
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
  padding: 60px;
  background: lightblue;
  box-sizing: border-box;
  justify-content: space-around;
}
</style>
