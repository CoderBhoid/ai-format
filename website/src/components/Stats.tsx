import { Container, Reveal } from "./ui";

const STATS = [
  { value: "100%", label: "Fresh detail retained at FP16_RAW" },
  { value: "~16×", label: "Smaller ancient payloads vs. fresh" },
  { value: "0", label: "Manual keys to generate or rotate" },
  { value: "3", label: "Automatic quantization tiers" },
];

export default function Stats() {
  return (
    <section className="relative border-y border-white/8">
      <Container className="px-0 sm:px-8">
        {/* gap-px + wrapper bg = seamless dividers that wrap cleanly on mobile */}
        <div className="grid grid-cols-2 gap-px bg-white/8 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 80}
              className="flex flex-col items-center justify-center bg-ink/60 px-4 py-8 text-center sm:py-10"
            >
              <div className="font-mono text-3xl font-semibold text-coral sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-2 max-w-[12rem] text-xs leading-relaxed text-neutral-400 sm:text-sm">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
