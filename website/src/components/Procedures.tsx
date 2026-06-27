import { Container, Eyebrow, Icon, Reveal, ScrollWordReveal } from "./ui";

const SAVE = [
  {
    title: "Milestone completion",
    desc: "After finishing a major coding phase, debugging loop, or architectural plan.",
  },
  {
    title: "Pre-flight checkpoint",
    desc: "Before high-risk commands  -  migrations, destructive git ops  -  to create a recovery state.",
  },
  {
    title: "Session shutdown",
    desc: "When wrapping up or preparing to hand work off to another agent.",
  },
];

const LOAD = [
  {
    title: "Session resumption",
    desc: "At the start of a task, if a previously saved .ai snapshot exists in the directory.",
  },
  {
    title: "Shared agent handoff",
    desc: "When another agent generated a context snapshot and passed it for continuation.",
  },
];

function Column({
  label,
  icon,
  items,
}: {
  label: string;
  icon: string;
  items: { title: string; desc: string }[];
}) {
  return (
    <div className="card flex flex-col p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-coral/30 bg-coral/5 text-coral">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <h3 className="font-mono text-sm uppercase tracking-[0.15em] text-neutral-300">
          {label}
        </h3>
      </div>

      <ul className="mt-6 space-y-3">
        {items.map((it, i) => (
          <li
            key={it.title}
            className="group rounded-lg border border-white/8 bg-ink/60 p-4 transition-colors hover:border-coral/30"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/10 font-mono text-[11px] text-neutral-400 transition-colors group-hover:border-coral/40 group-hover:text-coral">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="text-sm font-semibold text-white">
                  {it.title}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                  {it.desc}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Procedures() {
  return (
    <section id="procedures" className="relative py-20 sm:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <Eyebrow>operating model</Eyebrow>
          <ScrollWordReveal
            as="h2"
            text="When to save. When to load."
            className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display-sans"
          />
          <ScrollWordReveal
            text="This checklist defines the operational bounds for context tracking. It tells agents when to capture a state milestone and when to restore it."
            className="mt-4 text-base leading-relaxed text-neutral-400"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal>
            <Column label="When to save" icon="checkpoint" items={SAVE} />
          </Reveal>
          <Reveal delay={120}>
            <Column label="When to load" icon="arrow" items={LOAD} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
