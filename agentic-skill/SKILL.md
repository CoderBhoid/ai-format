---
name: aif
description: Deterministic, model-agnostic, local-first version control and state checkpoints for LLMs and agents using the compiled AIF V4 Rust engine. Use on session start for boot recall, before multi-step tasks to write scratch state, at the end of every turn to commit notes into orbital rings, when querying cross-project memory via the synaptic bridge, or when running temporal memory optimization.
---

# AIF V4: Deterministic Version Control & State Checkpoints for LLMs & Agents

Operational guide for deterministic, model-agnostic, local-first version control and state checkpoints using the compiled `aif` Rust engine (`AIF\x04`).

---

## When to Use

- **Session Start**: Always run on turn 1 to recall high-importance architectural context and active task states.
- **Before Complex or Risky Tasks**: Write scratch state to protect in-flight progress against unexpected cancellation or user interrupts (`Ctrl+C`).
- **End of Every Turn**: Persist cognitive decisions, API changes, bug fixes, and milestones into orbital rings.
- **Cross-Project Inquiries**: Query connected repositories through the synaptic bridge (`bridge_nexus.ai`).
- **Memory Maintenance**: Apply temporal decay and reweight obsolete or elevated memories.

## When NOT to Use

- Casual conversational banter or one-word clarifying questions with no state change.
- Environments where `aif` binary is unavailable and cannot be built.
- Scratch or temporary sandboxes where persistence across sessions is explicitly not desired.

---

## Orbital Gravity Rings

Memories are partitioned into three concentric rings based on cognitive score ($S_{attn}$):

1. **Red Core (`INT16_CORE` / `FP16_RAW`, $S_{attn} \ge 0.70$)**:
   - High-importance architectural decisions, schemas, and interrupted checkpoints (`[PAUSED_MID_TASK]`).
   - Preloaded on boot recall and synchronized to `bridge_nexus.ai`.
2. **Black Middle Ring (`INT8_RING`, $0.30 \le S_{attn} < 0.70$)**:
   - Standard turn summaries and implementation notes.
   - Stop words pruned to conserve tokens while preserving semantic intent.
3. **Blue Outer Crust (`INT2_CRUST`, $S_{attn} < 0.30$)**:
   - Ultra-compact gist summaries and decayed memories.

---

## Execution Workflow

```
+--------------------------------------------------------------------------------+
| 1. Boot Recall      -->  aif recall --core-and-bridge                          |
| 2. In-Flight Work   -->  aif scratch "<active goal and variables>"             |
| 3. Turn Commit      -->  aif note --importance <0.0-1.0> --summary "<action>"  |
| 4. Cross-Project    -->  aif bridge --query "<topic>"                          |
| 5. Maintenance      -->  aif optimize --delta 0.05                             |
+--------------------------------------------------------------------------------+
```

---

## CLI Command Reference

### 1. Workspace Initialization
```bash
aif init --project "<project_name>" --model "default"
```
Creates `<project_name>.ai`, initializes the 256-bit AEAD key in `~/.gemini/ai-format/keys/`, registers the project in `bridge_nexus.ai`, and installs the git post-commit hook.

### 2. Boot Recall
```bash
aif recall --core-and-bridge
```
Preloads active project `INT16_CORE` blocks and lists cross-project bridge pointers.

### 3. Volatile Scratch (Interrupt Defense)
```bash
aif scratch "Refactoring auth handler and verifying token signature"
```
Writes active intent to the volatile scratch buffer. On `SIGINT`, `SIGTERM`, or abrupt stop, the signal trap automatically flushes this buffer into `INT16_CORE` with importance `0.95`.

### 4. Turn Memory Commit
```bash
aif note --importance 0.85 --summary "Completed Rust rewrite of crypto module" --tags "crypto,aead,rust"
```
Commits the turn's summary into the appropriate orbital ring.

### 5. Cross-Project Bridge Query
```bash
aif bridge --query "authentication"
```
Performs partial envelope unpacking across linked projects via byte-offset pointers.

### 6. Dynamic Memory Reweighting
```bash
aif reweight --block note_1720000000_0 --importance 0.90
```
Updates the importance of a block and dynamically migrates it between orbital rings.

### 7. Temporal Optimization & Decay
```bash
aif optimize --delta 0.05 --keywords "auth,crypto"
```
Applies Ebbinghaus temporal decay:
$$S_{attn}^{(t)} = \max(0, S_{attn}^{(t-1)} - \delta) + \text{keyword\_boost}$$
Migrates decayed blocks outward to conserve context space.
