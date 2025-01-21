/**
 * @param treeData
 * @param isAllCollect 开启时不管是否为 defaultExpand 全部收集
 * @returns
 */
export function collectDefaultExpandToArr(treeData, isAllCollect?: boolean) {
  const expandIndex: Array<string | number> = [];

  function findDefaultExpand(arr) {
    arr.forEach((item) => {
      if (item.children) {
        if (item.defaultExpand || isAllCollect) {
          expandIndex.push(item.dataRowIndex || item.dataColIndex);
        }

        findDefaultExpand(item.children);
      }
    });
  }

  findDefaultExpand(treeData);
  return expandIndex;
}
