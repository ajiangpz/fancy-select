<template>
  <div ref="wrapper" :class="wrapperClass">
    <Controls ref="inputBox" />
    <Dropdown ref="dropdown" />
  </div>
</template>
<script>
/* eslint-disable */
import Controls from "./Controls.vue";
import Dropdown from "./Dropdown.vue";
import createMap from "../utils/createMap.js";
import { onLeftClick } from "../utils/onLeftClick";
import { quickDiff } from "../utils/quickDiff";
import { isPromise } from "../utils/isPromise";
import { once } from "../utils/once";
import { scrollIntoView } from "../utils/scrollIntoView";
import {
  UNCHECKED,
  CHECKED,
  INDETERMINATE,
  INCLUDE_PARENT,
  INCLUDE_LEAF,
  ALL,
  ALL_WITH_INDETERMINATE,
} from "../contants";
import { removeFromArray } from "../utils/removeFromArray";
import { includes } from "../utils/includes";
function stringifyOptionPropValue(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" && !isNaN(value)) return value + "";
  return "";
}
function getErrorMessage(err) {
  return err.message || /* istanbul ignore next */ String(err);
}
function createChildrenStates() {
  return {
    isLoading: false,
    isLoaded: false,
    loadingErr: "",
  };
}
export default {
  name: "FancySelect",
  provide() {
    return {
      instance: this,
    };
  },
  data() {
    return {
      dropdown: {
        isOpen: false,
        current: null,
      },
      forest: {
        nodeMap: createMap(),
        checkStateMap: createMap(),
        selectedNodeMap: createMap(),
        selectedNodeIds: [],
        normalizedTreeData: [],
        flattenTree: [],
      },
      controls: {
        searchQuery: "",
        isFocus: false,
      },
      localSearch: {
        active: false,
        noResults: true,
        countMap: createMap(),
      },
      rootOptionsStates: createChildrenStates(),
    };
  },
  props: {
    value: null,
    treeData: {
      type: Array,
    },
    label: {
      type: String,
      default: "label",
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: true,
    },
    maxHeight: {
      type: Number,
      default: 300,
    },
    matchKeys: {
      type: Array,
      default: () => ["label"],
    },
    includeValue: {
      type: String,
      default: INCLUDE_PARENT,
      validator: (value) => {
        const acceptableTypes = [
          INCLUDE_PARENT,
          INCLUDE_LEAF,
          ALL,
          ALL_WITH_INDETERMINATE,
        ];
        return includes(acceptableTypes, value);
      },
    },
    noResultsText: {
      type: String,
      default() {
        return "暂无数据";
      },
    },
    loadOptions: {
      type: Function,
    },
    noChildrenText: {
      type: String,
      default() {
        return "暂无子节点";
      },
    },
    loadingText: {
      type: String,
      default() {
        return "正在加载...";
      },
    },
    placeHolder: {
      type: String,
      default() {
        return "请选择数据...";
      },
    },
    disableBranchNodes: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
      default: Infinity,
    },
    limitText: {
      type: Function,
      default: function limitTextDefault(count) {
        return `+ ${count}`;
      },
    },
    normalizer: {
      type: Function,
      default: function(node) {
        return {
          id: node.id,
          label: node.label,
          children: node.children,
        };
      },
    },
    defaultExpandLevel: {
      type: Number,
      default: 0,
    },
    valueKey: {
      type: String,
      default: "id",
    },
  },
  components: {
    Controls,
    Dropdown,
  },
  computed: {
    wrapperClass() {
      return {
        "fancy-select": true,
        "fancy-select--open": this.dropdown.isOpen,
        "fancy-select--searchable": this.searchable,
        "fancy-select--has-value": this.hasValue,
        "fancy-select--single": this.single,
        "fancy-select--multi": this.multiple,
        "fancy-select--isFocused": this.controls.isFocus,
      };
    },
    selectedNodes() {
      return this.forest.selectedNodeIds.map(this.getNode);
    },
    hasParentNodes() {
      return this.forest.normalizedTreeData.some(
        (rootNode) => rootNode.isParent
      );
    },
    internalValues() {
      let internalValues;
      if (this.includeValue == ALL || this.single) {
        internalValues = this.forest.selectedNodeIds.slice();
      } else if (this.includeValue == INCLUDE_PARENT) {
        internalValues = this.forest.selectedNodeIds.filter((id) => {
          const node = this.getNode(id);
          if (node.isRootNode) return true;
          // 返回父节点没有被选中的节点，因为如果父节点被选中，直接返回父节点就行了
          return !this.isSelected(node.parentNode);
        });
      }
      // 只返回子节点
      else if (this.includeValue == INCLUDE_LEAF) {
        internalValues = this.forest.selectedNodeIds.filter((id) => {
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
        this.selectedNodes.forEach((selectedNode) => {
          selectedNode.ancestors.forEach((ancestor) => {
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
    },
    single() {
      return !this.multiple;
    },
    visibleOptionIds() {
      const visibleOptionIds = [];
      this.traverAllNodesByIndex((node) => {
        if (
          !this.localSearch.active ||
          this.shouldNodeBeIncludedInSearchResult(node)
        ) {
          visibleOptionIds.push(node.id);
        }
        // 如果不需要展开父节点，那么不需要遍历父节点下面的子节点
        if (node.isParent && !this.shouldExpand(node)) {
          return false;
        }
      });
      return visibleOptionIds;
    },
    hasVisibleOptions() {
      return this.visibleOptionIds.length !== 0;
    },
    totalNode() {
      return Object.keys(this.forest.nodeMap).length;
    },
  },
  watch: {
    treeData: {
      handler() {
        this.initialize();
        this.rootOptionsStates.isLoaded = Array.isArray(this.treeData);
      },
      immediate: true,
      deep: true,
    },

    "controls.searchQuery"() {
      this.handleLocalSearch();
    },
    internalValues(newValue, oldValue) {
      const hasChanged = quickDiff(newValue, oldValue);
      if (hasChanged) {
        this.$emit("input", this.getValue());
      }
    },
    value: {
      handler() {
        const nodeIdsFromValue = this.extractCheckedNodeIdsFromValue();
        const hasChanged = quickDiff(nodeIdsFromValue, this.internalValues);
        // console.log(nodeIdsFromValue,this.internalValue)
        if (hasChanged) this.fixSelectedNodeIds(nodeIdsFromValue);
      },
      immediate: true,
    },
  },
  created() {
    this.resetFlags();
  },
  methods: {
    // 调用传入的loadOptions函数，
    // 因为传入的函数有加载子节点，加载根节点等
    // 因此通过这个这个函数来决定调用是应该如何执行
    callLoadOptionsFn({ action, args, isPending, start, succeed, fail, end }) {
      if (!this.loadOptions || isPending()) {
        return;
      }
      start();
      // once函数生产一个回调函数，该函数只执行一次
      // 执行多次只返回第一次的结果
      const callback = once((err, result) => {
        if (err) {
          fail(err);
        } else {
          succeed(result);
        }
        end();
      });
      const result = this.loadOptions({
        action,
        ...args,
        callback,
      });
      if (isPromise(result)) {
        result
          .then(
            () => {
              callback();
            },
            (err) => {
              callback(err);
            }
          )
          .catch((err) => {
            console.error(err);
          });
      }
    },
    // 点击父节点 异步加载子节点
    loadChildren(parentNode) {
      const { id } = parentNode;
      this.callLoadOptionsFn({
        action: "LOAD_CHILDREN_OPTIONS",
        args: {
          parentNode,
        },
        isPending: () => {
          return this.getNode(id).childrenStates.isLoading;
        },
        start: () => {
          this.getNode(id).childrenStates.isLoading = true;
          this.getNode(id).childrenStates.loadingErr = "";
        },
        succeed: () => {
          this.getNode(id).childrenStates.isLoaded = true;
        },
        fail: (err) => {
          this.getNode(id).childrenStates.loadingError = getErrorMessage(err);
        },
        end: () => {
          this.getNode(id).childrenStates.isLoading = false;
        },
      });
    },
    // 根据id获取node节点
    getNode(nodeId) {
      if (nodeId == null) {
        return null;
      }
      return nodeId in this.forest.nodeMap ? this.forest.nodeMap[nodeId] : null;
    },
    // 获取选中的数据，返回原始的数据
    getValue() {
      const rowNodes = this.internalValues.map((id) => {
        let raw = this.getNode(id).raw;
        return this.valueKey ? raw[this.valueKey] : raw;
      });
      return this.multiple ? rowNodes : rowNodes[0];
    },
    getLast(arr) {
      const length = arr ? arr.length : 0;
      return length ? arr[length - 1] : undefined;
    },
    removeLastValue() {
      if (!this.hasValue) {
        return;
      }
      if (this.single) return this.clear();
      const lastValue = this.getLast(this.internalValues);
      const lastSelectedNode = this.getNode(lastValue);
      this.select(lastSelectedNode);
    },
    handleInputClick() {
      if (!this.dropdown.isOpen) {
        this.openDropdown();
      }
      this.focusInput();
      // this.toggleDropdown();
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
      const $dropdown = document.querySelector(".vue-recycle-scroller");
      // console.log($dropdown);
      return $dropdown && $dropdown.nodeName !== "#comment" ? $dropdown : null;
    },
    blurInput() {
      this.$refs["inputBox"].$refs["input"].blur();
    },
    focusInput() {
      this.$refs["inputBox"].$refs["input"].focus();
    },
    openDropdown() {
      this.dropdown.isOpen = true;
      this.$nextTick(this.resetHighlightedOptionWhenNecessary());
      this.$nextTick(() => {
        this.scrollToPrevPosition();
      });
      this.toggleClickOutsideEvent(true);
    },
    closeDropdown() {
      this.saveCurrentPosition();

      this.$nextTick(() => {
        this.dropdown.isOpen = false;
      });
      this.toggleClickOutsideEvent(false);
      this.resetSearchQuery();
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
      if (
        this.$refs["inputBox"].$refs["valueContainer"].contains(evt.target) &&
        !this.dropdown.isOpen
      ) {
        this.openDropdown();
      }
      if (this._blurOnSelect) {
        this.blurInput();
      } else {
        this.focusInput();
      }
      this.resetFlags();
    }),
    resetFlags() {
      this._blurOnSelect = false;
    },
    traverAllNodesByIndex(callback) {
      const walk = (parentNode) => {
        parentNode.children.forEach((child) => {
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
      this.forest.selectedNodeIds.forEach((selectedNodeId) => {
        selectedNodeMap[selectedNodeId] = true;
      });
      this.forest.selectedNodeMap = selectedNodeMap;
      const checkStateMap = createMap();
      this.traverAllNodesByIndex((node) => {
        checkStateMap[node.id] = UNCHECKED;
      });
      this.selectedNodes.forEach((selectedNode) => {
        checkStateMap[selectedNode.id] = CHECKED;
        selectedNode.ancestors.forEach((ancestorNode) => {
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
        this.fixSelectedNodeIds(this.internalValues);
        this.buildForestState();
        this.flattenTree = this.flattenForest(this.forest.normalizedTreeData);
      } else {
        this.forest.normalizedTreeData = [];
      }
    },
    flattenForest(normalizedTreeData) {
      const flattenTree = [];
      // 如果要扁平化一个树，需要深度优先遍历每个节点才能按照原本的顺序展示这一个树
      normalizedTreeData.forEach((node) => {
        flattenTree.push(node);
        this.traverseDescendantsDFS(node, function(node) {
          flattenTree.push(node);
        });
      });
      return flattenTree;
    },
    fixSelectedNodeIds(prevSelectedNodeIds) {
      console.log(prevSelectedNodeIds);
      let nextSelectedNodeIds = [];
      if (this.single || this.includeValue === ALL) {
        nextSelectedNodeIds = prevSelectedNodeIds;
      } else if (this.includeValue === INCLUDE_PARENT) {
        prevSelectedNodeIds.forEach((nodeId) => {
          nextSelectedNodeIds.push(nodeId);
          const node = this.getNode(nodeId);
          if (node.isParent) {
            this.traverseDescendantsBFS(node, (descendant) => {
              nextSelectedNodeIds.push(descendant.id);
            });
          }
        });
      } else if (this.includeValue === INCLUDE_LEAF) {
        const map = createMap();
        const queue = prevSelectedNodeIds.slice();
        while (queue.length) {
          const nodeId = queue.shift();

          nextSelectedNodeIds.push(nodeId);
          const node = this.getNode(nodeId);
          if (node.isRootNode) continue;
          if (map[node.parentNode.id]) {
            map[node.parentNode.id] = node.parentNode.children.length;
          }
          if (--map[node.parentNode.id] === 0) {
            nextSelectedNodeIds.push(node.parentNode.id);
          }
        }
      } else if (this.includeValue === ALL_WITH_INDETERMINATE) {
        const map = createMap();
        const queue = prevSelectedNodeIds.filter((nodeId) => {
          const node = this.getNode(nodeId);
          return node.isLeaf || node.children.length;
        });
        while (queue.length) {
          const nodeId = queue.shift();
          nextSelectedNodeIds.push(nodeId);
          const node = this.getNode(nodeId);
          if (node.isRootNode) continue;
          if (map[node.parentNode.id]) {
            map[node.parentNode.id] = node.parentNode.children.length;
          }
          if (--map[node.parentNode.id] === 0) {
            nextSelectedNodeIds.push(node.parentNode.id);
          }
        }
      }
      const hasChanged = quickDiff(
        this.forest.selectedNodeIds,
        nextSelectedNodeIds
      );
      console.log(hasChanged);
      if (hasChanged) {
        this.forest.selectedNodeIds = nextSelectedNodeIds;
      }
      this.buildForestState();
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
      let normalizedTreeData = nodes
        .map((node) => [this.enhancedNormalizer(node), node])
        .map(([node, raw]) => {
          const { id } = node;
          const label = node.label;
          const children = node.children;
          const isParent =
            (Array.isArray(children) && children.length > 0) || node.isParent;
          const isLeaf = !isParent;
          const isDisabled = !!node.isDisabled;
          const isRootNode = parentNode === null;
          const isDefaultExpanded = node.isDefaultExpanded;
          const level = isRootNode ? 0 : parentNode.level + 1;
          const lowerCased = this.matchKeys.reduce(
            (prev, key) => ({
              ...prev,
              [key]: stringifyOptionPropValue(node[key]),
            }),
            {}
          );
          const nestedSearchLabel = isRootNode
            ? lowerCased.label
            : parentNode.nestedSearchLabel + " " + lowerCased.label;

          let normalizedNode = this.$set(this.forest.nodeMap, id, createMap());
          this.$set(normalizedNode, "id", id);
          this.$set(normalizedNode, "label", label);
          this.$set(normalizedNode, "level", level);
          this.$set(normalizedNode, "isParent", isParent);
          this.$set(normalizedNode, "isLeaf", isLeaf);
          this.$set(normalizedNode, "isRootNode", isRootNode);
          this.$set(normalizedNode, "parentNode", parentNode);
          this.$set(normalizedNode, "isMatched", false);
          this.$set(normalizedNode, "nestedSearchLabel", nestedSearchLabel);
          this.$set(normalizedNode, "isHighlighted", false);
          this.$set(normalizedNode, "lowerCased", lowerCased);
          this.$set(normalizedNode, "raw", raw);
          this.$set(
            normalizedNode,
            "ancestors",
            isRootNode ? [] : [parentNode].concat(parentNode.ancestors)
          );
          this.$set(normalizedNode, "isDisabled", isDisabled);

          if (isParent) {
            const isLoaded = Array.isArray(children);
            this.$set(normalizedNode, "childrenStates", {
              ...createChildrenStates(),
              isLoaded,
            });
            this.$set(normalizedNode, "count", {
              all_children: 0,
              leaf_children: 0,
              all_descendant: 0,
              leaf_descendant: 0,
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
              "children",
              isLoaded
                ? this.normalize(normalizedNode, children, prevNodeMap)
                : []
            );
            if (isDefaultExpanded === true) {
              normalizedNode.ancestors.forEach((ancestor) => {
                ancestor.isExpanded = true;
              });
            }
          }
          normalizedNode.ancestors.forEach(
            (parent) => parent.count.all_descendant++
          );
          if (isLeaf) {
            normalizedNode.ancestors.forEach(
              (parent) => parent.count.leaf_descendant++
            );
          }
          if (!isRootNode) {
            parentNode.count.all_children++;
            parentNode.count.leaf_children++;
          }
          // Preserve previous states.
          if (prevNodeMap && prevNodeMap[id]) {
            const prev = prevNodeMap[id];

            normalizedNode.isMatched = prev.isMatched;
            normalizedNode.showAllChildrenOnSearch =
              prev.showAllChildrenOnSearch;
            normalizedNode.isHighlighted = prev.isHighlighted;

            if (prev.isParent && normalizedNode.isParent) {
              normalizedNode.isExpanded = prev.isExpanded;
              normalizedNode.isExpandedOnSearch = prev.isExpandedOnSearch;
              if (
                prev.childrenStates.isLoaded &&
                !normalizedNode.childrenStates.isLoaded
              ) {
                normalizedNode.isExpanded = false;
              } else {
                normalizedNode.childrenStates = { ...prev.childrenStates };
              }
            }
          }
          return normalizedNode;
        });
      return normalizedTreeData;
    },
    clear() {
      if (this.hasValue) {
        if (this.single) {
          this.forest.selectedNodeIds = [];
        } else {
          this.forest.selectedNodeIds = this.forest.selectedNodeIds.filter(
            (nodeID) => this.getNode(nodeID).isDisabled
          );
        }
        this.buildForestState();
      }
    },
    select(node) {
      if (this.single) {
        this.clear();
      }
      const nextState = this.multiple
        ? this.forest.checkStateMap[node.id] === UNCHECKED
        : !this.isSelected(node);
      if (nextState) {
        this._selectNode(node);
      } else {
        this._deselectNode(node);
      }
      this.buildForestState();
      if (this.localSearch.active && nextState && this.single) {
        this.resetSearchQuery();
      }
      if (this.single) {
        this._blurOnSelect = true;
        // this.closeDropdown();
      }
    },
    _selectNode(node) {
      // 子节点处理方法
      // 判断子节点是否全部选中
      if (this.single) {
        return this.addValue(node);
      }
      if (node.isLeaf) {
        this.addValue(node);
      }

      // 父节点处理方法
      if (node.isParent) {
        this.addValue(node);
        this.traverseDescendantsBFS(node, (descendant) => {
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
        this.traverseDescendantsBFS(node, (descendant) => {
          if (!descendant.isDisabled) {
            this.removeValue(descendant);
            hasUncheckedDescenant = true;
          }
        });
      }

      if (node.isLeaf || hasUncheckedDescenant || node.children.length === 0) {
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
    saveCurrentPosition() {
      this._scrollPosition = this.getDropdown().scrollTop;
    },
    scrollToPrevPosition() {
      this.getDropdown().scrollTop = this._scrollPosition;
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
      this.forest.normalizedTreeData.forEach((rootNode) => {
        this.traverseDescendantsDFS(rootNode, callback);
        callback(rootNode);
      });
    },
    traverseDescendantsDFS(parentNode, callback) {
      if (!parentNode.isParent) return;
      parentNode.children.forEach((child) => {
        this.traverseDescendantsDFS(child, callback);
        callback(child);
      });
    },
    traverseAllNodesByIndex(callback) {
      const walk = (parentNode) => {
        parentNode.children.forEach((child) => {
          if (callback(child) !== false && child.isParent) {
            walk(child);
          }
        });
      };
      walk({ children: this.forest.normalizedTreeData });
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
      this.traverseAllNodesDFS((node) => {
        if (node.isParent) {
          node.isExpandedOnSearch = false;
          node.showAllChildrenOnSearch = false;
          node.isMatched = false;
          node.hasMatchedDescendants = false;
          this.$set(this.localSearch.countMap, node.id, {
            all_children: 0,
            all_descendant: 0,
            leaf_children: 0,
            leaf_descendant: 0,
          });
        }
      });
      const lowerCasedSearchQuery = searchQuery.trim().toLocaleLowerCase();

      const splitSearchQuery = lowerCasedSearchQuery
        .replace(/\s+/g, " ")
        .split(" ");
      this.traverseAllNodesDFS((node) => {
        // 以空格分割
        if (splitSearchQuery.length > 1) {
          node.isMatched = splitSearchQuery.every((filterValue) =>
            //  TODO 模糊搜索
            this.match(filterValue, node.nestedSearchLabel)
          );
        } else {
          node.isMatched = this.matchKeys.some((matchKey) =>
            this.match(lowerCasedSearchQuery, node.lowerCased[matchKey])
          );
        }
        if (node.isMatched) {
          this.localSearch.noResults = false;
          node.ancestors.forEach((ancestor) => {
            this.localSearch.countMap[ancestor.id]["all_descendant"]++;
          });
          if (node.isLeaf) {
            node.ancestors.forEach((ancestor) => {
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
    resetSearchQuery() {
      this.controls.searchQuery = "";
    },
    shouldShowNodeInDropdown(node) {
      if (
        this.localSearch.active &&
        !this.shouldNodeBeIncludedInSearchResult(node)
      ) {
        return false;
      }
      return true;
    },
    resetHighlightedOptionWhenNecessary(forceReset = false) {
      const { current } = this.dropdown;
      if (forceReset || current == null || !(current in this.forest.nodeMap)) {
        this.highlightFirstOption();
      }
      // else {
      // const $current = document.querySelector(
      // `.fancy-select__treenode-container[data-id="${current}"]"`
      // );
      // const $dropdown = this.getDropdown();
      // scrollIntoView($dropdown, $current.parentNode.parentNode);
      //
      // this.setCurrentHighlightedOption(this.getNode(current))
      // }
    },
    setCurrentHighlightedOption(node, scroll = true) {
      const prev = this.dropdown.current;
      if (prev != null && prev in this.forest.nodeMap) {
        this.forest.nodeMap[prev].isHighlighted = false;
      }
      this.dropdown.current = node.id;
      node.isHighlighted = true;
      if (this.dropdown.isOpen && scroll) {
        const scrollFn = () => {
          const $dropdown = this.getDropdown();
          const $option = document.querySelector(
            `.fancy-select__treenode-container[data-id="${node.id}"]`
          );

          if ($option) {
            scrollIntoView($dropdown, $option.parentNode.parentNode);
          }
        };
        if (this.getDropdown()) {
          scrollFn();
        } else {
          this.$nextTick(() => {
            scrollFn();
          });
        }
      }
    },
    highlightFirstOption() {
      // console.log("-------highlight-first-options-------")
      if (!this.hasVisibleOptions) return;
      const first = this.visibleOptionIds[0];
      this.setCurrentHighlightedOption(this.getNode(first));
    },
    highlightNextOption() {
      // console.log(this.$refs);
      if (!this.visibleOptionIds.length) return;
      const next = this.visibleOptionIds.indexOf(this.dropdown.current) + 1;
      if (next === this.visibleOptionIds.length) {
        // this.$refs.dropdown.$refs.scroller.scrollToItem(0);
        this.getDropdown().scrollTop = 0;
        return this.highlightFirstOption();
      }
      this.setCurrentHighlightedOption(
        this.getNode(this.visibleOptionIds[next])
      );
    },
    highlightPrevOption() {
      if (!this.visibleOptionIds.length) return;
      const prev = this.visibleOptionIds.indexOf(this.dropdown.current) - 1;
      if (prev == -1) {
        this.getDropdown().scrollTop = this.getDropdown().scrollHeight;
        return this.highlightedLastOption();
      }
      this.setCurrentHighlightedOption(
        this.getNode(this.visibleOptionIds[prev])
      );
    },
    highlightedLastOption() {
      // console.log("-------highlight-last-options-------")
      if (!this.hasVisibleOptions) return;
      const last = this.getLast(this.visibleOptionIds);
      this.setCurrentHighlightedOption(this.getNode(last));
    },
    toggleExpanded(node) {
      let nextState;
      if (this.localSearch.active) {
        nextState = node.isExpandedOnSearch = !node.isExpandedOnSearch;
        if (nextState) node.showAllChildrenOnSearch = true;
      } else {
        nextState = node.isExpanded = !node.isExpanded;
      }
      if (nextState && !node.childrenStates.isLoaded) {
        this.loadChildren(node.raw);
      }
    },
    enhancedNormalizer(raw) {
      return {
        ...raw,
        ...this.normalizer(raw),
      };
    },
    extractCheckedNodeIdsFromValue() {
      if (this.value == null) return [];

      if (this.valueKey === "id") {
        return this.multiple ? this.value.slice() : [this.value];
      }

      return (this.multiple ? this.value : [this.value])
        .map((node) =>
          typeof node === "object"
            ? this.enhancedNormalizer(node)
            : { id: node }
        )
        .map((node) => node.id);
    },
  },
};
</script>
