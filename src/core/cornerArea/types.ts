/**
 * 角头区域类型定义
 */
import { AreaProps, AreaState, CornerAreaConfig, CornerType } from '../types';

export interface CornerAreaProps extends AreaProps {
  cornerType: CornerType;
  areaConfig: CornerAreaConfig;
}

export interface CornerAreaState extends AreaState {

}
