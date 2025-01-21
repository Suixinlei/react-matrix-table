import * as R from 'ramda';

export function transformFlattenToTree(list: any[]) {
  const map = {};
  const roots = [];
  let node;
  let i;

  const cloneList = R.clone(list);
  for (i = 0; i < cloneList.length; i += 1) {
    map[cloneList[i].dataRowIndex || cloneList[i].dataColIndex] = i; // initialize the map
  }

  for (i = 0; i < cloneList.length; i += 1) {
    node = cloneList[i];
    if (node.parent) {
      const parent = cloneList[map[node.parent]];
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
