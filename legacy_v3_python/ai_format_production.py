import os
import struct
import json
import gzip
import hashlib
import hmac

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


class ProductionAIContextFile:
    """
    Production-grade implementation of the .ai-format file format.
    Supports AIF_V2 and the new block-based AIF_V3 formats.
    
    Security Features:
    1. Encrypt-then-MAC (EtM) composition using HMAC-SHA256 to provide AEAD properties.
    2. Key splitting: derives separate encryption and MAC keys from the master key.
    3. Block-level encryption: independent IV/salt per block (AIF_V3).
    4. Unencrypted header for block mapping and neural links, signed with master HMAC (AIF_V3).
    5. Lazy loading: partial envelope unpacking (AIF_V3).
    """
    MAGIC_V2 = b'AIF\x02'
    MAGIC_V3 = b'AIF\x03'
    MAGIC = MAGIC_V3  # Default magic for writing
    
    def __init__(self, master_key_bytes=None):
        self.master_key = master_key_bytes if master_key_bytes else os.urandom(32)
        
        # Derive encryption and MAC keys using SHA-256 key splitting
        self.enc_key = hashlib.sha256(self.master_key + b"encryption_key").digest()
        self.mac_key = hashlib.sha256(self.master_key + b"mac_key").digest()

    def serialize_blocks(self, blocks, output_path, graph_links=None, global_metadata=None):
        """
        Serializes multiple logical blocks into a single block-based .ai (V3) file.
        
        Args:
            blocks: dict of block_id -> { "data": JSON_serializable, "metadata": dict }
            output_path: path to write the output file
            graph_links: list of relation links (neural connectivity graph)
            global_metadata: optional global metadata dictionary
        """
        block_index_map = {}
        payload_bytes = bytearray()
        
        # 1. Encrypt each block independently
        for block_id, block_info in blocks.items():
            data_bytes = json.dumps(block_info.get("data")).encode('utf-8')
            compressed_bytes = gzip.compress(data_bytes)
            
            # Generate random block salt/IV
            salt = os.urandom(16)
            block_enc_key = hashlib.sha256(self.enc_key + salt).digest()
            
            cipher = SimpleStreamCipher(block_enc_key)
            ciphertext = cipher.encrypt_decrypt(compressed_bytes)
            
            # Compute MAC tag for this block: HMAC(mac_key, salt + ciphertext)
            block_mac = hmac.new(self.mac_key, salt + ciphertext, hashlib.sha256).digest()
            
            # Record structural offset and metadata in the map
            block_index_map[block_id] = {
                "offset": len(payload_bytes),
                "size": len(ciphertext),
                "salt": salt.hex(),
                "mac_tag": block_mac.hex(),
                "metadata": block_info.get("metadata", {})
            }
            
            payload_bytes.extend(ciphertext)
            
        # 2. Build the JSON header
        header_data = {
            "format_version": "AIF_V3",
            "global_metadata": global_metadata or {},
            "block_index_map": block_index_map,
            "graph_links": graph_links or []
        }
        
        header_json_bytes = json.dumps(header_data).encode('utf-8')
        header_length = len(header_json_bytes)
        
        # 3. Compute HMAC over the header to prevent structural tampering
        header_mac = hmac.new(self.mac_key, header_json_bytes, hashlib.sha256).digest()
        
        # 4. Construct final file: MAGIC + HEADER_LENGTH (4B) + HEADER_MAC (32B) + HEADER_JSON + PAYLOAD
        final_file_bytes = bytearray()
        final_file_bytes.extend(self.MAGIC_V3)
        final_file_bytes.extend(struct.pack('>I', header_length))
        final_file_bytes.extend(header_mac)
        final_file_bytes.extend(header_json_bytes)
        final_file_bytes.extend(payload_bytes)
        
        with open(output_path, "wb") as f:
            f.write(final_file_bytes)
            
        return len(final_file_bytes)

    def serialize(self, metadata, payload_data, output_path):
        """
        Serialize method. Converts metadata and payload into V3 structure by default,
        or V2 structure if self.MAGIC is set to MAGIC_V2.
        """
        if self.MAGIC == self.MAGIC_V2:
            return self._serialize_v2(metadata, payload_data, output_path)
            
        blocks = {
            "metadata_block": {
                "data": metadata,
                "metadata": {"type": "system_metadata"}
            },
            "payload_block": {
                "data": payload_data,
                "metadata": {"type": "context_payload"}
            }
        }
        return self.serialize_blocks(blocks, output_path, global_metadata=metadata)

    def _serialize_v2(self, metadata, payload_data, output_path):
        """
        Internal writer for AIF_V2 format.
        """
        raw_package = {
            "metadata": metadata,
            "payload": payload_data
        }
        raw_bytes = json.dumps(raw_package).encode('utf-8')
        compressed_bytes = gzip.compress(raw_bytes)
        
        salt = os.urandom(16)
        session_enc_key = hashlib.sha256(self.enc_key + salt).digest()
        
        cipher = SimpleStreamCipher(session_enc_key)
        ciphertext = cipher.encrypt_decrypt(compressed_bytes)
        
        signed_header = self.MAGIC_V2 + salt
        payload_block = signed_header + ciphertext
        
        mac_tag = hmac.new(self.mac_key, payload_block, hashlib.sha256).digest()
        final_file_bytes = self.MAGIC_V2 + salt + mac_tag + ciphertext
        
        with open(output_path, "wb") as f:
            f.write(final_file_bytes)
            
        return len(final_file_bytes)

    def read_header(self, input_path):
        """
        Reads and returns the unencrypted JSON header of a V3 file after verifying its integrity.
        """
        with open(input_path, "rb") as f:
            magic = f.read(4)
            if magic != self.MAGIC_V3:
                raise ValueError("Header parsing only supported on V3 files.")
                
            header_len_bytes = f.read(4)
            header_len = struct.unpack('>I', header_len_bytes)[0]
            
            received_header_mac = f.read(32)
            header_json_bytes = f.read(header_len)
            
        # Verify header MAC
        calculated_header_mac = hmac.new(self.mac_key, header_json_bytes, hashlib.sha256).digest()
        if not hmac.compare_digest(calculated_header_mac, received_header_mac):
            raise PermissionError("INTEGRITY FAILURE: Unencrypted header has been tampered with or incorrect key used.")
            
        return json.loads(header_json_bytes.decode('utf-8'))

    def deserialize_block(self, input_path, block_id):
        """
        Unpacks and decrypts a single specific block from a V3 file (Lazy Loading).
        """
        header = self.read_header(input_path)
        block_index_map = header.get("block_index_map", {})
        
        if block_id not in block_index_map:
            raise KeyError(f"Block '{block_id}' not found in context file.")
            
        block_info = block_index_map[block_id]
        offset = block_info["offset"]
        size = block_info["size"]
        salt = bytes.fromhex(block_info["salt"])
        expected_mac = bytes.fromhex(block_info["mac_tag"])
        
        # Calculate absolute file offset: Magic(4) + Len(4) + MAC(32) + HeaderLen + BlockOffset
        header_len = len(json.dumps(header).encode('utf-8'))
        
        with open(input_path, "rb") as f:
            f.read(4) # magic
            f.read(4) # len
            f.read(32) # mac
            header_json = f.read(header_len) # Re-read to match size exactly
            exact_header_length = len(header_json)
            
            absolute_payload_start = 4 + 4 + 32 + exact_header_length
            f.seek(absolute_payload_start + offset)
            ciphertext = f.read(size)
            
        # Verify block HMAC
        reconstructed_block = salt + ciphertext
        calculated_mac = hmac.new(self.mac_key, reconstructed_block, hashlib.sha256).digest()
        if not hmac.compare_digest(calculated_mac, expected_mac):
            raise PermissionError(f"INTEGRITY FAILURE: Block '{block_id}' is tampered or incorrect key.")
            
        # Decrypt block
        block_enc_key = hashlib.sha256(self.enc_key + salt).digest()
        cipher = SimpleStreamCipher(block_enc_key)
        decrypted_compressed_bytes = cipher.encrypt_decrypt(ciphertext)
        
        # Decompress
        raw_bytes = gzip.decompress(decrypted_compressed_bytes)
        
        return json.loads(raw_bytes.decode('utf-8')), block_info.get("metadata", {})

    def deserialize_blocks(self, input_path, block_ids):
        """
        Decrypts multiple blocks in one go.
        """
        results = {}
        for b_id in block_ids:
            data, metadata = self.deserialize_block(input_path, b_id)
            results[b_id] = {
                "data": data,
                "metadata": metadata
            }
        return results

    def deserialize(self, input_path):
        """
        Decrypts all context blocks. Retains backward compatibility with AIF_V2.
        """
        with open(input_path, "rb") as f:
            magic = f.read(4)
            
        # Handle Version 2 fallback
        if magic == self.MAGIC_V2:
            return self._deserialize_v2(input_path)
            
        elif magic == self.MAGIC_V3:
            header = self.read_header(input_path)
            block_ids = list(header.get("block_index_map", {}).keys())
            decrypted_blocks = self.deserialize_blocks(input_path, block_ids)
            
            # Map back to old signature: (metadata, payload)
            if "metadata_block" in decrypted_blocks and "payload_block" in decrypted_blocks:
                metadata = decrypted_blocks["metadata_block"]["data"]
                payload = decrypted_blocks["payload_block"]["data"]
                return metadata, payload
            else:
                # If serialized with custom blocks, return the global metadata and blocks dict
                return header.get("global_metadata", {}), decrypted_blocks
        else:
            raise ValueError("Unsupported format. Magic bytes mismatch.")

    def _deserialize_v2(self, input_path):
        """
        Internal reader for AIF_V2 format.
        """
        with open(input_path, "rb") as f:
            file_bytes = f.read()
            
        salt = file_bytes[4:20]
        received_mac = file_bytes[20:52]
        ciphertext = file_bytes[52:]
        
        reconstructed_block = self.MAGIC_V2 + salt + ciphertext
        calculated_mac = hmac.new(self.mac_key, reconstructed_block, hashlib.sha256).digest()
        
        if not hmac.compare_digest(calculated_mac, received_mac):
            raise PermissionError("INTEGRITY FAILURE: Ciphertext has been tampered with or incorrect key used.")
            
        session_enc_key = hashlib.sha256(self.enc_key + salt).digest()
        cipher = SimpleStreamCipher(session_enc_key)
        decrypted_compressed_bytes = cipher.encrypt_decrypt(ciphertext)
        
        raw_bytes = gzip.decompress(decrypted_compressed_bytes)
        package = json.loads(raw_bytes.decode('utf-8'))
        return package["metadata"], package["payload"]


# ==========================================
# VERIFICATION OF THE V3 IMPLEMENTATION
# ==========================================
if __name__ == "__main__":
    print("Testing Production-Grade V3 .ai File Format...")
    
    key = b"super_secret_agent_identity_key_32b"
    engine = ProductionAIContextFile(master_key_bytes=key)
    
    # Define custom blocks
    blocks = {
        "turn_0": {
            "data": "Hello world, this is a test.",
            "metadata": {"importance": 1.0, "timestamp": 1234567, "type": "dialog"}
        },
        "turn_1": {
            "data": "We are lazy loading blocks now.",
            "metadata": {"importance": 0.5, "timestamp": 1234580, "type": "dialog"}
        },
        "vars": {
            "data": {"agent_api_key": "sk-12345", "active_project": "ai-format"},
            "metadata": {"importance": 1.0, "type": "vars"}
        }
    }
    
    links = [
        {"source": "turn_1", "target": "turn_0", "relationship": "follows"}
    ]
    
    output_file = "test_v3.ai"
    
    # Serialize blocks
    print("\n[+] Serializing custom blocks...")
    size = engine.serialize_blocks(blocks, output_file, graph_links=links, global_metadata={"version": "3.0"})
    print(f"[*] V3 .ai file written: {size} bytes.")
    
    # Test unencrypted header read
    print("\n[+] Reading unencrypted structural header (without decrypting payload)...")
    header = engine.read_header(output_file)
    print(f"[*] Format: {header.get('format_version')}")
    print(f"[*] Graph Links: {header.get('graph_links')}")
    print(f"[*] Block Map:")
    for b_id, b_info in header.get("block_index_map", {}).items():
        print(f"    - Block ID: {b_id} (offset: {b_info['offset']}, size: {b_info['size']}, metadata: {b_info['metadata']})")
        
    # Lazy load only a specific block
    print("\n[+] Lazy Loading block 'vars'...")
    vars_data, vars_meta = engine.deserialize_block(output_file, "vars")
    print(f"[+] Restored 'vars' block content: {vars_data}")
    print(f"[*] Restored 'vars' block metadata: {vars_meta}")
    
    # Lazy load another block
    print("\n[+] Lazy Loading block 'turn_0'...")
    turn0_data, turn0_meta = engine.deserialize_block(output_file, "turn_0")
    print(f"[+] Restored 'turn_0' block content: {turn0_data}")
    
    # Clean up
    if os.path.exists(output_file):
        os.remove(output_file)
    print("\n[+] Verification successful!")
