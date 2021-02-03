<template>
  <div
    class="fancy-select__controls"
    @mousedown="instance.handleMouseDown"
    ref="fancy-select-controls"
  >
    <div class="fancy-select__value-container" ref="valueContainer">
      <div
        class="fancy-select__placeholder"
        v-if="!instance.hasValue && !value"
      >
        {{ instance.placeHolder }}
      </div>

      <transition-group
        class="fancy-select__internal-values-container fancy-select__multi-value"
        v-if="instance.multiple"
        name="fancy-select__multi-value-item--transition"
        tag="div"
      >
        <internal-item
          v-for="node in instance.internalValues
            .slice(0, instance.limit)
            .map((id) => instance.getNode(id))"
          :key="node.id"
          :node="node"
          :label-max-width="labelMaxWidth"
        ></internal-item>
        <div class="fancy-select__limit-tip" v-if="count > 0" key="limit-tip">
          <span class="fancy-select__limit-tip-text">{{
            instance.limitText(count)
          }}</span>
        </div>
        <div class="fancy-select__input-container" key="input-container">
          <input
            class="fancy-select__input"
            :style="{ width: instance.multiple ? `${inputWidth}px` : null }"
            type="text"
            @blur="handleBlur"
            v-model="value"
            @input="handleInput"
            @focus="handleFocus"
            @keydown="handleKeyDown"
            ref="input"
          />
          <div class="fancy-select__sizer" ref="sizer">{{ value }}</div>
        </div>
      </transition-group>

      <template v-else>
        <single-value v-if="!value"></single-value>
        <div class="fancy-select__input-container">
          <input
            class="fancy-select__input"
            type="text"
            @blur="handleBlur"
            v-model="value"
            @input="handleInput"
            @focus="handleFocus"
            @keydown="handleKeyDown"
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
        'fancy-select__control-arrow-container--rotate':
          instance.dropdown.isOpen,
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
import { includes } from "../utils/includes";
import { KEY_CODES } from "../contants";
const keysThatRequireMenuBeingOpen = [
  KEY_CODES.ENTER,
  KEY_CODES.END,
  KEY_CODES.HOME,
  KEY_CODES.ARROW_LEFT,
  KEY_CODES.ARROW_UP,
  KEY_CODES.ARROW_RIGHT,
  KEY_CODES.ARROW_DOWN,
];

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
      labelMaxWidth: 0,
    };
  },
  computed: {
    needAutoResize() {
      const { instance } = this;

      return instance.multiple;
    },
    count() {
      const { instance } = this;
      return instance.internalValues.length - instance.limit;
    },
  },
  mounted() {
    this.labelMaxWidth = this.$refs.valueContainer.scrollWidth;
  },
  watch: {
    value() {
      if (this.needAutoResize) {
        this.$nextTick(() => {
          this.updateInputWidth();
        });
      }
    },
    "instance.controls.searchQuery": function(val) {
      this.value = val;
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
      instance.controls.isFocus = false;
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
    handleFocus() {
      const { instance } = this;
      instance.controls.isFocus = true;
    },
    handleKeyDown(evt) {
      const { instance } = this;
      if (evt.ctrlKey || evt.shiftKey || evt.altKey || evt.mataKey) {
        return;
      }
      const key =
        "which" in evt ? evt.which : /* istanbul ignore next */ evt.keyCode;

      if (
        !instance.dropdown.isOpen &&
        includes(keysThatRequireMenuBeingOpen, key)
      ) {
        evt.preventDefault();
        return instance.openDropdown();
      }
      switch (key) {
        case KEY_CODES.BACKSPACE: {
          if (!this.value.length) {
            instance.removeLastValue();
          }
          break;
        }
        case KEY_CODES.ENTER: {
          evt.preventDefault();
          if (instance.dropdown.current === null) return;
          const current = instance.getNode(instance.dropdown.current);
          if (current.isParent & instance.disableBranchNodes) return;
          instance.select(current);
          break;
        }
        case KEY_CODES.ARROW_RIGHT: {
          const current = instance.getNode(instance.dropdown.current);
          if (current.isParent && !instance.shouldExpand(current)) {
            evt.preventDefault();
            instance.toggleExpanded(current);
          }
          break;
        }
        case KEY_CODES.ARROW_LEFT: {
          const current = instance.getNode(instance.dropdown.current);
          if (current.isParent && instance.shouldExpand(current)) {
            evt.preventDefault();
            instance.toggleExpanded(current);
          } else if (
            !current.isRootNode &&
            (current.isLeaf ||
              (current.isParent && !instance.shouldExpand(current)))
          ) {
            evt.preventDefault();
            instance.setCurrentHighlightedOption(current.parentNode);
          }
          break;
        }
        case KEY_CODES.ARROW_DOWN: {
          evt.preventDefault();
          instance.highlightNextOption();
          break;
        }
        case KEY_CODES.ARROW_UP: {
          evt.preventDefault();
          instance.highlightPrevOption();
          break;
        }
        case KEY_CODES.ESCAPE: {
          evt.preventDefault();
          if (this.value.length) {
            this.value = "";
            this.handleInput();
          }
          if (instance.dropdown.isOpen) {
            instance.closeDropdown();
          }
          break;
        }
        default: {
          instance.openDropdown();
        }
      }
    },
  },
};
</script>
