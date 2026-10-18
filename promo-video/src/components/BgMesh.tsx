import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { theme } from '../theme';

export const BgMesh: React.FC = () => {
  const frame = useCurrentFrame();
  const radX = 50 + Math.sin(frame * 0.02) * 8;
  const radY = 50 + Math.cos(frame * 0.025) * 6;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${radX}% ${radY}%, #1f1b1a 0%, ${theme.colors.armyBlack} 55%, ${theme.colors.ink} 100%)`,
        pointerEvents: 'none',
      }}
    />
  );
};
