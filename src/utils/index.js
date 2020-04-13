export function createTree(size, level) {
  let arr = [];
  function addChilds(root, size, level, id = "") {
    for (let i = 0; i < size; i++) {
      const item = {
        label: Math.random(0, 1),
        expanded: true,
        children: [],
        id: id + (i + 1),
        isDefaultExpanded:true
      };
      root.push(item);
      if (level > 0) {
        addChilds(item.children, size, level - 1, item.id + "-");
      }
      else{
        delete item.children
      }
    }
  }
  addChilds(arr, size, level);
  return arr;
}
