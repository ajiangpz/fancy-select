<template>
  <div
    class="fancy-select__controls"
    @mousedown="instance.handleMouseDown"
    ref="fancy-select-controls"
  >
    <div class="fancy-select__value-container" ref="valueContainer">
      <div
        class="fancy-select__internal-values-container fancy-select__multi-value"
        v-if="instance.multiple"
      >
        <internal-item
          v-for="node in instance.internalValues.map((id) =>
            instance.getNode(id)
          )"
          :key="node.id"
          :node="node"
          :label-max-width="labelMaxWidth"
        ></internal-item>
        <div class="fancy-select__input-container">
          <input
            class="fancy-select__input"
            :style="{ width: instance.multiple ? `${inputWidth}px` : null }"
            type="text"
            @blur="handleBlur"
            v-model="value"
            @input="handleInput"
            ref="input"
          />
          <div class="fancy-select__sizer" ref="sizer">{{ value }}</div>
        </div>
      </div>
      <template v-else>
        <single-value></single-value>
        <div class="fancy-select__input-container">
          <input
            class="fancy-select__input"
            type="text"
            @blur="handleBlur"
            v-model="value"
            @input="handleInput"
            ref="input"
          />
        </div>
      </template>
    </div>
    <div
      class="fancy-select__delete-icon-container"
      title="清空所有"
      v-on:click.stop.prevent="handleDelete($event)"
    >
      <Delete class="fancy-select__delete-icon"></Delete>
    </div>
    <div
      class="fancy-select__control-arrow-container"
      :class="{
        'fancy-select__control-arrow-container--rotate': instance.dropdown.isOpen,
      }"
      @mousedown.prevent.stop="handleArrowMouseDown"
    >
      <Arrow></Arrow>
    </div>
  </div>
</template>
<script>
import Arrow from "./icons/Arrow.vue";
import Delete from "./icons/Delete.vue";
import { debounce } from "../utils/debounce";
import InternalItem from "./InternalItem.vue";
import SingleValue from "./SingleValue.vue";
export default {
  components: {
    Arrow,
    InternalItem,
    SingleValue,
    Delete,
  },
  inject: ["instance"],
  created() {
    this.debounceCallback = debounce(this.updateSearchQuery, 300);
  },
  data() {
    return {
      value: "",
      test: [{ id: 1, label: "11322" }],

      inputWidth: "5px",
      labelMaxWidth:0
    };
  },
  computed: {
    needAutoResize() {
      const { instance } = this;

      return instance.multiple;
    },
  },
  mounted(){
    this.labelMaxWidth=this.$refs.valueContainer.scrollWidth;
  },
  watch: {
    value() {
      if (this.needAutoResize) {
        this.$nextTick(() => {
          this.updateInputWidth();
        });
      }
    },
  },
  methods: {
    handleDelete(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      const { instance } = this;
      instance.clear();
    },
    handleBlur() {
      const { instance } = this;
      let $dropdown = instance.getDropdown();
      if ($dropdown && document.activeElement == $dropdown) {
        return this.focus();
      }
      instance.closeDropdown();
    },
    updateSearchQuery() {
      const { instance } = this;
      instance.controls.searchQuery = this.value;
    },
    handleInput() {
      if (this.value) {
        this.debounceCallback();
      } else {
        this.debounceCallback.cancel();
        this.updateSearchQuery();
      }
    },
    handleArrowMouseDown() {
      const { instance } = this;
      instance.focusInput();
      instance.toggleDropdown();
    },
    updateInputWidth() {
      this.inputWidth = Math.max(this.$refs.sizer.scrollWidth + 15, 5);
    },
  },
};
</script>
