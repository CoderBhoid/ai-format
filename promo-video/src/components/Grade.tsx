import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame / 25) * 0.06;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(circle at 50% 48%, rgba(249, 92, 75, ${0.14 + pulse}) 0%, rgba(59, 130, 246, 0.05) 55%, transparent 80%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};
