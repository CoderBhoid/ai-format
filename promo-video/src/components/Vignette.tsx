import React from 'react';
import { AbsoluteFill } from 'remotion';

export const Vignette: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 160px 50px rgba(16, 15, 15, 0.88)',
      }}
    />
  );
};
