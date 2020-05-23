import FancySelect from "../../src/index";
import { createTree } from "../../src/utils/index";
export default ({ Vue, options, router, siteData }) => {
  Vue.component("fancy-select", FancySelect);
};
