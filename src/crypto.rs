use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use hmac::{Hmac, Mac};
use rand::Rng;
use sha2::{Digest, Sha256};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};

type HmacSha256 = Hmac<Sha256>;

/// 256-bit Key splitting container
#[derive(Debug, Clone)]
pub struct DerivedKeys {
    pub enc_key: [u8; 32],
    pub mac_key: [u8; 32],
}

/// Derives separate encryption and MAC keys from master key using SHA-256
pub fn derive_keys(master_key: &[u8; 32]) -> DerivedKeys {
    let mut hasher = Sha256::new();
    hasher.update(master_key);
    hasher.update(b"encryption_key");
    let enc_key: [u8; 32] = hasher.finalize().into();

    let mut hasher = Sha256::new();
    hasher.update(master_key);
    hasher.update(b"mac_key");
    let mac_key: [u8; 32] = hasher.finalize().into();

    DerivedKeys { enc_key, mac_key }
}

/// Computes HMAC-SHA256
pub fn compute_hmac(mac_key: &[u8; 32], data: &[u8]) -> [u8; 32] {
    let mut mac = HmacSha256::new_from_slice(mac_key)
        .expect("HMAC-SHA256 supports arbitrary key lengths");
    mac.update(data);
    mac.finalize().into_bytes().into()
}

/// Constant time comparison to prevent timing attacks
pub fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (x, y) in a.iter().zip(b.iter()) {
        diff |= x ^ y;
    }
    diff == 0
}

/// Gzip compression
pub fn compress_gzip(data: &[u8]) -> std::io::Result<Vec<u8>> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(data)?;
    encoder.finish()
}

/// Gzip decompression
pub fn decompress_gzip(data: &[u8]) -> std::io::Result<Vec<u8>> {
    let mut decoder = GzDecoder::new(data);
    let mut out = Vec::new();
    decoder.read_to_end(&mut out)?;
    Ok(out)
}

/// Pure-Rust ChaCha20 stream cipher for AIF V4
pub struct ChaCha20Cipher {
    key: [u8; 32],
    nonce: [u8; 12],
}

impl ChaCha20Cipher {
    pub fn new(key: [u8; 32], nonce: [u8; 12]) -> Self {
        Self { key, nonce }
    }

    #[inline(always)]
    fn quarter_round(state: &mut [u32; 16], a: usize, b: usize, c: usize, d: usize) {
        state[a] = state[a].wrapping_add(state[b]);
        state[d] ^= state[a];
        state[d] = state[d].rotate_left(16);
        state[c] = state[c].wrapping_add(state[d]);
        state[b] ^= state[c];
        state[b] = state[b].rotate_left(12);
        state[a] = state[a].wrapping_add(state[b]);
        state[d] ^= state[a];
        state[d] = state[d].rotate_left(8);
        state[c] = state[c].wrapping_add(state[d]);
        state[b] ^= state[c];
        state[b] = state[b].rotate_left(7);
    }

    pub fn encrypt_decrypt(&self, data: &[u8]) -> Vec<u8> {
        let mut out = Vec::with_capacity(data.len());
        let mut key_words = [0u32; 8];
        for i in 0..8 {
            key_words[i] = u32::from_le_bytes([
                self.key[i * 4],
                self.key[i * 4 + 1],
                self.key[i * 4 + 2],
                self.key[i * 4 + 3],
            ]);
        }
        let nonce_words = [
            u32::from_le_bytes([self.nonce[0], self.nonce[1], self.nonce[2], self.nonce[3]]),
            u32::from_le_bytes([self.nonce[4], self.nonce[5], self.nonce[6], self.nonce[7]]),
            u32::from_le_bytes([self.nonce[8], self.nonce[9], self.nonce[10], self.nonce[11]]),
        ];

        let mut counter = 0u32;
        let mut offset = 0;

        while offset < data.len() {
            let mut state = [
                0x61707865, 0x3320646e, 0x79622d32, 0x6b206574,
                key_words[0], key_words[1], key_words[2], key_words[3],
                key_words[4], key_words[5], key_words[6], key_words[7],
                counter, nonce_words[0], nonce_words[1], nonce_words[2],
            ];
            let initial = state;

            for _ in 0..10 {
                // Column rounds
                Self::quarter_round(&mut state, 0, 4, 8, 12);
                Self::quarter_round(&mut state, 1, 5, 9, 13);
                Self::quarter_round(&mut state, 2, 6, 10, 14);
                Self::quarter_round(&mut state, 3, 7, 11, 15);
                // Diagonal rounds
                Self::quarter_round(&mut state, 0, 5, 10, 15);
                Self::quarter_round(&mut state, 1, 6, 11, 12);
                Self::quarter_round(&mut state, 2, 7, 8, 13);
                Self::quarter_round(&mut state, 3, 4, 9, 14);
            }

            for i in 0..16 {
                state[i] = state[i].wrapping_add(initial[i]);
            }

            let mut key_stream = [0u8; 64];
            for i in 0..16 {
                let bytes = state[i].to_le_bytes();
                key_stream[i * 4..i * 4 + 4].copy_from_slice(&bytes);
            }

            let chunk_len = std::cmp::min(64, data.len() - offset);
            for i in 0..chunk_len {
                out.push(data[offset + i] ^ key_stream[i]);
            }

            offset += chunk_len;
            counter = counter.wrapping_add(1);
        }

        out
    }
}

/// Legacy V3 SimpleStreamCipher for backwards compatibility
pub struct V3StreamCipher {
    state: [u8; 256],
}

impl V3StreamCipher {
    pub fn new(key: &[u8]) -> Self {
        let mut hasher = Sha256::new();
        hasher.update(key);
        let h = hasher.finalize();
        let mut state = [0u8; 256];
        for i in 0..256 {
            state[i] = i as u8;
        }
        let mut j: usize = 0;
        for i in 0..256 {
            j = (j + state[i] as usize + h[i % h.len()] as usize) % 256;
            state.swap(i, j);
        }
        Self { state }
    }

    pub fn encrypt_decrypt(&self, data: &[u8]) -> Vec<u8> {
        let mut state = self.state;
        let mut i: usize = 0;
        let mut j: usize = 0;
        let mut out = Vec::with_capacity(data.len());
        for &byte in data {
            i = (i + 1) % 256;
            j = (j + state[i] as usize) % 256;
            state.swap(i, j);
            let t = (state[i] as usize + state[j] as usize) % 256;
            let k = state[t];
            out.push(byte ^ k);
        }
        out
    }
}

/// Derives independent block encryption key: sha256(enc_key + salt)
pub fn derive_block_key(enc_key: &[u8; 32], salt: &[u8; 16]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(enc_key);
    hasher.update(salt);
    hasher.finalize().into()
}

/// Encrypts a block in V4 format (ChaCha20 + Gzip + 16B salt)
pub fn encrypt_block_v4(enc_key: &[u8; 32], plaintext: &[u8]) -> std::io::Result<(Vec<u8>, [u8; 16])> {
    let mut salt = [0u8; 16];
    rand::thread_rng().fill(&mut salt);
    let block_key = derive_block_key(enc_key, &salt);
    let mut nonce = [0u8; 12];
    nonce.copy_from_slice(&salt[0..12]);
    let cipher = ChaCha20Cipher::new(block_key, nonce);
    let compressed = compress_gzip(plaintext)?;
    let ciphertext = cipher.encrypt_decrypt(&compressed);
    Ok((ciphertext, salt))
}

/// Decrypts a block in V4 format
pub fn decrypt_block_v4(enc_key: &[u8; 32], salt: &[u8; 16], ciphertext: &[u8]) -> std::io::Result<Vec<u8>> {
    let block_key = derive_block_key(enc_key, salt);
    let mut nonce = [0u8; 12];
    nonce.copy_from_slice(&salt[0..12]);
    let cipher = ChaCha20Cipher::new(block_key, nonce);
    let decrypted = cipher.encrypt_decrypt(ciphertext);
    decompress_gzip(&decrypted)
}

/// Encrypts a block in V3 format (V3StreamCipher + Gzip + 16B salt)
pub fn encrypt_block_v3(enc_key: &[u8; 32], plaintext: &[u8]) -> std::io::Result<(Vec<u8>, [u8; 16])> {
    let mut salt = [0u8; 16];
    rand::thread_rng().fill(&mut salt);
    let block_key = derive_block_key(enc_key, &salt);
    let cipher = V3StreamCipher::new(&block_key);
    let compressed = compress_gzip(plaintext)?;
    let ciphertext = cipher.encrypt_decrypt(&compressed);
    Ok((ciphertext, salt))
}

/// Decrypts a block in V3 format
pub fn decrypt_block_v3(enc_key: &[u8; 32], salt: &[u8; 16], ciphertext: &[u8]) -> std::io::Result<Vec<u8>> {
    let block_key = derive_block_key(enc_key, salt);
    let cipher = V3StreamCipher::new(&block_key);
    let decrypted = cipher.encrypt_decrypt(ciphertext);
    decompress_gzip(&decrypted)
}

/// Sanitizes identifier for safe filenames
pub fn sanitize_identifier(s: &str) -> String {
    s.chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect()
}

/// Resolves keychain path with ~/.gemini/ai-format/keys fallback to .agents/ai-format/keys
pub fn get_keychain_dir() -> PathBuf {
    if let Some(home) = dirs::home_dir() {
        let p = home.join(".gemini").join("ai-format").join("keys");
        if p.exists() || !Path::new(".agents").exists() {
            return p;
        }
    }
    PathBuf::from(".agents").join("ai-format").join("keys")
}

pub fn get_key_path(project_id: &str, model_id: &str) -> PathBuf {
    let fname = format!("{}__{}.key", sanitize_identifier(project_id), sanitize_identifier(model_id));
    get_keychain_dir().join(fname)
}

/// Single device-wide master key path: ~/.gemini/ai-format/keys/aif_device.key
pub fn get_device_key_path() -> PathBuf {
    get_keychain_dir().join("aif_device.key")
}

/// Loads or creates the single device-wide master key shared by all projects and harnesses.
/// Permissions set to 0600 on Unix.
pub fn load_or_create_device_key() -> std::io::Result<[u8; 32]> {
    let path = get_device_key_path();
    if path.exists() {
        let bytes = std::fs::read(&path)?;
        if bytes.len() == 32 {
            let mut k = [0u8; 32];
            k.copy_from_slice(&bytes);
            return Ok(k);
        }
    }

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let mut key = [0u8; 32];
    rand::thread_rng().fill(&mut key);
    std::fs::write(&path, &key)?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o600));
    }

    Ok(key)
}

/// Deterministic keychain management.
/// Ensures all projects and harnesses on the device share the single unified device master key.
pub fn load_or_create_key(project_id: &str, model_id: &str) -> std::io::Result<[u8; 32]> {
    let key_path = get_key_path(project_id, model_id);
    if key_path.exists() {
        let bytes = std::fs::read(&key_path)?;
        if bytes.len() == 32 {
            let mut k = [0u8; 32];
            k.copy_from_slice(&bytes);
            return Ok(k);
        }
    }

    let device_key = load_or_create_device_key()?;

    if let Some(parent) = key_path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    std::fs::write(&key_path, &device_key)?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(&key_path, std::fs::Permissions::from_mode(0o600));
    }

    Ok(device_key)
}
