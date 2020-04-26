<script>
export default {
  inject: ["instance"],
  render() {
    const { instance } = this;
    if (!instance.hasValue) {
      return null;
    }
    const node = instance.selectedNodes[0];
    const customLabelRender = instance.$scopedSlots["value-label"];
    return customLabelRender ? (
      customLabelRender({ node })
    ) : (
      <div class="fancy-select__single-value">{node.label}</div>
    );
  },
};
</script>
