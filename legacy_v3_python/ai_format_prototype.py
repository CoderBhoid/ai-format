import os
import struct
import json
import gzip
import hashlib

# ==========================================
# 1. SPECIFICATION OF THE .AI FILE STRUCTURE
# ==========================================
# [Magic Bytes: 4 bytes] -> b'AIF\x01' (AI File Format v1)
# [Header Size: 4 bytes] -> Integer
# [Metadata JSON: Var size] -> JSON string containing model info & encryption metadata
# [Encrypted Payload: Var size] -> Encrypted quantized tensor bytes

class SimpleStreamCipher:
    """
    A pure-Python stream cipher (RC4-like) for demonstration purposes,
    avoiding external dependencies.
    """
    def __init__(self, key_bytes):
        # Derive a 256-byte state from the key using SHA-256
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


class AIContextFile:
    def __init__(self, model_name, quantization="int8", encryption_key=None):
        self.model_name = model_name
        self.quantization = quantization
        # Generate a random 32-byte key if none provided
        self.key = encryption_key if encryption_key else os.urandom(32)

    def serialize_kv_cache(self, kv_tensors):
        """
        Simulates serializing a dictionary of KV tensors.
        In a real LLM engine (like llama.cpp or vLLM), these are direct PyTorch/C++ tensors.
        """
        serialized_tensors = {}
        for layer_name, tensor_data in kv_tensors.items():
            # 1. Simulate Quantization (e.g., FP32 to INT8)
            # In production, we use vector-wise scale factors to minimize loss.
            quantized_bytes = bytearray()
            for val in tensor_data:
                # Simple scaling mapping float [-1.0, 1.0] to int8 [-127, 127]
                quantized_val = int(max(-1.0, min(1.0, val)) * 127)
                quantized_bytes.extend(struct.pack('b', quantized_val))
            
            serialized_tensors[layer_name] = {
                "shape": [len(tensor_data)],
                "data": quantized_bytes.hex()
            }
        
        # Convert tensor structure to a compact binary block
        raw_payload = json.dumps(serialized_tensors).encode('utf-8')
        
        # 2. Compress the payload (Gzip)
        compressed_payload = gzip.compress(raw_payload)
        
        # 3. Encrypt the compressed payload
        cipher = SimpleStreamCipher(self.key)
        encrypted_payload = cipher.encrypt_decrypt(compressed_payload)
        
        # 4. Construct Metadata Header
        metadata = {
            "model": self.model_name,
            "quantization": self.quantization,
            "layers_count": len(kv_tensors)
        }
        metadata_bytes = json.dumps(metadata).encode('utf-8')
        
        # 5. Build final binary file
        magic_bytes = b'AIF\x01'
        header_len = len(metadata_bytes)
        
        final_binary = magic_bytes + struct.pack('>I', header_len) + metadata_bytes + encrypted_payload
        return final_binary

    def deserialize_kv_cache(self, binary_data):
        """
        Reads, decrypts, decompresses, and dequantizes the .ai file back to active state.
        """
        # Validate Magic Bytes
        magic = binary_data[0:4]
        if magic != b'AIF\x01':
            raise ValueError("Invalid file format. Magic bytes mismatch.")
        
        # Read Header length
        header_len = struct.unpack('>I', binary_data[4:8])[0]
        
        # Extract Metadata
        metadata_bytes = binary_data[8:8+header_len]
        metadata = json.loads(metadata_bytes.decode('utf-8'))
        
        # Extract and decrypt payload
        encrypted_payload = binary_data[8+header_len:]
        cipher = SimpleStreamCipher(self.key)
        decrypted_payload = cipher.encrypt_decrypt(encrypted_payload)
        
        # Decompress payload
        raw_payload = gzip.decompress(decrypted_payload)
        serialized_tensors = json.loads(raw_payload.decode('utf-8'))
        
        # Dequantize tensors back to FP32
        restored_tensors = {}
        for layer_name, tensor_info in serialized_tensors.items():
            quantized_bytes = bytes.fromhex(tensor_info["data"])
            restored_floats = []
            for b in quantized_bytes:
                # Convert back from int8 to float [-1.0, 1.0]
                val = struct.unpack('b', bytes([b]))[0]
                restored_floats.append(val / 127.0)
            restored_tensors[layer_name] = restored_floats
            
        return metadata, restored_tensors

# ==========================================
# DEMONSTRATION RUN
# ==========================================
if __name__ == "__main__":
    # Let's create a simulated KV Cache state
    # e.g., 2 layers of Key-Value activations (simulated floats)
    simulated_kv_cache = {
        "layer_0_key": [0.12, -0.45, 0.98, -0.01, 0.54, -0.88, 0.33, 0.05],
        "layer_0_val": [0.77, -0.12, 0.44, 0.91, -0.22, 0.03, -0.67, 0.19],
        "layer_1_key": [-0.99, 0.81, -0.34, 0.12, 0.56, -0.44, 0.21, -0.09],
        "layer_1_val": [0.08, -0.92, 0.15, 0.34, -0.76, 0.88, -0.11, 0.04]
    }
    
    print("--- Original KV Cache (Truncated sample) ---")
    print(f"Layer 0 Key: {simulated_kv_cache['layer_0_key'][:4]}")
    
    # Initialize the .ai handler with a secure key
    ai_handler = AIContextFile(model_name="Llama-3-8B-Instruct", quantization="int8")
    
    # Save to binary .ai-format format
    print("\nSerializing, compressing, and encrypting to .ai-format file format...")
    ai_file_bytes = ai_handler.serialize_kv_cache(simulated_kv_cache)
    
    # Save to disk
    filepath = "simulated_context.ai"
    with open(filepath, "wb") as f:
        f.write(ai_file_bytes)
        
    print(f"Success! Saved {len(ai_file_bytes)} bytes to '{filepath}'.")
    print(f"Encrypted Content preview (gibberish hex): {ai_file_bytes[20:60].hex()}...")
    
    # Now, let's load it back
    print("\nLoading, decrypting, and decompressing the .ai file...")
    with open(filepath, "rb") as f:
        loaded_bytes = f.read()
        
    metadata, restored_kv = ai_handler.deserialize_kv_cache(loaded_bytes)
    
    print("\n--- Restored Metadata ---")
    print(json.dumps(metadata, indent=2))
    
    print("\n--- Restored KV Cache (Dequantized floats) ---")
    print(f"Layer 0 Key: {restored_kv['layer_0_key'][:4]}")
    
    # Cleanup demo file
    if os.path.exists(filepath):
        os.remove(filepath)
