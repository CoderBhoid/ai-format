use crate::crypto::*;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;

pub const MAGIC_V3: &[u8; 4] = b"AIF\x03";
pub const MAGIC_V4: &[u8; 4] = b"AIF\x04";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OrbitalRing {
    #[serde(rename = "INT16_CORE")]
    Int16Core,
    #[serde(rename = "INT8_RING")]
    Int8Ring,
    #[serde(rename = "INT2_CRUST")]
    Int2Crust,
}

impl OrbitalRing {
    pub fn from_importance(importance: f64) -> Self {
        if importance >= 0.7 {
            OrbitalRing::Int16Core
        } else if importance >= 0.3 {
            OrbitalRing::Int8Ring
        } else {
            OrbitalRing::Int2Crust
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            OrbitalRing::Int16Core => "INT16_CORE",
            OrbitalRing::Int8Ring => "INT8_RING",
            OrbitalRing::Int2Crust => "INT2_CRUST",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockEntry {
    pub ring: OrbitalRing,
    pub offset: u64,
    pub size: u64,
    pub salt: String,
    pub mac_tag: String,
    pub importance: f64,
    pub timestamp: i64,
    #[serde(default)]
    pub topic_tags: Vec<String>,
    #[serde(default)]
    pub metadata: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphLink {
    pub source: String,
    pub target: String,
    pub relationship: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_file_hash: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AifHeader {
    pub format_version: String,
    pub project_id: String,
    pub model_id: String,
    #[serde(default)]
    pub global_metadata: serde_json::Value,
    pub block_index_map: BTreeMap<String, BlockEntry>,
    #[serde(default)]
    pub graph_links: Vec<GraphLink>,
}

#[derive(Debug)]
pub enum AifError {
    Io(std::io::Error),
    Json(serde_json::Error),
    Integrity(String),
    NotFound(String),
    Format(String),
}

impl std::fmt::Display for AifError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AifError::Io(e) => write!(f, "IO Error: {}", e),
            AifError::Json(e) => write!(f, "JSON Error: {}", e),
            AifError::Integrity(s) => write!(f, "Integrity Error: {}", s),
            AifError::NotFound(s) => write!(f, "Not Found: {}", s),
            AifError::Format(s) => write!(f, "Format Error: {}", s),
        }
    }
}

impl std::error::Error for AifError {}
impl From<std::io::Error> for AifError {
    fn from(e: std::io::Error) -> Self { AifError::Io(e) }
}
impl From<serde_json::Error> for AifError {
    fn from(e: serde_json::Error) -> Self { AifError::Json(e) }
}

/// Stop-words and helper-word pruning for INT8_RING
pub fn prune_helper_words(text: &str) -> String {
    let stop_words = [
        "the", "a", "an", "and", "or", "but", "is", "are", "was", "were",
        "to", "of", "in", "on", "at", "for"
    ];
    let words = text.split_whitespace();
    let filtered: Vec<&str> = words
        .filter(|w| {
            let clean: String = w.chars().filter(|c| c.is_alphanumeric()).collect();
            let lower = clean.to_lowercase();
            !stop_words.contains(&lower.as_str()) || clean.chars().all(|c| c.is_numeric())
        })
        .collect();
    filtered.join(" ")
}

/// Gist and deep summary generator for INT2_CRUST
pub fn deep_summary(text: &str) -> String {
    let trimmed = text.trim();
    let max_len = 50;
    if trimmed.len() <= max_len {
        format!("[INT2 Deep Summary]: {}", trimmed)
    } else {
        format!("[INT2 Deep Summary]: {}...", &trimmed[..max_len])
    }
}

/// Partial Envelope Unpacking: seeks directly to block_offset in payload
pub fn read_block(
    file_path: &Path,
    block_id: &str,
    keys: &DerivedKeys,
) -> Result<(serde_json::Value, BlockEntry), AifError> {
    let mut file = std::fs::File::open(file_path)?;
    let mut magic = [0u8; 4];
    file.read_exact(&mut magic)?;
    let is_v4 = magic == *MAGIC_V4;
    let is_v3 = magic == *MAGIC_V3;
    if !is_v4 && !is_v3 {
        return Err(AifError::Format(format!("Unsupported magic: {:?}", magic)));
    }

    let mut len_bytes = [0u8; 4];
    file.read_exact(&mut len_bytes)?;
    let header_len = u32::from_be_bytes(len_bytes) as usize;

    let mut header_mac = [0u8; 32];
    file.read_exact(&mut header_mac)?;

    let mut header_json_bytes = vec![0u8; header_len];
    file.read_exact(&mut header_json_bytes)?;

    let computed_header_mac = compute_hmac(&keys.mac_key, &header_json_bytes);
    if !constant_time_eq(&computed_header_mac, &header_mac) {
        return Err(AifError::Integrity("Header HMAC verification failed: tampered header or invalid key".into()));
    }

    let header: AifHeader = serde_json::from_slice(&header_json_bytes)?;
    let entry = header
        .block_index_map
        .get(block_id)
        .ok_or_else(|| AifError::NotFound(format!("Block '{}' not found in file", block_id)))?
        .clone();

    // Direct Seek to payload start: MAGIC(4) + LEN(4) + MAC(32) + header_len
    let payload_start = 40 + header_len as u64;
    file.seek(SeekFrom::Start(payload_start + entry.offset))?;

    let mut ciphertext = vec![0u8; entry.size as usize];
    file.read_exact(&mut ciphertext)?;

    let salt_bytes = hex::decode(&entry.salt)
        .map_err(|e| AifError::Integrity(format!("Invalid salt hex: {}", e)))?;
    let expected_mac = hex::decode(&entry.mac_tag)
        .map_err(|e| AifError::Integrity(format!("Invalid mac tag hex: {}", e)))?;

    let mut mac_input = Vec::with_capacity(salt_bytes.len() + ciphertext.len());
    mac_input.extend_from_slice(&salt_bytes);
    mac_input.extend_from_slice(&ciphertext);
    let computed_mac = compute_hmac(&keys.mac_key, &mac_input);

    if !constant_time_eq(&computed_mac, &expected_mac) {
        return Err(AifError::Integrity(format!("Block '{}' HMAC validation failed: tampered ciphertext or wrong key", block_id)));
    }

    let mut salt_arr = [0u8; 16];
    if salt_bytes.len() == 16 {
        salt_arr.copy_from_slice(&salt_bytes);
    } else {
        return Err(AifError::Integrity("Invalid salt size".into()));
    }

    let plaintext = if is_v4 {
        decrypt_block_v4(&keys.enc_key, &salt_arr, &ciphertext)?
    } else {
        decrypt_block_v3(&keys.enc_key, &salt_arr, &ciphertext)?
    };

    let data: serde_json::Value = serde_json::from_slice(&plaintext)?;
    Ok((data, entry))
}

/// Reads all blocks in a file
pub fn read_all_blocks(
    file_path: &Path,
    keys: &DerivedKeys,
) -> Result<(AifHeader, BTreeMap<String, (serde_json::Value, BlockEntry)>), AifError> {
    let mut file = std::fs::File::open(file_path)?;
    let mut magic = [0u8; 4];
    file.read_exact(&mut magic)?;
    let is_v4 = magic == *MAGIC_V4;
    let is_v3 = magic == *MAGIC_V3;
    if !is_v4 && !is_v3 {
        return Err(AifError::Format(format!("Unsupported magic: {:?}", magic)));
    }

    let mut len_bytes = [0u8; 4];
    file.read_exact(&mut len_bytes)?;
    let header_len = u32::from_be_bytes(len_bytes) as usize;

    let mut header_mac = [0u8; 32];
    file.read_exact(&mut header_mac)?;

    let mut header_json_bytes = vec![0u8; header_len];
    file.read_exact(&mut header_json_bytes)?;

    let computed_header_mac = compute_hmac(&keys.mac_key, &header_json_bytes);
    if !constant_time_eq(&computed_header_mac, &header_mac) {
        return Err(AifError::Integrity("Header HMAC verification failed".into()));
    }

    let header: AifHeader = serde_json::from_slice(&header_json_bytes)?;
    let mut blocks = BTreeMap::new();

    for b_id in header.block_index_map.keys() {
        let (val, entry) = read_block(file_path, b_id, keys)?;
        blocks.insert(b_id.clone(), (val, entry));
    }

    Ok((header, blocks))
}

/// Serializes and writes a complete AIF V4 file
pub fn write_file_v4(
    file_path: &Path,
    mut header: AifHeader,
    blocks: &BTreeMap<String, (serde_json::Value, BlockEntry)>,
    keys: &DerivedKeys,
) -> Result<usize, AifError> {
    header.format_version = "AIF_V4".to_string();
    let mut payload_bytes = Vec::new();
    let mut new_block_map = BTreeMap::new();

    for (b_id, (val, entry)) in blocks {
        let val_bytes = serde_json::to_vec(val)?;
        let (ciphertext, salt) = encrypt_block_v4(&keys.enc_key, &val_bytes)?;

        let mut mac_input = Vec::with_capacity(16 + ciphertext.len());
        mac_input.extend_from_slice(&salt);
        mac_input.extend_from_slice(&ciphertext);
        let block_mac = compute_hmac(&keys.mac_key, &mac_input);

        let mut updated_entry = entry.clone();
        updated_entry.offset = payload_bytes.len() as u64;
        updated_entry.size = ciphertext.len() as u64;
        updated_entry.salt = hex::encode(salt);
        updated_entry.mac_tag = hex::encode(block_mac);

        payload_bytes.extend_from_slice(&ciphertext);
        new_block_map.insert(b_id.clone(), updated_entry);
    }

    header.block_index_map = new_block_map;
    let header_json = serde_json::to_vec(&header)?;
    let header_len = header_json.len() as u32;
    let header_mac = compute_hmac(&keys.mac_key, &header_json);

    let mut out_bytes = Vec::with_capacity(40 + header_json.len() + payload_bytes.len());
    out_bytes.extend_from_slice(MAGIC_V4);
    out_bytes.extend_from_slice(&header_len.to_be_bytes());
    out_bytes.extend_from_slice(&header_mac);
    out_bytes.extend_from_slice(&header_json);
    out_bytes.extend_from_slice(&payload_bytes);

    if let Some(parent) = file_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(file_path, &out_bytes)?;
    Ok(out_bytes.len())
}

/// Dynamically updates importance, migrates rings, and updates binary packaging
pub fn reweight_block(
    file_path: &Path,
    block_id: &str,
    new_importance: f64,
    keys: &DerivedKeys,
) -> Result<(), AifError> {
    let (header, mut blocks) = read_all_blocks(file_path, keys)?;
    let (mut val, mut entry) = blocks
        .remove(block_id)
        .ok_or_else(|| AifError::NotFound(format!("Block '{}' not found", block_id)))?;

    entry.importance = new_importance;
    entry.ring = OrbitalRing::from_importance(new_importance);

    // Dynamic ring content transformation
    match entry.ring {
        OrbitalRing::Int16Core => {}
        OrbitalRing::Int8Ring => {
            if let Some(s) = val.get("text").and_then(|t| t.as_str()) {
                val["text"] = serde_json::Value::String(prune_helper_words(s));
            }
        }
        OrbitalRing::Int2Crust => {
            if let Some(s) = val.get("text").and_then(|t| t.as_str()) {
                val["text"] = serde_json::Value::String(deep_summary(s));
            }
        }
    }

    blocks.insert(block_id.to_string(), (val, entry));
    write_file_v4(file_path, header, &blocks, keys)?;
    Ok(())
}

/// Applies temporal decay formula S_attn = max(0, S_attn - delta), migrates rings, and upgrades V3 to V4
pub fn optimize_file(
    file_path: &Path,
    keys: &DerivedKeys,
    delta: f64,
    active_keywords: &[String],
) -> Result<bool, AifError> {
    let (mut header, mut blocks) = read_all_blocks(file_path, keys)?;
    let mut any_changed = false;

    let lower_keywords: Vec<String> = active_keywords.iter().map(|k| k.to_lowercase()).collect();

    for (_b_id, (val, entry)) in blocks.iter_mut() {
        let text = val.get("text").and_then(|t| t.as_str()).unwrap_or("");
        let text_lower = text.to_lowercase();

        let mut matches = 0;
        for kw in &lower_keywords {
            if text_lower.contains(kw) {
                matches += 1;
            }
        }

        let old_score = entry.importance;
        let new_score = if matches > 0 {
            (old_score + 0.25 * matches as f64).min(1.0)
        } else {
            (old_score - delta).max(0.0)
        };

        let old_ring = entry.ring;
        let new_ring = OrbitalRing::from_importance(new_score);

        if (old_score - new_score).abs() > 0.001 || old_ring != new_ring {
            any_changed = true;
            entry.importance = new_score;
            entry.ring = new_ring;

            match new_ring {
                OrbitalRing::Int16Core => {}
                OrbitalRing::Int8Ring => {
                    val["text"] = serde_json::Value::String(prune_helper_words(text));
                }
                OrbitalRing::Int2Crust => {
                    val["text"] = serde_json::Value::String(deep_summary(text));
                }
            }
        }
    }

    // Synaptic linkage refinement
    let ids: Vec<String> = blocks.keys().cloned().collect();
    for i in 1..ids.len() {
        let src = &ids[i];
        let tgt = &ids[i - 1];
        let exists = header.graph_links.iter().any(|l| l.source == *src && l.target == *tgt);
        if !exists {
            header.graph_links.push(GraphLink {
                source: src.clone(),
                target: tgt.clone(),
                relationship: "temporal_predecessor".to_string(),
                parent_file_hash: None,
            });
            any_changed = true;
        }
    }

    // Rewrite as AIF V4 (seamless upgrade from V3)
    write_file_v4(file_path, header, &blocks, keys)?;
    Ok(any_changed)
}
