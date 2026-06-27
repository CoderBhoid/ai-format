# Project Rules: Context Loading and Memory Persistence

## Session Initialization Behavior
1. **Locate Context Checkpoints**: Upon initialization of a new workspace session, the agent must check if `session_context_production.ai` exists in the scratch folder: `~/.gemini/ai-format/brain/<conversation-id>/scratch/`.
2. **Decryption and Verification**: If the file exists, the agent should verify its integrity using the authentication routine and load the historical memory turns.
3. **State Resumption**: Present the user with a confirmation of state load (e.g., "Resumed memory from session_context_production.ai") and display the key active variables or milestones retrieved from the context.

## Keychain and Auto-Decryption Guidelines
1. **Keychain Access**: Before asking the user for keys, attempt to retrieve the decryption token from the secure keychain store: `~/.gemini/ai-format/keys/`. If found, load the key silently.
2. **Temporal Compression**: When parsing restored memories, verify the turn's `fidelity` tier metadata. If it is `INT8_PRUNED` or `INT2_DEEP_SUMMARY`, notify the user that older histories are loaded as conceptual summaries to preserve performance.
