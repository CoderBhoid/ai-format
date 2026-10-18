import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = (frame % 30) * 10;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: 0.035, mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%">
        <filter id="grainFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves={3}
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainFilter)" />
      </svg>
    </AbsoluteFill>
  );
};
