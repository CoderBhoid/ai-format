# .ai-format File Format Project (V3 Upgrade)

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
  <a href="test_v3_features.py"><img src="https://img.shields.io/badge/Build-Passing-brightgreen.svg" alt="Build Status" /></a>
</p>

**Author**: Bhoid

## Overview
This repository contains the blueprints, research, and core implementation scripts for the **`.ai` file format** - a highly secure, block-based, temporally-aware local memory system for autonomous AI agents. 

This format resolves the limits of standard conversational context windows by implementing encrypted, block-partitioned, and attention-decayed state retrieval. It allows agents to load large histories instantly, bypassing long input-prefill precomputation phases.

---

## Key Features
1. **Partial Envelope Unpacking (Lazy Loading)**: Divide the encrypted context into distinct logical blocks (e.g. metadata, variables, dialog turns). The engine reads an unencrypted, HMAC-verified structural header index first, and decrypts *only* the specific blocks requested.
2. **Importance-Based Decay (Attention Weighting)**: Shifting from pure time-based memory decay to utility-based context retention. High reference usage (matching active workspace keywords/variables) overrides temporal decay to preserve raw accuracy (`FP16_RAW`), while low usage triggers instant compression (`INT2_DEEP_SUMMARY`).
3. **Neural Graph Connectivity**: Crypto hash pointers link sequential contexts and related skill blocks across sessions. This establishes a directed acyclic graph (DAG) of cognitive states (a web of knowledge instead of a flat log).
4. **Autonomous Self-Correction Loop**: Background optimization processes scan context archives, decay inactive blocks, update graph paths, and silently migrate legacy formats to V3 blocks.
5. **Authenticated Encryption with Associated Data (AEAD)**: Ensures that the context files cannot be read or tampered with without the correct keys. The engine leverages an Encrypt-then-MAC (EtM) standard.

---

## Project Structure
*   [research.md](research.md) - Architectural research and security threat modeling for the `.ai` V3 format.
*   [ai_format_production.py](ai_format_production.py) - The block-based AEAD Context Engine supporting lazy loading and header/block-level HMAC verification.
*   [ai_format_temporal.py](ai_format_temporal.py) - Module for executing Ebbinghaus forgetting curves combined with attention weighting metrics.
*   [autonomous_optimizer.py](autonomous_optimizer.py) - The self-correcting optimizer running background cleanup, decay, and graph linking.
*   [save_active_context.py](save_active_context.py) - Serializes and encrypts active conversation transcripts into linked V3 block payloads.
*   [recall_context.py](recall_context.py) - Command-line utility to inspect headers, lazy load variables/blocks, query keywords, or decode entire histories.
*   [test_v3_features.py](test_v3_features.py) - Comprehensive automated testing suite verifying block encryption, lazy loading, and decay logic.
*   [ai.bat](ai.bat) - Command Line Interface (CLI) wrapper for quick local context execution.
*   [agentic-skill/AGENTS.md](agentic-skill/AGENTS.md) & [agentic-skill/SKILL.md](agentic-skill/SKILL.md) - Configuration guidelines and definitions that bootstrap compatible agents to load `.ai` context rules on launch.

---

## Installation & Setup: Integrating Skills into your Agent

To enable your autonomous AI agent to read and write `.ai` context checkpoints out of the box, follow these steps to install the configuration files and scripts:

### Step 1: Copy Agent Configuration Skills
Locate the `agentic-skill` folder inside this repository. Copy its contents into your agent's local workspace customization root:
*   **Workspace-scoped rules**: Copy `AGENTS.md` and `SKILL.md` to your workspace's `.agents/` directory:
    ```bash
    mkdir -p .agents/skills/ai-format
    cp agentic-skill/SKILL.md .agents/skills/ai-format/SKILL.md
    cat agentic-skill/AGENTS.md >> .agents/AGENTS.md
    ```
*   **Global-scoped rules**: Append the contents of `agentic-skill/AGENTS.md` to your global agent rules file at `~/.gemini/config/AGENTS.md`.

### Step 2: Deploy Python Backend Engines
Make sure the main python modules are placed in your agent's active execution path or repository folder:
*   [ai_format_production.py](ai_format_production.py)
*   [ai_format_temporal.py](ai_format_temporal.py)
*   [autonomous_optimizer.py](autonomous_optimizer.py)

### Step 3: Run the CLI Shell Wrapper
For convenient manual checks, place the [ai.bat](ai.bat) command wrapper in your root directory. Make sure to update the `SCRATCH_DIR` path inside `ai.bat` to point to your active agent's scratch workspace.
You can then run:
*   `.\ai save backup.ai` to serialize and encrypt your active session.
*   `.\ai load backup.ai` to authenticate and preview your history.

---

## How to Run Tests
To run the automated validation tests:
```bash
python test_v3_features.py
```
This will set up mock transcripts, serialize them to AIF_V3, run selective recall options (header, vars, query, all), and test the autonomous optimization loop.

---

## Contributing and Community

We welcome contributions to the `.ai` context standard! Prior to contributing, please review the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community guidelines and Sednium ethical AI development principles.

---

## License & Terms of Use

*   **Code License**: Licensed under the open-source MIT License. See [LICENSE.md](LICENSE.md) for full terms.
*   **Terms and Conditions**: Usage is governed by [TERMS_AND_CONDITIONS.md](TERMS_AND_CONDITIONS.md) which contains critical safety restrictions (e.g. prohibition of weaponization, cognitive surveillance, and malicious AI execution).
