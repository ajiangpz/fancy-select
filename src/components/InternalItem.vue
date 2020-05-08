<script>
import { onLeftClick } from "../utils/onLeftClick";
import DeleteIcon from "./icons/Delete.vue";
export default {
  name: "fancy-select__internal-value-item",
  inject: ["instance"],
  props: {
    node: {
      type: Object,
      required: true,
    },
    labelMaxWidth: {
      type: Number,
    },
  },

  methods: {
    handleMouseDown: onLeftClick(function handleMouseDown() {
      const { instance, node } = this;
      instance.select(node);
    }),
  },
  render() {
    const { node } = this;
    const itemClass = {
      "fancy-select__internal-value-item": true,
      
    };
    let nodeStyle = { maxWidth: `${this.labelMaxWidth}px` };
    return (
      <div class="fancy-select__internal-value-item-container">
        <div class={itemClass} onmousedown={this.handleMouseDown}>
          <span class="fancy-select__internal-value-label" style={nodeStyle}>
            {node.label}
          </span>
          <span class="fancy-select__icon fancy-select__internal-value-remove">
            <DeleteIcon />
          </span>
        </div>
      </div>
    );
  },
};
</script>
