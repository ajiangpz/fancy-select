<template>
  <div
    class="fancy-tree__controls"
    @mousedown="instance.handleInputClick"
    ref="fancy-tree-controls"
  >
    <div class="fancy-tree__value-container">
      <div class="fancy-tree__input-container">
        <input
          class="fancy-tree__input"
          type="text"
          @blur="handleBlur"
          v-model="value"
          @input="handleInput"
          ref="input"
        />
      </div>
    </div>
    <div
      class="fancy-tree__control-arrow-container"
      :class="{
        'fancy-tree__control-arrow-container--rotate': instance.dropdown.isOpen
      }"
    >
      <Arrow></Arrow>
    </div>
  </div>
</template>
<script>
import Arrow from "./icons/Arrow.vue";
import { debounce } from "../utils/debounce";
export default {
  components: {
    Arrow
  },
  inject: ["instance"],
  created() {
    this.debounceCallback = debounce(this.updateSearchQuery, 300);
  },
  data() {
    return {
      value: ""
    };
  },
  methods: {
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
    }
  }
};
</script>
