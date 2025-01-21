import { IOriginalColHeader, IOriginalRowHeader } from '@/data-factory/types';
import { removeNotDisplay } from './removeNotDisplay';
import { transformFlattenToTree } from './transformFlattenToTree';

/**
 * 1. 用于转换打平数据到树形
 * 2. 剪枝去掉不需要展示的树形
 */
export function initialTransformFlattenToTree(
  flattenData: Array<IOriginalColHeader | IOriginalRowHeader>,
) {
  // 格式校验
  // TODO
  // 将打平数据转变为树形
  const treeData = transformFlattenToTree(flattenData);
  // 树形数据根据 defaultDisplay 剪枝
  const displayTreeData = removeNotDisplay(treeData);

  return displayTreeData;
}
