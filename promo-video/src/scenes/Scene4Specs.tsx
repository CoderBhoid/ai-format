import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { theme } from '../theme';

export const Scene4Specs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 5, fps, config: theme.spring.smooth });
  const card1 = spring({ frame: frame - 15, fps, config: theme.spring.snappy });
  const card2 = spring({ frame: frame - 22, fps, config: theme.spring.snappy });
  const card3 = spring({ frame: frame - 29, fps, config: theme.spring.snappy });
  const termSpring = spring({ frame: frame - 40, fps, config: theme.spring.smooth });

  const exitOpacity = frame > 130 ? (150 - frame) / 20 : 1;

  // Live Terminal Typing Animation
  const fullCommand = '$ aif note --project sednium --importance 0.95 --summary "V4 Shipped"';
  const charsShown = Math.min(fullCommand.length, Math.floor(Math.max(0, frame - 45) * 1.6));
  const displayedCommand = fullCommand.slice(0, charsShown);
  const cursorBlink = Math.floor(frame / 15) % 2 === 0 ? '▋' : ' ';

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
          ENGINEERED FOR EXTREME AGENT WORKLOADS
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
          Zero-Touch{' '}
          <span style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', color: theme.colors.int16CoreRed }}>
            Cryptographic
          </span>{' '}
          Integrity.
        </h2>
      </div>

      {/* 3 Glassmorphic Bento Cards */}
      <div
        style={{
          display: 'flex',
          gap: 28,
          marginTop: 20,
        }}
      >
        {/* Bento 1: 0.2ms Partial Envelope Unpacking */}
        <div
          style={{
            width: 320,
            padding: 28,
            borderRadius: 20,
            backgroundColor: 'rgba(28, 27, 27, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
            opacity: card1,
            transform: `translateY(${(1 - card1) * 30}px)`,
          }}
        >
          <div style={{ fontFamily: theme.fonts.primary, fontSize: 54, fontWeight: 900, color: theme.colors.int16CoreRed }}>
            0.2ms
          </div>
          <div style={{ fontFamily: theme.fonts.primary, fontSize: 18, fontWeight: 700, color: theme.colors.textPrimary, marginTop: 4 }}>
            Partial Envelope Unpacking
          </div>
          <p style={{ fontFamily: theme.fonts.primary, fontSize: 14, color: theme.colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>
            Native byte-offset pointer seek in compiled <strong>Rust</strong>. Only the requested memory block is decrypted.
          </p>
        </div>

        {/* Bento 2: SIGINT Safe Interrupt Traps */}
        <div
          style={{
            width: 320,
            padding: 28,
            borderRadius: 20,
            backgroundColor: 'rgba(28, 27, 27, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
            opacity: card2,
            transform: `translateY(${(1 - card2) * 30}px)`,
          }}
        >
          <div style={{ fontFamily: theme.fonts.primary, fontSize: 54, fontWeight: 900, color: theme.colors.int2CrustBlue }}>
            SIGINT
          </div>
          <div style={{ fontFamily: theme.fonts.primary, fontSize: 18, fontWeight: 700, color: theme.colors.textPrimary, marginTop: 4 }}>
            Abrupt Pause Trap
          </div>
          <p style={{ fontFamily: theme.fonts.primary, fontSize: 14, color: theme.colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>
            OS-level signal trap auto-flushes in-flight scratch buffer to <code style={{ color: theme.colors.int2CrustBlue }}>INT16_CORE</code> during abrupt user stops.
          </p>
        </div>

        {/* Bento 3: AEAD + HMAC Cryptographic Isolation */}
        <div
          style={{
            width: 320,
            padding: 28,
            borderRadius: 20,
            backgroundColor: 'rgba(28, 27, 27, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
            opacity: card3,
            transform: `translateY(${(1 - card3) * 30}px)`,
          }}
        >
          <div style={{ fontFamily: theme.fonts.primary, fontSize: 54, fontWeight: 900, color: theme.colors.successGreen }}>
            AEAD
          </div>
          <div style={{ fontFamily: theme.fonts.primary, fontSize: 18, fontWeight: 700, color: theme.colors.textPrimary, marginTop: 4 }}>
            Single-Key Isolation
          </div>
          <p style={{ fontFamily: theme.fonts.primary, fontSize: 14, color: theme.colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>
            Zero-touch 256-bit AEAD with HMAC-SHA256 headers strictly per <code style={{ color: theme.colors.successGreen }}>(Project, Model)</code>.
          </p>
        </div>
      </div>

      {/* Live Terminal Pill */}
      <div
        style={{
          marginTop: 42,
          padding: '14px 28px',
          borderRadius: 14,
          backgroundColor: theme.colors.ink,
          border: `1px solid ${theme.colors.borderHighlight}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: termSpring,
          transform: `translateY(${(1 - termSpring) * 20}px)`,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: theme.colors.successGreen }} />
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 16,
            color: theme.colors.textPrimary,
            letterSpacing: '0.02em',
          }}
        >
          {displayedCommand}
          <span style={{ color: theme.colors.int16CoreRed }}>{cursorBlink}</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
