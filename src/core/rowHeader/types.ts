/**
 * 行头类型定义
 */

import { AreaProps, AreaState, RowHeaderConfig } from '../types';

export interface RowHeaderProps extends AreaProps {
  areaConfig: RowHeaderConfig;
}

export type RowHeaderState = AreaState;
