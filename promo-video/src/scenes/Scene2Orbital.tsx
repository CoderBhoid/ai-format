import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

export const Scene2Orbital: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 5, fps, config: theme.spring.smooth });
  const ring1Spring = spring({ frame: frame - 15, fps, config: theme.spring.orbital });
  const ring2Spring = spring({ frame: frame - 30, fps, config: theme.spring.orbital });
  const ring3Spring = spring({ frame: frame - 45, fps, config: theme.spring.orbital });

  const exitOpacity = frame > 220 ? (240 - frame) / 20 : 1;
  const rotMiddle = (frame * 0.35) % 360;
  const rotOuter = (-frame * 0.2) % 360;
  const corePulse = 1 + Math.sin(frame / 12) * 0.06;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          textAlign: 'center',
          opacity: titleSpring,
          transform: `translateY(${(1 - titleSpring) * 20}px)`,
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 13,
            color: theme.colors.int16CoreRed,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          TRI-TIER ORBITAL ARCHITECTURE
        </span>
        <h2
          style={{
            fontFamily: theme.fonts.primary,
            fontSize: 48,
            fontWeight: 800,
            color: theme.colors.textPrimary,
            margin: '8px 0 0 0',
          }}
        >
          Gravity-Weighted{' '}
          <span style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', color: theme.colors.int16CoreRed }}>
            Orbital
          </span>{' '}
          Precision.
        </h2>
      </div>

      {/* Orbital Visualization SVG */}
      <div
        style={{
          position: 'relative',
          width: 800,
          height: 600,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 60,
        }}
      >
        {/* Tier 3: Outer Blue Crust (INT2) */}
        <div
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: '50%',
            border: `2px dashed rgba(59, 130, 246, 0.45)`,
            transform: `scale(${ring3Spring}) rotate(${rotOuter}deg)`,
            opacity: ring3Spring,
          }}
        >
          {/* Crust nodes */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: '50%',
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: theme.colors.int2CrustBlue,
              boxShadow: `0 0 14px ${theme.colors.int2CrustBlue}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 60,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: theme.colors.int2CrustBlue,
              boxShadow: `0 0 10px ${theme.colors.int2CrustBlue}`,
            }}
          />
        </div>

        {/* Tier 2: Middle Black/Neutral Ring (INT8) */}
        <div
          style={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            border: `2px solid rgba(207, 204, 202, 0.35)`,
            transform: `scale(${ring2Spring}) rotate(${rotMiddle}deg)`,
            opacity: ring2Spring,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: -8,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: theme.colors.textMuted,
              boxShadow: `0 0 12px ${theme.colors.textMuted}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 40,
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: theme.colors.textMuted,
              boxShadow: `0 0 8px ${theme.colors.textMuted}`,
            }}
          />
        </div>

        {/* Tier 1: Center Red Core (INT16) */}
        <div
          style={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.colors.int16CoreRed} 0%, #bd2415 70%, #171616 100%)`,
            boxShadow: `0 0 60px 10px rgba(255, 75, 75, 0.65)`,
            transform: `scale(${ring1Spring * corePulse})`,
            opacity: ring1Spring,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontFamily: theme.fonts.primary, fontSize: 20, fontWeight: 900, color: '#ffffff' }}>
            INT16
          </span>
          <span style={{ fontFamily: theme.fonts.mono, fontSize: 11, color: '#ffe4e4', letterSpacing: '0.1em' }}>
            S_attn ≥ 0.7
          </span>
        </div>
      </div>

      {/* Floating Glassmorphic HUD Specs */}
      <div
        style={{
          position: 'absolute',
          bottom: 110,
          display: 'flex',
          gap: 24,
          opacity: ring2Spring,
          transform: `translateY(${(1 - ring2Spring) * 15}px)`,
        }}
      >
        <div
          style={{
            padding: '12px 20px',
            borderRadius: 14,
            backgroundColor: 'rgba(28, 27, 27, 0.85)',
            border: `1px solid ${theme.colors.borderHighlight}`,
          }}
        >
          <span style={{ fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.int16CoreRed, fontWeight: 700 }}>
            INT16 CORE
          </span>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: theme.colors.textPrimary, fontFamily: theme.fonts.primary }}>
            High-Gravity Active Memory
          </p>
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderRadius: 14,
            backgroundColor: 'rgba(28, 27, 27, 0.85)',
            border: `1px solid rgba(207, 204, 202, 0.2)`,
          }}
        >
          <span style={{ fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.textMuted, fontWeight: 700 }}>
            INT8 RING
          </span>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: theme.colors.textPrimary, fontFamily: theme.fonts.primary }}>
            Working Context &amp; Lazy Unpacking
          </p>
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderRadius: 14,
            backgroundColor: 'rgba(28, 27, 27, 0.85)',
            border: `1px solid rgba(59, 130, 246, 0.3)`,
          }}
        >
          <span style={{ fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.int2CrustBlue, fontWeight: 700 }}>
            INT2 CRUST
          </span>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: theme.colors.textPrimary, fontFamily: theme.fonts.primary }}>
            Temporal Decay Deep Summaries
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
