import { useEffect, useMemo, useState } from "react";
import { Container, Eyebrow, Reveal, ScrollWordReveal } from "./ui";

type Stage = {
  key: string;
  age: string;
  retention: number;
  cost: string;
  title: string;
  desc: string;
};

const STAGES: Stage[] = [
  {
    key: "FP16_RAW",
    age: "Under 1 hour",
    retention: 100,
    cost: "1.00×",
    title: "Fresh context",
    desc: "Saved verbatim at full precision. Every token, intent, and decision is preserved with nothing thrown away.",
  },
  {
    key: "INT8",
    age: "1 hour – 1 day",
    retention: 58,
    cost: "0.41×",
    title: "Medium-term context",
    desc: "Redundant helper tokens are pruned and the remainder quantized to INT8. Meaning stays intact, bulk drops away.",
  },
  {
    key: "INT2",
    age: "Beyond 1 day",
    retention: 12,
    cost: "0.06×",
    title: "Ancient context",
    desc: "Condensed into high-level INT2 semantic concepts. Only the distilled gist remains signed and compact.",
  },
];

const COLS = 16;
const ROWS = 9;
const N = COLS * ROWS;

// deterministic pseudo-random brightness per cell (stable across renders)
function brightness(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const NODES = [
  { x: 18, y: 30 },
  { x: 40, y: 18 },
  { x: 62, y: 40 },
  { x: 82, y: 26 },
  { x: 34, y: 62 },
  { x: 70, y: 70 },
  { x: 50, y: 86 },
];
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [4, 5],
  [5, 6],
  [1, 4],
  [3, 5],
];

function cellStyle(i: number, stage: number) {
  const v = brightness(i);
  const coral = v > 0.9;
  let opacity = 1;
  let scale = 1;

  if (stage === 0) {
    opacity = 0.16 + v * 0.74;
  } else if (stage === 1) {
    if (v < 0.45) {
      opacity = 0.035;
      scale = 0.5;
    } else {
      opacity = 0.4 + (v - 0.45) * 1.1;
    }
  } else {
    opacity = 0.045;
    scale = 0.4;
  }

  return {
    backgroundColor: coral ? "rgba(249,92,75,1)" : "rgba(241,239,236,1)",
    opacity,
    transform: `scale(${scale})`,
  };
}

const VIS_PAYLOADS = [
  // Stage 0 (FP16_RAW)
  `<span class="text-neutral-500">// FP16_RAW (100% detail)</span>
{
  "timestamp": "2026-06-27T19:27:00.000Z",
  "milestone": "Database Migration Core",
  "fidelity": "FP16_RAW",
  "agent_state": {
    "active_goal": "refactor_db_model",
    "integrity_hash": "a4f893cd77a11eb"
  },
  "variables": {
    "db_conn": "<span class="text-coral">"sqlite://db.db"</span>",
    "retry_count": 3,
    "temp_cache": ["users", "sessions", "settings"]
  },
  "log_history": [
    "<span class="text-emerald-400">[INFO] Connection established.</span>",
    "[DEBUG] Checking pre-flight integrity...",
    "<span class="text-emerald-400">[SUCCESS] Verification succeeded.</span>"
  ]
}`,
  // Stage 1 (INT8)
  `<span class="text-neutral-500">// INT8 (Quantized & Pruned)</span>
{
  "timestamp": "2026-06-27T19:27:00Z",
  "milestone": "Database Migration Core",
  "fidelity": "INT8",
  "agent_state": {
    "active_goal": "refactor_db_model",
    "integrity_hash": "a4f893cd77a11eb"
  },
  "variables": {
    "db_conn": "<span class="text-coral">"sqlite://db.db"</span>",
    "retry_count": 3
  },
  "log_summary": [
    "[INFO] Connection established.",
    "<span class="text-emerald-400">[SUCCESS] Integrity verified.</span>"
  ]
}`,
  // Stage 2 (INT2)
  `<span class="text-neutral-500">// INT2 (Deep Summary)</span>
{
  "milestone": "Database Migration Core",
  "fidelity": "INT2_DEEP_SUMMARY",
  "goal": "refactor_db_model",
  "outcome": "SUCCESS",
  "summary": "Refactored SQLite schema. Verified integrity hashes. Restored in conceptual memory graph."
}`
];

function Visualization({ stage }: { stage: number }) {
  const [view, setView] = useState<"matrix" | "payload">("matrix");
  const cells = useMemo(
    () => Array.from({ length: N }, (_, i) => i),
    []
  );

  return (
    <div className="relative flex aspect-[16/10] w-full flex-col overflow-hidden rounded-xl border border-white/8 bg-ink p-3 sm:p-4">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 z-20">
        <div className="flex gap-1.5 rounded-lg bg-white/3 p-0.5">
          <button
            type="button"
            onClick={() => setView("matrix")}
            className={
              "rounded px-2.5 py-1 text-[11px] font-medium transition-colors " +
              (view === "matrix"
                ? "bg-coral text-army"
                : "text-neutral-400 hover:text-neutral-200")
            }
          >
            Matrix Grid
          </button>
          <button
            type="button"
            onClick={() => setView("payload")}
            className={
              "rounded px-2.5 py-1 text-[11px] font-medium transition-colors " +
              (view === "payload"
                ? "bg-coral text-army"
                : "text-neutral-400 hover:text-neutral-200")
            }
          >
            Payload Text
          </button>
        </div>
        <div className="font-mono text-[11px] text-neutral-500">
          {STAGES[stage].key}
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        {view === "matrix" ? (
          <div className="relative h-full w-full">
            {/* memory grid */}
            <div
              className="relative grid h-full w-full gap-[3px] sm:gap-1"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              }}
            >
              {cells.map((i) => (
                <div
                  key={i}
                  className="rounded-[3px] transition-all duration-700 ease-out"
                  style={cellStyle(i, stage)}
                />
              ))}
            </div>

            {/* INT2 semantic concept graph overlay */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-700"
              style={{ opacity: stage === 2 ? 1 : 0 }}
            >
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                {EDGES.map(([a, b], i) => (
                  <line
                    key={i}
                    x1={NODES[a].x}
                    y1={NODES[a].y}
                    x2={NODES[b].x}
                    y2={NODES[b].y}
                    stroke="rgba(249,92,75,0.7)"
                    strokeWidth={0.5}
                  />
                ))}
              </svg>
              {NODES.map((n, i) => (
                <span
                  key={i}
                  className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral ring-4 ring-coral/15"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <pre
            className="h-full w-full overflow-y-auto rounded-lg bg-ink/40 p-4 font-mono text-[11px] leading-relaxed text-neutral-200 scrollbar-none transition-all duration-300"
            dangerouslySetInnerHTML={{ __html: VIS_PAYLOADS[stage] }}
          />
        )}
      </div>
    </div>
  );
}

export default function DecayTimeline() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const active = STAGES[stage];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => setStage((s) => (s + 1) % STAGES.length),
      2400
    );
    return () => clearInterval(id);
  }, [playing]);

  return (
    <section id="timeline" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(249,92,75,0.05),transparent_70%)]" />
      <Container className="relative">
        <Reveal className="max-w-2xl">
          <Eyebrow>temporal memory decay</Eyebrow>
          <ScrollWordReveal
            as="h2"
            text="State degrades on a schedule."
            className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display-sans"
          />
          <ScrollWordReveal
            text="Scrub the timeline to watch a snapshot compress over time, ranging from full-resolution FP16_RAW detail down to INT2 deep semantic summaries."
            className="mt-4 text-base leading-relaxed text-neutral-400"
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/8 bg-panel p-5 sm:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
              {/* Metrics */}
              <div className="order-2 flex flex-col lg:order-1">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                  {active.age}
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-semibold text-coral sm:text-4xl">
                    {active.key}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {active.title}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
                  {active.desc}
                </p>

                {/* retention meter */}
                <div className="mt-7">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Detail retention</span>
                    <span className="font-mono text-neutral-300">
                      {active.retention}%
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-coral to-coral/60 transition-all duration-700 ease-out"
                      style={{ width: `${active.retention}%` }}
                    />
                  </div>
                </div>

                {/* relative cost */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/8 bg-ink p-4">
                    <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                      Token cost
                    </div>
                    <div className="mt-1 font-mono text-lg text-neutral-100">
                      {active.cost}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/8 bg-ink p-4">
                    <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                      Resolution
                    </div>
                    <div className="mt-1 font-mono text-lg text-neutral-100">
                      {active.key.split("_")[0]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualization */}
              <div className="order-1 lg:order-2">
                <Visualization stage={stage} />
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 border-t border-white/8 pt-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  time →
                </span>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink px-4 py-2 text-xs font-medium text-neutral-200 transition-colors hover:border-coral/40 hover:text-white"
                >
                  {playing ? (
                    <>
                      <span className="flex gap-0.5">
                        <span className="block h-3 w-1 bg-coral" />
                        <span className="block h-3 w-1 bg-coral" />
                      </span>
                      Pause
                    </>
                  ) : (
                    <>
                      <span className="block h-0 w-0 border-y-4 border-l-[6px] border-y-transparent border-l-coral" />
                      Auto-play
                    </>
                  )}
                </button>
              </div>

              <div className="relative mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                {STAGES.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      setStage(i);
                      setPlaying(false);
                    }}
                    className={
                      "group rounded-xl border p-3 text-left transition-all duration-300 sm:p-4 " +
                      (stage === i
                        ? "border-coral/50 bg-coral/5"
                        : "border-white/8 bg-ink hover:border-white/20")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          "font-mono text-xs sm:text-sm " +
                          (stage === i ? "text-coral" : "text-neutral-300")
                        }
                      >
                        {s.key}
                      </span>
                      {stage === i && (
                        <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-500">
                      {s.age}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
