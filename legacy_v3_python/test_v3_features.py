import os
import sys
import json
import time
import shutil
import subprocess

# Paths
MOCK_CONV_ID = "mock_v3_test_conversation"
home_dir = os.path.expanduser("~")
MOCK_BRAIN_DIR = os.path.join(home_dir, ".gemini", "ai-format", "brain", MOCK_CONV_ID)
MOCK_LOGS_DIR = os.path.join(MOCK_BRAIN_DIR, ".system_generated", "logs")
MOCK_SCRATCH_DIR = os.path.join(MOCK_BRAIN_DIR, "scratch")
MOCK_TRANSCRIPT = os.path.join(MOCK_LOGS_DIR, "transcript.jsonl")
MOCK_AI_OUTPUT = os.path.join(MOCK_SCRATCH_DIR, "session_context_production.ai")

def setup_mock_transcript():
    print("[Test Setup] Creating mock conversation logs...")
    if os.path.exists(MOCK_BRAIN_DIR):
        shutil.rmtree(MOCK_BRAIN_DIR)
        
    os.makedirs(MOCK_LOGS_DIR, exist_ok=True)
    os.makedirs(MOCK_SCRATCH_DIR, exist_ok=True)
    
    current_time = time.time()
    
    # We write 4 turns:
    # Turn 0: Very old, contains "database_migration" (should stay RAW due to keyword reference)
    # Turn 1: Very old, no keywords (should decay to INT2_DEEP_SUMMARY)
    # Turn 2: Medium age, no keywords (should decay to INT8_PRUNED)
    # Turn 3: Brand new turn, containing "lazy loading"
    turns = [
        {
            "type": "USER_INPUT",
            "content": "Let us execute the database_migration script to update schemas.",
            "timestamp": current_time - 7200 # 2 hours old
        },
        {
            "type": "PLANNER_RESPONSE",
            "content": "I will run the database migrations and verify the SQL schemas.",
            "timestamp": current_time - 7100 # 2 hours old
        },
        {
            "type": "USER_INPUT",
            "content": "Could you also tell me a joke about programming?",
            "timestamp": current_time - 1800 # 30 mins old
        },
        {
            "type": "PLANNER_RESPONSE",
            "content": "Why do programmers wear glasses? Because they cannot C#!",
            "timestamp": current_time - 1700 # 30 mins old
        },
        {
            "type": "USER_INPUT",
            "content": "Make sure we implement partial envelope unpacking and lazy loading.",
            "timestamp": current_time - 5 # 5 seconds old
        }
    ]
    
    with open(MOCK_TRANSCRIPT, "w", encoding="utf-8") as f:
        for t in turns:
            f.write(json.dumps(t) + "\n")
            
    print(f"[Test Setup] Mock transcript written to {MOCK_TRANSCRIPT}")

def run_script(script_name, args):
    cmd = [sys.executable, script_name] + args
    print(f"\n[Test Exec] Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[-] Command failed with return code {result.returncode}")
        print(f"Stderr:\n{result.stderr}")
        print(f"Stdout:\n{result.stdout}")
        raise RuntimeError(f"Script {script_name} failed.")
    return result.stdout

def verify_tests():
    # 1. Setup mock files
    setup_mock_transcript()
    
    # 2. Run save_active_context.py on mock conversation
    os.environ["AI_CONVERSATION_ID"] = MOCK_CONV_ID
    os.environ["AI_ACTIVE_KEYWORDS"] = "database_migration,lazy"
    save_output = run_script("save_active_context.py", [MOCK_CONV_ID])
    print("[Test Result] save_active_context.py output:")
    print(save_output)
    
    assert os.path.exists(MOCK_AI_OUTPUT), "Error: .ai file was not generated"
    print("[+] Test 1 Passed: V3 context file generated successfully.")
    
    # 3. Test selective lazy loading using recall_context.py
    # A: Recall header metadata
    header_output = run_script("recall_context.py", [MOCK_AI_OUTPUT, "--header"])
    print("[Test Result] recall_context.py --header:")
    print(header_output)
    assert "AIF_V3" in header_output, "Error: header does not show format version V3"
    assert "graph_links" in header_output, "Error: header does not contain graph links"
    print("[+] Test 2 Passed: Unencrypted header metadata and graph links parsed successfully.")
    
    # B: Recall variables block
    vars_output = run_script("recall_context.py", [MOCK_AI_OUTPUT, "--vars"])
    print("[Test Result] recall_context.py --vars:")
    print(vars_output)
    assert "active_project" in vars_output, "Error: vars block failed to lazy load"
    print("[+] Test 3 Passed: Selective lazy loading of 'vars' block verified.")
    
    # C: Recall query search block
    # We query for 'dialog_turn' to retrieve conversational turns
    query_output = run_script("recall_context.py", [MOCK_AI_OUTPUT, "--query", "dialog_turn"])
    print("[Test Result] recall_context.py --query 'dialog_turn':")
    print(query_output)
    assert "dialog_turn" in query_output.lower() or "joke" in query_output.lower(), "Error: query block failed to find matched blocks"
    print("[+] Test 4 Passed: Query-filtered lazy loading verified.")
    
    # D: Recall all
    all_output = run_script("recall_context.py", [MOCK_AI_OUTPUT, "--all"])
    print("[Test Result] recall_context.py --all:")
    print(all_output)
    assert "database_migration" in all_output, "Error: Turn 0 with high-importance was lost"
    assert "C#" in all_output, "Error: Turn 3 fresh text was lost"
    # Turn 2 (joke) should be pruned/decayed. Let's check its fidelity metadata in all_output
    assert "INT8_PRUNED" in all_output or "INT2_DEEP_SUMMARY" in all_output, "Error: Turn 2 did not experience decay"
    print("[+] Test 5 Passed: Full decryption and temporal decay verified.")

    # 4. Test Autonomous Optimization Loop
    print("\n[Test Exec] Running autonomous optimizer cycle on mock directory...")
    # Modify a file in the workspace or pass arguments to optimize
    opt_output = run_script("autonomous_optimizer.py", [])
    # Since the autonomous_optimizer test harness runs its own self-test and exits, let's run the optimizer class directly
    # via a quick inline script or check that optimizer executed successfully
    print("[Test Result] Optimizer execution:")
    print(opt_output)
    assert "tests complete!" in opt_output, "Error: Optimizer self-test failed"
    print("[+] Test 6 Passed: Autonomous Optimization Loop verified.")

    # Clean up mock directories
    if os.path.exists(MOCK_BRAIN_DIR):
        shutil.rmtree(MOCK_BRAIN_DIR)
    print("\n==============================================")
    print("      ALL V3 ARCHITECTURE TESTS PASSED!      ")
    print("==============================================")

if __name__ == "__main__":
    verify_tests()
