use crate::crypto::*;
use crate::orbital::*;
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeCorePointer {
    pub block_id: String,
    pub offset: u64,
    pub size: u64,
    pub salt: String,
    pub mac_tag: String,
    pub importance: f64,
    pub topic_tags: Vec<String>,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BridgeProjectEntry {
    pub project_id: String,
    pub file_path: String,
    pub model_id: String,
    pub active_topics: Vec<String>,
    pub core_blocks: Vec<BridgeCorePointer>,
    pub last_updated: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BridgeNexus {
    pub version: String,
    pub projects: BTreeMap<String, BridgeProjectEntry>,
}

pub fn get_bridge_path() -> PathBuf {
    if let Some(home) = dirs::home_dir() {
        let p = home.join(".gemini").join("ai-format").join("bridge_nexus.ai");
        if p.exists() || !Path::new(".agents").exists() {
            return p;
        }
    }
    PathBuf::from(".agents").join("ai-format").join("bridge_nexus.ai")
}

pub fn load_bridge(path: &Path) -> Result<BridgeNexus, AifError> {
    if !path.exists() {
        return Ok(BridgeNexus {
            version: "AIF_V4_BRIDGE".to_string(),
            projects: BTreeMap::new(),
        });
    }
    let data = std::fs::read(path)?;
    let nexus: BridgeNexus = serde_json::from_slice(&data).unwrap_or_else(|_| BridgeNexus {
        version: "AIF_V4_BRIDGE".to_string(),
        projects: BTreeMap::new(),
    });
    Ok(nexus)
}

pub fn save_bridge(path: &Path, nexus: &BridgeNexus) -> Result<(), AifError> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let data = serde_json::to_vec_pretty(nexus)?;
    std::fs::write(path, data)?;
    Ok(())
}

/// Registers and indexes all INT16_CORE blocks of a project into the bridge nexus
pub fn register_project_in_bridge(
    nexus_path: &Path,
    project_id: &str,
    model_id: &str,
    aif_file_path: &Path,
    keys: &DerivedKeys,
) -> Result<(), AifError> {
    let mut nexus = load_bridge(nexus_path)?;
    let (header, _) = read_all_blocks(aif_file_path, keys)?;

    let mut active_topics = BTreeSet::new();
    let mut core_blocks = Vec::new();

    for (b_id, entry) in &header.block_index_map {
        if entry.ring == OrbitalRing::Int16Core {
            for tag in &entry.topic_tags {
                active_topics.insert(tag.clone());
            }
            core_blocks.push(BridgeCorePointer {
                block_id: b_id.clone(),
                offset: entry.offset,
                size: entry.size,
                salt: entry.salt.clone(),
                mac_tag: entry.mac_tag.clone(),
                importance: entry.importance,
                topic_tags: entry.topic_tags.clone(),
                summary: entry.metadata.get("summary").and_then(|s| s.as_str()).unwrap_or("").to_string(),
            });
        }
    }

    let abs_path = std::fs::canonicalize(aif_file_path)
        .unwrap_or_else(|_| if aif_file_path.is_absolute() {
            aif_file_path.to_path_buf()
        } else {
            std::env::current_dir().unwrap_or_default().join(aif_file_path)
        });

    let entry = BridgeProjectEntry {
        project_id: project_id.to_string(),
        file_path: abs_path.to_string_lossy().to_string(),
        model_id: model_id.to_string(),
        active_topics: active_topics.into_iter().collect(),
        core_blocks,
        last_updated: chrono::Utc::now().timestamp(),
    };

    nexus.projects.insert(project_id.to_string(), entry);
    save_bridge(nexus_path, &nexus)?;
    Ok(())
}

/// Queries the bridge nexus and performs sub-millisecond direct unpack of target INT16_CORE blocks
pub fn query_bridge_unpack(
    nexus_path: &Path,
    query_opt: Option<&str>,
    project_opt: Option<&str>,
) -> Result<Vec<(String, BridgeCorePointer, serde_json::Value)>, AifError> {
    let nexus = load_bridge(nexus_path)?;
    let mut results = Vec::new();

    for (proj_id, proj_entry) in &nexus.projects {
        if let Some(target_proj) = project_opt {
            if proj_id != target_proj {
                continue;
            }
        }

        let p_path = Path::new(&proj_entry.file_path);
        if !p_path.exists() {
            continue;
        }

        let key_bytes = match load_or_create_key(proj_id, &proj_entry.model_id) {
            Ok(k) => k,
            Err(_) => continue,
        };
        let derived_keys = derive_keys(&key_bytes);

        for core_ptr in &proj_entry.core_blocks {
            let mut matches = false;
            if let Some(q) = query_opt {
                let q_lower = q.to_lowercase();
                if core_ptr.topic_tags.iter().any(|t| t.to_lowercase().contains(&q_lower))
                    || core_ptr.summary.to_lowercase().contains(&q_lower)
                    || core_ptr.block_id.to_lowercase().contains(&q_lower)
                {
                    matches = true;
                }
            } else {
                matches = true;
            }

            if matches {
                // Direct Partial Envelope Unpacking via byte-offset pointer
                let (val, _) = read_block(p_path, &core_ptr.block_id, &derived_keys)?;
                results.push((proj_id.clone(), core_ptr.clone(), val));
            }
        }
    }

    Ok(results)
}
