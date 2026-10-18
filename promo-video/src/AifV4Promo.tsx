import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { loadFont as loadUrbanist } from '@remotion/google-fonts/Urbanist';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { theme } from './theme';
import { BgMesh } from './components/BgMesh';
import { GridAndRings } from './components/GridAndRings';
import { Grade } from './components/Grade';
import { Grain } from './components/Grain';
import { Vignette } from './components/Vignette';
import { Subtitles } from './components/Subtitles';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2Orbital } from './scenes/Scene2Orbital';
import { Scene3Bridge } from './scenes/Scene3Bridge';
import { Scene4Specs } from './scenes/Scene4Specs';
import { Scene5Outro } from './scenes/Scene5Outro';

loadUrbanist();
loadPlayfair();

export const AifV4Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.ink, overflow: 'hidden' }}>
      {/* --- Continuous Ambient Audio Track --- */}
      <Audio src={staticFile('sfx/ambient_drone.wav')} volume={0.8} />

      {/* --- SFX Cue Sequences --- */}
      <Sequence from={15} durationInFrames={120}>
        <Audio src={staticFile('sfx/sub_drop.wav')} volume={0.85} />
      </Sequence>
      <Sequence from={155} durationInFrames={90}>
        <Audio src={staticFile('sfx/whoosh_orbit.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={220} durationInFrames={60}>
        <Audio src={staticFile('sfx/synapse_ping.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={395} durationInFrames={90}>
        <Audio src={staticFile('sfx/whoosh_orbit.wav')} volume={0.7} />
      </Sequence>
      <Sequence from={430} durationInFrames={60}>
        <Audio src={staticFile('sfx/synapse_ping.wav')} volume={0.4} />
      </Sequence>
      <Sequence from={450} durationInFrames={60}>
        <Audio src={staticFile('sfx/synapse_ping.wav')} volume={0.45} />
      </Sequence>
      <Sequence from={470} durationInFrames={60}>
        <Audio src={staticFile('sfx/synapse_ping.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={640} durationInFrames={60}>
        <Audio src={staticFile('sfx/synapse_ping.wav')} volume={0.55} />
      </Sequence>
      <Sequence from={785} durationInFrames={115}>
        <Audio src={staticFile('sfx/sub_drop.wav')} volume={0.8} />
        <Audio src={staticFile('sfx/synapse_ping.wav')} volume={0.6} />
      </Sequence>

      {/* --- Visual Stack --- */}
      {/* Layer 1: Background Mesh */}
      <BgMesh />

      {/* Layer 2: Grid and Orbital Vector Rings */}
      <GridAndRings />

      {/* Layer 3: Dynamic Choreographed Scenes */}
      <Sequence from={0} durationInFrames={150}>
        <Scene1Intro />
      </Sequence>
      <Sequence from={150} durationInFrames={240}>
        <Scene2Orbital />
      </Sequence>
      <Sequence from={390} durationInFrames={240}>
        <Scene3Bridge />
      </Sequence>
      <Sequence from={630} durationInFrames={150}>
        <Scene4Specs />
      </Sequence>
      <Sequence from={780} durationInFrames={120}>
        <Scene5Outro />
      </Sequence>

      {/* Persistent Feature Subtitles Pill */}
      <Subtitles />

      {/* Layer 4: Color Grade Bloom & Vignette */}
      <Grade />
      <Vignette />

      {/* Layer 5: Film Grain Overlay */}
      <Grain />
    </AbsoluteFill>
  );
};
