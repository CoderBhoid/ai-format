import os
import struct
import json
import gzip
import hashlib
import math
from collections import Counter

# Path configuration
CONVERSATION_ID = "8159f7ce-0a39-49a4-abf5-fecd766822f2"
home_dir = os.path.expanduser("~")
AI_FILE_PATH = os.path.join(home_dir, ".gemini", "ai-format", "brain", CONVERSATION_ID, "scratch", "session_context.ai")

class SimpleStreamCipher:
    def __init__(self, key_bytes):
        h = hashlib.sha256(key_bytes).digest()
        self.state = list(range(256))
        j = 0
        for i in range(256):
            j = (j + self.state[i] + h[i % len(h)]) % 256
            self.state[i], self.state[j] = self.state[j], self.state[i]

    def encrypt_decrypt(self, data):
        state = list(self.state)
        i = 0
        j = 0
        out = bytearray()
        for char in data:
            i = (i + 1) % 256
            j = (j + state[i]) % 256
            state[i], state[j] = state[j], state[i]
            t = (state[i] + state[j]) % 256
            k = state[t]
            out.append(char ^ k)
        return bytes(out)


def calculate_entropy(data):
    """Calculates the Shannon entropy of a byte string (values 0 to 8)."""
    if not data:
        return 0.0
    counter = Counter(data)
    total = len(data)
    entropy = 0.0
    for count in counter.values():
        p = count / total
        entropy -= p * math.log2(p)
    return entropy


def audit_ai_file():
    print("==========================================")
    print("          .AI FILE SECURITY AUDIT         ")
    print("==========================================")
    
    if not os.path.exists(AI_FILE_PATH):
        raise FileNotFoundError(f"File not found: {AI_FILE_PATH}")
        
    with open(AI_FILE_PATH, "rb") as f:
        file_bytes = f.read()
        
    # --- PHASE 1: METADATA LEAK CHECK ---
    print("\n[PHASE 1] Checking for Plaintext Metadata Leaks...")
    magic = file_bytes[0:4]
    header_len = struct.unpack('>I', file_bytes[4:8])[0]
    metadata_bytes = file_bytes[8:8+header_len]
    encrypted_payload = file_bytes[8+header_len:]
    
    metadata = json.loads(metadata_bytes.decode('utf-8'))
    print(f"[*] Magic Bytes Detected: {magic}")
    print(f"[*] Unencrypted Header Metadata Exposed:")
    print(json.dumps(metadata, indent=2))
    print("[-] RISK: Unencrypted headers reveal model types and structure, leaking system fingerprinting details.")

    # --- PHASE 2: ENTROPY ANALYSIS ---
    print("\n[PHASE 2] Running Entropy Analysis on Encrypted Payload...")
    entropy = calculate_entropy(encrypted_payload)
    print(f"[*] Ciphertext Shannon Entropy: {entropy:.5f} bits/byte (Max: 8.0)")
    if entropy > 7.9:
        print("[+] PASS: Ciphertext exhibits high randomness, indicating no obvious structural leaks.")
    else:
        print("[-] WARNING: Low entropy detected! Possible weak cipher, pattern leaks, or bad initialization vector.")

    # --- PHASE 3: BRUTE FORCE DICTIONARY ATTACK ---
    print("\n[PHASE 3] Launching Dictionary Brute Force against Key derivation...")
    
    # Simple list of candidate passwords
    dictionary = [
        "123456", "password", "administrator", "gemini_api",
        "agent", "ai_context", "context_key", "agent_password_123",
        "post_quantum_safe", "llama3", "claude3.5"
    ]
    
    success = False
    cracked_password = None
    decrypted_content = None
    
    for candidate in dictionary:
        # Re-derive key from candidate password
        candidate_key = hashlib.sha256(candidate.encode('utf-8')).digest()
        
        # Attempt decryption
        cipher = SimpleStreamCipher(candidate_key)
        decrypted_bytes = cipher.encrypt_decrypt(encrypted_payload)
        
        # Test integrity using Gzip decompression
        try:
            decompressed_data = gzip.decompress(decrypted_bytes)
            # Try parsing as JSON to confirm success
            data_json = json.loads(decompressed_data.decode('utf-8'))
            
            # If no exception occurred, decryption succeeded!
            success = True
            cracked_password = candidate
            decrypted_content = data_json
            break
        except (gzip.BadGzipFile, json.JSONDecodeError, UnicodeDecodeError):
            # Decompression fails if decryption key is wrong (acts as a decryption oracle)
            continue
            
    if success:
        print(f"[!] BRUTE FORCE SUCCESSFUL!")
        print(f"[!] Cracked Password: '{cracked_password}'")
        print(f"[*] Extracted Context Preview:")
        print(f"    Total Turns Restored: {len(decrypted_content)}")
        print(f"    First turn preview: [{decrypted_content[0]['role'].upper()}]: {decrypted_content[0]['text'][:80]}...")
        print("\n[-] LOOPHOLE IDENTIFIED:")
        print("    1. Weak user-chosen keys bypass PQC math. A file is only as strong as its key derivation function.")
        print("    2. Lack of an Authenticated Encryption signature (like AES-GCM MAC tag) allows")
        print("       attacker to use Gzip decompression errors as a decryption oracle.")
    else:
        print("[-] Brute force failed to find password in the dictionary.")

if __name__ == "__main__":
    audit_ai_file()
