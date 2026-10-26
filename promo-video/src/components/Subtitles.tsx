import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../theme';

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();

  let text = 'AIF V4: Deterministic Version Control & State Checkpoints for LLMs and Agents';
  if (frame >= 150 && frame < 390) {
    text = 'Concentric Gravity Shells: INT16 Core, INT8 Ring & INT2 Crust';
  } else if (frame >= 390 && frame < 630) {
    text = 'Cross-Project Synaptic Bridges: Direct Core-to-Core Recall via bridge_nexus.ai';
  } else if (frame >= 630 && frame < 780) {
    text = 'Zero-Touch Cryptographic Isolation: 256-bit AEAD & Abrupt Interrupt Traps';
  } else if (frame >= 780) {
    text = 'Deterministic Local-First Version Control: .ai-format by Sednium';
  }

  // Soft fade transitions between scenes
  const transitionProgress = (() => {
    const cutPoints = [150, 390, 630, 780];
    for (const cp of cutPoints) {
      if (frame >= cp - 10 && frame <= cp + 10) {
        return Math.abs(frame - cp) / 10;
      }
    }
    return 1;
  })();

  const opacity = interpolate(transitionProgress, [0, 1], [0.35, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 48,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 24px',
          borderRadius: 9999,
          backgroundColor: 'rgba(23, 22, 22, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          opacity,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.55)',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: theme.colors.int16CoreRed,
            boxShadow: `0 0 10px ${theme.colors.int16CoreRed}`,
          }}
        />
        <span
          style={{
            fontFamily: theme.fonts.primary,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: theme.colors.textPrimary,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
