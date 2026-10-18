import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

export const Scene3Bridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame: frame - 5, fps, config: theme.spring.smooth });
  const bridgeSpring = spring({ frame: frame - 25, fps, config: theme.spring.orbital });
  const exitOpacity = frame > 220 ? (240 - frame) / 20 : 1;

  // 6 Satellite Projects
  const satelliteAngleStep = (2 * Math.PI) / 6;
  const radius = 380;
  const satellites = [2, 3, 4, 5, 6, 7].map((num, i) => {
    const angle = i * satelliteAngleStep;
    return {
      id: `Project ${num}`,
      x: 960 + Math.cos(angle) * radius,
      y: 540 + Math.sin(angle) * (radius * 0.65),
    };
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          width: '100%',
          textAlign: 'center',
          opacity: entrance,
          transform: `translateY(${(1 - entrance) * 20}px)`,
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
          CROSS-PERSISTENCE GRAPH
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
          Instant{' '}
          <span style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', color: theme.colors.int16CoreRed }}>
            Cross-Project
          </span>{' '}
          Synaptic Bridges.
        </h2>
        <p style={{ fontFamily: theme.fonts.primary, fontSize: 18, color: theme.colors.textMuted, margin: '6px 0 0 0' }}>
          Direct Core-to-Core recall via <code style={{ color: theme.colors.int16CoreRed }}>bridge_nexus.ai</code> without unpacking outer rings.
        </p>
      </div>

      {/* Synaptic Bridge Canvas */}
      <svg
        width="1920"
        height="1080"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Glowing Bridge Lines from Project 1 to Satellites */}
        {satellites.map((sat, i) => {
          const packetProgress = ((frame * 0.035 + i * 0.16) % 1);
          const px = 960 + (sat.x - 960) * packetProgress;
          const py = 540 + (sat.y - 540) * packetProgress;

          return (
            <g key={sat.id} opacity={bridgeSpring}>
              {/* Outer faint ray */}
              <line
                x1="960"
                y1="540"
                x2={sat.x}
                y2={sat.y}
                stroke={theme.colors.int16CoreRed}
                strokeWidth="2"
                strokeDasharray="4 8"
                opacity="0.5"
              />
              {/* High intensity laser core bridge */}
              <line
                x1="960"
                y1="540"
                x2={sat.x}
                y2={sat.y}
                stroke={theme.colors.int16CoreRed}
                strokeWidth="1.2"
                opacity="0.8"
              />
              {/* Animated Synaptic Data Packet */}
              <circle cx={px} cy={py} r="6" fill="#ffffff" filter={`drop-shadow(0 0 6px ${theme.colors.int16CoreRed})`} />
            </g>
          );
        })}
      </svg>

      {/* Central Project 1 Node */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 75,
          top: 540 - 75,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.colors.int16CoreRed} 0%, #171616 90%)`,
          border: `2px solid ${theme.colors.int16CoreRed}`,
          boxShadow: '0 0 45px rgba(255, 75, 75, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: entrance,
          transform: `scale(${entrance})`,
        }}
      >
        <span style={{ fontFamily: theme.fonts.primary, fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
          Project 1
        </span>
        <span style={{ fontFamily: theme.fonts.mono, fontSize: 10, color: '#ffe4e4' }}>
          INT16_CORE
        </span>
      </div>

      {/* Surrounding Satellite Projects */}
      {satellites.map((sat) => (
        <div
          key={sat.id}
          style={{
            position: 'absolute',
            left: sat.x - 55,
            top: sat.y - 55,
            width: 110,
            height: 110,
            borderRadius: '50%',
            backgroundColor: 'rgba(28, 27, 27, 0.92)',
            border: `1px solid ${theme.colors.borderHighlight}`,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: bridgeSpring,
            transform: `scale(${bridgeSpring})`,
          }}
        >
          <span style={{ fontFamily: theme.fonts.primary, fontSize: 15, fontWeight: 800, color: theme.colors.textPrimary }}>
            {sat.id}
          </span>
          <span style={{ fontFamily: theme.fonts.mono, fontSize: 9, color: theme.colors.int16CoreRed }}>
            CORE LINKED
          </span>
        </div>
      ))}
    </AbsoluteFill>
  );
};
