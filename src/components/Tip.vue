<script>
export default {
  name: "Tip",
  functional: true,
  props: {
    type: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  },
  render(_, context) {
    const { props, children } = context;
    return (
      <div class={`fancy-select__tip fancy-select__${props.type}-tip`}>
        <div class="fancy-select__icon-container">
          <span class={`icon iconfont icon-${props.icon} fancy-select__icon-warning`}></span>
        </div>
        <span class={`fancy-select__tip-text fancy-select__${props.type}-tip-text`}>
          {children}
        </span> 
      </div>
    );
  }
};
</script>
