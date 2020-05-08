<template>
  <div class="fanct-tree__dropdown-container" v-if="instance.dropdown.isOpen">
    <div
      ref="dropdown"
      class="fancy-select__dropdown"
      @mousedown="instance.handleMouseDown"
    >
      <template v-if="instance.localSearch.active">
        <Tip
          type="no-results"
          icon="warning"
          v-if="instance.localSearch.noResults"
        >
          {{ instance.noResultsText }}
        </Tip>

        <RecycleScroller
          class="scroller"
          :items="instance.visibleOptionIds.map((id) => instance.getNode(id))"
          :item-size="32"
          key-field="id"
          ref="scroller"
          v-slot="{ item }"
        >
        
          <Option :node="item" :key="item.id"></Option>
        </RecycleScroller>
      </template>
      <template v-else>
        <Tip
          type="no-results"
          icon="warning"
          v-if="
            instance.rootOptionsStates.isLoaded &&
              instance.treeData.length === 0
          "
        >
          {{ instance.noResultsText }}
        </Tip>

        <RecycleScroller
          class="scroller"
          :items="instance.visibleOptionIds.map((id) => instance.getNode(id))"
          :item-size="32"
          key-field="id"
          v-slot="{ item }"
        >
          <Option :node="item" :key="item.id"></Option>
        </RecycleScroller>
      </template>
    </div>
  </div>
</template>
<script>
import Option from "./Option.vue";
import Tip from "./Tip";
import Vue from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
Vue.component("RecycleScroller", RecycleScroller);
export default {
  inject: ["instance"],
  computed: {
    dropdownStyle() {
      const { instance } = this;

      return {
        maxHeight: instance.maxHeight + "px",
      };
    },
  },
  components: {
    Option,
    Tip,
  },
  methods: {
    renderNoResultsTip() {
      const { instance } = this;
      return (
        <Tip type="no-results" icon="warning">
          {instance.noResultsText}
        </Tip>
      );
    },
    renderLocalSearchDropdown() {
      const { instance } = this;
      if (instance.localSearch.noResults) {
        return this.renderNoResultsTip();
      } else {
        return this.renderTreeNodeList();
      }
    },
    renderNormalDropdown() {
      const { instance } = this;
      if (
        instance.rootOptionsStates.isLoaded &&
        instance.treeData.length === 0
      ) {
        return this.renderNoResultsTip();
      }
      return this.renderTreeNodeList();
    },
    // renderTreeNodeList() {
    //   const { instance } = this;
    //   const scopedSlots = {
    //     item: (item) => <Option node={item} key={item.id}></Option>,
    //   };
    //   return (
    //     <div class="fancy-select__list">
    //       <RecycleScroller
    //         class="scroller"
    //         items={instance.visibleOptionIds.map((id) => instance.getNode(id))}
    //         item-size={32}
    //         key-field="id"
    //       >
    //         <Option scopedSlots></Option>
    //       </RecycleScroller>
    //     </div>
    //   );
    // },
    renderDropdown() {
      const { instance } = this;
      const dropdownClass = {
        "fancy-select__dropdown": true,
      };
      return (
        <div
          ref="dropdown"
          class={dropdownClass}
          style={this.dropdownStyle}
          onmousedown={instance.handleMouseDown}
        >
          {instance.localSearch.active
            ? this.renderLocalSearchDropdown()
            : this.renderNormalDropdown()}
        </div>
      );
    },
  },
  render() {
    const { instance } = this;
    // 如果isOpen为false，不渲染下拉框
    if (!instance.dropdown.isOpen) {
      return null;
    }

    return (
      <div class="fanct-tree__dropdown-container">{this.renderDropdown()}</div>
    );
  },
};
</script>
