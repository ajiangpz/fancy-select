<template>
  <div id="app">
    <div class="item">
      <treeselect
        v-model="value"
        :multiple="true"
        :options="options"
        :disableFuzzyMatching="true"
      >
      </treeselect>
    </div>
    <div class="item">
      <fancy-select
        :tree-data="myOptions"
        v-model="fancyData"
        :multiple="true"
      ></fancy-select>
    </div>
  </div>
</template>

<script>
// import the component
import Treeselect from "@riophae/vue-treeselect";
import FancySelect from "./components/FancySelect";
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import "./style/fancy-select.scss";
import _ from "lodash";
import { createTree } from "./utils";
export default {
  data() {
    return {
      value: null,
      options: [],
      myOptions: [],
      fancyData: null,
    };
  },

  name: "App",
  components: {
    Treeselect,
    FancySelect,
  },
  created() {
    this.options = createTree(10, 1);
    this.myOptions = _.cloneDeep(this.options);
  },
  methods: {
    loadFn({ action, parentNode, callback }) {
      if (action === "LOAD_CHILDREN_OPTIONS") {
        switch (parentNode.id) {
          case "1-1": {
            setTimeout(() => {
              parentNode.children = [
                {
                  id: "1-1-1",
                  label: Math.random(0, 1),
                },
                {
                  id: "1-1-12",
                  label: Math.random(0, 1),
                },
              ];
              callback();
            }, 1000);
            break;
          }
          default: {
            parentNode.children = [];
            callback();
            break;
          }
        }
      }
    },
  },
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
    padding: 10px;
    border-radius: 5px;
    min-height: 400px;
  }
}
</style>
