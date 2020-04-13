<script>
import Option from "./Option.vue";
import Tip from "./Tip";

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
  methods:{

    renderNoResultsTip() {
      const { instance } = this;
      return (
        <Tip type="no-results" icon="warning">
          {instance.noResultsText}
        </Tip>
      );
    },
    renderLocalSearchDropdown() {
      const {instance}=this;
      if (instance.localSearch.noResults) {
        return this.renderNoResultsTip();
      } else {
        return this.renderTreeNodeList();
      }
    },
    renderNormalDropdown(){
      return this.renderTreeNodeList();
    },
    renderTreeNodeList() {
      const {instance}=this;
      return (
        <div class="fancy-tree__list">
          {instance.forest.normalizedTreeData.map(node => (
            <Option node={node} key={node.id} />
          ))}
        </div>
      );
    },
    renderDropdown() {
      const {instance}=this;
      const dropdownClass = {
        "fancy-tree__dropdown": true
      };
      return (
        <div
          class={dropdownClass}
          style={this.dropdownStyle}
          onmousedown={instance.handleMouseDown}
        >
          {instance.localSearch.active
            ? this.renderLocalSearchDropdown()
            : this.renderNormalDropdown()}
        </div>
      );
    },
  },  
  render() {
    const { instance } = this;
    // 如果isOpen为false，不渲染下拉框
    if (!instance.dropdown.isOpen) {
      return null;
    }

    return (<div class="fanct-tree__dropdown-container"
    >
    {this.renderDropdown()}
    </div>)
  }
};
</script>
