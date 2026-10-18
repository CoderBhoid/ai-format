import React from 'react';
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

export const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame: frame - 5, fps, config: theme.spring.heavyDrop });
  const titleSpring = spring({ frame: frame - 20, fps, config: theme.spring.smooth });
  const pillsSpring = spring({ frame: frame - 35, fps, config: theme.spring.snappy });

  // Fade out completely to Ink #100f0f at frame 900
  const finalFade = frame > 100 ? (120 - frame) / 20 : 1;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        opacity: finalFade,
      }}
    >
      {/* Central Radiance */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 75, 75, 0.35) 0%, transparent 70%)`,
          transform: `scale(${logoSpring})`,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Converged Logo */}
      <div
        style={{
          width: 150,
          height: 150,
          borderRadius: 30,
          padding: 8,
          backgroundColor: 'rgba(28, 27, 27, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `0 25px 70px -10px rgba(255, 75, 75, 0.65)`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: logoSpring,
          transform: `scale(${0.6 + logoSpring * 0.4})`,
          marginBottom: 30,
        }}
      >
        <Img src={staticFile('logo.png')} style={{ width: 110, height: 110, objectFit: 'contain' }} />
      </div>

      {/* Lockup Headline */}
      <h1
        style={{
          fontFamily: theme.fonts.primary,
          fontSize: 72,
          fontWeight: 800,
          color: theme.colors.textPrimary,
          letterSpacing: '-0.03em',
          margin: 0,
          opacity: titleSpring,
          transform: `translateY(${(1 - titleSpring) * 20}px)`,
        }}
      >
        .ai-format{' '}
        <span style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', color: theme.colors.int16CoreRed }}>
          v4
        </span>
      </h1>

      <p
        style={{
          fontFamily: theme.fonts.primary,
          fontSize: 22,
          color: theme.colors.textMuted,
          marginTop: 12,
          opacity: titleSpring,
        }}
      >
        Unified Cognitive Persistence for Autonomous Agents.
      </p>

      {/* Footer Ecosystem Pills */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 36,
          opacity: pillsSpring,
          transform: `translateY(${(1 - pillsSpring) * 15}px)`,
        }}
      >
        <div
          style={{
            padding: '10px 22px',
            borderRadius: 9999,
            backgroundColor: 'rgba(28, 27, 27, 0.85)',
            border: `1px solid ${theme.colors.borderHighlight}`,
            fontFamily: theme.fonts.mono,
            fontSize: 14,
            color: theme.colors.int16CoreRed,
            fontWeight: 600,
          }}
        >
          ai.sednium.com
        </div>
        <div
          style={{
            padding: '10px 22px',
            borderRadius: 9999,
            backgroundColor: 'rgba(28, 27, 27, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontFamily: theme.fonts.mono,
            fontSize: 14,
            color: theme.colors.textMuted,
            fontWeight: 600,
          }}
        >
          sednium.com
        </div>
        <div
          style={{
            padding: '10px 22px',
            borderRadius: 9999,
            backgroundColor: 'rgba(28, 27, 27, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontFamily: theme.fonts.mono,
            fontSize: 14,
            color: theme.colors.textMuted,
            fontWeight: 600,
          }}
        >
          github.com/CoderBhoid/ai-format
        </div>
      </div>
    </AbsoluteFill>
  );
};
