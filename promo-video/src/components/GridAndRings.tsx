import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { theme } from '../theme';

export const GridAndRings: React.FC = () => {
  const frame = useCurrentFrame();
  const rot = (frame * 0.12) % 360;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* 58px Architectural Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.028) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.028) 1px, transparent 1px)
          `,
          backgroundSize: '58px 58px',
          opacity: 0.7,
        }}
      />
      {/* Ambient Rotating Orbital Vector Rings */}
      <svg
        width="1920"
        height="1080"
        style={{
          position: 'absolute',
          inset: 0,
          transform: `rotate(${rot}deg)`,
          transformOrigin: '50% 50%',
          opacity: 0.22,
        }}
      >
        <circle cx="960" cy="540" r="320" fill="none" stroke={theme.colors.int16CoreRed} strokeWidth="1" strokeDasharray="6 12" />
        <circle cx="960" cy="540" r="480" fill="none" stroke={theme.colors.textMuted} strokeWidth="1" strokeDasharray="3 18" />
        <circle cx="960" cy="540" r="640" fill="none" stroke={theme.colors.int2CrustBlue} strokeWidth="0.8" strokeDasharray="10 30" />
      </svg>
    </AbsoluteFill>
  );
};
