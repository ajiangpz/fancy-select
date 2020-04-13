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
      <div class={`fancy-tree__tip fancy-tre__${props.type}-tip`}>
        <div class="fancy-tree__icon-container">
          <span class={`icon iconfont icon-${props.icon} fancy-tree__icon-warning`}></span>
        </div>
        <span class={`fancy-tree__tip-text fancy-tree__${props.type}-tip-text`}>
          {children}
        </span> 
      </div>
    );
  }
};
</script>
