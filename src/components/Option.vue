<script>
import ArrowIcon from "./icons/Arrow";
import { UNCHECKED, CHECKED, INDETERMINATE } from "../contants";
import Loading from "./Loading";
import Tip from "./Tip";
let arrowPlaceHolder, checkedMark, minusMark;
const Option = {
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  inject: ["instance"],
  name: "fancy-select-treenode",
  computed: {
    shouldShowNode() {
      const { instance, node } = this;
      return instance.shouldShowNodeInDropdown(node);
    },
    shouldExpand() {
      const { instance, node } = this;
      return instance.shouldExpand(node);
    },
  },
  components: {
    Loading,
    Tip,
  },
  methods: {
    renderParentNode() {
      const { instance, node } = this;
      const nodeClass = {
        "fancy-select__treenode-container": true,
        // "fancy-select__treenode--selected": instance.isSelected(node),
        "fancy-select__treenode--disabled": node.isDisabled,
        "fancy-select__treenode--matched": node.isMatched,
        "fancy-select__treenode--selected": instance.isSelected(node),
        "fancy-select__treenode--isHighlighted": node.isHighlighted,
        "fancy-select__treenode--hide": !this.shouldShowNode,
      };

      return (
        <div
          class={nodeClass}
          data-id={node.id}
          onmouseenter={this.handleMouseEnterOption}
          onmousedown={this.handleNodeClick}
        >
          {this.renderArrow()}
          <div class="fancy-select__label-container">
            {this.renderCheckBox()}
            {this.renderLabel()}
            {this.renderLoadingChildrenTip()}
          </div>
        </div>
      );
    },
    renderLabel() {
      const { instance, node } = this;
      const customLabelRenderer = instance.$scopedSlots["option-label"];
      const labelClassName = "fancy-select__label";
      if (customLabelRenderer) {
        return customLabelRenderer({
          node,
          labelClassName,
        });
      }
      return <label class={labelClassName}>{node.label}</label>;
    },
    renderArrow() {
      const { instance, node } = this;
      if (node.isParent) {
        const arrowClass = {
          "fancy-select__treenode-arrow": true,
          "fancy-select__treenode-arrow--rotated": this.shouldExpand,
        };
        return (
          <div
            class="fancy-select__treenode-arrow-container"
            onmousedown={this.handleArrowClick}
          >
            <ArrowIcon class={arrowClass} />
          </div>
        );
      }
      if (instance.hasParentNodes) {
        if (!arrowPlaceHolder) {
          arrowPlaceHolder = (
            <div class="fancy-select__treenode-arrow-placeholder">&nbsp;</div>
          );
        }
        return arrowPlaceHolder;
      }

      return null;
    },

    renderNoChildrenTip() {
      const { instance, node } = this;

      if (!node.childrenStates.isLoaded || node.children.length) return null;

      return (
        <Tip type="no-children" icon="warning">
          {instance.noChildrenText}
        </Tip>
      );
    },
    handleArrowClick(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      let nextState;
      const { instance, node } = this;
      if (instance.localSearch.active) {
        nextState = node.isExpandedOnSearch = !node.isExpandedOnSearch;
      } else {
        nextState = node.isExpanded = !node.isExpanded;
      }
      if (nextState && !node.childrenStates.isLoaded) {
        instance.loadChildren(node.raw);
      }
    },
    handleNodeClick() {
      const { instance, node } = this;
      instance.select(node);
    },
    handleMouseEnterOption(evt) {
      const { instance, node } = this;
      if (evt.target !== evt.currentTarget) return;
      instance.setCurrentHighlightedOption(node, false);
    },
    renderCheckBox() {
      const { instance, node } = this;
      if (instance.single) {
        return null;
      }
      const checkedState = instance.forest.checkStateMap[node.id];
      const checkClass = {
        "fancy-select__checkbox": true,
        "fancy-select__checkbox--checked": checkedState == CHECKED,
        "fancy-select__checkbox--unchecked": checkedState == UNCHECKED,
        "fancy-select__checkbox--indeterminate": checkedState === INDETERMINATE,
        "fancy-select__checkbox--disabled": node.isDisabled,
      };
      if (!checkedMark) {
        checkedMark = <span class="fancy-select__check-mark"></span>;
      }
      if (!minusMark) {
        minusMark = <span class="fancy-select__minus-mark"></span>;
      }
      return (
        <div class="fancy-select__checkbox-container">
          <span class={checkClass}>
            {checkedMark}
            {minusMark}
          </span>
        </div>
      );
    },
    renderChildrenNodes() {
      const { node } = this;
      if (!this.shouldExpand) {
        return null;
      }
      if (!node.childrenStates.isLoaded) {
        return null;
      }

      return node.children.map((childNode) => (
        <Option node={childNode} key={childNode.id} />
      ));
    },
    renderChildrenNodesList() {
      if (!this.shouldExpand) return null;
      return (
        <div class="fancy-select__children-content">
          {this.renderNoChildrenTip()}
          {this.renderLoadingChildrenTip()}
          {this.renderChildrenNodes()}
        </div>
      );
    },
    renderLoadingChildrenTip() {
      const { node } = this;
      if (!node.isParent||node.isParent&&node.childrenStates&&!node.childrenStates.isLoading) {
        return null;
      }
      return <loading></loading>;
    },
  },

  render() {
    const { node } = this;
    const indentLevel = node.level;
    const listItemClass = {
      "fancy-select__list-item": true,

      [`fancy-select__indent-level-${indentLevel}`]: true,
    };
    return (
      <div class={listItemClass}>
        {this.renderParentNode()}
      </div>
    );
  },
};
export default Option;
</script>
