<template>
  <div class="demo">
    <component :is="componentName"></component>
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
