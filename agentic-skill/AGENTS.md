# Project Rules: Context Loading and Memory Persistence (AIF V4)

## Mandatory Agent Lifecycle

Every LLM / Agent working in this repository MUST follow this three-step memory loop autonomously:

### 1. On Chat Boot
Run:
```bash
./ai.sh recall --core-and-bridge
```
- Instantly loads the current project's **Red Core (`INT16_CORE`)** blocks, including any `[PAUSED_MID_TASK]` checkpoint from interrupted prior sessions.
- Displays connected projects and shared topic tags on the **Cross-Project Synaptic Bridge (`bridge_nexus.ai`)**.

### 2. During Work (Interrupt Protection)
Before initiating multi-step edits, long builds, refactors, or external calls, update the volatile scratch state:
```bash
./ai.sh scratch "<current step, intent, and in-flight variables>"
```
- If the user abruptly terminates or pauses execution (`SIGINT`/`SIGTERM`/`SIGHUP`), the signal trap immediately flushes this scratch state into the active project's `INT16_CORE` with importance `0.95` and the `[PAUSED_MID_TASK]` marker.

### 3. End of EVERY Turn (Self-Scored Commit)
Evaluate the cognitive importance of the turn from `0.0` to `1.0`:
- **`0.70` - `1.00` (Red Core / `INT16_CORE`)**: Critical architectural decisions, breaking API changes, core context, or interrupted tasks. Automatically indexed on the Cross-Project Bridge.
- **`0.30` - `0.69` (Black Ring / `INT8_RING`)**: Routine implementation notes and standard conversational turns. Helper words pruned for token efficiency.
- **`0.00` - `0.29` (Blue Crust / `INT2_CRUST`)**: Fleeting notes, background diagnostics, and transient gist summaries.

Commit the note:
```bash
./ai.sh note --project <project_name> --importance <0.0-1.0> --summary "<what was done and decided>"
```
If a previous decision has gained or lost importance, reweight it:
```bash
./ai.sh reweight --project <project_name> --block <block_id> --importance <0.0-1.0>
```
