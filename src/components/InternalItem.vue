<script>
import { onLeftClick } from "../utils/onLeftClick";
import DeleteIcon from "./icons/Delete.vue";
export default {
  name: "fancy-tree__internal-value-item",
  inject: ["instance"],
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleMouseDown: onLeftClick(function handleMouseDown() {
      const { instance, node } = this;
      instance.select(node);
    })
  },
  render() {
    const { node } = this;
    const itemClass = {
      "fancy-tree__internal-value-item": true
    };
    return (
      <div class="fancy-tree__internal-value-item-container">
        <div class={itemClass} onmousedown={this.handleMouseDown}>
          <span class="fancy-tree__internal-value-label">{node.label}</span>
          <span class="fancy-tree__icon fancy-tree__internal-value-remove">
            <DeleteIcon />
          </span>
        </div>
      </div>
    );
  }
};
</script>
