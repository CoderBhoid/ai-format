use crate::crypto::*;
use crate::orbital::*;
use std::path::{Path, PathBuf};

pub fn get_scratch_path() -> PathBuf {
    if Path::new(".agents").exists() {
        let p = PathBuf::from(".agents").join("ai-format").join(".scratch_state.tmp");
        if let Some(parent) = p.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        return p;
    }
    if let Some(home) = dirs::home_dir() {
        let p = home.join(".gemini").join("ai-format").join(".scratch_state.tmp");
        if let Some(parent) = p.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        return p;
    }
    PathBuf::from(".scratch_state.tmp")
}

pub fn write_scratch(text: &str) -> std::io::Result<PathBuf> {
    let p = get_scratch_path();
    std::fs::write(&p, text)?;
    Ok(p)
}

pub fn read_scratch() -> std::io::Result<Option<String>> {
    let p = get_scratch_path();
    if p.exists() {
        let content = std::fs::read_to_string(&p)?;
        Ok(Some(content))
    } else {
        Ok(None)
    }
}

/// Flushes scratch buffer directly into the project's INT16_CORE with [PAUSED_MID_TASK]
pub fn flush_scratch_to_core(
    project_id: &str,
    model_id: &str,
    file_path: &Path,
) -> Result<Option<String>, AifError> {
    let scratch_opt = read_scratch()?;
    let scratch_text = match scratch_opt {
        Some(s) if !s.trim().is_empty() => s,
        _ => return Ok(None),
    };

    let key_bytes = load_or_create_key(project_id, model_id)?;
    let keys = derive_keys(&key_bytes);

    let (header, mut blocks) = if file_path.exists() {
        read_all_blocks(file_path, &keys)?
    } else {
        (
            AifHeader {
                format_version: "AIF_V4".to_string(),
                project_id: project_id.to_string(),
                model_id: model_id.to_string(),
                global_metadata: serde_json::json!({}),
                block_index_map: std::collections::BTreeMap::new(),
                graph_links: Vec::new(),
            },
            std::collections::BTreeMap::new(),
        )
    };

    let block_id = format!("paused_task_{}", chrono::Utc::now().timestamp_millis());
    let block_entry = BlockEntry {
        ring: OrbitalRing::Int16Core,
        offset: 0,
        size: 0,
        salt: String::new(),
        mac_tag: String::new(),
        importance: 0.95,
        timestamp: chrono::Utc::now().timestamp(),
        topic_tags: vec!["[PAUSED_MID_TASK]".to_string()],
        metadata: serde_json::json!({
            "status": "PAUSED_MID_TASK",
            "importance": 0.95,
        }),
    };

    let block_val = serde_json::json!({
        "status": "[PAUSED_MID_TASK]",
        "text": format!("[PAUSED_MID_TASK] {}", scratch_text),
    });

    blocks.insert(block_id.clone(), (block_val, block_entry));
    write_file_v4(file_path, header, &blocks, &keys)?;

    let scratch_file = get_scratch_path();
    let _ = std::fs::remove_file(scratch_file);

    let bridge_path = crate::bridge::get_bridge_path();
    let _ = crate::bridge::register_project_in_bridge(&bridge_path, project_id, model_id, file_path, &keys);

    Ok(Some(block_id))
}

/// Arms OS signal trap (SIGINT, SIGTERM, SIGHUP) for emergency context flushing
pub fn install_signal_handler(project_id: String, model_id: String, file_path: PathBuf) {
    let _ = ctrlc::set_handler(move || {
        eprintln!("\n[!] Signal received! Triggering emergency context flush...");
        match flush_scratch_to_core(&project_id, &model_id, &file_path) {
            Ok(Some(block_id)) => {
                eprintln!("[+] Emergency flush successful: State captured in INT16_CORE block '{}'.", block_id);
            }
            Ok(None) => {
                eprintln!("[*] No active scratch state to flush.");
            }
            Err(e) => {
                eprintln!("[-] Emergency flush error: {}", e);
            }
        }
        std::process::exit(130);
    });
}
