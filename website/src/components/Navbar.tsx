import { useEffect, useState } from "react";
import { Container, Icon, cn } from "./ui";

const LINKS = [
  { label: "Benefits", href: "#benefits" },
  { label: "Decay Timeline", href: "#timeline" },
  { label: "Procedures", href: "#procedures" },
  { label: "Documentation", href: "#docs" },
];

function Brand() {
  return (
    <a href="#top" className="flex items-center gap-3 group">
      <img
        src="/icon.png"
        alt="ai-format logo"
        className="h-8 w-8 object-contain rounded-lg border border-coral/20 group-hover:border-coral/50 transition-colors"
      />
      <span className="hidden text-lg tracking-tight text-neutral-100 sm:block">
        <span className="font-display-serif italic text-coral mr-0.5">ai</span>
        <span className="font-display-sans font-medium text-neutral-200">-format</span>
      </span>
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        "backdrop-blur-[12px] [backdrop-filter:blur(12px)_saturate(140%)] [-webkit-backdrop-filter:blur(12px)_saturate(140%)]",
        scrolled
          ? "bg-[rgba(23,22,22,0.78)] border-b border-white/10 shadow-lg shadow-black/30"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://sednium.com"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost hidden h-10 !min-h-0 px-4 text-sm sm:inline-flex"
          >
            Our Website
            <Icon name="arrow" className="h-4 w-4" />
          </a>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-panel text-neutral-200 md:hidden"
          >
            <div className="space-y-1.5">
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition-transform duration-300",
                  open && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition-opacity duration-300",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition-transform duration-300",
                  open && "-translate-y-2 -rotate-45"
                )}
              />
            </div>
          </button>
        </div>
      </Container>

      {/* Mobile menu - own glass layer so overflow:hidden doesn't clip backdrop-filter */}
      <div
        className={cn(
          "border-t border-white/5 transition-[max-height,opacity] duration-300 md:hidden",
          "bg-[rgba(23,22,22,0.88)] [backdrop-filter:blur(12px)_saturate(140%)] [-webkit-backdrop-filter:blur(12px)_saturate(140%)]",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-base text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://sednium.com"
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-2 w-full"
          >
            Our Website
            <Icon name="arrow" className="h-4 w-4" />
          </a>
        </Container>
      </div>
    </header>
  );
}
