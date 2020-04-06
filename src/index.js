import FancyTree from './components/tree.vue';

/* istanbul ignore next */
FancyTree.install = function(Vue) {
  Vue.component(FancyTree.name, FancyTree);
};

export default FancyTree;
