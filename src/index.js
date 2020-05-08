import FancySelect from './components/tree.vue';

/* istanbul ignore next */
FancySelect.install = function(Vue) {
  Vue.component(FancySelect.name, FancySelect);
};

export default FancySelect;
