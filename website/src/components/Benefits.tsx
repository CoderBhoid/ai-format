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
    desc: "Snapshots are secured against unauthorized access using localized credential wrapping at every checkpoint.",
  },
  {
    icon: "clock",
    title: "Temporal decay",
    desc: "Recent detail is kept lossless while the distant past condenses automatically on a schedule.",
  },
  {
    icon: "checkpoint",
    title: "Pre-flight checkpoints",
    desc: "Snapshot state before migrations or destructive commands for safe, one-step rollback.",
  },
  {
    icon: "handoff",
    title: "Clean agent handoff",
    desc: "Pass a single signed snapshot to another agent for unambiguous, verifiable continuation.",
  },
  {
    icon: "key",
    title: "Automatic credentials",
    desc: "Keys are generated and rotated for you, requiring no manual cryptography to wire up or audit.",
  },
  {
    icon: "gem",
    title: "Lossless recent detail",
    desc: "Context under an hour is preserved at FP16_RAW, which is one hundred percent intact.",
  },
  {
    icon: "compress",
    title: "Lean ancient payloads",
    desc: "Older sessions collapse to INT2 semantic concepts, keeping storage and load cost tiny.",
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
            text="Engineered for agents that run long."
            className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display-sans"
          />
          <ScrollWordReveal
            text="Eight reasons teams standardize on the .ai-format format instead of fragile text dumps, ranging from signed checkpoints to automatic credential management."
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
