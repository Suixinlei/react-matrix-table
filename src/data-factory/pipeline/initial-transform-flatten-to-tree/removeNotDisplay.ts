import {
  IColTreeItem,
  IOriginalColTreeItem,
  IOriginalRowTreeItem,
  IRowTreeItem,
} from '@/data-factory/types';

export function removeNotDisplay(
  tree: Array<IOriginalRowTreeItem | IOriginalColTreeItem>,
): Array<IRowTreeItem | IColTreeItem> {
  // 定义结果树
  const treeArr: Array<IRowTreeItem | IRowTreeItem> = [];

  tree.forEach((treeItem) => {
    if (treeItem.children) {
      treeItem.children = removeNotDisplay(treeItem.children);
    }
    if (treeItem.defaultDisplay) {
      delete treeItem.defaultDisplay;
      treeArr.push(treeItem);
    }
  });

  return treeArr;
}
