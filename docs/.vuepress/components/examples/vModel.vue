<template>
  <div class="demo">
    <fancy-select :tree-data="data" :limit="3" v-model="value"></fancy-select>
    {{ value }}
  </div>
</template>
<script>
import { createTree } from "../../../../src/utils";
export default {
  data() {
    return {
      data: [
        {
          label: "中国",
          id: "1",
          children: [
            {
              label: "上海",
              id: "1-1",
            },
            {
              label: "北京",
              id: "1-2",
            },
            {   
              label: "广东省",
              id: "1-3",
              children: [
                { label: "广州", id: "1-3-1" },
                { label: "深圳", id: "1-3-2" },
              ],
            },
          ],
        },
      ],
      value: null,
    };
  },
};
</script>
