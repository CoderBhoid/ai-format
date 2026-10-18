const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function createWavBuffer(numChannels, sampleRate, samples) {
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk Descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intVal = s < 0 ? Math.floor(s * 32768) : Math.floor(s * 32767);
    buffer.writeInt16LE(intVal, offset);
    offset += 2;
  }

  return buffer;
}

const outDir = path.resolve(__dirname, '../public/sfx');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. sub_drop.wav: Deep 55Hz -> 28Hz pitch-drop sine wave with warm saturation (~1.5s)
(() => {
  const duration = 1.5;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);
  let phase = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 55 * Math.pow(28 / 55, t / duration);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;

    const env = Math.sin((t / duration) * Math.PI * 0.5 + Math.PI * 0.5) * Math.exp(-t * 2.2);
    let val = Math.sin(phase) + 0.3 * Math.sin(phase * 2);
    // Warm saturation
    val = Math.tanh(val * 1.8) * 0.85 * env;
    samples[i] = val;
  }

  fs.writeFileSync(path.join(outDir, 'sub_drop.wav'), createWavBuffer(1, SAMPLE_RATE, samples));
  console.log('✓ Generated sub_drop.wav');
})();

// 2. whoosh_orbit.wav: Filtered white-noise bandpass sweep (~1.2s)
(() => {
  const duration = 1.2;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  let b0 = 0, b1 = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    // Bell envelope
    const env = Math.pow(Math.sin(progress * Math.PI), 2.5);

    // Filter frequency sweep: 200Hz -> 2200Hz -> 300Hz
    const centerFreq = 200 + 2000 * Math.sin(progress * Math.PI);
    const noise = (Math.random() * 2 - 1) * 0.9;

    // Resonant simple 2-pole filter
    const omega = (2 * Math.PI * centerFreq) / SAMPLE_RATE;
    const q = 4.0;
    const alpha = Math.sin(omega) / (2 * q);

    b0 = alpha * noise + (1 - alpha) * b1;
    b1 = b0;

    samples[i] = Math.tanh(b0 * 2.5) * env * 0.75;
  }

  fs.writeFileSync(path.join(outDir, 'whoosh_orbit.wav'), createWavBuffer(1, SAMPLE_RATE, samples));
  console.log('✓ Generated whoosh_orbit.wav');
})();

// 3. synapse_ping.wav: Crisp harmonic FM crystal chime + telemetry click (~0.8s)
(() => {
  const duration = 0.8;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Crystal bell: Carrier 1760Hz (A6), Modulator 880Hz
    const modEnv = Math.exp(-t * 22);
    const mod = Math.sin(2 * Math.PI * 880 * t) * 3.5 * modEnv;
    const carrier = Math.sin(2 * Math.PI * 1760 * t + mod);
    const bellEnv = Math.exp(-t * 5.0);

    // Initial telemetry click
    const click = t < 0.005 ? (Math.random() * 2 - 1) * Math.exp(-t * 1000) * 0.8 : 0;

    samples[i] = (carrier * bellEnv * 0.65) + click;
  }

  fs.writeFileSync(path.join(outDir, 'synapse_ping.wav'), createWavBuffer(1, SAMPLE_RATE, samples));
  console.log('✓ Generated synapse_ping.wav');
})();

// 4. ambient_drone.wav: Subtle 15.0s dark cinematic chord pad (D2 + A2 + F3 low-pass) at -18dB
(() => {
  const duration = 15.0;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const freqD2 = 73.42;
  const freqA2 = 110.0;
  const freqF3 = 174.61;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Smooth fade in (0-1.5s) and fade out (13.5-15s)
    let env = 1.0;
    if (t < 1.5) env = t / 1.5;
    else if (t > 13.5) env = (15.0 - t) / 1.5;

    // Subtle detune chorusing
    const osc1 = Math.sin(2 * Math.PI * freqD2 * t) + 0.3 * Math.sin(2 * Math.PI * (freqD2 * 1.002) * t);
    const osc2 = Math.sin(2 * Math.PI * freqA2 * t) + 0.2 * Math.sin(2 * Math.PI * (freqA2 * 0.998) * t);
    const osc3 = Math.sin(2 * Math.PI * freqF3 * t * 0.5); // Warm sub undertone

    // Low pass filter approximation via slow sine lfo
    const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.2 * t);
    const raw = (osc1 * 0.45 + osc2 * 0.35 + osc3 * 0.2) * lfo;

    // Amplitude scaled to -18dB (~0.125)
    samples[i] = raw * env * 0.125;
  }

  fs.writeFileSync(path.join(outDir, 'ambient_drone.wav'), createWavBuffer(1, SAMPLE_RATE, samples));
  console.log('✓ Generated ambient_drone.wav');
})();
