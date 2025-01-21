/**
 * 用于剪枝去除未展开的树
 */

// 不可展开的增加 isExpand={true} 标识
export function pruningTreeWithExpand(tree, expandIndex) {
  const treeArr = [];
  tree.forEach((treeItem) => {
    if (treeItem.children) {
      if (
        !expandIndex.includes(treeItem.dataRowIndex) &&
        !expandIndex.includes(treeItem.dataColIndex)
      ) {
        treeItem.isExpand = false;
        treeArr.push(treeItem);
      } else {
        treeItem.children = pruningTreeWithExpand(
          treeItem.children,
          expandIndex,
        );
        treeItem.isExpand = true;
        treeArr.push(treeItem);
      }
    } else {
      treeItem.isExpand = false;
      treeArr.push(treeItem);
    }
  });

  return treeArr;
}
