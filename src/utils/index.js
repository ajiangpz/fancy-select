export function createTree(size, level) {
  let arr = [];
  function addChilds(root, size, level, id = "") {
    for (let i = 0; i < size; i++) {
      const item = {
        name: Math.random(0, 1),
        expanded: false,
        children: [],
        id: id + (i + 1),
      };
      root.push(item);
      if (level > 0) {
        addChilds(item.children, size, level - 1, item.id + "-");
      } else {
        delete item.children;
      }
    }
  }
  addChilds(arr, size, level);
  return arr;
}
