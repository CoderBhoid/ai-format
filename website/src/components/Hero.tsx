import { Container, Eyebrow, Icon } from "./ui";

function Pipeline() {
  const tiers = [
    { tag: "FP16_RAW", note: "100% detail", w: "w-[34%]" },
    { tag: "INT8", note: "quantized", w: "w-[20%]" },
    { tag: "INT2", note: "semantic", w: "w-[10%]" },
  ];
  return (
    <div className="card w-full max-w-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          snapshot checkpoint
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-coral" />
          signed · post-quantum
        </span>
      </div>

      <div className="flex items-end gap-2 sm:gap-3">
        {tiers.map((t) => (
          <div key={t.tag} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-full items-end justify-center overflow-hidden rounded-md border border-white/8 bg-ink sm:h-20">
              <div className={`flow-line h-full ${t.w} rounded-sm bg-coral/25`} />
            </div>
            <div className="text-center">
              <div className="font-mono text-[11px] text-neutral-200 sm:text-xs">
                {t.tag}
              </div>
              <div className="text-[10px] text-neutral-500">{t.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(70%_60%_at_50%_0%,#000_30%,transparent_80%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_70%_at_50%_0%,rgba(249,92,75,0.16),transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Container className="relative flex flex-col items-center text-center">
        <a 
          href="https://github.com/CoderBhoid/ai-format"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/5 px-4 py-1.5 text-xs font-mono tracking-wide text-coral hover:border-coral transition-colors mb-6"
        >
          <Icon name="github" className="h-4 w-4" />
          GitHub
        </a>

        <h1 className="mt-6 max-w-4xl text-balance text-4xl leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl hero-text-shift">
          <span className="font-display-serif italic font-normal mr-2">Secure</span>
          <span className="font-display-sans font-extrabold">context persistence</span>
          <span className="block font-display-sans font-extrabold text-coral mt-2">for long-running agents.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-neutral-400 sm:text-lg">
          The <span className="font-mono text-neutral-200">.ai</span> format stores
          compressed representations of an agent's memory state. This allows agents to resume
          work instantly without repeating long start-up steps.
        </p>

        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <a href="#timeline" className="btn btn-primary w-full sm:w-auto">
            Explore the decay model
            <Icon name="arrow" className="h-4 w-4" />
          </a>
          <a href="#docs" className="btn btn-ghost w-full sm:w-auto">
            Documentation preview
          </a>
        </div>



        <div className="mt-14 w-full flex justify-center">
          <Pipeline />
        </div>

        <p className="mt-8 font-mono text-xs text-neutral-600">
          deploying at{" "}
          <span className="text-neutral-400">ai.sednium.com</span>
        </p>
      </Container>
    </section>
  );
}
