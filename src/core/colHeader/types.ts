/**
 * 列头区域类型定义
 */

import { AreaProps, AreaState, ColHeaderConfig } from '../types';

export interface ColHeaderProps extends AreaProps {
  areaConfig: ColHeaderConfig;
}
export type ColHeaderState = AreaState;
