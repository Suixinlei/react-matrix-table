import { IColTreeItem } from 'src/data-factory/types';

function isLeafNode(node: IColTreeItem) {
  return node.isExpand === false;
}

export default isLeafNode;
