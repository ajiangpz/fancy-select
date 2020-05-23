<template>
  <div class="demo-source">
    <div class="demo-container">
      <div class="header">示例</div>
      <component :is="componentName"></component>
    </div>

    <div class="source-container">
      <div class="header">代码</div>
      <div class="source"><slot></slot></div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    componentName: {
      type: String,
      required: true,
    },
  },
};
</script>
<style scoped>
.demo-source {
  display: flex;
  height: 360px;
  justify-content: space-between;
  align-items: flex-start;
}
.demo-source .header{
  min-height: 30px;
  line-height: 30px;
  border-bottom: 1px solid #ddd;
}
.demo-container,
.source-container {
  width: 45%;
  height: 100%;
  margin-top: 10px;
  position: relative;
}

.demo-container .demo {
  margin-top: 10px;
}
.source-container .source{
   height: 100%;
  overflow: auto;
}
</style>
