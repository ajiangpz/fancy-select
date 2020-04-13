<script>
import ArrowIcon from "./icons/Arrow";
import { UNCHECKED, CHECKED, INDETERMINATE } from "../contants";

let arrowPlaceHolder, checkedMark, minusMark;
const Option = {
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  inject: ["instance"],
  name: "fancy-tree-treenode",
  computed: {
    shouldShowNode() {
      const { instance, node } = this;
      return instance.shouldShowNodeInDropdown(node);
    },
    shouldExpand() {
      const { instance, node } = this;
      return instance.shouldExpand(node);
    }
  },
  methods: {
    renderParentNode() {
      const { instance, node } = this;
      const nodeClass = {
        "fancy-tree__treenode-constainer": true,
        // "fancy-tree__treenode--selected": instance.isSelected(node),
        "fancy-tree__treenode--disabled": node.isDisabled,
        "fancy-tree__treenode--matched": node.isMatched,
        [`fancy-tree__indent-level-${node.level}`]: true,
        "fancy-tree__treenode--hide": !this.shouldShowNode
      };

      return (
        <div class={nodeClass} data-id={node.id}>
          {this.renderArrow()}
          <div
            class="fanct-tree__label-container"
            onmousedown={this.handleNodeClick}
          >
            {this.renderCheckBox()}
            <label class="fancy-tree__label">{node[instance.label]}</label>
          </div>
        </div>
      );
    },
    renderArrow() {
      const { instance, node } = this;
      if (node.isParent) {
        const arrowClass = {
          "fancy-tree__treenode-arrow": true,
          "fancy-tree__treenode-arrow--rotated": this.shouldExpand  
        };
        return (
          <div
            class="fancy-tree__treenode-arrow-container"
            onmousedown={this.handleArrowClick}
          >
            <ArrowIcon class={arrowClass} />
          </div>
        );
      }
      if (instance.hasParentNodes) {
        if (!arrowPlaceHolder) {
          arrowPlaceHolder = (
            <div class="fancy-tree__treenode-arrow-placeholder">&nbsp;</div>
          );
        }
        return arrowPlaceHolder;
      }

      return null;
    },
    handleArrowClick() {
      const { instance, node } = this;
      if (instance.localSearch.active) {
        node.isExpandedOnSearch = !node.isExpandedOnSearch;
      } else {
        node.isExpanded = !node.isExpanded;
      }
    },
    handleNodeClick() {
      const { instance, node } = this;
      instance.select(node);
    },
    renderCheckBox() {
      const { instance, node } = this;
      const checkedState = instance.forest.checkStateMap[node.id];
      const checkClass = {
        "fancy-tree__checkbox": true,
        "fancy-tree__checkbox--checked": checkedState == CHECKED,
        "fancy-tree__checkbox--unchecked": checkedState == UNCHECKED,
        "fancy-tree__checkbox--indeterminate": checkedState === INDETERMINATE,
        "fancy-tree__checkbox--disabled": node.isDisabled
      };
      if (!checkedMark) {
        checkedMark = <span class="fancy-tree__check-mark"></span>;
      }
      if (!minusMark) {
        minusMark = <span class="fancy-tree__minus-mark"></span>;
      }
      return (
        <div class="fancy-tree__checkbox-container">
          <span class={checkClass}>
            {checkedMark}
            {minusMark}
          </span>
        </div>
      );
    },
    renderChildrenNodes() {
      const { instance, node } = this;
      if(!this.shouldExpand){
        return null;
      }
      return node[instance.childKey].map(childNode => (
        <Option node={childNode} key={childNode.id} />
      ));
    },
    renderChildrenNodesList() {
      const { instance, node } = this;
      if (!node[instance.childKey].length) {
        return null;
      }
      return (
        <div class="fancy-tree__children-content">
          {this.renderChildrenNodes()}
        </div>
      );
    }
  },

  render() {
    const { node } = this;
    const listItemClass = {
      "fancy-tree__list-item": true
    };
    return (
      <div class={listItemClass}>
        {this.renderParentNode()}
        {node.isParent && this.renderChildrenNodesList()}
      </div>
    );
  }
};
export default Option;
</script>
