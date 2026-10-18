# .ai-format (AIF V4)

<p align="center">
  <a href="https://ai.sednium.com">
    <img src="logo.png" width="160" alt=".ai-format Logo" />
  </a>
</p>

<p align="center">
  <a href="https://ai.sednium.com"><strong>ai.sednium.com</strong></a>
</p>

<p align="center">
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Code%20of%20Conduct-Sednium-purple.svg" alt="Code of Conduct" /></a>
  <a href="TERMS_AND_CONDITIONS.md"><img src="https://img.shields.io/badge/Terms-Sednium-green.svg" alt="Terms and Conditions" /></a>
  <img src="https://img.shields.io/badge/Rust-100%25%20Passing-brightgreen.svg" alt="Rust Build Status" />
  <img src="https://img.shields.io/badge/Version-4.0%20(Rust)-orange.svg" alt="AIF V4" />
</p>

**Author**: Bhoid

---

## What is AIF V4?

AIF (`.ai`) is an authenticated, block-partitioned cognitive memory engine for autonomous AI coding agents.

Standard agent sessions suffer from context window saturation, repetitive input-prefill token costs, lost states on user interrupts, and memory silos between projects. AIF V4 replaces raw flat text logs with a compiled Rust engine (`aif`).

### Key Pillars

- **Single Device Master Key**: All projects on the machine share a unified 256-bit AEAD key (`~/.gemini/ai-format/keys/aif_device.key`) restricted to `0600` permissions on Unix.
- **Three Orbital Gravity Rings**: `INT16_CORE` ($S_{attn} \ge 0.7$), `INT8_RING` ($0.30 \le S_{attn} < 0.70$ with stop-word pruning), and `INT2_CRUST` ($S_{attn} < 0.30$ with gist summaries).
- **Cross-Project Synaptic Bridge**: Query memories across different repositories in sub-millisecond time via byte-offset pointers.
- **Zero-Token Git Hook Automation**: `aif init` installs a `.git/hooks/post-commit` script. Every commit is automatically indexed into `INT16_CORE` with zero prompt tokens and zero tool calls.
- **Interrupt Protection**: Flushes in-flight work to `INT16_CORE` with priority `0.95` on `Ctrl+C`, `SIGINT`, or `SIGTERM`.
- **Partial Envelope Unpacking**: Verifies and decrypts requested memory blocks without loading entire files into memory.

---

## Quick Setup

### Method 1: The One-Line Terminal Installer

Install the compiled binary directly into `~/.local/bin/aif`:

**Linux & macOS:**
```bash
curl -fsSL https://ai.sednium.com/install.sh | sh
```

**Windows (PowerShell):**
```powershell
irm https://ai.sednium.com/install.ps1 | iex
```

---

### Method 2: The Universal Agent Migration Prompt

Copy and paste this instruction block into Cursor, Claude Code, Antigravity, Windsurf, Copilot, or ChatGPT. Your agent will clone the repository, build the Rust binary, configure your global agent rules, register the Antigravity plugin, and initialize persistent cognitive memory automatically:

```text
You are an expert systems engineer. Your task is to install the AIF V4 (ai-format) cognitive memory engine on this machine, integrate its memory lifecycle into my global agent rules and Antigravity plugin hierarchy, and initialize cognitive persistence across all execution harnesses.

Follow these exact steps:

1. Clone and Build:
   - Check if ~/.ai-format exists. If not, run:
     git clone https://github.com/CoderBhoid/ai-format.git ~/.ai-format
   - Inside ~/.ai-format, run:
     cargo build --release
   - Ensure the compiled binary (~/.ai-format/target/release/aif) is executable.
   - Symlink or copy the binary to a directory in PATH:
     mkdir -p ~/.local/bin && ln -sf ~/.ai-format/target/release/aif ~/.local/bin/aif
     (or run ./ai.sh from ~/.ai-format).
   - Verify `aif --help` executes successfully.

2. Initialize Workspace Memory:
   - In my current workspace, run:
     aif init --project "$(basename "$PWD")" --model "default"
   - Verify that <project>.ai, .git/hooks/post-commit, and ~/.gemini/ai-format/bridge_nexus.ai are created.
   - Confirm that the shell auto-save exit trap is active in ~/.bashrc or ~/.zshrc.

3. Install Antigravity Plugin & Global Skills (if ~/.gemini/ exists):
   - To guarantee that AIF is never bypassed by other plugins (e.g., agystack / poteto-mode), install AIF as a first-class Antigravity plugin so Antigravity loads it directly into <user_rules>:
     a) Create plugin folders:
        mkdir -p ~/.gemini/config/plugins/aif/rules
        mkdir -p ~/.gemini/config/plugins/aif/skills/aif
        mkdir -p ~/.gemini/config/plugins/aif/skills/ai-context-saving
        mkdir -p ~/.gemini/config/skills/aif
        mkdir -p ~/.gemini/config/skills/ai-context-saving

     b) Create ~/.gemini/config/plugins/aif/plugin.json:
        {
          "$schema": "https://antigravity.google/schemas/v1/plugin.json",
          "name": "aif",
          "displayName": "AIF Cognitive Memory & Synaptic Bridge (V4)",
          "version": "4.0.0",
          "description": "Authenticated, block-partitioned cognitive memory engine and cross-project synaptic bridge for autonomous agents (AIF V4)."
        }

     c) Copy agentic-skill/AGENTS.md to ~/.gemini/config/plugins/aif/rules/AGENTS.md and ~/.gemini/config/AGENTS.md.
     d) Copy agentic-skill/SKILL.md to ~/.gemini/config/plugins/aif/skills/aif/SKILL.md, ~/.gemini/config/plugins/aif/skills/ai-context-saving/SKILL.md, ~/.gemini/config/skills/aif/SKILL.md, and ~/.gemini/config/skills/ai-context-saving/SKILL.md.

4. Configure Workspace & Multi-Harness Rules:
   - Write or update ./AGENTS.md in the current workspace root.
   - For Cursor, append to .cursorrules or ~/.cursorrules.
   - For Claude Code, append to CLAUDE.md or ~/.claude/CLAUDE.md.
   - For Windsurf, append to .windsurfrules or ~/.windsurfrules.
   - Enforce the following mandatory operating loop:
     """
     # AIF V4 Cognitive Memory & Synaptic Bridge

     ## Mandatory Cognitive Persistence Invariant

     This invariant governs cognitive memory lifecycle across ALL execution harnesses, workflows, and subagent delegates (including poteto-mode, agystack, autonomous swarms, and coordinator sessions).

     Subagent delegation (such as poteto-agent or research) does NOT waive this invariant. The coordinator MUST execute the boot recall and scratch checkpoints before spawning subagents, and MUST commit turn notes upon receiving subagent results.

     ### 1. Chat Boot Recall (Mandatory on First Turn)
     Before invoking subagents, reading playbooks, or modifying files:
     Run:
     aif recall --core-and-bridge
     - Instantly loads active project Red Core (INT16_CORE) blocks, including any [PAUSED_MID_TASK] checkpoint from interrupted prior sessions.
     - Injects relevant cross-project pointers from the Cross-Project Bridge Nexus (bridge_nexus.ai) into working context.

     ### 2. Pre-Task Volatile Scratch (Interrupt Protection)
     Before initiating multi-file edits, long test runs, refactors, or delegating code writes to a subagent:
     Run:
     aif scratch "<current goal, subagent task spec, and active working state>"
     - Arms the OS-level signal trap. If execution is interrupted (Ctrl+C, SIGINT, SIGTERM), the engine automatically flushes this scratch buffer into the active project's INT16_CORE with importance 0.95 and the [PAUSED_MID_TASK] marker.

     ### 3. Subagent Memory Synchronization
     When coordinating delegate subagents (e.g., poteto-agent):
     - Pass relevant INT16_CORE architectural constraints and schemas directly in the subagent prompt.
     - When the subagent yields control or returns diffs, record the completed milestone and architectural changes into AIF immediately.

     ### 4. End-of-Turn Cognitive Commit (Every Productive Turn)
     Before concluding any productive turn, evaluate the cognitive importance of the turn (0.0 to 1.0) and commit a note:
     aif note --importance <0.0-1.0> --summary "<concise summary of decisions and code modifications>"
     - 0.70 - 1.00 (Red Core / INT16_CORE): Critical architecture, API schemas, breaking changes, or interrupted tasks. Automatically indexed into bridge_nexus.ai.
     - 0.30 - 0.69 (Black Middle Ring / INT8_RING): Implementation notes, bug fixes, routine turn summaries. Pruned for token efficiency.
     - 0.00 - 0.29 (Blue Outer Crust / INT2_CRUST): Transient observations, fleeting logs, deep summaries.
     """

5. Verification:
   - Run: `aif scratch "Verification test"`
   - Run: `aif note --importance 0.95 --summary "AIF V4 plugin & multi-harness integration complete" --tags "setup,init,plugin"`
   - Run: `aif recall --core-and-bridge`
   - Confirm that the note is retrieved from INT16_CORE and report success.
```


---

### Method 3: Manual Developer Build

```bash
git clone https://github.com/CoderBhoid/ai-format.git
cd ai-format
cargo test
cargo build --release
./ai.sh init --project my_project --model default
```

---

## Memory Automation and Discipline

AIF V4 provides two complementary mechanisms for memory persistence.

### 1. Zero-Token Git Post-Commit Hook
When `aif init` runs in a git repository, it writes an executable hook to `.git/hooks/post-commit`:
```sh
#!/bin/sh
MSG=$(git log -1 --pretty=%s 2>/dev/null)
if [ -n "$MSG" ]; then
  aif note --project <project> --importance 0.85 --summary "Git commit: $MSG" --tags "git,commit" >/dev/null 2>&1 || true
fi
```
Every time code is committed, Git invokes `aif note` automatically.
This captures project progress into `INT16_CORE` without consuming prompt tokens or agent tool calls.

### 2. Automatic Shell / App Close Exit Trap
When `aif init` runs, it registers an auto-save exit trap in `~/.bashrc` and `~/.zshrc`:
```sh
trap 'if [ -f .aif_config.json ] && command -v aif >/dev/null 2>&1; then aif note --importance 0.90 --summary "Workspace session closed" --tags "lifecycle,auto-save" >/dev/null 2>&1; fi' EXIT SIGHUP SIGTERM
```
Whenever the user closes their terminal tab, exits their shell, or shuts down their IDE, the OS sends an exit signal.
The trap executes in milliseconds and checkpoints the session into `AIF.ai`.

### 3. Agent Turn Self-Scoring & User Reminder
During active conversations, the agent self-evaluates each turn:
```bash
aif note --project <project> --importance 0.85 --summary "<what was decided>"
```
If an agent becomes absorbed in complex debugging or multi-file refactoring, users can remind it:
> *"Remember to note in .ai"*

This prompts the agent to flush its working conclusions to disk.

### 4. Native Antigravity Plugin & Harness Hierarchy Enforcement
Modern agent platforms (such as Antigravity) discover rules hierarchically:
- Plugin rules (`~/.gemini/config/plugins/<name>/rules/AGENTS.md`) are automatically mounted into the root `<user_rules>` block on every turn and in every directory.
- Workflows such as `agystack` / `poteto-mode` aggressively enforce delegate subagents (`poteto-agent`) in fresh context windows, which can bypass memory checkpoints if instructions live only in project subfolders.
- By packaging AIF as a first-class Antigravity plugin (`~/.gemini/config/plugins/aif`), AIF's **Supreme Cognitive Persistence Invariant** is injected directly into `<user_rules>`. This binds coordinators to run `aif recall` on turn 1, write `aif scratch` before delegating, and commit `aif note` when subagents report back.

---

## Architectural Principles

### 1. Three Concentric Orbital Gravity Rings

Each project stores memory blocks in `<project_id>.ai`. Blocks are grouped into three concentric orbital gravity rings inside the HMAC-SHA256 authenticated header:

```
+---------------------------------------------------------------------------------+
|                                 BLUE CRUST                                      |
|                             (INT2_DEEP_SUMMARY)                                 |
|                               S_attn < 0.30                                     |
|           +---------------------------------------------------------+           |
|           |                    BLACK MIDDLE RING                    |           |
|           |                      (INT8_RING)                        |           |
|           |                  0.30 <= S_attn < 0.70                  |           |
|           |           +---------------------------------+           |           |
|           |           |            RED CORE             |           |           |
|           |           |     (INT16_CORE / FP16_RAW)     |           |           |
|           |           |          S_attn >= 0.70         |           |           |
|           |           +---------------------------------+           |           |
|           +---------------------------------------------------------+           |
+---------------------------------------------------------------------------------+
```

- **Red Core (`INT16_CORE` / `FP16_RAW`, $S_{attn} \ge 0.7$)**:
  High-importance architectural decisions, interrupted states, and critical schemas. Loaded automatically on session start and indexed in the Cross-Project Bridge.
- **Black Middle Ring (`INT8_RING`, $0.30 \le S_{attn} < 0.70$)**:
  Routine turn notes and working memory. Helper and stop words are pruned to save tokens while preserving semantic intent. Lazy-loaded on demand via byte-range `Seek`.
- **Blue Outer Crust (`INT2_CRUST` / `INT2_DEEP_SUMMARY`, $S_{attn} < 0.30$)**:
  Fleeting thoughts and temporally decayed memories compressed into compact gist summaries.

### 2. Cross-Project Synaptic Bridge (`bridge_nexus.ai`)
The master bridge index lives at `~/.gemini/ai-format/bridge_nexus.ai`. It records each project's canonical path, topic tags, and direct byte-offset pointers to Red Core (`INT16_CORE`) blocks.

When an agent in Project B queries context from Project A:
```bash
aif bridge --query "authentication"
```
The engine inspects the bridge index, seeks directly to Project A's `INT16_CORE` byte offset, verifies the block HMAC, and decrypts the memory in sub-millisecond time (<1ms) without unpacking outer rings.

### 3. Interrupt Trap & Scratch Buffer
Agents write in-flight intent to `.scratch_state.tmp` before long commands:
```bash
aif scratch "Migrating database schema: adding accounts table"
```
If the process terminates (`Ctrl+C`, `SIGINT`, `SIGTERM`), the signal handler immediately commits the scratch text into active project `INT16_CORE` with importance `0.95` and the `[PAUSED_MID_TASK]` marker before exiting.

### 4. Cryptographic Guarantees
- **Unified Keychain**: All repositories on the system use the device key at `~/.gemini/ai-format/keys/aif_device.key` (`0600` permissions).
- **Key Derivation**: SHA-256 key splitting derives independent encryption ($K_{enc}$) and authentication ($K_{mac}$) keys from the 32-byte master key.
- **Cipher**: ChaCha20 stream cipher with unique 16-byte random salts per block.
- **Authentication**: Encrypt-then-MAC using HMAC-SHA256 over `salt + ciphertext` and over the structural JSON header.
- **Side-Channel Protection**: Constant-time MAC comparison prevents timing attacks.

---

## Detailed Command Manual

### 1. `aif init`
Initializes a new project container and generates a deterministic 256-bit AEAD key in the local keychain. Installs the automatic `.git/hooks/post-commit` hook if a git repository is detected. Scans the workspace and home directory for AI harness configuration files (`.cursorrules`, `CLAUDE.md`, `AGENTS.md`, Windsurf) and appends the standard memory loop.

```bash
aif init --project <project_name> --model <model_id>
```
- `--project`, `-p`: Project name (defaults to current directory name or workspace config).
- `--model`, `-m`: Model identifier (defaults to current running model).

---

### 2. `aif note`
Appends a self-scored cognitive memory block into `<project>.ai`. Places the block into Red Core, Middle Ring, or Outer Crust according to the evaluated importance score. Automatically indexes Red Core blocks on the Cross-Project Bridge.

```bash
aif note --project <project> --importance <0.0-1.0> --summary "<text>" [--tags "<t1,t2>"] [--content "<full_text>"]
```
- `--importance`, `-i`: Attention score from `0.0` to `1.0`.
- `--summary`, `-s`: Concise description of the decision or action.
- `--tags`, `-t`: Comma-separated list of topic tags.
- `--content`, `-c`: Optional full-length content (defaults to summary).

---

### 3. `aif recall`
Queries and unpacks memory blocks using Partial Envelope Unpacking. Reads only the necessary byte ranges from disk.

```bash
aif recall [--core-and-bridge] [--all] [--query <term>] [--block <id>] [--vars] [--header]
```
- `--core-and-bridge`: Boot mode. Preloads Red Core blocks and prints connected bridge projects.
- `--query`, `-q`: Filters blocks by topic tag or text content.
- `--block`, `-b`: Loads a specific block by its unique identifier.
- `--vars`: Loads only project context variables.
- `--header`: Validates HMAC and prints unencrypted header JSON without decrypting payload blocks.
- `--all`: Dumps and authenticates all blocks in the file.

---

### 4. `aif bridge`
Queries the master cross-project nexus (`bridge_nexus.ai`) and performs sub-millisecond direct seeks into other projects' Red Core blocks.

```bash
aif bridge [--query "<term>"] [--project <project_name>] [--reindex]
```
- `--query`, `-q`: Topic query to search across all registered projects.
- `--project`, `-p`: Scope search to a specific external project.
- `--reindex`: Forces re-indexing of all Red Core blocks for the active project.

---

### 5. `aif scratch`
Writes in-flight intent, active step progress, and volatile variables to `.scratch_state.tmp`.

```bash
aif scratch "<current step and in-flight variables>"
```

---

### 6. `aif reweight`
Manually adjusts the importance score of an existing memory block. Dynamically recalculates orbital ring assignment and migrates the block between Red Core, Middle Ring, and Outer Crust.

```bash
aif reweight --block <block_id> --importance <0.0-1.0> [--project <project>]
```

---

### 7. `aif optimize`
Applies Ebbinghaus temporal decay across all memory blocks:
$$S_{attn}^{(t)} = \max(0, S_{attn}^{(t-1)} - \delta) + \text{keyword\_boost}$$
Migrates blocks across rings, updates pruning, and upgrades legacy `AIF\x03` files to `AIF\x04`.

```bash
aif optimize [--delta <decay_rate>] [--keywords "<kw1,kw2>"] [--project <project>]
```
- `--delta`, `-d`: Temporal decay step (default: 0.05).
- `--keywords`, `-k`: Active keywords to boost relevance and resist decay.

---

### 8. `aif watch`
Runs a foreground daemon holding active OS signal trap hooks (`SIGINT`, `SIGTERM`, `SIGHUP`). If interrupted, flushes `.scratch_state.tmp` directly into Red Core with `[PAUSED_MID_TASK]` priority.

```bash
aif watch [--project <project>] [--model <model>]
```

---

## Repository Structure

```
.
├── AGENTS.md                   # Supreme cognitive memory invariant (workspace root)
├── Cargo.toml                  # Rust crate manifest (aif binary & lib)
├── ai.sh                       # Linux/macOS wrapper script (auto-builds release)
├── ai.bat                      # Windows wrapper script (auto-builds release)
├── install.sh                  # One-line POSIX installer
├── install.ps1                 # One-line Windows PowerShell installer
├── ci/
│   └── release.yml             # Multi-platform release workflow recipe
├── src/
│   ├── lib.rs                  # Module exports
│   ├── crypto.rs               # Keychain, ChaCha20, stream cipher, HMAC-SHA256
│   ├── orbital.rs              # AIF\x04 binary parser, 3 orbital rings, partial unpack
│   ├── bridge.rs               # bridge_nexus.ai cross-project router
│   ├── interrupt.rs            # Scratch buffer and SIGINT/SIGTERM trap
│   ├── config.rs               # Workspace config & IDE auto-detection
│   └── main.rs                 # Clap CLI parser with git hook installer
├── tests/
│   └── integration_v4.rs       # Comprehensive integration test suite (5/5 passing)
├── agentic-skill/
│   ├── AGENTS.md               # Autonomous agent lifecycle instructions
│   └── SKILL.md                # Skill specification and tool reference
├── legacy_v3_python/           # Archived Python V3 reference scripts
└── website/                    # Landing page and documentation portal (Urbanist)
```

---

## Testing

Run the automated test suite:

```bash
cargo test
```

Verification covers:
1. Deterministic key generation and Unix `0600` permission enforcement.
2. ChaCha20 encryption and HMAC tamper detection.
3. Orbital ring placement (`INT16_CORE`, `INT8_RING`, `INT2_CRUST`) and dynamic reweighting.
4. Sub-millisecond cross-project bridge queries via byte-range seek.
5. Simulated interrupt scratch flushes to `INT16_CORE`.
6. Backward compatibility and seamless migration from `AIF\x03` to `AIF\x04`.

---

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for details.
Community participation is subject to [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
Usage terms and ethical AI requirements are described in [TERMS_AND_CONDITIONS.md](TERMS_AND_CONDITIONS.md).

<p align="center">Built with ❤️ by <a href="https://github.com/CoderBhoid">Bhoid</a></p>
