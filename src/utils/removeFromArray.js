export function removeFromArray(arr, ele) {
  let idx = arr.indexOf(ele);
  if (idx !== -1) {
    arr.splice(idx, 1);
  }
}
