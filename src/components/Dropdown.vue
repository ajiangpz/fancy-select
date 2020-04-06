<script>
import Option from "./Option.vue";
export default {
  inject: ["instance"],
  computed: {
    dropdownStyle() {
      const { instance } = this;

      return {
        maxHeight: instance.maxHeight + "px"
      };
    }
  },
  render() {
    const { instance } = this;
    // 如果isOpen为false，不渲染下拉框
    if (!instance.dropdown.isOpen) {
      return null;
    }
    const dropdownClass = {
      "fancy-tree__dropdown": true
    };
    return (
      <div
        class={dropdownClass}
        style={this.dropdownStyle}
        onmousedown={instance.handleMouseDown}
      >
        {instance.forest.normalizedTreeData.map(node => (
          <Option node={node} key={node.id} />
        ))}
      </div>
    );
  }
};
</script>
