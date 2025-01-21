/**
 *
 * @param treeArr
 * @param isAllExpand 用于判定是否全部展开
 * @returns
 */
export function transformTreeToFlatten(treeArr: any[], isAllExpand = false) {
  const arr = [];

  function collectChildren(childArr: any[]) {
    for (let i = 0; i < childArr.length; i++) {
      const treeItem = childArr[i];
      arr.push(treeItem);

      if (
        Array.isArray(treeItem.children) &&
        (isAllExpand || treeItem.isExpand)
      ) {
        collectChildren(treeItem.children);
      }
    }
  }

  collectChildren(treeArr);
  return arr;
}
