import sys
import os
import json
from ai_format_production import ProductionAIContextFile

def print_help():
    print("AI Context V3 Recall Utility")
    print("Usage:")
    print("  python recall_context.py <path_to_context.ai> [options]")
    print("\nOptions:")
    print("  --vars              Lazy load and print only variables block")
    print("  --block <block_id>  Lazy load and print a specific block ID")
    print("  --query <keyword>   Lazy load blocks matching query keyword in metadata")
    print("  --header            Print only the unencrypted V3 header and DAG links")
    print("  --all               Load and decrypt all blocks (default)")

def recall_main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print_help()
        sys.exit(1)
        
    input_path = sys.argv[1]
    
    if not os.path.exists(input_path):
        print(f"[-] Error: File not found at: {input_path}")
        sys.exit(1)
        
    # Check options
    mode = "--all"
    target_block = None
    query_word = None
    
    if len(sys.argv) > 2:
        opt = sys.argv[2]
        if opt == "--vars":
            mode = "--vars"
        elif opt == "--header":
            mode = "--header"
        elif opt == "--block" and len(sys.argv) > 3:
            mode = "--block"
            target_block = sys.argv[3]
        elif opt == "--query" and len(sys.argv) > 3:
            mode = "--query"
            query_word = sys.argv[3]
        elif opt == "--all":
            mode = "--all"
        else:
            print(f"[-] Unknown option: {opt}")
            print_help()
            sys.exit(1)
            
    # Initialize Engine
    key = b"super_secret_agent_identity_key_32b"
    engine = ProductionAIContextFile(master_key_bytes=key)
    
    try:
        # Check file format first by trying to read V3 header
        is_v3 = False
        try:
            header = engine.read_header(input_path)
            is_v3 = True
        except ValueError:
            # Not a V3 file (likely V2 fallback)
            pass
            
        if not is_v3:
            if mode != "--all":
                print("[-] Warning: Option not supported on V2 files. Falling back to loading entire file.")
            metadata, turns = engine.deserialize(input_path)
            print("[+] SUCCESS: Authenticated and decrypted V2 context file.")
            print(f"[*] Metadata: Version {metadata.get('format_version')} | Turns: {len(turns)}\n")
            for idx, turn in enumerate(turns):
                print(f"[{turn['role'].upper()}]: {turn['text']}\n" + "-"*50)
            return

        # V3 Processing Mode
        print("[+] SUCCESS: V3 file authenticated. Integrity verified.")
        
        if mode == "--header":
            print("[*] --- Unencrypted structural V3 Header ---")
            print(json.dumps(header, indent=2))
            
        elif mode == "--vars":
            print("[*] Lazy Loading variables block...")
            if "vars" in header.get("block_index_map", {}):
                vars_data, vars_meta = engine.deserialize_block(input_path, "vars")
                print("\n[+] Variables Block Content:")
                print(json.dumps(vars_data, indent=2))
            else:
                print("[-] Error: 'vars' block not found in this file.")
                
        elif mode == "--block":
            print(f"[*] Lazy Loading block '{target_block}'...")
            try:
                block_data, block_meta = engine.deserialize_block(input_path, target_block)
                print(f"\n[+] Block '{target_block}' (Fidelity: {block_meta.get('fidelity', 'N/A')}, Score: {block_meta.get('attention_score', 'N/A')}):")
                print(json.dumps(block_data, indent=2))
            except KeyError as e:
                print(f"[-] {e}")
                
        elif mode == "--query":
            print(f"[*] Querying block index metadata for: '{query_word}'")
            matched_blocks = []
            for b_id, b_info in header.get("block_index_map", {}).items():
                meta_str = json.dumps(b_info.get("metadata", "")).lower()
                if query_word.lower() in meta_str or query_word.lower() in b_id.lower():
                    matched_blocks.append(b_id)
                    
            if not matched_blocks:
                print(f"[-] No blocks matched query '{query_word}' in metadata.")
            else:
                print(f"[+] Query matched {len(matched_blocks)} blocks: {matched_blocks}")
                for b_id in matched_blocks:
                    print(f"\n[*] Decrypting block '{b_id}'...")
                    block_data, block_meta = engine.deserialize_block(input_path, b_id)
                    print(f"Block '{b_id}' (Fidelity: {block_meta.get('fidelity', 'N/A')}):")
                    if isinstance(block_data, dict) and "text" in block_data:
                        print(f"  [{block_data.get('role', 'unknown').upper()}]: {block_data['text']}")
                    else:
                        print(f"  Content: {block_data}")
                    print("-" * 50)
                    
        else: # --all
            global_meta = header.get("global_metadata", {})
            print(f"[*] Context: Conversation {global_meta.get('conversation_id')} | Blocks: {global_meta.get('total_blocks')}")
            if "parent_context_hash" in global_meta:
                print(f"[*] DAG Parent state hash: {global_meta['parent_context_hash'][:16]}...")
            if header.get("graph_links"):
                print(f"[*] Neural Synaptic Links: {len(header['graph_links'])} links defined.")
                
            print("\n[*] Decrypting all payload blocks...")
            # Get list of all blocks sorted by name (like turn_0, turn_1, etc.)
            block_ids = sorted(list(header.get("block_index_map", {}).keys()))
            
            for b_id in block_ids:
                if b_id == "vars" or b_id == "metadata_block":
                    continue
                block_data, block_meta = engine.deserialize_block(input_path, b_id)
                role = block_data.get("role", "assistant").upper()
                text = block_data.get("text", str(block_data)).strip()
                fidelity = block_meta.get("fidelity", "RAW")
                score = block_meta.get("attention_score", 1.0)
                
                print(f"[{role}] (Fidelity: {fidelity} | Score: {score}):\n{text}")
                print("-" * 50)
                
    except PermissionError:
        print("[-] Error: Integrity check failed. Incorrect key or tampered payload.")
        sys.exit(1)
    except Exception as e:
        print(f"[-] Error parsing context file: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    recall_main()
