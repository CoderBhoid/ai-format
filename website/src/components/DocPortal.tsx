import { useState } from "react";
import { Container, Eyebrow, Icon, Reveal, ScrollWordReveal } from "./ui";

const SIDEBAR = [
  "SDKs & clients",
  "File format spec",
  "Integration guides",
  "API reference",
  "Changelog",
];

const TOPICS = [
  {
    icon: "doc",
    title: "Integration guides",
    desc: "Wire the .ai serializer into your agent runtime, step by step.",
    tab: "Integration guides",
  },
  {
    icon: "terminal",
    title: "API reference",
    desc: "save(), load(), and checkpoint primitives  -  typed and documented.",
    tab: "API reference",
  },
  {
    icon: "shield",
    title: "File format spec",
    desc: "Header layout, credentials envelope, and quantization tiers defined.",
    tab: "File format spec",
  },
  {
    icon: "hub",
    title: "SDKs & clients",
    desc: "First-class bindings for the languages your stack already runs.",
    tab: "SDKs & clients",
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
  "SDKs & clients": {
    tag: "SDK",
    title: "SDKs & Core Clients",
    desc: "First-class bindings, CLI utilities, and runtime connectors for Python and C++ agent execution environments.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <p>
    The <strong>ai-format</strong> library provides official SDKs and scripts to manage your agent's memory. These connectors allow tools to parse and serialize memory states directly in the runtime memory space.
  </p>

  <h4 class="text-white font-semibold text-base mt-4 font-display-serif italic">The Flight Recorder Analogy</h4>
  <p>
    To understand how this setup integrates with your work, consider the analogy of a commercial aircraft flight recorder. A flight recorder does not save a text transcript of every conversation on board. Instead, it continuously logs raw telemetry data (heading, altitude, and velocity) in a robust, structured format. In the same way, the ai-format utility acts as a specialized recorder for your agent. It writes a structured state mapping containing current objectives, active variable states, and conversation logs. When your agent restarts, it does not need to re-read thousands of words of conversation history. It simply reads the flight recorder file and restores its cognitive state in milliseconds.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">1. Python Agent Connector</h4>
  <p>
    For Python agent architectures, the core toolkit contains:
  </p>
  <ul class="list-disc pl-5 space-y-2">
    <li><code>save_active_context.py</code>: Serializes conversation histories, active task trees, and variable lists into encrypted block containers.</li>
    <li><code>recall_context.py</code>: Command line interface to query, inspect, and selectively lazy load specific variables or dialogue turns.</li>
    <li><code>autonomous_optimizer.py</code>: Background optimization process that runs memory decay algorithms, links context files, and purges obsolete tokens.</li>
  </ul>

  <h4 class="text-white font-semibold text-base mt-4">2. High-Performance Bindings (C++ & vLLM)</h4>
  <p>
    For systems requiring native tensor operations:
  </p>
  <ul class="list-disc pl-5 space-y-2">
    <li><strong>vLLM Runtimes</strong>: Connects directly to the virtual memory manager (<code>PagedAttention</code> blocks), writing active KV pages straight to disk to bypass re-tokenization.</li>
    <li><strong>Llama.cpp Engines</strong>: Utilizes custom hooks on <code>llama_state_get_data()</code> and <code>llama_state_set_data()</code> to serialize internal layer states.</li>
  </ul>

  <h4 class="text-white font-semibold text-base mt-4">3. Local Environment Variables</h4>
  <p>
    Configure your runtime environment by adding the path variables in your local environment file:
  </p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-coral">
AI_FORMAT_PATH="./.ai/checkpoints"
AI_KEYCHAIN_PATH="~/.ai/keys"</pre>
</div>`,
    note: "Official packages are compiled for Python 3.10+ and C++17 compilers. Make sure you install the cryptography libraries before compiling native bindings."
  },
  "File format spec": {
    tag: "SPEC",
    title: "AIF_V3 Binary Specification",
    desc: "The binary file layout of the Version 3 format, specifying HMAC signatures, lazy load indexes, and quantization layers.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <p>
    The <code>.ai</code> format is a block-partitioned binary container designed for secure, lazy-loaded cognitive snapshots. It separates unencrypted metadata indexing from encrypted payload data.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">1. Binary Layout Structure</h4>
  <p>
    The file layout is split into a clear metadata index block and individual encrypted block containers:
  </p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-coral">
+------------------+---------------------+-------------------+-----------------------+-------------------------+
| MAGIC (4 bytes)  | HEADER_LEN (4 bytes)| HEADER_MAC (32B)  | UNENCRYPTED JSON      | PAYLOAD (Concatenated   |
| 'AIF\\x03'        | Big-Endian Integer  | HMAC-SHA256 of    | HEADER (block maps,   | block ciphertexts       |
|                  |                     | JSON header       | graph links, salts)   | encrypted with salts)   |
+------------------+---------------------+-------------------+-----------------------+-------------------------+</pre>

  <h4 class="text-white font-semibold text-base mt-4">2. Crypotographic Envelope & Security</h4>
  <p>
    Authentication uses a keyed Encrypt-then-MAC (EtM) standard. Bulk encryption of context blocks is handled via <strong>AES-256-GCM</strong>. Public key exchanges use post-quantum cryptography (<strong>ML-KEM / Kyber</strong>) to ensure context files are locked to authorized agent identities.
  </p>

  <h4 class="text-white font-semibold text-base mt-4 font-display-serif italic">The Memory Decay Analogy</h4>
  <p>
    Consider how human memory works over time. If you attend a technical lecture today, you remember the exact words, specific slides, and side comments (FP16_RAW). A day later, you forget the side comments and specific words, but you remember the main points and key formulas (INT8). A month later, you only remember the core concept and how it relates to your overall knowledge base (INT2). The temporal decay engine applies this exact hierarchy to agent memory. It reduces the precision of older snapshots on a schedule, dropping auxiliary conversational details while retaining the core logic needed to continue the work.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">3. Quantization Layers</h4>
  <p>
    Continuous attention weights are mapped into low-bit representation buckets:
  </p>
  <ul class="list-disc pl-5 space-y-2">
    <li><code>FP16_RAW</code>: Full-precision, raw embedding vectors. Reserved for high-importance, actively referenced context blocks.</li>
    <li><code>INT8</code>: 8-bit integer quantization mapping. Used for active, medium-term dialogue context.</li>
    <li><code>INT2_DEEP_SUMMARY</code>: 2-bit semantic quantization. Applied to ancient historical nodes, storing only high-level concept summaries.</li>
  </ul>
</div>`,
    note: "The magic file signature is 'AIF' followed by byte version 0x03. Legacy V1 and V2 files are automatically migrated by the background optimizer."
  },
  "Integration guides": {
    tag: "GUIDE",
    title: "Runtime Agent Integration",
    desc: "A step-by-step workflow to integrate the .ai serialization engine and temporal forgetting curves into your agent execution loop.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <p>
    Wiring the <code>ai-format</code> modules into your autonomous agent ensures state integrity, security, and context efficiency across restarts.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">Step 1: Instantiating the Context Engine</h4>
  <p>
    Load the AEAD block engine from <code>ai_format_production.py</code> at agent startup. This handles HMAC verification, key checking, and directory setup:
  </p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-coral">
from ai_format_production import ProductionAIContextFile

key = b"super_secret_agent_identity_key_32b"
engine = ProductionAIContextFile(master_key_bytes=key)</pre>

  <h4 class="text-white font-semibold text-base mt-4 font-display-serif italic">The Video Game Checkpoint Analogy</h4>
  <p>
    Think of integrating this SDK like adding a save-game feature to a role-playing game. When you save your progress in a game, the system does not write down every battle, step, and dialogue line you have experienced. Instead, it saves a snapshot containing your coordinates, items in your inventory, and a list of completed quests. When you load the game, you resume immediately from that spot. The ai-format SDK does the same for your agent: it saves the current task list, variables, and goal tree, allowing the agent to resume instantly without repeating the entire conversation.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">Step 2: Executing the Serialization Loop</h4>
  <p>
    Hook the save script into your execution milestones (e.g. after a task is finished or during process cleanup):
  </p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-coral">
try:
    # Run agent execution steps
    agent.execute_cycle()
    
    # Save checkpoint state upon success
    engine.serialize(metadata, payload, "checkpoints/milestone_1.ai")
except Exception as e:
    # Recover state instantly from last known checkpoint
    metadata, payload = engine.deserialize("checkpoints/milestone_1.ai")</pre>

  <h4 class="text-white font-semibold text-base mt-4">Step 3: Background Optimizer Daemon</h4>
  <p>
    Run the <code>autonomous_optimizer.py</code> script as a background daemon process. It periodically runs forgetting curves (<code>ai_format_temporal.py</code>) on inactive checkpoint files to compress their payload.
  </p>
</div>`,
    note: "All files inside the checkpoints directory are encrypted. The symmetric decryption keys are managed automatically using your OS-restricted AppData keyring folder."
  },
  "API reference": {
    tag: "API",
    title: "Framework API & Signatures",
    desc: "Complete documentation of the save, load, decay, and link methods exposed by the core Python scripts.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <p>
    This reference covers the API primitives and method signatures used to interact with the AIF_V3 serialization container.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">1. save_context(transcript, key_path, output_path)</h4>
  <p>
    Serializes active memory, runs quantization algorithms, creates the AIF_V3 block layout, and signs the envelope.
  </p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-coral">
def serialize(
    metadata: dict,
    payload_data: dict,
    output_path: str
) -> int</pre>
  <p>
    Returns the file size in bytes. Throws PermissionError if the HMAC signature check fails.
  </p>

  <h4 class="text-white font-semibold text-base mt-4 font-display-serif italic">The Library Index Analogy</h4>
  <p>
    Think of the ProductionAIContextFile class like a library index. When you request a book, the librarian does not read every index card in the building. They look up the unique catalog number to retrieve the book directly. The <code>read_header</code> and <code>deserialize_block</code> methods perform this catalog search, verifying that the file path is correct and retrieving the data directly without reading unrelated files.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">2. load_context(key_path, block_name)</h4>
  <p>
    Implements partial envelope unpacking (lazy loading). Reads the HMAC-verified header index, and decrypts only the requested block bytes.
  </p>
  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-coral">
def deserialize_block(
    input_path: str,
    block_id: str
) -> tuple</pre>

  <pre class="bg-black/40 border border-white/8 rounded-lg p-4 font-mono text-xs text-coral">
def optimize_context_file(
    file_path: str,
    active_keywords: list = None
) -> bool</pre>
  <p>
    Decays low-attention blocks, and links sequential files into a directed acyclic graph (DAG) using cryptographic hash pointers.
  </p>
</div>`,
    note: "API methods are synchronous by default in Python, but leverage background threading in C++ bindings to ensure zero blocking on primary LLM threads."
  },
  Changelog: {
    tag: "LOG",
    title: "Version History & Releases",
    desc: "Detailed changelog tracking the format's evolution from prototypes to version 3.0.0.",
    content: `<div class="space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
  <p>
    This log tracks releases and modifications for the <strong>ai-format</strong> library.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">v3.0.0 (Production Release)</h4>
  <ul class="list-disc pl-5 space-y-2">
    <li>Added AIF_V3 block-based serialization layout to support selective decryption.</li>
    <li>Implemented Partial Envelope Unpacking (lazy loading) to reduce CPU overhead.</li>
    <li>Added support for neural graph connectivity and cryptographic DAG tracking.</li>
    <li>Integrated ML-KEM / Kyber post-quantum cryptography keyrings.</li>
  </ul>

  <h4 class="text-white font-semibold text-base mt-4 font-display-serif italic">The Blueprint Analogy</h4>
  <p>
    Consider the difference between a rough hand-drawn sketch and a detailed architectural blueprint. A sketch is quick to draw but lacks precision, and different people will interpret it differently. A blueprint uses standardized symbols, exact dimensions, and clear labels so that any contractor can build the structure identically. In this changelog, each release represents a refinement of our blueprint, turning initial rough ideas into a standardized, reliable specification for cognitive context persistence.
  </p>

  <h4 class="text-white font-semibold text-base mt-4">v2.0.0 (Temporal Update)</h4>
  <ul class="list-disc pl-5 space-y-2">
    <li>Added temporal memory decay with exponential Ebbinghaus forgetting curves.</li>
    <li>Introduced the three attention-based quantization tiers (FP16_RAW, INT8, and INT2).</li>
  </ul>
</div>`,
    note: "Please update your local environment execution wrappers to ensure full V3 compatibility."
  }
};

export default function DocPortal() {
  const [activeTab, setActiveTab] = useState("SDKs & clients");
  const doc = DOCS_DATA[activeTab];

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
            text="The portal provides integration guides, API references, and the full format specification. Click through the preview below to explore the SDK."
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
