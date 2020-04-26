<script>
export default {
  name: "Loading",
  functional: true,
  render(_, context) {
    const { children } = context;
    return (
      <div class="fancy-select__loading">
        <div class="fancy-select__icon-container">
          <div class="donut"></div>
        </div>
        <div class="fancy-select__loading-text">{children}</div>
      </div>
    );
  },
};
</script>
