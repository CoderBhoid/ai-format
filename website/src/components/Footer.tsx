import { Container, Icon, Reveal } from "./ui";

const NETWORK = [
  {
    label: "Our Website",
    value: "sednium.com",
    href: "https://sednium.com",
    icon: "sednium",
  },
  {
    label: "Developer profile",
    value: "github.com/CoderBhoid",
    href: "https://github.com/CoderBhoid",
    icon: "github",
  },
  {
    label: "Contact",
    value: "bhoid@sednium.com",
    href: "mailto:bhoid@sednium.com",
    icon: "mail",
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-coral/40 to-transparent" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-coral/5 blur-3xl" />

      <Container className="relative py-16 sm:py-20">
        {/* CTA band */}
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 border-b border-white/8 pb-12 lg:flex-row lg:items-center">
            <div className="max-w-lg">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-coral/40 bg-panel font-mono text-sm font-semibold text-coral">
                    .ai
                  </span>
                  <span className="text-lg tracking-tight text-white">
                    <span className="font-display-serif italic text-coral mr-0.5">ai</span>
                    <span className="font-display-sans font-medium text-neutral-200">-format</span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 mt-2 bg-white/2 border border-white/5 rounded-lg px-3 py-1.5 w-fit">
                  <img src="/sednium.png" alt="Sednium logo" className="h-6 w-auto object-contain" />
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                    A Project by Sednium
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                The official landing page and technical specification for the secure .ai-format format.
              </p>
              <p className="mt-3 font-mono text-xs text-neutral-500">
                deploying at{" "}
                <span className="text-neutral-300">ai.sednium.com</span>
              </p>
            </div>

            <a href="#top" className="btn btn-primary w-full sm:w-auto lg:w-auto">
              Back to top
              <Icon name="arrow" className="h-4 w-4 -rotate-90" />
            </a>
          </div>
        </Reveal>

        {/* network links */}
        <Reveal delay={100}>
          <div className="mt-12">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              Official network
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {NETWORK.map((n) => (
                <a
                  key={n.label}
                  href={n.href}
                  target={n.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-white/8 bg-panel p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-coral/40 hover:bg-panel-2"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-ink text-neutral-300 transition-colors group-hover:border-coral/40 group-hover:text-coral">
                    {n.icon === "sednium" ? (
                      <img src="/sednium.png" alt="Sednium logo" className="h-6 w-auto object-contain" />
                    ) : (
                      <Icon name={n.icon} className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-neutral-500">
                      {n.label}
                    </span>
                    <span className="block truncate text-sm font-medium text-neutral-100">
                      {n.value}
                    </span>
                  </span>
                  <Icon
                    name="arrow"
                    className="ml-auto h-4 w-4 text-neutral-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-coral"
                  />
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-xs text-neutral-500 font-display-sans">
            © {new Date().getFullYear()} Sednium | The .ai-format format specification
          </p>
          <p className="text-xs text-neutral-600 font-display-sans">
            Built with ❤️ by{" "}
            <a
              href="https://github.com/CoderBhoid"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 hover:text-coral transition-colors"
            >
              Bhoid
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
