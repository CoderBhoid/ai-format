import { Container, Eyebrow, Icon, Reveal, ScrollWordReveal } from "./ui";

const BENEFITS: {
  icon: string;
  title: string;
  desc: string;
}[] = [
  {
    icon: "bolt",
    title: "Instant resumption",
    desc: "Load entire histories in a single pass, skipping slow input-prefill computation entirely.",
  },
  {
    icon: "shield",
    title: "Cryptographic security",
    desc: "ChaCha20 streaming AEAD and HMAC-SHA256 with 0600 file permissions prevent tampering.",
  },
  {
    icon: "clock",
    title: "Orbital gravity rings",
    desc: "Self-evaluated attention scores partition memories into Red Core, Middle Ring, and Outer Crust.",
  },
  {
    icon: "hub",
    title: "Cross-project bridge",
    desc: "Seek directly to core architectural decisions in neighboring repositories in under 1 millisecond.",
  },
  {
    icon: "checkpoint",
    title: "Interrupt protection",
    desc: "Flushes in-flight working state to INT16_CORE on sudden SIGINT or terminal pauses.",
  },
  {
    icon: "key",
    title: "Single-key binding",
    desc: "Deterministic 256-bit AEAD key per project and model stored in restricted local keychains.",
  },
  {
    icon: "gem",
    title: "Stop-word pruning",
    desc: "Middle ring prunes routine helper words automatically to save prompt context window tokens.",
  },
  {
    icon: "compress",
    title: "Sub-millisecond seek",
    desc: "Partial envelope unpacking reads and authenticates requested blocks without loading entire archives.",
  },
];

function BenefitCard({
  icon,
  title,
  desc,
  index,
}: {
  icon: string;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <Reveal delay={(index % 4) * 80} className="h-full">
      <div className="group relative h-full overflow-hidden rounded-xl border border-white/8 bg-panel p-6 transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:bg-panel-2 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-coral/0 blur-2xl transition-colors duration-300 group-hover:bg-coral/10" />
        <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-ink text-neutral-300 transition-colors duration-300 group-hover:border-coral/40 group-hover:text-coral">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">{desc}</p>
      </div>
    </Reveal>
  );
}

export default function Benefits() {
  return (
    <section id="benefits" className="relative py-20 sm:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <Eyebrow>why .ai</Eyebrow>
          <ScrollWordReveal
            as="h2"
            text="Deterministic, model-agnostic, local-first version control."
            className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display-sans"
          />
          <ScrollWordReveal
            text="Eight core capabilities that deliver deterministic state checkpoints for LLMs and agents—from sub-millisecond bridge seeks to zero-token git checkpoints."
            className="mt-4 text-base leading-relaxed text-neutral-400"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <BenefitCard key={b.title} index={i} {...b} />
          ))}
        </div>
      </Container>
    </section>
  );
}
