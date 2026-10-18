# AIF V4 Cognitive Memory & Synaptic Bridge

## Mandatory Cognitive Persistence Invariant

This invariant governs cognitive memory lifecycle across ALL execution harnesses, workflows, and subagent delegates (including `poteto-mode`, `agystack`, autonomous swarms, and coordinator sessions). 

Subagent delegation (such as `poteto-agent` or `research`) does NOT waive this invariant. The coordinator MUST execute the boot recall and scratch checkpoints before spawning subagents, and MUST commit turn notes upon receiving subagent results.

### 1. Chat Boot Recall (Mandatory on First Turn)
Before invoking subagents, reading playbooks, or modifying files:
Check for the `aif` executable or `./ai.sh` script, and run:
```bash
aif recall --core-and-bridge
```
- Instantly loads active project **Red Core (`INT16_CORE`)** blocks, including any `[PAUSED_MID_TASK]` checkpoint from interrupted prior sessions.
- Injects relevant cross-project pointers from the **Cross-Project Bridge Nexus (`bridge_nexus.ai`)** into working context.

### 2. Pre-Task Volatile Scratch (Interrupt Protection)
Before initiating multi-file edits, long test runs, refactors, or delegating code writes to a subagent:
```bash
aif scratch "<current goal, subagent task spec, and active working state>"
```
- Arms the OS-level signal trap. If execution is interrupted (`Ctrl+C`, `SIGINT`, `SIGTERM`), the engine automatically flushes this scratch buffer into the active project's `INT16_CORE` with importance `0.95` and the `[PAUSED_MID_TASK]` marker.

### 3. Subagent Memory Synchronization
When coordinating delegate subagents (e.g., `poteto-agent`):
- Pass relevant `INT16_CORE` architectural constraints and schemas directly in the subagent prompt.
- When the subagent yields control or returns diffs, record the completed milestone and architectural changes into AIF immediately.

### 4. End-of-Turn Cognitive Commit (Every Productive Turn)
Before concluding any productive turn, evaluate the cognitive importance of the turn (`0.0` to `1.0`) and commit a note:
```bash
aif note --importance <0.0-1.0> --summary "<concise summary of decisions and code modifications>"
```
- **0.70 - 1.00 (Red Core / `INT16_CORE`)**: Critical architecture, API schemas, breaking changes, or interrupted tasks. Automatically indexed into `bridge_nexus.ai`.
- **0.30 - 0.69 (Black Middle Ring / `INT8_RING`)**: Implementation notes, bug fixes, routine turn summaries. Pruned for token efficiency.
- **0.00 - 0.29 (Blue Outer Crust / `INT2_CRUST`)**: Transient observations, fleeting logs, deep summaries.
