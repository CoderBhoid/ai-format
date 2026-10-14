import os
import sys
import json
import time
import hashlib
from ai_format_production import ProductionAIContextFile
from ai_format_temporal import TemporalMemoryOptimizer

DEFAULT_CONVERSATION_ID = "8159f7ce-0a39-49a4-abf5-fecd766822f2"

def get_config():
    # Allow override via command line or environment
    conv_id = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("AI_CONVERSATION_ID", DEFAULT_CONVERSATION_ID)
    
    home_dir = os.path.expanduser("~")
    logs_dir = os.path.join(home_dir, ".gemini", "ai-format", "brain", conv_id, ".system_generated", "logs")
    transcript_path = os.path.join(logs_dir, "transcript.jsonl")
    output_ai_path = os.path.join(home_dir, ".gemini", "ai-format", "brain", conv_id, "scratch", "session_context_production.ai")
    
    return conv_id, transcript_path, output_ai_path

def extract_context_from_transcript(transcript_path):
    turns = []
    if not os.path.exists(transcript_path):
        raise FileNotFoundError(f"Transcript not found at: {transcript_path}")
        
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            step = json.loads(line)
            step_type = step.get("type", "")
            content = step.get("content", "")
            
            # Extract timestamp if available, else use current time
            timestamp = step.get("timestamp", time.time())
            if isinstance(timestamp, str):
                # Simple parsing of ISO timestamps if they are strings
                try:
                    timestamp = time.mktime(time.strptime(timestamp[:19], "%Y-%m-%dT%H:%M:%S"))
                except ValueError:
                    timestamp = time.time()
                    
            if step_type in ("USER_INPUT", "PLANNER_RESPONSE") and content:
                turns.append({
                    "role": "user" if step_type == "USER_INPUT" else "assistant",
                    "text": content,
                    "timestamp": timestamp
                })
    return turns

def get_workspace_keywords():
    # Extract workspace keywords from workspace Python files to calculate attention scores
    keywords = set()
    for root, dirs, files in os.walk(os.getcwd()):
        dirs[:] = [d for d in dirs if not d.startswith('.') and 'mock' not in d]
        for file in files:
            if file.endswith(('.py', '.md')) and not file.startswith('test'):
                try:
                    with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                        for line in f:
                            for word in line.split():
                                clean = ''.join(c for c in word if c.isalnum() or c == '_')
                                if len(clean) > 4:
                                    keywords.add(clean)
                except Exception:
                    pass
    return list(keywords)

def save_main():
    conv_id, transcript_path, output_ai_path = get_config()
    print(f"[*] Conversation ID: {conv_id}")
    print(f"[*] Transcript Path: {transcript_path}")
    print(f"[*] Output Target: {output_ai_path}")
    
    try:
        turns = extract_context_from_transcript(transcript_path)
        print(f"[+] Extracted {len(turns)} turns from conversation transcript.")
        
        # Initialize Engines
        key = b"super_secret_agent_identity_key_32b"
        engine = ProductionAIContextFile(master_key_bytes=key)
        temporal_opt = TemporalMemoryOptimizer()
        
        # 1. Attention-Weighted Decay calculation
        print("[*] Scan workspace for active references...")
        env_keywords = os.environ.get("AI_ACTIVE_KEYWORDS")
        if env_keywords:
            keywords = [k.strip() for k in env_keywords.split(",") if k.strip()]
            print(f"[*] Using keywords from environment: {keywords}")
        else:
            keywords = get_workspace_keywords()
            print(f"[*] Found {len(keywords)} potential identifier keywords in workspace.")
        
        decayed_turns = temporal_opt.process_temporal_context(turns, active_keywords=keywords)
        
        # 2. Block-based partitioning (AIF_V3)
        blocks = {}
        
        # Add system variables block
        blocks["vars"] = {
            "data": {
                "active_project": "ai-format",
                "target_model": "Gemini 3.5 Flash (High)",
                "timestamp": time.time(),
                "conversation_id": conv_id
            },
            "metadata": {"type": "vars", "importance": 1.0}
        }
        
        # Add conversation turns as individual blocks
        for idx, turn in enumerate(decayed_turns):
            block_id = f"turn_{idx}"
            blocks[block_id] = {
                "data": {
                    "role": turn["role"],
                    "text": turn["text"]
                },
                "metadata": {
                    "type": "dialog_turn",
                    "timestamp": turn["timestamp"],
                    "attention_score": turn["attention_score"],
                    "fidelity": turn["fidelity"]
                }
            }
            
        # 3. Neural Graph Connectivity (linking to previous file context)
        graph_links = []
        global_metadata = {
            "format_version": "AIF_V3",
            "conversation_id": conv_id,
            "total_blocks": len(blocks),
            "timestamp": time.time()
        }
        
        if os.path.exists(output_ai_path):
            try:
                # Calculate parent hash of existing context checkpoint
                with open(output_ai_path, "rb") as f:
                    parent_hash = hashlib.sha256(f.read()).hexdigest()
                    
                global_metadata["parent_context_hash"] = parent_hash
                print(f"[+] Linked to parent context checkpoint hash: {parent_hash[:16]}...")
                
                # Retrieve the previous file's header to link the turn chains
                prev_header = engine.read_header(output_ai_path)
                prev_index = prev_header.get("block_index_map", {})
                prev_turns = [k for k in prev_index.keys() if k.startswith("turn_")]
                
                if prev_turns and decayed_turns:
                    # Link our first turn block to the previous file's last turn block
                    last_prev_turn = sorted(prev_turns)[-1]
                    graph_links.append({
                        "source": "turn_0",
                        "target": f"{last_prev_turn}",
                        "relationship": "continuation_of",
                        "parent_file_hash": parent_hash
                    })
                    print(f"[+] Established synaptic link across files: turn_0 -> {last_prev_turn}")
            except Exception as e:
                print(f"[-] Warning: Could not read previous header for linking: {e}")
                
        # Link sequential turns in this session
        block_ids = sorted([k for k in blocks.keys() if k.startswith("turn_")])
        for i in range(1, len(block_ids)):
            graph_links.append({
                "source": block_ids[i],
                "target": block_ids[i-1],
                "relationship": "follows"
            })
            
        # Create directories if they do not exist
        os.makedirs(os.path.dirname(output_ai_path), exist_ok=True)
        
        # Serialize to secure AIF_V3 format
        print(f"[*] Serializing secure context blocks to: {output_ai_path}")
        file_size = engine.serialize_blocks(blocks, output_ai_path, graph_links=graph_links, global_metadata=global_metadata)
        print(f"[+] Success! Encrypted V3 context size: {file_size} bytes.")
        
    except Exception as e:
        print(f"[-] Error saving context: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    save_main()
