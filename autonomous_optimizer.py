import os
import sys
import time
import json
import hashlib
from ai_format_production import ProductionAIContextFile
from ai_format_temporal import TemporalMemoryOptimizer

class AutonomousOptimizer:
    """
    Background worker that runs self-correction and context compression cycles.
    It performs three tasks:
    1. Upgrades AIF_V2 files to AIF_V3 block format.
    2. Scans V3 files, decays blocks based on age + active workspace keywords.
    3. Builds and refines Neural Graph Connectivity maps between contexts.
    """
    def __init__(self, key_bytes, workspace_dir=None):
        self.engine = ProductionAIContextFile(master_key_bytes=key_bytes)
        self.temporal_opt = TemporalMemoryOptimizer()
        self.workspace_dir = workspace_dir or os.getcwd()
        
    def scan_workspace_for_keywords(self):
        """
        Scans workspace code files (.py, .md) to extract active keywords (variables, modules).
        This mimics monitoring what the agent is currently working on.
        """
        keywords = set()
        for root, dirs, files in os.walk(self.workspace_dir):
            # Skip hidden files/directories like .git or .ai
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for file in files:
                if file.endswith(('.py', '.md', '.bat')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            # Find words that look like identifiers (PascalCase, camelCase, snake_case)
                            # Simple heuristic for keyword extraction
                            for word in content.split():
                                clean_word = ''.join(c for c in word if c.isalnum() or c in '_-')
                                if len(clean_word) > 4 and not clean_word.isdigit():
                                    keywords.add(clean_word)
                    except Exception:
                        pass
        return list(keywords)

    def optimize_context_file(self, file_path, active_keywords=None):
        """
        Optimizes a single .ai context file:
        - Upgrades from V2 to V3 if necessary.
        - Evaluates and decays blocks in V3 if they have decayed.
        - Calculates block-level hashes and updates graph links.
        """
        if not os.path.exists(file_path):
            return False
            
        print(f"\n[Optimizer] Evaluating: {os.path.basename(file_path)}")
        
        # Check Magic Bytes
        with open(file_path, "rb") as f:
            magic = f.read(4)
            
        # 1. UPGRADE PATHWAY: V2 -> V3
        if magic == self.engine.MAGIC_V2:
            print(f"[Optimizer] Detected V2 file format. Migrating to V3 block-based format...")
            try:
                metadata, payload = self.engine.deserialize(file_path)
                # Convert flat payload into blocks
                blocks = {}
                
                # If payload is a list of turns, create block per turn
                if isinstance(payload, list):
                    for idx, turn in enumerate(payload):
                        block_id = f"turn_{idx}"
                        blocks[block_id] = {
                            "data": turn,
                            "metadata": {
                                "type": "dialog_turn",
                                "timestamp": turn.get("timestamp", time.time() - 3600),
                                "attention_score": turn.get("attention_score", 0.5)
                            }
                        }
                else:
                    # Single payload block
                    blocks["payload_block"] = {
                        "data": payload,
                        "metadata": {"type": "legacy_payload"}
                    }
                    
                # Save as V3
                self.engine.serialize_blocks(blocks, file_path, global_metadata=metadata)
                print(f"[Optimizer] Successfully migrated '{os.path.basename(file_path)}' to V3.")
                # Reload file pointer info
                with open(file_path, "rb") as f:
                    magic = f.read(4)
            except Exception as e:
                print(f"[Optimizer] Error migrating V2 to V3: {e}")
                return False

        # 2. OPTIMIZATION PATHWAY: V3
        if magic == self.engine.MAGIC_V3:
            try:
                header = self.engine.read_header(file_path)
                block_index_map = header.get("block_index_map", {})
                graph_links = header.get("graph_links", [])
                
                updated_blocks = {}
                any_changes = False
                
                # Extract active keywords if not provided
                if active_keywords is None:
                    active_keywords = self.scan_workspace_for_keywords()
                    
                # Evaluate each block
                for block_id, index_info in block_index_map.items():
                    # Check if this is a dialog block that can decay
                    block_meta = index_info.get("metadata", {})
                    if block_meta.get("type") == "dialog_turn":
                        # Lazy load/decrypt only this block
                        block_data, _ = self.engine.deserialize_block(file_path, block_id)
                        
                        # Pack into temporal format format
                        turn_data = {
                            "timestamp": block_meta.get("timestamp", time.time()),
                            "role": block_data.get("role", "user"),
                            "text": block_data.get("text", block_data if isinstance(block_data, str) else ""),
                            "attention_score": block_meta.get("attention_score", 0.5)
                        }
                        
                        # Process block through Temporal Memory Optimizer
                        decayed = self.temporal_opt.process_temporal_context([turn_data], active_keywords)[0]
                        
                        # Did it compress?
                        old_fidelity = block_meta.get("fidelity", "FP16_RAW")
                        new_fidelity = decayed["fidelity"]
                        
                        if old_fidelity != new_fidelity or turn_data["attention_score"] != decayed["attention_score"]:
                            any_changes = True
                            block_meta["fidelity"] = new_fidelity
                            block_meta["attention_score"] = decayed["attention_score"]
                            block_meta["timestamp"] = decayed["timestamp"]
                            
                            # Update data with the decayed text
                            block_data["text"] = decayed["text"]
                            block_data["attention_score"] = decayed["attention_score"]
                            
                            print(f"  - Block '{block_id}' decayed: {old_fidelity} -> {new_fidelity} (Score: {block_meta['attention_score']:.2f})")
                        
                        updated_blocks[block_id] = {
                            "data": block_data,
                            "metadata": block_meta
                        }
                    else:
                        # Keep other blocks unchanged (lazy decrypt and write back)
                        block_data, _ = self.engine.deserialize_block(file_path, block_id)
                        updated_blocks[block_id] = {
                            "data": block_data,
                            "metadata": block_meta
                        }
                
                # 3. GRAPH CONNECTIVITY REFINEMENT
                # Build block hashes and link sequential blocks
                block_ids = sorted(list(updated_blocks.keys()))
                for i in range(1, len(block_ids)):
                    source_id = block_ids[i]
                    target_id = block_ids[i-1]
                    
                    # Compute SHA-256 hash pointer of target block
                    target_data_str = json.dumps(updated_blocks[target_id]["data"])
                    target_hash = hashlib.sha256(target_data_str.encode('utf-8')).hexdigest()
                    
                    # Check if link already exists
                    link_exists = any(
                        l.get("source") == source_id and l.get("target") == target_id 
                        for l in graph_links
                    )
                    
                    if not link_exists:
                        graph_links.append({
                            "source": source_id,
                            "target": target_id,
                            "relationship": "parent_context",
                            "hash_pointer": target_hash
                        })
                        any_changes = True
                        print(f"  - Established synaptic link: {source_id} -> {target_id}")

                # Save changes back to disk if updated
                if any_changes:
                    self.engine.serialize_blocks(
                        updated_blocks, 
                        file_path, 
                        graph_links=graph_links, 
                        global_metadata=header.get("global_metadata")
                    )
                    print(f"[Optimizer] Saved optimized V3 file.")
                else:
                    print(f"[Optimizer] File is already optimal. No changes made.")
                return True
                
            except Exception as e:
                print(f"[Optimizer] Failed to optimize: {e}")
                import traceback
                traceback.print_exc()
                return False
                
        print(f"[Optimizer] Unknown magic bytes or unsupported format.")
        return False

    def run_optimization_cycle(self, target_directory):
        """Runs a complete sweep over a target directory to clean and link context archives."""
        print(f"\n[Optimizer] Running background cycle on: {target_directory}")
        if not os.path.exists(target_directory):
            print(f"[Optimizer] Directory not found: {target_directory}")
            return
            
        active_keywords = self.scan_workspace_for_keywords()
        print(f"[Optimizer] Scan completed. Active Workspace Keywords count: {len(active_keywords)}")
        
        for file in os.listdir(target_directory):
            if file.endswith(".ai"):
                file_path = os.path.join(target_directory, file)
                self.optimize_context_file(file_path, active_keywords)


# ==========================================
# TEST RUN FOR THE OPTIMIZATION LOOP
# ==========================================
if __name__ == "__main__":
    # Create a temporary V2 file first to test the upgrade path
    print("Testing Autonomous Optimization Loop...")
    
    key = b"super_secret_agent_identity_key_32b"
    optimizer = AutonomousOptimizer(key_bytes=key)
    
    # Save a mock V2 file
    v2_engine = ProductionAIContextFile(master_key_bytes=key)
    v2_engine.MAGIC = v2_engine.MAGIC_V2  # Force V2 serialization
    
    v2_meta = {"format_version": "AIF_V2", "conversation_id": "test_conv"}
    v2_payload = [
        {
            "role": "user",
            "text": "Start the database_migration script now.",
            "timestamp": time.time() - 7200  # 2 hours old
        },
        {
            "role": "assistant",
            "text": "Sure, running database migration.",
            "timestamp": time.time() - 3600  # 1 hour old
        }
    ]
    
    test_file = "optimizer_test.ai"
    v2_engine.serialize(v2_meta, v2_payload, test_file)
    print(f"[+] Created temporary AIF_V2 test file.")
    
    # Setup active workspace keywords (simulating user code file context)
    # We add "database_migration" to the keywords. Turn 1 contains this, so it should stay raw!
    # Turn 2 has no active keywords, so it should compress to INT2!
    active_keywords = ["database_migration"]
    
    # Run optimizer on the file
    optimizer.optimize_context_file(test_file, active_keywords=active_keywords)
    
    # Inspect final file header
    header = optimizer.engine.read_header(test_file)
    print("\n[+] Verification after Optimization Cycle:")
    print(f"Format Version: {header.get('format_version')}")
    print(f"Synaptic links: {header.get('graph_links')}")
    print("Blocks:")
    for b_id, b_info in header.get("block_index_map", {}).items():
        # Decrypt block to verify content
        block_data, block_meta = optimizer.engine.deserialize_block(test_file, b_id)
        print(f"  - Block '{b_id}': Fidelity={block_meta.get('fidelity')}, Score={block_meta.get('attention_score')}")
        if isinstance(block_data, dict):
            if 'text' in block_data:
                print(f"    Text: {block_data['text']}")
            else:
                print(f"    Content: {block_data}")
        else:
            print(f"    Content: {block_data}")
        
    # Clean up
    if os.path.exists(test_file):
        os.remove(test_file)
    print("\n[+] Optimization Loop tests complete!")
