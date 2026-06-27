---
name: ai-context-saving
description: "Teaches the agent how to save and load cognitive context snapshots using the production-grade secure .ai-format file format, preserving memory states across runs with temporal decay."
---

# Secure AI Context Saving & Restoring

This skill defines the standard operating procedures for saving, loading, and managing persistent cognitive checkpoints using the `.ai` file format, incorporating temporal memory decay and automatic keychain management.

## Overview

Unlike raw text files (`.md`, `.txt`), the `.ai` file format stores compressed, post-quantum cryptographically secured representations of an agent's memory, context, and conversation logs. It allows agents to load large histories instantly, bypassing long input-prefill computation phases.

---

## When to Save Context

You should proactively serialize and save active context to a `.ai` file in the following scenarios:
1. **Milestone Completion**: After finishing a major coding phase, debugging loop, or architectural plan.
2. **Pre-Flight Checkpoint**: Before running high-risk commands (e.g., database migrations, destructive git commands) to create a recovery state.
3. **Session Shutdown**: When wrapping up a session or preparing to hand off work to another agent.

During serialization, the context engine applies **Temporal Memory Decay**:
- **Fresh Context (< 1 Hour)**: Saved at `FP16_RAW` resolution (100% detail retention).
- **Medium-term Context (< 1 Day)**: Pruned of redundant helper tokens and quantized to `INT8`.
- **Ancient Context (> 1 Day)**: Condensed into high-level `INT2` semantic concepts.

---

## When to Load Context

You should search for and deserialize `.ai` files:
1. **Session Resumption**: At the start of a task, if a previously saved `.ai` file exists in the directory.
2. **Shared Agent Handoff**: If another agent has generated a context snapshot and passed it to you for continuation.

---

## How to Interface with the `.ai` Format Engine

Use the system script `ai_format_production.py` to pack and unpack files. The script supports programmatic integration or shell calls.

### 1. Saving (Packing) Context
To pack a session context, prepare the metadata and payload dictionary, and call the python serialization tool:

```python
from ai_format_production import ProductionAIContextFile

# 1. Define Metadata (Plaintext headers are hidden inside the envelope)
metadata = {
    "format_version": "AIF_V2",
    "target_model": "Llama-3-70B",
    "conversation_id": "8159f7ce-0a39-49a4-abf5-fecd766822f2"
}

# 2. Extract context history or internal memory states
payload = {
    "task_list": ["Refactor auth", "Verify unit tests"],
    "history": [
        {"role": "user", "text": "Extract all context..."},
        {"role": "assistant", "text": "Context extracted successfully."}
    ]
}

# 3. Initialize engine with a secure key (e.g., derived from a secure vault)
key = b"super_secret_agent_identity_key_32b"
engine = ProductionAIContextFile(master_key_bytes=key)

# 4. Save secure context to disk
engine.serialize(metadata, payload, "session_context.ai")
```

### 2. Loading (Unpacking) Context
To resume from a checkpoint:

```python
from ai_format_production import ProductionAIContextFile

# Initialize engine with the key
key = b"super_secret_agent_identity_key_32b"
engine = ProductionAIContextFile(master_key_bytes=key)

try:
    # Deserialize context
    metadata, payload = engine.deserialize("session_context.ai")
    
    # Ingest details back into active prompt context or task list
    print(f"Resuming session from: {metadata['conversation_id']}")
    active_history = payload["history"]
    
except PermissionError:
    # Handle incorrect key or tampering detection
    print("Failed to authenticate context file. Integrity validation failed.")
```

---

## Cryptographic & Keychain Guidelines

1. **Verify Integrity First**: Never parse or decompress a `.ai` file if the signature check fails. The loader script uses Encrypt-then-MAC (EtM) to reject tampered bytes before decompression.
2. **Keychain Retrieval**: Prior to prompting the user for a decryption key, check the secure local AppData keychain folder (`~/.gemini/ai-format/keys/`) for a non-expired key matching the session ID.
3. **Always Check Model Target**: Before loading context variables, verify the `target_model` field in the decrypted metadata matches your running model architecture.
