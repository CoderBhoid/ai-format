import React from 'react';
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEntrance = spring({
    frame,
    fps,
    config: theme.spring.heavyDrop,
  });

  const textEntrance = spring({
    frame: frame - 20,
    fps,
    config: theme.spring.smooth,
  });

  const badgeEntrance = spring({
    frame: frame - 35,
    fps,
    config: theme.spring.snappy,
  });

  // Micro-motion drift
  const driftY = Math.sin(frame / 20) * 4;

  // Scene exit fade
  const exitOpacity = frame > 130 ? (150 - frame) / 20 : 1;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        opacity: exitOpacity,
        transform: `translateY(${driftY}px)`,
      }}
    >
      {/* Crimson Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 75, 75, 0.28) 0%, transparent 70%)`,
          transform: `scale(${0.8 + logoEntrance * 0.4})`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 20px',
          borderRadius: 9999,
          border: `1px solid ${theme.colors.borderHighlight}`,
          background: 'rgba(255, 75, 75, 0.08)',
          marginBottom: 32,
          opacity: badgeEntrance,
          transform: `translateY(${(1 - badgeEntrance) * 20}px)`,
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: theme.colors.int16CoreRed,
            textTransform: 'uppercase',
          }}
        >
          INTRODUCING .AI-FORMAT V4 • REWRITTEN IN RUST
        </span>
      </div>

      {/* Main Logo with subtle Ken Burns drift */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 28,
          padding: 8,
          background: 'rgba(28, 27, 27, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `0 20px 60px -10px rgba(255, 75, 75, 0.55)`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: logoEntrance,
          transform: `scale(${0.6 + logoEntrance * 0.4}) rotate(${(1 - logoEntrance) * -12}deg)`,
          marginBottom: 28,
        }}
      >
        <Img src={staticFile('logo.png')} style={{ width: 100, height: 100, objectFit: 'contain' }} />
      </div>

      {/* Hero Headline */}
      <h1
        style={{
          fontFamily: theme.fonts.primary,
          fontSize: 68,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: theme.colors.textPrimary,
          textAlign: 'center',
          lineHeight: 1.15,
          margin: 0,
          opacity: textEntrance,
          transform: `translateY(${(1 - textEntrance) * 25}px)`,
        }}
      >
        Context Windows Break.{' '}
        <span style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', color: theme.colors.int16CoreRed }}>
          Memory
        </span>{' '}
        Shouldn't.
      </h1>

      <p
        style={{
          fontFamily: theme.fonts.primary,
          fontSize: 22,
          fontWeight: 400,
          color: theme.colors.textMuted,
          marginTop: 18,
          opacity: textEntrance,
          transform: `translateY(${(1 - textEntrance) * 15}px)`,
        }}
      >
        Sub-millisecond orbital context compaction and cryptographic recall for autonomous agents.
      </p>
    </AbsoluteFill>
  );
};
