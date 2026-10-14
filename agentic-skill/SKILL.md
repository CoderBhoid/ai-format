---
name: ai-context-saving
description: "Teaches the agent how to save, recall, bridge, and optimize cognitive context using the high-performance AIF V4 Rust engine with orbital gravity rings, cross-project bridging, and interrupt protection."
---

# AIF V4 Agent Memory & Synaptic Bridge Skill

This skill defines the operational procedures for managing persistent cognitive memory states using the compiled `aif` Rust engine (`AIF\x04`).

---

## 1. Quick Start Workflow

```
+-------------------------------------------------------------------------------+
| 1. Chat Boot        -->  aif recall --core-and-bridge                         |
| 2. During Work      -->  aif scratch "<active step / in-flight state>"        |
| 3. End of Turn      -->  aif note --importance <0.0-1.0> --summary "<action>" |
| 4. Cross-Project    -->  aif bridge --query "<topic>"                         |
| 5. Maintenance      -->  aif optimize --delta 0.05                            |
+-------------------------------------------------------------------------------+
```

---

## 2. Orbital Gravity Rings (`AIF\x04`)

Memories are partitioned into three concentric orbital rings based on agent self-evaluation:

1. **Red Core (`INT16_CORE` / `FP16_RAW`, $S_{attn} \ge 0.7$)**:
   - Stores architectural decisions, critical project schemas, and interrupted states (`[PAUSED_MID_TASK]`).
   - Automatically loaded on session initialization and indexed in `bridge_nexus.ai`.
2. **Black Middle Ring (`INT8_RING`, $0.3 \le S_{attn} < 0.7$)**:
   - Working memories, implementation details, and turn summaries.
   - Common helper words and stop words are pruned to save tokens while preserving semantics.
   - Lazy-loaded on demand via byte-range `Seek` (Partial Envelope Unpacking).
3. **Blue Outer Crust (`INT2_CRUST` / `INT2_DEEP_SUMMARY`, $S_{attn} < 0.3$)**:
   - Minor observations and temporally decayed memories.
   - Ultra-compact gist summaries.

---

## 3. CLI Command Reference

### A. Initialization
```bash
./ai.sh init --project <project_id> --model <model_id>
```
Creates `<project_id>.ai`, generates the deterministic 256-bit AEAD key in `~/.gemini/ai-format/keys/<project_id>__<model_id>.key` with `0600` permissions, registers the project in `bridge_nexus.ai`, and sets workspace defaults.

### B. Boot Recall
```bash
./ai.sh recall --core-and-bridge
```
Preloads active project `INT16_CORE` blocks and lists cross-project synaptic pointers without touching outer rings.

### C. Write Volatile Scratch State
```bash
./ai.sh scratch "Refactoring auth handler and verifying token signature"
```
Writes in-flight intent to `.agents/ai-format/.scratch_state.tmp`. On `SIGINT`/`SIGTERM`/abrupt stop, the engine automatically commits this scratch buffer into `INT16_CORE` with importance `0.95`.

### D. End-of-Turn Memory Commit
```bash
./ai.sh note --importance 0.85 --summary "Completed Rust rewrite of crypto module" --tags "crypto,aead,rust"
```

### E. Cross-Project Bridge Query
```bash
./ai.sh bridge --query "authentication"
```
Performs sub-millisecond Partial Envelope Unpacking directly into the target project's `INT16_CORE` byte offsets without loading outer rings.

### F. Reweight Memory
```bash
./ai.sh reweight --block note_1720000000_0 --importance 0.90
```

### G. Autonomous Temporal Optimization
```bash
./ai.sh optimize --delta 0.05 --keywords "auth,crypto"
```
Applies Ebbinghaus temporal decay:
$$S_{attn}^{(t)} = \max(0, S_{attn}^{(t-1)} - \delta) + \text{keyword\_boost}$$
Migrates blocks across rings and upgrades legacy `AIF\x03` files to `AIF\x04`.
