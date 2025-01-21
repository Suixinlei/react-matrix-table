import * as React from 'react';
import { Mosaic } from 'react-loading-indicators';

interface LoadingProps {
  visible: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Loading: React.FC<LoadingProps> = ({ visible, children, style }) => {
  if (!visible) return <>{children}</>;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}>
      <Mosaic color="#32cd32" size="medium" text="matrix" textColor="" />
    </div>
  );
};
