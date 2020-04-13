<template>
  <div ref="wrapper" :class="wrapperClass">
    <Controls ref="input-box" />
    <Dropdown ref="dropdown" />
  </div>
</template>
<script>
import Controls from "./Controls.vue";
import Dropdown from "./Dropdown.vue";
import createMap from "../utils/createMap.js";
import { onLeftClick } from "../utils/onLeftClick";

import {
  UNCHECKED,
  CHECKED,
  INDETERMINATE,
  INCLUDE_PARENT,
  INCLUDE_LEAF,
  ALL,
  ALL_WITH_INDETERMINATE
} from "../contants";
import { removeFromArray } from "../utils/removeFromArray";
import { includes } from "../utils/includes";
function stringifyOptionPropValue(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" && !isNaN(value)) return value + "";
  return "";
}
export default {
  name: "FancyTree",
  provide() {
    return {
      instance: this
    };
  },
  data() {
    return {
      dropdown: {
        isOpen: false
      },
      forest: {
        nodeMap: createMap(),
        checkStateMap: createMap(),
        selectedNodeMap: createMap(),
        selectedNodeIds: [],
        normalizedTreeData: []
      },
      controls: {
        searchQuery: "",
        isFocus: false
      },
      localSearch: {
        active: false,
        noResults: true,
        countMap: createMap()
      },

    };
  },
  props: {
    treeData: {
      type: Array
    },
    label: {
      type: String,
      default: "label"
    },
    childKey: {
      type: String,
      default: "children"
    },
    maxHeight: {
      type: Number,
      default: 300
    },
    matchKeys: {
      type: Array,
      default: () => ["label"]
    },
    includeValue: {
      type: String,
      default: INCLUDE_PARENT,
      validator: value => {
        const acceptableTypes = [
          INCLUDE_PARENT,
          INCLUDE_LEAF,
          ALL,
          ALL_WITH_INDETERMINATE
        ];
        return includes(acceptableTypes, value);
      }
    },
    noResultsText:{
      type:String,
      default(){
        return '暂无数据'
      }
    }
  },
  components: {
    Controls,
    Dropdown
  },
  computed: {
    wrapperClass() {
      return {
        "fancy-tree": true,
        "fancy-tree--open": this.dropdown.isOpen,
        "fancy-tree--searchable": this.searchable,
        "fancy-tree--has-value": this.hasValue
      };
    },
    selectedNodes() {
      return this.forest.selectedNodeIds.map(this.getNode);
    },
    hasParentNodes() {
      return this.forest.normalizedTreeData.some(rootNode => rootNode.isParent);
    },
    internalValues() {
      let internalValues;
      if (this.includeValue == ALL) {
        internalValues = this.forest.selectedNodeIds.slice();
      } else if (this.includeValue == INCLUDE_PARENT) {
        internalValues = this.forest.selectedNodeIds.filter(id => {
          const node = this.getNode(id);
          if (node.isRootNode) return true;
          // 返回父节点没有被选中的节点，因为如果父节点被选中，直接返回父节点就行了
          return !this.isSelected(node.parentNode);
        });
      }
      // 只返回子节点
      else if (this.includeValue == INCLUDE_LEAF) {
        internalValues = this.forest.selectedNodeIds.filter(id => {
          let node = this.getNode(id);
          if (node.isLeaf) {
            return true;
          }
          return node.children.length === 0;
        });
      } else if (this.includeValue == ALL_WITH_INDETERMINATE) {
        let indeterminateNodeIds = [];
        internalValues = this.forest.selectedNodeIds.slice();
        // 遍历每个选中的节点，判断它的祖先节点是否为中间状态
        this.selectedNodes.forEach(selectedNode => {
          selectedNode.ancestors.forEach(ancestor => {
            if (includes(indeterminateNodeIds, ancestor.id)) return;
            if (includes(internalValues, ancestor.id)) return;
            indeterminateNodeIds.push(ancestor.id);
          });
        });
        internalValues.push(...indeterminateNodeIds);
      }
      return internalValues;
    },
    hasValue() {
      return this.internalValues.length > 0;
    }
  },
  watch: {
    treeData: {
      handler() {
        this.initialize();
      },
      immediate: true,
      deep: true
    },
    "controls.searchQuery"() {
      this.handleLocalSearch();
    }
  },
  methods: {
    getNode(nodeId) {
      if (nodeId == null) {
        return null;
      }
      return nodeId in this.forest.nodeMap ? this.forest.nodeMap[nodeId] : null;
    },
    handleInputClick() {
      this.toggleDropdown();
    },
    handleClickOutside(evt) {
      // istanbul ignore else
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(evt.target)) {
        this.blurInput();
        this.closeDropdown();
      }
    },
    toggleClickOutsideEvent(enabled) {
      if (enabled) {
        document.addEventListener("mousedown", this.handleClickOutside, false);
      } else {
        document.removeEventListener(
          "mousedown",
          this.handleClickOutside,
          false
        );
      }
    },
    getDropdown() {
      const $dropdown = this.$refs.dropdown;
      return $dropdown && $dropdown.nodeName !== "#comment" ? $dropdown : null;
    },
    blurInput() {
      this.$refs["input-box"].$refs["input"].blur();
    },
    focusInput() {
      this.$refs["input-box"].$refs["input"].focus();
    },
    openDropdown() {
      this.dropdown.isOpen = true;
      this.toggleClickOutsideEvent(true);
    },
    closeDropdown() {
      // debugger;
      // this.dropdown.isOpen = false;
      // this.toggleClickOutsideEvent(false);
    },
    toggleDropdown() {
      if (!this.dropdown.isOpen) {
        this.openDropdown();
      } else {
        this.closeDropdown();
      }
    },
    handleMouseDown: onLeftClick(function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      this.focusInput();
    }),
    traverAllNodesByIndex(callback) {
      const walk = parentNode => {
        parentNode.children.forEach(child => {
          if (callback(child) !== false && child.isParent) {
            walk(child);
          }
        });
      };
      walk({ children: this.forest.normalizedTreeData });
    },
    isSelected(node) {
      return this.forest.selectedNodeMap[node.id] === true;
    },
    buildForestState() {
      const selectedNodeMap = createMap();
      this.forest.selectedNodeIds.forEach(selectedNodeId => {
        selectedNodeMap[selectedNodeId] = true;
      });
      this.forest.selectedNodeMap = selectedNodeMap;
      const checkStateMap = createMap();
      this.traverAllNodesByIndex(node => {
        checkStateMap[node.id] = UNCHECKED;
      });
      this.selectedNodes.forEach(selectedNode => {
        checkStateMap[selectedNode.id] = CHECKED;
        selectedNode.ancestors.forEach(ancestorNode => {
          if (!this.isSelected(ancestorNode)) {
            checkStateMap[ancestorNode.id] = INDETERMINATE;
          }
        });
      });
      this.forest.checkStateMap = checkStateMap;
    },
    initialize() {
      if (Array.isArray(this.treeData)) {
        const prevNodeMap = this.forest.nodeMap;
        this.forest.nodeMap = createMap();
        this.forest.normalizedTreeData = this.normalize(
          null,
          this.treeData,
          prevNodeMap
        );
        this.buildForestState();
      } else {
        this.forest.normalizedTreeData = [];
      }
    },
    match(needle, haystack) {
      return includes(haystack, needle);
    },
    shouldNodeBeIncludedInSearchResult(node) {
      if (node.isMatched) return true;
      if (node.isParent && node.hasMatchedDescendants) {
        return true;
      }
      if (!node.isRootNode && node.parentNode.showAllChildrenOnSearch) {
        return true;
      }
      return false;
    },
    shouldExpand(node) {
      return this.localSearch.active
        ? node.isExpandedOnSearch
        : node.isExpanded;
    },
    // 规范数据
    normalize(parentNode, nodes, prevNodeMap) {
      let normalizedTreeData = nodes.map(node => {
        const { id } = node;
        const label = node[this.label];
        const children = node[this.childKey];
        const isParent = Array.isArray(children);
        const isLeaf = !isParent;
        const isDisabled = !!node.isDisabled;
        const isRootNode = parentNode === null;
        const isDefaultExpanded = node.isDefaultExpanded;
        const level = isRootNode ? 0 : parentNode.level + 1;
        const lowerCased = this.matchKeys.reduce(
          (prev, key) => ({
            ...prev,
            [key]: stringifyOptionPropValue(node[key])
          }),
          {}
        );
        const nestedSearchLabel = isRootNode
          ? lowerCased.label
          : parentNode.nestedSearchLabel + " " + lowerCased.label;

        let normalizedNode = this.$set(this.forest.nodeMap, id, createMap());
        this.$set(normalizedNode, "id", id);
        this.$set(normalizedNode, this.label, label);
        this.$set(normalizedNode, "level", level);
        this.$set(normalizedNode, "isParent", isParent);
        this.$set(normalizedNode, "isLeaf", isLeaf);
        this.$set(normalizedNode, "isRootNode", isRootNode);
        this.$set(normalizedNode, "parentNode", parentNode);
        this.$set(normalizedNode, "isMatched", false);
        this.$set(normalizedNode, "nestedSearchLabel", nestedSearchLabel);
        this.$set(normalizedNode, "lowerCased", lowerCased);
        this.$set(
          normalizedNode,
          "ancestors",
          isRootNode ? [] : [parentNode].concat(parentNode.ancestors)
        );
        this.$set(normalizedNode, "isDisabled", isDisabled);

        if (isParent) {
          this.$set(normalizedNode, "count", {
            all_children: 0,
            leaf_children: 0,
            all_descendant: 0,
            leaf_descendant: 0
          });
          this.$set(normalizedNode, "hasMatchedDescendants", false);
          this.$set(normalizedNode, "hasDisabledDescendants", false);
          this.$set(normalizedNode, "isExpandedOnSearch", false);
          this.$set(normalizedNode, "showAllChildrenOnSearch", false);
          this.$set(
            normalizedNode,
            "isExpanded",
            typeof isDefaultExpanded === "boolean"
              ? isDefaultExpanded
              : level < this.defaultExpandLevel
          );
          this.$set(
            normalizedNode,
            this.childKey,
            this.normalize(normalizedNode, children, prevNodeMap)
          );
          if (isDefaultExpanded === true) {
            normalizedNode.ancestors.forEach(ancestor => {
              ancestor.isExpanded = true;
            });
          }
        }
        normalizedNode.ancestors.forEach(
          parent => parent.count.all_descendant++
        );
        if (isLeaf) {
          normalizedNode.ancestors.forEach(
            parent => parent.count.leaf_descendant++
          );
        }
        if (!isRootNode) {
          parentNode.count.all_children++;
          parentNode.count.leaf_children++;
        }

        return normalizedNode;
      });
      return normalizedTreeData;
    },
    select(node) {
      const nextState = !this.forest.checkStateMap[node.id];
      if (nextState) {
        this._selectNode(node);
      } else {
        this._deselectNode(node);
      }
      this.buildForestState();
    },
    _selectNode(node) {
      // 子节点处理方法
      // 判断子节点是否全部选中

      if (node.isLeaf) {
        this.addValue(node);
      }
      // 父节点处理方法
      if (node.isParent) {
        this.addValue(node);
        this.traverseDescendantsBFS(node, descendant => {
          if (!descendant.isDisabled) {
            this.addValue(descendant);
          }
        });
      }
      let curr = node;
      while ((curr = curr.parentNode) !== null) {
        // 如果不等于null
        // 判断子节点是否已经全选了
        // 如果全选了，则选中
        if (curr.children.every(this.isSelected)) {
          this.addValue(curr);
        } else {
          break;
        }
      }
    },
    _deselectNode(node) {
      this.forest.checkStateMap[node.id] = UNCHECKED;
      let hasUncheckedDescenant = false;
      if (node.isParent) {
        this.traverseDescendantsBFS(node, descendant => {
          if (!descendant.isDisabled) {
            this.removeValue(descendant);
            hasUncheckedDescenant = true;
          }
        });
      }
      if (node.isLeaf || hasUncheckedDescenant) {
        this.removeValue(node);
        let curr = node;
        while ((curr = curr.parentNode) !== null) {
          if (this.isSelected(curr)) {
            this.removeValue(curr);
          } else {
            break;
          }
        }
      }
    },
    addValue(node) {
      this.forest.selectedNodeIds.push(node.id);
      this.forest.selectedNodeMap[node.id] = true;
    },
    removeValue(node) {
      removeFromArray(this.forest.selectedNodeIds, node.id);
      delete this.forest.selectedNodeMap[node.id];
    },
    traverseDescendantsBFS(parentNode, callback) {
      if (!parentNode.isParent) return;
      // 队列实现BFS
      const queue = parentNode.children.slice();
      while (queue.length) {
        let curr = queue[0];
        if (curr.isParent) {
          queue.push(...curr.children);
        }
        callback(curr);
        queue.shift();
      }
    },

    traverseAllNodesDFS(callback) {
      this.forest.normalizedTreeData.forEach(rootNode => {
        this.traverseDescendantsDFS(rootNode, callback);
        callback(rootNode);
      });
    },
    traverseDescendantsDFS(parentNode, callback) {
      if (!parentNode.isParent) return;
      parentNode.children.forEach(child => {
        this.traverseDescendantsDFS(child, callback);
        callback(child);
      });
    },
    handleLocalSearch() {
      const { searchQuery } = this.controls;
      const done = () => {};
      if (!searchQuery) {
        this.localSearch.active = false;
        return done();
      }
      this.localSearch.active = true;
      this.localSearch.noResults = true;
      // 深的节点优先遍历
      this.traverseAllNodesDFS(node => {
        if (node.isParent) {
          node.isExpandedOnSearch = false;
          node.showAllChildrenOnSearch = false;
          node.isMatched = false;
          node.hasMatchedDescendants = false;
          this.$set(this.localSearch.countMap, node.id, {
            all_children: 0,
            all_descendant: 0,
            leaf_children: 0,
            leaf_descendant: 0
          });
        }
      });
      const lowerCasedSearchQuery = searchQuery.trim().toLocaleLowerCase();

      const splitSearchQuery = lowerCasedSearchQuery
        .replace(/\s+/g, " ")
        .split(" ");
      this.traverseAllNodesDFS(node => {
        // 以空格分割
        if (splitSearchQuery.length > 1) {
          node.isMatched = splitSearchQuery.every(filterValue =>
            //  TODO 模糊搜索
            this.match(filterValue, node.nestedSearchLabel)
          );
        } else {
          node.isMatched = this.matchKeys.some(matchKey =>
            this.match(lowerCasedSearchQuery, node.lowerCased[matchKey])
          );
        }
        if (node.isMatched) {
          this.localSearch.noResults = false;
          node.ancestors.forEach(ancestor => {
            this.localSearch.countMap[ancestor.id]["all_descendant"]++;
          });
          if (node.isLeaf) {
            node.ancestors.forEach(ancestor => {
              this.localSearch.countMap[ancestor.id]["leaf_descendant"]++;
            });
          }
          if (node.parentNode !== null) {
            this.localSearch.countMap[node.parentNode.id]["all_children"] += 1;
            if (node.isLeaf) {
              this.localSearch.countMap[node.parentNode.id][
                "leaf_children"
              ] += 1;
            }
          }
        }
        if (
          (node.isMatched || (node.isParent && node.isExpandedOnSearch)) &&
          node.parentNode !== null
        ) {
          node.parentNode.isExpandedOnSearch = true;
          node.parentNode.hasMatchedDescendants = true;
        }
      });
    },
    shouldShowNodeInDropdown(node) {
      if (
        this.localSearch.active &&
        !this.shouldNodeBeIncludedInSearchResult(node)
      ) {
        return false;
      }
      return true;
    }
  }
};
</script>
