import { useState } from "react";
import { Container, Eyebrow, Icon, Reveal, ScrollWordReveal } from "./ui";

const SIDEBAR = [
  "Quick Start",
  "CLI Reference",
  "Orbital Rings & Bridge",
  "File format spec (V4)",
  "Changelog",
];

const TOPICS = [
  {
    icon: "terminal",
    title: "Quick Start",
    desc: "1-Click universal agent prompt and one-line curl installer.",
    tab: "Quick Start",
  },
  {
    icon: "doc",
    title: "CLI Reference",
    desc: "Every command, flag, and argument typed and explained.",
    tab: "CLI Reference",
  },
  {
    icon: "hub",
    title: "Orbital Rings & Bridge",
    desc: "Red Core, Middle Ring, Outer Crust, and Cross-Project Bridge.",
    tab: "Orbital Rings & Bridge",
  },
  {
    icon: "shield",
    title: "File format spec (V4)",
    desc: "AIF\\x04 binary layout, ChaCha20 EtM, and 0600 keychains.",
    tab: "File format spec (V4)",
  },
];

const DOCS_DATA: Record<
  string,
  {
    tag: string;
    title: string;
    desc: string;
    content: string;
    note: string;
  }
> = {
  "Quick Start": {
    tag: "INSTALL",
    title: "Quick Start and Agent Migration",
    desc: "Deploy AIF V4 in seconds via the one-line installer or copy the universal prompt directly to your AI agent.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <p>
    AIF V4 compiles to a single standalone binary named <code>aif</code>. You can install it on your system with one command or instruct your AI coding assistant to configure itself automatically.
  </p>

  <h4 class="text-white font-semibold text-base mt-4 font-display-serif italic">Option 1: One-Line Installer</h4>
  <p>Run this script in your terminal on Linux or macOS:</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-coral overflow-x-auto">curl -fsSL https://ai.sednium.com/install.sh | sh</pre>

  <p class="mt-2">On Windows (PowerShell):</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-coral overflow-x-auto">irm https://ai.sednium.com/install.ps1 | iex</pre>

  <h4 class="text-white font-semibold text-base mt-4 font-display-serif italic">Option 2: The Universal Agent Migration Prompt</h4>
  <p>
    Copy and paste this instruction block into Cursor, Claude Code, Antigravity, or Windsurf. Your agent will clone the repository, build the Rust binary, and inject the persistent memory lifecycle into your global configuration automatically:
  </p>

  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-neutral-200 overflow-x-auto whitespace-pre">You are an expert systems engineer. Install the AIF V4 (ai-format) memory engine and configure my global agent rules:

1. Clone and compile:
   git clone https://github.com/CoderBhoid/ai-format.git ~/.ai-format
   cd ~/.ai-format && cargo build --release
   mkdir -p ~/.local/bin && ln -sf ~/.ai-format/target/release/aif ~/.local/bin/aif

2. Initialize memory for current project:
   aif init --project "$(basename "$PWD")" --model "default"

3. Update my global agent instructions (e.g. ~/.cursorrules, ~/.claude/CLAUDE.md, or ~/.gemini/config/AGENTS.md):
   - At session start: run \`aif recall --core-and-bridge\`
   - Before multi-step tasks: run \`aif scratch "&lt;active task&gt;"\`
   - End of turn: run \`aif note --project &lt;project&gt; --importance &lt;0.0-1.0&gt; --summary "&lt;summary&gt;"\`
   - Cross-project context: run \`aif bridge --query "&lt;topic&gt;"\`

4. Verify setup:
   aif note --importance 0.95 --summary "AIF V4 migration complete"
   aif recall --core-and-bridge</pre>
</div>`,
    note: "The installer places the binary in ~/.local/bin/aif and runs automated IDE rule discovery."
  },
  "CLI Reference": {
    tag: "CLI",
    title: "Command-Line Interface Reference",
    desc: "Complete documentation for every subcommand in the aif binary.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <p>
    The compiled binary provides eight commands. Each command is tuned for sub-millisecond execution and deterministic exit codes.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">1. aif init</h4>
  <p>Creates <code>&lt;project&gt;.ai</code>, generates the 256-bit AEAD key with 0600 permissions, registers the project in <code>bridge_nexus.ai</code>, and auto-injects agent rules into detected IDE configs.</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-3 font-mono text-xs text-coral">aif init --project frontend_web --model gemini-3.5-flash</pre>

  <h4 class="text-white font-semibold text-base mt-4">2. aif note</h4>
  <p>Appends a cognitive memory block. Places notes into Red Core (>=0.70), Middle Ring (0.30-0.69, stop words pruned), or Outer Crust (&lt;0.30, summarized).</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-3 font-mono text-xs text-coral">aif note --project frontend_web --importance 0.92 --summary "Migrated state store to Zustand" --tags "state,store,arch"</pre>

  <h4 class="text-white font-semibold text-base mt-4">3. aif recall</h4>
  <p>Retrieves memories via Partial Envelope Unpacking. Supports loading Red Core, searching queries, or reading raw block payloads.</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-3 font-mono text-xs text-coral">aif recall --core-and-bridge
aif recall --query "Zustand"
aif recall --block note_1720000000_0</pre>

  <h4 class="text-white font-semibold text-base mt-4">4. aif bridge</h4>
  <p>Queries cross-project memory pointers in <code>bridge_nexus.ai</code> and directly seeks target project core blocks in under 1 millisecond.</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-3 font-mono text-xs text-coral">aif bridge --query "authentication"
aif bridge --project backend_api</pre>

  <h4 class="text-white font-semibold text-base mt-4">5. aif scratch</h4>
  <p>Writes volatile in-flight state to <code>.scratch_state.tmp</code>. Armed signal handlers automatically flush this buffer to Red Core on interrupt.</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-3 font-mono text-xs text-coral">aif scratch "Refactoring auth token validation and running integration tests"</pre>

  <h4 class="text-white font-semibold text-base mt-4">6. aif reweight</h4>
  <p>Promotes or demotes existing memories. Recalculates ring placement and adjusts quantization dynamically.</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-3 font-mono text-xs text-coral">aif reweight --block note_1720000000_1 --importance 0.88</pre>

  <h4 class="text-white font-semibold text-base mt-4">7. aif optimize</h4>
  <p>Runs Ebbinghaus temporal decay, reassigns blocks across orbital rings, and upgrades legacy V3 files to V4.</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-3 font-mono text-xs text-coral">aif optimize --delta 0.05 --keywords "auth,zustand"</pre>

  <h4 class="text-white font-semibold text-base mt-4">8. aif watch</h4>
  <p>Foreground process holding signal traps active. Catches Ctrl+C or kill signals and commits volatile state to core memory before exiting.</p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-3 font-mono text-xs text-coral">aif watch --project frontend_web</pre>
</div>`,
    note: "All commands return exit code 0 on success and exit code 1 on verification failure."
  },
  "Orbital Rings & Bridge": {
    tag: "ARCHITECTURE",
    title: "Orbital Gravity Rings & Cross-Project Synaptic Bridge",
    desc: "Hierarchical memory organization and sub-millisecond cross-repository context sharing.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <p>
    Standard flat context dumps force models to waste input tokens re-reading low-priority logs. AIF V4 introduces concentric gravity rings governed by agent-evaluated attention scores:
  </p>

  <h4 class="text-white font-semibold text-base mt-4">1. Red Core (INT16_CORE / FP16_RAW)</h4>
  <p>
    Triggered when importance score is greater than or equal to 0.70. Retains high-importance architectural choices, schema definitions, and interrupted states. Loaded on chat boot and indexed in the master bridge.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">2. Black Middle Ring (INT8_RING)</h4>
  <p>
    Triggered when importance score is between 0.30 and 0.69. Standard turn notes and implementation steps. Common helper words and stop words are stripped to compress token consumption while preserving semantics.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">3. Blue Outer Crust (INT2_CRUST)</h4>
  <p>
    Triggered when importance score is below 0.30 or after temporal decay. Notes are compressed into concise gist summaries.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">4. Cross-Project Synaptic Bridge</h4>
  <p>
    <code>bridge_nexus.ai</code> stores direct byte offsets to Red Core blocks across projects. When Project B needs context from Project A, the engine opens Project A's file, seeks straight to the byte offset, verifies the block HMAC, and unpacks the memory in under 1 millisecond without touching outer rings.
  </p>
</div>`,
    note: "Orbital migration happens automatically when running 'aif optimize' or 'aif reweight'."
  },
  "File format spec (V4)": {
    tag: "SPEC",
    title: "AIF V4 Binary Format Specification",
    desc: "The binary structure of .ai V4 files, ChaCha20 Encrypt-then-MAC, and 0600 keychains.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <p>
    AIF V4 files start with the 4-byte magic signature <code>b"AIF\\x04"</code> followed by the structural header and concatenated block ciphertexts.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">Binary Envelope Layout</h4>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-neutral-200 overflow-x-auto whitespace-pre">+---------------------+--------------------+--------------------+--------------------+---------------------+
| MAGIC (4 Bytes)     | HEADER_LEN (4B)    | HEADER_MAC (32B)   | HEADER_JSON (NB)   | PAYLOAD BYTES (MB)  |
| b"AIF\\x04"          | Big-endian u32     | HMAC-SHA256        | Unencrypted JSON   | Block ciphertexts   |
+---------------------+--------------------+--------------------+--------------------+---------------------+</pre>

  <h4 class="text-white font-semibold text-base mt-4">Cryptographic Details</h4>
  <ul class="list-disc pl-5 space-y-2">
    <li><strong>Key Splitting:</strong> Master 32-byte key generates independent K_enc and K_mac keys via SHA-256.</li>
    <li><strong>Block Encryption:</strong> Each block draws a 16-byte random salt, derives a block key, compresses with Gzip, and encrypts with ChaCha20.</li>
    <li><strong>Integrity:</strong> Encrypt-then-MAC with HMAC-SHA256 over salt + ciphertext. Constant-time checks prevent timing attacks.</li>
    <li><strong>Keychain:</strong> Keys live in <code>~/.gemini/ai-format/keys/&lt;project&gt;__&lt;model&gt;.key</code> locked to 0600 permissions.</li>
  </ul>
</div>`,
    note: "The engine retains full backwards compatibility, reading and upgrading legacy AIF\\x03 files."
  },
  "Changelog": {
    tag: "RELEASES",
    title: "Release Changelog",
    desc: "Version history and evolutionary milestones of the .ai-format standard.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <div class="border-l-2 border-coral pl-4">
    <h4 class="text-white font-semibold text-base font-mono">v4.0.0 (Rust Engine & Orbital Memory Cluster)</h4>
    <p class="text-xs text-neutral-400 mt-0.5">October 2026</p>
    <ul class="list-disc pl-5 space-y-1.5 mt-2">
      <li>Rewrote core engine from Python into a high-performance compiled Rust crate and binary (<code>aif</code>).</li>
      <li>Implemented three Orbital Gravity Rings (<code>INT16_CORE</code>, <code>INT8_RING</code>, <code>INT2_CRUST</code>).</li>
      <li>Added Cross-Project Synaptic Bridge (<code>bridge_nexus.ai</code>) with sub-millisecond direct byte-offset retrieval.</li>
      <li>Introduced Single-Key Project-Model Binding locked to OS-level 0600 permissions.</li>
      <li>Added interrupt trap daemon (<code>aif scratch</code> + SIGINT/SIGTERM hook) to eliminate lost state on abrupt pauses.</li>
      <li>Implemented automated IDE rule discovery in <code>aif init</code> for Cursor, Windsurf, Claude Code, and Antigravity.</li>
      <li>Added one-line curl and PowerShell installer scripts with automated release workflows.</li>
    </ul>
  </div>

  <div class="border-l-2 border-white/20 pl-4 mt-6">
    <h4 class="text-white font-semibold text-base font-mono">v3.0.0 (Block-Based AEAD & Lazy Loading)</h4>
    <p class="text-xs text-neutral-400 mt-0.5">June 2026</p>
    <ul class="list-disc pl-5 space-y-1.5 mt-2">
      <li>Partitioned context files into independent logical blocks with HMAC-verified structural headers.</li>
      <li>Implemented partial envelope unpacking to allow selective block reads via byte seek.</li>
      <li>Introduced initial temporal decay formulas and autonomous background optimization scripts.</li>
    </ul>
  </div>

  <div class="border-l-2 border-white/20 pl-4 mt-6">
    <h4 class="text-white font-semibold text-base font-mono">v2.0.0 (Temporal Attention Model)</h4>
    <p class="text-xs text-neutral-400 mt-0.5">June 2026</p>
    <ul class="list-disc pl-5 space-y-1.5 mt-2">
      <li>Added temporal memory decay with exponential Ebbinghaus forgetting curves.</li>
      <li>Introduced three attention-based quantization tiers (FP16_RAW, INT8, and INT2).</li>
    </ul>
  </div>

  <div class="border-l-2 border-white/20 pl-4 mt-6">
    <h4 class="text-white font-semibold text-base font-mono">v1.0.0 (Initial Prototype)</h4>
    <p class="text-xs text-neutral-400 mt-0.5">June 2026</p>
    <ul class="list-disc pl-5 space-y-1.5 mt-2">
      <li>Initial concept and prototype for encrypted cognitive snapshots for LLM agents.</li>
    </ul>
  </div>
</div>`,
    note: "Upgrading from V3 is automatic. Running 'aif optimize' migrates existing files to AIF\\x04."
  }
};

export default function DocPortal() {
  const [activeTab, setActiveTab] = useState("Quick Start");
  const doc = DOCS_DATA[activeTab] || DOCS_DATA["Quick Start"];

  return (
    <section id="docs" className="relative py-20 sm:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <Eyebrow>documentation</Eyebrow>
          <ScrollWordReveal
            as="h2"
            text="Developer Integration Center."
            className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display-sans"
          />
          <ScrollWordReveal
            text="Explore the AIF V4 Rust CLI, orbital memory hierarchy, cross-project bridge, and the full binary specification."
            className="mt-4 text-base leading-relaxed text-neutral-400"
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-2xl shadow-black/40">
            {/* window chrome */}
            <div className="flex items-center gap-3 border-b border-white/8 bg-ink/80 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-md border border-white/8 bg-army px-3 py-1 font-mono text-[11px] text-neutral-500">
                <Icon name="globe" className="h-3.5 w-3.5" />
                ai.sednium.com/#docs
              </div>
              <span className="hidden font-mono text-[10px] uppercase tracking-wider text-neutral-600 sm:block">
                preview
              </span>
            </div>

            {/* body */}
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
              {/* sidebar for desktop, horizontal bar for mobile */}
              <aside className="border-b border-white/8 bg-ink/40 p-4 lg:border-b-0 lg:border-r lg:p-4">
                <div className="hidden px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600 lg:block">
                  Contents
                </div>
                <nav className="flex flex-row gap-1.5 overflow-x-auto pb-2 lg:mt-3 lg:flex-col lg:space-y-1 lg:overflow-x-visible lg:pb-0 scrollbar-none">
                  {SIDEBAR.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setActiveTab(s)}
                      className={
                        "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
                        (activeTab === s
                          ? "bg-coral/10 text-coral font-medium"
                          : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200")
                      }
                    >
                      <span className="font-mono text-[10px] text-neutral-600">
                        0{i + 1}
                      </span>
                      {s}
                    </button>
                  ))}
                </nav>
              </aside>

              {/* main content */}
              <div className="p-5 sm:p-8 min-h-[480px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="chip">{doc.tag}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white sm:text-2xl font-display-serif italic">
                    {doc.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400 font-display-sans">
                    {doc.desc}
                  </p>

                  {/* code preview */}
                  <div 
                    className="mt-6 overflow-x-auto rounded-lg border border-white/8 bg-ink p-4 text-neutral-200 sm:p-5"
                    dangerouslySetInnerHTML={{ __html: doc.content }}
                  />
                </div>

                {/* doc note */}
                <div className="mt-8 border-l-2 border-coral bg-white/2 p-4 rounded-r-md text-xs text-neutral-400 font-display-sans">
                  {doc.note}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Quick Links / Related Topics */}
        <Reveal delay={200}>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOPICS.map((t) => (
              <button
                key={t.title}
                type="button"
                onClick={() => setActiveTab(t.tab)}
                className="group relative flex items-start gap-4 overflow-hidden rounded-xl border border-white/8 bg-ink/60 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-coral/40 hover:bg-panel-2"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-neutral-300 transition-colors group-hover:border-coral/40 group-hover:text-coral">
                  <Icon name={t.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {t.title}
                    </span>
                    <Icon
                      name="arrow"
                      className="h-3.5 w-3.5 -translate-x-1 text-neutral-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-coral group-hover:opacity-100"
                    />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    {t.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
