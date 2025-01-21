import cloneDeep from 'lodash/cloneDeep';
import {
  IOriginalColHeader,
  IOriginalRowHeader,
  IOriginalRowTreeItem,
  IOriginalColTreeItem,
} from '@/data-factory/types';

export function transformFlattenToTree(
  list: Array<IOriginalColHeader | IOriginalRowHeader>,
) {
  // 获取数据坐标和数组角标的对应
  const map: Record<string, number> = {};
  const roots: Array<IOriginalRowTreeItem | IOriginalColTreeItem> = [];
  let node: IOriginalRowTreeItem | IOriginalColTreeItem;
  let i;

  const cloneList = cloneDeep(list);
  for (i = 0; i < cloneList.length; i += 1) {
    map[(cloneList[i].dataRowIndex || cloneList[i].dataColIndex) as string] = i; // initialize the map
  }

  for (i = 0; i < cloneList.length; i += 1) {
    node = cloneList[i];
    if (node.parent) {
      const parent: IOriginalRowTreeItem | IOriginalColTreeItem =
        cloneList[map[node.parent]];
      if (!parent.children) {
        parent.children = [];
      }
      // if you have dangling branches check that map[node.parentId] exists
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
